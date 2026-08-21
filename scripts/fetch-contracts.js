#!/usr/bin/env node
/**
 * fetch-contracts.js
 *
 * Ingests the nflverse `contracts` release — Over-the-Cap historical contract
 * data, packaged as historical_contracts.csv.gz. One row per contract in a
 * player's career. Latest active row per player = their current deal.
 *
 * Output: src/data/intelligence/contracts.json
 *
 * Usage:
 *   node scripts/fetch-contracts.js
 *   SEASON=2026 node scripts/fetch-contracts.js  (default; contract_year_players
 *                                                  are those whose deal ends
 *                                                  after this season)
 *
 * This is the raw OTC layer. The editorial contract_year_players.json (with
 * narrative context per player) is a separate, curated file — this scraper
 * produces the numeric ground truth it should be reconciled against.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchGzippedCSV, normTeam, num, int } from './_lib/nflverse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://github.com/nflverse/nflverse-data/releases/download/contracts/historical_contracts.csv.gz';
const OUT = path.join(__dirname, '../src/data/intelligence/contracts.json');
const CONTRACT_SEASON = parseInt(process.env.SEASON || '2026', 10);

// OTC data uses team nicknames ("Bears"), not abbreviations. Multi-team seasons
// are slash-joined ("PHI/JAX") with the latest team last.
const NICK_TO_ABBR = {
  Cardinals: 'ARI', Falcons: 'ATL', Ravens: 'BAL', Bills: 'BUF', Panthers: 'CAR',
  Bears: 'CHI', Bengals: 'CIN', Browns: 'CLE', Cowboys: 'DAL', Broncos: 'DEN',
  Lions: 'DET', Packers: 'GB', Texans: 'HOU', Colts: 'IND', Jaguars: 'JAX',
  Chiefs: 'KC', Chargers: 'LAC', Rams: 'LAR', Raiders: 'LV', Dolphins: 'MIA',
  Vikings: 'MIN', Patriots: 'NE', Saints: 'NO', Giants: 'NYG', Jets: 'NYJ',
  Eagles: 'PHI', Steelers: 'PIT', Seahawks: 'SEA', '49ers': 'SF', Buccaneers: 'TB',
  Titans: 'TEN', Commanders: 'WAS',
};

function contractsTeamCode(raw) {
  if (!raw) return null;
  // "PHI/JAX" → take the last segment (latest team). Handle both nicks and abbrs.
  const last = raw.split('/').pop().trim();
  return NICK_TO_ABBR[last] || normTeam(last);
}

async function main() {
  console.log('DownfieldOS — Contracts ingest');
  console.log('==============================\n');

  const rows = await fetchGzippedCSV(URL, 'historical_contracts');
  console.log(`  ${rows.length.toLocaleString()} historical contract rows\n`);

  // OTC's `is_active` flag is source-of-truth for "current deal per player".
  // The nflverse snapshot is stale (last is_active refresh has newest deal
  // signed 2022) — capture the freshness signal for the metadata.
  const activeRows = rows.filter(r => r.is_active === 'TRUE');
  const latestSignedYear = Math.max(...activeRows
    .map(r => int(r.year_signed))
    .filter(y => y != null));

  const active = activeRows.map(r => {
    const yearSigned = int(r.year_signed);
    const years = int(r.years);
    const yearEnd = yearSigned != null && years != null ? yearSigned + years - 1 : null;
    return {
      name: r.player || null,
      team: contractsTeamCode(r.team),
      position: r.position || null,
      otc_id: r.otc_id || null,
      year_signed: yearSigned,
      years,
      year_end: yearEnd,
      value: num(r.value),                          // total contract value
      apy: num(r.apy),                              // average per year
      apy_cap_pct: num(r.apy_cap_pct),
      guaranteed: num(r.guaranteed),
      inflated_value: num(r.inflated_value),
      inflated_apy: num(r.inflated_apy),
      inflated_guaranteed: num(r.inflated_guaranteed),
      draft_year: int(r.draft_year),
      draft_round: int(r.draft_round),
      draft_overall: int(r.draft_overall),
      // Contract-year = deal ends after CONTRACT_SEASON (deal covers CONTRACT_SEASON only)
      is_contract_year: yearEnd != null && yearEnd === CONTRACT_SEASON,
    };
  });
  const contractYear = active.filter(p => p.is_contract_year);

  // By-team breakdowns
  const byTeam = {};
  for (const p of active) {
    if (!p.team) continue;
    if (!byTeam[p.team]) byTeam[p.team] = { players: [], top_apy: null };
    byTeam[p.team].players.push(p);
  }
  Object.values(byTeam).forEach(t => {
    t.players.sort((a, b) => (b.apy || 0) - (a.apy || 0));
    t.top_apy = t.players[0]?.apy || null;
  });

  const staleness = CONTRACT_SEASON - latestSignedYear;
  const payload = {
    meta: {
      source: 'nflverse (contracts release, OTC historical)',
      generated: new Date().toISOString(),
      contract_season: CONTRACT_SEASON,
      historical_rows: rows.length,
      active_contracts: active.length,
      contract_year_count: contractYear.length,
      latest_active_year_signed: latestSignedYear,
      staleness_years: staleness,
      is_stale: staleness > 1,
      notes: [
        'apy = average annual value. inflated_* fields normalize against cap growth.',
        'contract_year = deal ends after the target season.',
        `Freshness: OTC snapshot last captured active deals signed in ${latestSignedYear}.`,
        staleness > 1
          ? `STALE — ${staleness} years behind. Deals signed after ${latestSignedYear} are not represented; a player who signed an extension after that will still be listed under their prior deal. Consider an OTC direct scrape for current data.`
          : 'Data is current within tolerance.',
      ].join(' '),
    },
    active,
    contract_year: contractYear.sort((a, b) => (b.apy || 0) - (a.apy || 0)),
    byTeam,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload));

  console.log(`  ${active.length} active contracts, ${contractYear.length} contract-year players`);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
