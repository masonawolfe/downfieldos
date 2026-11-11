// Which injury rows count as "current" (freshness plan step 10, per-team fix).
//
// A team's report week is its highest week that carries a game status
// (report_status: Out / Doubtful / Questionable). Practice-only rows from a
// newer week do not move it, because the final game-status report for that
// week has not been published yet. Picking one week for the whole file was
// wrong on the cadence the workflow runs: a Wednesday run sees this week's
// rows for the two Thursday-night teams only, and a Friday run comes before
// the Friday game-status reports, so a file-wide week blanked 30 teams.
//
// A team counts only if its report week is within WINDOW (2) of the league's
// latest report week. On a Friday run the two Thursday-night teams already
// carry this week's statuses, so a team that had a bye last week sits two
// weeks behind; 1 dropped those 4 teams on the 11-06 commit. A team whose
// last report is older, such as a club eliminated from the playoffs, drops.
//
// Pure function, no I/O, so scripts/test-injuries.js can drive it.

export const REPORT_WEEK_WINDOW = 2;
// Regular-season floor on teams with a current game-status report. Bye teams
// stay inside the window, so the 11 injury commits from 10-07 to 11-07 give
// 31 or 32. Below 16 means the feed lost teams or lost its status column.
export const REG_SEASON_TEAM_FLOOR = 16;

export function selectCurrentReports(players, { window = REPORT_WEEK_WINDOW } = {}) {
  const teamWeek = {};
  for (const p of players || []) {
    for (const w of p.weeks || []) {
      if (!w || !w.report_status || !Number.isFinite(w.week)) continue;
      if (teamWeek[p.team] == null || w.week > teamWeek[p.team]) teamWeek[p.team] = w.week;
    }
  }
  const weeks = Object.values(teamWeek);
  const latestReportWeek = weeks.length ? Math.max(...weeks) : null;

  const reportWeekByTeam = {};
  for (const team of Object.keys(teamWeek).sort()) {
    if (teamWeek[team] >= latestReportWeek - window) reportWeekByTeam[team] = teamWeek[team];
  }

  // Each player's row from his team's report week, if he is on that report.
  const rows = [];
  for (const p of players || []) {
    const wk = reportWeekByTeam[p.team];
    if (wk == null) continue;
    const inWeek = (p.weeks || []).filter(w => w && w.week === wk);
    const r = inWeek[inWeek.length - 1];
    if (!r || !(r.report_status || r.practice_status)) continue;
    rows.push({ player: p, row: r });
  }

  const regularSeason = rows.some(({ row }) => row.week === latestReportWeek && row.report_status && row.game_type === 'REG');
  const count = s => rows.filter(({ row }) => row.report_status === s).length;

  return {
    latestReportWeek,
    reportWeekByTeam,
    teamsReporting: Object.keys(reportWeekByTeam).length,
    regularSeason,
    currentlyOut: count('Out'),
    currentlyQuestionable: count('Questionable'),
    rows,
  };
}

// Throws when a regular-season feed is thinner than any real one. Equality
// checks pass on an empty feed (0 = 0); these do not.
export function assertCurrentFloor(sel, { floor = REG_SEASON_TEAM_FLOOR } = {}) {
  if (sel.latestReportWeek == null) throw new Error('floor assert: no team has a game-status row in any week');
  if (!sel.regularSeason) return;
  if (sel.teamsReporting < floor) {
    throw new Error(`floor assert: ${sel.teamsReporting} teams have a game-status report within ${REPORT_WEEK_WINDOW} weeks of week ${sel.latestReportWeek}; a regular-season feed has about 32, floor ${floor}`);
  }
  if (sel.currentlyOut === 0) {
    throw new Error(`floor assert: 0 players Out across ${sel.teamsReporting} teams' current reports; no real regular-season week has none`);
  }
}
