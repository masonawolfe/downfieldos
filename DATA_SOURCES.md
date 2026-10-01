# Data Sources — DownfieldOS

_This file exists to satisfy the attribution conditions on the data sources
DownfieldOS uses. Every source that requires attribution is listed here._

**This file is machine-checked.** `scripts/check-data-sources.mjs` extracts
every external host that appears in `src/data/`, `scripts/` and
`public/data/` and fails the build if one is not declared below. Adding a
new source without declaring it here breaks CI. Counsel C-012 (2026-10-01)
found fourteen undeclared domains; the check exists so that cannot recur.

---

## External host registry

Every external domain referenced by the shipped data or the fetch scripts,
what is taken from it, and where it lands. Attribution obligations, where
they exist, are detailed in the per-source sections below.

| Host | What is taken | Where it lands | Attribution |
|---|---|---|---|
| `github.com` (nflverse releases) | pbp, rosters, depth charts, snap counts, player stats, schedules, injuries, trades, contracts, officials | most of `src/data/` | **CC BY 4.0 — required** |
| `en.wikipedia.org` | coach career/lineage facts, 75 cited URLs | `coachingTrees.js` (`hc_source`, `oc_source`, `dc_source`, `trees_source`, `style_source`) | **CC BY-SA 4.0 — required** |
| `sleeper.app`, `api.sleeper.app` | player records, injury status + game designation, `search_rank` (ADP proxy) | `intelligence/availability_2026.json`, `playerBoard2026.js` | recommended, labelled in-row |
| `espn.com`, `site.web.api.espn.com` | team news: link, published timestamp, type, category labels only | `intelligence/team_news_raw.json` | no expression stored — see ESPN section |
| `footballzebras.com` | 2026 referee crew rosters, preseason assignments | `intelligence/referee_profiles.json` | reformatted, not republished |
| `nflpenalties.com` | crew-level penalty rate aggregates (2025 REG) | `intelligence/referee_profiles.json` | aggregate figures only |
| `sharpfootballanalysis.com` | crew penalty tendency aggregates | `intelligence/referee_profiles.json` | aggregate figures only |
| `cbssports.com` | referee assignment / crew corroboration | `intelligence/referee_profiles.json` | corroboration only |
| `nfl.com` (incl. `nfl.com/operations`) | officiating rosters, transaction and contract corroboration | `intelligence/referee_profiles.json`, `contract_year_players.json`, `weekly_transactions_*.json` | facts only |
| Yahoo Sports (cited as prose, no URL stored) | referee crew corroboration | `intelligence/referee_profiles.json` `metadata.source` | corroboration only |
| 13 NFL team official sites — see list below | coaching staff names + titles | `coachingTrees.js` per-role `*_source` | factual staff listings |

**NFL team official sites cited in `coachingTrees.js`:** `azcardinals.com`,
`baltimoreravens.com`, `buccaneers.com`, `buffalobills.com`, `chargers.com`,
`chicagobears.com`, `clevelandbrowns.com`, `dallascowboys.com`,
`detroitlions.com`, `giants.com`, `jaguars.com`, `packers.com`,
`panthers.com`.

What is taken from a team site is a **fact** — who holds a coaching title on
a given date. Facts are not copyrightable. No team-site prose, layout, or
imagery is copied. Each row records the URL it was verified against and the
date, so a reader can check the claim at its source.

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

### Schedule source of record (E-047, 2026-09-29)

nflverse publishes the same schedule through two paths, and they are not
the same artifact:

| Path | URL |
|---|---|
| **Source of record** | `https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv` |
| Not used | `https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv` |

**The release asset is the source of record.** Reasons, in order:

1. **It is what produces the file.** `scripts/fetch-schedule.js` ingests the
   release asset. A gate that graded `schedule2026.js` against the other
   path would be grading the file against a feed that did not produce it —
   any disagreement between the two paths would read as local corruption.
2. **Releases are versioned and immutable per tag.** `raw.githubusercontent`
   serves whatever is on `master` at request time, including mid-rebuild
   states. The E-045 incident (14 Week-2 `surface` values dropped to null on
   the 09-21 refresh, restored upstream within days) is exactly that class.
3. **One fetch, one grade.** `scripts/verify-schedule-upstream.mjs` reads the
   same constant. Both honour a `GAMES_URL` env override, which exists only
   so the carry-forward path can be exercised against a doctored CSV in a
   test — CI and cron always use the default above.

**Anything that audits the schedule must use the release asset.** QA's
standing 272-row upstream audit and the newsletter fact-checks were reading
`nfldata/raw/master`; on 2026-09-29 that produced a reported disagreement on
`2026_03_PHI_CHI` (`surface` blank vs `grass`). Re-fetched on 2026-09-29,
both paths agreed — 272 REG games, **0 field differences** across
week/home/away/gameday/gametime/weekday/stadium/roof/surface, 0 blank
surfaces on either. The disagreement was a transient mid-rebuild read of
`master`, which is the reason the release asset wins.

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

## Wikipedia (coach lineage + career facts, `src/data/coachingTrees.js`)

**License:** Creative Commons Attribution-ShareAlike 4.0 International
(**CC BY-SA 4.0**). Full text:
<https://creativecommons.org/licenses/by-sa/4.0/legalcode>. Human-readable
summary: <https://creativecommons.org/licenses/by-sa/4.0/>.

**Creator / credit:** Wikipedia contributors, the free encyclopedia.
Attribution is given per Wikimedia Foundation Terms of Use §7.2 (attribution
of text) via the per-row source URLs listed below, which link to the specific
article and therefore to its revision history and contributor list.

**Material used:** 75 cited article URLs in `src/data/coachingTrees.js`,
carried on the `hc_source`, `oc_source`, `dc_source`, `trees_source` and
`style_source` fields. Twenty of the 32 team rows are sourced to Wikipedia
per-team season pages; the rest to coach biography pages. Every row also
carries `*_verified_on` with the date the claim was checked.

**Notice of modification (required by CC BY-SA 4.0 §3(a)(1)(B)):** the
Wikipedia text has been modified. DownfieldOS does **not** reproduce
Wikipedia prose. What is taken is a small set of facts — a coach's name, the
title he holds, and the teams on his career path — restated in DownfieldOS's
own words and compressed to a lineage label. Specifically:

| Modification | Example |
|---|---|
| Prose biography reduced to a short lineage string | A multi-paragraph career section becomes `'Vikings assistant → Browns HC lineage (Stefanski)'` |
| Coaching-tree classification added by DownfieldOS | `trees: ['SHANAHAN']` — our taxonomy, not Wikipedia's |
| Scheme characterisations **removed** where the cited page did not state them | E-038f cut `'Cover-3 zone-heavy 4-3'` from TEN because the source said no such thing |
| Confidence qualifier added where our taxonomy has no matching entry | `tree_confidence: 'closest-available'` |

**ShareAlike scope.** The lineage strings are the only field derived from
Wikipedia text, and they are adaptations of it. They are licensed onward
under CC BY-SA 4.0. This does not extend to the rest of
`src/data/coachingTrees.js` (the coach names and titles, which are facts
verified against team official sites) or to any other DownfieldOS data file,
none of which are derived from Wikipedia.

**Attribution surface:** the Matchup Center renders the coaching-tree block
(`src/components/pages/MatchupCenter.jsx`) and carries the credit, the
licence link, and the modification note at the point of display. The site
footer links to this file.

---

## Football Zebras (referee crew rosters, `intelligence/referee_profiles.json`)

**Source:** <https://footballzebras.com>. Content ingested and reformatted;
not republished verbatim.

---

## Referee tendency aggregators (`intelligence/referee_profiles.json`)

**Sources:** `nflpenalties.com`, `sharpfootballanalysis.com`,
`cbssports.com`, `nfl.com/operations`, and Yahoo Sports (cited in
`metadata.source` as prose, no URL stored).

**Material used:** crew-level penalty-rate aggregates for the 2025 regular
season, plus corroboration of 2026 crew personnel. What is stored are
**numbers and names** — aggregate rates per crew, and who is on which crew.
No article text, table markup, or commentary is copied.

**Modification:** figures are re-aggregated to DownfieldOS's crew-level
schema and carry `tendencyDataSeason: 2025` / `personnelSeason: 2026` so a
reader can see the two halves come from different years. See
`dataQualityFlags2026` in that file for the caveats attached.

---

## Editorial data (hand-curated by DownfieldOS)

**Not third-party:** `contract_year_players.json`, `dna2026.js`,
`faMoves2026.js`, `draftProspects2026.json`, hand-curated fan sentiment
rows (currently CAR / CLE / NYG), coordinator-change map in
`build-player-board.js`. Attribution to DownfieldOS.
