#!/usr/bin/env node
/**
 * reconcile-actuals-scoring.mjs (DATA_FRESHNESS_PLAN 2026-11-01, step 1)
 *
 * Recomputes nflverse's own fantasy columns (fantasy_points_ppr and
 * fantasy_points_std) in weekly_actuals_{SEASON}.json from the components
 * stored on each row, and reports per column: rows reconciled, the largest
 * absolute difference and every row it cannot explain. Exits 1 if any row
 * is unexplained (a column off by more than 0.01, a null column or a
 * missing component), 0 otherwise.
 *
 * This is the nflverse half of the split check #21. It is deliberately NOT
 * in verify-player-board.mjs: a scoring term nflverse adds and we do not
 * store would otherwise stop the Tuesday commit on all five chain slots
 * (the same reason check-defense-field stays out of the verifier). The
 * graded half (the board's rules) is verifier check #21.
 *
 * NOT WIRED YET (review 2026-11-07): no workflow runs this script until the
 * gate exists (plan step 5, read by the chain in step 7, both R2). Until
 * then a renamed nflverse column turns its component into 0 or null with no
 * red anywhere: #21 still passes, because it checks the graded column only
 * against the stored components. The only signs are the reconcile count in
 * the actuals file's scoring_notes and the fetch log line. R2 dependency:
 * step 5 must call this script (or its reconcileRows) on chain_input.
 *
 * Usage:
 *   node scripts/reconcile-actuals-scoring.mjs                 # src/data/intelligence/weekly_actuals_2026.json
 *   node scripts/reconcile-actuals-scoring.mjs path/to/file.json
 *   SEASON=2025 node scripts/reconcile-actuals-scoring.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { reconcileRows, NFLVERSE_SCORING } from './_lib/actuals-scoring.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const SEASON = parseInt(process.env.SEASON || '2026', 10);
const file = process.argv[2] || path.join(REPO, 'src', 'data', 'intelligence', `weekly_actuals_${SEASON}.json`);
const TOL = 0.01;

let doc;
try {
  doc = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`reconcile: cannot read ${file}: ${e.message}`);
  process.exit(2);
}
const rows = doc.rows || [];
if (!rows.length) {
  console.error(`reconcile: ${file} has no rows`);
  process.exit(2);
}

const rec = reconcileRows(rows, TOL);
console.log(`Actuals scoring reconciliation: ${path.relative(process.cwd(), file) || file}`);
console.log(`  nflverse rules recomputed: ${JSON.stringify(NFLVERSE_SCORING)}`);
let unexplained = 0;
for (const [col, r] of Object.entries(rec.columns)) {
  const ok = r.reconciled === r.rows;
  unexplained += r.unexplained.length;
  console.log(`  ${ok ? '✓' : '✗'} ${col}: rows reconciled ${r.reconciled} of ${r.rows}, ${r.compared === 0 ? 'max abs diff not measured (no row could be recomputed)' : `max abs diff ${r.max_abs_diff <= TOL ? `<= ${TOL}` : `${r.max_abs_diff} (> ${TOL})`} (largest ${r.max_abs_diff.toFixed(2)} over ${r.compared} recomputed rows)`}`);
  for (const b of r.unexplained.slice(0, 15)) {
    console.log(`      ${b.row.name} (${b.row.pos}, ${b.row.gsis_id}) week ${b.row.week}: ${b.reason}`);
  }
  if (r.unexplained.length > 15) console.log(`      … ${r.unexplained.length - 15} more`);
}
const t = rec.rows_with_term;
console.log(`  graded (board rules) differs from nflverse ppr on ${rec.rows_graded_differs_from_ppr} of ${rows.length} rows; rows with an interception ${t.pass_int}, a fumble lost ${t.fumbles_lost}, a two-point conversion ${t.two_pt}, a special teams touchdown ${t.special_teams_td}`);
console.log(`  rows nflverse scores above the interception and fumble penalties (two-point or special teams touchdown): ${rec.rows_with_two_pt_or_special_teams_td}`);
if (unexplained) {
  console.log(`\nFAIL: ${unexplained} unexplained column value(s) across ${Object.keys(rec.columns).length} columns`);
  process.exit(1);
}
console.log('\nPASS: every row of both nflverse columns is explained by its stored components');
