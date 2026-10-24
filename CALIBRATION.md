# DFOS · CALIBRATION

**Weekly projected vs actual — one row per player-week the board scored, aggregated per adjustment.**

| | |
|---|---|
| Generated | 2026-10-24T09:03:40.701Z |
| Weekly board generated | 2026-09-18T01:36:59.740Z |
| Player board generated | 2026-10-24T09:03:40.163Z |
| Actuals source | `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2026.csv.gz` |
| Actuals generated | 2026-10-21T12:10:21.701Z |
| Weeks covered | 1, 2, 3, 4, 5, 6 |
| Matched pairs | 1833 |

Emitted by `scripts/build-calibration.js` (E-032, 2026-09-17). Written from draft-copilot in-season ask: "nothing records outcomes". `projected` = `WEEKLY_BOARD_2026.weekly_value` (base + matchup + env). `actual` = `fantasy_points_ppr` from nflverse. `error` = actual - projected. Positive error means the board under-projected.

## Overall

| N | Mean error | Mean \|error\| | RMSE |
|---|---|---|---|
| 1833 | 0.48 | 5.26 | 6.92 |

## By position

| Pos | N | Mean error | Mean \|error\| | RMSE |
|---|---|---|---|---|
| QB | 194 | -0.46 | 6.78 | 8.12 |
| RB | 459 | 0.33 | 5.24 | 7 |
| WR | 769 | 0.84 | 5.41 | 7.09 |
| TE | 411 | 0.4 | 4.27 | 5.8 |

## Per-adjustment: fired vs not fired

If an adjustment adds signal, fired-mean-error should be closer to 0 than not-fired-mean-error. If both are similar, the adjustment isn't moving the needle. If fired-mean-error is worse, the adjustment is hurting.

| Adjustment | Fired N | Fired mean err | Fired \|err\| | Not-fired N | Not-fired mean err | Not-fired \|err\| |
|---|---|---|---|---|---|---|
| matchup | 1833 | 0.48 | 5.26 | 0 | — | — |
| dome_home | 173 | 0.69 | 5.47 | 1660 | 0.45 | 5.24 |
| short_week | 101 | 2.46 | 5.58 | 1732 | 0.36 | 5.24 |
| bye_return | 19 | 4.87 | 6.73 | 1814 | 0.43 | 5.24 |
| tz_travel | 190 | 0.41 | 5.22 | 1643 | 0.48 | 5.26 |

**The ±4 matchup cap:** if fired-mean-error and fired-|err| are close to not-fired, the cap isn't buying us signal. If fired-|err| is materially smaller (e.g. ~2 point improvement), it is. First-week sample is small — trend needs weeks 2+ to be decisive.

## Top 20 misses (largest |error|) — the copilot's Caleb + Stafford should be here

| Player | Pos | Team | Wk | Opp | Projected | Actual | Error | Rationale |
|---|---|---|---|---|---|---|---|---|
| CeeDee Lamb | WR | DAL | 4 | HOU | 11.44 | 41.3 | +29.86 | HOU allows 25.7 WR fpts/g (median 31.1) -4.00 |
| Tetairoa McMillan | WR | CAR | 4 | DET | 16.55 | 45.2 | +28.65 | DET allows 35.7 WR fpts/g (median 31.1) +4.00 |
| Kenneth Walker III | RB | KC | 1 | DEN | 7.29 | 34.1 | +26.81 | DEN allows 17.2 RB fpts/g (median 22.2) -4.00 |
| Emanuel Wilson | RB | SEA | 4 | LAC | 1.94 | 27 | +25.06 | LAC allows 18.7 RB fpts/g (median 22.2) -3.50 |
| Jaylen Warren | RB | PIT | 5 | IND | 11.77 | 36.8 | +25.03 | IND allows 20.4 RB fpts/g (median 22.2) -1.80 |
| Isaiah Likely | TE | NYG | 5 | WAS | 7.51 | 32.4 | +24.89 | WAS allows 15.8 TE fpts/g (median 13.6) +2.20 |
| Parker Washington | WR | JAX | 5 | PHI | 5.96 | 30.4 | +24.44 | PHI allows 26.6 WR fpts/g (median 31.1) -4.00 · 5h TZ delta -0.83 |
| Isaiah Likely | TE | NYG | 1 | DAL | 3.91 | 27.8 | +23.89 | DAL allows 12.2 TE fpts/g (median 13.6) -1.40 |
| Christian Watson | WR | GB | 1 | MIN | 9.21 | 32.7 | +23.49 | MIN allows 23.8 WR fpts/g (median 31.1) -4.00 |
| Brian Robinson | RB | ATL | 4 | NO | 2.38 | 25.7 | +23.32 | NO allows 20.9 RB fpts/g (median 22.2) -1.30 |
| Jaxon Smith-Njigba | WR | SEA | 2 | ARI | 20.18 | 42.5 | +22.32 | ARI allows 30.2 WR fpts/g (median 31.1) -0.90 |
| Bhayshul Tuten | RB | JAX | 6 | HOU | 2.71 | 24.7 | +21.99 | HOU allows 19.7 RB fpts/g (median 22.2) -2.50 · 5h TZ delta -0.83 |
| Jalen Coker | WR | CAR | 1 | CHI | 11.92 | 33.8 | +21.88 | CHI allows 34.8 WR fpts/g (median 31.1) +3.70 |
| Germie Bernard | WR | PIT | 6 | TB | 3.95 | 25.7 | +21.75 | TB allows 31.6 WR fpts/g (median 31.1) +0.50 |
| Amon-Ra St. Brown | WR | DET | 2 | BUF | 14.01 | 35.2 | +21.19 | BUF allows 26.5 WR fpts/g (median 31.1) -4.00 · short week (Thu after Sun) -1.00 |
| Rashod Bateman | WR | BAL | 2 | NO | 0.71 | 21.8 | +21.09 | NO allows 27.7 WR fpts/g (median 31.1) -3.40 |
| Davante Adams | WR | LAR | 2 | NYG | 18.42 | 39.5 | +21.08 | NYG allows 33.1 WR fpts/g (median 31.1) +2.00 · dome home +0.50 |
| Kalif Raymond | WR | CHI | 3 | PHI | -0.07 | 21 | +21.07 | PHI allows 26.6 WR fpts/g (median 31.1) -4.00 |
| Tre Tucker | WR | LV | 6 | BUF | 5.71 | 26.7 | +20.99 | BUF allows 26.5 WR fpts/g (median 31.1) -4.00 · dome home +0.50 |
| Konata Mumpfield | WR | LAR | 3 | DEN | -1.48 | 19.3 | +20.78 | DEN allows 27.0 WR fpts/g (median 31.1) -4.00 |

---

*Regenerated on every build of `data:calibration`. E-032 (2026-09-17).*
