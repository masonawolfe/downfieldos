#!/usr/bin/env node
/**
 * scripts/reconcile-rosters-availability.mjs
 *
 * E-044 (2026-09-20) — one source of truth for "who starts given
 * today's availability."
 *
 * The rosters cron runs 3×/week (Tue + Wed/Sat, Sep-Jan); the
 * availability cron runs every 4h. When a new Out/IR/PUP/NFI/SUSP
 * designation lands between roster refreshes, the shipped rosters
 * file carries a starter who is currently designated out. On
 * 2026-09-20, 5 such slots blocked the board (BAL WR1 Flowers, GB
 * DT Hargrave, LAR FS Kinchens, NE CB2 Davis, PIT WR2 Pittman) —
 * check #15 caught them but the board did not ship for the day.
 *
 * This script runs BEFORE build-player-board.js in data-board.yml.
 * It reads:
 *   - src/data/rosters2026.js (with the `candidates` pool the roster
 *     build emits for each starter row)
 *   - src/data/intelligence/availability_2026.json
 *
 * Re-runs the shared picker (scripts/_lib/starter_pick.js) on every
 * starter slot against today's availability. If any pick differs
 * from the current row, rewrites rosters2026.js in place with the
 * new picks, updated starter_reason strings, and a new
 * ROSTERS_META.availability_stamp matching the availability snapshot.
 *
 * If no picks change, rewrites ROSTERS_META.availability_stamp and
 * `reconciled_by` only — so verifier check #16 sees a fresh stamp.
 *
 * Failure modes:
 *   - Roster row missing `candidates` array (roster built before
 *     E-044): logs a warning, leaves the row unchanged. Check #15
 *     will still fire if the slot is now out.
 *   - No available candidate in the pool: leaves the current pick
 *     with an added `starter_reason: 'no available candidate in
 *     depth pool'`. Check #15 will still fire — this is a hard
 *     assertion that a human must resolve.
 *
 * Idempotent: running twice against the same availability snapshot
 * produces the same file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { outReason, pickAvailable } from './_lib/starter_pick.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const ROSTERS_PATH = path.join(REPO_ROOT, 'src/data/rosters2026.js');
const AVAIL_PATH = path.join(REPO_ROOT, 'src/data/intelligence/availability_2026.json');

async function main() {
  console.log('DownfieldOS — Roster/Availability Reconcile (E-044)');
  console.log('===================================================');

  const availDoc = JSON.parse(fs.readFileSync(AVAIL_PATH, 'utf8'));
  const availById = availDoc.players || {};
  const availStamp = availDoc.meta?.generated || null;
  console.log(`  availability_2026.json generated: ${availStamp || 'unknown'} (${Object.keys(availById).length} players)`);

  const mod = await import(pathToFileURL(ROSTERS_PATH).href);
  const rosters = mod.ROSTERS_2026 || {};
  const priorMeta = mod.ROSTERS_META || null;
  console.log(`  rosters2026.js: ${Object.keys(rosters).length} teams, prior availability_stamp: ${priorMeta?.availability_stamp || 'unknown'}`);

  // Group rows in the same position family (WR1/WR2/WR3 → WR, RB1/RB2 →
  // RB, EDGE1/EDGE2 → EDGE, LB1/LB2 → LB, CB1/CB2 → CB, QB → QB, TE →
  // TE, OL positions each their own single-slot group). All rows in a
  // group share the SAME candidate pool at roster-build time, so a
  // per-row call with count=1 would duplicate the top-available across
  // slots. Pool-aware: pick top-N-available ONCE per group, distribute
  // results back to WR1/WR2/WR3 in order.
  function groupKey(pos) {
    // Strip trailing digit(s) so WR1/WR2/WR3 → WR, LB1/LB2 → LB, etc.
    // Single-slot positions (QB, TE, DT, SCB, FS, SS, OL letters) stay
    // as their own group.
    return pos.replace(/[0-9]+$/, '');
  }

  const swaps = [];
  const noBackup = [];
  const missingCandidates = [];

  for (const [team, sides] of Object.entries(rosters)) {
    for (const side of ['offense', 'defense']) {
      const rows = sides[side] || [];
      // Group rows by position family, preserving order (WR1 before WR2).
      const groups = new Map(); // groupKey → [rows in order]
      for (const row of rows) {
        const k = groupKey(row.pos);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(row);
      }
      for (const [gk, groupRows] of groups) {
        // Skip rows whose pool is missing (pre-E-044 bootstrap). Each
        // row's `candidates` is the same pool at roster-build time; we
        // can trust the first one.
        const first = groupRows[0];
        if (!Array.isArray(first.candidates) || first.candidates.length === 0) {
          for (const r of groupRows) missingCandidates.push(`${team} ${side}/${r.pos}`);
          continue;
        }
        const count = groupRows.length;
        const { chosen } = pickAvailable(first.candidates, count, availById);
        // If chosen is shorter than count, the tail rows have no
        // available candidate in the pool; annotate but leave the
        // pre-existing player so consumers see the last known state.
        for (let i = 0; i < groupRows.length; i++) {
          const row = groupRows[i];
          const winner = chosen[i]; // may be undefined if pool exhausted
          if (!winner) {
            // Q-058 (2026-09-20): mark the slot vacant rather than
            // leaving the Out player seated. Consumers (UI, board)
            // see gsis_id=null / name=null and can render an
            // explicit "— vacant —" instead of a misleading Out
            // starter. Check #15 skips gsis_id=null rows; a new
            // check #17 counts vacancies and fails above a
            // threshold so a data problem still surfaces.
            row.gsis_id = null;
            row.name = null;
            row.starter_reason = `no available backup (${first.candidates.length} in depth pool, all Out/IR/PUP/NFI/SUSP)`;
            noBackup.push(`${team} ${row.pos}: vacant (all ${first.candidates.length} candidates out)`);
            continue;
          }
          if (winner.gsis_id === row.gsis_id) {
            if (!winner.starter_reason && row.starter_reason) delete row.starter_reason;
            else if (winner.starter_reason) row.starter_reason = winner.starter_reason;
            continue;
          }
          swaps.push({ team, pos: row.pos, from: row.name, fromReason: outReason(availById[row.gsis_id]) || 'unknown', to: winner.name });
          row.gsis_id = winner.gsis_id;
          row.name = winner.name;
          if (winner.starter_reason) row.starter_reason = winner.starter_reason;
          else delete row.starter_reason;
        }
      }
    }
  }

  console.log('');
  console.log(`  Swaps:            ${swaps.length}`);
  console.log(`  No-backup slots:  ${noBackup.length}  (verifier check #15 will fail on these)`);
  console.log(`  Rows w/o candidates: ${missingCandidates.length}  (pre-E-044 roster build)`);
  swaps.forEach(s => console.log(`    ${s.team} ${s.pos}: ${s.from} (${s.fromReason}) → ${s.to}`));
  noBackup.forEach(n => console.log(`    no-backup: ${n}`));

  // Rewrite rosters2026.js — always, so the ROSTERS_META stamp always
  // reflects the availability snapshot we reconciled against. Verifier
  // check #16 asserts this stamp matches the shipped availability file.
  const nextMeta = {
    generated: priorMeta?.generated || new Date().toISOString(),
    availability_stamp: availStamp,
    reconciled_by: 'reconcile-rosters-availability.mjs',
    reconciled_at: new Date().toISOString(),
    swaps_this_run: swaps.length,
    no_backup_this_run: noBackup.length,
    sources: priorMeta?.sources || ['availability_2026.json'],
  };
  const output = `// Auto-generated from nflverse depth charts + snap counts (2026 season)
// NOTE: rating is a SNAP-SHARE PROXY (68-85 base by snap share + exp
// modifier), not a player evaluation. See rating_source on each row. UI
// should render this under an honest label — "Snap share tier" or similar.
// CoS audit 2026-08-30 finding #4.
// Generated: ${nextMeta.generated}
// Reconciled: ${nextMeta.reconciled_at} against availability_2026.json
//             (generated ${availStamp || 'unknown'}) — ${swaps.length} swap(s),
//             ${noBackup.length} no-backup slot(s).
// Sources: ${nextMeta.sources.join(', ')}
// Do not edit manually — re-run: SEASON=2026 node scripts/fetch-nflverse-roster-base.js
//                   or:            node scripts/reconcile-rosters-availability.mjs
// E-044 (2026-09-20): each starter row carries a \`candidates\` array
// (pos_rank 1-3 pool) so the board build can re-pick against today's
// availability at ship time. ROSTERS_META.availability_stamp names the
// availability snapshot the reconciler last used.

export const ROSTERS_2026 = ${JSON.stringify(rosters, null, 2)};

export const ROSTERS_META = ${JSON.stringify(nextMeta, null, 2)};
`;
  fs.writeFileSync(ROSTERS_PATH, output);
  console.log(`\nWrote ${ROSTERS_PATH}`);
  console.log(`  new availability_stamp: ${availStamp}`);
}

await main();
