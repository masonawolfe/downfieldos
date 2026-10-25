#!/usr/bin/env node
/**
 * build-calibration.js
 *
 * E-032 (2026-09-17): join weekly projections with weekly actuals (weekly_actuals_{SEASON}.json from E-031). One row per
 * player-week: projected, actual, error, and which adjustments fired. Aggregate
 * per-adjustment mean error so the ±4 matchup cap and the small env terms can
 * be judged.
 *
 * Written from draft-copilot 2026-09-17 report ("nothing records outcomes") +
 * Mason's ask ("we prob need to start collecting - log that for CoS").
 *
 * Outputs:
 *   src/data/intelligence/calibration_{SEASON}.json
 *   CALIBRATION.md at repo root beside BOARD.md
 *
 * E-052 (2026-10-10): `projected` comes from the FROZEN pre-kickoff snapshot
 * for that week (src/data/intelligence/weekly_projections/2026-wNN.json,
 * written once by scripts/snapshot-weekly-projections.mjs), never from the
 * live weeklyBoard2026.js — which is rebuilt with current teams for all 18
 * weeks and would re-grade played weeks with hindsight. Only COMPLETE weeks
 * are graded: a week is complete when every scheduled REG game has player
 * rows in the actuals (a Thursday-only week 5 is reported as partial and
 * excluded). Which model a week was graded with is read from that week's
 * snapshot header (model_version, source_board_generated), never assumed
 * here: as of 2026-10-25 weeks 1-7 are seeds of the 2026-09-18 build (model
 * E-004 v1, with the ±4 matchup term; 6 and 7 seeded 2026-10-25 because the
 * chain was not live before their kickoffs), and the first pre-kickoff
 * freeze from E-034 v2 (no matchup term, floored at 0) is the first week
 * whose window opens after that. Each row carries its snapshot's model_version.
 *
 * Adjustment flags are derived from each snapshot row's context fields
 * (is_dome_game + home_away, is_short_week, is_bye_return, tz_delta,
 * opp_fpts_allowed_to_pos). weekly_value_components isn't persisted in
 * WEEKLY_BOARD_2026 today (build-weekly-board.js writes only the rationale
 * text and the final number), so we re-derive the flags rather than parse
 * a free-text field.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(__dirname);

const SEASON = parseInt(process.env.SEASON || process.argv[2] || '2026', 10);

import { actualsCompleteness, firstKickoffUtcMs } from './_lib/kickoff.js';

const boardMod = await import(path.join(REPO, 'src', 'data', 'weeklyBoard2026.js'));
const WEEKLY_BOARD_META = boardMod.WEEKLY_BOARD_2026_META || null;
const { SCHEDULE_2026 } = await import(path.join(REPO, 'src', 'data', 'schedule2026.js'));

// E-052: the projections of record — one frozen file per week.
const SNAP_DIR = path.join(REPO, 'src', 'data', 'intelligence', 'weekly_projections');
const SNAPSHOTS = {};
if (fs.existsSync(SNAP_DIR)) {
  for (const f of fs.readdirSync(SNAP_DIR).filter(f => new RegExp(`^${SEASON}-w\\d{2}\\.json$`).test(f)).sort()) {
    const doc = JSON.parse(fs.readFileSync(path.join(SNAP_DIR, f), 'utf8'));
    SNAPSHOTS[doc.week] = { file: `src/data/intelligence/weekly_projections/${f}`, ...doc };
  }
}
const snapRow = new Map();
for (const doc of Object.values(SNAPSHOTS)) for (const r of doc.rows) snapRow.set(`${r.gsis_id}_${r.week}`, { row: r, doc });

// Read the daily board too so we can stamp its `generated` timestamp on
// CALIBRATION.md — makes visible that this run is downstream of the shipped
// board, not upstream. (QA 2026-09-17 19:05: the previous CALIBRATION.md
// stamped ahead of the weekly board that shipped in the same commit, so
// 41 of 316 projections were stale.)
const playerBoardMod = await import(path.join(REPO, 'src', 'data', 'playerBoard2026.js'));
const PLAYER_BOARD_META = playerBoardMod.PLAYER_BOARD_2026_META;

const actualsPath = path.join(REPO, 'src', 'data', 'intelligence', `weekly_actuals_${SEASON}.json`);
if (!fs.existsSync(actualsPath)) {
  console.error(`missing ${actualsPath} — run \`npm run data:actuals\` first (E-031).`);
  process.exit(1);
}
const actualsDoc = JSON.parse(fs.readFileSync(actualsPath, 'utf8'));
const actualsByKey = new Map();
for (const r of actualsDoc.rows) {
  actualsByKey.set(`${r.gsis_id}_${r.week}`, r);
}

const completeness = actualsCompleteness(SCHEDULE_2026, actualsDoc.rows);
const weeksComplete = Object.keys(completeness).map(Number).filter(w => completeness[w].complete).sort((a, b) => a - b);
const weeksPartial = Object.keys(completeness).map(Number).filter(w => !completeness[w].complete).sort((a, b) => a - b);

console.log(`E-032 calibration — ${SEASON}`);
console.log(`  snapshot weeks: ${Object.keys(SNAPSHOTS).join(',') || '(none)'}`);
console.log(`  actuals rows: ${actualsDoc.rows.length}, weeks present: ${actualsDoc.meta.weeks_present.join(',')}`);
console.log(`  weeks complete: ${weeksComplete.join(',') || '(none)'}; partial (excluded): ${weeksPartial.map(w => `${w} (${completeness[w].games_seen}/${completeness[w].games_scheduled})`).join(', ') || 'none'}`);
const missingSnap = weeksComplete.filter(w => !SNAPSHOTS[w]);
if (missingSnap.length) {
  console.error(`calibration refused: complete week(s) ${missingSnap.join(',')} have no frozen snapshot in ${path.relative(REPO, SNAP_DIR)} — nothing pre-kickoff to grade against.`);
  process.exit(1);
}

function deriveFlags(r) {
  const dome_home = !!r.is_dome_game && r.home_away === 'H';
  const short_week = !!r.is_short_week;
  const bye_return = !!r.is_bye_return;
  const tz_travel = r.tz_delta != null && Math.abs(r.tz_delta) >= 3;
  // Matchup fired = the row carries a defensive rank we could grade against.
  // Not the same as "adjustment was non-zero" — near-median matchups still
  // count as "we tried to score this matchup", producing a small adjustment.
  // E-052: E-034 v2 snapshots (any week whose header names that model;
  // none existed as of 2026-10-25, weeks 1-7 being seeds of the 2026-09-18
  // v1 board) carry components and no matchup term, so "matchup fired" is
  // false there by construction. Older (v1) snapshots keep the E-032 definition. (Fixing the v1 definition is
  // diagnosis #9, out of scope for E-052.)
  const matchup = r.weekly_value_components
    ? 'matchup_defense_adj' in r.weekly_value_components
    : r.opp_fpts_allowed_to_pos != null;
  return { dome_home, short_week, bye_return, tz_travel, matchup };
}

const perPair = [];
const gradeWeeks = new Set(weeksComplete);
for (const actual of actualsDoc.rows) {
  if (!gradeWeeks.has(actual.week)) continue;
  const hit = snapRow.get(`${actual.gsis_id}_${actual.week}`);
  if (!hit) continue;
  const r = hit.row;
  const proj = r.weekly_value;
  const act = actual.fantasy_points_ppr;
  if (proj == null || act == null) continue;
  const err = Math.round((act - proj) * 100) / 100;
  perPair.push({
    gsis_id: r.gsis_id,
    name: r.name,
    pos: r.pos,
    team: r.team_2026,
    opponent: r.opponent,
    week: r.week,
    projected: proj,
    actual: act,
    error: err,
    abs_error: Math.abs(err),
    flags: deriveFlags(r),
    rationale: r.weekly_value_rationale || null,
    model_version: hit.doc.model_version,
    snapshot_written_utc: hit.doc.written_utc,
  });
}
perPair.sort((a, b) => a.week - b.week || String(a.gsis_id).localeCompare(String(b.gsis_id)));

console.log(`  matched pairs: ${perPair.length}`);

// In-script sanity-check — NOT a protection against drift (same in-memory
// map). The real protection is verifier check #11, which reloads
// calibration_2026.json and the committed snapshot files from disk, and
// check #19, which fails if any committed snapshot file changed.
{
  const mismatches = perPair.filter(r => {
    const s = snapRow.get(`${r.gsis_id}_${r.week}`);
    return !s || Math.abs(s.row.weekly_value - r.projected) > 0.001;
  });
  if (mismatches.length > 0) {
    console.error(`\ncalibration assert failed: ${mismatches.length} of ${perPair.length} projected values do not match their week's snapshot`);
    process.exit(1);
  }
}

function agg(rows) {
  const n = rows.length;
  if (n === 0) return { n: 0 };
  const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const errs = rows.map(r => r.error);
  const absErrs = rows.map(r => r.abs_error);
  const mse = mean(errs.map(e => e * e));
  return {
    n,
    mean_error: Math.round(mean(errs) * 100) / 100,
    mean_abs_error: Math.round(mean(absErrs) * 100) / 100,
    rmse: Math.round(Math.sqrt(mse) * 100) / 100,
  };
}

// Overall + by-flag agg
const overall = agg(perPair);
const byPos = {};
for (const p of ['QB', 'RB', 'WR', 'TE']) byPos[p] = agg(perPair.filter(r => r.pos === p));

const byFlag = {};
for (const flag of ['dome_home', 'short_week', 'bye_return', 'tz_travel', 'matchup']) {
  byFlag[flag] = {
    fired: agg(perPair.filter(r => r.flags[flag])),
    not_fired: agg(perPair.filter(r => !r.flags[flag])),
  };
}

// Top misses (largest absolute error) — the copilot's Caleb + Stafford belong here
const topMisses = [...perPair].sort((a, b) => b.abs_error - a.abs_error).slice(0, 20);

// QA 2026-10-25: the model note is derived from the snapshot headers, never a
// fixed string. The old sentence said "weeks 6+: E-034 v2", which was wrong for
// weeks 6 and 7 (seeded from the 2026-09-18 board on 2026-10-25) and
// contradicted the table below it.
const modelRuns = [];
for (const d of Object.values(SNAPSHOTS).sort((a, b) => a.week - b.week)) {
  const board = (d.source_board_generated || d.written_utc || '').slice(0, 10);
  const label = `${d.model_version.split(':')[0]}, the board generated ${board}`;
  const last = modelRuns[modelRuns.length - 1];
  if (last && last.label === label) last.to = d.week; else modelRuns.push({ from: d.week, to: d.week, label });
}
const modelNote = modelRuns.map(r => `week${r.from === r.to ? ` ${r.from}` : `s ${r.from}-${r.to}`}: ${r.label}`).join('; ');
const v2Weeks = Object.values(SNAPSHOTS).filter(d => /E-034 v2/.test(d.model_version)).map(d => d.week).sort((a, b) => a - b);
const v2Note = v2Weeks.length
  ? `the first pre-kickoff freeze from E-034 v2 (base + env, no matchup term, floored at 0) is week ${v2Weeks[0]}`
  : 'no week has a pre-kickoff freeze from E-034 v2 (base + env, no matchup term, floored at 0) yet; the first will be the next week whose snapshot window opens';
const modelNoteText = `graded with the model named in each week's snapshot header (${modelNote}; ${v2Note})`;

const meta = {
  season: SEASON,
  generated_utc: new Date().toISOString(),
  actuals_source: actualsDoc.meta.source_url,
  actuals_generated_utc: actualsDoc.meta.generated_utc,
  // QA 2026-09-17: stamp the boards this run read, so downstream can see
  // whether CALIBRATION.md is fresh relative to what shipped. If either
  // stamp trails the calibration `generated_utc`, calibration is stale.
  weekly_board_generated_utc: WEEKLY_BOARD_META?.generated || null,
  player_board_generated_utc: PLAYER_BOARD_META?.generated || null,
  projections_source: 'src/data/intelligence/weekly_projections/2026-wNN.json — frozen pre-kickoff snapshots (E-052). Never the live weeklyBoard2026.js.',
  weeks_complete: weeksComplete,
  weeks_partial_excluded: weeksPartial.map(w => ({ week: w, ...completeness[w] })),
  snapshots: Object.fromEntries(Object.values(SNAPSHOTS).map(d => [d.week, {
    file: d.file, written_utc: d.written_utc, first_kickoff_utc: d.first_kickoff_utc,
    written_before_kickoff: d.written_before_kickoff, post_kickoff_game_ids: d.post_kickoff_game_ids,
    model_version: d.model_version, rows_sha256: d.rows_sha256,
  }])),
  // QA 2026-10-25: derived from the snapshot headers (see modelNote above),
  // never a fixed string; this ships verbatim in the public json.
  scoring_note: `projected = the week's frozen pre-kickoff snapshot weekly_value, ${modelNoteText}. actual = fantasy_points_ppr from nflverse.`,
};

const out = {
  meta,
  overall,
  by_pos: byPos,
  by_flag_fired_vs_not: byFlag,
  top_misses: topMisses,
  rows: perPair,
};

const OUT_JSON = path.join(REPO, 'src', 'data', 'intelligence', `calibration_${SEASON}.json`);
fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));
console.log(`  wrote ${OUT_JSON}`);

// CALIBRATION.md — human-readable summary beside BOARD.md
const md = [];
md.push('# DFOS · CALIBRATION');
md.push('');
md.push('**Weekly projected vs actual — one row per player-week the board scored, aggregated per adjustment.**');
md.push('');
md.push('| | |');
md.push('|---|---|');
md.push(`| Generated | ${meta.generated_utc} |`);
md.push(`| Weekly board generated | ${meta.weekly_board_generated_utc || '(missing — no META)'} |`);
md.push(`| Player board generated | ${meta.player_board_generated_utc || '(missing — no META)'} |`);
md.push(`| Actuals source | \`${meta.actuals_source}\` |`);
md.push(`| Actuals generated | ${meta.actuals_generated_utc} |`);
md.push(`| Weeks covered | ${weeksComplete.join(', ')} |`);
md.push(`| Weeks partial (not graded) | ${weeksPartial.map(w => `${w} (${completeness[w].games_seen} of ${completeness[w].games_scheduled} games)`).join(', ') || 'none'} |`);
md.push(`| Projections graded | frozen pre-kickoff snapshots, \`src/data/intelligence/weekly_projections/\` (E-052) |`);
md.push(`| Matched pairs | ${overall.n} |`);
md.push('');
md.push(`Emitted by \`scripts/build-calibration.js\` (E-032, 2026-09-17; E-052, 2026-10-10). \`projected\` = the week's frozen pre-kickoff snapshot \`weekly_value\`, graded with the model named in that snapshot's header (${modelNote}; ${v2Note}). \`actual\` = \`fantasy_points_ppr\` from nflverse. \`error\` = actual - projected. Positive error means the board under-projected. Only complete weeks are graded.`);
md.push('');
md.push('## Snapshots graded');
md.push('');
md.push('| Week | Written (UTC) | First kickoff (UTC) | Before kickoff | Model |');
md.push('|---|---|---|---|---|');
for (const d of Object.values(SNAPSHOTS).sort((a, b) => a.week - b.week)) {
  md.push(`| ${d.week} | ${d.written_utc} | ${d.first_kickoff_utc} | ${d.written_before_kickoff ? 'yes' : `no (post-kickoff: ${d.post_kickoff_game_ids.length} game${d.post_kickoff_game_ids.length === 1 ? '' : 's'})`} | ${d.model_version.split(':')[0]} |`);
}
md.push('');
md.push('## Overall');
md.push('');
md.push('| N | Mean error | Mean \\|error\\| | RMSE |');
md.push('|---|---|---|---|');
md.push(`| ${overall.n} | ${overall.mean_error} | ${overall.mean_abs_error} | ${overall.rmse} |`);
md.push('');
md.push('## By position');
md.push('');
md.push('| Pos | N | Mean error | Mean \\|error\\| | RMSE |');
md.push('|---|---|---|---|---|');
for (const p of ['QB', 'RB', 'WR', 'TE']) {
  const a = byPos[p];
  md.push(`| ${p} | ${a.n} | ${a.mean_error ?? '—'} | ${a.mean_abs_error ?? '—'} | ${a.rmse ?? '—'} |`);
}
md.push('');
md.push('## Per-adjustment: fired vs not fired');
md.push('');
md.push('If an adjustment adds signal, fired-mean-error should be closer to 0 than not-fired-mean-error. If both are similar, the adjustment isn\'t moving the needle. If fired-mean-error is worse, the adjustment is hurting.');
md.push('');
md.push('| Adjustment | Fired N | Fired mean err | Fired \\|err\\| | Not-fired N | Not-fired mean err | Not-fired \\|err\\| |');
md.push('|---|---|---|---|---|---|---|');
for (const flag of ['matchup', 'dome_home', 'short_week', 'bye_return', 'tz_travel']) {
  const f = byFlag[flag].fired;
  const nf = byFlag[flag].not_fired;
  md.push(`| ${flag} | ${f.n} | ${f.mean_error ?? '—'} | ${f.mean_abs_error ?? '—'} | ${nf.n} | ${nf.mean_error ?? '—'} | ${nf.mean_abs_error ?? '—'} |`);
}
md.push('');
md.push('**The ±4 matchup cap:** if fired-mean-error and fired-|err| are close to not-fired, the cap isn\'t buying us signal. If fired-|err| is materially smaller (e.g. ~2 point improvement), it is. First-week sample is small — trend needs weeks 2+ to be decisive.');
md.push('');
md.push('## Top 20 misses (largest |error|) — the copilot\'s Caleb + Stafford should be here');
md.push('');
md.push('| Player | Pos | Team | Wk | Opp | Projected | Actual | Error | Rationale |');
md.push('|---|---|---|---|---|---|---|---|---|');
for (const r of topMisses) {
  md.push(`| ${r.name} | ${r.pos} | ${r.team || '—'} | ${r.week} | ${r.opponent || '—'} | ${r.projected} | ${r.actual} | ${r.error > 0 ? '+' : ''}${r.error} | ${r.rationale ? r.rationale.replace(/\|/g, '/') : '—'} |`);
}
md.push('');
md.push('---');
md.push('');
md.push('*Regenerated on every build of `data:calibration`. E-032 (2026-09-17).*');
md.push('');

const OUT_MD = path.join(REPO, 'CALIBRATION.md');
fs.writeFileSync(OUT_MD, md.join('\n'));
console.log(`  wrote ${OUT_MD}`);

console.log('');
console.log(`overall: n=${overall.n} mean_err=${overall.mean_error} mean|err|=${overall.mean_abs_error} rmse=${overall.rmse}`);
console.log('by pos:');
for (const p of ['QB', 'RB', 'WR', 'TE']) console.log(`  ${p}: n=${byPos[p].n} mean_err=${byPos[p].mean_error} |err|=${byPos[p].mean_abs_error}`);
