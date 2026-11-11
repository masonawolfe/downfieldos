// Pure index over an injuries_${SEASON}_current.json object (no imports, so
// scripts/test-injuries.js can load it in plain Node).
//
// A row counts only if its week is its team's report week (freshness plan
// step 10). scripts/fetch-injuries.js writes meta.report_week_by_team: each
// team's highest week with a game status, within one week of the league's
// latest. A team missing from that map shows nothing.
//
// A file written before that key existed keeps each player's last report
// from ANY week. For it the index falls back to the single highest week in
// the file, which shows less but never shows a stale week 2 "Out".

export function buildInjuryIndex(file) {
  const allRows = (file && file.players) || [];
  const map = file && file.meta && file.meta.report_week_by_team;
  let weekFor;
  if (map && typeof map === 'object') {
    weekFor = team => (Number.isFinite(map[team]) ? map[team] : null);
  } else {
    const weeks = allRows.map(p => p.week).filter(w => Number.isFinite(w));
    const latest = weeks.length ? Math.max(...weeks) : null;
    weekFor = () => latest;
  }

  const byTeamName = new Map();
  const byTeam = new Map();
  for (const p of allRows) {
    if (!p.team || !p.name) continue;
    const wk = weekFor(p.team);
    if (wk == null || p.week !== wk) continue;
    byTeamName.set(`${p.team}::${p.name}`, p);
    if (!byTeam.has(p.team)) byTeam.set(p.team, []);
    byTeam.get(p.team).push(p);
  }

  const rank = { Out: 0, Doubtful: 1, Questionable: 2 };
  return {
    injuryFor(name, team) {
      if (!name || !team) return null;
      return byTeamName.get(`${team}::${name}`) || null;
    },
    injuriesForTeam(team) {
      const list = byTeam.get(team) || [];
      return [...list].sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3));
    },
    reportWeekFor(team) {
      return team ? weekFor(team) : null;
    },
  };
}
