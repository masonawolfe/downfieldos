#!/usr/bin/env node
/**
 * fetch-nflverse-rosters.js
 *
 * Fetches real NFL roster data from nflverse GitHub releases,
 * processes it into former-teammate connections and revenge-game
 * data, and writes JSON files that the app consumes.
 *
 * Output files:
 *   src/data/intelligence/former_teammates_active.json
 *   src/data/intelligence/former_teammates_by_matchup.json
 *
 * Usage:
 *   node scripts/fetch-nflverse-rosters.js
 *
 * Data source: https://github.com/nflverse/nflverse-data/releases
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Config ───────────────────────────────────────────────────────────────────

// Seasons to fetch (recent history for former-teammate detection)
const SEASONS = [2020, 2021, 2022, 2023, 2024];
const CURRENT_SEASON = 2025;

// nflverse roster URL pattern — season-level roster files
const ROSTER_URL = (year) =>
  `https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_${year}.csv`;

// Output paths
const OUT_DIR = path.join(__dirname, '../src/data/intelligence');
const OUT_ACTIVE = path.join(OUT_DIR, 'former_teammates_active.json');
const OUT_BY_MATCHUP = path.join(OUT_DIR, 'former_teammates_by_matchup.json');

// Team abbreviation normalization (nflverse uses some different codes)
const TEAM_MAP = {
  OAK: 'LV',
  STL: 'LAR',
  SD: 'LAC',
  WSH: 'WAS',
};

const ALL_TEAMS = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
  'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
  'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
  'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS',
];

// ── CSV Parser (lightweight, no deps) ────────────────────────────────────────

function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

// ── Fetch & Parse ────────────────────────────────────────────────────────────

async function fetchRosterSeason(year) {
  const url = ROSTER_URL(year);
  console.log(`  Fetching ${year} roster... ${url}`);

  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'DownfieldOS/1.0' },
      redirect: 'follow',
    });

    if (!resp.ok) {
      console.warn(`  ⚠ ${year}: HTTP ${resp.status} — skipping`);
      return [];
    }

    const text = await resp.text();
    const rows = parseCSV(text);
    console.log(`  ✓ ${year}: ${rows.length} roster entries`);
    return rows;
  } catch (err) {
    console.warn(`  ⚠ ${year}: fetch failed — ${err.message}`);
    return [];
  }
}

function normalizeTeam(abbr) {
  if (!abbr) return null;
  const upper = abbr.toUpperCase().trim();
  return TEAM_MAP[upper] || upper;
}

// ── Build Player Career Map ──────────────────────────────────────────────────

/**
 * Build a map of player → [{ team, season, position }]
 * from all fetched roster data.
 */
function buildPlayerCareerMap(allRosters) {
  // Map: playerId → { name, position, teams: Map<team, { seasons: Set }> }
  const players = new Map();

  for (const row of allRosters) {
    const id = row.gsis_id || row.player_id || row.espn_id;
    if (!id) continue;

    const team = normalizeTeam(row.team);
    if (!team || !ALL_TEAMS.includes(team)) continue;

    const season = parseInt(row.season, 10);
    if (isNaN(season)) continue;

    const name = row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim();
    const position = row.position || row.depth_chart_position || '';

    if (!players.has(id)) {
      players.set(id, {
        id,
        name,
        position,
        teams: new Map(),
      });
    }

    const player = players.get(id);
    // Update name/position to most recent
    if (name) player.name = name;
    if (position) player.position = position;

    if (!player.teams.has(team)) {
      player.teams.set(team, { seasons: new Set() });
    }
    player.teams.get(team).seasons.add(season);
  }

  return players;
}

// ── Build Former Teammate Edges ──────────────────────────────────────────────

/**
 * Find players who played for multiple teams → those are "former teammates"
 * when their current team faces their old team.
 *
 * Also find pairs of players on different current teams who were
 * teammates on a third team previously.
 */
function buildFormerTeammateEdges(players, currentRoster) {
  const edges = {};
  let edgeId = 1;

  // Current team assignments (from most recent season data)
  const currentTeamMap = new Map(); // playerId → currentTeam
  for (const [id, player] of players) {
    // Find most recent team
    let latestSeason = 0;
    let latestTeam = null;
    for (const [team, data] of player.teams) {
      const maxSeason = Math.max(...data.seasons);
      if (maxSeason > latestSeason) {
        latestSeason = maxSeason;
        latestTeam = team;
      }
    }
    if (latestTeam) {
      currentTeamMap.set(id, latestTeam);
    }
  }

  // Strategy 1: Players who played for Team A and now play for Team B
  // These create "revenge game" connections AND "former teammate" intel
  for (const [id, player] of players) {
    const currentTeam = currentTeamMap.get(id);
    if (!currentTeam) continue;

    for (const [formerTeam, data] of player.teams) {
      if (formerTeam === currentTeam) continue;

      const seasons = [...data.seasons].sort();
      const startYear = seasons[0];
      const endYear = seasons[seasons.length - 1];
      const overlapYears = seasons.length;

      const edgeKey = `rt_${id}_${formerTeam}`;
      edges[edgeKey] = {
        edge_id: edgeKey,
        type: 'revenge_game',
        player_1: {
          id,
          name: player.name,
          position: player.position,
          team: currentTeam,
        },
        player_2: null, // No specific opposing player — it's player vs. team
        former_team: formerTeam,
        co_teams: [formerTeam],
        overlap_start: startYear,
        overlap_end: endYear,
        overlap_years: overlapYears,
        years_since: CURRENT_SEASON - endYear,
        source: 'nflverse_rosters',
      };
    }
  }

  // Strategy 2: Find pairs of players currently on different teams
  // who were on the same team previously (true "former teammates")
  // Group current players by team
  const teamRosters = new Map();
  for (const [id, team] of currentTeamMap) {
    if (!teamRosters.has(team)) teamRosters.set(team, []);
    teamRosters.get(team).push(id);
  }

  // For each team pair, find shared former-team connections
  const teamPairs = [];
  for (let i = 0; i < ALL_TEAMS.length; i++) {
    for (let j = i + 1; j < ALL_TEAMS.length; j++) {
      teamPairs.push([ALL_TEAMS[i], ALL_TEAMS[j]]);
    }
  }

  for (const [teamA, teamB] of teamPairs) {
    const rosterA = teamRosters.get(teamA) || [];
    const rosterB = teamRosters.get(teamB) || [];

    for (const idA of rosterA) {
      const playerA = players.get(idA);
      for (const idB of rosterB) {
        const playerB = players.get(idB);

        // Find shared teams (both played for the same team)
        const sharedTeams = [];
        for (const [teamX, dataA] of playerA.teams) {
          if (teamX === teamA) continue; // Skip their current team
          const dataB = playerB.teams.get(teamX);
          if (dataB) {
            // Find overlapping seasons
            const overlap = [...dataA.seasons].filter(s => dataB.seasons.has(s));
            if (overlap.length > 0) {
              sharedTeams.push({
                team: teamX,
                overlap_seasons: overlap.sort(),
              });
            }
          }
        }

        if (sharedTeams.length > 0) {
          const primary = sharedTeams[0];
          const edgeKey = `ft_${idA}_${idB}`;
          if (!edges[edgeKey]) {
            edges[edgeKey] = {
              edge_id: edgeKey,
              type: 'former_teammates',
              player_1: {
                id: idA,
                name: playerA.name,
                position: playerA.position,
                team: teamA,
              },
              player_2: {
                id: idB,
                name: playerB.name,
                position: playerB.position,
                team: teamB,
              },
              co_teams: sharedTeams.map(s => s.team),
              overlap_start: Math.min(...primary.overlap_seasons),
              overlap_end: Math.max(...primary.overlap_seasons),
              overlap_years: primary.overlap_seasons.length,
              years_since: CURRENT_SEASON - Math.max(...primary.overlap_seasons),
              source: 'nflverse_rosters',
            };
          }
        }
      }
    }
  }

  return edges;
}

// ── Build Matchup Index ──────────────────────────────────────────────────────

function buildMatchupIndex(edges) {
  const matchups = {};

  for (const [key, edge] of Object.entries(edges)) {
    const teams = new Set();

    if (edge.player_1?.team) teams.add(edge.player_1.team);
    if (edge.player_2?.team) teams.add(edge.player_2.team);

    // For revenge games, the matchup is currentTeam vs formerTeam
    if (edge.former_team) teams.add(edge.former_team);

    const teamArr = [...teams].filter(t => ALL_TEAMS.includes(t));

    // Generate all pair keys for this edge
    for (let i = 0; i < teamArr.length; i++) {
      for (let j = i + 1; j < teamArr.length; j++) {
        const matchupKey = [teamArr[i], teamArr[j]].sort().join('_');
        if (!matchups[matchupKey]) matchups[matchupKey] = [];
        matchups[matchupKey].push(key);
      }
    }
  }

  return matchups;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏈 DownfieldOS — nflverse Data Pipeline');
  console.log('━'.repeat(50));
  console.log('');

  // 1. Fetch roster data for all seasons
  console.log('📥 Fetching roster data...');
  const allRows = [];
  for (const year of SEASONS) {
    const rows = await fetchRosterSeason(year);
    allRows.push(...rows);
  }
  // Also fetch current season
  const currentRows = await fetchRosterSeason(CURRENT_SEASON);
  allRows.push(...currentRows);

  console.log(`\n📊 Total roster entries: ${allRows.length.toLocaleString()}`);

  if (allRows.length === 0) {
    console.error('❌ No data fetched. Check network connectivity.');
    process.exit(1);
  }

  // 2. Build player career map
  console.log('\n🔧 Building player career map...');
  const players = buildPlayerCareerMap(allRows);
  console.log(`  Players tracked: ${players.size.toLocaleString()}`);

  // Count multi-team players
  let multiTeam = 0;
  for (const [, player] of players) {
    if (player.teams.size > 1) multiTeam++;
  }
  console.log(`  Multi-team players: ${multiTeam.toLocaleString()}`);

  // 3. Build edges
  console.log('\n🔗 Building former teammate & revenge game edges...');
  const edges = buildFormerTeammateEdges(players);

  const revengeCount = Object.values(edges).filter(e => e.type === 'revenge_game').length;
  const teammateCount = Object.values(edges).filter(e => e.type === 'former_teammates').length;
  console.log(`  Revenge game connections: ${revengeCount.toLocaleString()}`);
  console.log(`  Former teammate connections: ${teammateCount.toLocaleString()}`);
  console.log(`  Total edges: ${Object.keys(edges).length.toLocaleString()}`);

  // 4. Filter & compact for browser bundle
  console.log('\n🔧 Filtering for browser bundle...');

  // Revenge games: keep last 3 years only, require 2+ years on former team for non-impact positions
  const revengeEdges = {};
  const IMPACT_POS = new Set(['QB', 'WR', 'RB', 'TE', 'CB', 'S', 'EDGE', 'DE', 'DT', 'OLB', 'ILB', 'LB', 'FS', 'SS', 'K']);
  for (const [key, edge] of Object.entries(edges)) {
    if (edge.type === 'revenge_game') {
      const pos = (edge.player_1?.position || '').toUpperCase();
      const isImpact = [...IMPACT_POS].some(p => pos.startsWith(p));
      // Keep if: recent (3yr) AND (impact position OR 2+ years on team)
      if (edge.years_since <= 3 && (isImpact || edge.overlap_years >= 2)) {
        revengeEdges[key] = edge;
      }
    }
  }

  // Cap revenge games to top 10 per matchup pair (by overlap_years desc)
  const revBuckets = new Map();
  for (const [key, edge] of Object.entries(revengeEdges)) {
    const team = edge.player_1?.team;
    const former = edge.former_team;
    if (!team || !former) continue;
    const mk = [team, former].sort().join('_');
    if (!revBuckets.has(mk)) revBuckets.set(mk, []);
    revBuckets.get(mk).push({ key, edge });
  }
  const cappedRevengeEdges = {};
  for (const [, bucket] of revBuckets) {
    bucket.sort((a, b) => b.edge.overlap_years - a.edge.overlap_years || a.edge.years_since - b.edge.years_since);
    for (const { key, edge } of bucket.slice(0, 10)) {
      cappedRevengeEdges[key] = edge;
    }
  }

  console.log(`  Revenge games (filtered+capped): ${Object.keys(cappedRevengeEdges).length}`);

  // Former teammates: require 3+ overlap years, cap per matchup
  const teammateEdges = {};
  for (const [key, edge] of Object.entries(edges)) {
    if (edge.type === 'former_teammates' && edge.overlap_years >= 3) {
      teammateEdges[key] = edge;
    }
  }

  console.log(`  Former teammates (3+ yr overlap): ${Object.keys(teammateEdges).length}`);

  // Cap former teammates: keep top 5 per matchup (by overlap_years desc)
  const matchupBuckets = new Map();
  for (const [key, edge] of Object.entries(teammateEdges)) {
    const t1 = edge.player_1.team;
    const t2 = edge.player_2.team;
    const mk = [t1, t2].sort().join('_');
    if (!matchupBuckets.has(mk)) matchupBuckets.set(mk, []);
    matchupBuckets.get(mk).push({ key, edge });
  }

  const cappedTeammateEdges = {};
  for (const [, bucket] of matchupBuckets) {
    bucket.sort((a, b) => b.edge.overlap_years - a.edge.overlap_years || a.edge.years_since - b.edge.years_since);
    for (const { key, edge } of bucket.slice(0, 5)) {
      cappedTeammateEdges[key] = edge;
    }
  }

  console.log(`  Former teammates (capped 8/matchup): ${Object.keys(cappedTeammateEdges).length}`);

  // Merge
  const filteredEdges = { ...cappedRevengeEdges, ...cappedTeammateEdges };
  console.log(`  Total filtered edges: ${Object.keys(filteredEdges).length}`);

  // 5. Compact — strip verbose fields, use shorter structure
  const compactEdges = {};
  for (const [key, edge] of Object.entries(filteredEdges)) {
    compactEdges[key] = {
      edge_id: key,
      type: edge.type,
      player_1: edge.player_1 ? { name: edge.player_1.name, pos: edge.player_1.position, team: edge.player_1.team } : null,
      player_2: edge.player_2 ? { name: edge.player_2.name, pos: edge.player_2.position, team: edge.player_2.team } : null,
      co_teams: edge.co_teams,
      former_team: edge.former_team || null,
      overlap_start: edge.overlap_start,
      overlap_end: edge.overlap_end,
      overlap_years: edge.overlap_years,
      years_since: edge.years_since,
    };
  }

  // 6. Build matchup index
  console.log('\n📇 Building matchup index...');
  const matchups = buildMatchupIndex(compactEdges);
  const coveredPairs = Object.keys(matchups).length;
  const totalPairs = (ALL_TEAMS.length * (ALL_TEAMS.length - 1)) / 2;
  console.log(`  Team pairs covered: ${coveredPairs} / ${totalPairs} (${Math.round(coveredPairs / totalPairs * 100)}%)`);

  // 7. Write output
  console.log('\n💾 Writing output files...');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const activeData = {
    meta: {
      generated: new Date().toISOString(),
      source: 'nflverse (github.com/nflverse/nflverse-data)',
      seasons: SEASONS.concat(CURRENT_SEASON),
      total_edges: Object.keys(compactEdges).length,
      revenge_game_count: Object.values(compactEdges).filter(e => e.type === 'revenge_game').length,
      former_teammate_count: Object.values(compactEdges).filter(e => e.type === 'former_teammates').length,
      data_note: 'Real NFL roster data. Revenge games = players facing former teams. Former teammates = players on different current teams who shared a roster previously.',
    },
    edges: compactEdges,
  };

  const matchupData = {
    meta: {
      generated: new Date().toISOString(),
      total_matchups: coveredPairs,
      coverage_pct: Math.round(coveredPairs / totalPairs * 100),
    },
    matchups,
  };

  fs.writeFileSync(OUT_ACTIVE, JSON.stringify(activeData));
  fs.writeFileSync(OUT_BY_MATCHUP, JSON.stringify(matchupData));

  const activeSize = (fs.statSync(OUT_ACTIVE).size / 1024).toFixed(0);
  const matchupSize = (fs.statSync(OUT_BY_MATCHUP).size / 1024).toFixed(0);

  console.log(`  ✓ ${path.basename(OUT_ACTIVE)} (${activeSize} KB)`);
  console.log(`  ✓ ${path.basename(OUT_BY_MATCHUP)} (${matchupSize} KB)`);

  console.log('\n✅ Data pipeline complete!');
  console.log('━'.repeat(50));
}

main().catch(err => {
  console.error('❌ Pipeline failed:', err);
  process.exit(1);
});
