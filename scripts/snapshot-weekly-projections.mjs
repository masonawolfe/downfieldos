#!/usr/bin/env node
/**
 * snapshot-weekly-projections.mjs — E-052 (2026-10-10).
 *
 * Freezes the weekly projection of record for one NFL week into
 *   src/data/intelligence/weekly_projections/2026-wNN.json
 * so calibration grades every week against what the board said BEFORE that
 * week kicked off — never against weeklyBoard2026.js, which is rebuilt with
 * current teams for all 18 weeks and would otherwise re-grade history with
 * hindsight (DATA_PIPELINE_DIAGNOSIS_2026-10-06 #5).
 *
 * Write-once. A week file that exists is never rewritten, by any mode, for
 * any reason. There is no --force. Verifier check #19 also fails the build
 * if any committed week file differs from the previous commit.
 *
 * Normal mode (CI):  node scripts/snapshot-weekly-projections.mjs
 *   Target = the upcoming week (smallest REG week whose first kickoff is in
 *   the future). Written only if its file does not exist AND the window is
 *   open: the previous week's actuals are complete (every scheduled game
 *   has player rows in weekly_actuals_2026.json), or first kickoff is less
 *   than WINDOW_HOURS_BEFORE_KICKOFF away (fallback if results are late).
 *   Rows come from the weeklyBoard2026.js built earlier in the same job.
 *
 * Seed mode (one-time, run by hand): --seed-from-ref <git-ref> --weeks 1-5
 *   Writes weeks from the weekly board as committed at <ref>, stamped with
 *   that board's own META.generated, with post-kickoff games listed. Used to
 *   preserve the 2026-09-18 build (aec9534) — the projections calibration
 *   has graded weeks 1-4 against since E-032.
 *
 * Test hook: --now <ISO> overrides the clock (local proofs only).
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { firstKickoffUtcMs, kickoffsUtc, upcomingWeek, actualsCompleteness, regWeeks } from './_lib/kickoff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const SEASON = 2026;
export const SNAP_DIR = path.join(REPO, 'src', 'data', 'intelligence', 'weekly_projections');
const WINDOW_HOURS_BEFORE_KICKOFF = 30;

const args = process.argv.slice(2);
const argVal = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const nowMs = argVal('--now') ? Date.parse(argVal('--now')) : Date.now();
const seedRef = argVal('--seed-from-ref');
const seedWeeks = argVal('--weeks');

export const snapPath = (week) => path.join(SNAP_DIR, `${SEASON}-w${String(week).padStart(2, '0')}.json`);

const ROW_FIELDS = [
  'gsis_id', 'name', 'pos', 'team_2026', 'week', 'opponent', 'home_away', 'game_id', 'gameday', 'gametime',
  'is_dome_game', 'is_short_week', 'is_bye_return', 'tz_delta', 'opp_fpts_allowed_to_pos',
  'weekly_value', 'weekly_value_rationale', 'weekly_value_components',
];

function pickRow(r) {
  const o = {};
  for (const f of ROW_FIELDS) o[f] = r[f] === undefined ? null : r[f];
  return o;
}

/** Deterministic serialisation: header pretty-printed, one row per line. */
function serialise(header, rows) {
  const rowsJson = rows.map(r => JSON.stringify(r));
  const sha = crypto.createHash('sha256').update('[' + rowsJson.join(',') + ']').digest('hex');
  const head = JSON.stringify({ ...header, row_count: rows.length, rows_sha256: sha }, null, 2);
  return head.replace(/\n}$/, ',\n  "rows": [\n    ' + rowsJson.join(',\n    ') + '\n  ]\n}\n');
}

function loadModuleFromSource(src, name) {
  const tmp = path.join(fs.mkdtempSync(path.join(process.env.RUNNER_TEMP || '/tmp', 'snap-')), `${name}.mjs`);
  fs.writeFileSync(tmp, src);
  return import(pathToFileURL(tmp).href);
}

function buildSnapshot({ week, rowsAll, boardMeta, writtenUtc, provenance, schedule }) {
  const rows = rowsAll
    .filter(r => r.week === week && !r.is_bye && r.weekly_value != null)
    .map(pickRow)
    .sort((a, b) => String(a.gsis_id || a.name).localeCompare(String(b.gsis_id || b.name)));
  const kicks = kickoffsUtc(schedule, week);
  const writtenMs = Date.parse(writtenUtc);
  const first = kicks.length ? kicks[0].ms : null;
  const header = {
    season: SEASON,
    week,
    written_utc: writtenUtc,
    first_kickoff_utc: first != null ? new Date(first).toISOString() : null,
    written_before_kickoff: first != null && writtenMs < first,
    post_kickoff_game_ids: kicks.filter(k => k.ms <= writtenMs).map(k => k.game_id),
    model_version: boardMeta?.model_version || 'E-004 v1 (pre-2026-10-10): base pace + matchup-defense adj (±4 cap, full team gap) + env/rest adjustments, no floor',
    source_board_generated: boardMeta?.generated || null,
    source_board_inputs: boardMeta?.inputs || null,
    provenance,
    policy: 'Write-once. Never rewritten. Calibration grades this week against these rows. E-052.',
  };
  return { header, rows };
}

function writeOnce(week, header, rows) {
  const p = snapPath(week);
  if (fs.existsSync(p)) {
    console.log(`  w${week}: ${path.relative(REPO, p)} exists — frozen, untouched.`);
    return false;
  }
  fs.mkdirSync(SNAP_DIR, { recursive: true });
  fs.writeFileSync(p, serialise(header, rows));
  console.log(`  w${week}: wrote ${path.relative(REPO, p)} — ${rows.length} rows, written ${header.written_utc}, before kickoff: ${header.written_before_kickoff}${header.post_kickoff_game_ids.length ? ` (post-kickoff games: ${header.post_kickoff_game_ids.join(', ')})` : ''}`);
  return true;
}

async function main() {
  const { SCHEDULE_2026: schedule } = await import(pathToFileURL(path.join(REPO, 'src', 'data', 'schedule2026.js')).href);
  console.log(`E-052 weekly projection snapshots — now ${new Date(nowMs).toISOString()}`);

  if (seedRef) {
    if (!seedWeeks) throw new Error('--seed-from-ref needs --weeks a-b');
    const [a, b] = seedWeeks.split('-').map(Number);
    const src = execFileSync('git', ['-C', REPO, 'show', `${seedRef}:src/data/weeklyBoard2026.js`], { maxBuffer: 64 * 1024 * 1024 }).toString();
    const mod = await loadModuleFromSource(src, 'weeklyBoard-seed');
    const meta = mod.WEEKLY_BOARD_2026_META || {};
    const sha = execFileSync('git', ['-C', REPO, 'rev-parse', seedRef]).toString().trim();
    for (let w = a; w <= (b || a); w++) {
      const { header, rows } = buildSnapshot({
        week: w, rowsAll: mod.WEEKLY_BOARD_2026, boardMeta: meta, writtenUtc: meta.generated, schedule,
        provenance: `seed: src/data/weeklyBoard2026.js at ${sha} (the 2026-09-18 manual build, unchanged until E-052). The projections calibration graded weeks 1-4 against since E-032. Week 1 was built after week 1 was played; week 2 after its first game kicked off — see post_kickoff_game_ids.`,
      });
      writeOnce(w, header, rows);
    }
    return;
  }

  const target = upcomingWeek(schedule, nowMs);
  if (target == null) { console.log('  no upcoming REG week — season over. Nothing to write.'); return; }
  if (fs.existsSync(snapPath(target))) { writeOnce(target, null, null); return; }

  const firstReg = regWeeks(schedule)[0];
  const firstKick = firstKickoffUtcMs(schedule, target);
  let open = false, why = '';
  if (target === firstReg) { open = true; why = 'first week of the season'; }
  else {
    const actualsPath = path.join(REPO, 'src', 'data', 'intelligence', `weekly_actuals_${SEASON}.json`);
    const rows = fs.existsSync(actualsPath) ? JSON.parse(fs.readFileSync(actualsPath, 'utf8')).rows : [];
    const prev = actualsCompleteness(schedule, rows)[target - 1];
    if (prev?.complete) { open = true; why = `week ${target - 1} actuals complete (${prev.games_seen}/${prev.games_scheduled} games)`; }
    else if (firstKick - nowMs <= WINDOW_HOURS_BEFORE_KICKOFF * 3600e3) {
      open = true; why = `fallback: first kickoff ${new Date(firstKick).toISOString()} is under ${WINDOW_HOURS_BEFORE_KICKOFF}h away and week ${target - 1} actuals are ${prev ? `${prev.games_seen}/${prev.games_scheduled}` : 'absent'}`;
    } else {
      why = `week ${target - 1} actuals ${prev ? `${prev.games_seen}/${prev.games_scheduled} games` : 'absent'}; first kickoff ${new Date(firstKick).toISOString()} is more than ${WINDOW_HOURS_BEFORE_KICKOFF}h away`;
    }
  }
  if (!open) { console.log(`  w${target}: window not open — ${why}. Nothing written.`); return; }

  const { WEEKLY_BOARD_2026: board, WEEKLY_BOARD_2026_META: meta } =
    await import(pathToFileURL(path.join(REPO, 'src', 'data', 'weeklyBoard2026.js')).href);
  const writtenUtc = new Date(nowMs).toISOString();
  const { header, rows } = buildSnapshot({
    week: target, rowsAll: board, boardMeta: meta, writtenUtc, schedule,
    provenance: `weeklyBoard2026.js generated ${meta?.generated}, frozen by scripts/snapshot-weekly-projections.mjs (${why}).`,
  });
  if (!header.written_before_kickoff) throw new Error(`refusing to write w${target}: written_utc ${writtenUtc} is not before first kickoff ${header.first_kickoff_utc}`);
  if (rows.length === 0) throw new Error(`refusing to write w${target}: 0 scored rows in weeklyBoard2026.js for that week`);
  writeOnce(target, header, rows);
}

main().catch(err => { console.error('Fatal:', err.message || err); process.exit(1); });
