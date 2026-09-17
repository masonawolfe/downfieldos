# E-033 · Per-opponent player history — DESIGN

**Written on branch `design/e033-e034-in-season-model` after peer's 2026-09-17 dispatch. Mason decides whether to ship.**

## The problem

Today's `weekly_value` grades a matchup on a **league-average signal**: `opp_fpts_allowed_to_pos` minus the median for that position, capped ±4. The team the copilot recommended against last week was Caleb Williams vs CAR — Carolina allows 15.6 QB fpts/g (below median 17.9), so the model applied a −2.30 matchup penalty. He scored 37.26, the top QB week of Week 1.

**The problem is that "opp is bad against QBs" is a coarse instrument.** It treats the QB and the defense as anonymous. When a specific QB has played this defense before, the pipeline throws that history away and grades on league average instead. Basic stats, not an edge.

## The data already exists

`stats_player_week_2025.csv.gz` (nflverse `stats_player` release) has per-player-per-week fantasy points and opponent. One `player_display_name` filter + one `opponent_team` group-by yields the full history in seconds. No PBP join needed unless we later want play-level splits (targets vs coverage, EPA/dropback).

Three players, 2025 REG + POST games, PPR:

### Caleb Williams (19 games, avg **18.8**)

vs MIN — **wk1: 24.2**, **wk11: 10.3** → avg 17.3. Two-game history against MIN sits 1.5 pts below his season average; the league-average signal would rate him same-as-median vs any similar-ranked defense.

### Christian McCaffrey (19 games, avg **24.1**)

vs LA — **wk5: 27.9**, **wk10: 17.6** → avg 22.75. Two-game history 1.4 below his average, again invisible to today's grade.

### Trey McBride (17 games, avg **18.6**)

vs SEA — **wk4: 12.2**, **wk10: 27.7** → avg 19.95. Two-game history 1.4 above his average, but the games diverged wildly (a swing of 15.5 points). The mean is misleading; the *variance* is the interesting signal — McBride vs SEA has been high-boom-high-bust.

## Proposed term

Add a **per-opponent history adjustment** to `computeWeeklyValue`, one term alongside `matchup_adj`. Shape:

```
own_history_avg  = mean(ppr for this player vs this opponent, prior seasons + current)
league_baseline  = league-avg fpts_to_pos vs this opponent (today's matchup_adj signal)
n_history_games  = games in own_history_avg
K                = shrinkage prior — 5 (so 5 games gets 50% weight)

blended = (own_history_avg × n + league_baseline × K) / (n + K)
own_history_delta = blended − player.base_weekly_pace
own_history_adj = clamp(own_history_delta × 0.5, −2.5, +2.5)
```

**K = 5** means: 0 prior games ⇒ 0 weight on own history (falls back to league baseline exactly); 5 games ⇒ 50%; 15 games ⇒ 75%; 30 ⇒ 86%. Prevents a 1-game sample from swinging the projection.

Cap ±2.5 (smaller than matchup's ±4) because history is a *complement*, not a replacement.

### What each player's Week-1 2026 projection would look like

Assume `matchup_adj` still fires (as today). Add the history term.

| Player | vs | 2025 own_history_avg (n) | Own delta from base | history_adj (clamped) |
|---|---|---|---|---|
| Caleb Williams | MIN | 17.3 (2 games) | 17.3 − 18.97 = −1.67 | (−1.67 × 0.5) × 2/(2+5) = **−0.24** |
| McCaffrey | LA | 22.75 (2 games) | 22.75 − 24.51 = −1.76 | (−1.76 × 0.5) × 2/(2+5) = **−0.25** |
| McBride | SEA | 19.95 (2 games) | 19.95 − 18.58 = +1.37 | (+1.37 × 0.5) × 2/(2+5) = **+0.20** |

Small in Week 1 (2 games of history each, K=5 dampens hard). By Week 8 with 4 more games of 2026 history joining the prior seasons, the term starts biting: a player who has consistently under- or over-performed against a specific defense picks up a signed adjustment. When 2026's actuals confirm a 2025 pattern (McCaffrey vs LA under his average both years), the term reinforces. When they diverge, the history-vs-league blend gives the two sides a fair fight.

## Wire-in point

Small — `build-weekly-board.js:computeWeeklyValue`. Load per-opponent history from `weekly_actuals_2025.json` (retro-fetch via `SEASON=2025 npm run data:actuals`) plus the running `weekly_actuals_2026.json` (E-031). Group by (gsis_id, opponent_team). No new fetch.

## Cost of shipping

- ~30 lines added to `build-weekly-board.js`.
- One new dep: `weekly_actuals_2025.json` (~1.3MB), retro-fetched once via the E-031 script.
- Every row now carries `own_history_adj` + `own_history_n` (component fields), and rationale grows a "vs OPP: X.X (N games)" phrase when the term fires.
- The 2025 history + 2026 running-actuals join means the adjustment strengthens week-over-week as sample grows.

## What E-032 (calibration) will show, once shipped

The calibration table adds `own_history` to its per-adjustment breakdown. If `own_history_adj` fires-mean-error is materially closer to 0 than not-fired mean, ship. If it's noise, retire. The ±2.5 cap and K=5 shrinkage are the two knobs to sweep after week 4 lets calibration see real sample per player.

## Recommendation

**Ship it after week 3.** Two-game 2025 samples aren't decisive; three weeks of 2026 actuals per player make the history term informative. Meanwhile the current league-average matchup grade keeps shipping the numbers people already trust.

The alternative — waiting until end-of-season — is the same failure mode that hid the wrong Caleb projection all season. **A term that ships and gets calibrated beats a term that stays perfect on paper.**
