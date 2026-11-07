// Lookup helpers over injuries_${SEASON}_current.json. Compact file with only
// the latest per-player report — safe to bundle.

import injuries from '../data/intelligence/injuries_2026_current.json';

// The compact file keeps each player's last report from ANY week, so a week 2
// "Out" survives for a player who has played since. These helpers return only
// rows from the highest report week in the file (freshness plan step 10): a
// status that cannot be dated to this week is not an active designation, so
// the card says nothing rather than something possibly false.

const allRows = injuries.players || [];
const weeks = allRows.map(p => p.week).filter(w => Number.isFinite(w));
const LATEST_WEEK = weeks.length ? Math.max(...weeks) : null;

const byTeamName = new Map();
const byTeam = new Map();
for (const p of allRows) {
  if (!p.team || !p.name) continue;
  if (LATEST_WEEK == null || p.week !== LATEST_WEEK) continue;
  byTeamName.set(`${p.team}::${p.name}`, p);
  if (!byTeam.has(p.team)) byTeam.set(p.team, []);
  byTeam.get(p.team).push(p);
}

// Return this week's injury report for a specific player, or null.
export function injuryFor(name, team) {
  if (!name || !team) return null;
  return byTeamName.get(`${team}::${name}`) || null;
}

// Return every player on a team with a report in the latest week, sorted
// Out → Doubtful → Questionable.
export function injuriesForTeam(team) {
  const list = byTeam.get(team) || [];
  const rank = { Out: 0, Doubtful: 1, Questionable: 2 };
  return [...list].sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3));
}

// The report week the helpers above filter to (highest week in the file).
export function injuriesLatestWeek() {
  return LATEST_WEEK;
}

// Metadata about the underlying source and its freshness.
export function injuriesMeta() {
  return injuries.meta || null;
}
