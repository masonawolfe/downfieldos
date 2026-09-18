# DFOS · CALIBRATION

**Weekly projected vs actual — one row per player-week the board scored, aggregated per adjustment.**

| | |
|---|---|
| Generated | 2026-09-18T08:58:30.515Z |
| Weekly board generated | 2026-09-18T01:36:59.740Z |
| Player board generated | 2026-09-18T08:58:30.001Z |
| Actuals source | `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2026.csv.gz` |
| Actuals generated | 2026-09-18T03:34:10.104Z |
| Weeks covered | 1 |
| Matched pairs | 316 |

Emitted by `scripts/build-calibration.js` (E-032, 2026-09-17). Written from draft-copilot in-season ask: "nothing records outcomes". `projected` = `WEEKLY_BOARD_2026.weekly_value` (base + matchup + env). `actual` = `fantasy_points_ppr` from nflverse. `error` = actual - projected. Positive error means the board under-projected.

## Overall

| N | Mean error | Mean \|error\| | RMSE |
|---|---|---|---|
| 316 | 0.35 | 5.52 | 7.26 |

## By position

| Pos | N | Mean error | Mean \|error\| | RMSE |
|---|---|---|---|---|
| QB | 35 | 0.23 | 7.09 | 8.69 |
| RB | 76 | 0.75 | 5.8 | 7.74 |
| WR | 135 | 0.19 | 5.57 | 7.18 |
| TE | 70 | 0.29 | 4.31 | 5.98 |

## Per-adjustment: fired vs not fired

If an adjustment adds signal, fired-mean-error should be closer to 0 than not-fired-mean-error. If both are similar, the adjustment isn't moving the needle. If fired-mean-error is worse, the adjustment is hurting.

| Adjustment | Fired N | Fired mean err | Fired \|err\| | Not-fired N | Not-fired mean err | Not-fired \|err\| |
|---|---|---|---|---|---|---|
| matchup | 316 | 0.35 | 5.52 | 0 | — | — |
| dome_home | 61 | -0.01 | 5.13 | 255 | 0.43 | 5.61 |
| short_week | 0 | — | — | 316 | 0.35 | 5.52 |
| bye_return | 0 | — | — | 316 | 0.35 | 5.52 |
| tz_travel | 35 | -1.11 | 4.83 | 281 | 0.53 | 5.6 |

**The ±4 matchup cap:** if fired-mean-error and fired-|err| are close to not-fired, the cap isn't buying us signal. If fired-|err| is materially smaller (e.g. ~2 point improvement), it is. First-week sample is small — trend needs weeks 2+ to be decisive.

## Top 20 misses (largest |error|) — the copilot's Caleb + Stafford should be here

| Player | Pos | Team | Wk | Opp | Projected | Actual | Error | Rationale |
|---|---|---|---|---|---|---|---|---|
| Kenneth Walker III | RB | KC | 1 | DEN | 7.29 | 34.1 | +26.81 | DEN allows 17.2 RB fpts/g (median 22.2) -4.00 |
| Isaiah Likely | TE | NYG | 1 | DAL | 3.91 | 27.8 | +23.89 | DAL allows 12.2 TE fpts/g (median 13.6) -1.40 |
| Christian Watson | WR | GB | 1 | MIN | 9.21 | 32.7 | +23.49 | MIN allows 23.8 WR fpts/g (median 31.1) -4.00 |
| Jalen Coker | WR | CAR | 1 | CHI | 11.92 | 33.8 | +21.88 | CHI allows 34.8 WR fpts/g (median 31.1) +3.70 |
| Caleb Williams | QB | CHI | 1 | CAR | 16.67 | 37.26 | +20.59 | CAR allows 15.6 QB fpts/g (median 17.9) -2.30 |
| Derrick Henry | RB | BAL | 1 | IND | 14.99 | 35.3 | +20.31 | IND allows 20.4 RB fpts/g (median 22.2) -1.80 |
| Justin Jefferson | WR | MIN | 1 | GB | 12.31 | 31.2 | +18.89 | dome home +0.50 |
| Ja'Marr Chase | WR | CIN | 1 | TB | 20.14 | 3.2 | -16.94 | TB allows 31.6 WR fpts/g (median 31.1) +0.50 |
| David Montgomery | RB | HOU | 1 | BUF | 12.48 | 28.9 | +16.42 | BUF allows 24.6 RB fpts/g (median 22.2) +2.40 · dome home +0.50 |
| Kalif Raymond | WR | CHI | 1 | CAR | 0.03 | 16.4 | +16.37 | CAR allows 27.2 WR fpts/g (median 31.1) -3.90 |
| DJ Moore | WR | BUF | 1 | HOU | 5.07 | 21 | +15.93 | HOU allows 25.7 WR fpts/g (median 31.1) -4.00 |
| Antonio Williams | WR | WAS | 1 | PHI | 0.5 | 16.4 | +15.9 | PHI allows 26.6 WR fpts/g (median 31.1) -4.00 |
| D'Andre Swift | RB | CHI | 1 | CAR | 16.64 | 32.4 | +15.76 | CAR allows 24.3 RB fpts/g (median 22.2) +2.10 |
| Kyler Murray | QB | MIN | 1 | GB | 15.36 | -0.38 | -15.74 | GB allows 15.6 QB fpts/g (median 17.9) -2.30 · dome home +0.50 |
| Kyle Pitts | TE | ATL | 1 | PIT | 15.5 | 0 | -15.5 | PIT allows 16.7 TE fpts/g (median 13.6) +3.10 |
| Drake London | WR | ATL | 1 | PIT | 20.72 | 5.5 | -15.22 | PIT allows 35.0 WR fpts/g (median 31.1) +3.90 |
| Chuba Hubbard | RB | CAR | 1 | CHI | 8.49 | 23.7 | +15.21 | base pace, no context adjustments fired |
| Tyrone Tracy Jr. | RB | NYG | 1 | DAL | 14.55 | -0.6 | -15.15 | DAL allows 25.9 RB fpts/g (median 22.2) +3.70 |
| Josh Allen | QB | BUF | 1 | HOU | 20.79 | 35.66 | +14.87 | HOU allows 14.4 QB fpts/g (median 17.9) -3.50 |
| Ashton Jeanty | RB | LV | 1 | MIA | 17.84 | 32.7 | +14.86 | MIA allows 25.0 RB fpts/g (median 22.2) +2.80 · dome home +0.50 |

---

*Regenerated on every build of `data:calibration`. E-032 (2026-09-17).*
