#!/usr/bin/env node
/**
 * backtest-availability-zero.mjs — model build part 0 (2026-11-22, Mason:
 * "Yeah, build it"; 00_System/DECISIONS.md 2026-11-22; condition 1: a part
 * that changes how a number is computed is tested on weeks already played
 * and ships only if it beats having no term).
 *
 * Question: would the frozen weekly projections have been closer to what
 * happened if a player on a reserve list (injured reserve, physically unable
 * to perform, suspended, non-football injury) or ruled out on the injury
 * report had been projected at zero?
 *
 * Inputs, all already in the repo:
 *   - the write-once snapshots src/data/intelligence/weekly_projections/2026-wNN.json
 *   - weekly_actuals_2026.json (fantasy_points_graded, the board's rules)
 *   - availability_2026.json AS IT WAS COMMITTED before each week's freeze,
 *     read from git history (the file is refreshed daily from Sleeper).
 *     No network call.
 *
 * As-of time per week (--as-of): "tuesday", the default, is 60 hours before
 * the week's first kickoff, which is when the Tuesday chain freezes the week
 * and so how the rule runs from now on. "frozen" is the earlier of that and
 * the snapshot's written_utc; weeks 1 to 7 are seeds written on 2026-09-18,
 * so under "frozen" they read a list up to five weeks stale.
 *
 * Grading population: every snapshot row with a projection in a complete
 * week. A projected player with no stat line that week scored 0 (he did not
 * play, or played and recorded nothing). This differs from CALIBRATION.md,
 * which grades only players with a stat line and so cannot see this error.
 * The calibration-population result is printed beside it.
 *
 * Usage: node scripts/backtest-availability-zero.mjs [--git-ref origin/main] [--out path.json]
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
const argVal = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const REF = argVal('--git-ref', 'HEAD');
const OUT = argVal('--out', null);
// --as-of tuesday (default): 60 hours before each week's first kickoff, how
// the rule runs from now on. --as-of frozen: the earlier of that and the
// snapshot's written_utc (weeks 1 to 7 then read the 2026-09-18 file).
const AS_OF = argVal('--as-of', 'tuesday');
const AV_PATH = 'src/data/intelligence/availability_2026.json';

const RESERVE = new Set(['IR', 'PUP', 'SUSP', 'NFI']);

const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 28 });

// Availability history: [{sha, t}] oldest first.
const history = git('log', '--reverse', '--format=%H %cI', REF, '--', AV_PATH)
  .trim().split('\n').filter(Boolean)
  .map(l => { const [sha, iso] = l.split(' '); return { sha, t: Date.parse(iso) }; });
// QA note (d), 2026-11-22: on a shallow clone git log returns one commit or
// none, every week is skipped, and the script used to exit 0 with nothing
// graded. Fail loudly instead.
if (history.length < 2) {
  console.error(`backtest refused: ${history.length} commit(s) of ${AV_PATH} in ${REF}'s history; the test needs the file as it was before each week (unshallow the clone: git fetch --unshallow).`);
  process.exit(1);
}
const avCache = new Map();
function availabilityAt(tMs) {
  let pick = null;
  for (const h of history) { if (h.t <= tMs) pick = h; else break; }
  if (!pick) return null;
  if (!avCache.has(pick.sha)) {
    const doc = JSON.parse(git('show', `${pick.sha}:${AV_PATH}`));
    avCache.set(pick.sha, { sha: pick.sha, committed: new Date(pick.t).toISOString(), players: doc.players || {} });
  }
  return avCache.get(pick.sha);
}

const actuals = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/intelligence/weekly_actuals_2026.json'), 'utf8'));
const actualBy = new Map(actuals.rows.map(r => [`${r.gsis_id}_${r.week}`, r.fantasy_points_graded]));
const weeksPresent = new Set(actuals.meta.weeks_present);

// Completeness: a week is graded only when every scheduled game has stats,
// the same rule build-calibration.js uses (games seen vs scheduled).
const { SCHEDULE_2026 } = await import(path.join(REPO, 'src/data/schedule2026.js'));
const scheduled = {}, seen = {};
for (const t of Object.values(SCHEDULE_2026.teams || {})) for (const g of t.games || []) {
  if ((g.game_type || 'REG') !== 'REG') continue;
  (scheduled[g.week] ||= new Set()).add(g.game_id);
}
for (const r of actuals.rows) (seen[r.week] ||= new Set()).add([r.team, r.opponent].sort().join('_'));

const SNAP_DIR = path.join(REPO, 'src/data/intelligence/weekly_projections');
const snaps = fs.readdirSync(SNAP_DIR).filter(f => /^2026-w\d\d\.json$/.test(f)).sort()
  .map(f => JSON.parse(fs.readFileSync(path.join(SNAP_DIR, f), 'utf8')));

function arm(rows, ruleFn) {
  let abs = 0, absCal = 0, nCal = 0, zeroed = 0, falseZero = 0, falseZeroPts = 0, savedErr = 0;
  for (const r of rows) {
    const act = r.actual;
    const proj = ruleFn(r) ? 0 : r.proj;
    if (proj === 0 && r.proj > 0) {
      zeroed++;
      if (act > 0) { falseZero++; falseZeroPts += act; }
      savedErr += Math.abs(act - r.proj) - Math.abs(act - 0);
    }
    abs += Math.abs(act - proj);
    if (r.hasStatLine) { absCal += Math.abs(act - proj); nCal++; }
  }
  const r2 = x => Math.round(x * 1000) / 1000;
  return { n: rows.length, mae: r2(abs / rows.length), n_calibration_pop: nCal, mae_calibration_pop: nCal ? r2(absCal / nCal) : null,
    zeroed, false_zero: falseZero, false_zero_points: r2(falseZeroPts), abs_error_removed: r2(savedErr) };
}

// The week's own final injury report (nflverse injuries, Friday or Saturday).
// Not known at the Tuesday freeze; this arm measures what the daily rebuild
// of the live board would gain once the report is out.
const inj = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/intelligence/injuries_2026.json'), 'utf8'));
const outByWeek = new Set();
for (const p of inj.players || []) for (const wk of p.weeks || []) if (wk.report_status === 'Out') outByWeek.add(`${p.gsis_id}_${wk.week}`);
const isReserve = r => r.av && RESERVE.has(r.av.status);
const isReserveOrReportOut = r => isReserve(r) || outByWeek.has(`${r.gsis_id}_${r.week}`);
const isReserveOrOut = r => isReserve(r) || (r.av && r.av.game_designation === 'O');

const perWeek = [];
const allRows = [];
const statusTally = {};
for (const s of snaps) {
  const w = s.week;
  if (!weeksPresent.has(w)) continue;
  const games = scheduled[w]?.size || 0;
  if (!games || (seen[w]?.size || 0) < games) continue; // partial week: not graded
  const kickoff = Date.parse(s.first_kickoff_utc);
  const tuesday = kickoff - 60 * 3600 * 1000;
  const asOf = AS_OF === 'frozen' ? Math.min(Date.parse(s.written_utc), tuesday) : tuesday;
  const av = availabilityAt(asOf);
  if (!av) { perWeek.push({ week: w, skipped: 'no availability file committed before the as-of time' }); continue; }
  const rows = [];
  for (const row of s.rows) {
    if (row.weekly_value == null) continue;
    const key = `${row.gsis_id}_${w}`;
    const hasStatLine = actualBy.has(key);
    const a = av.players[row.gsis_id] || null;
    if (a) statusTally[a.status] = (statusTally[a.status] || 0) + 1;
    rows.push({ week: w, gsis_id: row.gsis_id, name: row.name, pos: row.pos, proj: row.weekly_value,
      actual: hasStatLine ? (actualBy.get(key) ?? 0) : 0, hasStatLine, av: a });
  }
  allRows.push(...rows);
  const none = arm(rows, () => false), res = arm(rows, isReserve), resOut = arm(rows, isReserveOrOut), resRep = arm(rows, isReserveOrReportOut);
  perWeek.push({ week: w, as_of_utc: new Date(asOf).toISOString(), availability_commit: av.sha.slice(0, 7), availability_committed: av.committed,
    snapshot_written_before_kickoff: s.written_before_kickoff, none, reserve: res, reserve_or_out: resOut, reserve_or_week_report_out: resRep,
    reserve_beats_none: res.mae < none.mae, reserve_or_out_beats_none: resOut.mae < none.mae,
    zeroed_players_reserve_or_out: rows.filter(isReserveOrOut).map(r => ({ name: r.name, pos: r.pos, proj: r.proj, actual: r.actual, status: r.av.status, designation: r.av.game_designation })) });
}

const overall = { none: arm(allRows, () => false), reserve: arm(allRows, isReserve), reserve_or_out: arm(allRows, isReserveOrOut), reserve_or_week_report_out: arm(allRows, isReserveOrReportOut) };
const graded = perWeek.filter(p => !p.skipped);
const result = {
  generated_utc: new Date().toISOString(),
  git_ref: REF,
  as_of_mode: AS_OF,
  question: 'Is a frozen weekly projection closer to the result when a player on a reserve list or ruled out at freeze time is projected at zero?',
  reserve_statuses: [...RESERVE],
  population: 'every snapshot row with a projection in a complete week; no stat line = 0 points',
  weeks: graded.map(p => p.week),
  overall,
  weeks_reserve_beats_none: graded.filter(p => p.reserve_beats_none).length,
  weeks_reserve_or_week_report_out_beats_none: graded.filter(p => p.reserve_or_week_report_out.mae < p.none.mae).length,
  arms: {
    none: 'the frozen projection as it was',
    reserve: 'zero when the Sleeper status at the as-of time is IR, PUP, SUSP or NFI',
    reserve_or_out: 'reserve, or Sleeper game_designation O at the as-of time (on a Tuesday this is mostly the previous game\'s designation)',
    reserve_or_week_report_out: 'reserve, or report_status Out on that week\'s own final nflverse injury report (known Friday or Saturday, after the freeze)',
  },
  weeks_reserve_or_out_beats_none: graded.filter(p => p.reserve_or_out_beats_none).length,
  weeks_where_rule_changed_nothing: graded.filter(p => p.reserve_or_out.zeroed === 0).map(p => p.week),
  status_tally_at_as_of: statusTally,
  per_week: perWeek,
};

console.log('Back-test: project reserve-list and ruled-out players at zero');
console.log(`weeks graded: ${result.weeks.join(', ')}`);
for (const p of perWeek) {
  if (p.skipped) { console.log(`  week ${p.week}: skipped (${p.skipped})`); continue; }
  console.log(`  week ${String(p.week).padStart(2)}: as of ${p.as_of_utc.slice(0, 16)}Z (availability ${p.availability_commit})  MAE none ${p.none.mae.toFixed(3)}  reserve ${p.reserve.mae.toFixed(3)}  reserve+out ${p.reserve_or_out.mae.toFixed(3)}  zeroed ${p.reserve_or_out.zeroed} (scored anyway ${p.reserve_or_out.false_zero}, ${p.reserve_or_out.false_zero_points} pts)`);
}
for (const [k, v] of Object.entries(overall)) console.log(`  overall ${k.padEnd(15)} n ${v.n}  MAE ${v.mae.toFixed(3)}  calibration-pop MAE ${v.mae_calibration_pop} (n ${v.n_calibration_pop})  zeroed ${v.zeroed}  scored anyway ${v.false_zero}`);
console.log(`weeks the reserve-or-out rule beats no rule: ${result.weeks_reserve_or_out_beats_none} of ${graded.length}; weeks it changed nothing: ${result.weeks_where_rule_changed_nothing.join(', ') || 'none'}`);
if (OUT) { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(result, null, 2)); console.log(`wrote ${OUT}`); }
// QA note (d): nothing graded, or a week with no availability file before
// its as-of time, is a failed test, not a pass.
const skipped = perWeek.filter(p => p.skipped);
if (graded.length === 0 || skipped.length) {
  console.error(`backtest incomplete: ${graded.length} week(s) graded, ${skipped.length} skipped (${skipped.map(p => p.week).join(', ') || 'none'}).`);
  process.exit(1);
}
