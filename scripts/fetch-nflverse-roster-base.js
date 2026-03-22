#!/usr/bin/env node
/**
 * fetch-nflverse-roster-base.js
 *
 * Fetches real NFL roster data from nflverse and generates rosters2025.js
 * with the app's roster format: { pos, name, grade, rating, trait }
 *
 * Output: src/data/rosters2025.js
 * Usage: node scripts/fetch-nflverse-roster-base.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROSTER_URL = 'https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_2025.csv';
const OUT_PATH = path.join(__dirname, '../src/data/rosters2025.js');

const TEAM_MAP = { OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', LA: 'LAR' };
function norm(t) { return TEAM_MAP[t?.trim()?.toUpperCase()] || t?.trim()?.toUpperCase() || ''; }

const ALL_TEAMS = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG',
  'NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS',
];

// Position mapping: nflverse depth_chart_position → app position group
const OFF_POSITIONS = {
  QB: 'QB', RB: 'RB', FB: 'RB', WR: 'WR', TE: 'TE',
  T: 'OL', G: 'OL', C: 'OL', OT: 'OL', OG: 'OL',
  LT: 'OL', LG: 'OL', RT: 'OL', RG: 'OL',
};
const DEF_POSITIONS = {
  DE: 'EDGE', OLB: 'EDGE', EDGE: 'EDGE',
  DT: 'DT', NT: 'DT', DL: 'DT',
  MLB: 'LB', ILB: 'LB', LB: 'LB',
  CB: 'CB', DB: 'CB',
  FS: 'FS', SS: 'SS', S: 'S',
};

// Trait assignment based on position and attributes
const TRAITS = {
  QB: ['Dual-Threat', 'Pocket Passer', 'Game Manager', 'Gunslinger'],
  RB: ['Between-the-Tackles', 'Pass-Catching', 'Home Run Hitter', 'Power Back'],
  WR: ['Deep Threat', 'Possession', 'Route Technician', 'YAC Monster', 'Contested Catch'],
  TE: ['Receiving TE', 'Blocking TE', 'Versatile'],
  OL: ['Pass Pro', 'Road Grader', 'Versatile'],
  EDGE: ['Speed Rusher', 'Power Rusher', 'Versatile'],
  DT: ['Interior Pressure', 'Run Stuffer', 'Versatile'],
  LB: ['Sideline-to-Sideline', 'Coverage LB', 'Run Stopper', 'Versatile'],
  CB: ['Press-Man', 'Zone Corner', 'Slot Corner', 'Ball Hawk'],
  S: ['Enforcer', 'Ball Hawk', 'Coverage Safety', 'Versatile'],
};

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
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

function calcRating(player) {
  const exp = parseInt(player.years_exp) || 0;
  const pos = player.depth_chart_position || player.position;

  // Base rating from experience curve (peaks years 4-8)
  let base;
  if (exp <= 0) base = 68;
  else if (exp === 1) base = 72;
  else if (exp === 2) base = 75;
  else if (exp <= 4) base = 78;
  else if (exp <= 8) base = 80;
  else if (exp <= 12) base = 78;
  else base = 74;

  // QB/WR/EDGE/CB get slight bump (premium positions)
  if (['QB', 'WR', 'DE', 'OLB', 'EDGE', 'CB'].includes(pos)) base += 2;

  // Clamp to 65-92 range (Elite players get manual overrides in faMoves)
  return Math.max(65, Math.min(92, base));
}

function gradeFromRating(r) {
  if (r >= 88) return 'Elite';
  if (r >= 78) return 'Above Avg';
  if (r >= 70) return 'Average';
  return 'Below Avg';
}

function assignTrait(posGroup, seed) {
  const options = TRAITS[posGroup] || TRAITS.OL;
  return options[seed % options.length];
}

async function main() {
  console.log('Fetching 2025 nflverse roster data...');
  const resp = await fetch(ROSTER_URL);
  if (!resp.ok) throw new Error(`Failed: ${resp.status}`);
  const text = await resp.text();

  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0]);
  const players = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });

    // Only active players on the 53-man roster
    if (row.status !== 'ACT') continue;
    const team = norm(row.team);
    if (!ALL_TEAMS.includes(team)) continue;

    // Skip special teams
    const pos = row.position;
    if (['K', 'P', 'LS'].includes(pos)) continue;

    players.push({ ...row, team });
  }

  console.log(`Parsed ${players.length} active players across ${ALL_TEAMS.length} teams`);

  // Build rosters per team
  const rosters = {};

  ALL_TEAMS.forEach(team => {
    const teamPlayers = players.filter(p => p.team === team);
    const offense = [];
    const defense = [];

    // Group by position type
    const offPlayers = teamPlayers.filter(p => OFF_POSITIONS[p.depth_chart_position] || OFF_POSITIONS[p.position]);
    const defPlayers = teamPlayers.filter(p => DEF_POSITIONS[p.depth_chart_position] || DEF_POSITIONS[p.position]);

    // === OFFENSE ===
    // QB — prefer mid-career starters (2-6 yrs) over journeyman backups (7+) and raw rookies (0)
    const qbs = offPlayers.filter(p => (p.depth_chart_position || p.position) === 'QB').sort((a, b) => {
      const ea = parseInt(a.years_exp) || 0, eb = parseInt(b.years_exp) || 0;
      // Score: 2-6 years = best (starter window), 1 = good (drafted starter), 7+ = likely backup, 0 = UDFA
      const scoreA = ea >= 2 && ea <= 6 ? 100 : ea === 1 ? 90 : ea >= 7 ? 50 - ea : 40;
      const scoreB = eb >= 2 && eb <= 6 ? 100 : eb === 1 ? 90 : eb >= 7 ? 50 - eb : 40;
      return scoreB - scoreA;
    });
    if (qbs[0]) {
      const r = calcRating(qbs[0]);
      offense.push({ pos: 'QB', name: qbs[0].full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('QB', qbs[0].full_name.length) });
    }

    // RBs
    const rbs = offPlayers.filter(p => ['RB', 'FB'].includes(p.depth_chart_position || p.position)).sort((a, b) => (parseInt(b.years_exp) || 0) - (parseInt(a.years_exp) || 0));
    rbs.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p);
      offense.push({ pos: `RB${i + 1}`, name: p.full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('RB', p.full_name.length + i) });
    });

    // WRs
    const wrs = offPlayers.filter(p => (p.depth_chart_position || p.position) === 'WR').sort((a, b) => (parseInt(b.years_exp) || 0) - (parseInt(a.years_exp) || 0));
    wrs.slice(0, 3).forEach((p, i) => {
      const r = calcRating(p);
      offense.push({ pos: `WR${i + 1}`, name: p.full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('WR', p.full_name.length + i) });
    });

    // TE
    const tes = offPlayers.filter(p => (p.depth_chart_position || p.position) === 'TE').sort((a, b) => (parseInt(b.years_exp) || 0) - (parseInt(a.years_exp) || 0));
    if (tes[0]) {
      const r = calcRating(tes[0]);
      offense.push({ pos: 'TE', name: tes[0].full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('TE', tes[0].full_name.length) });
    }

    // OL — map to LT, LG, C, RG, RT
    const olPositions = ['LT', 'LG', 'C', 'RG', 'RT'];
    const olPlayers = offPlayers.filter(p => {
      const dcp = p.depth_chart_position || '';
      const pos = p.position || '';
      return ['T', 'G', 'C', 'OT', 'OG', 'LT', 'LG', 'RT', 'RG'].includes(dcp) || pos === 'OL';
    }).sort((a, b) => (parseInt(b.years_exp) || 0) - (parseInt(a.years_exp) || 0));

    olPositions.forEach((olPos, i) => {
      const p = olPlayers[i];
      if (p) {
        const r = calcRating(p);
        offense.push({ pos: olPos, name: p.full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('OL', p.full_name.length + i) });
      }
    });

    // === DEFENSE ===
    // EDGE
    const edges = defPlayers.filter(p => ['DE', 'OLB', 'EDGE'].includes(p.depth_chart_position || p.position)).sort((a, b) => (parseInt(b.years_exp) || 0) - (parseInt(a.years_exp) || 0));
    edges.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p);
      defense.push({ pos: `EDGE${i + 1}`, name: p.full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('EDGE', p.full_name.length + i) });
    });

    // DT
    const dts = defPlayers.filter(p => ['DT', 'NT', 'DL'].includes(p.depth_chart_position || p.position)).sort((a, b) => (parseInt(b.years_exp) || 0) - (parseInt(a.years_exp) || 0));
    if (dts[0]) {
      const r = calcRating(dts[0]);
      defense.push({ pos: 'DT', name: dts[0].full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('DT', dts[0].full_name.length) });
    }

    // LB
    const lbs = defPlayers.filter(p => ['MLB', 'ILB', 'LB'].includes(p.depth_chart_position || p.position)).sort((a, b) => (parseInt(b.years_exp) || 0) - (parseInt(a.years_exp) || 0));
    lbs.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p);
      defense.push({ pos: `LB${i + 1}`, name: p.full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('LB', p.full_name.length + i) });
    });

    // CB
    const cbs = defPlayers.filter(p => ['CB', 'DB'].includes(p.depth_chart_position || p.position)).sort((a, b) => (parseInt(b.years_exp) || 0) - (parseInt(a.years_exp) || 0));
    cbs.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p);
      defense.push({ pos: `CB${i + 1}`, name: p.full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('CB', p.full_name.length + i) });
    });
    // SCB (slot corner) — 3rd CB
    if (cbs[2]) {
      const r = calcRating(cbs[2]);
      defense.push({ pos: 'SCB', name: cbs[2].full_name, grade: gradeFromRating(r), rating: r, trait: 'Slot Corner' });
    }

    // Safeties
    const safeties = defPlayers.filter(p => ['FS', 'SS', 'S'].includes(p.depth_chart_position || p.position)).sort((a, b) => (parseInt(b.years_exp) || 0) - (parseInt(a.years_exp) || 0));
    if (safeties[0]) {
      const r = calcRating(safeties[0]);
      defense.push({ pos: 'FS', name: safeties[0].full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('S', safeties[0].full_name.length) });
    }
    if (safeties[1]) {
      const r = calcRating(safeties[1]);
      defense.push({ pos: 'SS', name: safeties[1].full_name, grade: gradeFromRating(r), rating: r, trait: assignTrait('S', safeties[1].full_name.length + 1) });
    }

    rosters[team] = { offense, defense };
  });

  // Write output
  const output = `// Auto-generated from nflverse 2025 roster data
// Generated: ${new Date().toISOString()}
// Source: ${ROSTER_URL}
// Do not edit manually — re-run: node scripts/fetch-nflverse-roster-base.js

export const ROSTERS_2025 = ${JSON.stringify(rosters, null, 2)};
`;

  fs.writeFileSync(OUT_PATH, output);
  console.log(`\nWrote ${OUT_PATH}`);

  // Summary
  ALL_TEAMS.forEach(t => {
    const r = rosters[t];
    const qb = r.offense.find(p => p.pos === 'QB');
    console.log(`  ${t}: ${r.offense.length}O + ${r.defense.length}D — QB: ${qb?.name || 'MISSING'}`);
  });
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
