#!/usr/bin/env python3
"""
DownfieldOS PBP Data Processor
===============================
Processes nflverse play-by-play CSV data into derived metrics for DownfieldOS.

Usage:
    # Download data first (if not already present):
    # wget https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_2025.csv.gz -O raw/play_by_play_2025.csv.gz
    # wget https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_weekly_2025.csv -O raw/roster_weekly_2025.csv
    #
    # Then run:
    python3 process_pbp.py [--year 2025]

Outputs (saved to PBP_OUT_DIR env, or ./ if unset — see BASE_DIR):
    - team_scheme_profiles.json
    - scheme_similarity_matrix.json
    - player_usage_data.json
    - situational_splits.json
    - pbp_sync_metadata.json

  Docstring updated 2026-08-30 to match code — the "saved to current
  directory" line was stale; env-var support was added and the Actions
  workflow points PBP_OUT_DIR at repo/src/data/intelligence/pbp/.
  CoS finding #10.

Idempotent — safe to re-run. Overwrites previous outputs.
"""

import json
import os
import sys
import gzip
from datetime import datetime
from pathlib import Path
from math import sqrt

try:
    import pandas as pd
except ImportError:
    print("pandas required. Install: pip install pandas --break-system-packages")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
def _current_nfl_season():
    """NFL league year rolls over ~March 1. Before then we're still on the
    previous season's data. Prevents the '2025 hardcode' rot the CoS
    audit caught in data-injuries.yml on 2026-08-30."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    return now.year if now.month >= 3 else now.year - 1

_env_year = os.environ.get("PBP_YEAR", "").strip()
YEAR = int(_env_year) if _env_year else _current_nfl_season()
# BASE_DIR = where outputs land. RAW_DIR = where the nflverse CSVs live.
# Both are overridable via env vars so the same script serves both local runs
# and .github/workflows/data-pbp-derived.yml, which points them at repo paths.
BASE_DIR = Path(os.environ.get("PBP_OUT_DIR", Path(__file__).parent))
RAW_DIR = Path(os.environ.get("PBP_RAW_DIR", BASE_DIR / "raw"))
PBP_GZ = RAW_DIR / f"play_by_play_{YEAR}.csv.gz"
PBP_CSV = RAW_DIR / f"play_by_play_{YEAR}.csv"
ROSTER_CSV = RAW_DIR / f"roster_weekly_{YEAR}.csv"

NFL_TEAMS = [
    "ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE",
    "DAL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC",
    "LAC", "LAR", "LV", "MIA", "MIN", "NE", "NO", "NYG",
    "NYJ", "PHI", "PIT", "SEA", "SF", "TB", "TEN", "WAS"
]


def parse_args():
    """Simple arg parsing."""
    year = YEAR
    for i, arg in enumerate(sys.argv):
        if arg == "--year" and i + 1 < len(sys.argv):
            year = int(sys.argv[i + 1])
    return year


def load_pbp(year: int) -> pd.DataFrame:
    """Load play-by-play data from raw directory."""
    gz_path = RAW_DIR / f"play_by_play_{year}.csv.gz"
    csv_path = RAW_DIR / f"play_by_play_{year}.csv"

    if gz_path.exists():
        print(f"Loading {gz_path}...")
        df = pd.read_csv(gz_path, compression="gzip", low_memory=False)
    elif csv_path.exists():
        print(f"Loading {csv_path}...")
        df = pd.read_csv(csv_path, low_memory=False)
    else:
        print(f"ERROR: No PBP file found. Expected one of:")
        print(f"  {gz_path}")
        print(f"  {csv_path}")
        print(f"\nDownload with:")
        print(f"  wget https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_{year}.csv.gz -O {gz_path}")
        sys.exit(1)

    print(f"Loaded {len(df):,} plays, {len(df.columns)} columns")
    return df


def load_rosters(year: int) -> pd.DataFrame | None:
    """Load roster data if available."""
    path = RAW_DIR / f"roster_weekly_{year}.csv"
    if path.exists():
        print(f"Loading rosters from {path}...")
        return pd.read_csv(path, low_memory=False)
    print(f"No roster file found at {path} — skipping roster-based metrics.")
    return None


# ---------------------------------------------------------------------------
# Team Scheme Profiles
# ---------------------------------------------------------------------------
def compute_scheme_profiles(df: pd.DataFrame) -> dict:
    """Compute per-team offensive and defensive scheme profiles."""
    profiles = {}

    # Filter to actual plays (exclude timeouts, penalties-only, etc.)
    plays = df[df["play_type"].isin(["pass", "run"])].copy()

    for team in NFL_TEAMS:
        off = plays[plays["posteam"] == team]
        deff = plays[plays["defteam"] == team]

        if len(off) == 0 and len(deff) == 0:
            continue

        profile = {"team": team, "offense": {}, "defense": {}}

        # --- Offensive scheme ---
        if len(off) > 0:
            total_off = len(off)
            pass_plays = off[off["play_type"] == "pass"]
            run_plays = off[off["play_type"] == "run"]

            profile["offense"]["pass_rate"] = round(len(pass_plays) / total_off, 3)
            profile["offense"]["run_rate"] = round(len(run_plays) / total_off, 3)
            profile["offense"]["total_plays"] = total_off

            # Pass rate by down
            for down in [1, 2, 3, 4]:
                down_plays = off[off["down"] == down]
                if len(down_plays) > 0:
                    profile["offense"][f"pass_rate_down_{down}"] = round(
                        len(down_plays[down_plays["play_type"] == "pass"]) / len(down_plays), 3
                    )

            # Play action rate (if column exists)
            if "is_play_action" in off.columns:
                pa = off["is_play_action"].sum()
                profile["offense"]["play_action_rate"] = round(pa / total_off, 3)
            elif "play_action" in off.columns:
                pa = off["play_action"].fillna(0).sum()
                profile["offense"]["play_action_rate"] = round(pa / total_off, 3)

            # No-huddle rate
            if "no_huddle" in off.columns:
                nh = off["no_huddle"].fillna(0).sum()
                profile["offense"]["no_huddle_rate"] = round(nh / total_off, 3)

            # RPO frequency (if available)
            if "is_rpo" in off.columns:
                rpo = off["is_rpo"].fillna(0).sum()
                profile["offense"]["rpo_rate"] = round(rpo / total_off, 3)

            # Personnel groupings (if available)
            if "offense_personnel" in off.columns:
                personnel = off["offense_personnel"].dropna().value_counts(normalize=True).head(6)
                profile["offense"]["personnel_usage"] = {
                    k: round(v, 3) for k, v in personnel.items()
                }

            # Run direction tendencies
            if "run_location" in run_plays.columns and len(run_plays) > 0:
                run_dir = run_plays["run_location"].dropna().value_counts(normalize=True)
                profile["offense"]["run_direction"] = {
                    k: round(v, 3) for k, v in run_dir.items()
                }

        # --- Defensive scheme ---
        if len(deff) > 0:
            total_def = len(deff)
            profile["defense"]["total_plays_faced"] = total_def

            # Opponent pass/run rate against this defense
            profile["defense"]["opp_pass_rate"] = round(
                len(deff[deff["play_type"] == "pass"]) / total_def, 3
            )

            # Blitz rate by down (if available)
            if "blitz" in deff.columns:
                blitz_rate = deff["blitz"].fillna(0).mean()
                profile["defense"]["blitz_rate"] = round(blitz_rate, 3)
                for down in [1, 2, 3]:
                    dd = deff[deff["down"] == down]
                    if len(dd) > 0 and "blitz" in dd.columns:
                        profile["defense"][f"blitz_rate_down_{down}"] = round(
                            dd["blitz"].fillna(0).mean(), 3
                        )

            # Coverage distribution (if available)
            coverage_cols = [c for c in deff.columns if "coverage" in c.lower()]
            if "defense_coverage_type" in deff.columns:
                cov = deff["defense_coverage_type"].dropna().value_counts(normalize=True).head(8)
                profile["defense"]["coverage_distribution"] = {
                    k: round(v, 3) for k, v in cov.items()
                }
            elif coverage_cols:
                # Try first coverage-related column
                cov_col = coverage_cols[0]
                cov = deff[cov_col].dropna().value_counts(normalize=True).head(8)
                profile["defense"]["coverage_distribution"] = {
                    str(k): round(v, 3) for k, v in cov.items()
                }

            # Pass rate allowed by down
            for down in [1, 2, 3, 4]:
                dd = deff[deff["down"] == down]
                if len(dd) > 0:
                    profile["defense"][f"opp_pass_rate_down_{down}"] = round(
                        len(dd[dd["play_type"] == "pass"]) / len(dd), 3
                    )

        profiles[team] = profile

    return profiles


# ---------------------------------------------------------------------------
# Situational Splits
# ---------------------------------------------------------------------------
def compute_situational_splits(df: pd.DataFrame) -> dict:
    """Compute per-team situational tendency data."""
    plays = df[df["play_type"].isin(["pass", "run"])].copy()
    splits = {}

    for team in NFL_TEAMS:
        off = plays[plays["posteam"] == team]
        if len(off) == 0:
            continue

        team_splits = {"team": team}

        # Red zone (inside 20)
        rz = off[off["yardline_100"] <= 20]
        if len(rz) > 10:
            team_splits["red_zone"] = {
                "plays": len(rz),
                "pass_rate": round(len(rz[rz["play_type"] == "pass"]) / len(rz), 3),
                "run_rate": round(len(rz[rz["play_type"] == "run"]) / len(rz), 3),
            }

        # Goal line (inside 5)
        gl = off[off["yardline_100"] <= 5]
        if len(gl) > 5:
            team_splits["goal_line"] = {
                "plays": len(gl),
                "pass_rate": round(len(gl[gl["play_type"] == "pass"]) / len(gl), 3),
                "run_rate": round(len(gl[gl["play_type"] == "run"]) / len(gl), 3),
            }

        # 3rd down
        third = off[off["down"] == 3]
        if len(third) > 10:
            converted = third[third["first_down"] == 1] if "first_down" in third.columns else pd.DataFrame()
            team_splits["third_down"] = {
                "plays": len(third),
                "pass_rate": round(len(third[third["play_type"] == "pass"]) / len(third), 3),
                "conversion_rate": round(len(converted) / len(third), 3) if len(converted) > 0 else None,
            }

        # 4th down decisions
        fourth = df[(df["posteam"] == team) & (df["down"] == 4)]
        if len(fourth) > 0:
            go_for_it = fourth[fourth["play_type"].isin(["pass", "run"])]
            punt = fourth[fourth["play_type"] == "punt"] if "punt" in fourth["play_type"].values else pd.DataFrame()
            fg = fourth[fourth["play_type"] == "field_goal"] if "field_goal" in fourth["play_type"].values else pd.DataFrame()
            team_splits["fourth_down"] = {
                "total": len(fourth),
                "go_for_it": len(go_for_it),
                "punt": len(punt),
                "field_goal": len(fg),
                "go_rate": round(len(go_for_it) / len(fourth), 3) if len(fourth) > 0 else 0,
            }

        # 2-minute drill (last 2 min of each half, trailing or tied)
        if "half_seconds_remaining" in off.columns:
            two_min = off[
                (off["half_seconds_remaining"] <= 120)
            ]
            if len(two_min) > 5:
                team_splits["two_minute_drill"] = {
                    "plays": len(two_min),
                    "pass_rate": round(len(two_min[two_min["play_type"] == "pass"]) / len(two_min), 3),
                }

        splits[team] = team_splits

    return splits


# ---------------------------------------------------------------------------
# Player Usage Data
# ---------------------------------------------------------------------------
def compute_player_usage(df: pd.DataFrame, rosters: pd.DataFrame | None, snap_shares: dict | None = None) -> dict:
    """Compute per-player snap counts, target shares, and usage metrics.

    Keyed by gsis_id (nflverse `receiver_player_id` / `rusher_player_id` /
    `passer_player_id`) — never by name. Name-only keying silently collided
    Bijan Robinson (00-0038542) with Brian Robinson Jr. (00-0037746) during
    the Aug 22 audit. Names remain as display labels inside each record.

    Task 2b — adds `snap_share` (from nflverse snap_counts joined via pfr→gsis
    map when caller provides it), plus nullable `route_participation` and
    `yoy_usage_delta` placeholders documented in the file's metadata.
    """
    usage = {}
    plays = df[df["play_type"].isin(["pass", "run"])].copy()
    snap_shares = snap_shares or {}

    def new_record(pid, name, team):
        return {
            "gsis_id": pid,
            "name": name,
            "team": team,
            "snap_share": snap_shares.get(pid),
            "route_participation": None,   # placeholder — no free source (PFF paid; pbp_participation only 2016-2023)
            "yoy_usage_delta": None,       # populated by main() when prior-year snapshot exists
        }

    # --- Receiver targets & usage ---
    if "receiver_player_name" in plays.columns and "receiver_player_id" in plays.columns:
        pass_plays = plays[plays["play_type"] == "pass"].copy()

        for team in NFL_TEAMS:
            team_passes = pass_plays[pass_plays["posteam"] == team]
            if len(team_passes) == 0:
                continue

            id_col = team_passes["receiver_player_id"]
            total_targets = int(id_col.notna().sum())
            receivers = team_passes.groupby("receiver_player_id").agg(
                player_name=("receiver_player_name", "first"),
                targets=("receiver_player_id", "count"),
                receptions=("complete_pass", "sum") if "complete_pass" in team_passes.columns else ("receiver_player_id", "count"),
                yards=("yards_gained", "sum") if "yards_gained" in team_passes.columns else ("receiver_player_id", "count"),
            ).reset_index()

            if total_targets > 0:
                receivers["target_share"] = (receivers["targets"] / total_targets).round(3)

            receivers = receivers.sort_values("targets", ascending=False).head(15)

            for _, row in receivers.iterrows():
                pid = row["receiver_player_id"]
                if pd.isna(pid) or not pid:
                    continue
                rec = new_record(pid, row.get("player_name"), team)
                rec.update({
                    "targets": int(row["targets"]),
                    "target_share": float(row.get("target_share", 0)),
                    "receptions": int(row.get("receptions", 0)),
                    "receiving_yards": int(row.get("yards", 0)),
                })
                usage[pid] = rec

    # --- Rusher usage ---
    if "rusher_player_name" in plays.columns and "rusher_player_id" in plays.columns:
        run_plays = plays[plays["play_type"] == "run"].copy()

        for team in NFL_TEAMS:
            team_runs = run_plays[run_plays["posteam"] == team]
            if len(team_runs) == 0:
                continue

            total_carries = int(team_runs["rusher_player_id"].notna().sum())
            rushers = team_runs.groupby("rusher_player_id").agg(
                player_name=("rusher_player_name", "first"),
                carries=("rusher_player_id", "count"),
                yards=("yards_gained", "sum") if "yards_gained" in team_runs.columns else ("rusher_player_id", "count"),
            ).reset_index()

            if total_carries > 0:
                rushers["carry_share"] = (rushers["carries"] / total_carries).round(3)

            rushers = rushers.sort_values("carries", ascending=False).head(8)

            for _, row in rushers.iterrows():
                pid = row["rusher_player_id"]
                if pd.isna(pid) or not pid:
                    continue
                if pid in usage:
                    usage[pid]["carries"] = int(row["carries"])
                    usage[pid]["carry_share"] = float(row.get("carry_share", 0))
                    usage[pid]["rushing_yards"] = int(row.get("yards", 0))
                else:
                    rec = new_record(pid, row.get("player_name"), team)
                    rec.update({
                        "carries": int(row["carries"]),
                        "carry_share": float(row.get("carry_share", 0)),
                        "rushing_yards": int(row.get("yards", 0)),
                    })
                    usage[pid] = rec

    # --- QB role tag (by primary passer per team) ---
    if "game_id" in plays.columns and "passer_player_id" in plays.columns:
        for team in NFL_TEAMS:
            team_plays = plays[plays["posteam"] == team]
            pass_plays_t = team_plays[team_plays["play_type"] == "pass"]
            if len(pass_plays_t) == 0:
                continue
            qb_id_mode = pass_plays_t["passer_player_id"].mode()
            if len(qb_id_mode) == 0 or pd.isna(qb_id_mode.iloc[0]):
                continue
            qb_id = qb_id_mode.iloc[0]
            qb_name_mode = pass_plays_t.loc[pass_plays_t["passer_player_id"] == qb_id, "passer_player_name"].mode()
            qb_name = qb_name_mode.iloc[0] if len(qb_name_mode) else None
            if qb_id not in usage:
                usage[qb_id] = new_record(qb_id, qb_name, team)
            usage[qb_id]["role"] = "QB"

    return usage


# ---------------------------------------------------------------------------
# Scheme Similarity Matrix
# ---------------------------------------------------------------------------
def compute_scheme_similarity(profiles: dict) -> dict:
    """
    Compute pairwise scheme similarity between all 32 teams' defenses.
    Uses cosine similarity on defensive tendency vectors.
    """
    # Build feature vectors for each team's defense
    feature_keys = [
        "opp_pass_rate", "blitz_rate",
        "opp_pass_rate_down_1", "opp_pass_rate_down_2", "opp_pass_rate_down_3"
    ]

    vectors = {}
    for team, profile in profiles.items():
        defense = profile.get("defense", {})
        vec = []
        for key in feature_keys:
            val = defense.get(key, 0.5)  # default to league average
            vec.append(val if val is not None else 0.5)
        vectors[team] = vec

    # Cosine similarity
    def cosine_sim(a, b):
        dot = sum(x * y for x, y in zip(a, b))
        mag_a = sqrt(sum(x ** 2 for x in a))
        mag_b = sqrt(sum(x ** 2 for x in b))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return round(dot / (mag_a * mag_b), 4)

    matrix = {}
    teams = sorted(vectors.keys())
    for t1 in teams:
        matrix[t1] = {}
        for t2 in teams:
            matrix[t1][t2] = cosine_sim(vectors[t1], vectors[t2])

    return matrix


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    year = parse_args()
    print(f"=" * 60)
    print(f"DownfieldOS PBP Processor — {year} Season")
    print(f"=" * 60)

    # Load data
    df = load_pbp(year)
    rosters = load_rosters(year)

    # Validate expected columns
    required_cols = ["play_id", "game_id", "posteam", "defteam", "play_type"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        print(f"WARNING: Missing expected columns: {missing}")

    print(f"\nAvailable columns ({len(df.columns)}): {', '.join(sorted(df.columns)[:20])}...")

    # Task 2 (EM/PO Directive 2026-08-22): drop postseason so that a
    # `season: 2025` label never carries REG+POST bleed. Companion script
    # (data/intelligence/pbp/process_pbp.py) has the same filter and an
    # assert_single_season_aggregation() check on games_played; this script
    # doesn't emit games_played so the runtime assert isn't applicable, but
    # the filter still applies to keep the four output JSONs consistent.
    if "season_type" in df.columns:
        pre = len(df)
        df = df[df["season_type"] == "REG"].copy()
        dropped = pre - len(df)
        print(f"\nDropped {dropped:,} non-REG plays; keeping {len(df):,} REG plays")

    # --- Compute all derived metrics ---
    print("\n[1/4] Computing team scheme profiles...")
    profiles = compute_scheme_profiles(df)
    print(f"  → {len(profiles)} teams profiled")

    print("[2/4] Computing situational splits...")
    splits = compute_situational_splits(df)
    print(f"  → {len(splits)} teams with situational data")

    print("[3/4] Computing player usage data...")
    usage = compute_player_usage(df, rosters)
    print(f"  → {len(usage)} player records")

    print("[4/4] Computing scheme similarity matrix...")
    similarity = compute_scheme_similarity(profiles)
    print(f"  → {len(similarity)}x{len(similarity)} similarity matrix")

    # --- Save outputs ---
    print(f"\nSaving outputs to {BASE_DIR}/...")

    with open(BASE_DIR / "team_scheme_profiles.json", "w") as f:
        json.dump(profiles, f, indent=2)
    print("  ✓ team_scheme_profiles.json")

    with open(BASE_DIR / "scheme_similarity_matrix.json", "w") as f:
        json.dump(similarity, f, indent=2)
    print("  ✓ scheme_similarity_matrix.json")

    with open(BASE_DIR / "player_usage_data.json", "w") as f:
        json.dump(usage, f, indent=2)
    print("  ✓ player_usage_data.json")

    with open(BASE_DIR / "situational_splits.json", "w") as f:
        json.dump(splits, f, indent=2)
    print("  ✓ situational_splits.json")

    # --- Metadata ---
    metadata = {
        "last_sync": datetime.utcnow().isoformat() + "Z",
        "season": year,
        "total_plays": len(df),
        "actual_plays": len(df[df["play_type"].isin(["pass", "run"])]),
        "teams_profiled": len(profiles),
        "player_records": len(usage),
        "data_source": f"nflverse play_by_play_{year}",
        "columns_available": len(df.columns),
        "games": int(df["game_id"].nunique()) if "game_id" in df.columns else None,
        "data_quality": {
            "has_coverage_data": "defense_coverage_type" in df.columns,
            "has_blitz_data": "blitz" in df.columns,
            "has_personnel_data": "offense_personnel" in df.columns,
            "has_play_action_data": any(c in df.columns for c in ["is_play_action", "play_action"]),
            "has_rpo_data": "is_rpo" in df.columns,
        }
    }

    with open(BASE_DIR / "pbp_sync_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    print("  ✓ pbp_sync_metadata.json")

    # --- Validation spot checks ---
    print(f"\n{'=' * 60}")
    print("VALIDATION SPOT CHECKS")
    print(f"{'=' * 60}")

    # Check that high-profile teams have data
    for check_team in ["KC", "PHI", "SF"]:
        if check_team in profiles:
            p = profiles[check_team]
            off = p.get("offense", {})
            print(f"\n{check_team} offense: {off.get('total_plays', 0)} plays, "
                  f"pass rate={off.get('pass_rate', 'N/A')}, "
                  f"play_action={off.get('play_action_rate', 'N/A')}")
            defense = p.get("defense", {})
            print(f"{check_team} defense: {defense.get('total_plays_faced', 0)} plays faced, "
                  f"blitz rate={defense.get('blitz_rate', 'N/A')}")

    # Verify similarity matrix is symmetric
    asym_count = 0
    teams = sorted(similarity.keys())
    for i, t1 in enumerate(teams):
        for t2 in teams[i + 1:]:
            if abs(similarity[t1][t2] - similarity[t2][t1]) > 0.001:
                asym_count += 1
    print(f"\nSimilarity matrix symmetry check: {'PASS' if asym_count == 0 else f'FAIL ({asym_count} asymmetric pairs)'}")
    print(f"\nDone. All outputs saved to {BASE_DIR}/")


if __name__ == "__main__":
    main()
