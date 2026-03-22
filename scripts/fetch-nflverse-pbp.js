#!/usr/bin/env node
/**
 * fetch-nflverse-pbp.js
 *
 * Fetches real NFL play-by-play data from nflverse, transforms it to the
 * DownfieldOS play schema, and writes season-split JSON files.
 *
 * Output files:
 *   public/data/plays-{year}.json   (one per season)
 *   public/data/plays-meta.json     (metadata)
 *
 * Usage:
 *   node scripts/fetch-nflverse-pbp.js
 *
 * Data source: https://github.com/nflverse/nflverse-data/releases
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Config ──────────────────────────────────────────────────────────────────

const SEASONS = [2023, 2024, 2025];
const PBP_URL = (year) =>
  `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${year}.csv`;

const OUT_DIR = path.join(__dirname, '../public/data');

// Team abbreviation normalization (reused from fetch-nflverse-rosters.js)
const TEAM_MAP = {
  OAK: 'LV',
  STL: 'LAR',
  LA: 'LAR',
  SD: 'LAC',
  WSH: 'WAS',
};

function normalizeTeam(code) {
  if (!code) return '';
  const upper = code.trim().toUpperCase();
  return TEAM_MAP[upper] || upper;
}

// ── CSV Parser (lightweight, no deps) ───────────────────────────────────────

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// Streaming CSV parser — processes line by line to handle 50MB+ files
function parseCSVRows(text, onRow) {
  const lines = text.split('\n');
  if (lines.length < 2) return;

  const headers = parseCSVLine(lines[0]);
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    onRow(row);
    count++;
  }
  return count;
}

// ── Play Transformer ────────────────────────────────────────────────────────

function transformPlay(r) {
  const playType = (r.play_type || '').toLowerCase();

  // Only pass and run plays
  if (playType !== 'pass' && playType !== 'run') return null;

  const down = parseInt(r.down);
  if (!down || down < 1 || down > 4) return null;

  const off = normalizeTeam(r.posteam);
  const def = normalizeTeam(r.defteam);
  if (!off || !def) return null;

  const type = playType === 'pass' ? 'Pass' : 'Run';
  const yd = parseInt(r.yards_gained) || 0;
  const ytg = parseInt(r.ydstogo) || 10;
  const fp = parseInt(r.yardline_100) || 50;
  const q = parseInt(r.qtr) || 1;
  const complete = type === 'Pass' ? (r.complete_pass === '1') : null;
  const isSack = r.sack === '1' ? 1 : 0;

  // Success rate — match existing generatePlays() logic exactly
  let isS;
  if (down === 1) {
    isS = yd >= ytg * 0.45 ? 1 : 0;
  } else if (down === 2) {
    isS = yd >= ytg * 0.6 ? 1 : 0;
  } else {
    isS = yd >= ytg ? 1 : 0;
  }

  // Explosive play — 20+ yd pass or 12+ yd run
  const isX = (type === 'Pass' && yd >= 20) || (type === 'Run' && yd >= 12) ? 1 : 0;

  // Red zone — within opponent's 20
  const rz = fp <= 20 ? 1 : 0;

  // Environment
  const roof = (r.roof || '').toLowerCase();
  const isDome = roof === 'dome' || roof === 'closed';
  let env = 'Clear';
  if (isDome) {
    env = 'Dome';
  } else {
    const weather = (r.weather || '').toLowerCase();
    const windSpeed = parseInt(r.wind) || 0;
    if (weather.includes('snow') || weather.includes('flurr')) {
      env = 'Snow';
    } else if (weather.includes('rain') || weather.includes('shower')) {
      env = 'Rain';
    } else if (windSpeed > 15 || weather.includes('wind')) {
      env = 'Wind';
    }
  }

  // Home/Away
  const homeTeam = normalizeTeam(r.home_team);
  const ha = off === homeTeam ? 'Home' : 'Away';

  // Two-minute drill
  const halfSecsRemaining = parseInt(r.half_seconds_remaining) || 999;
  const twoMin = (halfSecsRemaining <= 120 && (q === 2 || q === 4)) ? 1 : 0;

  // Score differential
  const scoreDiff = parseInt(r.score_differential) || 0;

  // Personnel — not available in standard nflverse PBP, default to "11"
  const pers = '11';

  return {
    season: parseInt(r.season),
    week: parseInt(r.week),
    gameId: r.game_id,
    off,
    def,
    down,
    ytg,
    fp,
    type,
    yd,
    isS,
    isX,
    q,
    rz,
    env,
    ha,
    pers,
    scoreDiff,
    complete,
    twoMin,
    isSack,
  };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function fetchSeason(year) {
  const url = PBP_URL(year);
  console.log(`  Fetching ${year} PBP data...`);

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch ${url}: ${resp.status} ${resp.statusText}`);
  }

  const text = await resp.text();
  console.log(`  Downloaded ${(text.length / 1024 / 1024).toFixed(1)}MB CSV`);

  const plays = [];
  let totalRows = 0;
  let skipped = 0;

  parseCSVRows(text, (row) => {
    totalRows++;
    // Only regular season
    if (row.season_type !== 'REG') { skipped++; return; }
    const play = transformPlay(row);
    if (play) {
      plays.push(play);
    } else {
      skipped++;
    }
  });

  console.log(`  ${year}: ${totalRows} total rows → ${plays.length} plays (${skipped} skipped)`);
  return plays;
}

async function main() {
  console.log('DownfieldOS — nflverse PBP Data Fetch');
  console.log('=====================================\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const meta = {
    generated: new Date().toISOString(),
    source: 'nflverse',
    seasons: {},
    totalPlays: 0,
  };

  for (const year of SEASONS) {
    try {
      const plays = await fetchSeason(year);

      // Write season file
      const outPath = path.join(OUT_DIR, `plays-${year}.json`);
      fs.writeFileSync(outPath, JSON.stringify(plays));
      const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`  → Wrote ${outPath} (${sizeKB}KB)\n`);

      meta.seasons[year] = plays.length;
      meta.totalPlays += plays.length;
    } catch (err) {
      console.error(`  ✗ Error fetching ${year}: ${err.message}\n`);
    }
  }

  // Write metadata
  const metaPath = path.join(OUT_DIR, 'plays-meta.json');
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log('Summary');
  console.log('-------');
  Object.entries(meta.seasons).forEach(([year, count]) => {
    console.log(`  ${year}: ${count.toLocaleString()} plays`);
  });
  console.log(`  Total: ${meta.totalPlays.toLocaleString()} plays`);
  console.log(`\nDone.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
