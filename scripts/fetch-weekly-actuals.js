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
 * The board's scoring rules live in PLAYER_BOARD_2026_META.scoring_rules;
 * the default shape is `standard_12_1qb` which is full PPR. nflverse's
 * `fantasy_points_ppr` column is computed under identical rules
 * (rec 1, rec_yd 0.1, rec_td 6, rush_yd 0.1, rush_td 6, pass_yd 0.04,
 * pass_td 4, no int/fumble penalty) — verified Week 1 2026 with
 * Caleb Williams (nflverse ppr=37.26, hand-computed=37.26 ✓) and
 * Matthew Stafford (nflverse ppr=4.10 ✓).
 *
 * Usage:
 *   node scripts/fetch-weekly-actuals.js            # SEASON=current
 *   SEASON=2025 node scripts/fetch-weekly-actuals.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchGzippedCSV, normTeam, num, int } from './_lib/nflverse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function currentNflSeason() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  return m >= 3 ? y : y - 1;
}

const SEASON = parseInt(process.env.SEASON || process.argv[2] || String(currentNflSeason()), 10);
const URL = `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_${SEASON}.csv.gz`;

async function main() {
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
    // Fumbles-lost across rushing, receiving, and sack fumbles. nflverse
    // splits them; the board's scoring doesn't penalize fumbles today, but
    // we log the count so E-032 / E-034 can bring it back in.
    const fumbles_lost = sumInt(r.rushing_fumbles_lost, r.receiving_fumbles_lost, r.sack_fumbles_lost);
    return {
      gsis_id: r.player_id,
      name: r.player_display_name,
      pos: r.position,
      team: normTeam(r.team),
      opponent: normTeam(r.opponent_team),
      season: int(r.season),
      week,
      // nflverse-computed (matches board's scoring; see file header for verification).
      fantasy_points_ppr: num(r.fantasy_points_ppr),
      fantasy_points_std: num(r.fantasy_points),
      components: {
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
      },
      source: `nflverse:stats_player_week_${SEASON}`,
    };
  });

  // Sort: week asc, then ppr desc within week — makes the JSON scannable.
  out.sort((a, b) => (a.week - b.week) || ((b.fantasy_points_ppr || 0) - (a.fantasy_points_ppr || 0)));

  const distinctWeeks = [...new Set(out.map(r => r.week))].sort((a, b) => a - b);
  const meta = {
    season: SEASON,
    generated_utc: new Date().toISOString(),
    row_count: out.length,
    weeks_present: distinctWeeks,
    source_url: URL,
    scoring_notes: 'fantasy_points_ppr is nflverse-computed under full-PPR rules (rec 1, rec_yd 0.1, rec_td 6, rush_yd 0.1, rush_td 6, pass_yd 0.04, pass_td 4, no int/fumble penalty). Matches PLAYER_BOARD_2026_META.scoring_rules.full_ppr — see fetch-weekly-actuals.js header for the Week-1-2026 verification.',
  };

  const OUT = path.join(__dirname, '..', 'src', 'data', 'intelligence', `weekly_actuals_${SEASON}.json`);
  fs.writeFileSync(OUT, JSON.stringify({ meta, rows: out }, null, 2));
  console.log(`  wrote ${OUT} (${out.length} rows, weeks: ${distinctWeeks.join(',')})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
