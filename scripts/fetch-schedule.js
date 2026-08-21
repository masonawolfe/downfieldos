#!/usr/bin/env node
/**
 * fetch-schedule.js
 *
 * Ingests the nflverse `schedules` release (games.csv) and produces a
 * week-indexed schedule for the requested season. Unblocks bye-week
 * collision checking, playoff-weeks SOS, and the K/DEF December
 * environment model (P0-3, P2-1 in FANTASY_ENGINE_BUILD_PLAN.md).
 *
 * Output: src/data/schedule${SEASON}.js
 *
 * Usage:
 *   node scripts/fetch-schedule.js               # defaults to SEASON=2026
 *   SEASON=2025 node scripts/fetch-schedule.js
 *   node scripts/fetch-schedule.js 2025
 *
 * Source: https://github.com/nflverse/nflverse-data/releases/tag/schedules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEASON = parseInt(process.env.SEASON || process.argv[2] || '2026', 10);
const GAMES_URL = 'https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv';
const OUT_PATH = path.join(__dirname, `../src/data/schedule${SEASON}.js`);

const TEAM_MAP = { OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', LA: 'LAR' };
const ALL_TEAMS = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG',
  'NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS',
];

function norm(t) {
  const u = (t || '').trim().toUpperCase();
  return TEAM_MAP[u] || u;
}

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const vals = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] ?? '').trim(); });
    rows.push(row);
  }
  return rows;
}

function intOrNull(s) {
  if (s == null || s === '') return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

async function main() {
  console.log(`DownfieldOS — nflverse Schedule Ingest (${SEASON})`);
  console.log('==================================================\n');

  console.log(`  Fetching games.csv...`);
  const res = await fetch(GAMES_URL);
  if (!res.ok) throw new Error(`Failed to fetch games.csv: ${res.status}`);
  const text = await res.text();
  console.log(`  Downloaded ${(text.length / 1024 / 1024).toFixed(1)}MB`);

  const rows = parseCSV(text);
  console.log(`  Total rows across all seasons: ${rows.length.toLocaleString()}`);

  // Filter to the target season, regular season only (bye derivation looks at REG only)
  const seasonRows = rows.filter(r => r.season === String(SEASON));
  const regRows = seasonRows.filter(r => r.game_type === 'REG');
  const postRows = seasonRows.filter(r => r.game_type && r.game_type !== 'REG');
  console.log(`  ${SEASON} regular-season games: ${regRows.length}`);
  console.log(`  ${SEASON} post-season games:    ${postRows.length}`);

  if (regRows.length === 0) {
    console.error(`  No regular-season games found for ${SEASON}. Aborting.`);
    process.exit(1);
  }

  // Regular-season weeks span (usually 1–18)
  const weeks = [...new Set(regRows.map(r => parseInt(r.week, 10)))].filter(w => !isNaN(w)).sort((a, b) => a - b);
  const minWeek = weeks[0];
  const maxWeek = weeks[weeks.length - 1];
  console.log(`  Regular-season weeks: ${minWeek}–${maxWeek} (${weeks.length} distinct)\n`);

  // Compact per-game record — used by both byWeek index and per-team games list
  function compact(row, teamSide /* 'home' | 'away' | null */) {
    const home = norm(row.home_team);
    const away = norm(row.away_team);
    const rec = {
      game_id: row.game_id,
      week: intOrNull(row.week),
      game_type: row.game_type,
      gameday: row.gameday || null,
      weekday: row.weekday || null,
      gametime: row.gametime || null,
      home: home,
      away: away,
      div_game: row.div_game === '1',
      roof: row.roof || null,           // outdoors / dome / closed / open
      surface: row.surface || null,
      stadium: row.stadium || null,
      stadium_id: row.stadium_id || null,
      referee: row.referee || null,
      spread_line: row.spread_line !== '' && row.spread_line != null ? Number(row.spread_line) : null,
      total_line: row.total_line !== '' && row.total_line != null ? Number(row.total_line) : null,
    };
    if (teamSide === 'home') {
      return { ...rec, opponent: away, isHome: true };
    }
    if (teamSide === 'away') {
      return { ...rec, opponent: home, isHome: false };
    }
    return rec;
  }

  // Per-team schedule (regular season)
  const teams = {};
  ALL_TEAMS.forEach(t => { teams[t] = { games: [], byeWeek: null }; });

  for (const row of regRows) {
    const home = norm(row.home_team);
    const away = norm(row.away_team);
    if (teams[home]) teams[home].games.push(compact(row, 'home'));
    if (teams[away]) teams[away].games.push(compact(row, 'away'));
  }

  // Derive bye weeks — the one regular-season week each team has no game
  const missingBye = [];
  const multiBye = [];
  for (const t of ALL_TEAMS) {
    const weeksPlayed = new Set(teams[t].games.map(g => g.week));
    const byes = weeks.filter(w => !weeksPlayed.has(w));
    if (byes.length === 1) {
      teams[t].byeWeek = byes[0];
    } else if (byes.length === 0) {
      missingBye.push(t);
    } else {
      teams[t].byeWeek = byes[0]; // pick the first, but flag it
      multiBye.push({ team: t, weeks: byes });
    }
    // Sort games by week
    teams[t].games.sort((a, b) => a.week - b.week);
  }
  if (missingBye.length) console.log(`  ⚠ Teams with no bye: ${missingBye.join(', ')}`);
  if (multiBye.length) {
    console.log(`  ⚠ Teams with multiple missing weeks (schedule may be partial):`);
    multiBye.forEach(x => console.log(`    ${x.team}: ${x.weeks.join(', ')}`));
  }

  // Week index — for a "who plays whom this week" lookup
  const byWeek = {};
  for (const row of regRows) {
    const w = intOrNull(row.week);
    if (w == null) continue;
    if (!byWeek[w]) byWeek[w] = [];
    byWeek[w].push(compact(row, null));
  }
  // Sort each week's games by gameday then gametime for deterministic output
  for (const w of Object.keys(byWeek)) {
    byWeek[w].sort((a, b) => (a.gameday || '').localeCompare(b.gameday || '') || (a.gametime || '').localeCompare(b.gametime || ''));
  }

  // Bye-week index — teams grouped by their bye week (feeds stacked-bye checks)
  const byeByWeek = {};
  for (const t of ALL_TEAMS) {
    const w = teams[t].byeWeek;
    if (w == null) continue;
    if (!byeByWeek[w]) byeByWeek[w] = [];
    byeByWeek[w].push(t);
  }

  // Playoff-weeks slate (weeks 15–17 = fantasy playoffs)
  const playoffWeeks = [15, 16, 17].filter(w => weeks.includes(w));
  const playoffSlate = {};
  for (const t of ALL_TEAMS) {
    playoffSlate[t] = playoffWeeks.map(pw => {
      const g = teams[t].games.find(x => x.week === pw);
      if (!g) return { week: pw, bye: true };
      return {
        week: pw,
        opponent: g.opponent,
        isHome: g.isHome,
        roof: g.roof,
        surface: g.surface,
        stadium: g.stadium,
      };
    });
  }

  // Summary
  console.log('\nBye week distribution:');
  Object.keys(byeByWeek).sort((a, b) => a - b).forEach(w => {
    console.log(`  Week ${w}: ${byeByWeek[w].length} team(s) — ${byeByWeek[w].join(', ')}`);
  });

  const meta = {
    season: SEASON,
    regular_season_weeks: { min: minWeek, max: maxWeek, count: weeks.length },
    playoff_weeks: playoffWeeks,
    total_regular_games: regRows.length,
    total_postseason_games: postRows.length,
    source: 'nflverse (github.com/nflverse/nflverse-data — schedules release)',
    generated: new Date().toISOString(),
    notes: 'Bye = week within regular-season span with no scheduled game. LA normalized to LAR. Env fields (roof, surface, stadium) preserved for K/DEF environment model.',
  };

  const payload = { meta, teams, byWeek, byeByWeek, playoffSlate };

  const output = `// Auto-generated from nflverse schedules release (games.csv) — season ${SEASON}
// Generated: ${meta.generated}
// Source: ${meta.source}
// Do not edit manually — re-run: SEASON=${SEASON} node scripts/fetch-schedule.js

export const SCHEDULE_${SEASON} = ${JSON.stringify(payload, null, 2)};
`;

  fs.writeFileSync(OUT_PATH, output);
  console.log(`\nWrote ${OUT_PATH} (${(fs.statSync(OUT_PATH).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
