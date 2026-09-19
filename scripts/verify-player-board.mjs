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

// E-038e (2026-09-18): import coachingTrees.js as a module for check #14
// rather than regex-scraping. Same lesson build-player-board.js just
// learned — a parsed object beats a fragile text scrape.
let COACHING = { teams: {}, trees: {}, changes_2026: {} };
try {
  const { pathToFileURL } = await import('url');
  const mod = await import(pathToFileURL(REPO + 'src/data/coachingTrees.js').href);
  COACHING = mod.COACHING_TREES || COACHING;
} catch (e) {
  console.error('warn: could not import coachingTrees.js —', e.message);
}

// NFL season year, matching fetch-injuries.js. The league year rolls over
// ~March 1 (free agency). Using this instead of getUTCFullYear() so that
// check #12 does not fail every build on 2027-01-01 when calendar-year
// rolls but the NFL 2026 season is still in playoffs.
function currentNflSeason() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  return m >= 3 ? y : y - 1;
}

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
  // Q-023 (2026-09-18): CI is not allowed to hit either skip path silently.
  // A shallow checkout (default actions/checkout depth=1) has HEAD but no
  // parent, so `git show HEAD:` succeeds — the failure path here fires only
  // when the file itself is absent from HEAD (rename, first-ever commit).
  // Locally, both paths are legitimate scratch cases; in CI, they hide
  // exactly the drift the check exists to catch.
  //
  // Q-027 (2026-09-18): the "previous committed board" defaults to HEAD,
  // which is right for the build workflow (data-board.yml runs the verifier
  // BEFORE the commit, so HEAD is the last good board). It is wrong for the
  // verify workflow (data-board-verify.yml runs AFTER the commit, so HEAD is
  // the board we just built and the check compares it to itself, always
  // Δ0). data-board-verify sets `PREV_BOARD_REF=HEAD~1` to point at the
  // pre-push board. Requires the checkout to have that parent commit —
  // enforced by fetch-depth: 2 in that workflow.
  const IS_CI = !!process.env.CI || !!process.env.GITHUB_ACTIONS;
  const PREV_REF = process.env.PREV_BOARD_REF || 'HEAD';
  let prevSrc;
  try {
    prevSrc = execFileSync('git', ['show', `${PREV_REF}:src/data/playerBoard2026.js`], { encoding: 'utf8', cwd: REPO, maxBuffer: 128 * 1024 * 1024 });
  } catch (e) {
    // First commit or shallow checkout — nothing to compare against.
    const gitMsg = String(e.stderr || e.message || 'unknown git error').trim().split('\n').slice(-2).join(' ');
    const reason = `${PREV_REF}:src/data/playerBoard2026.js not readable — ${gitMsg}`;
    if (IS_CI) throw new Error(`${reason}. In CI the comparison must have a baseline (the file must exist at ${PREV_REF} — a rename, delete, first-ever commit, or missing parent from shallow checkout is what usually breaks this); locally this path is a soft-skip for scratch builds.`);
    return `${reason} — SKIPPED (local run; CI would fail here)`;
  }
  // Match every `"gsis_id":` occurrence (with OR without quoted value —
  // K/DEF rows carry `gsis_id: null` and would otherwise be undercounted,
  // which is how a spot fix once reported 924 instead of the real 988).
  const prevCount = (prevSrc.match(/"gsis_id":/g) || []).length;
  if (prevCount === 0) {
    const reason = `previous board at ${PREV_REF} had 0 gsis_id matches (${prevSrc.length} bytes read) — file present but unparseable or truncated`;
    if (IS_CI) throw new Error(`${reason}. In CI this must be an incident, not a silent skip — either the previous commit truncated the board or the shape changed and this regex is stale.`);
    return `${reason} — SKIPPED (local run; CI would fail here)`;
  }
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
check('coachingTrees per-role and per-field NFL-season verification ratchet', () => {
  const treesMod = fs.readFileSync(REPO + 'src/data/coachingTrees.js', 'utf8');
  // Narrow the scan to the `teams: {` block only. E-038c added a
  // `changes_2026: {` block whose team keys would otherwise double the
  // count. Stop at the `},\n\n  changes_2026:` boundary (or at the end
  // of the object).
  const teamsStart = treesMod.indexOf('teams: {');
  if (teamsStart < 0) throw new Error('teams: block not found in coachingTrees.js');
  const changesStart = treesMod.indexOf('changes_2026: {', teamsStart);
  const teamsEnd = changesStart > 0 ? changesStart : treesMod.length;
  const teamsBlock = treesMod.substring(teamsStart, teamsEnd);
  // QA 2026-09-18 08:35 CT: was comparing to calendar-year, so 2027-01-01
  // would fail every build on a day nobody's watching. Compare to the
  // current NFL season instead (rolls over ~March 1, matches
  // fetch-injuries.js semantics).
  const currentYear = currentNflSeason();
  const teamKeys = [];
  const teamKeyRe = /^    ([A-Z]{2,3}):\s*\{/gm;
  let m;
  while ((m = teamKeyRe.exec(teamsBlock)) !== null) teamKeys.push(m[1]);
  if (teamKeys.length !== 32) throw new Error(`expected 32 team keys in coachingTrees.js teams block, found ${teamKeys.length}`);
  // E-038h (2026-09-18): style contract. A team's `style` field must be
  // either `null` (unsourced, renderer omits) OR a non-empty string with a
  // matching `style_source`. `style: ''` was the shape E-038g used to cut
  // the 17 unsourced strings; on 2026-09-18 the live bundle
  // (index-BgTBcjHG.js) rendered 17 blank italic lines because
  // MatchupCenter.jsx:311,318 printed the empty string. Fail hard on the
  // shape, not the count — an empty string is never a legitimate style
  // value, and the renderer now omits null but has no defence against ''.
  const emptyStyleTeams = [];
  for (const slice of teamsBlock.split(/\n(?=    [A-Z]{2,3}:\s*\{)/)) {
    const k = slice.match(/^\s*([A-Z]{2,3}):\s*\{/m);
    if (!k) continue;
    if (/style:\s*''/.test(slice) || /style:\s*""/.test(slice)) emptyStyleTeams.push(k[1]);
  }
  if (emptyStyleTeams.length > 0) {
    throw new Error(`coachingTrees.js contract violation: ${emptyStyleTeams.length} teams carry style: '' — use null for unsourced (renderer omits) or a non-empty string with a matching style_source. Offenders: ${emptyStyleTeams.join(', ')}.`);
  }
  // Count unverified (team, field) rows. 32 teams × 5 fields (hc, oc, dc,
  // trees, style) = 160 total. E-038b (2026-09-18): the 3 role fields are
  // fully verified for 2026 (96/96); the 2 scheme fields are partial —
  // 18 verified for the 9 teams with new 2026 HCs, 46 still inherited
  // from the 2025-2026 baseline. Ratchet is monotone: CEILING only drops
  // as verifications land, never rises.
  let unverified = 0;
  const unverifiedFields = [];
  const slices = teamsBlock.split(/\n(?=    [A-Z]{2,3}:\s*\{)/);
  for (const slice of slices) {
    const keyMatch = slice.match(/^\s*([A-Z]{2,3}):\s*\{/m);
    if (!keyMatch) continue;
    const team = keyMatch[1];
    // E-038d (2026-09-18, QA 09:05): a row that carries
    // `tree_confidence: 'closest-available'` (SHANAHAN as a stand-in
    // for CARROLL on TEN, etc.) is a partial verification — the source
    // says the coach's lineage but our 10 defined trees don't include
    // his home tree. Count the `trees` field as unverified when that
    // flag is set, regardless of trees_verified_on.
    const closestAvailable = /tree_confidence:\s*['"]closest-available['"]/.test(slice);
    for (const field of ['hc', 'oc', 'dc', 'trees', 'style']) {
      const re = new RegExp(`${field}_verified_on:\\s*'(\\d{4})-\\d{2}-\\d{2}'`);
      const rm = slice.match(re);
      const dateOk = rm && parseInt(rm[1], 10) >= currentYear;
      // The `trees` field on a closest-available row does not count as verified
      // even when its verified_on date matches — the tree label is a proxy.
      const confidenceGap = field === 'trees' && closestAvailable;
      // E-038g (2026-09-18, QA Q-048): the style field must also carry a
      // `style_source` URL, not just a fresh `style_verified_on`. A date-only
      // pass on `style` would let unsourced scheme characterisations back in;
      // QA flagged 23 pre-curation style strings (2 still naming schemes:
      // IND `RPO-spread`, PHI `RPO + Fangio defense`) that had no source and
      // no date. Fold source presence into the same unverified count so the
      // ratchet's 23 rows track provenance, not recency alone. Same rule
      // extended to `trees` (Q-043: 20 of 32 team rows were sourced only to
      // Wikipedia season pages; source presence is separately audited).
      const sourceRe = new RegExp(`${field}_source:\\s*['"][^'"]+['"]`);
      const sourceOk = sourceRe.test(slice);
      const sourceGap = (field === 'style' || field === 'trees') && !sourceOk;
      if (!dateOk || confidenceGap || sourceGap) {
        unverified++;
        const tag = confidenceGap ? ' (closest-available)' : sourceGap && dateOk ? ' (no source)' : '';
        unverifiedFields.push(`${team}.${field}${tag}`);
      }
    }
  }
  const CEILING = 47; // 2026-09-18 (E-038g): 23 unsourced trees + 23 unsourced style + 1 closest-available (TEN.trees). Same count as before — E-038g folds `style_source`/`trees_source` presence into the same unverified predicate rather than raising the number, so future date-only additions still trip the gate. Tighten as sourced verifications land.
  if (unverified > CEILING) {
    throw new Error(`${unverified} of 160 (team,field) rows unverified for NFL season ${currentYear} (ratchet ceiling: ${CEILING}). Sample: ${unverifiedFields.slice(0, 10).join(', ')}${unverifiedFields.length > 10 ? ', …' : ''}. Ratchet is monotone — the ceiling only ever drops, never rises.`);
  }
  return `${unverified} of 160 (team,field) rows unverified for NFL season ${currentYear} (ratchet ceiling: ${CEILING})`;
});

// #13 — no parallel staff table (E-038c 2026-09-18).
//
// QA 2026-09-18 08:35 CT caught the class: scripts/build-player-board.js
// held its own `COORDINATOR_MOVES_2026` with stale coach names, and it
// was what the board actually read while coachingTrees.js sat verified
// and ignored. Fix at root: one source of truth. This check guards
// against a parallel table coming back — flags any file under scripts/
// or src/ that defines a top-level `COORDINATOR_MOVES_*` identifier, OR
// that hardcodes one of the specific known-stale coach names outside
// coachingTrees.js.
check('No parallel staff table or stale coach hardcode outside coachingTrees.js', () => {
  const OFFENDERS = [];
  // Set of stale coach names E-038c retired (were current in COORDINATOR_MOVES_2026,
  // no longer current in coachingTrees.js). Any file that mentions one of these
  // as a JS string is either a stale reference or a comment; either way, flag.
  const STALE_NAMES = [
    'Declan Doyle',      // was CHI OC; now BAL OC — hardcoding CHI's OC as Doyle is stale
    'John Morton',       // was DET OC
    'Pete Carroll',      // was LV HC
    'Matt Nagy',         // was KC OC; now NYG OC
    'Frank Smith',       // was MIA OC
    'Terrell Williams',  // was NE DC
    'Al Harris',         // was DAL DC
    'Zach Orr',          // was BAL DC
    'Ken Dorsey',        // was CLE OC
    'Jim Schwartz',      // was CLE DC
    'Kliff Kingsbury',   // was WAS OC
    'Joe Whitt',         // was WAS DC
  ];
  const PARALLEL_TABLE_PATTERNS = [
    /const\s+COORDINATOR_MOVES(?:_\d{4})?\s*=/,   // the exact identifier we just deleted
    /const\s+COACHING_STAFF(?:_\d{4})?\s*=\s*\{/, // future parallel-table shape guess
  ];

  // Walk scripts/ and src/ for .js/.jsx/.mjs files.
  function walk(dir, out) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        walk(p, out);
      } else if (/\.(m?jsx?|mjs)$/.test(entry.name)) {
        out.push(p);
      }
    }
    return out;
  }
  const files = [
    ...walk(REPO + 'scripts', []),
    ...walk(REPO + 'src', []),
  ].filter(f =>
    !f.endsWith('/coachingTrees.js') &&
    !f.includes('/workflows-archive/') &&
    !f.includes('/_archive/') &&
    !f.endsWith('/verify-player-board.mjs') &&  // this file defines STALE_NAMES for the check itself
    // E-038e (2026-09-18): exclude generated data files. `playerBoard2026.js`
    // and `weeklyBoard2026.js` are written by build scripts and legitimately
    // contain every current coach's name in notes / rationale strings —
    // e.g., "Matt Nagy OC (from KC)" on NYG's row. That's Nagy in his
    // current role, not a stale hardcode. Source-file scans still catch
    // real hardcodes; data-file scans false-positive on legitimate
    // per-team notes.
    !f.endsWith('/src/data/playerBoard2026.js') &&
    !f.endsWith('/src/data/weeklyBoard2026.js')
  );

  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const re of PARALLEL_TABLE_PATTERNS) {
      if (re.test(src)) {
        // Cut a small context window for the offender line.
        const m = src.match(re);
        const idx = src.indexOf(m[0]);
        const line = src.substring(0, idx).split('\n').length;
        OFFENDERS.push(`${f.replace(REPO, '')}:${line} — parallel table identifier ${m[0]}`);
      }
    }
    for (const name of STALE_NAMES) {
      // Match the name as a plain string literal (single or double quote).
      const nameRe = new RegExp(`['"\`]${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}['"\`]`);
      if (nameRe.test(src)) {
        const line = src.substring(0, src.search(nameRe)).split('\n').length;
        OFFENDERS.push(`${f.replace(REPO, '')}:${line} — hardcoded stale coach "${name}" (retired 2026-09-18 E-038c)`);
      }
    }
  }

  if (OFFENDERS.length > 0) {
    const sample = OFFENDERS.slice(0, 5).join('\n    ');
    throw new Error(`${OFFENDERS.length} parallel-table / stale-coach reference(s) outside coachingTrees.js:\n    ${sample}${OFFENDERS.length > 5 ? `\n    …and ${OFFENDERS.length - 5} more` : ''}`);
  }
  return `${files.length} files scanned — none hardcodes a stale coach or a parallel staff table`;
});

// #14 — Board rows carry non-null coach names matching coachingTrees.js
// AND coordinator_is_new_2026 non-null on teams that have a changes_2026
// entry. E-038e (2026-09-18): peer QA 09:35 caught the class — the board
// had been shipping with 100% null hc_name/oc_name/dc_name because
// loadCoachingTrees() regex-parsed the JS text and stopped matching when
// E-038 changed the row shape. The 13/13 verifier stayed green through
// two commits because no check ever read a board row's coach fields.
// This is the E-023 lesson again: a green gate that does not assert the
// field is not a gate.
check('Board rows carry non-null coach names matching coachingTrees.js', () => {
  const teams = COACHING.teams || {};
  const changes = COACHING.changes_2026 || {};

  const skillRows = PLAYER_BOARD_2026.filter(r => r.pos && r.pos !== 'K' && r.pos !== 'DEF');
  if (skillRows.length === 0) throw new Error('no skill rows on the board — cannot verify coach names');

  const nullNames = [];
  const wrongNames = [];
  const nullChanges = [];
  for (const r of skillRows) {
    const staff = teams[r.team_2026];
    if (!staff) continue; // unknown team code — separate check would flag
    for (const role of [['hc', 'hc_name'], ['oc', 'oc_name'], ['dc', 'dc_name']]) {
      const [k, field] = role;
      if (r[field] == null) { nullNames.push(`${r.name}.${field}`); continue; }
      if (r[field] !== staff[k]) wrongNames.push(`${r.name}.${field}: board='${r[field]}' tree='${staff[k]}'`);
    }
    if (changes[r.team_2026] && r.coordinator_is_new_2026 === null) {
      nullChanges.push(`${r.name} (${r.team_2026})`);
    }
  }
  if (nullNames.length > 0) {
    const sample = nullNames.slice(0, 5).join(', ');
    throw new Error(`${nullNames.length} of ${skillRows.length * 3} skill (row, coach-field) rows are null. Sample: ${sample}. Class: E-023 — loader silently returned {}; the board's coach-name write blocks never fired.`);
  }
  if (wrongNames.length > 0) {
    const sample = wrongNames.slice(0, 5).join('\n    ');
    throw new Error(`${wrongNames.length} skill rows carry a coach name that disagrees with coachingTrees.js:\n    ${sample}`);
  }
  if (nullChanges.length > 0) {
    const sample = nullChanges.slice(0, 5).join(', ');
    throw new Error(`${nullChanges.length} skill rows on teams with a changes_2026 entry carry coordinator_is_new_2026: null. Sample: ${sample}. The changes_2026 join is broken.`);
  }
  return `${skillRows.length} skill rows: all coach names match coachingTrees.js; ${Object.keys(changes).length} changes_2026 teams all populated`;
});

const passed = results.filter(r => r.pass).length;
console.log(`\n${'='.repeat(60)}`);
console.log(`Task acceptance: ${passed}/${results.length} checks passed`);
console.log(`${'='.repeat(60)}`);
if (passed !== results.length) process.exit(1);
