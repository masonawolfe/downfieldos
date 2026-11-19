#!/usr/bin/env node
/**
 * test-build-team-changes.mjs — team news plan step 2 (2026-11-19).
 *
 * Checks scripts/build-team-changes.js on small made-up inputs (one rule per
 * case, with the case that must NOT produce an item beside each one), then
 * reads the committed src/data/intelligence/team_changes_2026.json for the
 * shape and style rules a reader would see. No network.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildTeamChanges, POSITION_WORDS, updatedLabel } from './build-team-changes.js';
import { SEASON } from './_lib/season.js';
import { labelExpectations, missingLabels } from '../.github/scripts/render-labels.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(__dirname);
let pass = 0; let fail = 0;
function check(ok, msg) { if (ok) { pass++; console.log(`  ✅ ${msg}`); } else { fail++; console.log(`  ❌ ${msg}`); } }

// ── 1. no network: the build's own source ───────────────────────────────
export function networkFindings(src) {
  const out = [];
  const imports = [...src.matchAll(/^\s*import\s[^'"]*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  for (const i of imports) if (!['node:fs', 'node:path', 'node:url', './_lib/season.js'].includes(i)) out.push(`import ${i}`);
  if (/\bfetch\b/.test(src)) out.push('fetch');
  if (/\bglobalThis\b|\bprocess\.binding\b/.test(src)) out.push('globalThis or process.binding');
  for (const m of src.matchAll(/\bimport\s*\(([^)]*)/g)) if (!/^\s*pathToFileURL\(/.test(m[1])) out.push(`dynamic import(${m[1].trim()})`);
  if (/\brequire\s*\(/.test(src)) out.push('require(');
  if (/(https?|wss?):\/\//.test(src)) out.push('an http(s) URL');
  if (/\bgetBuiltinModule\b|\bWebSocket\b/.test(src)) out.push('getBuiltinModule or WebSocket');
  if (/\bnode:(https?|net|tls|dgram|child_process)\b/.test(src)) out.push('a network or process module');
  return out;
}
const SRC = fs.readFileSync(path.join(__dirname, 'build-team-changes.js'), 'utf8');
console.log('no network');
check(networkFindings(fs.readFileSync(path.join(__dirname, '_lib/season.js'), 'utf8')).length === 0, '_lib/season.js, its one local import, has no network either');
check(networkFindings(SRC).length === 0, `build-team-changes.js imports only node:fs, node:path, node:url and ./_lib/season.js, with no fetch, require, dynamic import or URL (${networkFindings(SRC).join(', ') || 'none found'})`);
check(networkFindings(SRC + "\nconst r = await fetch('x');").includes('fetch'), 'induced: a planted fetch call is caught');
check(networkFindings(SRC + "\nconst f = fetch; f('x');").includes('fetch'), 'induced: fetch taken by reference is caught');
check(networkFindings(SRC + "\nprocess.getBuiltinModule('node:net');").includes('getBuiltinModule or WebSocket'), 'induced: process.getBuiltinModule is caught');
check(networkFindings(SRC + "\nconst h = await import('node:' + 'https');").some((x) => x.startsWith('dynamic import')), 'induced: a dynamic import of a built name is caught');
check(networkFindings("import https from 'node:https';\n" + SRC).length > 0, 'induced: a planted node:https import is caught');
check(networkFindings(SRC + "\nconst u = 'https://example';").includes('an http(s) URL'), 'induced: a planted URL string is caught');

// Runtime: the real build, run with fetch and every network module refused.
{
  const GUARD = path.join(__dirname, '__fixtures__/team-changes/no-network-guard.mjs');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'team-changes-'));
  const run = (script, extra = []) => spawnSync(process.execPath, ['--import', GUARD, script, ...extra], { cwd: REPO, encoding: 'utf8' });
  const r = run(path.join(__dirname, 'build-team-changes.js'), ['--out', path.join(tmp, 'card.json'), '--state', path.join(tmp, 'state.json'), '--now', new Date().toISOString()]);
  check(r.status === 0 && fs.existsSync(path.join(tmp, 'card.json')), `the real build runs to exit 0 under the no-network guard (exit ${r.status}${r.status ? `: ${(r.stderr || '').trim().split('\n')[0]}` : ''})`);
  const planted = path.join(tmp, 'planted.mjs');
  const refused = (code) => { fs.writeFileSync(planted, code); const x = run(planted); return x.status !== 0 && /no-network guard/.test(x.stderr || ''); };
  check(refused("const m = 'node:' + 'https'; await import(m); console.log('reached');\n"), 'induced: importing a network module by a built name is refused by the guard (its message on stderr)');
  check(refused("await fetch('http://127.0.0.1:9'); console.log('fetched');\n"), 'induced: a fetch to a valid local address is refused by the guard, not by a failed connection');
  check(refused("process.getBuiltinModule('node:https'); console.log('reached');\n"), 'induced: process.getBuiltinModule of a network module is refused');
  check(refused("new WebSocket('ws://127.0.0.1:9'); console.log('opened');\n"), 'induced: a WebSocket is refused');
}

// ── fixture builder ──────────────────────────────────────────────────────
const TEAMS = [{ a: 'AAA', n: 'Aardvarks' }, { a: 'BBB', n: 'Bobcats' }];
function base(over = {}) {
  return {
    injuries: { meta: { generated_at: '2026-11-18T00:00:00Z', report_week_by_team: { AAA: 10, BBB: 10 } }, players: [] },
    availability: { meta: { generated: '2026-11-19T00:00:00Z' }, players: {} },
    transactions: { meta: { generated: '2026-11-19T00:00:00Z' }, transactions: [] },
    rosters: { AAA: { offense: [{ pos: 'QB', gsis_id: 'q1', name: 'Quinn One' }, { pos: 'WR1', gsis_id: 'w1', name: 'Wes One' }], defense: [] }, BBB: { offense: [], defense: [] } },
    rostersMeta: { reconciled_at: '2026-11-19T00:00:00Z' },
    actuals: { meta: { generated_at: '2026-11-18T00:00:00Z', weeks_present: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, rows: [] },
    teams: TEAMS,
    prior: null,
    now: '2026-11-19T12:00:00Z',
    ...over,
  };
}
const inj = (id, name, pos, team, weeks) => ({ gsis_id: id, name, position: pos, team, weeks: Object.entries(weeks).map(([w, s]) => ({ week: Number(w), game_type: 'REG', report_status: s })) });
const det = (out, tm = 'AAA') => out.teams[tm].map((i) => i.detail);

// ── 2. injury report ─────────────────────────────────────────────────────
console.log('out or back');
{
  const i = base();
  i.injuries.players = [
    inj('p1', 'Pat Out', 'LB', 'AAA', { 10: 'Out' }),
    inj('p2', 'Pat Dee', 'CB', 'AAA', { 10: 'Doubtful' }),
    inj('p3', 'Pat Que', 'T', 'AAA', { 10: 'Questionable' }),
    inj('p4', 'Pat Old', 'S', 'AAA', { 9: 'Out' }),
    inj('p5', 'Pat Back', 'RB', 'AAA', { 9: 'Out', 10: null }),
    inj('p6', 'Pat Still', 'TE', 'AAA', { 9: 'Out', 10: null }),
  ];
  i.availability.players = { p5: { status: 'ACT', team: 'AAA', game_designation: null }, p6: { status: 'IR', team: 'AAA', game_designation: null } };
  const o = buildTeamChanges(i);
  const d = det(o);
  check(d.includes('out') && d.includes('doubtful') && d.includes('questionable'), 'out, doubtful and questionable on the latest report week each make an item');
  check(o.teams.AAA.find((x) => x.gsis_id === 'p3')?.sentence === 'Tackle Pat Que was listed questionable on the week 10 injury report.', 'a report week before week_now reads in the past tense, position in words');
  check(d.includes('back') && o.teams.AAA.find((x) => x.detail === 'back').gsis_id === 'p5', 'back: out the week before, not out now, availability active');
  check(!o.teams.AAA.some((x) => x.gsis_id === 'p6'), 'not back when availability says injured reserve');
  check(!o.teams.AAA.some((x) => x.gsis_id === 'p4'), 'out only on an older report week makes no out item');
}

// ── 3. transactions ──────────────────────────────────────────────────────
console.log('reserve and roster moves');
{
  const i = base();
  i.transactions.transactions = [
    { type: 'STATUS_CHANGE', week: 11, gsis_id: 'r1', name: 'Res Ir', position: 'DL', team: 'AAA', from_status: 'ACT', to_status: 'RES' },
    { type: 'STATUS_CHANGE', week: 11, gsis_id: 'r2', name: 'Res Plain', position: 'G', team: 'AAA', from_status: 'ACT', to_status: 'RES' },
    { type: 'STATUS_CHANGE', week: 10, gsis_id: 'r3', name: 'Act Ive', position: 'WR', team: 'BBB', from_status: 'RES', to_status: 'ACT' },
    { type: 'SIGNED', week: 11, gsis_id: 's1', name: 'Sig Act', position: 'QB', team: 'BBB', status: 'ACT' },
    { type: 'SIGNED', week: 11, gsis_id: 's2', name: 'Sig Dev', position: 'QB', team: 'BBB', status: 'DEV' },
    { type: 'RELEASED', week: 11, gsis_id: 'x1', name: 'Rel Act', position: 'K', team: 'BBB', last_status: 'ACT' },
    { type: 'RELEASED', week: 11, gsis_id: 'x2', name: 'Rel Dev', position: 'K', team: 'BBB', last_status: 'DEV' },
    { type: 'TRADED_OR_CLAIMED', week: 11, gsis_id: 't1', name: 'Tra Ded', position: 'TE', from_team: 'AAA', to_team: 'BBB', old_status: 'ACT', new_status: 'ACT' },
    { type: 'TRADED_OR_CLAIMED', week: 11, gsis_id: 't2', name: 'Tra Dev', position: 'TE', from_team: 'AAA', to_team: 'BBB', old_status: 'DEV', new_status: 'DEV' },
    { type: 'SIGNED', week: 9, gsis_id: 's3', name: 'Sig Old', position: 'QB', team: 'BBB', status: 'ACT' },
  ];
  i.availability.players = { r1: { status: 'IR', team: 'AAA' } };
  const o = buildTeamChanges(i);
  const a = o.teams.AAA; const b = o.teams.BBB;
  check(a.find((x) => x.gsis_id === 'r1')?.sentence === 'Defensive lineman Res Ir moved to injured reserve before week 11.', 'reserve with availability IR is named injured reserve, in words');
  check(a.find((x) => x.gsis_id === 'r2')?.sentence === 'Guard Res Plain moved to a reserve list before week 11.', 'reserve with no availability record says a reserve list');
  check(b.some((x) => x.gsis_id === 'r3' && x.detail === 'activated'), 'reserve to active is activated');
  check(b.some((x) => x.gsis_id === 's1') && !b.some((x) => x.gsis_id === 's2'), 'signed to the active roster kept, practice squad signing left out');
  check(b.some((x) => x.gsis_id === 'x1') && !b.some((x) => x.gsis_id === 'x2'), 'release from the active roster kept, practice squad release left out');
  check(b.find((x) => x.gsis_id === 't1')?.sentence === 'Added tight end Tra Ded, last with the Aardvarks, before week 11.' && a.find((x) => x.gsis_id === 't1')?.sentence === 'Tight end Tra Ded is now with the Bobcats, as of week 11.', 'a trade or claim is written for both teams with the other team named');
  check(!a.concat(b).some((x) => x.gsis_id === 't2'), 'a practice squad to practice squad move is left out');
  check(!b.some((x) => x.gsis_id === 's3'), 'a move older than week_now minus 1 is left out (window)');
  check(b.length <= 5, 'cap: no team over five items');
}

// ── 4. ranking, cap and one per player ───────────────────────────────────
console.log('ranking');
{
  const i = base();
  i.injuries.players = ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => inj(`i${k}`, `Inj ${k}`, 'LB', 'AAA', { 10: 'Questionable' }));
  i.injuries.players.push(inj('w1', 'Wes One', 'WR', 'AAA', { 10: 'Out' }));
  i.transactions.transactions = [
    { type: 'SIGNED', week: 11, gsis_id: 'q1', name: 'Quinn One', position: 'QB', team: 'AAA', status: 'ACT' },
    { type: 'STATUS_CHANGE', week: 11, gsis_id: 'w1', name: 'Wes One', position: 'WR', team: 'AAA', from_status: 'ACT', to_status: 'RES' },
  ];
  const o = buildTeamChanges(i);
  const a = o.teams.AAA;
  check(a.length === 5, 'cap: seven candidates give five items');
  check(a[0].gsis_id === 'q1' && a[1].gsis_id === 'w1' && a[1].matters === true, 'the starter\'s signing leads (ruled), then the starter\'s injury item ahead of depth players');
  check(a.filter((x) => x.gsis_id === 'w1').length === 1 && a.find((x) => x.gsis_id === 'w1').detail === 'reserve', 'one item per player: the week 11 reserve move beats the week 10 out listing (newer week before detail), and only one is kept');
  check(a.some((x) => x.gsis_id === 'q1' && x.detail === 'signed'), 'ruled 2026-11-19: a signing of a player who matters makes the card ahead of six injury lines');
}

// ── 5. new starters and the state ────────────────────────────────────────
console.log('new starters');
{
  const first = buildTeamChanges(base());
  check(first.meta.first_build === true && !Object.values(first.teams).flat().some((x) => x.detail === 'new_starter'), 'first build: starters recorded, no new starter item');
  check(first.state.teams.AAA.q1?.since_week === null && first.state.teams.AAA.w1, 'first build: the state holds every starter with no since week');
  const i2 = base({ prior: first.state });
  i2.rosters.AAA.offense = [{ pos: 'QB', gsis_id: 'q2', name: 'Quinn Two' }, { pos: 'WR1', gsis_id: 'w1', name: 'Wes One' }];
  const second = buildTeamChanges(i2);
  const ns = second.teams.AAA.find((x) => x.detail === 'new_starter');
  check(ns?.gsis_id === 'q2' && ns.sentence === 'Quinn Two moved into the starting lineup at quarterback on the depth chart before week 11, in place of Quinn One.', 'second build: a new starter item names whom he replaced');
  check(second.state.teams.AAA.q1?.left_week === 11, 'the starter who left is kept in the state with his left week');
  i2.transactions.transactions = [{ type: 'RELEASED', week: 11, gsis_id: 'q1', name: 'Quinn One', position: 'QB', team: 'AAA', last_status: 'ACT' }];
  check(buildTeamChanges(i2).teams.AAA.find((x) => x.gsis_id === 'q1')?.matters === true, 'a starter who just left still ranks as one who matters');
  const i3 = base({ prior: second.state, actuals: { meta: { generated_at: 'x', weeks_present: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }, rows: [] } });
  i3.rosters.AAA.offense = [{ pos: 'QB', gsis_id: 'q2', name: 'Quinn Two' }, { pos: 'WR1', gsis_id: 'w1', name: 'Wes One' }];
  const third = buildTeamChanges(i3);
  check(!third.teams.AAA.some((x) => x.detail === 'new_starter') && third.state.teams.AAA.q1?.left_week === 11, 'two weeks on: the new starter item ages out, and the departed starter stays in the state for the season');
}

// ── 6. role by targets ───────────────────────────────────────────────────
console.log('role');
{
  const row = (id, name, pos, team, week, t, fp = 1) => ({ gsis_id: id, name, pos, team, week, fantasy_points_graded: fp, components: { targets: t } });
  const i = base();
  i.actuals.rows = [
    row('u1', 'Up One', 'WR', 'AAA', 7, 2), row('u1', 'Up One', 'WR', 'AAA', 8, 3), row('u1', 'Up One', 'WR', 'AAA', 9, 2), row('u1', 'Up One', 'WR', 'AAA', 10, 9),
    row('d1', 'Down One', 'TE', 'AAA', 8, 8), row('d1', 'Down One', 'TE', 'AAA', 9, 7), row('d1', 'Down One', 'TE', 'AAA', 10, 2),
    row('n1', 'Near One', 'WR', 'AAA', 8, 2), row('n1', 'Near One', 'WR', 'AAA', 9, 2), row('n1', 'Near One', 'WR', 'AAA', 10, 5),
    row('s1', 'Short One', 'WR', 'AAA', 9, 1), row('s1', 'Short One', 'WR', 'AAA', 10, 12),
    row('qb', 'Qb One', 'QB', 'AAA', 8, 0), row('qb', 'Qb One', 'QB', 'AAA', 9, 0), row('qb', 'Qb One', 'QB', 'AAA', 10, 9),
  ];
  const o = buildTeamChanges(i);
  const a = o.teams.AAA;
  check(a.find((x) => x.gsis_id === 'u1')?.sentence === 'Wide receiver Up One drew 9 targets in week 10, up from an average of 2.3 over the previous 3 games.', 'role up: nine targets against an average of 2.3');
  check(a.find((x) => x.gsis_id === 'd1')?.detail === 'role_down', 'role down: two targets against an average of 7.5');
  check(!a.some((x) => x.gsis_id === 'n1'), 'under six targets is not a role change');
  check(!a.some((x) => x.gsis_id === 's1'), 'one earlier game is too few');
  check(!a.some((x) => x.gsis_id === 'qb'), 'a quarterback is not read for targets');
}

// ── 7. unknown position ──────────────────────────────────────────────────
{
  const i = base();
  i.injuries.players = [inj('z1', 'Zed Unknown', 'ZZ', 'AAA', { 10: 'Out' })];
  const o = buildTeamChanges(i);
  check(o.teams.AAA[0].sentence.startsWith('Player Zed Unknown') && o.meta.unknown_positions.includes('ZZ'), 'an unknown position reads "player" and is listed in meta.unknown_positions');
}

// ── 7b. the review's cases (2026-11-19) ─────────────────────────────────
console.log('review cases');
{
  // Rams coded LA in the transactions file.
  const i = base({ teams: [{ a: 'LAR', n: 'Rams' }, { a: 'SF', n: '49ers' }] });
  i.rosters = { LAR: { offense: [], defense: [] }, SF: { offense: [], defense: [] } };
  i.injuries.meta.report_week_by_team = { LAR: 10, SF: 10 };
  i.transactions.transactions = [
    { type: 'STATUS_CHANGE', week: 10, gsis_id: 'pn', name: 'Puka Test', position: 'WR', team: 'LA', from_status: 'ACT', to_status: 'RES' },
    { type: 'TRADED_OR_CLAIMED', week: 10, gsis_id: 'xs', name: 'Xav Test', position: 'LB', from_team: 'SF', to_team: 'LA', old_status: 'ACT', new_status: 'ACT' },
    { type: 'SIGNED', week: 10, gsis_id: 'zz', name: 'Zed Test', position: 'LB', team: 'XYZ', status: 'ACT' },
  ];
  const o = buildTeamChanges(i);
  check(o.teams.LAR.some((x) => x.gsis_id === 'pn') && o.teams.LAR.some((x) => x.gsis_id === 'xs' && x.detail === 'added') && o.teams.SF.some((x) => x.gsis_id === 'xs' && x.sentence.includes('is now with the Rams')), 'LA rows join to LAR, both sides of the trade included');
  check(o.meta.unknown_teams.XYZ === 1 && !Object.values(o.teams).flat().some((x) => x.gsis_id === 'zz'), 'an unknown team code is listed in meta and its row is not used');
}
{
  // A release snapshot gap, and a release of a player still on the team.
  const i = base();
  i.transactions.transactions = Array.from({ length: 25 }, (_, k) => ({ type: 'RELEASED', week: 10, gsis_id: `g${k}`, name: `Gap ${k}`, position: 'LB', team: 'BBB', last_status: 'ACT' }));
  i.transactions.transactions.push({ type: 'RELEASED', week: 10, gsis_id: 'q1', name: 'Quinn One', position: 'QB', team: 'AAA', last_status: 'ACT' });
  i.transactions.transactions.push({ type: 'RELEASED', week: 11, gsis_id: 'av', name: 'Still Here', position: 'K', team: 'AAA', last_status: 'ACT' });
  i.transactions.transactions.push({ type: 'STATUS_CHANGE', week: 11, gsis_id: 'cut', name: 'Cut Real', position: 'P', team: 'AAA', from_status: 'ACT', to_status: 'CUT' });
  i.availability.players = { av: { status: 'ACT', team: 'AAA' } };
  const o = buildTeamChanges(i);
  check(o.teams.BBB.length === 0 && o.meta.skipped_release_weeks.some((g) => g.team === 'BBB' && g.week === 10 && g.rows === 25), 'a team-week with 25 releases is skipped as a snapshot gap and listed in meta');
  check(!o.teams.AAA.some((x) => x.gsis_id === 'q1'), 'no release for a player still in the depth chart');
  check(!o.teams.AAA.some((x) => x.gsis_id === 'av'), 'no release for a player availability still places on the team');
  check(o.teams.AAA.find((x) => x.gsis_id === 'cut')?.sentence === 'Released punter Cut Real before week 11.', 'a STATUS_CHANGE from active to CUT is a release');
}
{
  // CoS ruling 2026-11-19: every team change reads as a team change.
  const i = base();
  i.transactions.transactions = [
    { type: 'TRADED_OR_CLAIMED', week: 10, gsis_id: 'fa', name: 'Free Agent', position: 'QB', from_team: 'AAA', to_team: 'BBB', old_status: 'CUT', new_status: 'ACT' },
    { type: 'TRADED_OR_CLAIMED', week: 10, gsis_id: 'ps', name: 'Prac Squad', position: 'QB', from_team: 'AAA', to_team: 'BBB', old_status: 'DEV', new_status: 'ACT' },
    { type: 'STATUS_CHANGE', week: 11, gsis_id: 'in', name: 'Inactive Hurt', position: 'RB', team: 'AAA', from_status: 'INA', to_status: 'RES' },
  ];
  const o = buildTeamChanges(i);
  check(o.teams.BBB.find((x) => x.gsis_id === 'fa')?.sentence === 'Added quarterback Free Agent, last with the Aardvarks, before week 10.', 'old_status CUT is a team change: added, last with the old team (it can hide a trade, QA gate 2)');
  check(!/Signed|trade/.test(o.teams.BBB.find((x) => x.gsis_id === 'fa')?.sentence || ''), 'negative: a CUT row never says signed or trade');
  check(o.teams.BBB.find((x) => x.gsis_id === 'ps')?.sentence === 'Added quarterback Prac Squad, last with the Aardvarks, before week 10.', 'old_status DEV is a team change too: added, last with the old team');
  check(o.teams.AAA.find((x) => x.gsis_id === 'fa')?.sentence === 'Quarterback Free Agent is now with the Bobcats, as of week 10.' && o.teams.AAA.some((x) => x.gsis_id === 'ps' && x.detail === 'now_with'), 'the old team\'s card says he is now with the new team');
  check(o.teams.AAA.some((x) => x.gsis_id === 'in' && x.detail === 'reserve'), 'a move from the inactive list to a reserve list is a reserve move');
}
{
  // A bye: the team's last report is two weeks back; back skips the bye week.
  const i = base();
  i.injuries.meta.report_week_by_team = { AAA: 9, BBB: 10 };
  i.injuries.players = [inj('by', 'Bye Out', 'CB', 'AAA', { 9: 'Out' }), inj('bk', 'Bye Back', 'WR', 'BBB', { 8: 'Out', 10: null }), inj('fill', 'Fill', 'LB', 'BBB', { 8: null, 10: 'Questionable' })];
  i.availability.players = { bk: { status: 'ACT', team: 'BBB' } };
  const o = buildTeamChanges(i);
  check(o.teams.AAA.find((x) => x.gsis_id === 'by')?.sentence === 'Cornerback Bye Out was listed out on the week 9 injury report.' && o.meta.injury_report_weeks_behind.AAA === 9, 'a team off a bye keeps its last report, in the past tense, and meta names it');
  check(o.teams.BBB.find((x) => x.gsis_id === 'bk')?.sentence === 'Wide receiver Bye Back was listed out for week 8 and was not listed out for week 10.', 'back compares with the team\'s previous report week, across the bye');
}
{
  // week_now follows the newest file; a starter who returns is not new.
  const i = base();
  i.transactions.transactions = [{ type: 'SIGNED', week: 12, gsis_id: 's12', name: 'Late Sign', position: 'K', team: 'AAA', status: 'ACT' }];
  const o = buildTeamChanges(i);
  check(o.meta.week_now === 12 && o.teams.AAA.some((x) => x.gsis_id === 's12'), 'week_now follows the latest transactions week when grading is late');
  const b1 = buildTeamChanges(base());
  const i2 = base({ prior: b1.state, now: '2026-11-20T12:00:00Z' }); i2.rosters.AAA.offense = [{ pos: 'QB', gsis_id: 'q2', name: 'Quinn Two' }, { pos: 'WR1', gsis_id: 'w1', name: 'Wes One' }];
  const b2 = buildTeamChanges(i2);
  const i3 = base({ prior: b2.state, now: '2026-11-21T12:00:00Z' });
  const b3 = buildTeamChanges(i3);
  check(!b3.teams.AAA.some((x) => x.detail === 'new_starter') && b3.state.teams.AAA.q1?.left_week === null && b3.state.teams.AAA.q2?.left_week === 11, 'a starter back in his slot gets his record back and no new starter item');
  let threw = false; try { buildTeamChanges(base({ prior: { ...b1.state, generated_at: '2030-01-01T00:00:00Z' } })); } catch { threw = true; }
  check(threw, 'a state stamped after the build\'s clock makes the build throw');
  check(buildTeamChanges(base({ prior: { ...b1.state, season: SEASON - 1 } })).meta.first_build === true, 'a state from another season is treated as a first build');
}
{
  // An injured star still matters: top three in an earlier graded week.
  const i = base();
  i.actuals.rows = [{ gsis_id: 'star', name: 'Star Qb', pos: 'QB', team: 'AAA', week: 9, fantasy_points_graded: 30, components: {} }];
  i.injuries.players = [inj('star', 'Star Qb', 'QB', 'AAA', { 10: 'Out' }), inj('nob', 'Nobody', 'LB', 'AAA', { 10: 'Doubtful' })];
  const o = buildTeamChanges(i);
  check(o.teams.AAA[0].gsis_id === 'star' && o.teams.AAA[0].matters === true, 'a top three scorer from week 9 still matters in week 10');
}

{
  // Second review pass (2026-11-19).
  const i = base();
  i.transactions.transactions = [
    { type: 'TRADED_OR_CLAIMED', week: 10, gsis_id: 'ti', name: 'To Inactive', position: 'S', from_team: 'AAA', to_team: 'BBB', old_status: 'ACT', new_status: 'INA' },
    { type: 'STATUS_CHANGE', week: 10, gsis_id: 'ri', name: 'Res Ina', position: 'G', team: 'AAA', from_status: 'RES', to_status: 'INA' },
    { type: 'STATUS_CHANGE', week: 10, gsis_id: 'rx', name: 'Res Gone', position: 'G', team: 'AAA', from_status: 'RES', to_status: 'INA' },
  ];
  i.availability.players = { ri: { status: 'ACT', team: 'AAA' } };
  i.rosters.AAA.defense = [{ pos: 'EDGE1', gsis_id: 'e2', name: 'Edge Two', starter_reason: 'promoted after: Edge Star (IR)', candidates: [{ gsis_id: 'es', name: 'Edge Star' }, { gsis_id: 'e2', name: 'Edge Two' }] }];
  i.injuries.players = [inj('es', 'Edge Star', 'DE', 'AAA', { 10: 'Out' })];
  const o = buildTeamChanges(i);
  check(o.teams.BBB.some((x) => x.gsis_id === 'ti' && x.detail === 'added') && o.teams.AAA.some((x) => x.gsis_id === 'ti' && x.detail === 'now_with'), 'a trade where the player arrives on the inactive list is written for both teams');
  check(o.teams.AAA.find((x) => x.gsis_id === 'ri')?.sentence === 'Guard Res Ina came off a reserve list before week 10.', 'reserve to inactive reads "came off a reserve list", not "returned to the active roster"');
  check(!o.teams.AAA.some((x) => x.gsis_id === 'rx'), 'reserve to inactive with no availability on the team makes no item');
  check(o.teams.AAA.find((x) => x.gsis_id === 'es')?.matters === true, 'a starter the depth chart says was promoted over (starter_reason) matters on the first build');
  const s1 = buildTeamChanges(base());
  let st = s1.state; const later = (k) => `2026-11-${20 + k}T12:00:00Z`;
  const off = base({ prior: st, now: later(0) }); off.rosters.AAA.offense = [{ pos: 'QB', gsis_id: 'q2', name: 'Quinn Two' }, { pos: 'WR1', gsis_id: 'w1', name: 'Wes One' }];
  st = buildTeamChanges(off).state;
  for (let k = 1; k <= 4; k++) { const wk = base({ prior: st, now: later(k), actuals: { meta: { generated_at: 'x', weeks_present: Array.from({ length: 10 + k }, (_, n) => n + 1) }, rows: [] } }); wk.rosters.AAA.offense = off.rosters.AAA.offense; st = buildTeamChanges(wk).state; }
  const back = base({ prior: st, now: later(6), actuals: { meta: { generated_at: 'x', weeks_present: Array.from({ length: 15 }, (_, n) => n + 1) }, rows: [] } });
  const bo = buildTeamChanges(back);
  check(!bo.teams.AAA.some((x) => x.gsis_id === 'q1' && x.detail === 'new_starter') && bo.state.teams.AAA.q1?.left_week === null, 'a starter back after five weeks out gets his record back, with no new starter item');
  const reset = buildTeamChanges(base({ prior: { ...s1.state, season: SEASON - 1 } }));
  check(reset.meta.sources.find((x) => x.file === 'data/team_changes_starters.json')?.generated === null, 'a state the build did not use is not named as a dated source');
}

{
  // CoS ruling 2026-11-19 15:31 on plan part 4: moves for players who matter
  // always make the card; then players who matter before those who do not.
  const depth = (k) => inj(`d${k}`, `Depth ${k}`, 'LB', 'AAA', { 10: 'Out' });
  const i = base();
  i.injuries.players = [0, 1, 2, 3, 4, 5].map(depth);
  i.transactions.transactions = [
    { type: 'TRADED_OR_CLAIMED', week: 10, gsis_id: 'w1', name: 'Wes One', position: 'WR', from_team: 'AAA', to_team: 'BBB', old_status: 'ACT', new_status: 'ACT' },
    { type: 'SIGNED', week: 10, gsis_id: 'nob', name: 'No Body', position: 'LB', team: 'AAA', status: 'ACT' },
  ];
  const o = buildTeamChanges(i);
  check(o.teams.AAA[0].gsis_id === 'w1' && o.teams.AAA[0].detail === 'now_with', 'six depth injury lines and one trade of a starter: the trade leads the card');
  check(o.teams.BBB.some((x) => x.gsis_id === 'w1' && x.detail === 'added' && x.matters === true), 'the receiving team shows him too, as one who matters, because he matters to the team he left');
  check(!o.teams.AAA.some((x) => x.gsis_id === 'nob'), 'negative: a signing of a depth player does not push out depth injury lines (kind order holds inside the group)');

  const j = base();
  j.rosters.AAA.offense = Array.from({ length: 7 }, (_, k) => ({ pos: `WR${k + 1}`, gsis_id: `m${k}`, name: `Mover ${k}` }));
  j.transactions.transactions = Array.from({ length: 7 }, (_, k) => ({ type: 'RELEASED', week: k < 3 ? 11 : 10, gsis_id: `m${k}`, name: `Mover ${k}`, position: 'WR', team: 'AAA', last_status: 'ACT' }));
  j.rosters.AAA.offense = [];
  j.prior = buildTeamChanges(base({ rosters: { AAA: { offense: Array.from({ length: 7 }, (_, k) => ({ pos: `WR${k + 1}`, gsis_id: `m${k}`, name: `Mover ${k}` })), defense: [] }, BBB: { offense: [], defense: [] } } })).state;
  const jo = buildTeamChanges(j);
  check(jo.teams.AAA.length === 5 && jo.teams.AAA.every((x) => x.detail === 'released') && jo.teams.AAA.filter((x) => x.week === 11).length === 3, 'seven releases of starters: five make the card, the three newest first');

  const k = base();
  k.actuals.rows = [
    { gsis_id: 'w1', name: 'Wes One', pos: 'WR', team: 'AAA', week: 7, fantasy_points_graded: 5, components: { targets: 1 } },
    { gsis_id: 'w1', name: 'Wes One', pos: 'WR', team: 'AAA', week: 8, fantasy_points_graded: 5, components: { targets: 2 } },
    { gsis_id: 'w1', name: 'Wes One', pos: 'WR', team: 'AAA', week: 9, fantasy_points_graded: 5, components: { targets: 1 } },
    { gsis_id: 'w1', name: 'Wes One', pos: 'WR', team: 'AAA', week: 10, fantasy_points_graded: 20, components: { targets: 10 } },
  ];
  k.injuries.players = [0, 1, 2, 3, 4].map(depth);
  const ko = buildTeamChanges(k);
  check(ko.teams.AAA[0].gsis_id === 'w1' && ko.teams.AAA[0].detail === 'role_up', 'a role change for a starter comes before injury lines for depth players, whatever the kind');
  const k2 = base();
  k2.actuals.rows = k.actuals.rows.map((r) => ({ ...r, gsis_id: 'zz', name: 'Zed Depth' }));
  for (const w of [8, 9, 10]) for (const n of [1, 2, 3]) k2.actuals.rows.push({ gsis_id: `top${n}`, name: `Top ${n}`, pos: 'QB', team: 'AAA', week: w, fantasy_points_graded: 40, components: {} });
  k2.injuries.players = [0, 1, 2, 3, 4].map(depth);
  check(!buildTeamChanges(k2).teams.AAA.some((x) => x.gsis_id === 'zz'), 'negative: a role change for a depth player stays behind five depth injury lines (kind order inside the group)');
}

{
  // Step 5: the card's date label, US Eastern.
  check(updatedLabel('2026-11-20T04:34:00Z') === 'Updated November 19, 2026', 'a 04:34 UTC build is dated the evening before, Eastern (November 19)');
  check(updatedLabel('2026-11-19T22:00:00Z') === 'Updated November 19, 2026' && updatedLabel('not a time') === null, 'an afternoon build keeps its date; a bad time gives no label');
}

// ── 8. the committed file, as a reader would get it ──────────────────────
console.log('committed file');
{
  const f = path.join(REPO, `src/data/intelligence/team_changes_${SEASON}.json`);
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const all = Object.values(d.teams).flat();
  const codes = Object.keys(POSITION_WORDS).filter((k) => k.length > 1);
  const codeRe = new RegExp(`\\b(${codes.join('|')})\\b`);
  check(Object.keys(d.teams).length === 32, '32 teams');
  check(Object.values(d.teams).every((v) => v.length <= 5), 'no team over five items');
  check(all.every((x) => ['out_or_back', 'role', 'roster_move'].includes(x.kind)), 'every item is out or back, role or roster move: no betting or draft kind');
  check(all.every((x) => x.gsis_id && x.name && x.position && Number.isInteger(x.week) && x.sentence && Array.isArray(x.sources) && x.sources.length && x.sources.every((s) => s.file && s.generated)), 'every item has gsis_id, name, position, week, sentence and sources with a generated time');
  check(!all.some((x) => /—/.test(x.sentence)), 'no em dash in any sentence');
  check(!all.some((x) => /, (and|or) /.test(x.sentence)), 'no Oxford comma in any sentence');
  check(!all.some((x) => codeRe.test(x.sentence)), 'no position abbreviation in any sentence');
  check(!all.some((x) => /https?:|espn|yahoo|apnews/i.test(JSON.stringify(x))), 'no link and no walled host named in any item');
  check(all.every((x) => x.week <= d.meta.week_now && x.week >= d.meta.week_now - (x.kind === 'out_or_back' && ['out', 'doubtful', 'questionable', 'back'].includes(x.detail) ? 2 : 1)), 'every item is in the window (injury report items may be two weeks back, for a bye)');
  check(Array.isArray(d.meta.unknown_positions) && d.meta.unknown_positions.length === 0, 'every position in the file has a word');
  {
    // The deploy's render smoke test (8316a93's deploy failed it: the row's descriptive label is not on the page).
    const exp = labelExpectations();
    const mine = (exp['/team-intel'] || []).find((e) => e.file === `src/data/intelligence/team_changes_${SEASON}.json`);
    check(mine && mine.label === d.meta.label, `the render smoke test looks for the file's own label on /team-intel (${mine?.label})`);
    check(missingLabels('/team-intel', `What changed ${d.meta.label} Added ...`, { '/team-intel': [mine] }).length === 0, 'rendered text with the date chip passes the smoke label check');
    check(missingLabels('/team-intel', 'What changed Added ...', { '/team-intel': [mine] }).length === 1, 'induced: rendered text without the date chip fails it');
  }
  check(d.meta.label === updatedLabel(d.meta.generated_at) && /^Updated [A-Z][a-z]+ \d{1,2}, \d{4}$/.test(d.meta.label), `the file's label is its own build date in words (${d.meta.label})`);
  check(!('state' in d) && !('starters' in d), 'the starters state is not in the file the site will bundle');
  check(!all.some((x) => 'other_team' in x), 'no internal ranking key (other_team) in the reader file');
  for (const [nm, a, b] of [['Kirk Cousins', 'MIN', 'LV'], ['Keenan Allen', 'SF', 'IND'], ['Josh Downs', 'KC', 'IND']]) {
    check(d.teams[a]?.some((x) => x.name === nm && x.detail === 'added') && d.teams[b]?.some((x) => x.name === nm && x.detail === 'now_with'), `done check (CoS 15:31): ${nm} on the ${a} card and on the ${b} card`);
  }
  // CoS ruling after QA gate 2, by name.
  check(d.teams.BAL?.find((x) => x.name === 'Jacoby Brissett')?.sentence === 'Added quarterback Jacoby Brissett, last with the Cardinals, before week 10.', 'Brissett on Baltimore\'s card: added, last with the Cardinals (nfl.com lists a trade; never "signed")');
  check(d.teams.CLE?.find((x) => x.name === 'Zaire Mitchell-Paden')?.sentence === 'Added tight end Zaire Mitchell-Paden, last with the Texans, before week 10.', 'Mitchell-Paden on Cleveland\'s card: added, last with the Texans');
  check(!all.some((x) => /\b(trade|traded|claim|claimed)\b/i.test(x.sentence)), 'negative: no sentence says trade or claim');
  check(all.filter((x) => /^Signed /.test(x.sentence)).every((x) => x.detail === 'signed' && !x.sentence.includes(' last with ') && !x.sentence.includes('practice squad')), 'negative: "Signed" appears only on rows that name no other team');
  check(Object.keys(d.meta.unknown_teams || {}).length === 0, 'every team code in the inputs is known after the alias map');
  check(!Object.entries(d.teams).some(([tm, v]) => v.some((x) => x.detail === 'released' && (d.meta.skipped_release_weeks || []).some((g) => g.team === tm && g.week === x.week))), 'no released item from a skipped snapshot week');
}

console.log(`\ntest-build-team-changes: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
