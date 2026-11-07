#!/usr/bin/env node
/**
 * check-defense-field.mjs — DATA_FRESHNESS_PLAN step 2 (2026-11).
 *
 * Proves src/data/defense2026.js is this season's table by recomputing it
 * from a second source, weekly_actuals_<season>.json (nflverse stats_player),
 * and comparing. Node built-ins only, so it runs in a bare `git clone
 * --depth 1` with no `npm install`. In R1 it runs alone; from step 5 the
 * freshness gate calls it. It is deliberately NOT in the verifier
 * (verify-player-board.mjs): a verifier failure blocks the Tuesday commit
 * and the write-once snapshot with it.
 *
 * Five checks:
 *   1. Recompute points allowed per game by team and position from the
 *      actuals' row `components`, under the builder's own full-PPR scoring
 *      (no interception or fumble term, because build-defense.js has none),
 *      over the weeks the file says it covers.
 *   2. Rank correlation floor per position (Spearman, average ranks for
 *      ties): each of QB, RB, WR and TE must reach FLOOR. The four values are
 *      printed on every run.
 *   3. No extreme flip: a team in the file's five toughest (fewest allowed)
 *      may not be in the recomputation's five softest, or the reverse.
 *   4. Rank direction: for each rank_fpts_allowed_<pos>_per_game field,
 *      rank 1 holds the lowest points allowed and the ranks never run
 *      against the values.
 *   5. The served field: from week 10 on, the newest snapshot's
 *      opp_fpts_allowed_to_pos equals the file's value for that opponent and
 *      position, on a sample of 50 rows. Snapshots before week 10 carry the
 *      2025 table by history and are exempt.
 *
 * FLOOR is 0.70 until the first 2026 rebuild prints its four values; then
 * about 0.90 if those read 0.95 or better (plan step 2, engineer 2026-11-01
 * 20:40). The floor catches last season's table; it does not catch a file
 * that is a few weeks stale, which the gate's `coverage` mode owns.
 *
 * Usage:
 *   node scripts/check-defense-field.mjs
 *     [--file src/data/defense2026.js]
 *     [--actuals src/data/intelligence/weekly_actuals_2026.json]
 *     [--snapshots src/data/intelligence/weekly_projections]
 *     [--floor 0.70]
 * Exit 0 when all five pass, 1 when any fails, 2 on a usage or read error.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');

const args = process.argv.slice(2);
const argVal = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };

const FILE = path.resolve(argVal('--file', path.join(REPO, 'src', 'data', 'defense2026.js')));
const ACTUALS = path.resolve(argVal('--actuals', path.join(REPO, 'src', 'data', 'intelligence', 'weekly_actuals_2026.json')));
const SNAP_DIR = path.resolve(argVal('--snapshots', path.join(REPO, 'src', 'data', 'intelligence', 'weekly_projections')));
const FLOOR = Number(argVal('--floor', '0.70'));
const SERVED_FROM_WEEK = 10;
const SAMPLE = 50;
const POSITIONS = ['QB', 'RB', 'WR', 'TE'];
const TEAMS = ['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS'];
const NORM_TEAM = { LA: 'LAR', OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', AZ: 'ARI' };
const norm = (t) => { const u = String(t || '').toUpperCase().trim(); return NORM_TEAM[u] || u; };
const field = (pos) => `fpts_allowed_${pos.toLowerCase()}_per_game`;
const rankField = (pos) => `rank_${field(pos)}`;

// build-defense.js SCORING, the builder's own scoring.
const BUILDER_SCORING = { rec: 1.0, rec_yd: 0.1, rec_td: 6, rush_yd: 0.1, rush_td: 6, pass_yd: 0.04, pass_td: 4 };
function builderPoints(c) {
  const s = BUILDER_SCORING;
  return (c.receptions || 0) * s.rec + (c.rec_yd || 0) * s.rec_yd + (c.rec_td || 0) * s.rec_td
    + (c.rush_yd || 0) * s.rush_yd + (c.rush_td || 0) * s.rush_td
    + (c.pass_yd || 0) * s.pass_yd + (c.pass_td || 0) * s.pass_td;
}

function averageRanks(values) {
  const order = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const ranks = new Array(values.length);
  for (let i = 0; i < order.length;) {
    let j = i;
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[order[k][1]] = avg;
    i = j + 1;
  }
  return ranks;
}
function pearson(x, y) {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxx === 0 || syy === 0 ? NaN : sxy / Math.sqrt(sxx * syy);
}
const spearman = (x, y) => pearson(averageRanks(x), averageRanks(y));
const fmt = (r) => (Number.isFinite(r) ? (r >= 0 ? '+' : '') + r.toFixed(3) : 'NaN');

async function loadDefense(file) {
  const mod = await import(pathToFileURL(file).href);
  const key = Object.keys(mod).find(k => /^DEFENSE_\d{4}$/.test(k));
  if (!key) throw new Error(`${file}: no DEFENSE_<yyyy> export`);
  const metaKey = Object.keys(mod).find(k => k === `${key}_META`);
  return { rows: mod[key], meta: metaKey ? mod[metaKey] : {}, exportName: key };
}

async function main() {
  if (!Number.isFinite(FLOOR)) { console.error('bad --floor'); process.exit(2); }
  let def, actuals;
  try {
    def = await loadDefense(FILE);
    actuals = JSON.parse(fs.readFileSync(ACTUALS, 'utf8'));
  } catch (e) {
    console.error(`check-defense-field: cannot read inputs: ${e.message}`);
    process.exit(2);
  }
  const failures = [];
  const rel = (p) => { const r = path.relative(process.cwd(), p); return r && !r.startsWith('..') ? r : p; };
  const fileSeason = def.meta.source_season ?? null;
  const labels = [...new Set(Object.values(def.rows).map(r => r.defense_source).filter(Boolean))];
  console.log(`check-defense-field: ${rel(FILE)} (${def.exportName}; source_season ${fileSeason ?? 'not stated'}; defense_source ${labels.join(', ') || 'none'})`);
  console.log(`  against ${rel(ACTUALS)} (season ${actuals.meta?.season ?? '?'}, weeks ${(actuals.meta?.weeks_present || []).join(',')}), floor ${FLOOR.toFixed(2)}`);

  // ── 1. Recompute from the actuals ───────────────────────────────────────
  const fileWeeks = Array.isArray(def.meta.weeks_covered) && def.meta.weeks_covered.length ? new Set(def.meta.weeks_covered) : null;
  const rows = (actuals.rows || []).filter(r => !fileWeeks || fileWeeks.has(r.week));
  const actualWeeks = new Set(rows.map(r => r.week));
  if (fileWeeks) {
    const missing = [...fileWeeks].filter(w => !actualWeeks.has(w));
    if (missing.length) failures.push(`1 recompute: the file covers week(s) ${missing.join(',')} that the actuals do not hold`);
  }
  const games = Object.fromEntries(TEAMS.map(t => [t, new Set()]));
  const pts = Object.fromEntries(TEAMS.map(t => [t, { QB: 0, RB: 0, WR: 0, TE: 0 }]));
  for (const r of rows) {
    const opp = norm(r.opponent);
    if (!games[opp] || !POSITIONS.includes(r.pos) || !r.components) continue;
    games[opp].add(r.week);
    pts[opp][r.pos] += builderPoints(r.components);
  }
  const recomputed = {};
  for (const t of TEAMS) {
    const g = games[t].size;
    recomputed[t] = Object.fromEntries(POSITIONS.map(p => [p, g ? pts[t][p] / g : null]));
  }
  const missingTeams = TEAMS.filter(t => !def.rows[t]);
  const noGames = TEAMS.filter(t => !games[t].size);
  if (missingTeams.length) failures.push(`1 recompute: file lacks ${missingTeams.length} team(s): ${missingTeams.join(',')}`);
  if (noGames.length) failures.push(`1 recompute: actuals hold no games against ${noGames.join(',')}`);
  const teams = TEAMS.filter(t => def.rows[t] && games[t].size);
  console.log(`  1 recompute: ${teams.length} of 32 teams, ${rows.length} actual rows over weeks ${[...actualWeeks].sort((a, b) => a - b).join(',')}`);

  // ── 2. Rank correlation floor ───────────────────────────────────────────
  const rho = {};
  for (const p of POSITIONS) {
    const x = teams.map(t => def.rows[t][field(p)]);
    const y = teams.map(t => recomputed[t][p]);
    if (x.some(v => typeof v !== 'number' || !Number.isFinite(v))) { rho[p] = NaN; failures.push(`2 floor: ${p} has non-numeric ${field(p)}`); continue; }
    rho[p] = spearman(x, y);
    if (!(rho[p] >= FLOOR)) failures.push(`2 floor: ${p} rank correlation ${fmt(rho[p])} is below ${FLOOR.toFixed(2)}`);
  }
  console.log(`  2 rank correlation, file vs recomputation: ${POSITIONS.map(p => `${p} ${fmt(rho[p])}`).join(' · ')}`);

  // ── 3. No extreme flip ──────────────────────────────────────────────────
  const flips = [];
  for (const p of POSITIONS) {
    const byFile = [...teams].sort((a, b) => def.rows[a][field(p)] - def.rows[b][field(p)]);
    const byRe = [...teams].sort((a, b) => recomputed[a][p] - recomputed[b][p]);
    const fileTough = new Set(byFile.slice(0, 5)), fileSoft = new Set(byFile.slice(-5));
    const reTough = new Set(byRe.slice(0, 5)), reSoft = new Set(byRe.slice(-5));
    for (const t of fileTough) if (reSoft.has(t)) flips.push(`${p} ${t} (file toughest five, recomputed softest five)`);
    for (const t of fileSoft) if (reTough.has(t)) flips.push(`${p} ${t} (file softest five, recomputed toughest five)`);
  }
  if (flips.length) failures.push(`3 flip: ${flips.join('; ')}`);
  console.log(`  3 extreme flips: ${flips.length ? flips.join('; ') : 'none'}`);

  // ── 4. Rank direction ───────────────────────────────────────────────────
  const dirBad = [];
  for (const p of POSITIONS) {
    const ranked = teams.filter(t => def.rows[t][rankField(p)] != null)
      .sort((a, b) => def.rows[a][rankField(p)] - def.rows[b][rankField(p)]);
    if (ranked.length !== teams.length) { dirBad.push(`${p}: ${teams.length - ranked.length} team(s) lack ${rankField(p)}`); continue; }
    const vals = ranked.map(t => def.rows[t][field(p)]);
    const min = Math.min(...vals);
    if (def.rows[ranked[0]][rankField(p)] !== 1 || vals[0] !== min) dirBad.push(`${p}: the top rank is ${def.rows[ranked[0]][rankField(p)]} (${ranked[0]} at ${vals[0]}); rank 1 must hold the lowest, ${min}`);
    else {
      const against = vals.findIndex((v, i) => i > 0 && v < vals[i - 1]);
      if (against > 0) dirBad.push(`${p}: rank ${def.rows[ranked[against]][rankField(p)]} (${ranked[against]}, ${vals[against]}) sits below rank ${def.rows[ranked[against - 1]][rankField(p)]} (${vals[against - 1]})`);
    }
  }
  if (dirBad.length) failures.push(`4 direction: ${dirBad.join('; ')}`);
  console.log(`  4 rank direction: ${dirBad.length ? dirBad.join('; ') : 'rank 1 holds the lowest points allowed at QB, RB, WR, TE'}`);

  // ── 5. The served field ─────────────────────────────────────────────────
  let snaps = [];
  try { snaps = fs.readdirSync(SNAP_DIR).map(f => [f, /-w(\d+)\.json$/.exec(f)]).filter(([, m]) => m).map(([f, m]) => ({ f, week: Number(m[1]) })); }
  catch { /* no snapshot dir: nothing served yet */ }
  snaps.sort((a, b) => a.week - b.week);
  const newest = snaps[snaps.length - 1];
  if (!newest || newest.week < SERVED_FROM_WEEK) {
    console.log(`  5 served field: exempt (newest snapshot ${newest ? newest.f : 'none'} is before week ${SERVED_FROM_WEEK})`);
  } else {
    const snap = JSON.parse(fs.readFileSync(path.join(SNAP_DIR, newest.f), 'utf8'));
    const cand = (snap.rows || []).filter(r => POSITIONS.includes(r.pos) && r.opponent);
    const step = Math.max(1, Math.floor(cand.length / SAMPLE));
    const sample = cand.filter((_, i) => i % step === 0).slice(0, SAMPLE);
    const bad = [];
    for (const r of sample) {
      const want = def.rows[norm(r.opponent)]?.[field(r.pos)] ?? null;
      if (r.opp_fpts_allowed_to_pos !== want) bad.push(`${r.name || r.gsis_id} ${r.pos} vs ${r.opponent}: snapshot ${r.opp_fpts_allowed_to_pos}, file ${want}`);
    }
    if (sample.length < Math.min(SAMPLE, cand.length) || !sample.length) bad.push(`only ${sample.length} sampled rows`);
    if (bad.length) failures.push(`5 served field (${newest.f}): ${bad.length} of ${sample.length} rows differ: ${bad.slice(0, 5).join('; ')}`);
    console.log(`  5 served field: ${newest.f}, ${sample.length} rows sampled, ${bad.length} differ`);
  }

  if (failures.length) {
    console.log(`\nFAIL ${failures.length} check(s):`);
    for (const f of failures) console.log(`  ✗ ${f}`);
    process.exit(1);
  }
  console.log('\nPASS all five checks.');
}

main().catch(e => { console.error(`check-defense-field: ${e.stack || e}`); process.exit(2); });
