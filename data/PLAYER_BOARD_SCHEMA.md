# `playerBoard2026.js` — Pre-Draft Board Schema

**Source:** EM/PO Directive v2 Task 6 (THE DELIVERABLE).
**Build:** `node scripts/build-player-board.js`
**Verify:** `node scripts/verify-player-board.mjs`
**Consumer helpers:** `src/utils/playerResolver.js`

One row per rostered skill player (QB/RB/WR/TE) from
`data/intelligence/raw/roster_weekly_2026.csv.gz`, plus 32 K + 32 DEF rows
synthesized with `data_coverage_flag='partial'`. Every row carries the
fields below.

## Identity

| Field | Type | Source | Notes |
|---|---|---|---|
| `gsis_id` | string | roster_weekly | Canonical join key. null for K/DEF rows. |
| `sleeper_id`, `yahoo_id`, `espn_id`, `pfr_id` | string \| null | roster_weekly | Platform IDs for cross-referencing. |
| `name` | string | roster_weekly | Display label only — never a join key. |
| `pos` | `QB` \| `RB` \| `WR` \| `TE` \| `K` \| `DEF` | roster_weekly | |
| `team_2026` | 3-letter code | roster_weekly | Normalized (LA→LAR, AZ→ARI). |
| `team_2025` | 3-letter code \| null | playerStats2025 | null when the player has no 2025 row. |
| `team_changed` | bool \| null | derived | `true` when `team_2025 !== team_2026`. null when either side unknown. |
| `bye_week` | int \| null | schedule2026 | |

## 2025 Production (null for rookies / no-snap veterans)

`games_2025`, `targets`, `receptions`, `rec_yards`, `rec_td`, `carries`,
`rushing_yards`, `rushing_tds`, `passing_yards`, `passing_tds`

## Usage Shares (top-500 by touches, from PBP-derived usage)

| Field | Type | Notes |
|---|---|---|
| `target_share` | 0–1 float \| null | Player's share of team pass targets (2025). |
| `carry_share` | 0–1 float \| null | Player's share of team carries (2025). |
| `snap_share` | 0–1 float \| null | Mean offense_pct per game (2025). |
| `touches` | int \| null | targets + carries. |
| `total_td` | int \| null | rec + rush + pass TDs. |
| `epa_per_play` | float \| null | 2025 EPA per play. |

## Team Context (Task 4 join — always populated for skill rows)

| Field | Notes |
|---|---|
| `qb_name` | Primary passer on `team_2026` (highest-attempts QB in playerStats2025). |
| `qb_gsis_id` | For downstream joins. |
| `qb_pass_td` | That QB's 2025 passing TDs. |
| `qb_epa` | That QB's 2025 EPA per play. |
| `team_off_epa` | Team offense EPA/play (situational_splits or team_scheme_profiles). |
| `team_pass_rate` | Overall pass rate. |
| `team_rz_pass_rate` | Red-zone pass rate. |
| `team_goal_line_run_rate` | 1-and-goal-under-3 run rate (situational_splits.goal_line). |
| `team_pass_rate_when_behind` | Pass rate when trailing (situational_splits.game_script). |

## Availability (Task 5 — Sleeper feed, refresh daily)

| Field | Type |
|---|---|
| `availability_status` | `ACT` \| `PUP` \| `IR` \| `NFI` \| `SUSP` \| null |
| `practice_status` | `FULL` \| `LIMITED` \| `DNP` \| null (nflverse injuries CSV, in-season only) |
| `game_designation` | `Q` \| `D` \| `O` \| null |
| `injury_note` | string \| null |
| `availability_last_verified_utc` | ISO 8601. Must be < 24h for draft-time use. |
| `availability_source_url` | Sleeper player page. |

**Gate:** consumers must call `playerResolver.canOutrank(candidate, incumbent)`
before ranking. A PUP/IR/NFI/SUSP candidate cannot outrank a healthy
incumbent without `{allowOverride: true}`.

## Market

| Field | Notes |
|---|---|
| `adp_overall` | Sleeper `search_rank` as ADP proxy. null when >9M sentinel or unmapped. |
| `adp_positional` | 1-indexed rank within `pos`. |

## Playoff Schedule (Wk 15–17)

`playoff_wk15_opp`, `playoff_wk16_opp`, `playoff_wk17_opp` — 3-letter opp
code or null (bye).
`playoff_indoor_games` — count of playoff-window games where `roof` ∈
{`dome`, `closed`}.

## Coverage flag

`data_coverage_flag`:
- `full` — has stat row + share metrics + QB context.
- `partial` — K/DEF rows, or skill rows missing shares.
- `no_2025_snaps` — non-rookie without a 2025 stat row (waiver churn, PS all year).
- `rookie_no_2025_snaps` — 2026 rookie by roster_weekly rookie_year or years_exp=0.

## Notes column

Only populated on K/DEF rows: "partial coverage — defer to platform
consensus for ADP and projection."
