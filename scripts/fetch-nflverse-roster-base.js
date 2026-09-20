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
// E-044 (2026-09-20): picker logic moved to a shared module so the board
// build's reconcile step (build-player-board.js) can re-run it against
// today's availability using the `candidates` array we emit below. One
// source of truth for "who starts given today's availability."
import { outReason, pickAvailable as pickAvailableShared } from './_lib/starter_pick.js';

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

// E-042 / E-044 (2026-09-19/20): `outReason` and `pickAvailable` now
// live in ./_lib/starter_pick.js so the board's reconcile step imports
// them from the same module. The comment history:
//   E-042 (2026-09-19): starter selection must consult the availability
//   feed. Before this, a depth chart's pos_rank=1 shipped as a starter
//   even when the availability_2026.json snapshot designated that player
//   Out/IR/PUP/NFI/SUSP.
//   E-044 (2026-09-20): rosters cron (3x/week) and availability cron
//   (every 4h) drift; a designation change between roster builds shipped
//   Out starters and blocked the overnight board. Fix at the root — the
//   board build reconciles rosters2026.js against today's availability
//   using the same picker.

async function main() {
  console.log(`DownfieldOS — nflverse Roster Generation (${SEASON})`);
  console.log('========================================\n');

  // Fetch all three data sources
  const depthRows = await fetchCSV(DEPTH_CHART_URL, `depth charts (${SEASON})`);
  const snapResult = await fetchSnapsWithFallback();
  const snapRows = snapResult.rows;
  const snapSeasonUsed = snapResult.season;
  const rosterRows = await fetchCSV(ROSTER_URL, `roster metadata (${SEASON})`);

  // E-042: load availability so the starter picker can skip designated-out
  // players. Read-only; a missing file logs and disables the filter (rather
  // than blocking a rebuild), and the new verifier check #15 will fail loudly
  // if the shipped roster contains an out player regardless.
  const AVAIL_PATH = path.join(__dirname, '../src/data/intelligence/availability_2026.json');
  let availById = {};
  let availStamp = null;
  try {
    const doc = JSON.parse(fs.readFileSync(AVAIL_PATH, 'utf8'));
    availById = doc.players || {};
    availStamp = doc.meta?.generated || null;
    console.log(`  Loaded availability_2026.json (${Object.keys(availById).length} players, generated ${availStamp || 'unknown'})`);
  } catch (err) {
    console.log(`  ⚠ availability_2026.json unavailable (${err.message}) — starter filter disabled; verifier check #15 will still fail if any out player ships.`);
  }

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

  // E-042 → Q-058 (2026-09-19/20): candidate pool.
  //
  // E-042 originally clipped to pos_rank 1-3 so a designated-out
  // pos_rank=1 had an eligible backup to promote. QA (Q-058, 10:35)
  // audited a "tomorrow every-starter-Out" simulation and found 32
  // slots had no available alternative — mostly pools of size 1
  // (thin at source, not an artifact of the 1-3 clip for most).
  //
  // Widening: (a) drop the rank <= 3 filter entirely — every
  // depth-chart entry for the latest week is a legitimate backup.
  // (b) then add same-position players from the 53-man roster
  // (rosterRows) who don't appear on the depth chart, at a sentinel
  // posRank so the picker still prefers depth-chart-ranked players.
  //
  // posRank is retained per candidate so the picker can prefer
  // top-of-chart when snap-share ties.
  const starters = {};
  depthRows.forEach(r => {
    const team = norm(r.team);
    if (r.dt !== latestDate[team]) return; // only latest week
    const rank = parseInt(r.pos_rank, 10);
    if (!Number.isFinite(rank) || rank < 1) return; // no upper cap

    const posAbb = r.pos_abb;
    if (!starters[team]) starters[team] = [];
    starters[team].push({ name: r.player_name, posAbb, gsis_id: r.gsis_id, posRank: rank });
  });

  // Q-058: 53-man roster fills. Map nflverse roster.position (broad
  // groups: QB, RB, FB, WR, TE, T, G, C, DE, DT, LB, CB, S, ...) to
  // the depth-chart posAbb the picker searches on. Only add a fill
  // when the player is not already in the depth-chart pool for that
  // team (dedup by gsis_id + name).
  const ROSTER_POS_MAP = {
    QB: 'QB', RB: 'RB', FB: 'FB', WR: 'WR', TE: 'TE',
    T: 'LT', G: 'LG', C: 'C', // OL fills — arbitrary side; picker uses posAbb equality on the exact slot
    DE: 'LDE', DT: 'DT', NT: 'DT', LB: 'MLB', ILB: 'MLB', OLB: 'LOLB', EDGE: 'LDE',
    CB: 'LCB', S: 'FS', FS: 'FS', SS: 'SS',
  };
  // Per-team depth-chart pool by gsis_id to skip duplicates.
  const depthByTeam = {};
  for (const [team, arr] of Object.entries(starters)) {
    depthByTeam[team] = new Set(arr.map(x => x.gsis_id).filter(Boolean));
  }
  const ROSTER_SENTINEL_RANK = 99; // sort last within their position family
  rosterRows.forEach(r => {
    const team = norm(r.team);
    if (!team) return;
    const posBroad = String(r.position || '').toUpperCase();
    const posAbb = ROSTER_POS_MAP[posBroad];
    if (!posAbb) return;
    const gsis = r.gsis_id || null;
    if (!gsis) return;
    if (depthByTeam[team] && depthByTeam[team].has(gsis)) return;
    if (!starters[team]) starters[team] = [];
    starters[team].push({ name: r.full_name, posAbb, gsis_id: gsis, posRank: ROSTER_SENTINEL_RANK });
    depthByTeam[team]?.add(gsis);
  });

  // Build rosters
  const rosters = {};

  // E-042: metrics captured across all teams to log at the end and prove
  // the demotions happened in one place.
  const demotions = [];

  ALL_TEAMS.forEach(team => {
    const teamStarters = starters[team] || [];
    const offense = [];
    const defense = [];

    // Helper: get snap count for rating
    function getSnaps(name) {
      const key = `${team}_${name}`;
      return snapMap[key] || null;
    }

    // E-044 (2026-09-20): delegate to shared picker so the board's
    // reconcile step runs the same logic. Adapter records demotions in
    // this team's context.
    function pickAvailable(sortedCandidates, count) {
      const { chosen, demotions: local } = pickAvailableShared(sortedCandidates, count, availById);
      for (const d of local) demotions.push({ team, name: d.name, posAbb: d.pos, skipped: d.skipped.map(s => `${s.name} (${s.reason})`) });
      return chosen;
    }

    // Sort candidates for a position by (posRank ASC, snap-share DESC).
    // pos_rank=1 is preferred even when snap share is close because the
    // depth chart is the team's declared starter today; snap share is a
    // last-season signal that can lag mid-preseason moves.
    function sortByRankAndSnaps(candidates, side /* 'off'|'def' */) {
      return [...candidates].sort((a, b) => {
        if (a.posRank !== b.posRank) return a.posRank - b.posRank;
        const aS = side === 'off' ? (getSnaps(a.name)?.offSnaps || 0) : (getSnaps(a.name)?.defSnaps || 0);
        const bS = side === 'off' ? (getSnaps(b.name)?.offSnaps || 0) : (getSnaps(b.name)?.defSnaps || 0);
        return bS - aS;
      });
    }

    // E-044 (2026-09-20): emit the full sorted candidate pool alongside
    // each starter so the board's reconcile step can re-pick against
    // today's availability without re-fetching depth charts. Trimmed to
    // gsis_id + name + posAbb + posRank — the fields the picker reads.
    function push(target, pos, cand, posGroup, sortedPool) {
      const r = calcRating(cand.name, posGroup);
      const row = { pos, gsis_id: cand.gsis_id ?? null, name: cand.name, grade: gradeFromRating(r), rating: r, rating_source: 'snap_share_v1' };
      if (cand.starter_reason) row.starter_reason = cand.starter_reason;
      if (sortedPool && sortedPool.length) {
        row.candidates = sortedPool.map(c => ({ gsis_id: c.gsis_id ?? null, name: c.name, posAbb: c.posAbb, posRank: c.posRank }));
      }
      target.push(row);
    }

    // `rating` in the emitted rows is a SNAP-SHARE PROXY, not a player
    // evaluation. Base is 68–85 by snap share (fraction of a full-time
    // starter's ~65 snaps/game), then ±2 by experience. It answers "how much
    // did this player play last season" — not "how good is he." Consumers
    // should surface the metric under an honest label ("Snap share tier" or
    // similar) rather than as "Rating"; the file itself carries a
    // `rating_source: 'snap_share_v1'` field per row for downstream gating.
    // CoS audit 2026-08-30 finding #4.
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
    // Each block: filter candidates by position group, dedupe by name (LWR
    // and WR can be the same player), sort by (posRank, snap-share), then
    // pick the first N available via pickAvailable — which adds a
    // starter_reason when a demotion happened.

    // E-044 (2026-09-20): each push now also receives the sorted
    // candidate pool so the emitted row carries a `candidates` array
    // for the board's reconcile step.

    // QB
    const qbCands = sortByRankAndSnaps(teamStarters.filter(s => s.posAbb === 'QB'), 'off');
    pickAvailable(qbCands, 1).forEach(c => push(offense, 'QB', c, 'QB', qbCands));

    // RBs
    const rbCands = sortByRankAndSnaps(
      [...new Map(teamStarters.filter(s => ['RB', 'FB'].includes(s.posAbb)).map(r => [r.name, r])).values()],
      'off'
    );
    pickAvailable(rbCands, 2).forEach((c, i) => push(offense, `RB${i + 1}`, c, 'RB', rbCands));

    // WRs
    const wrCands = sortByRankAndSnaps(
      [...new Map(teamStarters.filter(s => ['WR', 'LWR', 'RWR', 'SWR'].includes(s.posAbb)).map(w => [w.name, w])).values()],
      'off'
    );
    pickAvailable(wrCands, 3).forEach((c, i) => push(offense, `WR${i + 1}`, c, 'WR', wrCands));

    // TE
    const teCands = sortByRankAndSnaps(teamStarters.filter(s => s.posAbb === 'TE'), 'off');
    pickAvailable(teCands, 1).forEach(c => push(offense, 'TE', c, 'TE', teCands));

    // OL — direct position mapping, each slot filled from its own depth
    ['LT', 'LG', 'C', 'RG', 'RT'].forEach(olPos => {
      const olCands = sortByRankAndSnaps(teamStarters.filter(s => s.posAbb === olPos), 'off');
      pickAvailable(olCands, 1).forEach(c => push(offense, olPos, c, olPos, olCands));
    });

    // === DEFENSE ===
    // EDGE
    const edgeCands = sortByRankAndSnaps(
      [...new Map(teamStarters.filter(s => ['LDE', 'RDE', 'LOLB', 'ROLB', 'EDGE'].includes(s.posAbb)).map(e => [e.name, e])).values()],
      'def'
    );
    pickAvailable(edgeCands, 2).forEach((c, i) => push(defense, `EDGE${i + 1}`, c, 'EDGE', edgeCands));

    // DT
    const dtCands = sortByRankAndSnaps(
      [...new Map(teamStarters.filter(s => ['LDT', 'RDT', 'NT', 'DT'].includes(s.posAbb)).map(d => [d.name, d])).values()],
      'def'
    );
    pickAvailable(dtCands, 1).forEach(c => push(defense, 'DT', c, 'DT', dtCands));

    // LB
    const lbCands = sortByRankAndSnaps(
      [...new Map(teamStarters.filter(s => ['MLB', 'LILB', 'RILB', 'WLB', 'SLB', 'ILB'].includes(s.posAbb)).map(l => [l.name, l])).values()],
      'def'
    );
    pickAvailable(lbCands, 2).forEach((c, i) => push(defense, `LB${i + 1}`, c, 'LB', lbCands));

    // CB
    const cbCands = sortByRankAndSnaps(
      [...new Map(teamStarters.filter(s => ['LCB', 'RCB', 'CB'].includes(s.posAbb)).map(c => [c.name, c])).values()],
      'def'
    );
    pickAvailable(cbCands, 2).forEach((c, i) => push(defense, `CB${i + 1}`, c, 'CB', cbCands));

    // SCB (nickel)
    const scbCands = sortByRankAndSnaps(teamStarters.filter(s => s.posAbb === 'NB'), 'def');
    pickAvailable(scbCands, 1).forEach(c => push(defense, 'SCB', c, 'CB', scbCands));

    // FS / SS
    const fsCands = sortByRankAndSnaps(teamStarters.filter(s => s.posAbb === 'FS'), 'def');
    pickAvailable(fsCands, 1).forEach(c => push(defense, 'FS', c, 'S', fsCands));

    const ssCands = sortByRankAndSnaps(teamStarters.filter(s => s.posAbb === 'SS'), 'def');
    pickAvailable(ssCands, 1).forEach(c => push(defense, 'SS', c, 'S', ssCands));

    rosters[team] = { offense, defense };
  });

  // E-042: log demotions so the run's stdout is proof the filter fired.
  if (demotions.length) {
    console.log(`\nStarter demotions (E-042): ${demotions.length}`);
    demotions.forEach(d => console.log(`  ${d.team} ${d.posAbb} → ${d.name} (skipped: ${d.skipped.join(', ')})`));
  } else {
    console.log('\nNo starter demotions this run — every depth-chart pos_rank=1 candidate is available.');
  }

  // Write output
  // E-044 (2026-09-20): also export ROSTERS_META with the availability
  // stamp the picker was reconciled against + the reconciler that ran.
  // The board's reconcile step overwrites this same file after re-picking
  // against ship-time availability; verifier check #16 asserts the stamp
  // matches the shipped availability_2026.json so a mid-cadence drift
  // between rosters cron and availability cron can no longer silently
  // ship a stale roster.
  const rostersMeta = {
    generated: new Date().toISOString(),
    availability_stamp: availStamp,
    reconciled_by: 'fetch-nflverse-roster-base.js',
    sources: [
      `depth_charts_${SEASON}.csv`,
      `snap_counts_${snapSeasonUsed}.csv`,
      `roster_${SEASON}.csv`,
      'availability_2026.json',
    ],
  };
  const output = `// Auto-generated from nflverse depth charts + snap counts (${SEASON} season)
// NOTE: rating is a SNAP-SHARE PROXY (68-85 base by snap share + exp
// modifier), not a player evaluation. See rating_source on each row. UI
// should render this under an honest label — "Snap share tier" or similar.
// CoS audit 2026-08-30 finding #4.
// Generated: ${new Date().toISOString()}
// Sources: depth_charts_${SEASON}.csv, snap_counts_${snapSeasonUsed}.csv, roster_${SEASON}.csv, availability_2026.json
// Do not edit manually — re-run: SEASON=${SEASON} node scripts/fetch-nflverse-roster-base.js
// E-044 (2026-09-20): each starter row carries a \`candidates\` array
// (pos_rank 1-3 pool) so the board build can re-pick against today's
// availability at ship time. ROSTERS_META.availability_stamp names the
// availability snapshot the reconciler last used.

export const ROSTERS_${SEASON} = ${JSON.stringify(rosters, null, 2)};

export const ROSTERS_META = ${JSON.stringify(rostersMeta, null, 2)};
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
