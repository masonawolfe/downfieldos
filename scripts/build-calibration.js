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
 *
 * DATA_FRESHNESS_PLAN 2026-11-01, step 1 (written 2026-11-07):
 *   - `actual` is fantasy_points_graded: the board's own rules (meta
 *     graded_rules, "full_ppr"), the rules the projection is built under.
 *     nflverse's fantasy_points_ppr also counts interceptions, fumbles lost,
 *     two-point conversions and special teams touchdowns, so grading on it
 *     compared two different scorings. It is kept on each row as
 *     `actual_nflverse_ppr` for the dated note.
 *   - The headline (overall, by position, by adjustment, top misses) uses
 *     only weeks whose snapshot was written before kickoff. Weeks 1 and 2
 *     were seeded after kickoff; they stay in `rows` (verifier #11) and are
 *     reported apart under `after_kickoff`.
 *   - CALIBRATION.md carries a dated note with the old and new figures for
 *     every week graded when the change landed. Verifier #21 checks the
 *     graded column, graded_rules and the headline weeks.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(__dirname);

// Freshness plan step 4(b): the default season is data/season.json's.
const SEASON = seasonFrom(process.env.SEASON || process.argv[2]);

import { actualsCompleteness, firstKickoffUtcMs } from './_lib/kickoff.js';
import { seasonFrom } from './_lib/season.js';
import { contractMeta } from './_lib/stamp.js';

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
// Step 1: grade only on the board's rules. An actuals file written before
// fetch-weekly-actuals.js stored the graded column cannot be graded.
const GRADED_RULES = actualsDoc.meta?.graded_rules;
if (!GRADED_RULES || !actualsDoc.rows.some(r => r.fantasy_points_graded != null)) {
  console.error(`calibration refused: ${path.relative(REPO, actualsPath)} has no graded_rules / fantasy_points_graded. Run \`npm run data:actuals\` first (DATA_FRESHNESS_PLAN step 1).`);
  process.exit(1);
}
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
  const act = actual.fantasy_points_graded;
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
    actual_nflverse_ppr: actual.fantasy_points_ppr,
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

// Step 1: the headline uses only weeks whose snapshot was written before
// kickoff. The flag is read from the snapshot header, which verifier #19
// recomputes from the schedule.
const headlineWeeks = weeksComplete.filter(w => SNAPSHOTS[w]?.written_before_kickoff === true);
const afterKickoffWeeks = weeksComplete.filter(w => SNAPSHOTS[w]?.written_before_kickoff !== true);
const headlineSet = new Set(headlineWeeks);
const headlineRows = perPair.filter(r => headlineSet.has(r.week));
const afterRows = perPair.filter(r => !headlineSet.has(r.week));

const POS = ['QB', 'RB', 'WR', 'TE'];
const byPosOf = rows => Object.fromEntries(POS.map(p => [p, agg(rows.filter(r => r.pos === p))]));

// Overall + by-flag agg (headline weeks only)
const overall = agg(headlineRows);
const byPos = byPosOf(headlineRows);

const byFlag = {};
for (const flag of ['dome_home', 'short_week', 'bye_return', 'tz_travel', 'matchup']) {
  byFlag[flag] = {
    fired: agg(headlineRows.filter(r => r.flags[flag])),
    not_fired: agg(headlineRows.filter(r => !r.flags[flag])),
  };
}

// Top misses (largest absolute error), headline weeks only
const topMisses = [...headlineRows].sort((a, b) => b.abs_error - a.abs_error).slice(0, 20);

const afterKickoff = { weeks: afterKickoffWeeks, overall: agg(afterRows), by_pos: byPosOf(afterRows) };

// Step 1's dated note: old figures (nflverse's fantasy_points_ppr over
// every complete week, as the headline was built before) beside new ones (the board's rules, the
// headline only weeks written before kickoff), for each week graded on the
// day the change landed.
//
// Review 2026-11-07: the published note is FROZEN. Its figures were written
// once on 2026-11-07 to scripts/_lib/scoring-change-2026-11-07.json and are
// read from there on every build, so a later nflverse stat correction (the
// Thursday re-fetch) cannot move the record silently ("the record is never
// rewritten silently", plan step 1.8). The same figures recomputed from
// today's rows ship beside it as `live_recompute`, labelled, with a count
// of how far they have drifted from the frozen ones.
const FROZEN_CHANGE = JSON.parse(fs.readFileSync(path.join(__dirname, '_lib', 'scoring-change-2026-11-07.json'), 'utf8'));
const SCORING_CHANGE = { date: FROZEN_CHANGE.date, weeks: FROZEN_CHANGE.weeks };
const oldErr = r => Math.round((r.actual_nflverse_ppr - r.projected) * 100) / 100;
const aggOld = rows => agg(rows.filter(r => r.actual_nflverse_ppr != null).map(r => ({ error: oldErr(r), abs_error: Math.abs(oldErr(r)) })));
const changeRows = perPair.filter(r => SCORING_CHANGE.weeks.includes(r.week));
const changeHeadline = changeRows.filter(r => headlineSet.has(r.week));
const liveChange = {
  date: SCORING_CHANGE.date,
  what: `actual moved from nflverse fantasy_points_ppr to fantasy_points_graded (${GRADED_RULES}, the projection's rules); the headline dropped the weeks written after kickoff`,
  weeks: SCORING_CHANGE.weeks.filter(w => gradeWeeks.has(w)),
  rows_moved: changeRows.filter(r => r.actual_nflverse_ppr != null && Math.abs(r.actual_nflverse_ppr - r.actual) > 0.001).length,
  per_week: SCORING_CHANGE.weeks.filter(w => gradeWeeks.has(w)).map(w => {
    const wr = changeRows.filter(r => r.week === w);
    const q = wr.filter(r => r.pos === 'QB');
    return { week: w, in_headline: headlineSet.has(w), old: aggOld(wr), new: agg(wr), qb_old: aggOld(q), qb_new: agg(q) };
  }),
  headline_old: { weeks: SCORING_CHANGE.weeks.filter(w => gradeWeeks.has(w)), overall: aggOld(changeRows), qb: aggOld(changeRows.filter(r => r.pos === 'QB')) },
  same_weeks_new_rules: { overall: agg(changeRows), qb: agg(changeRows.filter(r => r.pos === 'QB')) },
  headline_new: { weeks: SCORING_CHANGE.weeks.filter(w => headlineSet.has(w)), overall: agg(changeHeadline), qb: agg(changeHeadline.filter(r => r.pos === 'QB')) },
};
// Which published figures the live recompute no longer matches (0 means the
// rows still say exactly what the frozen note says).
const liveDrift = [];
{
  const cmp = (label, a, b) => { for (const k of ['n', 'mean_error', 'mean_abs_error', 'rmse']) if ((a?.[k] ?? null) !== (b?.[k] ?? null)) liveDrift.push(`${label}.${k}`); };
  if (liveChange.rows_moved !== FROZEN_CHANGE.rows_moved) liveDrift.push('rows_moved');
  for (const fw of FROZEN_CHANGE.per_week) {
    const lw = liveChange.per_week.find(x => x.week === fw.week);
    for (const k of ['old', 'new', 'qb_old', 'qb_new']) cmp(`week${fw.week}.${k}`, fw[k], lw?.[k]);
  }
  for (const k of ['headline_old', 'headline_new']) { cmp(`${k}.overall`, FROZEN_CHANGE[k].overall, liveChange[k].overall); cmp(`${k}.qb`, FROZEN_CHANGE[k].qb, liveChange[k].qb); }
  cmp('same_weeks_new_rules.overall', FROZEN_CHANGE.same_weeks_new_rules.overall, liveChange.same_weeks_new_rules.overall);
  cmp('same_weeks_new_rules.qb', FROZEN_CHANGE.same_weeks_new_rules.qb, liveChange.same_weeks_new_rules.qb);
}
const scoringChange = {
  ...FROZEN_CHANGE,
  live_recompute: {
    label: 'NOT the record. The same figures recomputed from the rows in this file on this build; nflverse stat corrections move these, never the frozen note above.',
    generated_at: new Date().toISOString(),
    figures_differing_from_frozen: liveDrift.length,
    differing: liveDrift,
    ...liveChange,
  },
};
if (liveDrift.length) console.log(`  note: ${liveDrift.length} figure(s) in the live recompute of the 2026-11-07 note differ from the frozen record (${liveDrift.slice(0, 5).join(', ')}${liveDrift.length > 5 ? ', ...' : ''})`);

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
const modelNote = modelRuns.map(r => `week${r.from === r.to ? ` ${r.from}` : `s ${r.from} to ${r.to}`}: ${r.label}`).join('; ');
const v2Weeks = Object.values(SNAPSHOTS).filter(d => /E-034 v2/.test(d.model_version)).map(d => d.week).sort((a, b) => a - b);
const v2Note = v2Weeks.length
  ? `the first pre-kickoff freeze from E-034 v2 (base + env, no matchup term, floored at 0) is week ${v2Weeks[0]}`
  : 'no week has a pre-kickoff freeze from E-034 v2 (base + env, no matchup term, floored at 0) yet; the first will be the next week whose snapshot window opens';
const modelNoteText = `graded with the model named in each week's snapshot header (${modelNote}; ${v2Note})`;

// Reader copy (scoring_note here, CALIBRATION.md below) shares one week-list style.
// "1 to 8" for a run, "1 and 2" or "3, 5 and 7" otherwise (no Oxford comma).
const weeksText = ws => {
  if (!ws.length) return 'none';
  if (ws.length > 2 && ws.every((w, i) => i === 0 || w === ws[i - 1] + 1)) return `${ws[0]} to ${ws[ws.length - 1]}`;
  return ws.length === 1 ? `${ws[0]}` : `${ws.slice(0, -1).join(', ')} and ${ws[ws.length - 1]}`;
};
// Freshness plan step 4(a): the shared contract stamp. generated_utc stays
// beside generated_at because CALIBRATION.md and the verifier read it.
const stamp = contractMeta({
  sourceSeason: actualsDoc.meta.source_season ?? actualsDoc.meta.season ?? SEASON,
  sources: [
    path.relative(REPO, actualsPath),
    `src/data/intelligence/weekly_projections/${SEASON}-wNN.json`,
    'src/data/weeklyBoard2026.js',
    'src/data/playerBoard2026.js',
    'src/data/schedule2026.js',
  ],
});
const meta = {
  season: SEASON,
  ...stamp,
  generated_utc: stamp.generated_at,
  actuals_source: actualsDoc.meta.source_url,
  actuals_generated_utc: actualsDoc.meta.generated_utc,
  // QA 2026-09-17: stamp the boards this run read, so downstream can see
  // whether CALIBRATION.md is fresh relative to what shipped. If either
  // stamp trails the calibration `generated_utc`, calibration is stale.
  weekly_board_generated_utc: WEEKLY_BOARD_META?.generated || null,
  player_board_generated_utc: PLAYER_BOARD_META?.generated || null,
  projections_source: 'src/data/intelligence/weekly_projections/2026-wNN.json — frozen pre-kickoff snapshots (E-052). Never the live weeklyBoard2026.js.',
  weeks_complete: weeksComplete,
  // Step 1: the headline (overall, by_pos, by_flag_fired_vs_not,
  // top_misses) covers headline_weeks only; after_kickoff covers the rest.
  headline_weeks: headlineWeeks,
  after_kickoff_weeks: afterKickoffWeeks,
  graded_rules: GRADED_RULES,
  actual_column: 'fantasy_points_graded',
  weeks_partial_excluded: weeksPartial.map(w => ({ week: w, ...completeness[w] })),
  snapshots: Object.fromEntries(Object.values(SNAPSHOTS).map(d => [d.week, {
    file: d.file, written_utc: d.written_utc, first_kickoff_utc: d.first_kickoff_utc,
    written_before_kickoff: d.written_before_kickoff, post_kickoff_game_ids: d.post_kickoff_game_ids,
    model_version: d.model_version, rows_sha256: d.rows_sha256,
  }])),
  // QA 2026-10-25: derived from the snapshot headers (see modelNote above),
  // never a fixed string; this ships verbatim in the public json.
  scoring_note: `projected = the week's frozen pre-kickoff snapshot weekly_value, ${modelNoteText}. actual = fantasy_points_graded, the nflverse components scored under the board's own rules (${GRADED_RULES}), the rules the projection is built under; nflverse's fantasy_points_ppr is kept on each row as actual_nflverse_ppr. The headline covers week${headlineWeeks.length === 1 ? '' : 's'} ${weeksText(headlineWeeks)}, whose snapshot${headlineWeeks.length === 1 ? ' was' : 's were'} written before kickoff; week${afterKickoffWeeks.length === 1 ? '' : 's'} ${weeksText(afterKickoffWeeks)} ${afterKickoffWeeks.length === 1 ? 'was' : 'were'} written after kickoff and ${afterKickoffWeeks.length === 1 ? 'is' : 'are'} reported apart under after_kickoff.`,
};

const out = {
  meta,
  overall,
  by_pos: byPos,
  by_flag_fired_vs_not: byFlag,
  top_misses: topMisses,
  after_kickoff: afterKickoff,
  scoring_change_2026_11_07: scoringChange,
  rows: perPair,
};

const OUT_JSON = path.join(REPO, 'src', 'data', 'intelligence', `calibration_${SEASON}.json`);
fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));
console.log(`  wrote ${OUT_JSON}`);

// CALIBRATION.md, the human-readable summary beside BOARD.md. Reader copy:
// no em dashes, no Oxford commas, acronyms spelled out on first use.
const NA = 'n/a';
const fmt = x => (x == null ? NA : Object.is(x, -0) || x === 0 ? '0' : x > 0 ? `+${x}` : `${x}`);
const md = [];
md.push('# DFOS · CALIBRATION');
md.push('');
md.push('**Weekly projected against actual points: one row per player-week the board scored, aggregated by position and by adjustment.**');
md.push('');
md.push('All times are Coordinated Universal Time (UTC). Positions: quarterback (QB), running back (RB), wide receiver (WR) and tight end (TE).');
md.push('');
md.push('| | |');
md.push('|---|---|');
md.push(`| Generated | ${meta.generated_utc} |`);
md.push(`| Weekly board generated | ${meta.weekly_board_generated_utc || '(missing: no META)'} |`);
md.push(`| Player board generated | ${meta.player_board_generated_utc || '(missing: no META)'} |`);
md.push(`| Actuals source | \`${meta.actuals_source}\` |`);
md.push(`| Actuals generated | ${meta.actuals_generated_utc} |`);
md.push(`| Weeks covered | ${weeksComplete.join(', ')} |`);
md.push(`| Headline weeks (snapshot written before kickoff) | ${headlineWeeks.join(', ') || 'none'} |`);
md.push(`| Weeks written after kickoff (shown apart) | ${afterKickoffWeeks.join(', ') || 'none'} |`);
md.push(`| Weeks partial (not graded) | ${weeksPartial.map(w => `${w} (${completeness[w].games_seen} of ${completeness[w].games_scheduled} games)`).join(', ') || 'none'} |`);
md.push(`| Projections graded | frozen pre-kickoff snapshots, \`src/data/intelligence/weekly_projections/\` (E-052) |`);
md.push(`| Actual points | \`fantasy_points_graded\`, scored under the board's own rules (\`${GRADED_RULES}\`) |`);
md.push(`| Matched pairs | ${perPair.length} (headline ${overall.n}, written after kickoff ${afterKickoff.overall.n}) |`);
md.push('');
md.push(`Emitted by \`scripts/build-calibration.js\` (E-032, 2026-09-17; E-052, 2026-10-10; scoring and headline change 2026-11-07). \`projected\` is the week's frozen pre-kickoff snapshot \`weekly_value\`, graded with the model named in that snapshot's header (${modelNote}; ${v2Note}). \`actual\` is \`fantasy_points_graded\`: the nflverse box score scored under the rules the projection is built under, with no interception, fumble, two-point or return term. \`error\` is actual minus projected, so a positive error means the board under-projected. Only complete weeks are graded. The headline tables below use only weeks whose snapshot was written before kickoff.`);
md.push('');
md.push('## Snapshots graded');
md.push('');
md.push('| Week | Written (UTC) | First kickoff (UTC) | Before kickoff | In headline | Model |');
md.push('|---|---|---|---|---|---|');
for (const d of Object.values(SNAPSHOTS).sort((a, b) => a.week - b.week)) {
  md.push(`| ${d.week} | ${d.written_utc} | ${d.first_kickoff_utc} | ${d.written_before_kickoff ? 'yes' : `no (post-kickoff: ${d.post_kickoff_game_ids.length} game${d.post_kickoff_game_ids.length === 1 ? '' : 's'})`} | ${headlineSet.has(d.week) ? 'yes' : gradeWeeks.has(d.week) ? 'no, shown apart' : 'not graded yet'} | ${d.model_version.split(':')[0]} |`);
}
md.push('');
md.push(`## Headline: weeks ${weeksText(headlineWeeks)}`);
md.push('');
md.push('| N | Mean error | Mean absolute error | Root mean square error |');
md.push('|---|---|---|---|');
md.push(`| ${overall.n} | ${overall.mean_error ?? NA} | ${overall.mean_abs_error ?? NA} | ${overall.rmse ?? NA} |`);
md.push('');
md.push('## By position (headline weeks)');
md.push('');
md.push('| Pos | N | Mean error | Mean absolute error | Root mean square error |');
md.push('|---|---|---|---|---|');
for (const p of POS) {
  const a = byPos[p];
  md.push(`| ${p} | ${a.n} | ${a.mean_error ?? NA} | ${a.mean_abs_error ?? NA} | ${a.rmse ?? NA} |`);
}
md.push('');
md.push(`## Written after kickoff: week${afterKickoffWeeks.length === 1 ? '' : 's'} ${weeksText(afterKickoffWeeks)} (not in the headline)`);
md.push('');
md.push('These snapshots were seeded after the week had kicked off, so they are not a fair pre-kickoff test. They stay graded row by row and are kept out of every headline table.');
md.push('');
md.push('| Pos | N | Mean error | Mean absolute error | Root mean square error |');
md.push('|---|---|---|---|---|');
{
  const a = afterKickoff.overall;
  md.push(`| All | ${a.n} | ${a.mean_error ?? NA} | ${a.mean_abs_error ?? NA} | ${a.rmse ?? NA} |`);
}
for (const p of POS) {
  const a = afterKickoff.by_pos[p];
  md.push(`| ${p} | ${a.n} | ${a.mean_error ?? NA} | ${a.mean_abs_error ?? NA} | ${a.rmse ?? NA} |`);
}
md.push('');
md.push('## Per adjustment: fired against not fired (headline weeks)');
md.push('');
md.push('If an adjustment adds signal, the fired mean error should sit closer to 0 than the not-fired mean error. If both are similar, the adjustment is not moving the needle. If the fired mean error is worse, the adjustment is hurting.');
md.push('');
md.push('| Adjustment | Fired N | Fired mean error | Fired mean absolute error | Not-fired N | Not-fired mean error | Not-fired mean absolute error |');
md.push('|---|---|---|---|---|---|---|');
for (const flag of ['matchup', 'dome_home', 'short_week', 'bye_return', 'tz_travel']) {
  const f = byFlag[flag].fired;
  const nf = byFlag[flag].not_fired;
  md.push(`| ${flag} | ${f.n} | ${f.mean_error ?? NA} | ${f.mean_abs_error ?? NA} | ${nf.n} | ${nf.mean_error ?? NA} | ${nf.mean_abs_error ?? NA} |`);
}
md.push('');
md.push('**The ±4 matchup cap:** if the fired mean error and mean absolute error are close to the not-fired ones, the cap is not buying signal. If the fired mean absolute error is materially smaller (about 2 points), it is.');
md.push('');
md.push('## Top 20 misses, headline weeks (largest absolute error)');
md.push('');
md.push('| Player | Pos | Team | Wk | Opp | Projected | Actual | Error | Rationale |');
md.push('|---|---|---|---|---|---|---|---|---|');
for (const r of topMisses) {
  md.push(`| ${r.name} | ${r.pos} | ${r.team || NA} | ${r.week} | ${r.opponent || NA} | ${r.projected} | ${r.actual} | ${r.error > 0 ? '+' : ''}${r.error} | ${r.rationale ? r.rationale.replace(/\|/g, '/') : NA} |`);
}
md.push('');
{
  const c = scoringChange;
  md.push(`## Note, ${c.date}: grading moved to the board's own scoring`);
  md.push('');
  md.push(`Until ${c.date} \`actual\` was nflverse's \`fantasy_points_ppr\`. That column takes 2 points off per interception and per fumble lost and adds 2 per two-point conversion and 6 per special teams touchdown. The projection is built without any of those terms, so the two sides of each row were scored by different rules. From ${c.date} \`actual\` is \`fantasy_points_graded\`, scored under the board's rules (\`${GRADED_RULES}\`), and the headline leaves out week${afterKickoffWeeks.length === 1 ? '' : 's'} ${weeksText(afterKickoffWeeks)}, whose snapshot${afterKickoffWeeks.length === 1 ? ' was' : 's were'} written after kickoff. Nothing in the projection changed. ${c.rows_moved} of ${c.graded_rows} graded rows in weeks ${weeksText(c.weeks)} had a different actual that day.`);
  md.push('');
  md.push(`Old is nflverse's points; new is the board's rules. These figures were frozen on ${c.frozen_on}, when the change landed, and later stat corrections from nflverse do not move them. The same figures recomputed from today's rows are in \`calibration_${SEASON}.json\` under \`scoring_change_2026_11_07.live_recompute\`; ${c.live_recompute.figures_differing_from_frozen === 0 ? 'today none of them differ from the frozen ones' : `today ${c.live_recompute.figures_differing_from_frozen} of them differ from the frozen ones`}.`);
  md.push('');
  md.push('| Week | N | Old mean error | New mean error | Old mean absolute error | New mean absolute error | QB old mean error | QB new mean error | In new headline |');
  md.push('|---|---|---|---|---|---|---|---|---|');
  for (const w of c.per_week) {
    md.push(`| ${w.week} | ${w.new.n} | ${fmt(w.old.mean_error)} | ${fmt(w.new.mean_error)} | ${w.old.mean_abs_error ?? NA} | ${w.new.mean_abs_error ?? NA} | ${fmt(w.qb_old.mean_error)} | ${fmt(w.qb_new.mean_error)} | ${w.in_headline ? 'yes' : 'no'} |`);
  }
  const ho = c.headline_old, sw = c.same_weeks_new_rules, hn = c.headline_new;
  md.push('');
  md.push('| Headline | Weeks | N | Mean error | Mean absolute error | QB N | QB mean error | QB mean absolute error |');
  md.push('|---|---|---|---|---|---|---|---|');
  md.push(`| Old: nflverse points, every week | ${ho.weeks.join(', ')} | ${ho.overall.n} | ${fmt(ho.overall.mean_error)} | ${ho.overall.mean_abs_error ?? NA} | ${ho.qb.n} | ${fmt(ho.qb.mean_error)} | ${ho.qb.mean_abs_error ?? NA} |`);
  md.push(`| Board's rules, same weeks | ${ho.weeks.join(', ')} | ${sw.overall.n} | ${fmt(sw.overall.mean_error)} | ${sw.overall.mean_abs_error ?? NA} | ${sw.qb.n} | ${fmt(sw.qb.mean_error)} | ${sw.qb.mean_abs_error ?? NA} |`);
  md.push(`| New: board's rules, written before kickoff | ${hn.weeks.join(', ')} | ${hn.overall.n} | ${fmt(hn.overall.mean_error)} | ${hn.overall.mean_abs_error ?? NA} | ${hn.qb.n} | ${fmt(hn.qb.mean_error)} | ${hn.qb.mean_abs_error ?? NA} |`);
  md.push('');
  const flip = (ho.qb.mean_error ?? 0) < 0 && (hn.qb.mean_error ?? 0) > 0;
  md.push(flip
    ? `**The quarterback read flips.** On nflverse's points the board read as over-projecting quarterbacks (mean error ${fmt(ho.qb.mean_error)}). On the board's own rules it under-projects them (${fmt(sw.qb.mean_error)} over the same weeks, ${fmt(hn.qb.mean_error)} in the new headline). The shift is nflverse's interception and fumble penalties, net of its two-point and return points; the projection counts none of them.`
    : `**Quarterbacks:** mean error ${fmt(ho.qb.mean_error)} on nflverse's points, ${fmt(sw.qb.mean_error)} on the board's rules over the same weeks and ${fmt(hn.qb.mean_error)} in the new headline.`);
  md.push('');
}
md.push('---');
md.push('');
md.push('*Regenerated on every build of `data:calibration`. E-032 (2026-09-17).*');
md.push('');

const OUT_MD = path.join(REPO, 'CALIBRATION.md');
fs.writeFileSync(OUT_MD, md.join('\n'));
console.log(`  wrote ${OUT_MD}`);

console.log('');
console.log(`headline weeks ${headlineWeeks.join(',')}; after kickoff ${afterKickoffWeeks.join(',')} (n=${afterKickoff.overall.n})`);
console.log(`overall: n=${overall.n} mean_err=${overall.mean_error} mean|err|=${overall.mean_abs_error} rmse=${overall.rmse}`);
console.log('by pos:');
for (const p of POS) console.log(`  ${p}: n=${byPos[p].n} mean_err=${byPos[p].mean_error} |err|=${byPos[p].mean_abs_error}`);
