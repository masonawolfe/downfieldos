#!/usr/bin/env node
/**
 * check-player-stats-floor.mjs — E-4 (2026-10-10) structural floor for the
 * usage + team-offense + 2026-roster enrichment on playerStats${SEASON}.js.
 *
 * Why: from 2026-09-23 the weekly Player Stats job rebuilt
 * src/data/playerStats2025.js in CI without the enrichment inputs and
 * committed target_share / snap_share / team_pass_rate = null on every row
 * (header: "usage join rate 0.0%"). Nothing failed — the builder logs a
 * warning and keeps going by design. This script is the gate that makes that
 * regression fail the job BEFORE the commit step.
 *
 * What it asserts (read from the row fields of the BUILT file — never from
 * the header comment or PLAYER_STATS_*_META, which are proxies):
 *   for each floor field F:
 *     count(rows where F != null) in the built file
 *       must be > 0, AND
 *       must be >= the same count in the committed file (git show HEAD:…).
 *   usage_joined = rows with any of target_share / carry_share / snap_share
 *   non-null (the builder sets all three from the same usage row).
 *
 * If the file does not exist at the baseline ref (first build of a new
 * season), only the > 0 floor applies, and the script says so.
 *
 * Usage:
 *   node scripts/check-player-stats-floor.mjs            # SEASON env, default 2025
 *   SEASON=2025 npm run data:stats:floor
 * Env overrides (for proofs / local runs):
 *   PLAYER_STATS_FLOOR_FILE  path of the built file to check
 *   PLAYER_STATS_FLOOR_REF   git ref for the baseline (default HEAD)
 *
 * Exit 0 = pass, 1 = floor broken (commit must not happen), 2 = could not run.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const SEASON = parseInt(process.env.SEASON || '2025', 10);
const REL = `src/data/playerStats${SEASON}.js`;
const BUILT = process.env.PLAYER_STATS_FLOOR_FILE || path.join(REPO_ROOT, REL);
const REF = process.env.PLAYER_STATS_FLOOR_REF || 'HEAD';

// Fields the floor protects. The first three come from player_usage_data,
// the next three from team_scheme_profiles, team_2026 from roster_weekly_2026.
const FLOOR_FIELDS = [
  'usage_joined',
  'target_share',
  'carry_share',
  'snap_share',
  'team_pass_rate',
  'team_off_epa_per_play',
  'team_rz_pass_rate',
  'team_2026',
];

async function loadRows(source, label) {
  // Evaluate the module exactly as a consumer would (no JSON slicing, no
  // header parsing). data: URL keeps the baseline out of the filesystem.
  const url = 'data:text/javascript;base64,' + Buffer.from(source, 'utf8').toString('base64');
  const mod = await import(url);
  const rows = mod[`PLAYER_STATS_${SEASON}`];
  if (!Array.isArray(rows)) throw new Error(`${label}: export PLAYER_STATS_${SEASON} is not an array`);
  return rows;
}

function counts(rows) {
  const nn = (r, k) => r[k] !== null && r[k] !== undefined;
  const out = { rows: rows.length };
  out.usage_joined = rows.filter(r => nn(r, 'target_share') || nn(r, 'carry_share') || nn(r, 'snap_share')).length;
  for (const f of FLOOR_FIELDS) if (f !== 'usage_joined') out[f] = rows.filter(r => nn(r, f)).length;
  return out;
}

async function main() {
  console.log(`Player-stats enrichment floor — SEASON=${SEASON}`);
  console.log(`  built:    ${path.relative(REPO_ROOT, BUILT) || BUILT}`);
  console.log(`  baseline: ${REF}:${REL}\n`);

  if (!fs.existsSync(BUILT)) { console.error(`✗ built file missing: ${BUILT}`); process.exit(2); }
  const built = counts(await loadRows(fs.readFileSync(BUILT, 'utf8'), 'built'));

  let base = null;
  try {
    const src = execFileSync('git', ['show', `${REF}:${REL}`], { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    base = counts(await loadRows(src, 'baseline'));
  } catch (err) {
    const msg = String(err.stderr || err.message).split('\n')[0];
    if (/does not exist|exists on disk, but not in|bad revision|unknown revision|invalid object name/i.test(msg)) {
      console.log(`  (no baseline at ${REF}:${REL} — ${msg}; applying the > 0 floor only)\n`);
    } else {
      console.error(`✗ could not read baseline ${REF}:${REL}: ${msg}`);
      process.exit(2);
    }
  }

  const failures = [];
  if (built.rows === 0) failures.push('built file has 0 rows');
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`  ${pad('field', 24)}${pad('baseline', 10)}${pad('built', 8)}result`);
  console.log(`  ${pad('rows', 24)}${pad(base ? base.rows : 'n/a', 10)}${pad(built.rows, 8)}(info)`);
  for (const f of FLOOR_FIELDS) {
    const b = base ? base[f] : null;
    let result = 'ok';
    if (built[f] === 0) { result = 'FAIL (0 non-null)'; failures.push(`${f}: 0 non-null rows`); }
    else if (b != null && built[f] < b) { result = `FAIL (below baseline by ${b - built[f]})`; failures.push(`${f}: ${built[f]} < baseline ${b}`); }
    console.log(`  ${pad(f, 24)}${pad(b == null ? 'n/a' : b, 10)}${pad(built[f], 8)}${result}`);
  }

  if (failures.length) {
    console.error(`\n✗ FLOOR BROKEN — ${failures.length} check(s) failed. Do not commit this build.`);
    for (const f of failures) console.error(`  - ${f}`);
    console.error(`  Inputs: src/data/intelligence/pbp/player_usage_data_${SEASON}.json, team_scheme_profiles_${SEASON}.json,`);
    console.error(`  data/intelligence/raw/roster_weekly_2026.csv.gz (fetched by the workflow). See build log warnings.`);
    process.exit(1);
  }
  console.log(`\n✓ floor holds — ${FLOOR_FIELDS.length} fields non-zero and >= ${base ? REF : 'zero floor'}.`);
}

main().catch(err => { console.error('✗ floor check crashed:', err); process.exit(2); });
