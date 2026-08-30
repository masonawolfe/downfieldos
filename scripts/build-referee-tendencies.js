#!/usr/bin/env node
/**
 * build-referee-tendencies.js — CoS audit 2026-08-30 finding #6.
 *
 * fetch-referees.js's own header flagged the gap:
 *   "Raw appearances only. Penalty tendencies (DPI rate, penalty yards,
 *    home/away skew) need a PBP join — belongs in a PBP-derived workflow
 *    or the Layer 2 reasoning brief."
 *
 * This script does that join. Reads referee_appearances.json (crew per
 * game) and the PBP CSVs from raw/, computes per-referee season averages,
 * and emits src/data/intelligence/referee_tendencies.json.
 *
 * Metrics per referee (Referee position only — crew chief):
 *  - games_officiated
 *  - avg_penalties_per_game
 *  - avg_penalty_yards_per_game
 *  - dpi_per_game            (defensive pass interference)
 *  - offensive_holding_per_game
 *  - first_down_penalty_rate (share of penalties resulting in auto-first-down)
 *  - home_penalty_share      (fraction of penalties on the home team)
 *
 * Runs against the seasons whose PBP files exist under raw/.
 *
 * Usage:
 *   node scripts/build-referee-tendencies.js
 *   SEASONS=2023,2024,2025 node scripts/build-referee-tendencies.js
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.dirname(path.dirname(__filename));
const OUTER_RAW = path.join(REPO, '..', 'data', 'intelligence', 'raw');
const APP_PATH = path.join(REPO, 'src', 'data', 'intelligence', 'referee_appearances.json');
const OUT = path.join(REPO, 'src', 'data', 'intelligence', 'referee_tendencies.json');
const SEASONS = (process.env.SEASONS || '2023,2024,2025').split(',').map(s => parseInt(s.trim(), 10));

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

function loadRefereesByOldGameId() {
  // referee_appearances.json's game_id is nflverse's `old_game_id` (numeric).
  // Build map old_game_id → referee_name (crew chief).
  const doc = JSON.parse(fs.readFileSync(APP_PATH, 'utf8'));
  const games = doc.games || {};
  const byOldId = new Map();
  for (const [gid, g] of Object.entries(games)) {
    const chief = (g.crew || []).find(m => (m.position || '').toLowerCase() === 'referee');
    if (chief) byOldId.set(gid, chief.name);
  }
  return byOldId;
}

function iteratePbpRows(season, onRow) {
  const gz = path.join(OUTER_RAW, `play_by_play_${season}.csv.gz`);
  if (!fs.existsSync(gz)) {
    console.log(`  ⚠ ${gz} missing — skipping season ${season}`);
    return 0;
  }
  const csv = zlib.gunzipSync(fs.readFileSync(gz)).toString('utf8');
  const lines = csv.split('\n');
  const headers = parseCsvLine(lines[0]);
  const idx = {
    old_game_id: headers.indexOf('old_game_id'),
    penalty: headers.indexOf('penalty'),
    penalty_yards: headers.indexOf('penalty_yards'),
    penalty_type: headers.indexOf('penalty_type'),
    penalty_team: headers.indexOf('penalty_team'),
    first_down_penalty: headers.indexOf('first_down_penalty'),
    home_team: headers.indexOf('home_team'),
    away_team: headers.indexOf('away_team'),
    season_type: headers.indexOf('season_type'),
  };
  if (idx.old_game_id < 0) return 0;
  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCsvLine(lines[i]);
    onRow({
      old_game_id: vals[idx.old_game_id],
      penalty: vals[idx.penalty] === '1',
      penalty_yards: parseInt(vals[idx.penalty_yards] || '0', 10) || 0,
      penalty_type: vals[idx.penalty_type] || '',
      penalty_team: vals[idx.penalty_team] || '',
      first_down_penalty: vals[idx.first_down_penalty] === '1',
      home_team: vals[idx.home_team] || '',
      away_team: vals[idx.away_team] || '',
      season_type: vals[idx.season_type] || '',
    });
    count++;
  }
  return count;
}

async function main() {
  console.log('DFOS — Referee tendencies build');
  console.log('===============================\n');
  const refByGame = loadRefereesByOldGameId();
  console.log(`  referee ↔ game map: ${refByGame.size} games`);

  // Per-referee stats accumulator
  const stats = new Map();
  const perGame = new Map(); // game_id → { penalties, yards, dpi, hold, fd_pen, home_pen, away_pen }

  function bump(gid) {
    let g = perGame.get(gid);
    if (!g) { g = { penalties: 0, yards: 0, dpi: 0, hold: 0, fd_pen: 0, home_pen: 0, away_pen: 0, home_team: '' }; perGame.set(gid, g); }
    return g;
  }

  for (const season of SEASONS) {
    const rows = iteratePbpRows(season, row => {
      if (row.season_type !== 'REG') return;
      if (!row.penalty) return;
      if (!row.old_game_id) return;
      const g = bump(row.old_game_id);
      if (!g.home_team) g.home_team = row.home_team;
      g.penalties += 1;
      g.yards += row.penalty_yards;
      if (row.first_down_penalty) g.fd_pen += 1;
      const pt = row.penalty_type.toLowerCase();
      if (pt.includes('pass interference') && pt.includes('defensive')) g.dpi += 1;
      if (pt.includes('offensive holding')) g.hold += 1;
      if (row.penalty_team === row.home_team) g.home_pen += 1;
      else if (row.penalty_team === row.away_team) g.away_pen += 1;
    });
    console.log(`  ${season}: parsed ${rows.toLocaleString()} PBP rows`);
  }

  // Aggregate per-referee
  for (const [gid, g] of perGame) {
    const ref = refByGame.get(gid);
    if (!ref) continue;
    let s = stats.get(ref);
    if (!s) { s = { games: 0, penalties: 0, yards: 0, dpi: 0, hold: 0, fd_pen: 0, home_pen: 0, away_pen: 0 }; stats.set(ref, s); }
    s.games += 1;
    s.penalties += g.penalties;
    s.yards += g.yards;
    s.dpi += g.dpi;
    s.hold += g.hold;
    s.fd_pen += g.fd_pen;
    s.home_pen += g.home_pen;
    s.away_pen += g.away_pen;
  }

  // League baselines
  let totalGames = 0, totalPen = 0, totalYd = 0, totalDpi = 0, totalHold = 0, totalFd = 0;
  for (const g of perGame.values()) {
    totalGames++;
    totalPen += g.penalties;
    totalYd += g.yards;
    totalDpi += g.dpi;
    totalHold += g.hold;
    totalFd += g.fd_pen;
  }
  const league = {
    games: totalGames,
    avg_penalties_per_game: round(totalPen / Math.max(1, totalGames), 2),
    avg_penalty_yards_per_game: round(totalYd / Math.max(1, totalGames), 1),
    dpi_per_game: round(totalDpi / Math.max(1, totalGames), 3),
    offensive_holding_per_game: round(totalHold / Math.max(1, totalGames), 3),
    first_down_penalty_rate: round(totalFd / Math.max(1, totalPen), 3),
  };

  const referees = [...stats.entries()].map(([name, s]) => ({
    referee: name,
    games_officiated: s.games,
    avg_penalties_per_game: round(s.penalties / s.games, 2),
    avg_penalty_yards_per_game: round(s.yards / s.games, 1),
    dpi_per_game: round(s.dpi / s.games, 3),
    offensive_holding_per_game: round(s.hold / s.games, 3),
    first_down_penalty_rate: round(s.fd_pen / Math.max(1, s.penalties), 3),
    home_penalty_share: round(s.home_pen / Math.max(1, s.home_pen + s.away_pen), 3),
    // Vs-league deltas — the "tendency" the raw metric wraps.
    delta_penalties_per_game: round((s.penalties / s.games) - league.avg_penalties_per_game, 2),
    delta_dpi_per_game: round((s.dpi / s.games) - league.dpi_per_game, 3),
  })).sort((a, b) => b.games_officiated - a.games_officiated);

  const payload = {
    meta: {
      generated: new Date().toISOString(),
      seasons: SEASONS,
      source: 'nflverse PBP × officials release (crew chief only)',
      referee_count: referees.length,
      games_covered: totalGames,
      league_baseline: league,
      note: 'CoS audit 2026-08-30 finding #6. Tendencies computed from REG-season plays only. Referees with < 20 games officiated should be treated as small-sample.',
    },
    referees,
  };

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log(`\n  ${referees.length} referees, ${totalGames} games covered`);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

function round(n, digits) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
