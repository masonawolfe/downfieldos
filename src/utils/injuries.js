// Lookup helpers over injuries_${SEASON}_current.json. Compact file with only
// the latest per-player report — safe to bundle.

import injuries from '../data/intelligence/injuries_2025_current.json';

const byTeamName = new Map();
const byTeam = new Map();
for (const p of injuries.players || []) {
  if (!p.team || !p.name) continue;
  byTeamName.set(`${p.team}::${p.name}`, p);
  if (!byTeam.has(p.team)) byTeam.set(p.team, []);
  byTeam.get(p.team).push(p);
}

// Return the latest injury report for a specific player, or null.
export function injuryFor(name, team) {
  if (!name || !team) return null;
  return byTeamName.get(`${team}::${name}`) || null;
}

// Return every currently-affected player on a team, sorted Out → Doubtful →
// Questionable.
export function injuriesForTeam(team) {
  const list = byTeam.get(team) || [];
  const rank = { Out: 0, Doubtful: 1, Questionable: 2 };
  return [...list].sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3));
}

// Metadata about the underlying source and its freshness.
export function injuriesMeta() {
  return injuries.meta || null;
}
