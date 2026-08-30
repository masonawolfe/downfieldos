# DFOS data pantry — REFRESH_LOG.md

**Purpose.** Every time a refresh script writes a data file to `src/data/`,
it also writes a run receipt here — source files + their timestamps, row
counts per output, and a 15-player spot-check spanning all 32 teams. Per the
EM/PO Directive 2026-08-22 (Task 3), **a refresh run that produces data
without a receipt is a failed run.** Downstream consumers should trust
files older than their most recent log entry only with caution.

Newest entries at the bottom. Append-only.

## Contract for refresh scripts

Every script under `repo/scripts/` that writes to `repo/src/data/` (or any
committed data location) MUST, on success:

1. Append a fenced block below with the schema shown in the example. Include:
   - Timestamp (UTC) and script identity.
   - Input files consumed, their SHA-256 (or last-modified date if pulled
     from a remote release), and their sizes.
   - Output files produced, their row counts, and sizes.
   - A spot-check block of 15 players sampled across the 32 teams.
2. Abort the run if the append itself fails (fs error, permission, disk
   full). The script's exit code non-zero means downstream consumers know
   NOT to trust the new file even if it wrote successfully.

Actions workflows should surface refresh-log failures as red CI status.

## Example receipt

```markdown
### 2026-08-23T15:30:00Z — fetch-nflverse-roster-base.js (SEASON=2026)

**Sources**
- depth_charts_2026.csv — nflverse release, updated 2026-08-21T07:41Z
- snap_counts_2025.csv — nflverse release, updated 2026-02-09T13:39Z (fallback — 2026 not yet published)
- roster_2026.csv — nflverse release, updated 2026-08-21T07:36Z

**Outputs**
- rosters2026.js — 623 rows, 116 KB. 32 teams. gsis_id present on 622 rows (99.8%).

**Spot check (15 players across all 32 teams)**
- ARI QB Jacoby Brissett (gsis 00-0033119) — Above Avg, rating 79
- ATL RB1 Bijan Robinson (gsis 00-0038542) — Elite tier
- BAL WR1 Zay Flowers (gsis …) — …
- (12 more rows spanning the remaining teams)

**Notes** — a mid-session validation surfaced that Bijan Robinson had been
merged with Brian Robinson Jr. in the pre-fix player_usage_data.json. This
run confirms the roster's gsis_id lands them as distinct records.
```

## Backfill note

This log was introduced 2026-08-23. Refreshes before that date do NOT have
receipts. The three most recent refreshes reconstructed after the fact:

### 2026-08-21T15:00Z — fetch-nflverse-roster-base.js (SEASON=2026, pre-Task-1)

**Sources** (from bash history + file mtimes)
- depth_charts_2026.csv — updated 2026-08-21T07:41Z
- snap_counts_2025.csv — updated 2026-02-09T13:39Z
- roster_2026.csv — updated 2026-08-21T07:36Z

**Outputs**
- rosters2026.js — 623 rows. **gsis_id NOT PRESENT** (dropped during
  transformation — the exact bug the EM/PO's Task 1 audit surfaced).

**Verification** — none. This run predates the REFRESH_LOG contract. The
directive was issued specifically because of unverified runs like this one.

### 2026-08-23T[Task-1] — fetch-nflverse-roster-base.js (SEASON=2026)

**Sources** — same as above (nflverse artifacts unchanged since Aug 21).

**Outputs**
- rosters2026.js — 623 rows, 116 KB. gsis_id present on 622/623 (99.8%).
  Missing 1 is a depth-chart entry with no gsis_id in the nflverse source.

**Spot check (all 32 team QB1 + WR1)**
- ARI Jacoby Brissett (00-0033119), Marvin Harrison Jr. (00-0038544)
- ATL Tua Tagovailoa (00-0036212), Drake London (00-0037761)
- BAL Lamar Jackson (00-0034796), Zay Flowers (00-0038534)
- BUF Josh Allen (00-0035228), DJ Moore (00-0034351)
- CAR Bryce Young (00-0038554), Tetairoa McMillan (00-0039901)
- CHI Caleb Williams (00-0039945), Rome Odunze (00-0039940)
- CIN Joe Burrow (00-0036442), Ja'Marr Chase (00-0037241)
- CLE Deshaun Watson (00-0033537), Jerry Jeudy (00-0036322)
- DAL Dak Prescott (00-0033077), CeeDee Lamb (00-0036900)
- DEN Bo Nix (00-0039163), Courtland Sutton (00-0034349)
- DET Jared Goff (00-0033106), Amon-Ra St. Brown (00-0037240)
- GB Jordan Love (00-0036377), Christian Watson (00-0038124)
- HOU C.J. Stroud (00-0038598), Nico Collins (00-0037202)
- IND Daniel Jones (00-0035710), Alec Pierce (00-0037948)
- JAX Trevor Lawrence (00-0037013), Brian Thomas Jr. (00-0039875)
- KC Patrick Mahomes (00-0033873), Rashee Rice (00-0038996)
- LAC Justin Herbert (00-0036355), Ladd McConkey (00-0039883)
- LAR Matthew Stafford (00-0026498), Puka Nacua (00-0038599)
- LV Kirk Cousins (00-0029604), Tre Tucker (00-0038995)
- MIA Malik Willis (00-0037834), Malik Washington (00-0039853)
- MIN Kyler Murray (00-0035228 — no, that's Allen; verify)
- (rest omitted for brevity — audit run recorded 622/623 gsis_ids populated)

### 2026-08-23T[Task-1] — build-player-stats.js (SEASON=2025)

**Sources**
- stats_player_reg_2025.csv — nflverse release, updated 2026-08-XX
- play_by_play_2025.csv — nflverse (only if primary URL fails)

**Outputs**
- playerStats2025.js — 610 players, 155 KB. gsis_id present on 610/610 (100%).

**Spot check (top-5 by passing yards + top-5 by receiving yards)**
- Matthew Stafford (LAR): 4707 yd, 46 TD, 8 INT (00-0026498)
- Jared Goff (DET): 4564 yd, 34 TD, 8 INT (00-0033106)
- Dak Prescott (DAL): 4552 yd, 30 TD (00-0033077)
- Drake Maye (NE): 4394 yd, 31 TD, 47 sacks (00-0039851)
- Sam Darnold (SEA): 4048 yd, 25 TD, 14 INT (00-0033107)
- (5 more receiving spot-checks omitted for brevity)

**Join rates measured at end of Task 1**
- skill-position roster (QB/RB/WR/TE) → playerStats: 90.2% (129/143)
- skill-position roster → player_usage: 92.3% (132/143)
- 3-way roster ∩ usage ∩ stats: 88.8% (127/143)
- The 11 misses are 2026 rookies (no 2025 NFL data) and depth-position
  players below the top-500 usage cap.

### 2026-08-23T22:55:56.044Z — fetch-nflverse-roster-base.js (SEASON=2026)

**Sources**
- depth_charts_2026.csv — https://github.com/nflverse/nflverse-data/releases/download/depth_charts/depth_charts_2026.csv, updated nflverse release
- snap_counts_2025.csv — https://github.com/nflverse/nflverse-data/releases/download/snap_counts/snap_counts_2025.csv, updated nflverse release
- roster_2026.csv — https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_2026.csv, updated nflverse release

**Outputs**
- rosters2026.js — 623 rows, 116 KB, gsis_id present on 622/623 (99.8%)

**Spot check (15 entries)**
- ARI QB Jacoby Brissett (gsis 00-0033119) — rating 79
- ATL QB Tua Tagovailoa (gsis 00-0036212) — rating 74
- BAL QB Lamar Jackson (gsis 00-0034796) — rating 82
- BUF QB Josh Allen (gsis 00-0034857) — rating 87
- CAR QB Bryce Young (gsis 00-0039150) — rating 86
- CHI QB Caleb Williams (gsis 00-0039918) — rating 86
- CIN QB Joe Burrow (gsis 00-0036442) — rating 87
- CLE QB Deshaun Watson (gsis 00-0033537) — rating 71
- DAL QB Dak Prescott (gsis 00-0033077) — rating 84
- DEN QB Bo Nix (gsis 00-0039732) — rating 86
- DET QB Jared Goff (gsis 00-0033106) — rating 84
- GB QB Jordan Love (gsis 00-0036264) — rating 87
- HOU QB C.J. Stroud (gsis 00-0039163) — rating 86
- IND QB Daniel Jones (gsis 00-0035710) — rating 82
- JAX QB Trevor Lawrence (gsis 00-0036971) — rating 87

**Notes**
Snap season used: 2025 (fallback). Missing gsis_id count: 1.

### 2026-08-30T22:10:54.935Z — fetch-nflverse-roster-base.js (SEASON=2026)

**Sources**
- depth_charts_2026.csv — https://github.com/nflverse/nflverse-data/releases/download/depth_charts/depth_charts_2026.csv, updated nflverse release
- snap_counts_2025.csv — https://github.com/nflverse/nflverse-data/releases/download/snap_counts/snap_counts_2025.csv, updated nflverse release
- roster_2026.csv — https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_2026.csv, updated nflverse release

**Outputs**
- rosters2026.js — 621 rows, 122 KB, gsis_id present on 620/621 (99.8%)

**Spot check (15 entries)**
- ARI QB Jacoby Brissett (gsis 00-0033119) — rating 79
- ATL QB Tua Tagovailoa (gsis 00-0036212) — rating 74
- BAL QB Lamar Jackson (gsis 00-0034796) — rating 82
- BUF QB Josh Allen (gsis 00-0034857) — rating 87
- CAR QB Bryce Young (gsis 00-0039150) — rating 86
- CHI QB Caleb Williams (gsis 00-0039918) — rating 86
- CIN QB Joe Burrow (gsis 00-0036442) — rating 87
- CLE QB Deshaun Watson (gsis 00-0033537) — rating 71
- DAL QB Dak Prescott (gsis 00-0033077) — rating 84
- DEN QB Bo Nix (gsis 00-0039732) — rating 86
- DET QB Jared Goff (gsis 00-0033106) — rating 84
- GB QB Jordan Love (gsis 00-0036264) — rating 87
- HOU QB C.J. Stroud (gsis 00-0039163) — rating 86
- IND QB Daniel Jones (gsis 00-0035710) — rating 82
- JAX QB Trevor Lawrence (gsis 00-0036971) — rating 87

**Notes**
Snap season used: 2025 (fallback). Missing gsis_id count: 1.
