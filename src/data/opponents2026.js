// Each team's 2026 regular-season opponents, built from the schedule of
// record (schedule2026.js, nflverse games.csv, refreshed by
// data-schedule-v2.yml). Same shape as before: { TEAM: { home: [...], away: [...] } }.
//
// 2026-11-11: until today this was a hand-typed table from 2026-03-15,
// written before the NFL released the 2026 schedule. It disagreed with the
// real schedule for 31 of 32 teams, and /2026-preview's Opponents and Win
// Projections tabs read it (corrections.jsonl cor-2026-11-11-opponents-from-schedule).
// The hand table is archived, not deleted:
// 99_Unsorted/_iterations/dfos-2026-11/opponents2026.hand-2026-03-15.js.
// HomeDashboard moved off the hand table on 2026-09-05 for the same reason.
//
// "home" follows the schedule's designated home team, including neutral-site
// international games (for example 2026_09_CIN_ATL in Madrid lists ATL home).
import { SCHEDULE_2026 } from './schedule2026.js';

function build(schedule) {
  const out = {};
  for (const [team, rec] of Object.entries(schedule?.teams || {})) {
    const games = (rec.games || [])
      .filter(g => (g.game_type || 'REG') === 'REG')
      .sort((a, b) => (a.week ?? 99) - (b.week ?? 99));
    out[team] = {
      home: games.filter(g => g.isHome).map(g => g.opponent),
      away: games.filter(g => !g.isHome).map(g => g.opponent),
    };
  }
  return out;
}

export const OPPONENTS_2026 = build(SCHEDULE_2026);

export const OPPONENTS_2026_META = {
  label: 'From the 2026 schedule',
  source: 'src/data/schedule2026.js (nflverse games.csv)',
  generated: SCHEDULE_2026?.meta?.generated || null,
  source_season: SCHEDULE_2026?.meta?.season ?? 2026,
};
