#!/usr/bin/env node
/**
 * fetch-referees.js
 *
 * Ingests the nflverse `officials` release — a single officials.csv with every
 * game-official assignment back to 2015. Derives per-referee career stats and
 * per-crew game logs so downstream code can answer "who's calling this game"
 * and "what does that ref's history look like" without editorial input.
 *
 * Output: src/data/intelligence/referee_appearances.json
 *
 * Usage:
 *   node scripts/fetch-referees.js
 *   MIN_SEASON=2021 node scripts/fetch-referees.js
 *
 * Note: this is RAW appearance data — penalty rate / DPI frequency tendencies
 * need a PBP join and belong in the Layer 2 reasoning workflow (or a
 * PBP-derived script). We surface the schedule metadata as a starting point.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchCSV } from './_lib/nflverse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://github.com/nflverse/nflverse-data/releases/download/officials/officials.csv';
const OUT = path.join(__dirname, '../src/data/intelligence/referee_appearances.json');
const MIN_SEASON = parseInt(process.env.MIN_SEASON || '2021', 10);

async function main() {
  console.log('DownfieldOS — Referees ingest');
  console.log('=============================\n');

  const rows = await fetchCSV(URL, 'officials');
  const filtered = rows.filter(r => parseInt(r.season, 10) >= MIN_SEASON);
  console.log(`  ${filtered.length.toLocaleString()} official-game assignments since ${MIN_SEASON}\n`);

  // Group by game_id → crew roster
  const games = new Map();
  for (const r of filtered) {
    if (!games.has(r.game_id)) {
      games.set(r.game_id, {
        game_id: r.game_id,
        season: parseInt(r.season, 10),
        week: parseInt(r.week, 10) || null,
        season_type: r.season_type || null,
        crew: [],
      });
    }
    games.get(r.game_id).crew.push({
      name: r.official_name,
      position: r.position,
      jersey: r.jersey_number,
      id: r.official_id,
    });
  }

  // Per-referee career index — only "Referee" position (the crew chief)
  const referees = new Map();
  for (const g of games.values()) {
    const chief = g.crew.find(m => (m.position || '').toLowerCase() === 'referee');
    if (!chief) continue;
    if (!referees.has(chief.name)) {
      referees.set(chief.name, {
        name: chief.name,
        id: chief.id,
        first_season: g.season,
        last_season: g.season,
        game_count: 0,
        seasons: {},
        games: [],
      });
    }
    const rec = referees.get(chief.name);
    rec.first_season = Math.min(rec.first_season, g.season);
    rec.last_season = Math.max(rec.last_season, g.season);
    rec.seasons[g.season] = (rec.seasons[g.season] || 0) + 1;
    rec.game_count++;
    rec.games.push({ game_id: g.game_id, season: g.season, week: g.week, season_type: g.season_type });
  }

  const refereeList = [...referees.values()]
    .filter(r => r.last_season >= MIN_SEASON)
    .sort((a, b) => (b.last_season - a.last_season) || (b.game_count - a.game_count));

  const payload = {
    meta: {
      source: 'nflverse (officials release)',
      generated: new Date().toISOString(),
      min_season: MIN_SEASON,
      games_covered: games.size,
      active_referees: refereeList.length,
      notes: 'Raw appearances only. Penalty tendencies (DPI rate, penalty yards, home/away skew) need a PBP join — belongs in a PBP-derived workflow or the Layer 2 reasoning brief.',
    },
    referees: refereeList,
    games: Object.fromEntries([...games.entries()].map(([k, v]) => [k, v])),
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload));

  console.log(`  ${refereeList.length} active referees across ${games.size} games`);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
