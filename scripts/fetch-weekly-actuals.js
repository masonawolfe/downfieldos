#!/usr/bin/env node
/**
 * fetch-weekly-actuals.js
 *
 * E-031 (2026-09-17): collect weekly player actuals from nflverse's
 * `stats_player` release. One row per player-week with fantasy points
 * (both PPR and standard, as nflverse-computed) plus the components the
 * board's scoring cares about. Written by CoS from the draft-copilot
 * 2026-09-17 ask; Mason: "we prob need to start collecting - log that
 * for CoS."
 *
 * Output: src/data/intelligence/weekly_actuals_{SEASON}.json — no
 * consumer reads it yet (per peer's E-031 scope). E-032's calibration
 * table is the first reader.
 *
 * Scoring (DATA_FRESHNESS_PLAN 2026-11-01, step 1; supersedes the
 * 2026-09-17 note that nflverse's column matched the board's rules):
 *   - fantasy_points_graded is the board's own scoring: components under
 *     SCORING_RULES.full_ppr, read from
 *     PLAYER_BOARD_2026_META.valuation_2026_09_04.scoring_rules (yards,
 *     receptions and touchdowns; no interception, fumble, two-point or
 *     return term). The veteran projection base is built the same way
 *     (build-player-board.js:213-222), so calibration grades like for like.
 *     meta.graded_rules names the rules ("full_ppr"); verifier #21 recomputes
 *     every row from its components.
 *   - fantasy_points_ppr / fantasy_points_std are kept exactly as nflverse
 *     wrote them. They also take 2 off per interception and per fumble lost
 *     and add 2 per two-point conversion and 6 per special teams touchdown.
 *     The components that explain them are stored per row (pass_int,
 *     fumbles_lost, pass_2pt, rush_2pt, rec_2pt, special_teams_td), and
 *     scripts/reconcile-actuals-scoring.mjs recomputes both columns. That
 *     recompute is deliberately NOT in the verifier (plan step 1, the split
 *     of #21): a scoring term we do not store must not stop the Tuesday
 *     commit.
 *
 * Usage:
 *   node scripts/fetch-weekly-actuals.js            # SEASON=current
 *   SEASON=2025 node scripts/fetch-weekly-actuals.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchGzippedCSV, normTeam, num, int } from './_lib/nflverse.js';
import { GRADED_RULES, gradedPoints, reconcileRows } from './_lib/actuals-scoring.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function currentNflSeason() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  return m >= 3 ? y : y - 1;
}

const SEASON = parseInt(process.env.SEASON || process.argv[2] || String(currentNflSeason()), 10);
const URL = `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_${SEASON}.csv.gz`;

// The board's published rules: the same object build-player-board.js
// writes into its meta. A missing rule set is a hard stop; grading under
// guessed rules is the defect this step removes.
async function boardRules() {
  const mod = await import(path.join(__dirname, '..', 'src', 'data', 'playerBoard2026.js'));
  const rules = mod.PLAYER_BOARD_2026_META?.valuation_2026_09_04?.scoring_rules?.[GRADED_RULES];
  if (!rules) throw new Error(`PLAYER_BOARD_2026_META.valuation_2026_09_04.scoring_rules.${GRADED_RULES} not found in playerBoard2026.js`);
  return rules;
}

async function main() {
  const RULES = await boardRules();
  const rows = await fetchGzippedCSV(URL, `stats_player_week ${SEASON}`);
  console.log(`  parsed ${rows.length} rows`);

  // REG season, skill positions only. The board's scoring rules cover
  // QB/RB/WR/TE; K and DEF have their own separate scoring in the meta.
  const filtered = rows.filter(r =>
    r.season_type === 'REG' &&
    ['QB', 'RB', 'WR', 'TE'].includes(r.position) &&
    r.week && r.player_id
  );
  console.log(`  after REG + skill filter: ${filtered.length}`);

  const sumInt = (...vals) => vals.reduce((acc, v) => acc + (int(v) || 0), 0);

  const out = filtered.map(r => {
    const week = int(r.week);
    // Fumbles lost across rushing, receiving and sack fumbles. nflverse
    // splits them. Its fantasy columns take 2 off per fumble lost; the
    // board's rules do not.
    const fumbles_lost = sumInt(r.rushing_fumbles_lost, r.receiving_fumbles_lost, r.sack_fumbles_lost);
    const components = {
      pass_yd: num(r.passing_yards),
      pass_td: int(r.passing_tds),
      pass_int: int(r.passing_interceptions),
      rush_yd: num(r.rushing_yards),
      rush_td: int(r.rushing_tds),
      receptions: int(r.receptions),
      targets: int(r.targets),
      rec_yd: num(r.receiving_yards),
      rec_td: int(r.receiving_tds),
      fumbles_lost,
      // Step 1: the terms nflverse's columns count and the board's do not.
      pass_2pt: int(r.passing_2pt_conversions) || 0,
      rush_2pt: int(r.rushing_2pt_conversions) || 0,
      rec_2pt: int(r.receiving_2pt_conversions) || 0,
      special_teams_td: int(r.special_teams_tds) || 0,
    };
    return {
      gsis_id: r.player_id,
      name: r.player_display_name,
      pos: r.position,
      team: normTeam(r.team),
      opponent: normTeam(r.opponent_team),
      season: int(r.season),
      week,
      // The board's rules; calibration grades on this (see file header).
      fantasy_points_graded: gradedPoints(components, RULES, r.position),
      // As nflverse wrote them; reconciled by reconcile-actuals-scoring.mjs.
      fantasy_points_ppr: num(r.fantasy_points_ppr),
      fantasy_points_std: num(r.fantasy_points),
      components,
      source: `nflverse:stats_player_week_${SEASON}`,
    };
  });

  // Sort: week asc, then nflverse ppr desc within week (unchanged order).
  out.sort((a, b) => (a.week - b.week) || ((b.fantasy_points_ppr || 0) - (a.fantasy_points_ppr || 0)));

  const distinctWeeks = [...new Set(out.map(r => r.week))].sort((a, b) => a - b);
  const rec = reconcileRows(out);
  const P = rec.columns.fantasy_points_ppr, S = rec.columns.fantasy_points_std;
  const largest = Math.max(P.max_abs_diff, S.max_abs_diff).toFixed(2);
  console.log(`  nflverse columns recomputed from components: fantasy_points_ppr ${P.reconciled} of ${P.rows}, fantasy_points_std ${S.reconciled} of ${S.rows}, largest difference ${largest}`);
  const generatedAt = new Date().toISOString();
  const meta = {
    season: SEASON,
    source_season: SEASON,
    generated_at: generatedAt,
    generated_utc: generatedAt,
    row_count: out.length,
    weeks_present: distinctWeeks,
    source_url: URL,
    graded_rules: GRADED_RULES,
    graded_column: 'fantasy_points_graded',
    scoring_notes: [
      `Calibration grades fantasy_points_graded, which uses the board's own rules (${GRADED_RULES} in PLAYER_BOARD_2026_META: ${RULES.rec} per reception, ${RULES.rec_yd} per receiving yard, ${RULES.rec_td} per receiving touchdown, ${RULES.rush_yd} per rushing yard, ${RULES.rush_td} per rushing touchdown, ${RULES.pass_yd} per passing yard and ${RULES.pass_td} per passing touchdown${RULES.te_rec_bonus ? `, plus ${RULES.te_rec_bonus} per tight end reception` : ''}). The projection is built under the same rules, so both sides of a graded row are scored alike. The board's rules have no interception, fumble, two-point or return term.`,
      `fantasy_points_ppr and fantasy_points_std are kept as nflverse wrote them. nflverse also takes 2 points off per interception and per fumble lost, and adds 2 per two-point conversion and 6 per special teams touchdown (a return or other special teams score). Recomputed from the stored components, fantasy_points_ppr matches on ${P.reconciled} of ${P.rows} rows and fantasy_points_std on ${S.reconciled} of ${S.rows}; the largest difference is ${largest} points.`,
      `nflverse's points differ from the graded points on ${rec.rows_graded_differs_from_ppr} rows: ${rec.rows_with_term.pass_int} with an interception, ${rec.rows_with_term.fumbles_lost} with a fumble lost, ${rec.rows_with_term.two_pt} with a two-point conversion and ${rec.rows_with_term.special_teams_td} with a special teams touchdown (a row can have more than one).`,
    ].join(' '),
  };

  const OUT = path.join(__dirname, '..', 'src', 'data', 'intelligence', `weekly_actuals_${SEASON}.json`);
  fs.writeFileSync(OUT, JSON.stringify({ meta, rows: out }, null, 2));
  console.log(`  wrote ${OUT} (${out.length} rows, weeks: ${distinctWeeks.join(',')})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
