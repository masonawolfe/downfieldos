#!/usr/bin/env node
/**
 * fetch-nflverse-roster-base.js
 *
 * Generates rosters${SEASON}.js from nflverse depth charts + snap counts.
 * Uses depth_charts_${SEASON}.csv (pos_rank=1 = starter) validated against
 * snap_counts (actual playing time — falls back to prior season when the
 * current season hasn't produced regular-season snap data yet).
 *
 * Usage:
 *   node scripts/fetch-nflverse-roster-base.js               # defaults to SEASON=2026
 *   SEASON=2025 node scripts/fetch-nflverse-roster-base.js   # or pass via env
 *   node scripts/fetch-nflverse-roster-base.js 2025          # or as first arg
 *
 * Snap-count season falls back to SEASON-1 automatically when the current
 * season's file is unavailable (preseason case). Override with SNAP_SEASON.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { appendRefreshLogEntry } from './_lib/refresh_log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEASON = parseInt(process.env.SEASON || process.argv[2] || '2026', 10);
const SNAP_SEASON_OVERRIDE = process.env.SNAP_SEASON ? parseInt(process.env.SNAP_SEASON, 10) : null;

const DEPTH_CHART_URL = `https://github.com/nflverse/nflverse-data/releases/download/depth_charts/depth_charts_${SEASON}.csv`;
const ROSTER_URL = `https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_${SEASON}.csv`;
const SNAP_URL = (yr) => `https://github.com/nflverse/nflverse-data/releases/download/snap_counts/snap_counts_${yr}.csv`;
const OUT_PATH = path.join(__dirname, `../src/data/rosters${SEASON}.js`);

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

async function fetchSnapsWithFallback() {
  const primary = SNAP_SEASON_OVERRIDE ?? SEASON;
  try {
    const rows = await fetchCSV(SNAP_URL(primary), `snap counts (${primary})`);
    return { rows, season: primary };
  } catch (err) {
    if (SNAP_SEASON_OVERRIDE != null) throw err; // user asked for a specific season — don't second-guess
    const fallback = SEASON - 1;
    console.log(`  ⚠ ${primary} snap counts unavailable (${err.message}); falling back to ${fallback}`);
    const rows = await fetchCSV(SNAP_URL(fallback), `snap counts (${fallback})`);
    return { rows, season: fallback };
  }
}

async function main() {
  console.log(`DownfieldOS — nflverse Roster Generation (${SEASON})`);
  console.log('========================================\n');

  // Fetch all three data sources
  const depthRows = await fetchCSV(DEPTH_CHART_URL, `depth charts (${SEASON})`);
  const snapResult = await fetchSnapsWithFallback();
  const snapRows = snapResult.rows;
  const snapSeasonUsed = snapResult.season;
  const rosterRows = await fetchCSV(ROSTER_URL, `roster metadata (${SEASON})`);

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
      offense.push({ pos: 'QB', gsis_id: qb.gsis_id ?? null, name: qb.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('QB', qb.name.length) });
    }

    // RBs — from depth chart, sorted by snap count
    const rbStarters = teamStarters.filter(s => ['RB', 'FB'].includes(s.posAbb));
    const rbsSorted = rbStarters.sort((a, b) => ((getSnaps(b.name)?.offSnaps || 0) - (getSnaps(a.name)?.offSnaps || 0)));
    rbsSorted.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p.name, 'RB');
      offense.push({ pos: `RB${i + 1}`, gsis_id: p.gsis_id ?? null, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('RB', p.name.length + i) });
    });

    // WRs — sorted by snap count for WR1/WR2/WR3
    const wrStarters = teamStarters.filter(s => ['WR', 'LWR', 'RWR', 'SWR'].includes(s.posAbb));
    // Deduplicate by name (same player can appear at LWR and WR)
    const wrUnique = [...new Map(wrStarters.map(w => [w.name, w])).values()];
    const wrsSorted = wrUnique.sort((a, b) => ((getSnaps(b.name)?.offSnaps || 0) - (getSnaps(a.name)?.offSnaps || 0)));
    wrsSorted.slice(0, 3).forEach((p, i) => {
      const r = calcRating(p.name, 'WR');
      offense.push({ pos: `WR${i + 1}`, gsis_id: p.gsis_id ?? null, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('WR', p.name.length + i) });
    });

    // TE
    const te = teamStarters.find(s => s.posAbb === 'TE');
    if (te) {
      const r = calcRating(te.name, 'TE');
      offense.push({ pos: 'TE', gsis_id: te.gsis_id ?? null, name: te.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('TE', te.name.length) });
    }

    // OL — direct position mapping
    ['LT', 'LG', 'C', 'RG', 'RT'].forEach(olPos => {
      const ol = teamStarters.find(s => s.posAbb === olPos);
      if (ol) {
        const r = calcRating(ol.name, olPos);
        offense.push({ pos: olPos, gsis_id: ol.gsis_id ?? null, name: ol.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('OL', ol.name.length) });
      }
    });

    // === DEFENSE ===
    // EDGE — LDE, RDE, LOLB, ROLB sorted by snap count
    const edgeStarters = teamStarters.filter(s => ['LDE', 'RDE', 'LOLB', 'ROLB', 'EDGE'].includes(s.posAbb));
    const edgeUnique = [...new Map(edgeStarters.map(e => [e.name, e])).values()];
    const edgesSorted = edgeUnique.sort((a, b) => ((getSnaps(b.name)?.defSnaps || 0) - (getSnaps(a.name)?.defSnaps || 0)));
    edgesSorted.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p.name, 'EDGE');
      defense.push({ pos: `EDGE${i + 1}`, gsis_id: p.gsis_id ?? null, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('EDGE', p.name.length + i) });
    });

    // DT — LDT, RDT, NT, DT
    const dtStarters = teamStarters.filter(s => ['LDT', 'RDT', 'NT', 'DT'].includes(s.posAbb));
    const dtUnique = [...new Map(dtStarters.map(d => [d.name, d])).values()];
    const dtSorted = dtUnique.sort((a, b) => ((getSnaps(b.name)?.defSnaps || 0) - (getSnaps(a.name)?.defSnaps || 0)));
    if (dtSorted[0]) {
      const r = calcRating(dtSorted[0].name, 'DT');
      defense.push({ pos: 'DT', gsis_id: dtSorted[0].gsis_id ?? null, name: dtSorted[0].name, grade: gradeFromRating(r), rating: r, trait: assignTrait('DT', dtSorted[0].name.length) });
    }

    // LB — MLB, LILB, RILB, WLB, SLB
    const lbStarters = teamStarters.filter(s => ['MLB', 'LILB', 'RILB', 'WLB', 'SLB', 'ILB'].includes(s.posAbb));
    const lbUnique = [...new Map(lbStarters.map(l => [l.name, l])).values()];
    const lbsSorted = lbUnique.sort((a, b) => ((getSnaps(b.name)?.defSnaps || 0) - (getSnaps(a.name)?.defSnaps || 0)));
    lbsSorted.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p.name, 'LB');
      defense.push({ pos: `LB${i + 1}`, gsis_id: p.gsis_id ?? null, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('LB', p.name.length + i) });
    });

    // CB — LCB, RCB
    const cbStarters = teamStarters.filter(s => ['LCB', 'RCB', 'CB'].includes(s.posAbb));
    const cbUnique = [...new Map(cbStarters.map(c => [c.name, c])).values()];
    const cbsSorted = cbUnique.sort((a, b) => ((getSnaps(b.name)?.defSnaps || 0) - (getSnaps(a.name)?.defSnaps || 0)));
    cbsSorted.slice(0, 2).forEach((p, i) => {
      const r = calcRating(p.name, 'CB');
      defense.push({ pos: `CB${i + 1}`, gsis_id: p.gsis_id ?? null, name: p.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('CB', p.name.length + i) });
    });

    // SCB (nickel)
    const scb = teamStarters.find(s => s.posAbb === 'NB');
    if (scb) {
      const r = calcRating(scb.name, 'CB');
      defense.push({ pos: 'SCB', gsis_id: scb.gsis_id ?? null, name: scb.name, grade: gradeFromRating(r), rating: r, trait: 'Slot Corner' });
    }

    // FS
    const fs = teamStarters.find(s => s.posAbb === 'FS');
    if (fs) {
      const r = calcRating(fs.name, 'S');
      defense.push({ pos: 'FS', gsis_id: fs.gsis_id ?? null, name: fs.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('S', fs.name.length) });
    }

    // SS
    const ss = teamStarters.find(s => s.posAbb === 'SS');
    if (ss) {
      const r = calcRating(ss.name, 'S');
      defense.push({ pos: 'SS', gsis_id: ss.gsis_id ?? null, name: ss.name, grade: gradeFromRating(r), rating: r, trait: assignTrait('S', ss.name.length + 1) });
    }

    rosters[team] = { offense, defense };
  });

  // Write output
  const output = `// Auto-generated from nflverse depth charts + snap counts (${SEASON} season)
// Generated: ${new Date().toISOString()}
// Sources: depth_charts_${SEASON}.csv, snap_counts_${snapSeasonUsed}.csv, roster_${SEASON}.csv
// Do not edit manually — re-run: SEASON=${SEASON} node scripts/fetch-nflverse-roster-base.js

export const ROSTERS_${SEASON} = ${JSON.stringify(rosters, null, 2)};
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

  // Task 3 — required refresh-log entry. If this throws the run fails so
  // downstream consumers know NOT to trust the data written above.
  const totalRows = ALL_TEAMS.reduce((s, t) => s + rosters[t].offense.length + rosters[t].defense.length, 0);
  const withGsis = ALL_TEAMS.reduce((s, t) => s + [...rosters[t].offense, ...rosters[t].defense].filter(p => p.gsis_id).length, 0);
  const sizeKB = (fs.statSync(OUT_PATH).size / 1024).toFixed(0);
  const spotCheck = ALL_TEAMS.slice(0, 15).map(t => {
    const qb = rosters[t].offense.find(p => p.pos === 'QB');
    return qb ? `${t} QB ${qb.name} (gsis ${qb.gsis_id || 'none'}) — rating ${qb.rating}` : `${t} QB — missing`;
  });
  appendRefreshLogEntry({
    script: 'fetch-nflverse-roster-base.js',
    season: SEASON,
    sources: [
      { name: `depth_charts_${SEASON}.csv`, url: DEPTH_CHART_URL, updated: 'nflverse release' },
      { name: `snap_counts_${snapSeasonUsed}.csv`, url: SNAP_URL(snapSeasonUsed), updated: 'nflverse release' },
      { name: `roster_${SEASON}.csv`, url: ROSTER_URL, updated: 'nflverse release' },
    ],
    outputs: [
      { name: path.basename(OUT_PATH), rows: totalRows, sizeKB: Number(sizeKB), extra: `gsis_id present on ${withGsis}/${totalRows} (${(withGsis/totalRows*100).toFixed(1)}%)` },
    ],
    spotCheck,
    notes: `Snap season used: ${snapSeasonUsed}${snapSeasonUsed !== SEASON ? ' (fallback)' : ''}. Missing gsis_id count: ${totalRows - withGsis}.`,
  });
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
