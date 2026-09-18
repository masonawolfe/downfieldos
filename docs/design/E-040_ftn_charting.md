# E-040 · FTN charting ingest — DESIGN ONLY

**Written on main after peer QA 2026-09-18 08:30 CT dispatch. Do not ingest until counsel clears the FTN share-alike licence — CoS has asked counsel.**

## What FTN is

Football Team Network publishes free play-by-play charting for the 2026 NFL season, meaningfully deeper than the nflverse PBP we already pull. Fields the peer's report flagged as relevant:

- **Coverage classification per pass** — single-high, quarters, cover-3, cover-6, tampa-2, man-under, man-over, etc. Grouped by team-and-season, this is the missing scheme variable behind the "opp is bad vs QBs" league-average signal the copilot's Week-1 report tore into.
- **Pressure signals** — pressure rate (blitz, sim-pressure, four-man), time-to-pressure, hurry rate, sack rate under pressure. Separates DEs vs. specific-scheme pressure teams.
- **Route type per receiver** — hitch, out, dig, post, corner, slot fade, etc. Per-week + per-opponent. Feeds every WR analysis today grades at "targets and receptions".
- **QB positioning** — under-center vs. shotgun, pocket location, scramble drill, RPO tag.
- **Personnel groupings** — 11 / 12 / 21 / 13 personnel per play, offense and defense.

## The licence

**FTN publishes charting under CC-BY-SA 4.0** (Creative Commons Attribution-ShareAlike 4.0 International). Two conditions bind our re-use:

1. **BY (Attribution).** Any derivative that reaches a user must credit FTN by name, link to the FTN charting page, and link to CC-BY-SA 4.0.
2. **SA (ShareAlike).** Any derivative work we distribute publicly must itself be licensed CC-BY-SA 4.0.

**The share-alike clause is the counsel question.** DFOS's default is proprietary; FTN-derived fields carried into `playerBoard2026.js` would virally require the whole board to be CC-BY-SA-licensed if the board is a "derivative work" under the definition. Counsel needs to say (a) is the board a derivative; (b) if yes, is CC-BY-SA on the board an acceptable ceiling for us commercially. **Do not ingest until that answer is yes.**

Provisional attribution string, once cleared:

> Charting fields (coverage, pressure, route type) © Football Team Network. Licensed under [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Modified to key on nflverse `gsis_id` and to aggregate at the team-and-season level; see `docs/attribution/ftn.md`.

## Proposed shape — what would ship

Two new files under `src/data/intelligence/`:

- **`ftn_team_2026.json`** — one row per team-and-season with:
  ```
  {
    team: 'CAR', season: 2026,
    coverage_rates: { single_high: 0.31, quarters: 0.14, cover_3: 0.22, cover_6: 0.08, tampa_2: 0.05, man: 0.19, other: 0.01 },
    pressure_rate: 0.24, blitz_rate: 0.28, time_to_pressure_avg: 2.61,
    personnel_off: { p11: 0.61, p12: 0.24, p21: 0.09, p13: 0.06 },
    personnel_def: { nickel: 0.68, dime: 0.14, base: 0.15, other: 0.03 },
    generated_utc, source_urls: [...],
  }
  ```
- **`ftn_receiver_routes_2026.json`** — one row per (gsis_id, week) with:
  ```
  { gsis_id, name, team, week, route_mix: {hitch: 0.18, out: 0.14, ...}, target_share_by_route: {...} }
  ```

Both files carry `meta.source_url`, `meta.license`, `meta.attribution` verbatim from the string above.

## How FTN feeds E-033 (per-opponent player history)

E-033 today blends `own_history_avg` against league-average `opp_fpts_allowed_to_pos`. FTN lets us upgrade the "opp" side from *"how many QB points did they allow"* to *"how did they defend this player's route mix"*:

- **Coverage match term.** If a WR has a target_share of 0.35 vs man and 0.12 vs zone (from `ftn_receiver_routes_2026.json`), and the opponent plays man 0.55 of snaps (from `ftn_team_2026.json`), the matchup grade adjusts by the weighted delta from league norm. A WR who thrives vs man against a defense that leans man: bigger positive term. A WR who fades vs zone against a defense that leans zone: bigger negative term.
- **Pressure-adjusted QB matchups.** Today's QB matchup = points allowed. With FTN, a QB with a slow release (deep depth-of-target average) facing a defense with a high `pressure_rate` gets a negative modifier. Feeds `weekly_value` more precisely than the ±4 defensive-points cap allows.
- **Personnel-consistency signal.** If a team runs 12-personnel 45% of snaps and the opponent stacks against 12 (heavy box, base defense), the RB1 gets a target adjustment on top of the raw matchup.

Shape on 3 players (illustrative, would be real once ingested):

| Player | vs opp | FTN coverage-match delta | Old matchup grade | New matchup grade with FTN |
|---|---|---|---|---|
| Ja'Marr Chase | CLE (heavy zone) | Chase target_share_zone = 0.42 > league 0.31 = +0.15 term | −1.20 (CLE fpts to WR) | −1.20 + 0.15 × ±2 = −0.90 (matchup softened by scheme-fit) |
| Josh Allen | MIN (Flores blitz-heavy, 0.34 blitz_rate) | Allen holds ball 2.9s avg (long) → pressure exposure high | +0.40 (MIN allows QB fpts near median) | +0.40 − (pressure_delta 0.10 × 2) = +0.20 |
| Isiah Pacheco | KC's own 12-personnel share 0.28 vs LV base defense 0.42 | 12-vs-base gets him more carries in weight → +0.20 term | +0.60 (LV soft vs RB) | +0.80 |

**Meaningfully smaller cap than ±4 needed once FTN is in.** Today's ±4 exists to guard against noise in a league-average signal. FTN gives real player-vs-defense fit; the aggregate error should drop and the cap can tighten to ±2.5 or ±3.

## Ingest cost (once counsel clears)

- **Two new `scripts/fetch-ftn-*` scripts** (mirroring the nflverse fetch pattern), pulling from FTN's published URLs (once we know their release cadence — weekly during season).
- **One new workflow `data-ftn-v2.yml`**, on Tuesday overnight (right after weekly-actuals). Adds ~10 KB to the nightly cadence.
- **Modify `computeWeeklyValue`** in `scripts/build-weekly-board.js` to consume the new team + receiver files. Additive, keeps existing terms.
- **Attribution page** at `docs/attribution/ftn.md`, linked from the site footer once ingested (site copy: "Powered by [FTN charting]. Licensed under CC-BY-SA.").
- **License page** at repo root `LICENSE-FTN.md` if the board itself becomes CC-BY-SA per counsel.

## Cost of NOT shipping

The copilot's Week 1 miss (Caleb 37.26 vs 16.67 projection) is exactly the class FTN closes. The current model can't see that CAR ran soft zone all game while Caleb thrived against zone in 2025. Until FTN or an equivalent lands, the matchup adjustment will keep firing on the wrong signal.

## Decision gate

**Do not ingest.** Wait for:

1. Counsel confirms whether the board is a "derivative work" under CC-BY-SA 4.0.
2. If yes: Mason confirms he is fine with the board carrying CC-BY-SA (or the FTN fields ship as a separately-licensed sidecar file the site fetches at runtime, not bundled into the board — an intermediate the licence may or may not require).
3. If both cleared: this design page moves from `docs/design/` into an implementation ticket, and shipping proceeds behind a feature flag so we can pull it if the licence stance shifts.

Filed on main (not the E-033/E-034 design branch) because this one belongs to counsel first, engineering second.
