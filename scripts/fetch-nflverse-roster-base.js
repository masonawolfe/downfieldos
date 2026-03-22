#!/usr/bin/env node
/**
 * fetch-nflverse-roster-base.js
 *
 * Generates rosters2025.js from nflverse depth charts + snap counts.
 * Uses depth_charts_2025.csv (pos_rank=1 = starter) validated against
 * snap_counts_2025.csv (actual playing time).
 *
 * Output: src/data/rosters2025.js
 * Usage: node scripts/fetch-nflverse-roster-base.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEPTH_CHART_URL = 'https://github.com/nflverse/nflverse-data/releases/download/depth_charts/depth_charts_2025.csv';
const SNAP_COUNT_URL = 'https://github.com/nflverse/nflverse-data/releases/download/snap_counts/snap_counts_2025.csv';
const ROSTER_URL = 'https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_2025.csv';
const OUT_PATH = path.join(__dirname, '../src/data/rosters2025.js');

const TEAM_MAP = { OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', LA: 'LAR' };
function norm(t) { return TEAM_MAP[t?.trim()?.toUpperCase()] || t?.trim()?.toUpperCase() || ''; }

const ALL_TEAMS = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG',
  'NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS',
];

// Depth chart pos_abb → app position group
const OFFENSE_MAP = {
  QB: 'QB', RB: 'RB', FB: 'RB',
  WR: 'WR', LWR: 'WR', RWR: 'WR', SWR: 'WR',
  TE: 'TE',
  LT: 'LT', LG: 'LG', C: 'C', RG: 'RG', RT: 'RT',
};
const DEFENSE_MAP = {
  LDE: 'EDGE', RDE: 'EDGE', LOLB: 'EDGE', ROLB: 'EDGE', EDGE: 'EDGE',
  LDT: 'DT', RDT: 'DT', NT: 'DT', DT: 'DT',
  MLB: 'LB', LILB: 'LB', RILB: 'LB', WLB: 'LB', SLB: 'LB', ILB: 'LB',
  LCB: 'CB', RCB: 'CB', CB: 'CB',
  NB: 'SCB',
  FS: 'FS', SS: 'SS', S: 'S',
};

const TRAITS = {
  QB: ['Dual-Threat', 'Pocket Passer', 'Game Manager', 'Gunslinger'],
  RB: ['Between-the-Tackles', 'Pass-Catching', 'Home Run Hitter', 'Power Back'],
  WR: ['Deep Threat', 'Possession', 'Route Technician', 'YAC Monster', 'Contested Catch'],
  TE: ['Receiving TE', 'Blocking TE', 'Versatile'],
  OL: ['Pass Pro', 'Road Grader', 'Versatile'],
  EDGE: ['Speed Rusher', 'Power Rusher', 'Versatile'],
  DT: ['Interior Pressure', 'Run Stuffer', 'Versatile'],
  LB: ['Sideline-to-Sideline', 'Coverage LB', 'Run Stopper', 'Versatile'],
  CB: ['Press-Man', 'Zone Corner', 'Ball Hawk'],
  SCB: ['Slot Corner'],
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

function parseCSV(text) {
  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

function gradeFromRating(r) {
  if (r >= 88) return 'Elite';
  if (r >= 78) return 'Above Avg';
  if (r >= 70) return 'Average';
  return 'Below Avg';
}

function assignTrait(posGroup, seed) {
  const options = TRAITS[posGroup] || TRAITS.OL;
  return options[Math.abs(seed) % options.length];
}

async function fetchCSV(url, label) {
  console.log(`  Fetching ${label}...`);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch ${label}: ${resp.status}`);
  const text = await resp.text();
  console.log(`  Downloaded ${(text.length / 1024 / 1024).toFixed(1)}MB`);
  return parseCSV(text);
}

async function main() {
  console.log('DownfieldOS — nflverse Roster Generation');
  console.log('========================================\n');

  // Fetch all three data sources
  const depthRows = await fetchCSV(DEPTH_CHART_URL, 'depth charts');
  const snapRows = await fetchCSV(SNAP_COUNT_URL, 'snap counts');
  const rosterRows = await fetchCSV(ROSTER_URL, 'roster metadata');

  // Build years_exp lookup from roster data
  const expMap = {};
  rosterRows.forEach(r => {
    const key = `${norm(r.team)}_${r.full_name}`;
    expMap[key] = parseInt(r.years_exp) || 0;
  });

  // Aggregate snap counts per player per team (full season)
  const snapMap = {};
  snapRows.forEach(r => {
    if (r.game_type !== 'REG') return;
    const team = norm(r.team);
    const key = `${team}_${r.player}`;
    if (!snapMap[key]) snapMap[key] = { name: r.player, team, pos: r.position, offSnaps: 0, defSnaps: 0, games: 0 };
    snapMap[key].offSnaps += parseInt(r.offense_snaps) || 0;
    snapMap[key].defSnaps += parseInt(r.defense_snaps) || 0;
    snapMap[key].games++;
  });

  // Get latest depth chart date per team (use most recent week)
  const latestDate = {};
  depthRows.forEach(r => {
    const team = norm(r.team);
    if (!latestDate[team] || r.dt > latestDate[team]) latestDate[team] = r.dt;
  });

  // Get starters from latest depth chart
  const starters = {};
  depthRows.forEach(r => {
    const team = norm(r.team);
    if (r.dt !== latestDate[team]) return; // only latest week
    if (r.pos_rank !== '1') return; // only starters

    const posAbb = r.pos_abb;
    if (!starters[team]) starters[team] = [];
    starters[team].push({ name: r.player_name, posAbb, gsis_id: r.gsis_id });
  });

  // Build rosters
  const rosters = {};

  ALL_TEAMS.forEach(team => {
    const teamStarters = starters[team] || [];
    const offense = [];
    const defense = [];

    // Helper: get snap count for rating
    function getSnaps(name) {
      const key = `${team}_${name}`;
      return snapMap[key] || null;
    }

    function calcRating(name, posGroup) {
      const snaps = getSnaps(name);
      const exp = expMap[`${team}_${name}`] || 0;

      // Base from snap share
      let base;
      if (!snaps || snaps.games === 0) {
        base = 72; // no snap data = depth chart only
      } else {
        const isOff = ['QB', 'RB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'].includes(posGroup);
        const totalSnaps = isOff ? snaps.offSnaps : snaps.defSnaps;
        const avgPerGame = totalSnaps / snaps.games;
        // ~65 snaps/game is full-time starter
        const snapShare = Math.min(1, avgPerGame / 65);

        if (snapShare >= 0.9) base = 85;
        else if (snapShare >= 0.7) base = 80;
        else if (snapShare >= 0.5) base = 76;
        else if (snapShare >= 0.3) base = 72;
        else base = 68;
      }

      // Experience modifier
      if (exp >= 4 && exp <= 8) base += 2;
      else if (exp >= 2 && exp <= 3) base += 1;
      else if (exp >= 9) base -= 1;
      else if (exp <= 1) base -= 1;

      return Math.max(65, Math.min(92, base));
    }

    // === OFFENSE ===
    // QB
    const qb = teamStarters.find(s => s.posAbb === 'QB');
    if (qb) {
      const r = calcRating(qb.name, 'QB');
      offense.push({ pos: 'QB', name: qb.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('QB', qb.name.length) });
    }

    // RBs — from depth chart, sorted by snap count
    const rbStarters = teamStarters.filter(s => ['RB', 'FB'].includes(s.posAbb));
    const rbsSorted = rbStarters.sort((a, b) => ((getSnaps(b.name)?.offSnaps || 0) - (getSnaps(a.name)?.offSnaps || 0)));
    rbsSorted.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p.name, 'RB');
      offense.push({ pos: `RB${i + 1}`, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('RB', p.name.length + i) });
    });

    // WRs — sorted by snap count for WR1/WR2/WR3
    const wrStarters = teamStarters.filter(s => ['WR', 'LWR', 'RWR', 'SWR'].includes(s.posAbb));
    // Deduplicate by name (same player can appear at LWR and WR)
    const wrUnique = [...new Map(wrStarters.map(w => [w.name, w])).values()];
    const wrsSorted = wrUnique.sort((a, b) => ((getSnaps(b.name)?.offSnaps || 0) - (getSnaps(a.name)?.offSnaps || 0)));
    wrsSorted.slice(0, 3).forEach((p, i) => {
      const r = calcRating(p.name, 'WR');
      offense.push({ pos: `WR${i + 1}`, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('WR', p.name.length + i) });
    });

    // TE
    const te = teamStarters.find(s => s.posAbb === 'TE');
    if (te) {
      const r = calcRating(te.name, 'TE');
      offense.push({ pos: 'TE', name: te.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('TE', te.name.length) });
    }

    // OL — direct position mapping
    ['LT', 'LG', 'C', 'RG', 'RT'].forEach(olPos => {
      const ol = teamStarters.find(s => s.posAbb === olPos);
      if (ol) {
        const r = calcRating(ol.name, olPos);
        offense.push({ pos: olPos, name: ol.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('OL', ol.name.length) });
      }
    });

    // === DEFENSE ===
    // EDGE — LDE, RDE, LOLB, ROLB sorted by snap count
    const edgeStarters = teamStarters.filter(s => ['LDE', 'RDE', 'LOLB', 'ROLB', 'EDGE'].includes(s.posAbb));
    const edgeUnique = [...new Map(edgeStarters.map(e => [e.name, e])).values()];
    const edgesSorted = edgeUnique.sort((a, b) => ((getSnaps(b.name)?.defSnaps || 0) - (getSnaps(a.name)?.defSnaps || 0)));
    edgesSorted.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p.name, 'EDGE');
      defense.push({ pos: `EDGE${i + 1}`, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('EDGE', p.name.length + i) });
    });

    // DT — LDT, RDT, NT, DT
    const dtStarters = teamStarters.filter(s => ['LDT', 'RDT', 'NT', 'DT'].includes(s.posAbb));
    const dtUnique = [...new Map(dtStarters.map(d => [d.name, d])).values()];
    const dtSorted = dtUnique.sort((a, b) => ((getSnaps(b.name)?.defSnaps || 0) - (getSnaps(a.name)?.defSnaps || 0)));
    if (dtSorted[0]) {
      const r = calcRating(dtSorted[0].name, 'DT');
      defense.push({ pos: 'DT', name: dtSorted[0].name, grade: gradeFromRating(r), rating: r, trait: assignTrait('DT', dtSorted[0].name.length) });
    }

    // LB — MLB, LILB, RILB, WLB, SLB
    const lbStarters = teamStarters.filter(s => ['MLB', 'LILB', 'RILB', 'WLB', 'SLB', 'ILB'].includes(s.posAbb));
    const lbUnique = [...new Map(lbStarters.map(l => [l.name, l])).values()];
    const lbsSorted = lbUnique.sort((a, b) => ((getSnaps(b.name)?.defSnaps || 0) - (getSnaps(a.name)?.defSnaps || 0)));
    lbsSorted.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p.name, 'LB');
      defense.push({ pos: `LB${i + 1}`, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('LB', p.name.length + i) });
    });

    // CB — LCB, RCB
    const cbStarters = teamStarters.filter(s => ['LCB', 'RCB', 'CB'].includes(s.posAbb));
    const cbUnique = [...new Map(cbStarters.map(c => [c.name, c])).values()];
    const cbsSorted = cbUnique.sort((a, b) => ((getSnaps(b.name)?.defSnaps || 0) - (getSnaps(a.name)?.defSnaps || 0)));
    cbsSorted.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p.name, 'CB');
      defense.push({ pos: `CB${i + 1}`, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('CB', p.name.length + i) });
    });

    // SCB (nickel)
    const scb = teamStarters.find(s => s.posAbb === 'NB');
    if (scb) {
      const r = calcRating(scb.name, 'CB');
      defense.push({ pos: 'SCB', name: scb.name, grade: gradeFromRating(r), rating: r, trait: 'Slot Corner' });
    }

    // FS
    const fs = teamStarters.find(s => s.posAbb === 'FS');
    if (fs) {
      const r = calcRating(fs.name, 'S');
      defense.push({ pos: 'FS', name: fs.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('S', fs.name.length) });
    }

    // SS
    const ss = teamStarters.find(s => s.posAbb === 'SS');
    if (ss) {
      const r = calcRating(ss.name, 'S');
      defense.push({ pos: 'SS', name: ss.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('S', ss.name.length + 1) });
    }

    rosters[team] = { offense, defense };
  });

  // Write output
  const output = `// Auto-generated from nflverse depth charts + snap counts (2025 season)
// Generated: ${new Date().toISOString()}
// Sources: depth_charts_2025.csv, snap_counts_2025.csv, roster_2025.csv
// Do not edit manually — re-run: node scripts/fetch-nflverse-roster-base.js

export const ROSTERS_2025 = ${JSON.stringify(rosters, null, 2)};
`;

  fs.writeFileSync(OUT_PATH, output);

  // Summary
  console.log('\nResults:');
  ALL_TEAMS.forEach(t => {
    const r = rosters[t];
    const qb = r.offense.find(p => p.pos === 'QB');
    const wr1 = r.offense.find(p => p.pos === 'WR1');
    console.log(`  ${t}: ${r.offense.length}O + ${r.defense.length}D | QB: ${qb?.name || 'MISSING'} | WR1: ${wr1?.name || 'MISSING'}`);
  });

  console.log(`\nWrote ${OUT_PATH}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
