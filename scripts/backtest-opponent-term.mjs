#!/usr/bin/env node
/**
 * backtest-opponent-term.mjs — model build part 1 (2026-11-22, Mason: "Yeah,
 * build it"; condition 1: tested on weeks already played, ships only if it
 * beats having no term).
 *
 * His design, part 1: "Each player rated against that week's opponent, every
 * week, from the schedule." Question: does scaling a player's weekly number
 * by how his opponent's defence does against his position bring it closer to
 * what he scored?
 *
 * Population, weeks 2 to 10: every player on that week's nflverse roster
 * (status ACT or INA, minus anyone that week's Friday report rules Out) with
 * a 2025 pace on the player board (projection_pts / 17), at QB, RB, WR or TE.
 * Actual = his graded points that week, 0 with no stat line. The base is the
 * 2025 pace, the same base the weekly board uses; it is used for every week
 * because the week 1 to 7 snapshots already carry the old defence term.
 *
 * Term: projection x (1 + b x d / L), where d is the defence's estimated
 * deviation against the position (points per game above the league average,
 * from data before week W) and L is the league average for the position to
 * date. Estimates of d: prior (2025), season (2026 to date), blend_4 (his
 * weight: 2026 half by game 4), each with b = 1 (face value) and b fitted
 * walk-forward on earlier weeks only (0 until 2,000 earlier player rows).
 * The old E-034 term, a flat plus-or-minus 4 points, is not retested here.
 *
 * A second opponent signal, added the same day: the betting line. Each
 * team's implied points = (total + spread) / 2 at home, (total - spread) / 2
 * away (nflverse spread_line is the home margin). The line is read from
 * schedule2026.js as committed before the week's first kickoff (git history,
 * refreshed each Monday), not today's file, so no closing line leaks in. The
 * term is projection x (1 + b x (implied / league-average implied - 1)).
 * Weeks whose pre-kickoff file has no line for a game skip that game's rows
 * in this arm only (counted in the output).
 *
 * --base-k K (the Week 8 re-test of 2026 player learning, which never ran;
 * added the same day): the base becomes (K x 2025 pace + points in his 2026
 * games before week W) / (K + those games), a game counted when he has a stat
 * line. K = 0 is not allowed; omit the flag for the 2025 pace alone.
 *
 * Usage: node scripts/backtest-opponent-term.mjs --roster-2026 <csv> [--base-k K] [--git-ref <ref>] [--out <json>]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';
import { parseCSV, normTeam } from './_lib/nflverse.js';
import { actualsCompleteness, firstKickoffUtcMs } from './_lib/kickoff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
const argVal = (k, d = null) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const ROSTER_2026 = argVal('--roster-2026');
const OUT = argVal('--out');
if (!ROSTER_2026) { console.error('need --roster-2026'); process.exit(2); }
const POS = ['QB', 'RB', 'WR', 'TE'];
const r3 = x => Math.round(x * 1000) / 1000;

const actuals = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/intelligence/weekly_actuals_2026.json'), 'utf8'));
const { DEFENSE_2025 } = await import(pathToFileURL(path.join(REPO, 'src/data/defense2025.js')).href);
const { SCHEDULE_2026 } = await import(pathToFileURL(path.join(REPO, 'src/data/schedule2026.js')).href);
const { PLAYER_BOARD_2026 } = await import(pathToFileURL(path.join(REPO, 'src/data/playerBoard2026.js')).href);
const inj = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/intelligence/injuries_2026.json'), 'utf8'));
const roster = parseCSV(fs.readFileSync(ROSTER_2026, 'utf8'));

const comp = actualsCompleteness(SCHEDULE_2026, actuals.rows);
const complete = Object.keys(comp).map(Number).filter(w => comp[w].complete).sort((a, b) => a - b);
const teams = Object.keys(DEFENSE_2025).sort();

// Defence: points allowed per position per game, 2026, from actuals by opponent.
const allowed = {};
for (const r of actuals.rows) {
  if (!POS.includes(r.pos) || !r.opponent) continue;
  const k = `${normTeam(r.opponent)}_${r.week}`;
  allowed[k] ||= { QB: 0, RB: 0, WR: 0, TE: 0 };
  allowed[k][r.pos] += r.fantasy_points_graded ?? 0;
}
const mean25 = {}, dev25 = {};
for (const p of POS) {
  const f = `fpts_allowed_${p.toLowerCase()}_per_game`;
  mean25[p] = teams.reduce((s, t) => s + DEFENSE_2025[t][f], 0) / teams.length;
  for (const t of teams) (dev25[t] ||= {})[p] = DEFENSE_2025[t][f] - mean25[p];
}
function defenceAt(t, W) {
  const before = complete.filter(w => w < W);
  const lg = {}, seasonDev = {};
  const games = before.filter(w => allowed[`${t}_${w}`]);
  for (const p of POS) {
    const vals = []; for (const w of before) for (const u of teams) if (allowed[`${u}_${w}`]) vals.push(allowed[`${u}_${w}`][p]);
    lg[p] = vals.reduce((a, b) => a + b, 0) / vals.length;
    seasonDev[p] = games.length ? games.reduce((s, w) => s + allowed[`${t}_${w}`][p], 0) / games.length - lg[p] : 0;
  }
  return { lg, n: games.length, seasonDev };
}

const pace = new Map(PLAYER_BOARD_2026.filter(p => p.gsis_id && p.projection_pts != null && POS.includes(p.pos)).map(p => [p.gsis_id, { pace: p.projection_pts / 17, pos: p.pos, name: p.name }]));
const outWk = new Set();
for (const p of inj.players || []) for (const wk of p.weeks || []) if (wk.report_status === 'Out') outWk.add(`${p.gsis_id}_${wk.week}`);
const oppOf = {};
for (const [t, td] of Object.entries(SCHEDULE_2026.teams || {})) for (const g of td.games || []) {
  if ((g.game_type || 'REG') !== 'REG') continue;
  oppOf[`${normTeam(t)}_${g.week}`] = normTeam(g.home === t ? g.away : g.home);
}
const actualBy = new Map(actuals.rows.map(r => [`${r.gsis_id}_${r.week}`, r.fantasy_points_graded ?? 0]));
const BASE_K = argVal('--base-k') == null ? null : Number(argVal('--base-k'));
if (BASE_K != null && !(BASE_K > 0)) { console.error('--base-k must be above 0'); process.exit(2); }
const gamesBy = new Map(); // gsis -> [{week, pts}]
for (const r of actuals.rows) { if (!gamesBy.has(r.gsis_id)) gamesBy.set(r.gsis_id, []); gamesBy.get(r.gsis_id).push({ week: r.week, pts: r.fantasy_points_graded ?? 0 }); }
function baseFor(gsis, pace25, W) {
  if (BASE_K == null) return pace25;
  const g = (gamesBy.get(gsis) || []).filter(x => x.week < W && complete.includes(x.week));
  return (BASE_K * pace25 + g.reduce((s, x) => s + x.pts, 0)) / (BASE_K + g.length);
}

// Pre-kickoff lines per team-week, from git history of schedule2026.js.
const GIT_REF = argVal('--git-ref', 'HEAD');
const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 28 });
const schedHist = git('log', '--reverse', '--format=%H %cI', GIT_REF, '--', 'src/data/schedule2026.js').trim().split('\n').map(l => { const [sha, iso] = l.split(' '); return { sha, t: Date.parse(iso) }; });
const implied = {}; const lineSource = {};
for (const W of complete) {
  const ko = firstKickoffUtcMs(SCHEDULE_2026, W);
  let pick = null; for (const h of schedHist) { if (h.t < ko) pick = h; else break; }
  if (!pick) continue;
  const src = git('show', `${pick.sha}:src/data/schedule2026.js`);
  const S = JSON.parse(src.match(/export const SCHEDULE_2026 = ({[\s\S]*?});/)[1]);
  let n = 0;
  for (const g of S.byWeek?.[W] || []) {
    if (g.spread_line == null || g.total_line == null) continue;
    implied[`${normTeam(g.home)}_${W}`] = (g.total_line + g.spread_line) / 2;
    implied[`${normTeam(g.away)}_${W}`] = (g.total_line - g.spread_line) / 2;
    n++;
  }
  lineSource[W] = { commit: pick.sha.slice(0, 7), committed: new Date(pick.t).toISOString(), games_with_line: n };
}
const impliedVals = Object.values(implied);
const impliedMean = impliedVals.reduce((a, b) => a + b, 0) / impliedVals.length;

const defCache = new Map();
const rows = [];
const seen = new Set();
for (const r of roster) {
  const W = Number(r.week);
  if ((r.game_type || 'REG') !== 'REG' || !['ACT', 'INA'].includes(r.status) || W < 2 || !complete.includes(W)) continue;
  const pl = pace.get(r.gsis_id); if (!pl) continue;
  const key = `${r.gsis_id}_${W}`; if (seen.has(key) || outWk.has(key)) continue; seen.add(key);
  const opp = oppOf[`${normTeam(r.team)}_${W}`]; if (!opp || !dev25[opp]) continue;
  const dk = `${opp}_${W}`; if (!defCache.has(dk)) defCache.set(dk, defenceAt(opp, W));
  const d = defCache.get(dk);
  const p = pl.pos;
  const blend4 = (4 * dev25[opp][p] + d.n * d.seasonDev[p]) / (4 + d.n);
  rows.push({ week: W, gsis_id: r.gsis_id, pos: p, base: baseFor(r.gsis_id, pl.pace, W), pace25: pl.pace, actual: actualBy.get(key) ?? 0,
    rel: { prior: dev25[opp][p] / d.lg[p], season: d.seasonDev[p] / d.lg[p], blend_4: blend4 / d.lg[p],
      implied: implied[`${normTeam(r.team)}_${W}`] != null ? implied[`${normTeam(r.team)}_${W}`] / impliedMean - 1 : null } });
}

function mae(fn, rs = rows) { let a = 0; for (const x of rs) a += Math.abs(x.actual - fn(x)); return a / rs.length; }
function fitB(est, rs) { // least squares b in actual - base = b * base * rel
  let sxy = 0, sxx = 0; for (const x of rs) { const z = x.base * x.rel[est]; sxy += z * (x.actual - x.base); sxx += z * z; } return sxx ? sxy / sxx : 0;
}
const withLine = rows.filter(x => x.rel.implied != null).length;
for (const x of rows) if (x.rel.implied == null) x.rel.implied = 0; // no line: no adjustment
const arms = { none: x => x.base };
const fitted = {};
for (const est of ['prior', 'season', 'blend_4', 'implied']) {
  arms[`${est}_face`] = x => Math.max(0, x.base * (1 + x.rel[est]));
  const bByWeek = {};
  for (const W of complete) { const prior = rows.filter(x => x.week < W); bByWeek[W] = prior.length < 2000 ? 0 : Math.max(0, fitB(est, prior)); }
  fitted[est] = { b_by_week: Object.fromEntries(Object.entries(bByWeek).map(([k, v]) => [k, r3(v)])), b_all_weeks_in_sample: r3(fitB(est, rows)) };
  arms[`${est}_fitted`] = x => Math.max(0, x.base * (1 + bByWeek[x.week] * x.rel[est]));
}
let seed = 20261122; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
function ci(fa, fb, B = 2000) {
  const byWk = {}; for (const x of rows) (byWk[`${x.gsis_id}`] ||= []).push(Math.abs(x.actual - fa(x)) - Math.abs(x.actual - fb(x)));
  const ids = Object.keys(byWk); const v = [];
  for (let b = 0; b < B; b++) { let s = 0, c = 0; for (let i = 0; i < ids.length; i++) { for (const d of byWk[ids[Math.floor(rnd() * ids.length)]]) { s += d; c++; } } v.push(s / c); }
  v.sort((a, b) => a - b); const all = Object.values(byWk).flat();
  return { diff: r3(all.reduce((a, b) => a + b, 0) / all.length), ci95: [r3(v[Math.floor(B * 0.025)]), r3(v[Math.floor(B * 0.975)])] };
}
if (BASE_K != null) arms.pace_2025_only = x => x.pace25; // the base before learning, for the learning comparison
const res = {};
for (const [k, fn] of Object.entries(arms)) {
  res[k] = { mae: r3(mae(fn)), by_pos: Object.fromEntries(POS.map(p => [p, r3(mae(fn, rows.filter(x => x.pos === p)))])), weeks_beating_none: complete.filter(W => W >= 2 && mae(fn, rows.filter(x => x.week === W)) < mae(arms.none, rows.filter(x => x.week === W))).length };
  if (k !== 'none') res[k].minus_none = ci(fn, arms.none);
}
const out = { generated_utc: new Date().toISOString(), base: BASE_K == null ? '2025 pace' : `2025 pace blended with 2026 games, K = ${BASE_K}`, line_source_by_week: lineSource, rows_with_pre_kickoff_line: withLine, implied_mean: r3(impliedMean), weeks: [...new Set(rows.map(x => x.week))].sort((a, b) => a - b), rows: rows.length, players: new Set(rows.map(x => x.gsis_id)).size, results: res, fitted,
  note: 'minus_none: negative = closer to the result than no term; ci95 from 2000 resamples of players (seed 20261122)' };
console.log(`Back-test, part 1 (base: ${out.base}): opponent term on player projections, weeks ${out.weeks.join(', ')}; ${rows.length} player-weeks, ${out.players} players; ${withLine} with a pre-kickoff line`);
console.log(`  lines: ${Object.entries(lineSource).map(([w, v]) => `w${w} ${v.commit} ${v.games_with_line} games`).join('; ')}`);
for (const [k, v] of Object.entries(res)) console.log(`  ${k.padEnd(15)} MAE ${v.mae.toFixed(3)}  QB ${v.by_pos.QB} RB ${v.by_pos.RB} WR ${v.by_pos.WR} TE ${v.by_pos.TE}  weeks better than none ${v.weeks_beating_none}${v.minus_none ? `  minus none ${v.minus_none.diff} [${v.minus_none.ci95.join(', ')}]` : ''}`);
for (const [k, v] of Object.entries(fitted)) console.log(`  fitted b, ${k}: in-sample ${v.b_all_weeks_in_sample}; walk-forward ${JSON.stringify(v.b_by_week)}`);
if (OUT) { fs.writeFileSync(OUT, JSON.stringify(out, null, 2)); console.log(`wrote ${OUT}`); }
