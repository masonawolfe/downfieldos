# E-040 · FTN charting ingest — DESIGN (counsel-cleared shape, awaiting Mason on repo LICENSE)

**Updated 2026-09-18 on branch `design/e040-ftn-ingest` after counsel's C-011 answer (00_System/Roles/counsel/_TO_COS.md L75+) and step-4 verification of the actual 2026 FTN release.**

## Counsel's C-011 (verbatim from the peer's summary)

- **Licence:** CC BY-SA 4.0. Attribution text: **"FTN Data via nflverse"** with a link to the licence and a "modified" note where output is derived.
- **§3(b):** ShareAlike does **not** force DFOS to publish its derived data. What binds is: (a) any FTN-derived output that goes out publicly must carry the credit + licence link + modified note; (b) the paid tier is a §3(b)(3) tension — nothing FTN-derived behind a paywall until a lawyer rules; (c) the public repo currently has `"license": null`, so committing FTN-derived columns into `main` is "sharing Adapted Material" and needs Mason's decision to add a repo LICENSE or keep FTN columns out of the public repo.

## Step-4 verification — the 2026 asset

**Confirmed present.** Pulled via `gh api repos/nflverse/nflverse-data/releases/tags/ftn_charting`. Assets uploaded 2026-09-16T20:51:54Z:

| Asset | Size |
|---|---|
| `ftn_charting_2026.csv` | 458,719 bytes |
| `ftn_charting_2026.parquet` | 47,572 bytes |
| `ftn_charting_2026.rds` | 26,793 bytes |

**The old sync report's 404 was the fetcher looking for `.csv.gz`.** nflverse publishes FTN as plain `.csv` (uncompressed). Fix the fetcher URL.

Current 2026 content: **1 week, 2,675 plays** (Week 1 only). Grows weekly.

## Real fields — this differs from what the prior design assumed

**The prior design page hypothesized coverage classification (single-high / quarters / cover-3) and route type per receiver. Neither is in FTN.** The real 29 fields:

**Identifiers**
`ftn_game_id`, `nflverse_game_id`, `season`, `week`, `ftn_play_id`, `nflverse_play_id`

**Pre-snap offense**
`starting_hash`, `qb_location`, `n_offense_backfield`, `is_no_huddle`, `is_motion`, `is_play_action`, `is_screen_pass`, `is_rpo`, `is_trick_play`, `is_qb_sneak`

**Pre-snap defense**
`n_defense_box`, `n_blitzers`, `n_pass_rushers`

**QB behavior**
`is_qb_out_of_pocket`, `is_interception_worthy`, `is_throw_away`, `read_thrown`, `is_qb_fault_sack`

**Ball / catch**
`is_catchable_ball`, `is_contested_ball`, `is_created_reception`, `is_drop`

**Meta**
`date_pulled`

## What FTN actually adds to E-033 (corrected)

Aggregated per (team, season) — offensive tendencies:

- `pct_no_huddle`, `pct_motion`, `pct_play_action`, `pct_screen_pass`, `pct_rpo`, `pct_qb_out_of_pocket` — the offense's own style, sharper than PBP-derived proxies.
- `qb_fault_sack_rate` — separates a QB's own sack-taking from OL failures.
- `contested_ball_rate`, `catchable_ball_rate`, `drop_rate` (from receiver aggregations) — WR quality vs. QB placement, separable now.

Aggregated per (team, season) — defensive tendencies:

- `blitz_rate = mean(n_blitzers > 4)` and `avg_blitzers`
- `avg_pass_rushers`, `avg_defense_box`
- `pct_faced_screen`, `pct_faced_motion` — what a defense sees, not what they call. Different signal than coverage classification but usable.

Aggregated per (gsis_id, season) — receiver quality signals:

- `contested_ball_share`, `drop_rate`, `created_reception_share` — separable receiver quality independent of catch/target counts.

Aggregated per (gsis_id, season) — QB style:

- `qb_out_of_pocket_rate`, `throw_away_rate`, `interception_worthy_rate`, `qb_fault_sack_rate`

**None of it is coverage classification.** The scheme-fit story I sketched earlier (WR-vs-man vs opponent-plays-man) is not derivable from FTN alone — nflverse `pbp_participation` release carries defense_personnel and pass_coverage_type fields separately (that's an E-041 candidate, not E-040).

## Proposed shape — gated build on this branch

Per counsel's recommendation (§1 separate labelled layer, §2 credited on any public surface, §3 no paid-tier gating), the ingest lives in its own file with `ftn_` column prefixes so the share-alike surface is identifiable:

- **`scripts/fetch-ftn-charting.js`** — new fetcher. Pulls `ftn_charting_2026.csv` (plain, not gz), aggregates to three files:
  - `src/data/intelligence/ftn_team_2026.json` — one row per team-season, prefixed `ftn_pct_motion`, `ftn_pct_play_action`, `ftn_blitz_rate`, `ftn_avg_defense_box`, etc.
  - `src/data/intelligence/ftn_receiver_2026.json` — one row per gsis_id-season, prefixed `ftn_contested_ball_share`, `ftn_drop_rate`, `ftn_created_reception_share`.
  - `src/data/intelligence/ftn_qb_2026.json` — one row per gsis_id-season, prefixed `ftn_qb_out_of_pocket_rate`, `ftn_throw_away_rate`, `ftn_interception_worthy_rate`, `ftn_qb_fault_sack_rate`.
- **`.github/workflows/data-ftn-v2.yml`** — new workflow, Wed 06:35 UTC in the overnight window (after weekly-actuals). Same retry-with-rebase shape.
- **`meta` block in each output:**
  ```json
  {
    "source": "https://github.com/nflverse/nflverse-data/releases/download/ftn_charting/ftn_charting_2026.csv",
    "generated_utc": "…",
    "license": "CC BY-SA 4.0",
    "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
    "attribution": "FTN Data via nflverse",
    "modified_note": "Aggregated from per-play FTN charting to per-team / per-player rates for use in DFOS matchup grading. See scripts/fetch-ftn-charting.js.",
    "notice": "Any DFOS output that ships publicly and includes any `ftn_*` field must carry this attribution + license link + modified note."
  }
  ```

**Consumer wiring** (`scripts/build-player-board.js` and `scripts/build-weekly-board.js`): join the three FTN files by team / gsis_id, land the columns already-prefixed on the board rows so nothing gets fused-in-place. E-033 (per-opponent history) picks up the QB and defensive-tendency fields as additional terms in `computeWeeklyValue`.

## Public-surface attribution (site)

Where any `ftn_*` field is displayed in the site UI, footer of the surface reads:

> Charting inputs: **FTN Data via nflverse**, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Modified (aggregated from per-play to per-team / per-player rates).

## What is NOT in this branch, and why

1. **No merge to `main`.** Counsel flagged the `"license": null` on the public repo. Committing FTN-derived columns to a repo without a licence is sharing Adapted Material — needs Mason to decide: (a) add a repo LICENSE at least as permissive as CC BY-SA 4.0 (a-la MIT works — CC BY-SA is about the FTN-derived output specifically, not the codebase itself), OR (b) keep FTN columns out of the public repo (compute them in CI, use them at build time, don't check them in). Design lives on this branch until Mason picks (a) or (b).

2. **No paid-tier code path.** §3(b)(3) tension per counsel. Any newsletter / dashboard behind a Beehiiv paywall that would render FTN-derived fields is out of scope until a lawyer rules.

3. **No coverage classification.** Not in FTN. That's `pbp_participation` and would be a separate E-041 if desired.

## Decision gate

Awaiting Mason on:

- **A. Repo LICENSE.** Add one at least as permissive as CC BY-SA 4.0 (open — MIT / Apache / CC0 all work for the codebase; the CC BY-SA obligation only follows the FTN-derived fields, not the source code that generates them), OR keep FTN columns out of the public repo entirely.
- **B. Paid-tier gating of newsletter or dashboard.** If neither ever ships FTN-derived content, no lawyer needed. If either might, park it until reviewed.

When both are green, this branch merges and `data-ftn-v2.yml` schedules on.
