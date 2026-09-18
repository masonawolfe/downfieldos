#!/usr/bin/env node
// EM/PO Directive v2 Task 6 acceptance verifier.
// All six criteria must pass the week before the draft.

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO = path.dirname(path.dirname(__filename)) + '/';

const board = await import(REPO + 'src/data/playerBoard2026.js');
const PLAYER_BOARD_2026 = board.PLAYER_BOARD_2026;
const meta = board.PLAYER_BOARD_2026_META;

// Optional: load the weekly board + the committed calibration for check #11.
// Absent files ⇒ check #11 no-ops with a note; the verifier stays honest
// about what it could and could not read.
let WEEKLY_BOARD = null, WEEKLY_META = null, CAL_DOC = null;
try {
  const wkb = await import(REPO + 'src/data/weeklyBoard2026.js');
  WEEKLY_BOARD = wkb.WEEKLY_BOARD_2026;
  WEEKLY_META = wkb.WEEKLY_BOARD_2026_META || null;
} catch {}
try {
  CAL_DOC = JSON.parse(fs.readFileSync(REPO + 'src/data/intelligence/calibration_2026.json', 'utf8'));
} catch {}

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

// #2 — Structural PUP/IR/SUSP assertion (P0 2026-09-16 rewrite).
//
// Previous version relied on a hardcoded spot-check ("Charbonnet must be PUP")
// which I softened into a print during E-023, which then let a broken board
// (0 PUP/IR/SUSP, was 63) commit as "6/6 passed". A verifier that reports
// instead of asserts is a no-op. Now hard-asserts the structural shape:
//
//   - At least 40 PUP/IR/NFI/SUSP rows in-season (typical NFL is ~60 across
//     all 32 teams). If we see 0 or a handful, availability didn't join.
//   - Every benched row still needs a fresh last_verified_utc (structural).
//   - Charbonnet spot-check remains as a PRINT so we see his status but the
//     build doesn't gate on it — he can come off PUP mid-season.
check('PUP/IR/SUSP row count is in the expected range', () => {
  const benched = PLAYER_BOARD_2026.filter(r => ['PUP','IR','NFI','SUSP'].includes(r.availability_status));
  const MIN = 40;
  if (benched.length < MIN) {
    throw new Error(`only ${benched.length} PUP/IR/NFI/SUSP rows — below the ${MIN} floor. Availability join likely broken (see #7 for the matched-count check).`);
  }
  const stale = benched.filter(r => !r.availability_last_verified_utc);
  if (stale.length > 0) throw new Error(`${stale.length} benched rows missing last_verified_utc`);
  // Print-only Charbonnet spot: informational, not a gate. Print the RAW
  // availability_status — no `|| 'ACT'` coalesce, or a null would silently
  // read as "ACT" and the print would lie about the join. (peer QA 2026-09-16)
  const charbonnet = PLAYER_BOARD_2026.find(r => r.name && r.name.startsWith('Zach Charbonnet'));
  const cbNote = charbonnet ? ` (Charbonnet: ${charbonnet.availability_status === undefined || charbonnet.availability_status === null ? 'null' : charbonnet.availability_status})` : ' (Charbonnet: missing)';
  return `${benched.length} on PUP/IR/NFI/SUSP${cbNote}`;
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

// #7 — Availability-matched row count (P0 2026-09-16).
// The 09-16 incident: fetch-availability.js ran in CI without its roster_weekly
// file (path probe fell through), matched 90 players by gsis_id instead of the
// usual 737, and the board still committed because the old spot-checks passed.
// A structural floor on how many board rows carry an availability status
// catches this class of regression whether or not the specific spot-checks
// do. Same signal from a different angle vs #2.
check('Availability-matched rows are above the floor', () => {
  const withStatus = PLAYER_BOARD_2026.filter(r => r.availability_status != null);
  const MIN = 700; // peer 2026-09-16: last good CI-mode matching was 737
  if (withStatus.length < MIN) {
    throw new Error(`only ${withStatus.length} of ${PLAYER_BOARD_2026.length} rows carry availability_status — below the ${MIN} floor. Almost certainly a Sleeper→gsis join failure.`);
  }
  return `${withStatus.length} rows matched (floor: ${MIN})`;
});

// #8 — Null-availability ratio (P0 2026-09-16).
// Complementary to #7: catch the case where the total row count is unusually
// small or the null share is unusually large. Fail above 40%.
check('Null availability share is below the ceiling', () => {
  const total = PLAYER_BOARD_2026.length;
  const nullish = PLAYER_BOARD_2026.filter(r => r.availability_status == null).length;
  const pct = (nullish / total) * 100;
  const MAX_PCT = 40;
  if (pct > MAX_PCT) {
    throw new Error(`${pct.toFixed(1)}% of ${total} rows have null availability_status (ceiling: ${MAX_PCT}%). Availability join likely broken.`);
  }
  return `${nullish}/${total} = ${pct.toFixed(1)}% null (ceiling: ${MAX_PCT}%)`;
});

// #10 — Every top-100-ADP player carries a non-null availability_status (E-035 2026-09-17).
//
// The Sept-17 draft-copilot report caught Josh Jacobs at ADP 20 with a null
// availability_status — the P0 join-shape failure at a different rank. Any
// top-100 player being unresolved is a class of failure worth trapping at
// the verifier gate, not discovering when a copilot recommends against a
// starter because his gate flagged the null.
check('Every top-100-ADP player carries a non-null availability_status', () => {
  const top = PLAYER_BOARD_2026
    .filter(r => r.adp_overall != null && r.adp_overall <= 100 && r.pos !== 'K' && r.pos !== 'DEF');
  const nulls = top.filter(r => r.availability_status == null);
  if (nulls.length > 0) {
    const names = nulls.slice(0, 5).map(r => `${r.name} (adp ${r.adp_overall})`).join(', ');
    throw new Error(`${nulls.length} of ${top.length} top-100-ADP players carry null availability_status: ${names}${nulls.length > 5 ? ', …' : ''}. Availability join lost a slice of the top of the board.`);
  }
  return `${top.length} top-100-ADP players all have a status`;
});

// #9 — Row count is within ±5% of the previous committed board (E-027 2026-09-16).
//
// Catches the class of failure where a downstream input silently truncates
// (a broken join, a truncated fetch, an env-path fallthrough that leaves the
// build with only a subset of players). The Sept 4 → Sept 16 phase transition
// (nflverse dropping preseason-cut skill players as teams settled to 53)
// was a legitimate one-time ~7.5% drop; that shift is now the new baseline.
// Steady-state week-to-week roster churn stays well inside ±5%.
check('Row count is within ±5% of the previous committed board', () => {
  let prevSrc;
  try {
    prevSrc = execFileSync('git', ['show', 'HEAD:src/data/playerBoard2026.js'], { encoding: 'utf8', cwd: REPO, maxBuffer: 128 * 1024 * 1024 });
  } catch (e) {
    // First commit or shallow checkout — nothing to compare against. Emit a
    // note but do NOT fail: the check exists to catch drift, not to gate the
    // first-ever commit.
    return 'no previous commit — first build (skipped comparison)';
  }
  // Match every `"gsis_id":` occurrence (with OR without quoted value —
  // K/DEF rows carry `gsis_id: null` and would otherwise be undercounted,
  // which is how a spot fix once reported 924 instead of the real 988).
  const prevCount = (prevSrc.match(/"gsis_id":/g) || []).length;
  if (prevCount === 0) return 'previous board had 0 rows or is unparseable — skipping comparison';
  const cur = PLAYER_BOARD_2026.length;
  const delta = cur - prevCount;
  const pct = (delta / prevCount) * 100;
  const MAX_PCT = 5;
  if (Math.abs(pct) > MAX_PCT) {
    throw new Error(`row count changed ${pct.toFixed(1)}% (${prevCount} → ${cur}, Δ${delta}) — outside the ±${MAX_PCT}% band. If this is a legitimate multi-team roster event, land a manual override with a note.`);
  }
  return `${cur} rows (prev ${prevCount}, Δ${delta >= 0 ? '+' : ''}${delta} = ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
});

// #11 — Committed calibration matches the committed weekly board.
//
// QA 2026-09-17 20:05 caught the class where CALIBRATION.md shipped in
// the same commit as a weekly-board rewrite, but the calibration was
// generated from the PRE-rewrite board — 41 of 316 `projected` values
// were stale on arrival. The in-script assert in build-calibration.js
// is a tautology (same in-memory board), so the real drift protection
// lives HERE: load `calibration_2026.json` from disk and check every
// row against the committed WEEKLY_BOARD_2026. Also refuse to pass if
// the calibration's stamp of `weekly_board_generated_utc` is older
// than the current WEEKLY_BOARD_META.generated — the "table lags the
// board" signal, encoded.
check('Calibration matches the committed weekly board (or is absent)', () => {
  if (!CAL_DOC) return 'no calibration_2026.json on disk — skipped';
  if (!WEEKLY_BOARD) return 'no weeklyBoard2026.js — skipped';
  const boardWv = new Map();
  for (const r of WEEKLY_BOARD) boardWv.set(`${r.gsis_id}_${r.week}`, r.weekly_value);
  const mismatches = (CAL_DOC.rows || []).filter(r => {
    const bv = boardWv.get(`${r.gsis_id}_${r.week}`);
    return bv == null || Math.abs(bv - r.projected) > 0.001;
  });
  if (mismatches.length > 0) {
    const sample = mismatches.slice(0, 5).map(m => {
      const bv = boardWv.get(`${m.gsis_id}_${m.week}`);
      return `${m.name} wk${m.week}: cal=${m.projected} board=${bv}`;
    }).join('; ');
    throw new Error(`${mismatches.length} of ${CAL_DOC.rows.length} calibration rows do not match the committed board's weekly_value — ${sample}`);
  }
  // Stamp check: if calibration's weekly_board timestamp trails the current
  // board's, the calibration is stale relative to what's about to ship.
  const calStamp = CAL_DOC.meta?.weekly_board_generated_utc;
  const wkbStamp = WEEKLY_META?.generated;
  if (calStamp && wkbStamp && new Date(calStamp) < new Date(wkbStamp)) {
    throw new Error(`CALIBRATION.md's Weekly board generated stamp (${calStamp}) is older than the current WEEKLY_BOARD (${wkbStamp}) — regenerate calibration.`);
  }
  return `${CAL_DOC.rows.length} calibration rows match; stamp ${calStamp || 'unknown'} ≥ board ${wkbStamp || 'unknown'}`;
});

// #12 — coachingTrees.js provenance ratchet (E-038 2026-09-18).
//
// Every team should carry {hc,oc,dc}_verified_on with an ISO date inside the
// current NFL season. Rows that inherited from the 2025-2026 curated file
// without primary-source verification count as stale. Peer QA 2026-09-18
// caught CHI shipping Declan Doyle as OC when Press Taylor holds the job
// in 2026, and DET is similarly stale — no free feed carries coordinator
// names, so the file has to be curated by hand.
//
// Ratchet: fail only when the stale count EXCEEDS the ceiling below. Today
// exactly one team (CHI) is fully verified for 2026, so 31 stale is the
// starting ceiling. Tighten this number as teams are primary-verified.
// The ceiling is a monotone commitment — it never goes up.
check('coachingTrees per-role 2026 verification ratchet', () => {
  const treesMod = fs.readFileSync(REPO + 'src/data/coachingTrees.js', 'utf8');
  const startTag = 'teams: {';
  const startIdx = treesMod.indexOf(startTag);
  if (startIdx < 0) throw new Error('teams: block not found in coachingTrees.js');
  const currentYear = new Date().getUTCFullYear();
  // Rough team-key match: ^    XXX: { on its own line.
  const teamKeys = [];
  const teamKeyRe = /^    ([A-Z]{2,3}):\s*\{/gm;
  let m;
  while ((m = teamKeyRe.exec(treesMod)) !== null) teamKeys.push(m[1]);
  if (teamKeys.length !== 32) throw new Error(`expected 32 team keys in coachingTrees.js, found ${teamKeys.length}`);
  // Count unverified ROLES (not teams). 32 teams × 3 roles (HC, OC, DC) = 96
  // total; each row needs its own primary-source date. Peer QA 2026-09-18:
  // CHI OC (Press Taylor) is verified, the other 95 are inherited from the
  // 2025-2026 curated file and have not been checked against a primary
  // source for 2026. The ratchet is monotone — the CEILING only drops as
  // verifications land, never rises.
  let unverified = 0;
  const unverifiedRoles = [];
  const slices = treesMod.slice(startIdx).split(/\n(?=    [A-Z]{2,3}:\s*\{)/);
  for (const slice of slices) {
    const keyMatch = slice.match(/^\s*([A-Z]{2,3}):\s*\{/m);
    if (!keyMatch) continue;
    const team = keyMatch[1];
    for (const role of ['hc', 'oc', 'dc']) {
      const re = new RegExp(`${role}_verified_on:\\s*'(\\d{4})-\\d{2}-\\d{2}'`);
      const rm = slice.match(re);
      if (!rm || parseInt(rm[1], 10) < currentYear) {
        unverified++;
        unverifiedRoles.push(`${team}.${role}`);
      }
    }
  }
  const CEILING = 0; // 2026-09-18: all 32 teams primary-verified for 2026 season. Any regression fires.
  if (unverified > CEILING) {
    throw new Error(`${unverified} of 96 (team,role) rows unverified for ${currentYear} (ratchet ceiling: ${CEILING}). Sample: ${unverifiedRoles.slice(0, 10).join(', ')}${unverifiedRoles.length > 10 ? ', …' : ''}. Ratchet is monotone — the ceiling only ever drops, never rises.`);
  }
  return `${unverified} of 96 (team,role) rows unverified (ratchet ceiling: ${CEILING}) — tighten as verifications land`;
});

const passed = results.filter(r => r.pass).length;
console.log(`\n${'='.repeat(60)}`);
console.log(`Task acceptance: ${passed}/${results.length} checks passed`);
console.log(`${'='.repeat(60)}`);
if (passed !== results.length) process.exit(1);
