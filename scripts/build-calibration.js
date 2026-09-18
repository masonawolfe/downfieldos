#!/usr/bin/env node
/**
 * build-calibration.js
 *
 * E-032 (2026-09-17): join weekly projections (WEEKLY_BOARD_2026.weekly_value)
 * with weekly actuals (weekly_actuals_{SEASON}.json from E-031). One row per
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
 * Adjustment flags are derived from each weekly-board row's context fields
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

const boardMod = await import(path.join(REPO, 'src', 'data', 'weeklyBoard2026.js'));
const WEEKLY_BOARD = boardMod.WEEKLY_BOARD_2026;
const WEEKLY_BOARD_META = boardMod.WEEKLY_BOARD_2026_META || null;

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

console.log(`E-032 calibration — ${SEASON}`);
console.log(`  weekly board rows: ${WEEKLY_BOARD.length}`);
console.log(`  actuals rows: ${actualsDoc.rows.length}, weeks: ${actualsDoc.meta.weeks_present.join(',')}`);

function deriveFlags(r) {
  const dome_home = !!r.is_dome_game && r.home_away === 'H';
  const short_week = !!r.is_short_week;
  const bye_return = !!r.is_bye_return;
  const tz_travel = r.tz_delta != null && Math.abs(r.tz_delta) >= 3;
  // Matchup fired = the row carries a defensive rank we could grade against.
  // Not the same as "adjustment was non-zero" — near-median matchups still
  // count as "we tried to score this matchup", producing a small adjustment.
  const matchup = r.opp_fpts_allowed_to_pos != null;
  return { dome_home, short_week, bye_return, tz_travel, matchup };
}

const perPair = [];
for (const r of WEEKLY_BOARD) {
  if (r.is_bye) continue;
  if (r.weekly_value == null) continue;
  const actual = actualsByKey.get(`${r.gsis_id}_${r.week}`);
  if (!actual) continue;
  const proj = r.weekly_value;
  const act = actual.fantasy_points_ppr;
  if (act == null) continue;
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
  });
}

console.log(`  matched pairs: ${perPair.length}`);

// Assert: every projected value equals the board's weekly_value for that
// (gsis_id, week). This is a tautology at generation time (we read from
// WEEKLY_BOARD), but it fires if calibration_2026.json is ever committed
// against a board it wasn't generated from. QA 2026-09-17 19:05 caught the
// class: CALIBRATION.md rode along a commit that also rewrote the weekly
// board, and 41 of 316 `projected` values no longer matched what shipped.
// Combined with the data-board.yml wiring that runs calibration *after*
// the board build, this makes drift impossible.
{
  const boardWv = new Map();
  for (const r of WEEKLY_BOARD) boardWv.set(`${r.gsis_id}_${r.week}`, r.weekly_value);
  const mismatches = perPair.filter(r => {
    const w = boardWv.get(`${r.gsis_id}_${r.week}`);
    return w == null || Math.abs(w - r.projected) > 0.001;
  });
  if (mismatches.length > 0) {
    console.error(`\ncalibration assert failed: ${mismatches.length} of ${perPair.length} projected values do not match board's weekly_value`);
    for (const m of mismatches.slice(0, 5)) {
      const w = boardWv.get(`${m.gsis_id}_${m.week}`);
      console.error(`  ${m.name} (${m.gsis_id}) wk${m.week}: cal.projected=${m.projected} board.weekly_value=${w}`);
    }
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
  scoring_note: 'projected uses WEEKLY_BOARD_2026.weekly_value (base + matchup + env). actual uses fantasy_points_ppr from nflverse.',
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
md.push(`| Weeks covered | ${actualsDoc.meta.weeks_present.join(', ')} |`);
md.push(`| Matched pairs | ${overall.n} |`);
md.push('');
md.push('Emitted by `scripts/build-calibration.js` (E-032, 2026-09-17). Written from draft-copilot in-season ask: "nothing records outcomes". `projected` = `WEEKLY_BOARD_2026.weekly_value` (base + matchup + env). `actual` = `fantasy_points_ppr` from nflverse. `error` = actual - projected. Positive error means the board under-projected.');
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
