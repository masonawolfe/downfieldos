# DFOS · CALIBRATION

**Weekly projected vs actual — one row per player-week the board scored, aggregated per adjustment.**

| | |
|---|---|
| Generated | 2026-11-10T18:34:28.337Z |
| Weekly board generated | 2026-11-10T18:34:27.518Z |
| Player board generated | 2026-11-10T18:34:27.186Z |
| Actuals source | `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2026.csv.gz` |
| Actuals generated | 2026-11-10T18:34:15.867Z |
| Weeks covered | 1, 2, 3, 4, 5, 6, 7, 8, 9 |
| Weeks partial (not graded) | none |
| Projections graded | frozen pre-kickoff snapshots, `src/data/intelligence/weekly_projections/` (E-052) |
| Matched pairs | 2633 |

Emitted by `scripts/build-calibration.js` (E-032, 2026-09-17; E-052, 2026-10-10). `projected` = the week's frozen pre-kickoff snapshot `weekly_value`, graded with the model named in that snapshot's header (weeks 1-7: E-004 v1 (pre-2026-10-10), the board generated 2026-09-18; week 8: E-034 v2 (2026-10-10), the board generated 2026-10-27; week 9: E-034 v2 (2026-10-10), the board generated 2026-11-03; week 10: E-034 v2 (2026-10-10), the board generated 2026-11-10; the first pre-kickoff freeze from E-034 v2 (base + env, no matchup term, floored at 0) is week 8). `actual` = `fantasy_points_ppr` from nflverse. `error` = actual - projected. Positive error means the board under-projected. Only complete weeks are graded.

## Snapshots graded

| Week | Written (UTC) | First kickoff (UTC) | Before kickoff | Model |
|---|---|---|---|---|
| 1 | 2026-09-18T01:36:59.740Z | 2026-09-10T00:20:00.000Z | no (post-kickoff: 16 games) | E-004 v1 (pre-2026-10-10) |
| 2 | 2026-09-18T01:36:59.740Z | 2026-09-18T00:15:00.000Z | no (post-kickoff: 1 game) | E-004 v1 (pre-2026-10-10) |
| 3 | 2026-09-18T01:36:59.740Z | 2026-09-25T00:15:00.000Z | yes | E-004 v1 (pre-2026-10-10) |
| 4 | 2026-09-18T01:36:59.740Z | 2026-10-02T00:15:00.000Z | yes | E-004 v1 (pre-2026-10-10) |
| 5 | 2026-09-18T01:36:59.740Z | 2026-10-09T00:15:00.000Z | yes | E-004 v1 (pre-2026-10-10) |
| 6 | 2026-09-18T01:36:59.740Z | 2026-10-16T00:15:00.000Z | yes | E-004 v1 (pre-2026-10-10) |
| 7 | 2026-09-18T01:36:59.740Z | 2026-10-23T00:15:00.000Z | yes | E-004 v1 (pre-2026-10-10) |
| 8 | 2026-10-27T07:36:53.659Z | 2026-10-30T00:15:00.000Z | yes | E-034 v2 (2026-10-10) |
| 9 | 2026-11-03T12:25:36.510Z | 2026-11-06T01:15:00.000Z | yes | E-034 v2 (2026-10-10) |
| 10 | 2026-11-10T18:34:27.716Z | 2026-11-13T01:15:00.000Z | yes | E-034 v2 (2026-10-10) |

## Overall

| N | Mean error | Mean \|error\| | RMSE |
|---|---|---|---|
| 2633 | 0.39 | 5.14 | 6.86 |

## By position

| Pos | N | Mean error | Mean \|error\| | RMSE |
|---|---|---|---|---|
| QB | 291 | -0.9 | 6.98 | 8.51 |
| RB | 663 | 0.46 | 5.14 | 6.99 |
| WR | 1093 | 0.75 | 5.2 | 6.91 |
| TE | 586 | 0.3 | 4.13 | 5.59 |

## Per-adjustment: fired vs not fired

If an adjustment adds signal, fired-mean-error should be closer to 0 than not-fired-mean-error. If both are similar, the adjustment isn't moving the needle. If fired-mean-error is worse, the adjustment is hurting.

| Adjustment | Fired N | Fired mean err | Fired \|err\| | Not-fired N | Not-fired mean err | Not-fired \|err\| |
|---|---|---|---|---|---|---|
| matchup | 2088 | 0.48 | 5.21 | 545 | 0.05 | 4.88 |
| dome_home | 258 | -0.19 | 5.15 | 2375 | 0.46 | 5.14 |
| short_week | 155 | 2.2 | 5.22 | 2478 | 0.28 | 5.14 |
| bye_return | 136 | -0.38 | 5.11 | 2497 | 0.44 | 5.14 |
| tz_travel | 230 | 0.61 | 5.21 | 2403 | 0.37 | 5.14 |

**The ±4 matchup cap:** if fired-mean-error and fired-|err| are close to not-fired, the cap isn't buying us signal. If fired-|err| is materially smaller (e.g. ~2 point improvement), it is. First-week sample is small — trend needs weeks 2+ to be decisive.

## Top 20 misses (largest |error|) — the copilot's Caleb + Stafford should be here

| Player | Pos | Team | Wk | Opp | Projected | Actual | Error | Rationale |
|---|---|---|---|---|---|---|---|---|
| CeeDee Lamb | WR | DAL | 4 | HOU | 11.44 | 41.3 | +29.86 | HOU allows 25.7 WR fpts/g (median 31.1) -4.00 |
| Tyler Allgeier | RB | ARI | 8 | DAL | 7.24 | 36.1 | +28.86 | base pace, no context adjustments fired |
| Tetairoa McMillan | WR | CAR | 4 | DET | 16.55 | 45.2 | +28.65 | DET allows 35.7 WR fpts/g (median 31.1) +4.00 |
| Matthew Golden | WR | GB | 9 | NE | 4.65 | 32.4 | +27.75 | base pace, no context adjustments fired |
| Kenneth Walker III | RB | KC | 1 | DEN | 7.29 | 34.1 | +26.81 | DEN allows 17.2 RB fpts/g (median 22.2) -4.00 |
| Tony Pollard | RB | TEN | 7 | CLE | 11.18 | 36.5 | +25.32 | CLE allows 22.1 RB fpts/g (median 22.2) -0.10 |
| Emanuel Wilson | RB | SEA | 4 | LAC | 1.94 | 27 | +25.06 | LAC allows 18.7 RB fpts/g (median 22.2) -3.50 |
| Jaylen Warren | RB | PIT | 5 | IND | 11.77 | 36.8 | +25.03 | IND allows 20.4 RB fpts/g (median 22.2) -1.80 |
| Kenneth Walker III | RB | KC | 9 | NYJ | 11.29 | 36.3 | +25.01 | base pace, no context adjustments fired |
| Isaiah Likely | TE | NYG | 5 | WAS | 7.51 | 32.4 | +24.89 | WAS allows 15.8 TE fpts/g (median 13.6) +2.20 |
| Parker Washington | WR | JAX | 5 | PHI | 5.96 | 30.4 | +24.44 | PHI allows 26.6 WR fpts/g (median 31.1) -4.00 · 5h TZ delta -0.83 |
| Isaiah Likely | TE | NYG | 1 | DAL | 3.91 | 27.8 | +23.89 | DAL allows 12.2 TE fpts/g (median 13.6) -1.40 |
| Tee Higgins | WR | CIN | 8 | TEN | 13.97 | 37.5 | +23.53 | base pace, no context adjustments fired |
| Christian Watson | WR | GB | 1 | MIN | 9.21 | 32.7 | +23.49 | MIN allows 23.8 WR fpts/g (median 31.1) -4.00 |
| Brian Robinson | RB | ATL | 4 | NO | 2.38 | 25.7 | +23.32 | NO allows 20.9 RB fpts/g (median 22.2) -1.30 |
| Bhayshul Tuten | RB | JAX | 8 | IND | 6.84 | 29.9 | +23.06 | coming off bye +0.80 |
| Jaxon Smith-Njigba | WR | SEA | 2 | ARI | 20.18 | 42.5 | +22.32 | ARI allows 30.2 WR fpts/g (median 31.1) -0.90 |
| Bhayshul Tuten | RB | JAX | 6 | HOU | 2.71 | 24.7 | +21.99 | HOU allows 19.7 RB fpts/g (median 22.2) -2.50 · 5h TZ delta -0.83 |
| Jalen Coker | WR | CAR | 1 | CHI | 11.92 | 33.8 | +21.88 | CHI allows 34.8 WR fpts/g (median 31.1) +3.70 |
| Germie Bernard | WR | PIT | 6 | TB | 3.95 | 25.7 | +21.75 | TB allows 31.6 WR fpts/g (median 31.1) +0.50 |

---

*Regenerated on every build of `data:calibration`. E-032 (2026-09-17).*
