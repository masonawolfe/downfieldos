#!/usr/bin/env node
/**
 * build-history-and-durability.js — E-005 (2026-09-04).
 *
 * The data the board cannot see, per Mason's Nacua-vs-McCaffrey miss:
 * prior-season history (2023 + 2024), age, and a durability signal
 * derived from games missed.
 *
 * Design constraint (from CoS): do NOT fold durability into projection_pts.
 * Put it on the row beside so the copilot can SAY it.
 *
 * Outputs:
 *   src/data/intelligence/history_2023_2024.json — per gsis_id:
 *     { age_2026_week1, games_2023, games_2024, touches_2023, touches_2024,
 *       receptions_23/24, rec_yd_23/24, rush_yd_23/24, td_23/24,
 *       games_missed_last_3, durability_trend (STABLE|IMPROVING|DECLINING),
 *       source }
 *
 * Sources:
 *   - nflverse player_stats/player_stats_YYYY.csv (per-week per-player rows;
 *     aggregated here to season totals)
 *   - repo/../data/intelligence/raw/roster_2025.csv for birth_date → age
 *   - src/data/playerBoard2026.js for games_2025 (already there)
 *
 * Games-missed math:
 *   NFL 2023 was 17-game reg season; 2024 was 17; 2025 was 17.
 *   games_missed_YYYY = 17 - games_YYYY  (min 0)
 *   games_missed_last_3 = sum, unless the player wasn't in the league
 *     that year (rookie, retired). Not-in-league is DIFFERENT from injured
 *     and must not be counted as missed.
 *
 * Population-not-targeted spot check (per rule): players who never miss a
 * game (durability_trend STABLE, low count) should not accidentally look
 * DECLINING; and rookies with only 2025 data must have games_missed_last_3
 * = null (no history to trend), not 34 (2×17 phantom-missed).
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..');
const OUTER_RAW = path.join(REPO_ROOT, '..', 'data', 'intelligence', 'raw');
const OUT = path.join(REPO_ROOT, 'src', 'data', 'intelligence', 'history_2023_2024.json');

const PLAYER_STATS_URL = (year) => `https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_${year}.csv`;
const CACHE_DIR = OUTER_RAW;
const CACHE_TTL_HOURS = 24;

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

async function loadPlayerStatsSeason(year) {
  const cache = path.join(CACHE_DIR, `player_stats_${year}.csv`);
  let csv;
  if (fs.existsSync(cache) && (Date.now() - fs.statSync(cache).mtimeMs) < CACHE_TTL_HOURS * 3600 * 1000) {
    csv = fs.readFileSync(cache, 'utf8');
    console.log(`  loaded cache: ${cache}`);
  } else {
    console.log(`  fetching ${PLAYER_STATS_URL(year)} ...`);
    const res = await fetch(PLAYER_STATS_URL(year));
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${year}`);
    csv = await res.text();
    try { fs.writeFileSync(cache, csv); } catch { /* ok */ }
  }
  const lines = csv.split('\n');
  const headers = parseCsvLine(lines[0]);
  const iRe = Object.fromEntries(headers.map((h, i) => [h, i]));
  return { lines, headers, iRe, filename: cache };
}

function aggregateSeason(loaded) {
  const { lines, iRe } = loaded;
  // Aggregate per gsis_id (weekly rows summed to season)
  const byGsis = new Map();   // gsis_id → { games (weeks), targets, receptions, rec_yd, rec_td, rush_att, rush_yd, rush_td, pass_yd, pass_td }
  const gsisCol = iRe.player_id !== undefined ? iRe.player_id : (iRe.gsis_id ?? -1);
  if (gsisCol < 0) throw new Error('no gsis_id / player_id column in player_stats file');
  const fields = {
    targets: iRe.targets, receptions: iRe.receptions, rec_yd: iRe.receiving_yards, rec_td: iRe.receiving_tds,
    rush_att: iRe.carries, rush_yd: iRe.rushing_yards, rush_td: iRe.rushing_tds,
    pass_yd: iRe.passing_yards, pass_td: iRe.passing_tds,
  };
  const seasonTypeCol = iRe.season_type;

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const v = parseCsvLine(lines[i]);
    if (seasonTypeCol != null && v[seasonTypeCol] !== 'REG') continue;
    const gsis = v[gsisCol];
    if (!gsis) continue;
    let agg = byGsis.get(gsis);
    if (!agg) { agg = { games: 0, targets: 0, receptions: 0, rec_yd: 0, rec_td: 0, rush_att: 0, rush_yd: 0, rush_td: 0, pass_yd: 0, pass_td: 0 }; byGsis.set(gsis, agg); }
    agg.games += 1;   // one row per week; count weeks the player appeared
    for (const [k, col] of Object.entries(fields)) {
      if (col == null) continue;
      const val = parseFloat(v[col] || '0');
      if (!isNaN(val)) agg[k] += val;
    }
  }
  return byGsis;
}

function loadRosterAges() {
  const csv = fs.readFileSync(path.join(OUTER_RAW, 'roster_2025.csv'), 'utf8');
  const lines = csv.split('\n');
  const headers = parseCsvLine(lines[0]);
  const gIdx = headers.indexOf('gsis_id');
  const bIdx = headers.indexOf('birth_date');
  const byGsis = new Map();
  const w1 = new Date(Date.UTC(2026, 8, 10));   // 2026-09-10 (approx Week 1)
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const v = parseCsvLine(lines[i]);
    const g = v[gIdx];
    const b = v[bIdx];
    if (!g || !b) continue;
    const dob = new Date(b);
    if (isNaN(dob.getTime())) continue;
    const ageMs = w1 - dob;
    const ageYrs = Math.round((ageMs / (365.25 * 24 * 3600 * 1000)) * 10) / 10;
    byGsis.set(g, ageYrs);
  }
  return byGsis;
}

function loadPlayerBoard2025Games() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'src', 'data', 'playerBoard2026.js'), 'utf8');
  const m = src.match(/export const PLAYER_BOARD_2026 = (\[[\s\S]*?\]);\s*\n\s*export const/);
  if (!m) throw new Error('PLAYER_BOARD_2026 array block not matched');
  const arr = JSON.parse(m[1]);
  const g25 = new Map();
  for (const p of arr) if (p.gsis_id && p.games_2025 != null) g25.set(p.gsis_id, p.games_2025);
  return g25;
}

function trendFor(games23, games24, games25) {
  // STABLE if all 3 were healthy (≥14). IMPROVING if games rise. DECLINING if games fall.
  const vals = [games23, games24, games25].filter(v => v != null && v > 0);
  if (vals.length < 2) return null;
  const diffs = [];
  for (let i = 1; i < vals.length; i++) diffs.push(vals[i] - vals[i-1]);
  const netTrend = diffs.reduce((a,b) => a+b, 0);
  const allHealthy = vals.every(v => v >= 14);
  if (allHealthy) return 'STABLE';
  if (netTrend > 1) return 'IMPROVING';
  if (netTrend < -1) return 'DECLINING';
  return 'STABLE';
}

async function main() {
  console.log('DFOS — E-005 history + durability build');
  console.log('=======================================\n');

  const s23 = await loadPlayerStatsSeason(2023);
  const s24 = await loadPlayerStatsSeason(2024);
  const agg23 = aggregateSeason(s23);
  const agg24 = aggregateSeason(s24);
  console.log(`  2023 aggregated: ${agg23.size} players`);
  console.log(`  2024 aggregated: ${agg24.size} players`);

  const ages = loadRosterAges();
  const games25ByGsis = loadPlayerBoard2025Games();
  console.log(`  roster 2025 with birth_date: ${ages.size}`);
  console.log(`  board 2025 games known: ${games25ByGsis.size}\n`);

  const allGsis = new Set([...agg23.keys(), ...agg24.keys(), ...games25ByGsis.keys(), ...ages.keys()]);
  const out = {};
  let cnt = { with23: 0, with24: 0, withAge: 0, withDurability: 0, rookiesNoHistory: 0 };
  for (const gsis of allGsis) {
    const a23 = agg23.get(gsis);
    const a24 = agg24.get(gsis);
    const g25 = games25ByGsis.get(gsis);
    const age = ages.get(gsis);
    if (a23) cnt.with23++;
    if (a24) cnt.with24++;
    if (age != null) cnt.withAge++;
    // Games-missed math — the honest version. Only count seasons the player
    // was IN THE LEAGUE. Rookies get null missed (no history), not 34.
    const seasonsIn = [];
    if (a23) seasonsIn.push({ year: 2023, games: a23.games });
    if (a24) seasonsIn.push({ year: 2024, games: a24.games });
    if (g25 != null && g25 > 0) seasonsIn.push({ year: 2025, games: g25 });
    let gamesMissedLast3 = null;
    if (seasonsIn.length >= 2) {
      gamesMissedLast3 = seasonsIn.reduce((s, x) => s + Math.max(0, 17 - x.games), 0);
      cnt.withDurability++;
    } else if (seasonsIn.length === 1 && seasonsIn[0].year === 2025) {
      cnt.rookiesNoHistory++;
    }
    const trend = trendFor(a23?.games, a24?.games, g25);
    out[gsis] = {
      age_2026_week1: age ?? null,
      // 2023
      games_2023: a23?.games ?? null,
      touches_2023: a23 ? (a23.rush_att + a23.receptions) : null,
      receptions_2023: a23?.receptions ?? null,
      rec_yd_2023: a23?.rec_yd ?? null,
      rush_yd_2023: a23?.rush_yd ?? null,
      total_td_2023: a23 ? (a23.rec_td + a23.rush_td + a23.pass_td) : null,
      // 2024
      games_2024: a24?.games ?? null,
      touches_2024: a24 ? (a24.rush_att + a24.receptions) : null,
      receptions_2024: a24?.receptions ?? null,
      rec_yd_2024: a24?.rec_yd ?? null,
      rush_yd_2024: a24?.rush_yd ?? null,
      total_td_2024: a24 ? (a24.rec_td + a24.rush_td + a24.pass_td) : null,
      // Durability derived
      games_missed_last_3_seasons: gamesMissedLast3,
      seasons_in_league_last_3: seasonsIn.map(s => s.year),
      durability_trend: trend,
      history_source: 'nflverse player_stats/player_stats_{2023,2024}.csv (REG only) + roster_2025 birth_date',
    };
  }

  const doc = {
    meta: {
      generated: new Date().toISOString(),
      season: 2026,
      source_2023: PLAYER_STATS_URL(2023),
      source_2024: PLAYER_STATS_URL(2024),
      games_2025_source: 'src/data/playerBoard2026.js games_2025',
      age_source: 'roster_2025.csv birth_date, age as of 2026-09-10 (week 1 anchor)',
      row_counts: {
        players_with_any_history_or_age: Object.keys(out).length,
        with_2023: cnt.with23,
        with_2024: cnt.with24,
        with_age: cnt.withAge,
        with_durability_signal: cnt.withDurability,
        rookies_or_no_history_null_durability: cnt.rookiesNoHistory,
      },
      design_constraint: 'Do NOT fold games_missed_last_3_seasons into projection_pts. Copilot surfaces it alongside so a human can weigh it. Mason\'s CMC-vs-Chase call on 2026-09-03 relied on exactly this information — the fix is to give it, not to bake it into a number.',
      games_missed_math: '17 - games each season; rookies excluded (only seasons the player was in the league count).',
      trend_definition: 'STABLE if all 3 seasons ≥ 14 games; IMPROVING if games trend up; DECLINING if down; null if < 2 seasons of data.',
    },
    players: out,
  };
  fs.writeFileSync(OUT, JSON.stringify(doc));
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
  console.log(`  players indexed: ${Object.keys(out).length}`);
  console.log(`  with 2023 data: ${cnt.with23} | with 2024: ${cnt.with24}`);
  console.log(`  with age: ${cnt.withAge}`);
  console.log(`  with durability signal (≥2 seasons in league): ${cnt.withDurability}`);
  console.log(`  rookies / 2025-only (durability null, not zero): ${cnt.rookiesNoHistory}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
