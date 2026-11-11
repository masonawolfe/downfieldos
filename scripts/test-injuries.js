#!/usr/bin/env node
/**
 * test-injuries.js — fixture tests for which injury rows count as current
 * (freshness plan step 10). Run: npm test
 *
 * Covers the producer's selection (scripts/_lib/injuries-current.js), its
 * floor gate, and the UI index (src/utils/injuryIndex.js) on files written
 * with and without meta.report_week_by_team. Fixtures are hand-made, no
 * network.
 */

import { selectCurrentReports, assertCurrentFloor } from './_lib/injuries-current.js';
import { buildInjuryIndex } from '../src/utils/injuryIndex.js';

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { passed++; console.log(`  ✅ ${message}`); }
  else { failed++; console.error(`  ❌ ${message}`); }
}
function throws(fn) { try { fn(); return null; } catch (e) { return e.message; } }

// One full-file player: weeks are [week, report_status, practice_status].
function player(team, name, weeks, gameType = 'REG') {
  return {
    team, name, position: 'WR', gsis_id: null,
    weeks: weeks.map(([week, report_status, practice_status]) => ({
      season: 2026, week, game_type: gameType, report_status: report_status || null,
      report_primary_injury: report_status ? 'Knee' : null, practice_status: practice_status || null,
      practice_primary_injury: practice_status ? 'Knee' : null, date_modified: null,
    })),
  };
}
// The compact file fetch-injuries.js writes from a selection.
function compactFrom(sel) {
  return {
    meta: { latest_report_week: sel.latestReportWeek, report_week_by_team: sel.reportWeekByTeam },
    players: sel.rows.map(({ player: p, row }) => ({
      team: p.team, name: p.name, position: p.position, status: row.report_status,
      injury: row.report_primary_injury || row.practice_primary_injury, week: row.week, updated: null,
    })),
  };
}
// Filler teams with a final report in `week`, so the floor sees a real league.
function league(week, n, skip = []) {
  const out = [];
  const codes = ['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS'];
  for (const t of codes.filter(c => !skip.includes(c)).slice(0, n)) out.push(player(t, `${t} Filler`, [[week, 'Out']]));
  return out;
}

console.log('\nselectCurrentReports: Wednesday shape (Thursday-night teams have practice rows only)');
{
  const players = [
    ...league(8, 26, ['MIN', 'CLE', 'BAL', 'PIT']),
    player('MIN', 'Old Out', [[2, 'Out']]),                          // week 2 Out, not on week 8 report
    player('MIN', 'Week Eight Out', [[8, 'Out']]),
    player('CLE', 'Stale Name', [[7, 'Out']]),                       // not on CLE's week 8 report
    player('CLE', 'Current Q', [[8, 'Questionable']]),
    player('BAL', 'Thursday Practice', [[8, 'Doubtful'], [9, null, 'Limited']]),
    player('PIT', 'Thursday Other', [[8, 'Out'], [9, null, 'DNP']]),
  ];
  const sel = selectCurrentReports(players);
  assert(sel.latestReportWeek === 8, `practice-only week 9 rows do not move the league report week (got ${sel.latestReportWeek})`);
  assert(sel.reportWeekByTeam.BAL === 8 && sel.reportWeekByTeam.PIT === 8, 'Thursday-night teams keep their week 8 final report');
  assert(sel.teamsReporting === 30, `30 teams have a current report (got ${sel.teamsReporting})`);
  const idx = buildInjuryIndex(compactFrom(sel));
  assert(idx.injuryFor('Old Out', 'MIN') === null, 'an old-week Out (week 2) returns null');
  assert(idx.injuryFor('Week Eight Out', 'MIN')?.status === 'Out', 'a row on the team report week returns');
  assert(idx.injuryFor('Stale Name', 'CLE') === null, 'a player absent from his team report returns null');
  assert(idx.injuryFor('Thursday Practice', 'BAL')?.week === 8, 'a newer practice-only row does not hide the week 8 status');
  assert(idx.injuriesForTeam('MIN').length === 1, 'injuriesForTeam lists only the report week rows');
}

console.log('\nselectCurrentReports: Friday shape (Thursday-night teams already have this week statuses)');
{
  const players = [
    ...league(8, 24, ['KC', 'DEN', 'HOU', 'NO', 'NYG', 'SF']),
    player('KC', 'Thursday Out', [[8, 'Out'], [9, 'Out']]),
    player('DEN', 'Thursday Q', [[9, 'Questionable']]),
    player('HOU', 'Bye Last Week', [[7, 'Out']]),                    // bye in week 8: two weeks behind week 9
    player('NO', 'Sunday Team Out', [[8, 'Out'], [9, null, 'DNP']]),
    player('SF', 'Ancient', [[5, 'Out']]),                           // three weeks behind: drops
  ];
  const sel = selectCurrentReports(players);
  assert(sel.latestReportWeek === 9, 'two teams with week 9 statuses set the league week to 9');
  assert(sel.reportWeekByTeam.NO === 8, 'a Sunday team keeps its week 8 report: a partial week 9 does not blank it');
  assert(sel.reportWeekByTeam.HOU === 7, 'a team on bye last week stays inside the two-week window');
  assert(!('SF' in sel.reportWeekByTeam), 'a team three weeks behind is dropped');
  const idx = buildInjuryIndex(compactFrom(sel));
  assert(idx.injuryFor('Sunday Team Out', 'NO')?.week === 8, 'Sunday team row shows (week 8)');
  assert(idx.injuryFor('Thursday Out', 'KC')?.week === 9, 'Thursday team shows week 9');
  assert(idx.injuryFor('Ancient', 'SF') === null, 'dropped team shows nothing');
  assert(idx.reportWeekFor('NO') === 8 && idx.reportWeekFor('KC') === 9, 'reportWeekFor gives each team its own week');
  assert(sel.teamsReporting === 28 && sel.currentlyOut === 27, `teams 28, Out 27 (got ${sel.teamsReporting}, ${sel.currentlyOut})`);
}

console.log('\nbuildInjuryIndex: file written before report_week_by_team existed');
{
  const oldFile = { meta: {}, players: [
    { team: 'MIN', name: 'Kyler Murray', status: 'Out', week: 2 },
    { team: 'ATL', name: 'Current Out', status: 'Out', week: 9 },
  ] };
  const idx = buildInjuryIndex(oldFile);
  assert(idx.injuryFor('Kyler Murray', 'MIN') === null, 'fallback: a week 2 Out returns null');
  assert(idx.injuryFor('Current Out', 'ATL')?.status === 'Out', 'fallback: a row on the highest file week returns');
  assert(buildInjuryIndex({}).injuryFor('x', 'MIN') === null && buildInjuryIndex(null).injuriesForTeam('MIN').length === 0, 'empty or missing file returns nothing');
}

console.log('\nassertCurrentFloor: fails when a regular-season feed is thin, not just unequal');
{
  const full = selectCurrentReports(league(9, 32));
  assert(throws(() => assertCurrentFloor(full)) === null, 'a 32-team week passes');
  const thin = selectCurrentReports(league(9, 2));
  assert(/2 teams/.test(throws(() => assertCurrentFloor(thin)) || ''), 'a 2-team regular-season week fails the floor');
  const noOut = selectCurrentReports(league(9, 32).map(p => ({ ...p, weeks: p.weeks.map(w => ({ ...w, report_status: 'Questionable' })) })));
  assert(/0 players Out/.test(throws(() => assertCurrentFloor(noOut)) || ''), 'a week with 0 Out fails');
  const none = selectCurrentReports(league(9, 32).map(p => ({ ...p, weeks: p.weeks.map(w => ({ ...w, report_status: null, practice_status: 'DNP' })) })));
  assert(/no team/.test(throws(() => assertCurrentFloor(none)) || ''), 'a feed with no status column fails');
  const post = selectCurrentReports([player('KC', 'A', [[22, 'Out']], 'POST'), player('PHI', 'B', [[22, 'Questionable']], 'POST')]);
  assert(throws(() => assertCurrentFloor(post)) === null, 'a 2-team postseason week passes (floor is regular season only)');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
