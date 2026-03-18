/**
 * Former Teammates Utility Functions
 *
 * Provides functions for querying and analyzing player-player connections
 * from the former teammates graph.
 *
 * Uses real nflverse roster data processed by scripts/fetch-nflverse-rosters.js.
 */

import formerTeammatesActive from '../data/intelligence/former_teammates_active.json';
import formerTeammatesByMatchup from '../data/intelligence/former_teammates_by_matchup.json';

const edges = formerTeammatesActive.edges || {};

/**
 * Get all edge IDs for a team-pair matchup
 */
function getMatchupEdgeIds(team1, team2) {
  const key1 = [team1, team2].sort().join('_');
  return formerTeammatesByMatchup.matchups?.[key1] || [];
}

/**
 * Get all edges (full objects) for a matchup
 */
function getMatchupEdges(team1, team2) {
  const ids = getMatchupEdgeIds(team1, team2);
  return ids.map(id => edges[id]).filter(Boolean);
}

/**
 * Classify overlap duration from years
 */
function classifyDuration(years) {
  if (years >= 4) return 'deep';
  if (years >= 2) return 'moderate';
  return 'brief';
}

/**
 * Get all matchups with connections
 */
export function getAllMatchupsWithConnections() {
  return Object.keys(formerTeammatesByMatchup.matchups || {});
}

/**
 * Get connections for a specific matchup
 * Returns edge objects with normalized fields
 */
export function getMatchupConnections(team1, team2) {
  return getMatchupEdges(team1, team2).map(edge => ({
    ...edge,
    duration: classifyDuration(edge.overlap_years || 1),
    player_1_name: edge.player_1?.name,
    player_1_position: edge.player_1?.pos || edge.player_1?.position,
    player_1_team: edge.player_1?.team,
    player_2_name: edge.player_2?.name,
    player_2_position: edge.player_2?.pos || edge.player_2?.position,
    player_2_team: edge.player_2?.team,
  }));
}

/**
 * Get connection statistics for a matchup
 */
export function getMatchupStats(team1, team2) {
  const conns = getMatchupEdges(team1, team2);
  const total = conns.length;
  const deep = conns.filter(e => (e.overlap_years || 1) >= 4).length;
  const moderate = conns.filter(e => { const y = e.overlap_years || 1; return y >= 2 && y < 4; }).length;
  const brief = total - deep - moderate;

  return {
    total_connections: total,
    deep_connections: deep,
    moderate_connections: moderate,
    brief_connections: brief,
  };
}

/**
 * Get deepest connections (most overlap years)
 */
export function getDeepestConnections(team1, team2, limit = 5) {
  const conns = getMatchupConnections(team1, team2);
  return conns
    .sort((a, b) => (b.overlap_years || 1) - (a.overlap_years || 1) || (a.years_since || 0) - (b.years_since || 0))
    .slice(0, limit);
}

/**
 * Get most recent connections
 */
export function getMostRecentConnections(team1, team2, limit = 5) {
  const conns = getMatchupConnections(team1, team2);
  return conns
    .sort((a, b) => (a.years_since || 0) - (b.years_since || 0))
    .slice(0, limit);
}

/**
 * Generate insight text for a matchup's connections
 */
export function generateInsights(team1, team2) {
  const stats = getMatchupStats(team1, team2);
  const total = stats.total_connections || 0;

  if (total === 0) {
    return {
      headline: 'No Recorded Connections',
      bullet_points: [
        `${team1} and ${team2} have no documented former teammates on current rosters.`,
      ],
      narrative: `No former teammate connections detected in this matchup.`,
    };
  }

  const headline = `${total} Former Teammate${total === 1 ? '' : 's'} Between ${team1} and ${team2}`;

  const bullet_points = [];
  if (stats.deep_connections > 0) {
    bullet_points.push(`${stats.deep_connections} deep connection${stats.deep_connections === 1 ? '' : 's'} (4+ years together)`);
  }
  if (stats.moderate_connections > 0) {
    bullet_points.push(`${stats.moderate_connections} moderate connection${stats.moderate_connections === 1 ? '' : 's'} (2-3 years)`);
  }

  const topConnections = getDeepestConnections(team1, team2, 3);

  let narrative = `${total} former teammate${total === 1 ? '' : 's'} between ${team1} and ${team2}`;
  if (stats.deep_connections > 0) {
    narrative += `, with ${stats.deep_connections} deep connection${stats.deep_connections === 1 ? '' : 's'}`;
  }
  narrative += '.';

  return {
    headline,
    bullet_points,
    narrative,
    top_connections: topConnections,
    stats,
  };
}

/**
 * Calculate a "chemistry score" for two teams
 * Based on depth and recency of connections
 */
export function calculateChemistryScore(team1, team2) {
  const stats = getMatchupStats(team1, team2);
  const conns = getMatchupConnections(team1, team2);

  let score = 0;

  // Deep connections are most valuable
  score += stats.deep_connections * 25;
  score += stats.moderate_connections * 12;
  score += stats.brief_connections * 4;

  // Recency bonus
  conns.slice(0, 10).forEach(c => {
    const ys = c.years_since || 0;
    if (ys <= 1) score += 10;
    else if (ys <= 3) score += 5;
    else score += 2;
  });

  return Math.min(score, 100);
}

/**
 * Get matchups with the strongest chemistry
 */
export function getTopChemistryMatchups(limit = 10) {
  const matchups = getAllMatchupsWithConnections();
  const scored = matchups.map(matchup => {
    const [team1, team2] = matchup.split('_');
    const score = calculateChemistryScore(team1, team2);
    return { matchup, score, team1, team2 };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
