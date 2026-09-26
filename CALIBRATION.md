# DFOS · CALIBRATION

**Weekly projected vs actual — one row per player-week the board scored, aggregated per adjustment.**

| | |
|---|---|
| Generated | 2026-09-26T09:21:04.173Z |
| Weekly board generated | 2026-09-18T01:36:59.740Z |
| Player board generated | 2026-09-26T09:21:03.636Z |
| Actuals source | `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2026.csv.gz` |
| Actuals generated | 2026-09-23T11:56:07.256Z |
| Weeks covered | 1, 2 |
| Matched pairs | 638 |

Emitted by `scripts/build-calibration.js` (E-032, 2026-09-17). Written from draft-copilot in-season ask: "nothing records outcomes". `projected` = `WEEKLY_BOARD_2026.weekly_value` (base + matchup + env). `actual` = `fantasy_points_ppr` from nflverse. `error` = actual - projected. Positive error means the board under-projected.

## Overall

| N | Mean error | Mean \|error\| | RMSE |
|---|---|---|---|
| 638 | 0.09 | 5.37 | 7.03 |

## By position

| Pos | N | Mean error | Mean \|error\| | RMSE |
|---|---|---|---|---|
| QB | 72 | -0.44 | 7.42 | 9.01 |
| RB | 158 | -0.31 | 4.91 | 6.58 |
| WR | 270 | 0.41 | 5.64 | 7.27 |
| TE | 138 | 0.22 | 4.29 | 5.8 |

## Per-adjustment: fired vs not fired

If an adjustment adds signal, fired-mean-error should be closer to 0 than not-fired-mean-error. If both are similar, the adjustment isn't moving the needle. If fired-mean-error is worse, the adjustment is hurting.

| Adjustment | Fired N | Fired mean err | Fired \|err\| | Not-fired N | Not-fired mean err | Not-fired \|err\| |
|---|---|---|---|---|---|---|
| matchup | 638 | 0.09 | 5.37 | 0 | — | — |
| dome_home | 82 | -0.28 | 5.29 | 556 | 0.15 | 5.38 |
| short_week | 22 | 3.2 | 6.21 | 616 | -0.02 | 5.34 |
| bye_return | 0 | — | — | 638 | 0.09 | 5.37 |
| tz_travel | 53 | -2.09 | 5.28 | 585 | 0.29 | 5.38 |

**The ±4 matchup cap:** if fired-mean-error and fired-|err| are close to not-fired, the cap isn't buying us signal. If fired-|err| is materially smaller (e.g. ~2 point improvement), it is. First-week sample is small — trend needs weeks 2+ to be decisive.

## Top 20 misses (largest |error|) — the copilot's Caleb + Stafford should be here

| Player | Pos | Team | Wk | Opp | Projected | Actual | Error | Rationale |
|---|---|---|---|---|---|---|---|---|
| Kenneth Walker III | RB | KC | 1 | DEN | 7.29 | 34.1 | +26.81 | DEN allows 17.2 RB fpts/g (median 22.2) -4.00 |
| Isaiah Likely | TE | NYG | 1 | DAL | 3.91 | 27.8 | +23.89 | DAL allows 12.2 TE fpts/g (median 13.6) -1.40 |
| Christian Watson | WR | GB | 1 | MIN | 9.21 | 32.7 | +23.49 | MIN allows 23.8 WR fpts/g (median 31.1) -4.00 |
| Jaxon Smith-Njigba | WR | SEA | 2 | ARI | 20.18 | 42.5 | +22.32 | ARI allows 30.2 WR fpts/g (median 31.1) -0.90 |
| Jalen Coker | WR | CAR | 1 | CHI | 11.92 | 33.8 | +21.88 | CHI allows 34.8 WR fpts/g (median 31.1) +3.70 |
| Amon-Ra St. Brown | WR | DET | 2 | BUF | 14.01 | 35.2 | +21.19 | BUF allows 26.5 WR fpts/g (median 31.1) -4.00 · short week (Thu after Sun) -1.00 |
| Rashod Bateman | WR | BAL | 2 | NO | 0.71 | 21.8 | +21.09 | NO allows 27.7 WR fpts/g (median 31.1) -3.40 |
| Davante Adams | WR | LAR | 2 | NYG | 18.42 | 39.5 | +21.08 | NYG allows 33.1 WR fpts/g (median 31.1) +2.00 · dome home +0.50 |
| Drew Lock | QB | SEA | 2 | ARI | 0.63 | 21.4 | +20.77 | ARI allows 18.5 QB fpts/g (median 17.9) +0.60 |
| Caleb Williams | QB | CHI | 1 | CAR | 16.67 | 37.26 | +20.59 | CAR allows 15.6 QB fpts/g (median 17.9) -2.30 |
| Derrick Henry | RB | BAL | 1 | IND | 14.99 | 35.3 | +20.31 | IND allows 20.4 RB fpts/g (median 22.2) -1.80 |
| Justin Jefferson | WR | MIN | 1 | GB | 12.31 | 31.2 | +18.89 | dome home +0.50 |
| Cody White | WR | LV | 2 | LAC | -1.75 | 16.4 | +18.15 | LAC allows 26.9 WR fpts/g (median 31.1) -4.00 |
| Tre Tucker | WR | LV | 2 | LAC | 5.21 | 22.9 | +17.69 | LAC allows 26.9 WR fpts/g (median 31.1) -4.00 |
| Ja'Marr Chase | WR | CIN | 1 | TB | 20.14 | 3.2 | -16.94 | TB allows 31.6 WR fpts/g (median 31.1) +0.50 |
| Josh Allen | QB | BUF | 2 | DET | 24.39 | 40.82 | +16.43 | DET allows 19.0 QB fpts/g (median 17.9) +1.10 · short week (Thu after Sun) -1.00 |
| David Montgomery | RB | HOU | 1 | BUF | 12.48 | 28.9 | +16.42 | BUF allows 24.6 RB fpts/g (median 22.2) +2.40 · dome home +0.50 |
| Kalif Raymond | WR | CHI | 1 | CAR | 0.03 | 16.4 | +16.37 | CAR allows 27.2 WR fpts/g (median 31.1) -3.90 |
| Drake Maye | QB | NE | 2 | PIT | 23.99 | 8.02 | -15.97 | PIT allows 20.2 QB fpts/g (median 17.9) +2.30 |
| CeeDee Lamb | WR | DAL | 2 | WAS | 19.34 | 35.3 | +15.96 | WAS allows 35.0 WR fpts/g (median 31.1) +3.90 |

---

*Regenerated on every build of `data:calibration`. E-032 (2026-09-17).*
