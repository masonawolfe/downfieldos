#!/usr/bin/env node
// test-weekly-defense.mjs — part 6 (2026-11-22). Cases for scripts/_lib/weekly-defense.js,
// each built in memory; no file and no network.
import { buildWeeklyDefense, assertColumns, REQUIRED_COLUMNS } from './_lib/weekly-defense.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  ✅ ${msg}`); } else { fail++; console.log(`  ❌ ${msg}`); } };
const blank = Object.fromEntries(REQUIRED_COLUMNS.map(c => [c, '0']));
const row = (o) => ({ ...blank, season: '2026', season_type: 'REG', ...o });

// 1. A defender who changes teams: weeks stay with the team he played for.
const rows = [
  row({ player_id: 'D1', player_display_name: 'Moved Man', position: 'DT', position_group: 'DL', week: '1', team: 'IND', opponent_team: 'MIA', def_sacks: '1', def_qb_hits: '2' }),
  row({ player_id: 'D1', player_display_name: 'Moved Man', position: 'DT', position_group: 'DL', week: '2', team: 'IND', opponent_team: 'HOU', def_sacks: '0.5' }),
  row({ player_id: 'D1', player_display_name: 'Moved Man', position: 'DT', position_group: 'DL', week: '9', team: 'SF', opponent_team: 'LA', def_qb_hits: '1' }),
  row({ player_id: 'C1', player_display_name: 'Corner One', position: 'CB', position_group: 'DB', week: '1', team: 'KC', opponent_team: 'LAC', def_pass_defended: '3', def_interceptions: '1' }),
  row({ player_id: 'C1', player_display_name: 'Corner One', position: 'CB', position_group: 'DB', week: '19', season_type: 'POST', team: 'KC', opponent_team: 'BUF', def_pass_defended: '9' }),
  row({ player_id: 'Q1', player_display_name: 'Passer', position: 'QB', position_group: 'QB', week: '1', team: 'LAC', opponent_team: 'KC', sacks_suffered: '4', sack_yards_lost: '27' }),
  row({ player_id: 'W1', player_display_name: 'Receiver', position: 'WR', position_group: 'WR', week: '1', team: 'LAC', opponent_team: 'KC', def_tackles_solo: '1' }),
];
const d = buildWeeklyDefense(rows, { season: 2026, normTeam: t => (t === 'LA' ? 'LAR' : t) });
const m = d.players.D1;
ok(m && m.team === 'SF' && m.games === 3, 'a defender who moved is listed with his latest team and all his games');
ok(m.by_team.IND?.games === 2 && m.by_team.IND.last_week === 2 && m.by_team.SF?.first_week === 9, 'his weeks stay with the team he played for (IND 1 to 2, SF from 9)');
ok(m.totals.sacks === 1.5 && m.per_game.pressure === Math.round(((1.5 + 3) / 3) * 100) / 100, 'season totals are his own across teams; pressure = (sacks + hits) / games');
ok(d.defRows.find(r => r.week === 9).opponent === 'LAR', 'team codes go through normTeam');
ok(d.players.C1.games === 1 && d.players.C1.totals.passes_defended === 3, 'a playoff row is not counted (regular season only)');
ok(d.qbs.Q1?.sacks_taken === 4 && d.qbs.Q1.sacks_taken_per_game === 4, 'a quarterback gets his sacks taken');
ok(!d.players.W1 && !d.defRows.some(r => r.gsis_id === 'W1'), 'an offensive player is not a defender');

// 2. Induced: a renamed column must stop the build, not write zeros.
const bad = rows.map(r => { const { def_pass_defended, ...rest } = r; return { ...rest, def_passes_defended: def_pass_defended }; });
let threw = null; try { buildWeeklyDefense(bad, { season: 2026 }); } catch (e) { threw = e.message; }
ok(threw && /def_pass_defended/.test(threw), `induced: a renamed column throws (${threw})`);
let threw0 = null; try { assertColumns([]); } catch (e) { threw0 = e.message; }
ok(threw0 && /0 rows/.test(threw0), 'induced: an empty file throws');

console.log(`\ntest-weekly-defense: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
