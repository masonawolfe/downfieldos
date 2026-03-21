#!/usr/bin/env node
/**
 * build-rosters-2025.js
 *
 * Fetches 2025 NFL roster data from nflverse, builds rosters2025.js
 * with real player names, positions, and experience-based ratings.
 *
 * Usage: node scripts/build-rosters-2025.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROSTER_URL = 'https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_2025.csv';
const OUT_PATH = path.join(__dirname, '../src/data/rosters2025.js');

const ALL_TEAMS = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG',
  'NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS',
];

const TEAM_MAP = { OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS' };

// Manual overrides for star players — draft capital + experience doesn't capture actual performance
const STAR_OVERRIDES = {
  'Josh Allen': { rating: 96, grade: 'Elite', trait: 'Gunslinger' },
  'Patrick Mahomes': { rating: 97, grade: 'Elite', trait: 'Gunslinger' },
  'Lamar Jackson': { rating: 95, grade: 'Elite', trait: 'Dual-Threat' },
  'Joe Burrow': { rating: 93, grade: 'Elite', trait: 'Pocket Passer' },
  'Jalen Hurts': { rating: 88, grade: 'Elite', trait: 'Dual-Threat' },
  'Caleb Williams': { rating: 82, grade: 'Above Avg', trait: 'Dual-Threat' },
  'Trevor Lawrence': { rating: 86, grade: 'Above Avg', trait: 'Pocket Passer' },
  'CJ Stroud': { rating: 90, grade: 'Elite', trait: 'Pocket Passer' },
  'Jayden Daniels': { rating: 87, grade: 'Above Avg', trait: 'Dual-Threat' },
  'Bo Nix': { rating: 84, grade: 'Above Avg', trait: 'Dual-Threat' },
  'Drake Maye': { rating: 82, grade: 'Above Avg', trait: 'Dual-Threat' },
  'Saquon Barkley': { rating: 96, grade: 'Elite', trait: 'Home Run Hitter' },
  'Derrick Henry': { rating: 90, grade: 'Elite', trait: 'Between-the-Tackles' },
  'Bijan Robinson': { rating: 92, grade: 'Elite', trait: 'Home Run Hitter' },
  'Jahmyr Gibbs': { rating: 88, grade: 'Elite', trait: 'Home Run Hitter' },
  "Ja'Marr Chase": { rating: 96, grade: 'Elite', trait: 'Route Technician' },
  'CeeDee Lamb': { rating: 94, grade: 'Elite', trait: 'Route Technician' },
  'Tyreek Hill': { rating: 93, grade: 'Elite', trait: 'Deep Threat' },
  'AJ Brown': { rating: 92, grade: 'Elite', trait: 'YAC Monster' },
  'Amon-Ra St. Brown': { rating: 91, grade: 'Elite', trait: 'Possession' },
  'Travis Kelce': { rating: 90, grade: 'Elite', trait: 'Receiving TE' },
  'George Kittle': { rating: 88, grade: 'Elite', trait: 'Receiving TE' },
  'Trent Williams': { rating: 96, grade: 'Elite', trait: 'Pass Pro' },
  'Penei Sewell': { rating: 94, grade: 'Elite', trait: 'Pass Pro' },
  'Myles Garrett': { rating: 96, grade: 'Elite', trait: 'Speed Rusher' },
  'Micah Parsons': { rating: 95, grade: 'Elite', trait: 'Speed Rusher' },
  'TJ Watt': { rating: 94, grade: 'Elite', trait: 'Power Rusher' },
  'Chris Jones': { rating: 93, grade: 'Elite', trait: 'Interior Pressure' },
  'Jalen Ramsey': { rating: 90, grade: 'Elite', trait: 'Press-Man' },
  'Sauce Gardner': { rating: 92, grade: 'Elite', trait: 'Press-Man' },
  'Patrick Surtain II': { rating: 91, grade: 'Elite', trait: 'Press-Man' },
  'Budda Baker': { rating: 92, grade: 'Elite', trait: 'Ball Hawk' },
  'Justin Jefferson': { rating: 96, grade: 'Elite', trait: 'Route Technician' },
  'Davante Adams': { rating: 90, grade: 'Elite', trait: 'Route Technician' },
  'Nick Bosa': { rating: 94, grade: 'Elite', trait: 'Speed Rusher' },
  'Maxx Crosby': { rating: 93, grade: 'Elite', trait: 'Speed Rusher' },
  'Fred Warner': { rating: 92, grade: 'Elite', trait: 'Coverage LB' },
  'Roquan Smith': { rating: 91, grade: 'Elite', trait: 'Sideline-to-Sideline' },
  'Montez Sweat': { rating: 86, grade: 'Above Avg', trait: 'Speed Rusher' },
  'DJ Moore': { rating: 82, grade: 'Above Avg', trait: 'YAC Monster' },
  'Travis Hunter': { rating: 85, grade: 'Above Avg', trait: 'Two-Way Star' },
  'Mitchell Trubisky': { rating: 68, grade: 'Average', trait: 'Game Manager' },
  'Sam Darnold': { rating: 76, grade: 'Above Avg', trait: 'Pocket Passer' },
  'Daniel Jones': { rating: 74, grade: 'Average', trait: 'Pocket Passer' },
};

function parseCSV(text) {
  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

function parseCSVLine(line) {
  const result = []; let current = ''; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (inQuotes && line[i+1] === '"') { current += '"'; i++; } else inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else current += ch;
  }
  result.push(current.trim());
  return result;
}

// Rating based on experience + draft position + status (with star overrides)
function estimateRating(player) {
  const override = STAR_OVERRIDES[player.full_name];
  if (override) return override.rating;
  const exp = parseInt(player.years_exp) || 0;
  const draftNum = parseInt(player.draft_number) || 300;
  const status = player.status || '';

  // Base rating from draft capital
  let rating;
  if (draftNum <= 3) rating = 86;
  else if (draftNum <= 10) rating = 82;
  else if (draftNum <= 20) rating = 79;
  else if (draftNum <= 32) rating = 76;
  else if (draftNum <= 64) rating = 73;
  else if (draftNum <= 100) rating = 70;
  else if (draftNum <= 180) rating = 67;
  else if (draftNum <= 260) rating = 65;
  else rating = 63; // UDFA

  // Experience bonus (peaks around year 4-8, bigger spread)
  if (exp >= 2 && exp <= 3) rating += 3;
  else if (exp >= 4 && exp <= 6) rating += 6;
  else if (exp >= 7 && exp <= 9) rating += 5;
  else if (exp >= 10 && exp <= 12) rating += 3;
  else if (exp >= 13) rating += 1;

  // Status adjustments
  if (status === 'ACT') rating += 1;
  if (status === 'RES' || status === 'PUP' || status === 'NFI') rating -= 3;
  if (status === 'DEV' || status === 'EXE') rating -= 5;

  return Math.min(96, Math.max(58, rating));
}

function gradeFromRating(r) {
  if (r >= 88) return 'Elite';
  if (r >= 78) return 'Above Avg';
  if (r >= 68) return 'Average';
  return 'Below Avg';
}

function traitFromPosition(pos, draftNum) {
  const traits = {
    QB: ['Gunslinger', 'Game Manager', 'Dual-Threat', 'Pocket Passer'],
    RB: ['Home Run Hitter', 'Between-the-Tackles', 'Change-of-Pace', 'Pass-Catching'],
    WR: ['Deep Threat', 'YAC Monster', 'Route Technician', 'Possession', 'Contested Catch', 'Slot'],
    TE: ['Receiving TE', 'Blocking TE', 'Move TE', 'Hybrid'],
    OT: ['Pass Pro', 'Road Grader', 'Versatile'],
    OG: ['Run Blocking', 'Pass Pro', 'Versatile'],
    C: ['Anchor', 'Zone Blocker', 'Versatile'],
    EDGE: ['Speed Rusher', 'Power Rusher', 'Versatile'],
    DT: ['Run Stuffer', 'Interior Pressure', 'Nose Tackle'],
    LB: ['Sideline-to-Sideline', 'Coverage LB', 'Run Stuffer', 'Blitzer'],
    CB: ['Press-Man', 'Zone Corner', 'Slot Corner', 'Ball Hawk'],
    S: ['Ball Hawk', 'Box Safety', 'Coverage Safety', 'Hybrid'],
    K: ['Accuracy', 'Leg Strength'],
    P: ['Directional', 'Hangtime'],
  };
  const basePos = pos.replace(/[0-9]/g, '');
  const options = traits[basePos] || ['Versatile'];
  // Use draft number as seed for deterministic trait
  return options[(draftNum || 0) % options.length];
}

// Map nflverse positions to our position slots
const OFF_SLOTS = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'WR3', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'];
const DEF_SLOTS = ['EDGE1', 'EDGE2', 'DT1', 'DT2', 'LB1', 'LB2', 'CB1', 'CB2', 'SCB', 'FS', 'SS'];

const POS_MAP_OFF = {
  QB: 'QB', HB: 'RB', RB: 'RB', FB: 'RB',
  WR: 'WR', TE: 'TE',
  T: 'OT', OT: 'OT', LT: 'OT', RT: 'OT',
  G: 'OG', OG: 'OG', LG: 'OG', RG: 'OG',
  C: 'C', OL: 'OG',
};

const POS_MAP_DEF = {
  DE: 'EDGE', OLB: 'EDGE', EDGE: 'EDGE',
  DT: 'DT', NT: 'DT', DL: 'DT',
  MLB: 'LB', ILB: 'LB', LB: 'LB',
  CB: 'CB', DB: 'CB',
  SS: 'SS', FS: 'FS', S: 'S', SAF: 'S',
};

async function main() {
  console.log('Fetching 2025 roster data from nflverse...');
  const resp = await fetch(ROSTER_URL, { headers: { 'User-Agent': 'DownfieldOS/1.0' }, redirect: 'follow' });
  if (!resp.ok) { console.error(`HTTP ${resp.status}`); process.exit(1); }
  const text = await resp.text();
  const rows = parseCSV(text);
  console.log(`Fetched ${rows.length} roster entries`);

  // Filter to active/reserve players on real teams
  const validStatuses = new Set(['ACT', 'RES', 'PUP', 'NFI', 'SUS', 'EXE', 'UDF', 'DEV', '']);
  const players = rows.filter(r => {
    const team = TEAM_MAP[r.team?.toUpperCase()] || r.team?.toUpperCase();
    return ALL_TEAMS.includes(team) && r.full_name;
  });

  console.log(`Valid players: ${players.length}`);

  // Group by team
  const teamPlayers = {};
  ALL_TEAMS.forEach(t => { teamPlayers[t] = []; });

  players.forEach(p => {
    const team = TEAM_MAP[p.team?.toUpperCase()] || p.team?.toUpperCase();
    if (!teamPlayers[team]) return;
    const pos = (p.depth_chart_position || p.position || '').toUpperCase();
    const rating = estimateRating(p);
    const override = STAR_OVERRIDES[p.full_name];
    teamPlayers[team].push({
      name: p.full_name,
      nflversePos: pos,
      rating,
      grade: override?.grade || gradeFromRating(rating),
      trait: override?.trait || traitFromPosition(pos, parseInt(p.draft_number) || 0),
      exp: parseInt(p.years_exp) || 0,
      draftNum: parseInt(p.draft_number) || null,
      status: p.status,
    });
  });

  // Build structured rosters
  const rosters = {};

  for (const team of ALL_TEAMS) {
    const tp = teamPlayers[team];

    // Split into offense and defense
    const offPlayers = tp.filter(p => POS_MAP_OFF[p.nflversePos]);
    const defPlayers = tp.filter(p => POS_MAP_DEF[p.nflversePos]);

    // Sort each position group by rating desc
    const offByPos = {};
    offPlayers.forEach(p => {
      const mapped = POS_MAP_OFF[p.nflversePos];
      if (!offByPos[mapped]) offByPos[mapped] = [];
      offByPos[mapped].push(p);
    });
    Object.values(offByPos).forEach(g => g.sort((a, b) => b.rating - a.rating));

    const defByPos = {};
    defPlayers.forEach(p => {
      const mapped = POS_MAP_DEF[p.nflversePos];
      if (!defByPos[mapped]) defByPos[mapped] = [];
      defByPos[mapped].push(p);
    });
    Object.values(defByPos).forEach(g => g.sort((a, b) => b.rating - a.rating));

    // Fill offense slots
    const offense = [];
    const pickOff = (mapped, slot) => {
      const pool = offByPos[mapped];
      if (pool?.length) {
        const p = pool.shift();
        offense.push({ pos: slot, name: p.name, grade: p.grade, rating: p.rating, trait: p.trait });
      }
    };

    pickOff('QB', 'QB');
    pickOff('RB', 'RB1'); pickOff('RB', 'RB2');
    pickOff('WR', 'WR1'); pickOff('WR', 'WR2'); pickOff('WR', 'WR3');
    pickOff('TE', 'TE');
    pickOff('OT', 'LT'); pickOff('OG', 'LG'); pickOff('C', 'C');
    pickOff('OG', 'RG'); pickOff('OT', 'RT');

    // Fill defense slots
    const defense = [];
    const pickDef = (mapped, slot) => {
      const pool = defByPos[mapped];
      if (pool?.length) {
        const p = pool.shift();
        defense.push({ pos: slot, name: p.name, grade: p.grade, rating: p.rating, trait: p.trait });
      }
    };

    pickDef('EDGE', 'EDGE1'); pickDef('EDGE', 'EDGE2');
    pickDef('DT', 'DT1'); pickDef('DT', 'DT2');
    pickDef('LB', 'LB1'); pickDef('LB', 'LB2');
    pickDef('CB', 'CB1'); pickDef('CB', 'CB2'); pickDef('CB', 'SCB');
    // Safety — try FS/SS first, then generic S
    if (defByPos['FS']?.length) { const p = defByPos['FS'].shift(); defense.push({ pos: 'FS', name: p.name, grade: p.grade, rating: p.rating, trait: p.trait }); }
    else pickDef('S', 'FS');
    if (defByPos['SS']?.length) { const p = defByPos['SS'].shift(); defense.push({ pos: 'SS', name: p.name, grade: p.grade, rating: p.rating, trait: p.trait }); }
    else pickDef('S', 'SS');

    rosters[team] = { offense, defense };
  }

  // Write output
  let output = '// Auto-generated from nflverse 2025 roster data\n';
  output += '// Generated: ' + new Date().toISOString() + '\n';
  output += 'export const ROSTERS_2025 = ' + JSON.stringify(rosters, null, 2) + ';\n';

  fs.writeFileSync(OUT_PATH, output);
  console.log(`\nWrote ${OUT_PATH}`);

  // Stats
  let totalOff = 0, totalDef = 0;
  for (const team of ALL_TEAMS) {
    totalOff += rosters[team].offense.length;
    totalDef += rosters[team].defense.length;
  }
  console.log(`Total offense slots filled: ${totalOff} / ${ALL_TEAMS.length * 12}`);
  console.log(`Total defense slots filled: ${totalDef} / ${ALL_TEAMS.length * 11}`);
  console.log('Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
