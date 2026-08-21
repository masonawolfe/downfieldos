import { SCHEDULE_2026 } from '../data/schedule2026';

// Pure functions over the week-indexed schedule. Feeds bye-week collision
// checking, stacked-bye warnings, and playoff-weeks strength of schedule.
// Corresponds to P0-3 (and part of P2-1) in FANTASY_ENGINE_BUILD_PLAN.md.

const FANTASY_PLAYOFF_WEEKS = [15, 16, 17];

// Given an array of NFL team codes (a fantasy starting lineup expressed as the
// teams each player plays for), return per-team bye info and any weeks where
// multiple lineup members share a bye.
//
// Input:  ['KC','KC','CIN','SF','DET','KC','ATL']  (order/duplicates preserved)
// Output: {
//   byes:  [{ team:'KC', byeWeek: 5 }, { team:'CIN', byeWeek: 6 }, ...],
//   collisions: [{ week: 5, teams: ['KC'] , count: 3 }, ...],  // week 5 has 3 KC players out
//   stackedByes: [ { week: 5, count: 3, teams: ['KC'] } ]      // any week with >=2 lineup members out
// }
export function byeReport(lineupTeams) {
  const teams = (lineupTeams || []).filter(Boolean);
  const teamMeta = SCHEDULE_2026?.teams || {};

  const byes = teams.map(team => ({
    team,
    byeWeek: teamMeta[team]?.byeWeek ?? null,
  }));

  // Group lineup slots by bye week
  const byWeek = new Map();
  for (const { team, byeWeek } of byes) {
    if (byeWeek == null) continue;
    if (!byWeek.has(byeWeek)) byWeek.set(byeWeek, []);
    byWeek.get(byeWeek).push(team);
  }

  const collisions = [];
  const stackedByes = [];
  for (const [week, ts] of byWeek.entries()) {
    const entry = { week, count: ts.length, teams: ts };
    collisions.push(entry);
    if (ts.length >= 2) stackedByes.push(entry);
  }

  collisions.sort((a, b) => a.week - b.week);
  stackedByes.sort((a, b) => b.count - a.count || a.week - b.week);

  return { byes, collisions, stackedByes };
}

// Games a team plays in the fantasy playoff window (weeks 15–17). Each entry
// carries opponent + home/away + env metadata (roof, surface, stadium) so a
// downstream K/DEF environment model (P2-1) can score outdoor cold-weather
// exposure without another lookup.
export function playoffSlate(team) {
  return SCHEDULE_2026?.playoffSlate?.[team] || [];
}

// Weeks 15–17 strength of schedule: mean opponent "difficulty" for a team.
// difficultyFn is (opponentCode) => number (0 easy → 1 hard). Bye weeks
// contribute 0 to the sum but count in the denominator so a team on bye
// during the fantasy playoffs is penalized — you get no game that week.
export function playoffWeeksSOS(team, difficultyFn) {
  const slate = playoffSlate(team);
  if (!slate.length) return null;
  const rated = slate.map(g => (g.bye ? 0 : difficultyFn(g.opponent) || 0));
  const sum = rated.reduce((a, b) => a + b, 0);
  return {
    team,
    weeks: FANTASY_PLAYOFF_WEEKS,
    avgDifficulty: sum / slate.length,
    perWeek: slate.map((g, i) => ({ ...g, difficulty: rated[i] })),
  };
}

// Bye week for a single team — null if unknown.
export function byeWeekFor(team) {
  return SCHEDULE_2026?.teams?.[team]?.byeWeek ?? null;
}

// The set of teams on bye in a given week (0 = no bye that week).
export function teamsOnByeInWeek(week) {
  return SCHEDULE_2026?.byeByWeek?.[week] || [];
}

// A team's opponent for a given week — { opponent, isHome, gameday, roof, ... }
// or null if the team is on bye that week.
export function opponentInWeek(team, week) {
  const games = SCHEDULE_2026?.teams?.[team]?.games || [];
  return games.find(g => g.week === week) || null;
}
