#!/usr/bin/env node
/**
 * backtest-next-man-up.mjs — model build part 3 (2026-11-22, Mason: "Yeah,
 * build it"; condition 1: tested on weeks played, ships only if it beats
 * having no term).
 *
 * His design, part 3: "A major injury triggers a recalculation." Part 0 sets
 * a player on a reserve list or ruled out to 0. Question: when that happens,
 * does giving a share f of his weekly number to his teammates at the same
 * position, split in proportion to their own numbers, bring THEIR numbers
 * closer to what they scored?
 *
 * Population, weeks 2 to 10: every player on that week's nflverse roster
 * (status ACT or INA, minus anyone that week's Friday report rules Out) with
 * a pace on the player board, at QB, RB, WR or TE. Out that week: anyone on
 * the roster that week with status RES (a reserve list) or ruled Out on the
 * Friday report, with a pace. A player who is gone from the roster entirely
 * is not counted as out (he left; his share was never on this team's board).
 * Base: the 2025 pace, or with --base-k K the 2026-learned base of
 * backtest-opponent-term.mjs (K x 2025 pace + his 2026 points) / (K + games).
 * f in {0 (none), 0.25, 0.5, 0.75, 1}; f = 1 (the team's points at the
 * position are kept whole) is the design value fixed in advance.
 *
 * Redesign, the same day, after the split above failed (teammates picked up
 * about 3% of the vacated points that way): the next man in line takes the
 * role. Order each team-week-position group by base, the starters being the
 * top N (QB 1, RB 2, WR 3, TE 1). When a starter is out, the best active
 * player below the starting line takes his place and is projected at
 * max(his own base, g x the starter's base), g in {0.25, 0.5, 0.75, 1}.
 * One redesign only; if it fails too, part 3 stops at part 0's zero.
 *
 * Usage: node scripts/backtest-next-man-up.mjs --roster-2026 <csv> [--base-k K] [--out <json>]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { parseCSV, normTeam } from './_lib/nflverse.js';
import { actualsCompleteness } from './_lib/kickoff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
const argVal = (k, d = null) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const ROSTER_2026 = argVal('--roster-2026');
const OUT = argVal('--out');
const BASE_K = argVal('--base-k') == null ? null : Number(argVal('--base-k'));
if (!ROSTER_2026) { console.error('need --roster-2026'); process.exit(2); }
if (BASE_K != null && !(BASE_K > 0)) { console.error('--base-k must be above 0'); process.exit(2); }
const POS = ['QB', 'RB', 'WR', 'TE'];
const F_GRID = [0, 0.25, 0.5, 0.75, 1];
const F_DESIGN = 1;
const r3 = x => Math.round(x * 1000) / 1000;

const actuals = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/intelligence/weekly_actuals_2026.json'), 'utf8'));
const { SCHEDULE_2026 } = await import(pathToFileURL(path.join(REPO, 'src/data/schedule2026.js')).href);
const { PLAYER_BOARD_2026 } = await import(pathToFileURL(path.join(REPO, 'src/data/playerBoard2026.js')).href);
const inj = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/intelligence/injuries_2026.json'), 'utf8'));
const roster = parseCSV(fs.readFileSync(ROSTER_2026, 'utf8'));
const comp = actualsCompleteness(SCHEDULE_2026, actuals.rows);
const complete = Object.keys(comp).map(Number).filter(w => comp[w].complete).sort((a, b) => a - b);

const pace = new Map(PLAYER_BOARD_2026.filter(p => p.gsis_id && p.projection_pts != null && POS.includes(p.pos)).map(p => [p.gsis_id, { pace: p.projection_pts / 17, pos: p.pos }]));
const outWk = new Set();
for (const p of inj.players || []) for (const wk of p.weeks || []) if (wk.report_status === 'Out') outWk.add(`${p.gsis_id}_${wk.week}`);
const actualBy = new Map(actuals.rows.map(r => [`${r.gsis_id}_${r.week}`, r.fantasy_points_graded ?? 0]));
const gamesBy = new Map();
for (const r of actuals.rows) { if (!gamesBy.has(r.gsis_id)) gamesBy.set(r.gsis_id, []); gamesBy.get(r.gsis_id).push({ week: r.week, pts: r.fantasy_points_graded ?? 0 }); }
function baseFor(gsis, pace25, W) {
  if (BASE_K == null) return pace25;
  const g = (gamesBy.get(gsis) || []).filter(x => x.week < W && complete.includes(x.week));
  return (BASE_K * pace25 + g.reduce((s, x) => s + x.pts, 0)) / (BASE_K + g.length);
}
// Team-week-position groups.
const groups = new Map(); // `${team}_${W}_${pos}` -> { active: [], out: [] }
const seen = new Set();
for (const r of roster) {
  const W = Number(r.week);
  if ((r.game_type || 'REG') !== 'REG' || W < 2 || !complete.includes(W)) continue;
  const pl = pace.get(r.gsis_id); if (!pl) continue;
  const key = `${r.gsis_id}_${W}`; if (seen.has(key)) continue; seen.add(key);
  const gk = `${normTeam(r.team)}_${W}_${pl.pos}`;
  if (!groups.has(gk)) groups.set(gk, { active: [], out: [] });
  const base = baseFor(r.gsis_id, pl.pace, W);
  const isOut = r.status === 'RES' || (['ACT', 'INA'].includes(r.status) && outWk.has(key));
  if (isOut) groups.get(gk).out.push({ gsis_id: r.gsis_id, base });
  else if (['ACT', 'INA'].includes(r.status)) groups.get(gk).active.push({ gsis_id: r.gsis_id, week: W, pos: pl.pos, base, actual: actualBy.get(key) ?? 0 });
}
const STARTERS = { QB: 1, RB: 2, WR: 3, TE: 1 };
const rows = [];
for (const g of groups.values()) {
  // Role redesign: who was in the starting line before anyone was out.
  const all = [...g.active.map(a => ({ ...a, isOut: false })), ...g.out.map(o => ({ ...o, isOut: true }))].sort((a, b) => b.base - a.base);
  const pos = g.active[0]?.pos;
  const n = pos ? STARTERS[pos] : 0;
  const outStarters = all.slice(0, n).filter(x => x.isOut).map(x => x.base).sort((a, b) => b - a);
  const bench = all.slice(n).filter(x => !x.isOut).map(x => x.gsis_id); // in base order
  const inherit = new Map(); outStarters.forEach((b, i) => { if (bench[i]) inherit.set(bench[i], b); });
  for (const a of g.active) a.inherits = inherit.get(a.gsis_id) || 0;
  const vacated = g.out.reduce((s, x) => s + x.base, 0);
  const activeSum = g.active.reduce((s, x) => s + x.base, 0);
  for (const a of g.active) rows.push({ ...a, vacated, share: activeSum > 0 ? a.base / activeSum : 0 });
}
const arms = Object.fromEntries(F_GRID.map(f => [`f_${f}`, x => x.base + f * x.vacated * x.share]));
for (const g of [0.25, 0.5, 0.75, 1]) arms[`role_${g}`] = x => x.inherits ? Math.max(x.base, g * x.inherits) : x.base;
function mae(fn, rs) { let s = 0; for (const x of rs) s += Math.abs(x.actual - fn(x)); return rs.length ? s / rs.length : null; }
const touched = rows.filter(x => x.vacated > 0 && x.share > 0);
const inheritors = rows.filter(x => x.inherits > 0);
let seed = 20261122; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
function ci(fa, fb, rs, B = 2000) {
  const by = {}; for (const x of rs) (by[x.gsis_id] ||= []).push(Math.abs(x.actual - fa(x)) - Math.abs(x.actual - fb(x)));
  const ids = Object.keys(by); const v = [];
  for (let b = 0; b < B; b++) { let s = 0, c = 0; for (let i = 0; i < ids.length; i++) for (const d of by[ids[Math.floor(rnd() * ids.length)]]) { s += d; c++; } v.push(s / c); }
  v.sort((a, b) => a - b); const all = Object.values(by).flat();
  return { diff: r3(all.reduce((a, b) => a + b, 0) / all.length), ci95: [r3(v[Math.floor(B * 0.025)]), r3(v[Math.floor(B * 0.975)])] };
}
const res = {};
for (const [k, fn] of Object.entries(arms)) {
  res[k] = { mae_all: r3(mae(fn, rows)), mae_touched: r3(mae(fn, touched)), by_pos_touched: Object.fromEntries(POS.map(p => [p, r3(mae(fn, touched.filter(x => x.pos === p)) ?? NaN)])),
    weeks_better_than_none: complete.filter(W => W >= 2 && mae(fn, touched.filter(x => x.week === W)) < mae(arms.f_0, touched.filter(x => x.week === W))).length };
  if (k !== 'f_0') res[k].touched_minus_none = ci(fn, arms.f_0, touched);
}
// How much of the vacated points the teammates actually picked up: slope of
// (actual - base) on (vacated x share), through the origin, touched rows.
let sxy = 0, sxx = 0; for (const x of touched) { const z = x.vacated * x.share; sxy += z * (x.actual - x.base); sxx += z * z; }
const roleRes = {};
for (const g of [0.25, 0.5, 0.75, 1]) {
  const fn = arms[`role_${g}`];
  roleRes[`role_${g}`] = { mae_inheritors: r3(mae(fn, inheritors)), mae_inheritors_none: r3(mae(arms.f_0, inheritors)), mae_all: r3(mae(fn, rows)), inheritors_minus_none: ci(fn, arms.f_0, inheritors),
    weeks_better_than_none: complete.filter(W => W >= 2 && inheritors.some(x => x.week === W) && mae(fn, inheritors.filter(x => x.week === W)) < mae(arms.f_0, inheritors.filter(x => x.week === W))).length };
}
let iy = 0, ix = 0; for (const x of inheritors) { const z = x.inherits - x.base; if (z <= 0) continue; iy += z * (x.actual - x.base); ix += z * z; }
const out = { role_redesign: { inheritors: inheritors.length, picked_up_slope: r3(ix ? iy / ix : 0), results: roleRes }, generated_utc: new Date().toISOString(), base: BASE_K == null ? '2025 pace' : `2025 pace blended with 2026 games, K = ${BASE_K}`, f_design: F_DESIGN,
  rows: rows.length, rows_touched: touched.length, weeks: [...new Set(rows.map(x => x.week))].sort((a, b) => a - b), share_picked_up_slope: r3(sxx ? sxy / sxx : 0), results: res,
  note: 'touched = players with a teammate at their position out that week; minus_none negative = closer than no redistribution; ci95 over 2000 resamples of players (seed 20261122)' };
console.log(`Back-test, part 3 (base: ${out.base}): next man up, weeks ${out.weeks.join(', ')}; ${rows.length} player-weeks, ${touched.length} with a teammate out at their position`);
console.log(`  share of the vacated points the teammates picked up (slope): ${out.share_picked_up_slope}`);
for (const [k, v] of Object.entries(res)) console.log(`  ${k.padEnd(7)} MAE all ${v.mae_all.toFixed(3)}  touched ${v.mae_touched.toFixed(3)}  QB ${v.by_pos_touched.QB} RB ${v.by_pos_touched.RB} WR ${v.by_pos_touched.WR} TE ${v.by_pos_touched.TE}  weeks better ${v.weeks_better_than_none}${v.touched_minus_none ? `  minus none ${v.touched_minus_none.diff} [${v.touched_minus_none.ci95.join(', ')}]` : ''}`);
console.log(`  role redesign: ${inheritors.length} player-weeks where the next man in line took a starter's place; share of the gap he picked up (slope): ${out.role_redesign.picked_up_slope}`);
for (const [k, v] of Object.entries(roleRes)) console.log(`  ${k.padEnd(10)} MAE inheritors ${v.mae_inheritors.toFixed(3)} (none ${v.mae_inheritors_none.toFixed(3)})  all ${v.mae_all.toFixed(3)}  weeks better ${v.weeks_better_than_none}  minus none ${v.inheritors_minus_none.diff} [${v.inheritors_minus_none.ci95.join(', ')}]`);
if (OUT) { fs.writeFileSync(OUT, JSON.stringify(out, null, 2)); console.log(`wrote ${OUT}`); }
