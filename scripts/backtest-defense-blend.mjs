#!/usr/bin/env node
/**
 * backtest-defense-blend.mjs — model build part 2 (2026-11-22, Mason: "Yeah,
 * build it"; 00_System/DECISIONS.md 2026-11-22).
 *
 * His design, part 2: "How good each defence is against each position: last
 * season plus the offseason changes at the start, each game added as it is
 * played, this season carrying the weight by about game 4 or 5."
 *
 * Question: for each defence, position and 2026 week W, which estimate made
 * from what was known BEFORE week W comes closest to the fantasy points that
 * defence actually allowed to that position in week W?
 *
 * Every estimate is a deviation from the league average for the position, so
 * the two seasons' scoring differences cancel:
 *   none          league average to date, no team information
 *   prior         2025 only (src/data/defense2025.js)
 *   season        2026 games to date only
 *   blend_k       (k x prior + n x season) / (k + n), n = 2026 games played
 *                 before W. k = 4 is fixed in advance from his words (2026
 *                 takes half the weight at game 4); the other k values are a
 *                 sensitivity check, not a search.
 *   blend_k_cont  the same, with the prior scaled by the share of the team's
 *                 2025 defensive snaps played by men on its 2026 week 1 roster
 *                 ("the offseason changes")
 *   blend_k_flat  the same, with every prior scaled by the league-average
 *                 share, so that continuity is credited only if knowing WHICH
 *                 team lost its defenders beats shrinking every team alike
 *
 * Inputs: weekly_actuals_2026.json (points allowed, rebuilt by opponent, the
 * same join scripts/check-defense-field.mjs uses), defense2025.js, and two
 * nflverse files passed by path: snap_counts_2025.csv and
 * roster_weekly_2026.csv. No network call.
 *
 * --adjusted (the fair test, added the same day after the raw one): points
 * allowed depend mostly on which offence a defence faced. With --adjusted the
 * target and the 2026 history are RESIDUALS: points allowed to the position
 * minus what the frozen pre-kickoff snapshot (weekly_projections/2026-wNN.json)
 * projected for the opposing team's players at that position, with part 0's
 * rule applied as of each week's Tuesday (availability from git). "none" is
 * then the league-average residual to date (the model's own bias, which is
 * not defence information).
 *
 * --adjusted roster: the offence's expectation is instead the sum, over the
 * team's players on that week's nflverse roster (status ACT or INA, minus
 * anyone that week's Friday injury report rules Out), of each player's 2025
 * pace (playerBoard2026.js projection_pts / 17). It avoids the weeks 1 to 7
 * seeds, whose weekly_value already carries the old plus-or-minus 4 defence
 * term. It uses the week's roster, which is known by Friday; it does not use
 * the game-day inactive list.
 *
 * Usage: node scripts/backtest-defense-blend.mjs --snaps-2025 <csv> --roster-2026 <csv> [--adjusted] [--git-ref <ref>] [--out <json>]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';
import { parseCSV, normTeam } from './_lib/nflverse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
const argVal = (k, d = null) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SNAPS_2025 = argVal('--snaps-2025');
const ROSTER_2026 = argVal('--roster-2026');
const OUT = argVal('--out');
// --adjusted snapshot | roster (bare --adjusted = snapshot). See header.
const ADJ_I = args.indexOf('--adjusted');
const ADJUSTED = ADJ_I >= 0 ? ((args[ADJ_I + 1] && !args[ADJ_I + 1].startsWith('--')) ? args[ADJ_I + 1] : 'snapshot') : null;
if (ADJUSTED && !['snapshot', 'roster'].includes(ADJUSTED)) { console.error(`--adjusted takes snapshot or roster, not ${ADJUSTED}`); process.exit(2); }
const GIT_REF = argVal('--git-ref', 'HEAD');
// --from-week N grades only weeks N and later (history still starts at week 1).
const FROM_WEEK = Number(argVal('--from-week', '2'));
if (!SNAPS_2025 || !ROSTER_2026) { console.error('need --snaps-2025 and --roster-2026'); process.exit(2); }

const POS = ['QB', 'RB', 'WR', 'TE'];
const K_DESIGN = 4;
const K_GRID = [1, 2, 3, 4, 5, 6, 8, 12];

export function continuityByTeam(snapRows2025, rosterRows2026) {
  // 2026 week 1 team for each pfr id (the first REG week a player is listed).
  const team26 = new Map();
  const firstWeek = new Map();
  for (const r of rosterRows2026) {
    if ((r.game_type || 'REG') !== 'REG' || !r.pfr_id) continue;
    const w = Number(r.week);
    if (!firstWeek.has(r.pfr_id) || w < firstWeek.get(r.pfr_id)) { firstWeek.set(r.pfr_id, w); team26.set(r.pfr_id, normTeam(r.team)); }
  }
  // Week 1 only: a man signed in week 6 is not an offseason change.
  const wk1 = new Map([...team26].filter(([id]) => firstWeek.get(id) === 1));
  const tot = {}, kept = {};
  for (const r of snapRows2025) {
    if ((r.game_type || 'REG') !== 'REG') continue;
    const s = Number(r.defense_snaps) || 0;
    if (s <= 0) continue;
    const t = normTeam(r.team);
    tot[t] = (tot[t] || 0) + s;
    if (wk1.get(r.pfr_player_id) === t) kept[t] = (kept[t] || 0) + s;
  }
  const out = {};
  for (const t of Object.keys(tot)) out[t] = Math.round(((kept[t] || 0) / tot[t]) * 1000) / 1000;
  return out;
}

async function main() {
  const actuals = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/intelligence/weekly_actuals_2026.json'), 'utf8'));
  const d25mod = await import(pathToFileURL(path.join(REPO, 'src/data/defense2025.js')).href);
  const D25 = d25mod.DEFENSE_2025;
  const snaps = parseCSV(fs.readFileSync(SNAPS_2025, 'utf8'));
  const roster = parseCSV(fs.readFileSync(ROSTER_2026, 'utf8'));
  const cont = continuityByTeam(snaps, roster);
  const teams = Object.keys(D25).sort();
  const contMean = teams.reduce((s, t) => s + (cont[t] ?? 0), 0) / teams.length;

  // Points allowed: defence D, week W, position P. A defence "played" week W
  // when any actuals row has opponent D that week.
  const allowed = {}; // `${D}_${W}` -> {QB,RB,WR,TE}
  for (const r of actuals.rows) {
    if (!POS.includes(r.pos) || !r.opponent) continue;
    const key = `${normTeam(r.opponent)}_${r.week}`;
    allowed[key] ||= { QB: 0, RB: 0, WR: 0, TE: 0 };
    allowed[key][r.pos] += r.fantasy_points_graded ?? 0;
  }
  const weeks = [...new Set(actuals.rows.map(r => r.week))].sort((a, b) => a - b);
  // Only weeks every scheduled game is in (same rule as calibration).
  const { SCHEDULE_2026 } = await import(pathToFileURL(path.join(REPO, 'src/data/schedule2026.js')).href);
  const { actualsCompleteness, weekGames } = await import(pathToFileURL(path.join(REPO, 'scripts/_lib/kickoff.js')).href);
  const comp = actualsCompleteness(SCHEDULE_2026, actuals.rows);
  const complete = weeks.filter(w => comp[w]?.complete);

  // 2025 deviation from the 2025 league average, per position.
  const mean25 = {}; const dev25 = {};
  for (const p of POS) {
    const f = `fpts_allowed_${p.toLowerCase()}_per_game`;
    mean25[p] = teams.reduce((s, t) => s + D25[t][f], 0) / teams.length;
    for (const t of teams) (dev25[t] ||= {})[p] = D25[t][f] - mean25[p];
  }

  // --adjusted: what the frozen snapshot expected from the offence facing D.
  const expected = {}; // `${D}_${W}` -> {QB,RB,WR,TE}
  if (ADJUSTED === 'roster') {
    const pbMod = await import(pathToFileURL(path.join(REPO, 'src/data/playerBoard2026.js')).href);
    const pace = new Map(pbMod.PLAYER_BOARD_2026.filter(p => p.gsis_id && p.projection_pts != null && POS.includes(p.pos)).map(p => [p.gsis_id, { pace: p.projection_pts / 17, pos: p.pos }]));
    const inj = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/intelligence/injuries_2026.json'), 'utf8'));
    const outWk = new Set();
    for (const p of inj.players || []) for (const wk of p.weeks || []) if (wk.report_status === 'Out') outWk.add(`${p.gsis_id}_${wk.week}`);
    // Opponent per team-week from the schedule.
    const oppOf = {};
    for (const [t, td] of Object.entries(SCHEDULE_2026.teams || {})) for (const g of td.games || []) {
      if ((g.game_type || 'REG') !== 'REG') continue;
      oppOf[`${normTeam(t)}_${g.week}`] = normTeam(g.home === t ? g.away : g.home);
    }
    for (const r of roster) {
      if ((r.game_type || 'REG') !== 'REG' || !['ACT', 'INA'].includes(r.status)) continue;
      const pl = pace.get(r.gsis_id); if (!pl) continue;
      if (outWk.has(`${r.gsis_id}_${r.week}`)) continue;
      const opp = oppOf[`${normTeam(r.team)}_${r.week}`]; if (!opp) continue;
      const key = `${opp}_${Number(r.week)}`;
      expected[key] ||= { QB: 0, RB: 0, WR: 0, TE: 0 };
      expected[key][pl.pos] += pl.pace;
    }
  }
  if (ADJUSTED === 'snapshot') {
    const AV = 'src/data/intelligence/availability_2026.json';
    const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 28 });
    const hist = git('log', '--reverse', '--format=%H %cI', GIT_REF, '--', AV).trim().split('\n').map(l => { const [sha, iso] = l.split(' '); return { sha, t: Date.parse(iso) }; });
    const RES = new Set(['IR', 'PUP', 'SUSP', 'NFI']);
    const snapDir = path.join(REPO, 'src/data/intelligence/weekly_projections');
    for (const f of fs.readdirSync(snapDir).filter(f => /^2026-w\d\d\.json$/.test(f))) {
      const snap = JSON.parse(fs.readFileSync(path.join(snapDir, f), 'utf8'));
      const asOf = Date.parse(snap.first_kickoff_utc) - 60 * 3600e3;
      let pick = null; for (const h of hist) { if (h.t <= asOf) pick = h; else break; }
      const avail = pick ? (JSON.parse(git('show', `${pick.sha}:${AV}`)).players || {}) : {};
      for (const r of snap.rows) {
        if (!POS.includes(r.pos) || r.weekly_value == null || !r.opponent) continue;
        const v = RES.has(avail[r.gsis_id]?.status) ? 0 : r.weekly_value;
        const key = `${normTeam(r.opponent)}_${snap.week}`;
        expected[key] ||= { QB: 0, RB: 0, WR: 0, TE: 0 };
        expected[key][r.pos] += v;
      }
    }
  }
  if (ADJUSTED) {
    // Residual replaces raw points allowed everywhere below.
    for (const key of Object.keys(allowed)) {
      const e = expected[key];
      if (!e) { delete allowed[key]; continue; }
      for (const p of POS) allowed[key][p] = allowed[key][p] - e[p];
    }
  }

  const cells = []; // one per defence x week x position, for weeks 2+
  for (const W of complete) {
    if (W < Math.max(2, FROM_WEEK)) continue;
    const before = complete.filter(w => w < W);
    // League average to date per position, over every defence-game before W.
    const lg = {};
    for (const p of POS) {
      const vals = [];
      for (const w of before) for (const t of teams) if (allowed[`${t}_${w}`]) vals.push(allowed[`${t}_${w}`][p]);
      lg[p] = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
    for (const t of teams) {
      const act = allowed[`${t}_${W}`];
      if (!act) continue; // bye
      const games = before.filter(w => allowed[`${t}_${w}`]);
      const n = games.length;
      for (const p of POS) {
        const seasonDev = n ? games.reduce((s, w) => s + allowed[`${t}_${w}`][p], 0) / n - lg[p] : 0;
        cells.push({ team: t, week: W, pos: p, n, actual: act[p], lg: lg[p], seasonDev, prior: dev25[t][p], cont: cont[t] ?? contMean });
      }
    }
  }

  const estimators = {
    none: c => c.lg,
    prior: c => c.lg + c.prior,
    season: c => c.lg + c.seasonDev,
  };
  for (const k of K_GRID) {
    estimators[`blend_${k}`] = c => c.lg + (k * c.prior + c.n * c.seasonDev) / (k + c.n);
    estimators[`blend_${k}_cont`] = c => c.lg + (k * c.prior * c.cont + c.n * c.seasonDev) / (k + c.n);
    estimators[`blend_${k}_flat`] = c => c.lg + (k * c.prior * contMean + c.n * c.seasonDev) / (k + c.n);
  }
  const r3 = x => Math.round(x * 1000) / 1000;
  function score(fn, rows) {
    let a = 0, s = 0;
    for (const c of rows) { const e = c.actual - fn(c); a += Math.abs(e); s += e * e; }
    return { n: rows.length, mae: r3(a / rows.length), rmse: r3(Math.sqrt(s / rows.length)) };
  }
  const results = {};
  for (const [name, fn] of Object.entries(estimators)) {
    results[name] = { all: score(fn, cells) };
    for (const p of POS) results[name][p] = score(fn, cells.filter(c => c.pos === p));
    results[name].early_weeks_2_to_4 = score(fn, cells.filter(c => c.week <= 4));
    results[name].later_weeks_5_plus = score(fn, cells.filter(c => c.week >= 5));
  }

  // Paired bootstrap over defences (seeded), design blend vs each simple arm.
  let seed = 20261122;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
  function pairedCI(fa, fb, B = 2000) {
    const byTeam = {};
    for (const c of cells) (byTeam[c.team] ||= []).push(Math.abs(c.actual - fa(c)) - Math.abs(c.actual - fb(c)));
    const ts = Object.keys(byTeam); const diffs = [];
    for (let b = 0; b < B; b++) {
      let sum = 0, cnt = 0;
      for (let i = 0; i < ts.length; i++) { const arr = byTeam[ts[Math.floor(rnd() * ts.length)]]; for (const d of arr) { sum += d; cnt++; } }
      diffs.push(sum / cnt);
    }
    diffs.sort((x, y) => x - y);
    const all = Object.values(byTeam).flat();
    return { mean_abs_diff: r3(all.reduce((a, b) => a + b, 0) / all.length), ci95: [r3(diffs[Math.floor(B * 0.025)]), r3(diffs[Math.floor(B * 0.975)])] };
  }
  const design = `blend_${K_DESIGN}`;
  const comparisons = {};
  for (const other of ['none', 'prior', 'season', `blend_${K_DESIGN}_cont`, `blend_${K_DESIGN}_flat`]) {
    comparisons[`${design} minus ${other}`] = pairedCI(estimators[design], estimators[other]);
  }
  comparisons[`blend_${K_DESIGN}_cont minus blend_${K_DESIGN}_flat`] = pairedCI(estimators[`blend_${K_DESIGN}_cont`], estimators[`blend_${K_DESIGN}_flat`]);

  // How much of each estimate's deviation shows up in the result: the slope of
  // (actual - league average) on (estimate - league average), through the
  // origin. 1 = take the estimate at face value; 0 = it carries nothing.
  // Then a walk-forward shrunk version: for week W, the slope fitted on weeks
  // before W only (a slope of 0 until at least 200 earlier cells exist).
  function slope(fn, rows) {
    let sxy = 0, sxx = 0;
    for (const c of rows) { const x = fn(c) - c.lg, y = c.actual - c.lg; sxy += x * y; sxx += x * x; }
    return sxx ? sxy / sxx : 0;
  }
  function slopeCI(fn, B = 2000) {
    const byTeam = {}; for (const c of cells) (byTeam[c.team] ||= []).push(c);
    const ts = Object.keys(byTeam); const v = [];
    for (let b = 0; b < B; b++) { const rows = []; for (let i = 0; i < ts.length; i++) rows.push(...byTeam[ts[Math.floor(rnd() * ts.length)]]); v.push(slope(fn, rows)); }
    v.sort((x, y) => x - y); return [r3(v[Math.floor(B * 0.025)]), r3(v[Math.floor(B * 0.975)])];
  }
  const slopes = {};
  for (const name of ['prior', 'season', `blend_${K_DESIGN}`, `blend_${K_DESIGN}_cont`, 'blend_8', 'blend_12']) {
    const fn = estimators[name];
    slopes[name] = { slope: r3(slope(fn, cells)), ci95: slopeCI(fn) };
    const shrunk = c => { const prior = cells.filter(x => x.week < c.week); const b = prior.length < 200 ? 0 : Math.max(0, slope(fn, prior)); return c.lg + b * (fn(c) - c.lg); };
    slopes[name].walk_forward_shrunk = score(shrunk, cells);
    slopes[name].walk_forward_shrunk_minus_none = pairedCI(shrunk, estimators.none);
  }

  const out = {
    slopes_note: 'slope of (actual minus league average) on (estimate minus league average), ci95 over 2000 resamples of the 32 defences; walk_forward_shrunk uses the slope fitted on earlier graded weeks only, 0 until 200 earlier cells exist',
    slopes,
    generated_utc: new Date().toISOString(),
    question: ADJUSTED
      ? 'Which estimate of a defence against a position, made before week W, comes closest to the points it allowed that position in week W BEYOND what the frozen snapshot projected for the offence it faced?'
      : 'Which estimate of a defence against a position, made before week W, comes closest to the points it allowed that position in week W?',
    mode: ADJUSTED === 'snapshot' ? 'adjusted (residual against the frozen snapshot, part 0 rule applied)' : ADJUSTED === 'roster' ? "adjusted (residual against the week's roster at 2025 pace, Friday Out removed)" : 'raw points allowed',
    k_design: K_DESIGN, k_grid: K_GRID,
    weeks_graded: [...new Set(cells.map(c => c.week))],
    cells: cells.length,
    continuity_league_mean: r3(contMean),
    continuity_by_team: cont,
    results,
    comparisons_note: 'negative mean_abs_diff = the first estimate misses by less; ci95 from 2000 resamples of the 32 defences (seed 20261122)',
    comparisons,
  };
  console.log(`Back-test (${ADJUSTED ? `adjusted for the offence faced, by ${ADJUSTED}` : 'raw points allowed'}): defence against position, weeks ${out.weeks_graded.join(', ')}; ${cells.length} cells`);
  console.log(`  continuity (share of 2025 defensive snaps on the 2026 week 1 roster): league mean ${out.continuity_league_mean}, range ${r3(Math.min(...Object.values(cont)))} to ${r3(Math.max(...Object.values(cont)))}`);
  const show = ['none', 'prior', 'season', ...K_GRID.map(k => `blend_${k}`), `blend_${K_DESIGN}_cont`, `blend_${K_DESIGN}_flat`];
  for (const s of show) {
    const r = results[s];
    console.log(`  ${s.padEnd(15)} MAE ${r.all.mae.toFixed(3)}  QB ${r.QB.mae.toFixed(2)} RB ${r.RB.mae.toFixed(2)} WR ${r.WR.mae.toFixed(2)} TE ${r.TE.mae.toFixed(2)}  | wk2-4 ${r.early_weeks_2_to_4.mae.toFixed(3)} wk5+ ${r.later_weeks_5_plus.mae.toFixed(3)}`);
  }
  for (const [k, v] of Object.entries(slopes)) console.log(`  slope ${k.padEnd(13)} ${v.slope} [${v.ci95.join(', ')}]  walk-forward shrunk MAE ${v.walk_forward_shrunk.mae.toFixed(3)} (minus none ${v.walk_forward_shrunk_minus_none.mean_abs_diff} [${v.walk_forward_shrunk_minus_none.ci95.join(', ')}])`);
  for (const [k, v] of Object.entries(comparisons)) console.log(`  ${k}: ${v.mean_abs_diff} [${v.ci95.join(', ')}]`);
  if (OUT) { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(out, null, 2)); console.log(`wrote ${OUT}`); }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(e => { console.error(e); process.exit(1); });
