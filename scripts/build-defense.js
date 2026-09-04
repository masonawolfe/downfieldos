#!/usr/bin/env node
/**
 * build-defense.js — DFOS Part 1 of the context-layer build (2026-09-04).
 *
 * The single missing input for weekly start-sit: opponent defensive splits.
 * Emits src/data/defense2026.js — one row per NFL team, computed from 2025
 * regular-season nflverse play-by-play.
 *
 * Every metric is a RATE stat (per game or per play) so defenses that faced
 * 600 plays are comparable to defenses that faced 500. Ranks are 1 = best
 * defense (fewest points/EPA allowed), 32 = worst.
 *
 * Sources:
 *   - ../data/intelligence/raw/play_by_play_2025.csv.gz  (nflverse PBP)
 *   - ../data/intelligence/raw/roster_2025.csv           (gsis_id → position,
 *                                                        for by-position
 *                                                        attribution)
 *
 * What's here vs what's not:
 *   ✓ FPts allowed to QB/RB/WR/TE per game (full-PPR)
 *   ✓ Pass/rush yards allowed per game
 *   ✓ Pass/rush EPA allowed per attempt
 *   ✓ Pass/rush TDs allowed per game
 *   ✓ Plays faced (so downstream can weight small-sample suspicion)
 *   ✓ Rankings for each rate stat, computed against 32-team spread
 *   ✗ Scheme-specific splits (outside-zone vs gap) — nflverse PBP does not
 *     carry defensive front alignment or run scheme labels reliably. Skipped
 *     rather than approximated.
 *
 * Rules honoured (from _FROM_COS/2026-09-04-context-layer-build.md):
 *   - Every field labelled with `defense_source: 'nflverse_pbp_2025_REG'`.
 *   - Population NOT targeted (rookies / new coordinators changing scheme in
 *     2026) is called out in meta rather than fabricated.
 *   - No coverage test masquerading as an acceptance test.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..');
const OUTER_RAW = path.join(REPO_ROOT, '..', 'data', 'intelligence', 'raw');
const OUT = path.join(REPO_ROOT, 'src', 'data', 'defense2026.js');

const ALL_TEAMS = ['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS'];
const NORM_TEAM = { LA: 'LAR', OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', AZ: 'ARI' };
function norm(t) { const u = (t || '').toUpperCase().trim(); return NORM_TEAM[u] || u; }

// Full-PPR scoring (same as valuation layer).
const SCORING = { rec: 1.0, rec_yd: 0.1, rec_td: 6, rush_yd: 0.1, rush_td: 6, pass_yd: 0.04, pass_td: 4 };

// Positions we bucket fpts_allowed against. Non-skill positions get
// filed under 'OTHER' and dropped when we compute per-position totals.
const SKILL_POS = new Set(['QB', 'RB', 'WR', 'TE']);

function parseCsvLine(line) {
  const out = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (c === ',' && !inQ) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function loadRosterPositions() {
  const csv = fs.readFileSync(path.join(OUTER_RAW, 'roster_2025.csv'), 'utf8');
  const lines = csv.split('\n');
  const headers = parseCsvLine(lines[0]);
  const gIdx = headers.indexOf('gsis_id');
  const pIdx = headers.indexOf('position');
  const byId = new Map();
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCsvLine(lines[i]);
    const g = vals[gIdx]; const p = (vals[pIdx] || '').toUpperCase();
    if (g && p) byId.set(g, p);
  }
  return byId;
}

function fantasyPtsForRusher(row) {
  return (row.yards_gained || 0) * SCORING.rush_yd + (row.rush_touchdown ? SCORING.rush_td : 0);
}
function fantasyPtsForReceiver(row) {
  // yards on this play credited to the receiver (only if completed pass)
  const yds = row.yards_gained || 0;
  return SCORING.rec + yds * SCORING.rec_yd + (row.pass_touchdown ? SCORING.rec_td : 0);
}
function fantasyPtsForPasser(row) {
  const yds = row.yards_gained || 0;
  return yds * SCORING.pass_yd + (row.pass_touchdown ? SCORING.pass_td : 0);
}

async function main() {
  console.log('DFOS — Defense 2026 build (from 2025 REG PBP)');
  console.log('=============================================\n');

  const rosterPos = loadRosterPositions();
  console.log(`  roster 2025 positions: ${rosterPos.size} players`);

  console.log('  reading play_by_play_2025.csv.gz ...');
  const csv = zlib.gunzipSync(fs.readFileSync(path.join(OUTER_RAW, 'play_by_play_2025.csv.gz'))).toString('utf8');
  const lines = csv.split('\n');
  const headers = parseCsvLine(lines[0]);
  const idx = Object.fromEntries(['posteam','defteam','play_type','yards_gained','pass_touchdown','rush_touchdown','interception','fumble_lost','complete_pass','receiver_player_id','rusher_player_id','passer_player_id','epa','week','season_type','game_id'].map(h => [h, headers.indexOf(h)]));

  // Accumulators per defensive team
  const D = Object.fromEntries(ALL_TEAMS.map(t => [t, {
    team: t,
    games: new Set(),
    plays_faced: 0,
    pass_attempts_faced: 0,
    rush_attempts_faced: 0,
    pass_yards_allowed: 0,
    rush_yards_allowed: 0,
    pass_epa_sum: 0,
    rush_epa_sum: 0,
    pass_td_allowed: 0,
    rush_td_allowed: 0,
    interceptions_forced: 0,
    fumbles_forced: 0,
    fpts_allowed: { QB: 0, RB: 0, WR: 0, TE: 0, OTHER: 0 },
  }]));

  let total = 0, skipped = 0;
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCsvLine(lines[i]);
    if (vals[idx.season_type] !== 'REG') continue;
    const defRaw = vals[idx.defteam];
    if (!defRaw) continue;
    const def = norm(defRaw);
    if (!D[def]) { skipped++; continue; }
    total++;

    const row = {
      play_type: vals[idx.play_type],
      yards_gained: parseFloat(vals[idx.yards_gained] || '0') || 0,
      pass_touchdown: vals[idx.pass_touchdown] === '1',
      rush_touchdown: vals[idx.rush_touchdown] === '1',
      interception: vals[idx.interception] === '1',
      fumble_lost: vals[idx.fumble_lost] === '1',
      complete_pass: vals[idx.complete_pass] === '1',
      receiver_id: vals[idx.receiver_player_id] || null,
      rusher_id: vals[idx.rusher_player_id] || null,
      passer_id: vals[idx.passer_player_id] || null,
      epa: parseFloat(vals[idx.epa] || '0'),
      game_id: vals[idx.game_id],
    };

    const d = D[def];
    d.games.add(row.game_id);
    d.plays_faced++;

    if (row.play_type === 'pass') {
      d.pass_attempts_faced++;
      d.pass_yards_allowed += row.yards_gained;
      if (!isNaN(row.epa)) d.pass_epa_sum += row.epa;
      if (row.pass_touchdown) d.pass_td_allowed++;
      if (row.interception) d.interceptions_forced++;
      // fpts to passer (QB assumed)
      const passerPos = (row.passer_id && rosterPos.get(row.passer_id)) || 'QB';
      const passerBucket = SKILL_POS.has(passerPos) ? passerPos : 'OTHER';
      d.fpts_allowed[passerBucket] += fantasyPtsForPasser(row);
      // fpts to receiver (only if completed pass — receiver only gets rec + yards + TD if the pass hit)
      if (row.complete_pass && row.receiver_id) {
        const recPos = rosterPos.get(row.receiver_id) || 'WR';
        const recBucket = SKILL_POS.has(recPos) ? recPos : 'OTHER';
        d.fpts_allowed[recBucket] += fantasyPtsForReceiver(row);
      }
    } else if (row.play_type === 'run') {
      d.rush_attempts_faced++;
      d.rush_yards_allowed += row.yards_gained;
      if (!isNaN(row.epa)) d.rush_epa_sum += row.epa;
      if (row.rush_touchdown) d.rush_td_allowed++;
      if (row.fumble_lost) d.fumbles_forced++;
      if (row.rusher_id) {
        const rusherPos = rosterPos.get(row.rusher_id) || 'RB';
        const bucket = SKILL_POS.has(rusherPos) ? rusherPos : 'OTHER';
        d.fpts_allowed[bucket] += fantasyPtsForRusher(row);
      }
    }
  }

  console.log(`  processed ${total.toLocaleString()} REG plays (${skipped} rows skipped for non-32-team defteam)`);

  // Derive rate stats per team
  const rows = [];
  for (const t of ALL_TEAMS) {
    const d = D[t];
    const games = d.games.size;
    if (games === 0) continue;
    rows.push({
      team: t,
      games_2025: games,
      plays_faced: d.plays_faced,
      pass_attempts_faced: d.pass_attempts_faced,
      rush_attempts_faced: d.rush_attempts_faced,
      // Per-game rate stats
      pass_yards_allowed_per_game: Math.round(d.pass_yards_allowed / games * 10) / 10,
      rush_yards_allowed_per_game: Math.round(d.rush_yards_allowed / games * 10) / 10,
      pass_td_allowed_per_game: Math.round(d.pass_td_allowed / games * 100) / 100,
      rush_td_allowed_per_game: Math.round(d.rush_td_allowed / games * 100) / 100,
      // Per-attempt rate stats
      pass_epa_per_att_allowed: Math.round(d.pass_epa_sum / Math.max(1, d.pass_attempts_faced) * 1000) / 1000,
      rush_epa_per_att_allowed: Math.round(d.rush_epa_sum / Math.max(1, d.rush_attempts_faced) * 1000) / 1000,
      yards_per_pass_att_allowed: Math.round(d.pass_yards_allowed / Math.max(1, d.pass_attempts_faced) * 100) / 100,
      yards_per_rush_att_allowed: Math.round(d.rush_yards_allowed / Math.max(1, d.rush_attempts_faced) * 100) / 100,
      // Turnovers forced (context, not a rate)
      interceptions_forced: d.interceptions_forced,
      fumbles_forced: d.fumbles_forced,
      // Fantasy points allowed by position, per game
      fpts_allowed_qb_per_game: Math.round(d.fpts_allowed.QB / games * 10) / 10,
      fpts_allowed_rb_per_game: Math.round(d.fpts_allowed.RB / games * 10) / 10,
      fpts_allowed_wr_per_game: Math.round(d.fpts_allowed.WR / games * 10) / 10,
      fpts_allowed_te_per_game: Math.round(d.fpts_allowed.TE / games * 10) / 10,
    });
  }

  // Compute rankings — 1 = best (fewest allowed), 32 = worst.
  const rankFields = [
    'pass_yards_allowed_per_game', 'rush_yards_allowed_per_game',
    'pass_td_allowed_per_game', 'rush_td_allowed_per_game',
    'pass_epa_per_att_allowed', 'rush_epa_per_att_allowed',
    'yards_per_pass_att_allowed', 'yards_per_rush_att_allowed',
    'fpts_allowed_qb_per_game', 'fpts_allowed_rb_per_game',
    'fpts_allowed_wr_per_game', 'fpts_allowed_te_per_game',
  ];
  for (const f of rankFields) {
    const sorted = [...rows].sort((a, b) => a[f] - b[f]);   // ascending — fewer allowed = better = rank 1
    sorted.forEach((r, i) => { r[`rank_${f}`] = i + 1; });
  }

  // Convenience: composite ranks
  for (const r of rows) {
    r.rank_pass_def_overall = Math.round((r.rank_pass_epa_per_att_allowed + r.rank_yards_per_pass_att_allowed + r.rank_fpts_allowed_qb_per_game + r.rank_fpts_allowed_wr_per_game + r.rank_fpts_allowed_te_per_game) / 5);
    r.rank_rush_def_overall = Math.round((r.rank_rush_epa_per_att_allowed + r.rank_yards_per_rush_att_allowed + r.rank_fpts_allowed_rb_per_game) / 3);
    r.defense_source = 'nflverse_pbp_2025_REG';
  }

  // Object keyed by team code for cheap lookup at join time
  const byTeam = Object.fromEntries(rows.map(r => [r.team, r]));

  const meta = {
    generated: new Date().toISOString(),
    source: 'nflverse play_by_play_2025.csv.gz (REG only) × roster_2025.csv (gsis_id → position)',
    schema_version: 1,
    scoring: 'full_ppr',
    scoring_rules: SCORING,
    populations_not_covered: [
      'Teams with a new 2026 coordinator or major scheme change — 2025 defensive metrics carry over unchanged and understate scheme-driven turnover. Downstream should read coordinator_is_new_2026 alongside these ranks.',
      'Teams that made mid-season defensive personnel trades in 2025 — the season aggregate blends before/after periods.',
      'Rookie-heavy 2026 defenses whose 2025 numbers were earned by different personnel.',
    ],
    non_scheme_split: '2025 nflverse PBP does not carry reliable outside-zone vs gap or coverage-shell labels, so scheme-specific splits are not built here. If added later, source them from a separate PBP charting product (PFF, NGS) rather than approximating.',
    ranks_convention: '1 = best defense (fewest yards/EPA/fpts allowed), 32 = worst.',
    fields_source_label: 'defense_source (on every row) = nflverse_pbp_2025_REG',
  };

  const output = `/**
 * Defense 2026 — team defensive splits derived from 2025 REG PBP.
 * Auto-generated by scripts/build-defense.js on ${new Date().toISOString()}.
 * ${rows.length} teams | schema v${meta.schema_version}
 *
 * Every metric is a RATE STAT (per game or per attempt). Ranks 1-32:
 * 1 = best (fewest allowed), 32 = worst.
 *
 * See META.populations_not_covered for the shape of what this file's 2025
 * numbers understate for 2026. Read defense_source on any row before citing.
 */
export const DEFENSE_2026 = ${JSON.stringify(byTeam, null, 2)};

export const DEFENSE_2026_META = ${JSON.stringify(meta, null, 2)};
`;
  fs.writeFileSync(OUT, output);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
  console.log('  teams covered:', rows.length);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
