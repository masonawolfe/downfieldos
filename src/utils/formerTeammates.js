/**
 * Former Teammates Utility Functions
 *
 * Provides functions for querying and analyzing player-player connections
 * from the former teammates graph.
 */

import formerTeammatesActive from '../data/intelligence/former_teammates_active.json';
import formerTeammatesByMatchup from '../data/intelligence/former_teammates_by_matchup.json';

/**
 * Get all matchups with connections
 * @returns {array} Array of matchup codes with connection data
 */
export function getAllMatchupsWithConnections() {
  return Object.keys(formerTeammatesByMatchup.matchups || {});
}

/**
 * Get connections for a specific matchup
 * @param {string} team1 - First team (e.g., 'PHI')
 * @param {string} team2 - Second team (e.g., 'DAL')
 * @returns {object} { connections: [], summary: {} }
 */
export function getMatchupData(team1, team2) {
  const key = `${team1}-${team2}`;
  return formerTeammatesByMatchup.matchups?.[key] || { connections: [], summary: {} };
}

/**
 * Get connection statistics for a matchup
 * @param {string} team1
 * @param {string} team2
 * @returns {object} Summary of connection types
 */
export function getMatchupStats(team1, team2) {
  const data = getMatchupData(team1, team2);
  return data.summary || {
    total_connections: 0,
    deep_connections: 0,
    moderate_connections: 0,
    brief_connections: 0,
    same_position_group_count: 0,
  };
}

/**
 * Filter connections by overlap duration
 * @param {string} team1
 * @param {string} team2
 * @param {string} duration - 'deep', 'moderate', or 'brief'
 * @returns {array} Filtered connections
 */
export function getConnectionsByDuration(team1, team2, duration) {
  const data = getMatchupData(team1, team2);
  return (data.connections || []).filter(c => c.overlap_duration === duration);
}

/**
 * Get connections where both players are in the same position group
 * (practiced daily together)
 * @param {string} team1
 * @param {string} team2
 * @returns {array} Connections with same position group flag
 */
export function getSamePositionGroupConnections(team1, team2) {
  const data = getMatchupData(team1, team2);
  return (data.connections || []).filter(c => c.same_position_group);
}

/**
 * Get most recent connections (fewest years since overlap)
 * @param {string} team1
 * @param {string} team2
 * @param {number} limit - How many to return
 * @returns {array} Connections sorted by recency
 */
export function getMostRecentConnections(team1, team2, limit = 5) {
  const data = getMatchupData(team1, team2);
  const connections = (data.connections || [])
    .sort((a, b) => a.years_since_overlap - b.years_since_overlap);
  return connections.slice(0, limit);
}

/**
 * Get deepest connections (most overlap duration)
 * @param {string} team1
 * @param {string} team2
 * @param {number} limit - How many to return
 * @returns {array} Connections sorted by overlap duration
 */
export function getDeepestConnections(team1, team2, limit = 5) {
  const data = getMatchupData(team1, team2);
  const durationOrder = { deep: 3, moderate: 2, brief: 1 };
  const connections = (data.connections || [])
    .sort((a, b) => {
      const aScore = durationOrder[a.overlap_duration] || 0;
      const bScore = durationOrder[b.overlap_duration] || 0;
      if (bScore !== aScore) return bScore - aScore;
      return a.years_since_overlap - b.years_since_overlap;
    });
  return connections.slice(0, limit);
}

/**
 * Get connections by position group
 * Useful for analyzing specific unit compatibility
 * @param {string} team1
 * @param {string} team2
 * @param {string} posGroup - Position group (e.g., 'QB', 'OL', 'DL', 'DB')
 * @returns {array} Connections involving the position group
 */
export function getConnectionsByPositionGroup(team1, team2, posGroup) {
  const data = getMatchupData(team1, team2);
  return (data.connections || []).filter(c => {
    // Check if either player is in the requested position group
    return (
      c.player_1_position?.toUpperCase().includes(posGroup) ||
      c.player_2_position?.toUpperCase().includes(posGroup)
    );
  });
}

/**
 * Generate insight text for a matchup's connections
 * @param {string} team1
 * @param {string} team2
 * @returns {object} { headline, bullet_points, narrative }
 */
export function generateInsights(team1, team2) {
  const stats = getMatchupStats(team1, team2);
  const deepConns = getConnectionsByDuration(team1, team2, 'deep');
  const samePos = getSamePositionGroupConnections(team1, team2);
  const topConnections = getDeepestConnections(team1, team2, 3);

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

  if (deepConns.length > 0) {
    bullet_points.push(
      `${deepConns.length} deep connection${deepConns.length === 1 ? '' : 's'} (3+ years together)`
    );
  }

  if (stats.moderate_connections > 0) {
    bullet_points.push(
      `${stats.moderate_connections} moderate connection${stats.moderate_connections === 1 ? '' : 's'} (2-3 years)`
    );
  }

  if (samePos.length > 0) {
    bullet_points.push(
      `${samePos.length} same-position-group connection${samePos.length === 1 ? '' : 's'} (practiced daily)`
    );
  }

  // Generate narrative
  let narrative = `${total} former teammate${total === 1 ? '' : 's'} between ${team1} and ${team2}`;

  if (deepConns.length > 0) {
    narrative += `, with ${deepConns.length} deep connection${deepConns.length === 1 ? '' : 's'}`;
  }

  if (samePos.length > 0) {
    narrative += `. Key insight: ${samePos.length} player${samePos.length === 1 ? '' : 's'} who practiced together in the same position room`;
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
 * Get connection details for a specific player pair
 * Useful for player-level matchup analysis
 * @param {string} playerId1
 * @param {string} playerId2
 * @returns {object|null} Connection data or null if not found
 */
export function getPlayerConnection(playerId1, playerId2) {
  const edges = formerTeammatesActive.edges || {};
  const key = `${playerId1}-${playerId2}`;
  return edges[key] || null;
}

/**
 * Get all connections for a specific player across all matchups
 * @param {string} playerId
 * @returns {array} All edges involving this player
 */
export function getPlayerTeammateHistory(playerId) {
  const edges = formerTeammatesActive.edges || {};
  return Object.values(edges).filter(
    edge => edge.player_1.id === playerId || edge.player_2.id === playerId
  );
}

/**
 * Calculate a "chemistry score" for two teams
 * Based on depth and recency of connections
 * @param {string} team1
 * @param {string} team2
 * @returns {number} Score from 0-100
 */
export function calculateChemistryScore(team1, team2) {
  const stats = getMatchupStats(team1, team2);
  const deepConns = getConnectionsByDuration(team1, team2, 'deep');
  const samePos = getSamePositionGroupConnections(team1, team2);
  const recent = getMostRecentConnections(team1, team2, 10);

  // Weighted scoring:
  // - Deep connections: 30 points each
  // - Same position: 20 points each
  // - Recent (0-2 years): 15 points each, Medium (3-5): 10, Old (6+): 5
  let score = 0;

  score += deepConns.length * 30;
  score += samePos.length * 20;

  recent.forEach(conn => {
    if (conn.years_since_overlap <= 2) {
      score += 15;
    } else if (conn.years_since_overlap <= 5) {
      score += 10;
    } else {
      score += 5;
    }
  });

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Get matchups with the strongest chemistry (top X)
 * @param {number} limit - How many matchups to return
 * @returns {array} Matchup codes sorted by chemistry score
 */
export function getTopChemistryMatchups(limit = 10) {
  const matchups = getAllMatchupsWithConnections();
  const scored = matchups.map(matchup => {
    const [team1, team2] = matchup.split('-');
    const score = calculateChemistryScore(team1, team2);
    return { matchup, score, team1, team2 };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
