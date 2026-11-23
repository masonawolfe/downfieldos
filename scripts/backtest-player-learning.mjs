#!/usr/bin/env node
/**
 * backtest-player-learning.mjs — 2026 player learning (2026-11-22, Mason:
 * "I want the player's number to learn from the season"; _FROM_COS.md
 * 2026-11-22 17:49). The test his yes rests on, rebuilt so it runs on the
 * repo's own files (no download), and committed with the change.
 *
 * Rule tested: base = (K x 2025 pace + his 2026 points) / (K + his 2026 games),
 * where 2025 pace = projection_pts / 17 from playerBoard2026.js (the base the
 * weekly board uses), and his 2026 games are the complete weeks before week W
 * in which he has a stat line in weekly_actuals_2026.json. K = 4 is fixed in
 * advance (2026 takes half the weight at his 4th game); the other K values
 * are a sensitivity check, not a search.
 *
 * Population (the board's own): every row of each week's frozen pre-kickoff
 * snapshot (src/data/intelligence/weekly_projections/2026-wNN.json) with a
 * projection, weeks 2 to the last complete week, QB, RB, WR and TE. Actual =
 * his graded points that week, 0 with no stat line. Part 0's rule (a player
 * on a reserve list at the Tuesday freeze is projected 0) is applied to every
 * arm alike, availability read from git as committed 60 hours before the
 * week's first kickoff, as production does. The snapshot's own weekly_value
 * is NOT the base: the weeks 1 to 7 seeds carry the retired plus or minus 4
 * defence term.
 *
 * Fails loudly: under two commits of availability history (a shallow
 * clone), or no week graded.
 *
 * The committed result (data/backtests/player-learning.json) is what switches
 * a position on in the board: a position learns when its interval in
 * design_minus_pace_by_pos lies wholly below zero (scripts/_lib/learning.js).
 * Re-run weekly and commit the file to re-check tight ends.
 *
 * Usage: node scripts/backtest-player-learning.mjs [--git-ref <ref>] [--out <json>]   (--out defaults to nothing; the board's file is data/backtests/player-learning.json)
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { actualsCompleteness, firstKickoffUtcMs } from './_lib/kickoff.js';
import { LEARNING_K, LEARNING_BACKTEST } from './_lib/learning.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
const argVal = (k, d = null) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const REF = argVal('--git-ref', 'HEAD');
const OUT = argVal('--out');
const POS = ['QB', 'RB', 'WR', 'TE'];
const K_DESIGN = LEARNING_K;
const K_GRID = [2, 3, 4, 5, 6, 8, 12];
const RESERVE = new Set(['IR', 'PUP', 'SUSP', 'NFI']);
const AV = 'src/data/intelligence/availability_2026.json';
const r3 = x => Math.round(x * 1000) / 1000;

const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 28 });
const hist = git('log', '--reverse', '--format=%H %cI', REF, '--', AV).trim().split('\n').filter(Boolean).map(l => { const [sha, iso] = l.split(' '); return { sha, t: Date.parse(iso) }; });
if (hist.length < 2) { console.error(`backtest refused: ${hist.length} commit(s) of ${AV}; unshallow the clone (git fetch --unshallow).`); process.exit(1); }
const avCache = new Map();
function reserveAt(t) {
  let pick = null; for (const h of hist) { if (h.t <= t) pick = h; else break; }
  if (!pick) return null;
  if (!avCache.has(pick.sha)) {
    const players = JSON.parse(git('show', `${pick.sha}:${AV}`)).players || {};
    avCache.set(pick.sha, new Set(Object.entries(players).filter(([, a]) => RESERVE.has(a.status)).map(([id]) => id)));
  }
  return avCache.get(pick.sha);
}

const { SCHEDULE_2026 } = await import(pathToFileURL(path.join(REPO, 'src/data/schedule2026.js')).href);
const { PLAYER_BOARD_2026 } = await import(pathToFileURL(path.join(REPO, 'src/data/playerBoard2026.js')).href);
const actuals = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/intelligence/weekly_actuals_2026.json'), 'utf8'));
const comp = actualsCompleteness(SCHEDULE_2026, actuals.rows);
const complete = Object.keys(comp).map(Number).filter(w => comp[w].complete).sort((a, b) => a - b);
const actualBy = new Map(actuals.rows.map(r => [`${r.gsis_id}_${r.week}`, r.fantasy_points_graded ?? 0]));
const gamesBy = new Map();
for (const r of actuals.rows) { if (!complete.includes(r.week)) continue; if (!gamesBy.has(r.gsis_id)) gamesBy.set(r.gsis_id, []); gamesBy.get(r.gsis_id).push({ week: r.week, pts: r.fantasy_points_graded ?? 0 }); }
const pace = new Map(PLAYER_BOARD_2026.filter(p => p.gsis_id && p.projection_pts != null).map(p => [p.gsis_id, p.projection_pts / 17]));

export function learnedBase(pace25, games, K) {
  const n = games.length;
  return (K * pace25 + games.reduce((s, g) => s + g.pts, 0)) / (K + n);
}

const SNAP_DIR = path.join(REPO, 'src/data/intelligence/weekly_projections');
const rows = [];
const asOfByWeek = {};
for (const f of fs.readdirSync(SNAP_DIR).filter(f => /^2026-w\d\d\.json$/.test(f)).sort()) {
  const snap = JSON.parse(fs.readFileSync(path.join(SNAP_DIR, f), 'utf8'));
  const W = snap.week;
  if (W < 2 || !complete.includes(W)) continue;
  const asOf = firstKickoffUtcMs(SCHEDULE_2026, W) - 60 * 3600e3;
  const reserve = reserveAt(asOf);
  if (!reserve) { console.error(`backtest incomplete: no availability file before week ${W}'s Tuesday`); process.exit(1); }
  asOfByWeek[W] = new Date(asOf).toISOString();
  for (const r of snap.rows) {
    if (r.weekly_value == null || !POS.includes(r.pos)) continue;
    const p25 = pace.get(r.gsis_id);
    if (p25 == null) continue;
    const games = (gamesBy.get(r.gsis_id) || []).filter(g => g.week < W);
    const out = reserve.has(r.gsis_id);
    const key = `${r.gsis_id}_${W}`;
    rows.push({ week: W, gsis_id: r.gsis_id, pos: r.pos, pace25: p25, games, out, actual: actualBy.has(key) ? actualBy.get(key) : 0, played: actualBy.has(key) });
  }
}
if (!rows.length) { console.error('backtest incomplete: no week graded'); process.exit(1); }

const arms = { pace_2025: x => (x.out ? 0 : x.pace25) };
for (const K of K_GRID) arms[`learned_k${K}`] = x => (x.out ? 0 : learnedBase(x.pace25, x.games, K));
arms[`learned_k${K_DESIGN}_not_te`] = x => (x.out ? 0 : x.pos === 'TE' ? x.pace25 : learnedBase(x.pace25, x.games, K_DESIGN));

const mae = (fn, rs) => rs.reduce((s, x) => s + Math.abs(x.actual - fn(x)), 0) / rs.length;
let seed = 20261122; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
function ci(fa, fb, rs, B = 2000) {
  const by = {}; for (const x of rs) (by[x.gsis_id] ||= []).push(Math.abs(x.actual - fa(x)) - Math.abs(x.actual - fb(x)));
  const ids = Object.keys(by); const v = [];
  for (let b = 0; b < B; b++) { let s = 0, c = 0; for (let i = 0; i < ids.length; i++) for (const d of by[ids[Math.floor(rnd() * ids.length)]]) { s += d; c++; } v.push(s / c); }
  v.sort((a, b) => a - b); const all = Object.values(by).flat();
  return { diff: r3(all.reduce((a, b) => a + b, 0) / all.length), ci95: [r3(v[Math.floor(B * 0.025)]), r3(v[Math.floor(B * 0.975)])] };
}
const weeks = [...new Set(rows.map(x => x.week))].sort((a, b) => a - b);
const res = {};
for (const [k, fn] of Object.entries(arms)) {
  res[k] = {
    mae: r3(mae(fn, rows)),
    by_pos: Object.fromEntries(POS.map(p => [p, r3(mae(fn, rows.filter(x => x.pos === p)))])),
    weeks_better_than_pace: k === 'pace_2025' ? null : weeks.filter(W => mae(fn, rows.filter(x => x.week === W)) < mae(arms.pace_2025, rows.filter(x => x.week === W))).length,
  };
  if (k !== 'pace_2025') res[k].minus_pace = ci(fn, arms.pace_2025, rows);
}
const design = arms[`learned_k${K_DESIGN}`];
const byPosCI = Object.fromEntries(POS.map(p => [p, ci(design, arms.pace_2025, rows.filter(x => x.pos === p))]));
const playedOnly = rows.filter(x => x.played);
const positionsThatClear = POS.filter(p => byPosCI[p].ci95[1] < 0);
const out = {
  generated_utc: new Date().toISOString(),
  k_design: K_DESIGN,
  positions_that_clear: positionsThatClear,
  positions_rule: 'a position learns in the board when its design_minus_pace_by_pos ci95 lies wholly below zero (scripts/_lib/learning.js reads this file)',
  quote: `all positions at K ${K_DESIGN}: ${res[`learned_k${K_DESIGN}`].minus_pace.diff} [${res[`learned_k${K_DESIGN}`].minus_pace.ci95.join(', ')}], ${res[`learned_k${K_DESIGN}`].weeks_better_than_pace} of ${weeks.length} weeks; with only the positions that clear (chosen after seeing this data): ${res[`learned_k${K_DESIGN}_not_te`].minus_pace.diff} [${res[`learned_k${K_DESIGN}_not_te`].minus_pace.ci95.join(', ')}], ${res[`learned_k${K_DESIGN}_not_te`].weeks_better_than_pace} of ${weeks.length} weeks`,
  git_ref: REF,
  rule: `base = (K x 2025 pace + 2026 points) / (K + 2026 games), K = ${K_DESIGN} fixed in advance`,
  population: 'every projected row of each frozen snapshot, weeks 2 to the last complete week, QB/RB/WR/TE with a 2025 pace; no stat line = 0; part 0 applied at the Tuesday freeze to every arm',
  weeks, rows: rows.length, players: new Set(rows.map(x => x.gsis_id)).size, rows_without_stat_line: rows.length - playedOnly.length,
  availability_as_of: asOfByWeek,
  results: res,
  design_minus_pace_by_pos: byPosCI,
  design_minus_pace_players_who_played: ci(design, arms.pace_2025, playedOnly),
  note: 'minus_pace negative = a smaller average miss than the 2025 pace; ci95 from 2000 resamples of players (seed 20261122)',
};
console.log(`Back-test, 2026 player learning: weeks ${weeks.join(', ')}; ${rows.length} projected player-weeks, ${out.players} players, ${out.rows_without_stat_line} without a stat line`);
for (const [k, v] of Object.entries(res)) console.log(`  ${k.padEnd(19)} MAE ${v.mae.toFixed(3)}  QB ${v.by_pos.QB} RB ${v.by_pos.RB} WR ${v.by_pos.WR} TE ${v.by_pos.TE}${v.minus_pace ? `  minus pace ${v.minus_pace.diff} [${v.minus_pace.ci95.join(', ')}]  weeks better ${v.weeks_better_than_pace} of ${weeks.length}` : ''}`);
for (const [p, v] of Object.entries(byPosCI)) console.log(`  K=${K_DESIGN} minus pace, ${p}: ${v.diff} [${v.ci95.join(', ')}]`);
console.log(`  K=${K_DESIGN} minus pace, players who played only: ${out.design_minus_pace_players_who_played.diff} [${out.design_minus_pace_players_who_played.ci95.join(', ')}]`);
if (OUT) { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n'); console.log(`wrote ${OUT}`); }
