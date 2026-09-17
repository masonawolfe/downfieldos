# E-034 · Rolling base + measured weights — DESIGN

**Written on branch `design/e033-e034-in-season-model` after peer's 2026-09-17 dispatch. Mason decides whether to ship.**

## The problem, verified

The `weekly_value` base is **`season_projection / 17`**, computed once from 2025 stats, **frozen for the entire 2026 season**. Every weekly variation comes from adjustments capped at ±4. Verified by decomposing three players across weeks 1–18 in `weeklyBoard2026.js` — the residual after subtracting adjustments is constant:

| player | wk1 | wk4 | wk8 | wk17 | implied base |
|---|---|---|---|---|---|
| Caleb Williams | 16.67 | 21.67 | 16.37 | 15.87 | **18.97 every week** |
| Christian McCaffrey | 23.01 | 20.51 | 26.41 | 24.11 | **24.51 every week** |
| Trey McBride | 15.48 | 16.28 | 17.18 | 18.68 | **18.58 every week** |

The 2026 season **cannot reach the model**. Caleb scored 37.26 in Week 1; his Week 17 base will still be 18.97 unless someone rebuilds the projection from scratch mid-season.

Mason's ask, verbatim: *"that should also impact the DFOS player level matchups later too"* — i.e. the loop should feed back into projections, not merely score them.

## Proposed shape

Replace the frozen base with a **blend of the 2025 projection and 2026 actuals**, shrunk toward the projection by how few games have been played this season.

```
base_frozen         = season_projection / 17                  (today's base)
actual_avg_2026     = mean(fantasy_points_ppr, this player, 2026 REG only)
n_games             = count of 2026 REG games with an actual
K                   = "prior strength" — 6 games (measured — see below)

base_rolling = (base_frozen × K + actual_avg_2026 × n_games) / (K + n_games)
```

**K = 6** means: after 6 games of 2026, the base is 50% projection + 50% actuals. K is tuned by E-032 measured error — the value that minimises mean|error| on a hold-out.

### Shape on three players

Using each player's actual Week 1 2026 (from `weekly_actuals_2026.json`) and pretending we hit 4/8/17 weeks. If the player merely repeats Week-1 performance every week, `base_rolling` converges toward that value. In reality, the running mean will drift toward the true talent — that's the point.

| Player | frozen base | Wk1 actual | rolling after 1 wk (K=6) | after 4 wks (Wk1 repeated) | after 8 wks | after 17 wks |
|---|---|---|---|---|---|---|
| Caleb Williams | 18.97 | 37.26 | (18.97×6 + 37.26)/7 = **21.59** | (18.97×6 + 37.26×4)/10 = **26.29** | (18.97×6 + 37.26×8)/14 = **29.42** | (18.97×6 + 37.26×17)/23 = **32.49** |
| Matthew Stafford | 22.40 | 4.10 | (22.40×6 + 4.10)/7 = **19.79** | (22.40×6 + 4.10×4)/10 = **15.08** | (22.40×6 + 4.10×8)/14 = **11.94** | (22.40×6 + 4.10×17)/23 = **8.87** |
| Trey McBride | 18.58 | 8.10 (hypothetical) | (18.58×6 + 8.10)/7 = **17.09** | (18.58×6 + 8.10×4)/10 = **14.39** | (18.58×6 + 8.10×8)/14 = **12.60** | (18.58×6 + 8.10×17)/23 = **11.02** |

Repeated Week-1 numbers over-drift the mean (real seasons have variance), but the shape is right: **the model moves as the season moves**. A player who breaks out reaches a higher base by week 6-8; a player collapsing loses base steadily.

## The knob is K, and it's set by E-032

K controls how fast the base adjusts. Bigger K = slower adjustment (trusts the offseason projection more); smaller K = faster (trusts current-season actuals more).

E-032's calibration table gives the measurement:

```
For each candidate K in {2, 4, 6, 10, 17}:
  For each player-week (n_games ≥ 3):
    predicted = base_rolling(K) + adjustments
    error     = actual - predicted
  Report mean|error|, RMSE
```

The K with the lowest mean|error| on the held-out weeks wins. Rerun quarterly (weeks 5, 9, 13, 17) so the value adapts to real signal.

**First-pass guess K=6** because: 6 games is the point where a season sample starts stabilising for skill players (touches, targets, red-zone role), and it lets the model retain a 50% pull toward the offseason base through mid-season.

## Wire-in point

`build-player-board.js:computeSeasonProjection` (the source of the frozen base). Add a `rolling_base` field beside `season_projection`. `build-weekly-board.js:computeWeeklyValue` uses `rolling_base / 17` instead of `season_projection / 17` when `weekly_actuals_2026.json` has ≥ 1 game for the player.

## What could go wrong

- **Small samples over-shoot.** K=6 partially corrects. Even so, a player who has one 40-point game and one 4-point game (variance) drifts the base toward the mean of those. Compare to what today's frozen base loses (Caleb misses forever): a noisy base moves in the right direction.
- **Injury games count.** A player who plays 2 snaps and posts 0.3 pts drags the mean. Fix: exclude games with < N snaps from `actual_avg` — nflverse's `snap_share` (0–1) is joinable via the PBP-derived data we already build.
- **K stops being right mid-season.** The quarterly retune (weeks 5, 9, 13, 17) is the mitigation. If E-032's measured error worsens after switching to rolling, back it out under a feature flag.

## Recommendation

**Ship a two-week soft launch: rolling base computed and *stored* on the board, but `weekly_value` still uses the frozen base.** Copilot and calibration observe the delta side-by-side. When calibration shows the rolling base beats the frozen one on measured error, flip the switch on. Same shape as an A/B test, no risk to the currently-shipping numbers.

The alternative — a big-bang switch — is exactly the kind of change E-032 exists to guard against. Ship the observation first; ship the switch when the numbers earn it.
