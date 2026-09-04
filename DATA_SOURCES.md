# Data Sources — DownfieldOS

_This file exists to satisfy the attribution conditions on the data sources
DownfieldOS uses. Every source that requires attribution is listed here._

---

## nflverse

**License:** Creative Commons Attribution 4.0 International (**CC BY 4.0**).
Full text: <https://creativecommons.org/licenses/by/4.0/legalcode>.

**Creator:** The nflverse project maintainers and contributors.
<https://github.com/nflverse>.

**Copyright:** © nflverse contributors. Licensed under CC BY 4.0.

**Notice of warranties:** The nflverse data is provided "AS-IS" without
warranties of any kind. See §5 of the license text for the full disclaimer.

**Material used:** DownfieldOS ingests the following nflverse releases,
consumed as-is or after transformation described below:

| Release | URI |
|---|---|
| Play-by-play | <https://github.com/nflverse/nflverse-data/releases/tag/pbp> |
| Weekly rosters | <https://github.com/nflverse/nflverse-data/releases/tag/weekly_rosters> |
| Season rosters | <https://github.com/nflverse/nflverse-data/releases/tag/rosters> |
| Depth charts | <https://github.com/nflverse/nflverse-data/releases/tag/depth_charts> |
| Snap counts | <https://github.com/nflverse/nflverse-data/releases/tag/snap_counts> |
| Player stats | <https://github.com/nflverse/nflverse-data/releases/tag/player_stats> |
| Schedules | <https://github.com/nflverse/nflverse-data/releases/tag/schedules> |
| Injuries | <https://github.com/nflverse/nflverse-data/releases/tag/injuries> |
| Trades | <https://github.com/nflverse/nflverse-data/releases/tag/trades> |
| Contracts | <https://github.com/nflverse/nflverse-data/releases/tag/contracts> |
| Officials | <https://github.com/nflverse/nflverse-data/releases/tag/officials> |

**Modification notice (§3(a)(1)(b)):** The nflverse data has been modified in
DownfieldOS as follows. Modifications happen in the scripts listed and are
also recorded per-field in the built artifacts via `*_source` labels.

| Modification | Where |
|---|---|
| REG-only filtering of play-by-play (removes postseason bleed) | `scripts/pbp/process_pbp.py` |
| Aggregation of per-play stats to per-team scheme profiles | `scripts/pbp/process_pbp.py`, `scripts/build-defense.js` |
| Aggregation of per-week weekly-roster snapshots to derived weekly transactions | `scripts/build-weekly-transactions.js` |
| Aggregation of per-week player_stats to season totals | `scripts/build-history-and-durability.js` |
| Snap-share join from `snap_counts` (offense_pct) via `pfr_player_id ↔ gsis_id` | `scripts/pbp/process_pbp.py` `load_snap_shares()` |
| Team code normalization (`LA → LAR`, `OAK → LV`, `STL → LAR`, `SD → LAC`, `WSH → WAS`, `AZ → ARI`) | Every fetch script; see the `NORM_TEAM` object |
| Composite `rank_pass_def_overall` and `rank_rush_def_overall` indices | `scripts/build-defense.js` |
| Full-PPR / half-PPR / standard / TE-premium fantasy point derivation | `scripts/build-player-board.js` |

**Attribution surface:** Site footer credits nflverse and links here. This
file is public in the repository at `DATA_SOURCES.md`.

---

## Sleeper (players + availability, currently `search_rank` for the ADP proxy)

**Status:** free personal use per Sleeper's API documentation; commercial use
by conversation with Sleeper. DownfieldOS is currently a free MVP and no paid
tier exists. If a paid surface is introduced, contact Sleeper for commercial
licensing before shipping.

**Attribution recommended, not required today.** Board rows label the field
honestly as `adp_source: "sleeper_search_rank"`.

---

## ESPN (news headlines feed, `scripts/fetch-team-news.js`)

**Field reduction 2026-09-05:** the fetch script keeps only link, published
timestamp, type, and category labels. Verbatim `headline` and `description`
are no longer collected or stored. Previously-stored expression has been
purged from `src/data/intelligence/team_news_raw.json`.

**Constraint acknowledged:** Disney Terms of Use §2.B.x bars automated
access to Disney Products; §2.B.viii and §3.G bar commercial use. The
site does not display ESPN's expression. Downstream surfaces render
category labels + link only.

---

## Football Zebras (referee crew rosters, `intelligence/referee_profiles.json`)

**Source:** <https://footballzebras.com>. Content ingested and reformatted;
not republished verbatim.

---

## Editorial data (hand-curated by DownfieldOS)

**Not third-party:** `contract_year_players.json`, `dna2026.js`,
`faMoves2026.js`, `draftProspects2026.json`, hand-curated fan sentiment
rows (currently CAR / CLE / NYG), coordinator-change map in
`build-player-board.js`. Attribution to DownfieldOS.
