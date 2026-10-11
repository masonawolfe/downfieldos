#!/usr/bin/env node
/**
 * results-gate.mjs — E-053 (2026-10-10), the gate at the top of
 * .github/workflows/data-tuesday-results.yml (diagnosis 2026-10-06 #3).
 *
 * Decides whether week N's results are complete enough to grade, and
 * whether this run has anything to do. Writes `week`, `ready`, `done` and
 * `reason` to $GITHUB_OUTPUT (and a line to the job summary).
 *
 *   N      = env RESULTS_WEEK, else the latest REG week whose LAST kickoff
 *            was at least 4h ago (Tuesday morning UTC → the week that ended
 *            with Monday night's game).
 *   done   = committed calibration (HEAD) already grades N AND the week
 *            N+1 snapshot is committed — a later cron of the same Tuesday
 *            is a no-op. Set RESULTS_FORCE=yes to re-run anyway.
 *   ready  = every scheduled REG game of week N has player rows in the
 *            freshly fetched weekly_actuals_2026.json, AND (if a PBP file
 *            is given) play-by-play rows for every week-N game_id.
 *
 * Usage: node scripts/results-gate.mjs [--pbp path/to/play_by_play_2026.csv.gz]
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import readline from 'readline';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { weekGames, lastKickoffUtcMs, regWeeks, actualsCompleteness } from './_lib/kickoff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
const pbpPath = args.includes('--pbp') ? args[args.indexOf('--pbp') + 1] : null;
const nowMs = process.env.RESULTS_NOW ? Date.parse(process.env.RESULTS_NOW) : Date.now();

function out(k, v) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
  console.log(`  ${k}=${v}`);
}
function summary(line) {
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, line + '\n');
}

async function pbpGameIds(file, week) {
  const ids = new Set();
  const rl = readline.createInterface({ input: fs.createReadStream(file).pipe(zlib.createGunzip()), crlfDelay: Infinity });
  let gi = -1, wi = -1, ti = -1;
  for await (const line of rl) {
    if (gi < 0) {
      const h = line.split(',').map(x => x.replace(/^"|"$/g, ''));
      gi = h.indexOf('game_id'); wi = h.indexOf('week'); ti = h.indexOf('season_type');
      if (gi < 0 || wi < 0) throw new Error(`PBP header lacks game_id/week (${h.slice(0, 8).join(',')}…)`);
      continue;
    }
    // game_id and week sit early in nflverse PBP rows, before any quoted
    // free-text column, so a plain split is safe for these two fields.
    const c = line.split(',');
    if (Number(c[wi]) === week && (ti < 0 || c[ti] === 'REG' || c[ti] === '"REG"')) ids.add(c[gi].replace(/"/g, ''));
  }
  return ids;
}

async function main() {
  const { SCHEDULE_2026: schedule } = await import(pathToFileURL(path.join(REPO, 'src', 'data', 'schedule2026.js')).href);
  let week = process.env.RESULTS_WEEK ? Number(process.env.RESULTS_WEEK) : null;
  if (!week) {
    for (const w of regWeeks(schedule)) {
      const last = lastKickoffUtcMs(schedule, w);
      if (last != null && nowMs - last >= 4 * 3600e3) week = w;
    }
  }
  if (!week) { out('week', ''); out('ready', 'false'); out('done', 'false'); out('reason', 'no REG week has finished yet'); return; }
  out('week', week);

  // done? — read the COMMITTED state, not the workspace.
  let done = false, doneWhy = '';
  try {
    const cal = JSON.parse(execFileSync('git', ['-C', REPO, 'show', 'HEAD:src/data/intelligence/calibration_2026.json'], { maxBuffer: 64 * 1024 * 1024 }).toString());
    const graded = (cal.meta?.weeks_complete || []).includes(week);
    const isLast = week === regWeeks(schedule).slice(-1)[0];
    const nextSnap = `src/data/intelligence/weekly_projections/2026-w${String(week + 1).padStart(2, '0')}.json`;
    let snapCommitted = isLast;
    if (!isLast) { try { execFileSync('git', ['-C', REPO, 'cat-file', '-e', `HEAD:${nextSnap}`], { stdio: 'ignore' }); snapCommitted = true; } catch {} }
    done = graded && snapCommitted;
    doneWhy = `committed calibration grades week ${week}: ${graded}; week ${week + 1} snapshot committed: ${snapCommitted}`;
  } catch (e) { doneWhy = `could not read committed calibration (${e.message.split('\n')[0]})`; }
  if (done && process.env.RESULTS_FORCE !== 'yes') {
    out('ready', 'false'); out('done', 'true'); out('reason', `already done — ${doneWhy}`);
    summary(`**Week ${week} results: already done.** ${doneWhy}.`);
    return;
  }
  out('done', 'false');

  const actuals = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'intelligence', 'weekly_actuals_2026.json'), 'utf8'));
  const comp = actualsCompleteness(schedule, actuals.rows)[week] || { games_seen: 0, games_scheduled: weekGames(schedule, week).length, complete: false };
  const reasons = [`actuals ${comp.games_seen}/${comp.games_scheduled} games`];
  let ready = comp.complete;
  if (pbpPath) {
    const ids = await pbpGameIds(pbpPath, week);
    const sched = weekGames(schedule, week).map(g => g.game_id);
    const missing = sched.filter(id => !ids.has(id));
    reasons.push(`play-by-play ${sched.length - missing.length}/${sched.length} games${missing.length ? ` (missing ${missing.join(', ')})` : ''}`);
    if (missing.length) ready = false;
  }
  out('ready', ready ? 'true' : 'false');
  out('reason', `week ${week}: ${reasons.join('; ')}`);
  summary(`**Week ${week} results gate: ${ready ? 'READY' : 'NOT READY'}** — ${reasons.join('; ')}.`);
}

main().catch(e => { console.error('results-gate fatal:', e.message); process.exit(1); });
