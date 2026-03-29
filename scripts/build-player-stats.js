#!/usr/bin/env node
/**
 * build-player-stats.js
 *
 * Aggregates per-player stats from nflverse play-by-play CSVs.
 * Produces src/data/playerStats2025.js with position-specific stat lines.
 *
 * QB: comp%, yards, TD, INT, EPA/play, sack rate
 * WR/TE: targets, receptions, yards, TDs, YPR
 * RB: carries, yards, YPC, receiving yards, total TDs
 * DEF: tackles, sacks, INTs, PD (from player_stats CSV)
 *
 * Usage: node scripts/build-player-stats.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEASON = 2025;
const PBP_URL = `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${SEASON}.csv`;
const PLAYER_STATS_URL = `https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_${SEASON}.csv`;

const TEAM_MAP = {
  OAK: 'LV', STL: 'LAR', LA: 'LAR', SD: 'LAC', WSH: 'WAS',
};
function normalizeTeam(code) {
  if (!code) return '';
  const upper = code.trim().toUpperCase();
  return TEAM_MAP[upper] || upper;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
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

async function fetchCSV(url, label) {
  console.log(`Fetching ${label}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${label}: ${res.status}`);
  const text = await res.text();
  console.log(`  ${(text.length / 1024 / 1024).toFixed(1)}MB downloaded`);
  return text;
}

function parseCSVToRows(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

async function main() {
  console.log(`\nBuilding player stats for ${SEASON}\n`);

  // Try player_stats CSV first (pre-aggregated by nflverse)
  let usePlayerStats = false;
  let playerStatsRows = [];

  try {
    const csv = await fetchCSV(PLAYER_STATS_URL, 'player_stats');
    playerStatsRows = parseCSVToRows(csv);
    usePlayerStats = playerStatsRows.length > 100;
    console.log(`  ${playerStatsRows.length} player stat rows parsed\n`);
  } catch (e) {
    console.log(`  player_stats not available (${e.message}), falling back to PBP aggregation\n`);
  }

  const stats = {};

  if (usePlayerStats) {
    // nflverse player_stats has pre-aggregated season stats
    for (const r of playerStatsRows) {
      const name = r.player_display_name || r.player_name || '';
      const team = normalizeTeam(r.recent_team || r.team);
      const pos = (r.position || '').toUpperCase();
      if (!name || !team || !pos) continue;

      const key = `${name}_${team}`;

      if (pos === 'QB') {
        stats[key] = {
          name, team, pos,
          games: int(r.games) || int(r.g),
          completions: int(r.completions),
          attempts: int(r.attempts),
          passing_yards: int(r.passing_yards),
          passing_tds: int(r.passing_tds),
          interceptions: int(r.interceptions),
          sacks: int(r.sacks),
          comp_pct: pct(r.completions, r.attempts),
          rushing_yards: int(r.rushing_yards),
          rushing_tds: int(r.rushing_tds),
          epa_per_play: parseFloat(r.passing_epa) || 0,
        };
      } else if (pos === 'WR' || pos === 'TE') {
        stats[key] = {
          name, team, pos,
          games: int(r.games) || int(r.g),
          targets: int(r.targets),
          receptions: int(r.receptions),
          receiving_yards: int(r.receiving_yards),
          receiving_tds: int(r.receiving_tds),
          ypr: div(r.receiving_yards, r.receptions),
        };
      } else if (pos === 'RB') {
        stats[key] = {
          name, team, pos,
          games: int(r.games) || int(r.g),
          carries: int(r.carries) || int(r.rushing_attempts),
          rushing_yards: int(r.rushing_yards),
          rushing_tds: int(r.rushing_tds),
          ypc: div(r.rushing_yards, r.carries || r.rushing_attempts),
          targets: int(r.targets),
          receptions: int(r.receptions),
          receiving_yards: int(r.receiving_yards),
          receiving_tds: int(r.receiving_tds),
        };
      } else if (['LB', 'CB', 'S', 'SS', 'FS', 'DT', 'DE', 'EDGE', 'ILB', 'OLB', 'MLB', 'NT', 'DB'].includes(pos)) {
        // Defensive stats may not be in player_stats, skip for now
        // They'll be added from a different source if available
      }
    }
  }

  if (!usePlayerStats) {
    // Fallback: aggregate from PBP
    console.log('Aggregating from PBP data...');
    const csv = await fetchCSV(PBP_URL, 'play-by-play');
    const rows = parseCSVToRows(csv);
    console.log(`  ${rows.length} plays to process\n`);

    const qbs = {};
    const receivers = {};
    const rushers = {};

    for (const r of rows) {
      const playType = (r.play_type || '').toLowerCase();
      if (playType !== 'pass' && playType !== 'run') continue;

      const off = normalizeTeam(r.posteam);
      if (!off) continue;

      if (playType === 'pass') {
        const qb = r.passer_player_name || '';
        if (qb) {
          if (!qbs[qb]) qbs[qb] = { name: qb, team: off, att: 0, comp: 0, yds: 0, td: 0, int: 0, sacks: 0, epa: 0, plays: 0 };
          qbs[qb].att++;
          qbs[qb].plays++;
          if (r.complete_pass === '1') { qbs[qb].comp++; qbs[qb].yds += int(r.yards_gained); }
          if (r.pass_touchdown === '1') qbs[qb].td++;
          if (r.interception === '1') qbs[qb].int++;
          if (r.sack === '1') qbs[qb].sacks++;
          qbs[qb].epa += parseFloat(r.epa) || 0;
        }

        const rec = r.receiver_player_name || '';
        if (rec) {
          if (!receivers[rec]) receivers[rec] = { name: rec, team: off, tgt: 0, rec: 0, yds: 0, td: 0 };
          receivers[rec].tgt++;
          if (r.complete_pass === '1') { receivers[rec].rec++; receivers[rec].yds += int(r.yards_gained); }
          if (r.pass_touchdown === '1') receivers[rec].td++;
        }
      }

      if (playType === 'run') {
        const rb = r.rusher_player_name || '';
        if (rb) {
          if (!rushers[rb]) rushers[rb] = { name: rb, team: off, car: 0, yds: 0, td: 0 };
          rushers[rb].car++;
          rushers[rb].yds += int(r.yards_gained);
          if (r.rush_touchdown === '1') rushers[rb].td++;
        }
      }
    }

    // Track which abbreviated names are QBs (they also appear as rushers)
    const qbNames = new Set(Object.keys(qbs).filter(n => qbs[n].att >= 10));

    // Convert to stats format — QBs first (include their rushing stats)
    for (const [, q] of Object.entries(qbs)) {
      if (q.att < 10) continue; // skip trick plays / emergency QBs
      const key = `${q.name}_${q.team}`;
      const rush = rushers[q.name] || {};
      stats[key] = {
        name: q.name, team: q.team, pos: 'QB',
        completions: q.comp, attempts: q.att,
        passing_yards: q.yds, passing_tds: q.td,
        interceptions: q.int, sacks: q.sacks,
        comp_pct: q.att > 0 ? Math.round(q.comp / q.att * 1000) / 10 : 0,
        epa_per_play: q.plays > 0 ? Math.round(q.epa / q.plays * 100) / 100 : 0,
        rushing_yards: rush.yds || 0,
        rushing_tds: rush.td || 0,
      };
    }
    for (const [, r] of Object.entries(receivers)) {
      if (r.tgt < 5) continue; // skip players with negligible targets
      const key = `${r.name}_${r.team}`;
      stats[key] = {
        name: r.name, team: r.team, pos: 'WR',
        targets: r.tgt, receptions: r.rec,
        receiving_yards: r.yds, receiving_tds: r.td,
        ypr: r.rec > 0 ? Math.round(r.yds / r.rec * 10) / 10 : 0,
      };
    }
    for (const [, r] of Object.entries(rushers)) {
      if (qbNames.has(r.name)) continue; // skip QBs (already included above)
      if (r.car < 5) continue; // skip minimal usage
      const key = `${r.name}_${r.team}`;
      if (stats[key]) continue; // skip if already added as WR (dual-role)
      stats[key] = {
        name: r.name, team: r.team, pos: 'RB',
        carries: r.car, rushing_yards: r.yds, rushing_tds: r.td,
        ypc: r.car > 0 ? Math.round(r.yds / r.car * 10) / 10 : 0,
      };
    }
  }

  // Write output
  const entries = Object.values(stats);
  const outPath = path.join(__dirname, '../src/data/playerStats2025.js');

  const output = `/**
 * Player Stats — ${SEASON} Season
 * Auto-generated by scripts/build-player-stats.js from nflverse data.
 * ${entries.length} players | Generated: ${new Date().toISOString().split('T')[0]}
 */
export const PLAYER_STATS_2025 = ${JSON.stringify(entries, null, 2)};
`;

  fs.writeFileSync(outPath, output);
  console.log(`\n✅ Wrote ${entries.length} player stats to ${outPath}`);

  // Summary
  const qbCount = entries.filter(e => e.pos === 'QB').length;
  const wrCount = entries.filter(e => e.pos === 'WR' || e.pos === 'TE').length;
  const rbCount = entries.filter(e => e.pos === 'RB').length;
  console.log(`   QBs: ${qbCount} | WR/TE: ${wrCount} | RB: ${rbCount}`);
}

function int(v) { return parseInt(v) || 0; }
function pct(num, den) { const n = int(num), d = int(den); return d > 0 ? Math.round(n / d * 1000) / 10 : 0; }
function div(num, den) { const n = int(num), d = int(den); return d > 0 ? Math.round(n / d * 10) / 10 : 0; }

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
