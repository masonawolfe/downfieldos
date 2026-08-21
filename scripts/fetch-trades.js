#!/usr/bin/env node
/**
 * fetch-trades.js
 *
 * Ingests the nflverse `trades` release — one CSV covering every trade back
 * to 2002. Each trade has two rows (one per team's give/receive), joined by
 * trade_id. This scraper collapses those into single-record trades.
 *
 * Output: src/data/intelligence/trades.json
 *
 * Usage:
 *   node scripts/fetch-trades.js
 *   MIN_SEASON=2024 node scripts/fetch-trades.js
 *
 * Note: nflverse only tracks player/pick trades. Free-agent signings, waivers,
 * IR moves, and cuts are NOT here — those need a separate wire scraper.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchCSV, normTeam } from './_lib/nflverse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://github.com/nflverse/nflverse-data/releases/download/trades/trades.csv';
const OUT = path.join(__dirname, '../src/data/intelligence/trades.json');
const MIN_SEASON = parseInt(process.env.MIN_SEASON || '2024', 10);

async function main() {
  console.log('DownfieldOS — Trades ingest');
  console.log('===========================\n');

  const rows = await fetchCSV(URL, 'trades');
  console.log(`  ${rows.length.toLocaleString()} raw trade rows (2-per-trade)\n`);

  // Group half-rows by trade_id
  const byId = new Map();
  for (const r of rows) {
    const season = parseInt(r.season, 10);
    if (!Number.isFinite(season) || season < MIN_SEASON) continue;
    const gave = normTeam(r.gave);
    const received = normTeam(r.received);
    const asset = r.pfr_id
      ? { type: 'player', name: r.pfr_name || null, pfr_id: r.pfr_id }
      : {
          type: 'pick',
          pick_season: parseInt(r.pick_season, 10) || null,
          pick_round: parseInt(r.pick_round, 10) || null,
          pick_number: parseInt(r.pick_number, 10) || null,
          conditional: r.conditional === '1' || r.conditional === 'TRUE',
        };
    if (!byId.has(r.trade_id)) {
      byId.set(r.trade_id, {
        trade_id: r.trade_id,
        season,
        trade_date: r.trade_date || null,
        teams: new Set(),
        movements: [],
      });
    }
    const t = byId.get(r.trade_id);
    t.teams.add(gave);
    t.teams.add(received);
    t.movements.push({ from: gave, to: received, ...asset });
  }

  const trades = [...byId.values()]
    .map(t => ({ ...t, teams: [...t.teams].sort() }))
    .sort((a, b) => (b.trade_date || '').localeCompare(a.trade_date || ''));

  // Team index — every team in a trade, mapped to the trade IDs it participated in
  const byTeam = {};
  for (const t of trades) {
    for (const team of t.teams) {
      if (!byTeam[team]) byTeam[team] = [];
      byTeam[team].push(t.trade_id);
    }
  }

  const payload = {
    meta: {
      source: 'nflverse (trades release)',
      generated: new Date().toISOString(),
      min_season: MIN_SEASON,
      total_trades: trades.length,
      notes: 'Player and pick trades only. Free-agent signings, waivers, IR, and cuts are not tracked here.',
    },
    trades,
    byTeam,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload));

  const bySeason = {};
  trades.forEach(t => { bySeason[t.season] = (bySeason[t.season] || 0) + 1; });
  Object.keys(bySeason).sort().forEach(y => console.log(`  ${y}: ${bySeason[y]} trades`));
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
