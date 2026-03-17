import { useState, useEffect } from 'react';
import formerTeammatesActive from '../data/intelligence/former_teammates_active.json';
import formerTeammatesByMatchup from '../data/intelligence/former_teammates_by_matchup.json';

/**
 * Hook to query former teammate connections
 * Provides matchup intelligence for rendering chemistry insights
 */
export function useFormerTeammates() {
  const [edgeMap, setEdgeMap] = useState({});
  const [matchupIndex, setMatchupIndex] = useState({});

  useEffect(() => {
    // Build edge lookup map for fast access
    const edges = {};
    if (formerTeammatesActive.edges) {
      Object.entries(formerTeammatesActive.edges).forEach(([key, edge]) => {
        edges[key] = edge;
      });
    }
    setEdgeMap(edges);

    // Load matchup index
    if (formerTeammatesByMatchup.matchups) {
      setMatchupIndex(formerTeammatesByMatchup.matchups);
    }
  }, []);

  /**
   * Get all connections between two teams
   * @param {string} team1 - Team code (e.g., 'PHI')
   * @param {string} team2 - Team code (e.g., 'DAL')
   * @returns {object} { connections, summary } for the matchup
   */
  const getMatchupConnections = (team1, team2) => {
    const key = `${team1}-${team2}`;
    return matchupIndex[key] || { connections: [], summary: {} };
  };

  /**
   * Get connections for a specific player by team pair
   * @param {string} team1 - First team
   * @param {string} team2 - Second team
   * @returns {array} Filtered connections involving key players
   */
  const getPlayerConnections = (team1, team2) => {
    const data = getMatchupConnections(team1, team2);
    return data.connections || [];
  };

  /**
   * Get summary stats for a matchup
   * @param {string} team1 - First team
   * @param {string} team2 - Second team
   * @returns {object} Summary with connection counts by overlap duration
   */
  const getMatchupSummary = (team1, team2) => {
    const data = getMatchupConnections(team1, team2);
    return data.summary || {};
  };

  /**
   * Get top connections (deep or recent)
   * @param {string} team1 - First team
   * @param {string} team2 - Second team
   * @param {number} limit - How many to return
   * @returns {array} Top connections sorted by overlap duration and recency
   */
  const getTopConnections = (team1, team2, limit = 5) => {
    const data = getMatchupConnections(team1, team2);
    return (data.connections || []).slice(0, limit);
  };

  /**
   * Get same-position-group connections (practiced daily together)
   * @param {string} team1 - First team
   * @param {string} team2 - Second team
   * @returns {array} Connections where players share a position group
   */
  const getSamePositionConnections = (team1, team2) => {
    const data = getMatchupConnections(team1, team2);
    return (data.connections || []).filter(c => c.same_position_group);
  };

  /**
   * Get deep connections (3+ years together)
   * @param {string} team1 - First team
   * @param {string} team2 - Second team
   * @returns {array} Connections with deep overlap
   */
  const getDeepConnections = (team1, team2) => {
    const data = getMatchupConnections(team1, team2);
    return (data.connections || []).filter(c => c.overlap_duration === 'deep');
  };

  /**
   * Generate narrative text for a matchup
   * @param {string} team1 - First team
   * @param {string} team2 - Second team
   * @returns {string} Human-readable summary of connections
   */
  const generateNarrative = (team1, team2) => {
    const summary = getMatchupSummary(team1, team2);
    const total = summary.total_connections || 0;

    if (total === 0) {
      return `No recorded former teammate connections between ${team1} and ${team2}.`;
    }

    const deep = summary.deep_connections || 0;
    const moderate = summary.moderate_connections || 0;
    const samePos = summary.same_position_group_count || 0;

    let narrative = `${total} former teammate${total === 1 ? '' : 's'} between ${team1} and ${team2}`;

    if (deep > 0) {
      narrative += `, including ${deep} deep connection${deep === 1 ? '' : 's'} (3+ years together)`;
    }

    if (samePos > 0) {
      narrative += `. ${samePos} same-position-group connection${samePos === 1 ? '' : 's'} (practiced daily together)`;
    }

    narrative += '.';

    return narrative;
  };

  return {
    edgeMap,
    matchupIndex,
    getMatchupConnections,
    getPlayerConnections,
    getMatchupSummary,
    getTopConnections,
    getSamePositionConnections,
    getDeepConnections,
    generateNarrative,
  };
}
