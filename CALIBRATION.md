# DFOS · CALIBRATION

**Weekly projected against actual points: one row per player-week the board scored, aggregated by position and by adjustment.**

All times are Coordinated Universal Time (UTC). Positions: quarterback (QB), running back (RB), wide receiver (WR) and tight end (TE).

| | |
|---|---|
| Generated | 2026-11-11T06:11:41.099Z |
| Weekly board generated | 2026-11-11T06:11:29.365Z |
| Player board generated | 2026-11-11T06:10:53.496Z |
| Actuals source | `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2026.csv.gz` |
| Actuals generated | 2026-11-11T06:08:15.106Z |
| Weeks covered | 1, 2, 3, 4, 5, 6, 7, 8, 9 |
| Headline weeks (snapshot written before kickoff) | 3, 4, 5, 6, 7, 8, 9 |
| Weeks written after kickoff (shown apart) | 1, 2 |
| Weeks partial (not graded) | none |
| Projections graded | frozen pre-kickoff snapshots, `src/data/intelligence/weekly_projections/` (E-052) |
| Actual points | `fantasy_points_graded`, scored under the board's own rules (`full_ppr`) |
| Matched pairs | 2633 (headline 1995, written after kickoff 638) |

Emitted by `scripts/build-calibration.js` (E-032, 2026-09-17; E-052, 2026-10-10; scoring and headline change 2026-11-07). `projected` is the week's frozen pre-kickoff snapshot `weekly_value`, graded with the model named in that snapshot's header (weeks 1 to 7: E-004 v1 (pre-2026-10-10), the board generated 2026-09-18; week 8: E-034 v2 (2026-10-10), the board generated 2026-10-27; week 9: E-034 v2 (2026-10-10), the board generated 2026-11-03; week 10: E-034 v2 (2026-10-10), the board generated 2026-11-10; the first pre-kickoff freeze from E-034 v2 (base + env, no matchup term, floored at 0) is week 8). `actual` is `fantasy_points_graded`: the nflverse box score scored under the rules the projection is built under, with no interception, fumble, two-point or return term. `error` is actual minus projected, so a positive error means the board under-projected. Only complete weeks are graded. The headline tables below use only weeks whose snapshot was written before kickoff.

## Snapshots graded

| Week | Written (UTC) | First kickoff (UTC) | Before kickoff | In headline | Model |
|---|---|---|---|---|---|
| 1 | 2026-09-18T01:36:59.740Z | 2026-09-10T00:20:00.000Z | no (post-kickoff: 16 games) | no, shown apart | E-004 v1 (pre-2026-10-10) |
| 2 | 2026-09-18T01:36:59.740Z | 2026-09-18T00:15:00.000Z | no (post-kickoff: 1 game) | no, shown apart | E-004 v1 (pre-2026-10-10) |
| 3 | 2026-09-18T01:36:59.740Z | 2026-09-25T00:15:00.000Z | yes | yes | E-004 v1 (pre-2026-10-10) |
| 4 | 2026-09-18T01:36:59.740Z | 2026-10-02T00:15:00.000Z | yes | yes | E-004 v1 (pre-2026-10-10) |
| 5 | 2026-09-18T01:36:59.740Z | 2026-10-09T00:15:00.000Z | yes | yes | E-004 v1 (pre-2026-10-10) |
| 6 | 2026-09-18T01:36:59.740Z | 2026-10-16T00:15:00.000Z | yes | yes | E-004 v1 (pre-2026-10-10) |
| 7 | 2026-09-18T01:36:59.740Z | 2026-10-23T00:15:00.000Z | yes | yes | E-004 v1 (pre-2026-10-10) |
| 8 | 2026-10-27T07:36:53.659Z | 2026-10-30T00:15:00.000Z | yes | yes | E-034 v2 (2026-10-10) |
| 9 | 2026-11-03T12:25:36.510Z | 2026-11-06T01:15:00.000Z | yes | yes | E-034 v2 (2026-10-10) |
| 10 | 2026-11-10T18:34:27.716Z | 2026-11-13T01:15:00.000Z | yes | not graded yet | E-034 v2 (2026-10-10) |

## Headline: weeks 3 to 9

| N | Mean error | Mean absolute error | Root mean square error |
|---|---|---|---|
| 1995 | 0.67 | 5.04 | 6.76 |

## By position (headline weeks)

| Pos | N | Mean error | Mean absolute error | Root mean square error |
|---|---|---|---|---|
| QB | 219 | 0.29 | 6.49 | 7.95 |
| RB | 505 | 0.78 | 5.21 | 7.09 |
| WR | 823 | 0.86 | 5.07 | 6.82 |
| TE | 448 | 0.35 | 4.1 | 5.54 |

## Written after kickoff: weeks 1 and 2 (not in the headline)

These snapshots were seeded after the week had kicked off, so they are not a fair pre-kickoff test. They stay graded row by row and are kept out of every headline table.

| Pos | N | Mean error | Mean absolute error | Root mean square error |
|---|---|---|---|---|
| All | 638 | 0.29 | 5.34 | 6.99 |
| QB | 72 | 0.92 | 7.21 | 8.75 |
| RB | 158 | -0.18 | 4.91 | 6.56 |
| WR | 270 | 0.43 | 5.64 | 7.25 |
| TE | 138 | 0.23 | 4.27 | 5.79 |

## Per adjustment: fired against not fired (headline weeks)

If an adjustment adds signal, the fired mean error should sit closer to 0 than the not-fired mean error. If both are similar, the adjustment is not moving the needle. If the fired mean error is worse, the adjustment is hurting.

| Adjustment | Fired N | Fired mean error | Fired mean absolute error | Not-fired N | Not-fired mean error | Not-fired mean absolute error |
|---|---|---|---|---|---|---|
| matchup | 1450 | 0.81 | 5.12 | 545 | 0.29 | 4.84 |
| dome_home | 176 | 0.1 | 4.99 | 1819 | 0.72 | 5.05 |
| short_week | 133 | 2.15 | 5.08 | 1862 | 0.56 | 5.04 |
| bye_return | 136 | -0.22 | 5.1 | 1859 | 0.73 | 5.04 |
| tz_travel | 177 | 1.58 | 5.18 | 1818 | 0.58 | 5.03 |

**The ±4 matchup cap:** if the fired mean error and mean absolute error are close to the not-fired ones, the cap is not buying signal. If the fired mean absolute error is materially smaller (about 2 points), it is.

## Top 20 misses, headline weeks (largest absolute error)

| Player | Pos | Team | Wk | Opp | Projected | Actual | Error | Rationale |
|---|---|---|---|---|---|---|---|---|
| CeeDee Lamb | WR | DAL | 4 | HOU | 11.44 | 41.3 | +29.86 | HOU allows 25.7 WR fpts/g (median 31.1) -4.00 |
| Tyler Allgeier | RB | ARI | 8 | DAL | 7.24 | 36.1 | +28.86 | base pace, no context adjustments fired |
| Tetairoa McMillan | WR | CAR | 4 | DET | 16.55 | 45.2 | +28.65 | DET allows 35.7 WR fpts/g (median 31.1) +4.00 |
| Matthew Golden | WR | GB | 9 | NE | 4.65 | 32.4 | +27.75 | base pace, no context adjustments fired |
| Joe Burrow | QB | CIN | 8 | TEN | 18.06 | 45.48 | +27.42 | base pace, no context adjustments fired |
| Tony Pollard | RB | TEN | 7 | CLE | 11.18 | 36.5 | +25.32 | CLE allows 22.1 RB fpts/g (median 22.2) -0.10 |
| Emanuel Wilson | RB | SEA | 4 | LAC | 1.94 | 27 | +25.06 | LAC allows 18.7 RB fpts/g (median 22.2) -3.50 |
| Jaylen Warren | RB | PIT | 5 | IND | 11.77 | 36.8 | +25.03 | IND allows 20.4 RB fpts/g (median 22.2) -1.80 |
| Kenneth Walker III | RB | KC | 9 | NYJ | 11.29 | 36.3 | +25.01 | base pace, no context adjustments fired |
| Isaiah Likely | TE | NYG | 5 | WAS | 7.51 | 32.4 | +24.89 | WAS allows 15.8 TE fpts/g (median 13.6) +2.20 |
| Parker Washington | WR | JAX | 5 | PHI | 5.96 | 30.4 | +24.44 | PHI allows 26.6 WR fpts/g (median 31.1) -4.00 · 5h TZ delta -0.83 |
| Tee Higgins | WR | CIN | 8 | TEN | 13.97 | 37.5 | +23.53 | base pace, no context adjustments fired |
| Brian Robinson | RB | ATL | 4 | NO | 2.38 | 25.7 | +23.32 | NO allows 20.9 RB fpts/g (median 22.2) -1.30 |
| Bhayshul Tuten | RB | JAX | 8 | IND | 6.84 | 29.9 | +23.06 | coming off bye +0.80 |
| Bhayshul Tuten | RB | JAX | 6 | HOU | 2.71 | 24.7 | +21.99 | HOU allows 19.7 RB fpts/g (median 22.2) -2.50 · 5h TZ delta -0.83 |
| Germie Bernard | WR | PIT | 6 | TB | 3.95 | 25.7 | +21.75 | TB allows 31.6 WR fpts/g (median 31.1) +0.50 |
| Adonai Mitchell | WR | NYJ | 8 | LV | 5.64 | 27.2 | +21.56 | base pace, no context adjustments fired |
| Kalif Raymond | WR | CHI | 3 | PHI | -0.07 | 21 | +21.07 | PHI allows 26.6 WR fpts/g (median 31.1) -4.00 |
| Tre Tucker | WR | LV | 6 | BUF | 5.71 | 26.7 | +20.99 | BUF allows 26.5 WR fpts/g (median 31.1) -4.00 · dome home +0.50 |
| Konata Mumpfield | WR | LAR | 3 | DEN | -1.48 | 19.3 | +20.78 | DEN allows 27.0 WR fpts/g (median 31.1) -4.00 |

## Note, 2026-11-07: grading moved to the board's own scoring

Until 2026-11-07 `actual` was nflverse's `fantasy_points_ppr`. That column takes 2 points off per interception and per fumble lost and adds 2 per two-point conversion and 6 per special teams touchdown. The projection is built without any of those terms, so the two sides of each row were scored by different rules. From 2026-11-07 `actual` is `fantasy_points_graded`, scored under the board's rules (`full_ppr`), and the headline leaves out weeks 1 and 2, whose snapshots were written after kickoff. Nothing in the projection changed. 228 of 2353 graded rows in weeks 1 to 8 had a different actual that day.

Old is nflverse's points; new is the board's rules. These figures were frozen on 2026-11-07, when the change landed, and later stat corrections from nflverse do not move them. The same figures recomputed from today's rows are in `calibration_2026.json` under `scoring_change_2026_11_07.live_recompute`; today none of them differ from the frozen ones.

| Week | N | Old mean error | New mean error | Old mean absolute error | New mean absolute error | QB old mean error | QB new mean error | In new headline |
|---|---|---|---|---|---|---|---|---|
| 1 | 316 | +0.35 | +0.6 | 5.52 | 5.52 | +0.23 | +1.89 | no |
| 2 | 322 | -0.16 | 0 | 5.22 | 5.16 | -1.08 | 0 | no |
| 3 | 316 | +0.59 | +0.75 | 5.07 | 5.04 | -0.4 | +1.35 | yes |
| 4 | 310 | +0.97 | +1.12 | 5.24 | 5.2 | -1.44 | -0.09 | yes |
| 5 | 296 | +0.53 | +0.71 | 5.37 | 5.37 | +0.33 | +1.36 | yes |
| 6 | 273 | +0.61 | +0.77 | 5.12 | 5.09 | -0.42 | +0.81 | yes |
| 7 | 255 | +0.54 | +0.67 | 4.88 | 4.85 | -0.33 | +0.64 | yes |
| 8 | 265 | +0.14 | +0.33 | 5.05 | 5.01 | -2.32 | -0.99 | yes |

| Headline | Weeks | N | Mean error | Mean absolute error | QB N | QB mean error | QB mean absolute error |
|---|---|---|---|---|---|---|---|
| Old: nflverse points, every week | 1, 2, 3, 4, 5, 6, 7, 8 | 2353 | +0.44 | 5.19 | 256 | -0.69 | 6.82 |
| Board's rules, same weeks | 1, 2, 3, 4, 5, 6, 7, 8 | 2353 | +0.62 | 5.16 | 256 | +0.62 | 6.54 |
| New: board's rules, written before kickoff | 3, 4, 5, 6, 7, 8 | 1715 | +0.74 | 5.1 | 184 | +0.5 | 6.28 |

**The quarterback read flips.** On nflverse's points the board read as over-projecting quarterbacks (mean error -0.69). On the board's own rules it under-projects them (+0.62 over the same weeks, +0.5 in the new headline). The shift is nflverse's interception and fumble penalties, net of its two-point and return points; the projection counts none of them.

---

*Regenerated on every build of `data:calibration`. E-032 (2026-09-17).*
