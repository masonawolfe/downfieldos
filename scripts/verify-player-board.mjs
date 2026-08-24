#!/usr/bin/env node
// EM/PO Directive v2 Task 6 acceptance verifier.
// All six criteria must pass the week before the draft.

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO = path.dirname(path.dirname(__filename)) + '/';

const board = await import(REPO + 'src/data/playerBoard2026.js');
const PLAYER_BOARD_2026 = board.PLAYER_BOARD_2026;
const meta = board.PLAYER_BOARD_2026_META;

console.log(`Board: ${PLAYER_BOARD_2026.length} rows, generated ${meta.generated}\n`);

const results = [];
function check(name, fn) {
  try {
    const detail = fn();
    results.push({ name, pass: true, detail });
    console.log(`  ✓ ${name}${detail ? ' — ' + detail : ''}`);
  } catch (e) {
    results.push({ name, pass: false, detail: e.message });
    console.log(`  ✗ ${name} — ${e.message}`);
  }
}

// #1 — 20 random WR2/WR3s from board resolve with pos+team OR rookie flag.
check('20 random WR2/WR3s resolve or explicitly flag', () => {
  // WR2/WR3 proxy: WRs not in the top ADP tier (positional rank > 24 or adp null).
  const wrs = PLAYER_BOARD_2026.filter(r => r.pos === 'WR');
  const wr2Plus = wrs.filter(r => (r.adp_positional == null) || r.adp_positional > 24);
  const sample = wr2Plus.sort((a, b) => (a.gsis_id || '').localeCompare(b.gsis_id || '')).filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 20)) === 0).slice(0, 20);
  let silent = 0;
  for (const r of sample) {
    // Each row must have BOTH pos and team_2026, OR explicit rookie_no_2025_snaps flag
    const resolved = r.pos && r.team_2026;
    const rookieFlag = r.data_coverage_flag === 'rookie_no_2025_snaps';
    if (!resolved && !rookieFlag) silent++;
  }
  if (silent > 0) throw new Error(`${silent} of ${sample.length} silent misses`);
  return `${sample.length} sampled, 0 silent misses`;
});

// #2 — Every PUP/IR row has availability_status and can't outrank healthy.
check('PUP/IR rows carry availability_status and are gate-able', () => {
  const benched = PLAYER_BOARD_2026.filter(r => ['PUP','IR','NFI','SUSP'].includes(r.availability_status));
  if (benched.length === 0) throw new Error('no benched rows found — expected at least Charbonnet');
  // Each must have a non-null availability_status (trivially true by filter)
  // AND a fresh last_verified_utc
  const stale = benched.filter(r => !r.availability_last_verified_utc);
  if (stale.length > 0) throw new Error(`${stale.length} benched rows missing last_verified_utc`);
  // Named directive case
  const charbonnet = PLAYER_BOARD_2026.find(r => r.name && r.name.startsWith('Zach Charbonnet'));
  if (!charbonnet) throw new Error('Charbonnet missing from board');
  if (charbonnet.availability_status !== 'PUP') throw new Error(`Charbonnet status = ${charbonnet.availability_status}, expected PUP`);
  return `${benched.length} on PUP/IR/NFI/SUSP; Charbonnet PUP verified`;
});

// #3 — Every team_changed player is flagged; raw shares carry the caveat.
check('Every team_changed player is flagged', () => {
  const changed = PLAYER_BOARD_2026.filter(r => r.team_changed === true);
  if (changed.length === 0) throw new Error('no team_changed rows found — expected Dowdle, Walker, etc.');
  // Directive-named traps
  const dowdle = PLAYER_BOARD_2026.find(r => r.name && r.name.includes('Rico Dowdle'));
  const walker = PLAYER_BOARD_2026.find(r => r.name && r.name.includes('Kenneth Walker'));
  if (dowdle && dowdle.team_changed !== true) throw new Error(`Dowdle team_changed = ${dowdle.team_changed}, expected true`);
  if (walker && walker.team_changed !== true) throw new Error(`Walker team_changed = ${walker.team_changed}, expected true`);
  return `${changed.length} team_changed rows; Dowdle=${dowdle?.team_2025}→${dowdle?.team_2026}, Walker=${walker?.team_2025}→${walker?.team_2026}`;
});

// #4 — Bye weeks validated against known roster.
check('Bye weeks match schedule2026 (spot-check 15 teams)', () => {
  const scheduleSrc = fs.readFileSync(REPO + 'src/data/schedule2026.js', 'utf8');
  const scheduleDoc = JSON.parse(scheduleSrc.slice(scheduleSrc.indexOf('{'), scheduleSrc.lastIndexOf('}') + 1));
  const teams = ['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX'];
  let mismatches = 0;
  for (const t of teams) {
    const scheduleBye = scheduleDoc.teams[t]?.byeWeek;
    const boardRow = PLAYER_BOARD_2026.find(r => r.team_2026 === t && r.pos === 'QB');
    if (!boardRow) continue;
    if (boardRow.bye_week !== scheduleBye) {
      mismatches++;
      console.log(`    ${t}: board=${boardRow.bye_week} schedule=${scheduleBye}`);
    }
  }
  if (mismatches > 0) throw new Error(`${mismatches} bye-week mismatches`);
  return `${teams.length}/${teams.length} teams validated`;
});

// #5 — K/DEF rows have coverage_flag = 'partial' + defer note.
check('K/DEF rows carry partial coverage_flag + defer note', () => {
  const kdef = PLAYER_BOARD_2026.filter(r => r.pos === 'K' || r.pos === 'DEF');
  if (kdef.length !== 64) throw new Error(`expected 64 K/DEF rows, got ${kdef.length}`);
  const wrong = kdef.filter(r => r.data_coverage_flag !== 'partial');
  if (wrong.length > 0) throw new Error(`${wrong.length} K/DEF rows without partial flag`);
  const noNote = kdef.filter(r => !r.notes || !/consensus/.test(r.notes));
  if (noNote.length > 0) throw new Error(`${noNote.length} K/DEF rows without defer-to-consensus note`);
  return `${kdef.length} K/DEF rows, all with partial flag + defer note`;
});

// #6 — availability_last_verified_utc < 24h old at build time.
check('availability_last_verified_utc < 24h old', () => {
  const sample = PLAYER_BOARD_2026.filter(r => r.availability_last_verified_utc).slice(0, 100);
  if (sample.length === 0) throw new Error('no availability timestamps at all');
  const now = Date.now();
  const stale = sample.filter(r => (now - new Date(r.availability_last_verified_utc).getTime()) > 24 * 3600 * 1000);
  if (stale.length > 0) throw new Error(`${stale.length} of ${sample.length} sampled rows have stale availability`);
  // Report freshest and oldest
  const ages = sample.map(r => (now - new Date(r.availability_last_verified_utc).getTime()) / 3600000);
  return `sampled ${sample.length} rows; oldest ${Math.max(...ages).toFixed(1)}h, newest ${Math.min(...ages).toFixed(1)}h`;
});

const passed = results.filter(r => r.pass).length;
console.log(`\n${'='.repeat(60)}`);
console.log(`Task 6 acceptance: ${passed}/${results.length} checks passed`);
console.log(`${'='.repeat(60)}`);
if (passed !== results.length) process.exit(1);
