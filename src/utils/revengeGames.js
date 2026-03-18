/**
 * Revenge Game Detection
 *
 * Identifies players facing their former teams and scores the
 * emotional intensity of the matchup (grudge vs gratitude).
 *
 * Uses real nflverse roster data processed by scripts/fetch-nflverse-rosters.js.
 */

import formerTeammatesActive from '../data/intelligence/former_teammates_active.json';

/**
 * Get all players in the current matchup who are facing a former team.
 * A "revenge game" is when a player on team1 previously played for team2, or vice versa.
 *
 * @param {string} team1 - First team code
 * @param {string} team2 - Second team code
 * @returns {array} Array of revenge game objects
 */
export function getRevengeGames(team1, team2) {
  const edges = formerTeammatesActive.edges || {};
  const revengeGames = [];
  const seen = new Set();

  Object.values(edges).forEach(edge => {
    // Direct revenge game edges (player vs former team)
    if (edge.type === 'revenge_game') {
      const p = edge.player_1;
      if (!p) return;

      // Player on team1 facing team2 (their former team)
      if (p.team === team1 && edge.former_team === team2 && !seen.has(p.name + '-' + team2)) {
        seen.add(p.name + '-' + team2);
        revengeGames.push(buildRevengeEntry(p, team1, team2, edge));
      }
      // Player on team2 facing team1 (their former team)
      if (p.team === team2 && edge.former_team === team1 && !seen.has(p.name + '-' + team1)) {
        seen.add(p.name + '-' + team1);
        revengeGames.push(buildRevengeEntry(p, team2, team1, edge));
      }
      return;
    }

    // Former teammate edges — check if either player is facing their former team
    const p1 = edge.player_1;
    const p2 = edge.player_2;
    if (!p1 || !p2) return;

    if (p1.team === team1 && edge.co_teams?.includes(team2) && !seen.has(p1.name + '-' + team2)) {
      seen.add(p1.name + '-' + team2);
      revengeGames.push(buildRevengeEntry(p1, team1, team2, edge));
    }
    if (p2?.team === team1 && edge.co_teams?.includes(team2) && !seen.has(p2.name + '-' + team2)) {
      seen.add(p2.name + '-' + team2);
      revengeGames.push(buildRevengeEntry(p2, team1, team2, edge));
    }
    if (p1.team === team2 && edge.co_teams?.includes(team1) && !seen.has(p1.name + '-' + team1)) {
      seen.add(p1.name + '-' + team1);
      revengeGames.push(buildRevengeEntry(p1, team2, team1, edge));
    }
    if (p2?.team === team2 && edge.co_teams?.includes(team1) && !seen.has(p2.name + '-' + team1)) {
      seen.add(p2.name + '-' + team1);
      revengeGames.push(buildRevengeEntry(p2, team2, team1, edge));
    }
  });

  // Sort by intensity (highest first)
  return revengeGames.sort((a, b) => b.intensity - a.intensity);
}

function buildRevengeEntry(player, currentTeam, formerTeam, edge) {
  const yearsSince = edge.years_since || 0;
  const overlapYears = edge.overlap_years || 1;
  const duration = overlapYears >= 4 ? 'deep' : overlapYears >= 2 ? 'moderate' : 'brief';
  const position = player.pos || player.position || '';

  // Intensity scoring (0-100):
  // Deep overlap + recent departure = high intensity
  // Brief overlap + long ago = low intensity
  const durationScore = duration === 'deep' ? 40 : duration === 'moderate' ? 25 : 10;
  const recencyScore = yearsSince <= 1 ? 40 : yearsSince <= 2 ? 30 : yearsSince <= 4 ? 20 : 10;
  const positionBonus = isImpactPosition(position) ? 20 : 0;
  const intensity = Math.min(durationScore + recencyScore + positionBonus, 100);

  const sentiment = inferSentiment(duration, yearsSince);

  return {
    player: player.name,
    position,
    currentTeam,
    formerTeam,
    yearsSince,
    overlapYears,
    duration,
    intensity,
    sentiment,
    narrative: buildNarrative(player, currentTeam, formerTeam, duration, yearsSince, sentiment),
  };
}

function isImpactPosition(pos) {
  return ['QB', 'WR', 'RB', 'TE', 'CB', 'EDGE', 'LB', 'S', 'DE', 'DT', 'OLB', 'ILB', 'FS', 'SS'].some(p =>
    pos?.toUpperCase().startsWith(p)
  );
}

function inferSentiment(duration, yearsSince) {
  if (duration === 'deep' && yearsSince <= 2) return 'MOTIVATED';
  if (duration === 'deep' && yearsSince > 2) return 'GRATEFUL';
  if (duration === 'brief' && yearsSince <= 2) return 'GRUDGE';
  if (duration === 'brief' && yearsSince > 4) return 'NEUTRAL';
  if (duration === 'moderate' && yearsSince <= 2) return 'MOTIVATED';
  return 'NEUTRAL';
}

function buildNarrative(player, currentTeam, formerTeam, duration, yearsSince, sentiment) {
  const name = player.name;
  const pos = player.pos || player.position || '';

  if (sentiment === 'GRUDGE') {
    return `${name} (${pos}) faces ${formerTeam} after a brief stint ${yearsSince === 1 ? 'last year' : `${yearsSince} years ago`}. Short tenures often end badly — expect extra motivation.`;
  }
  if (sentiment === 'MOTIVATED') {
    return `${name} (${pos}) returns to face ${formerTeam} where ${duration === 'deep' ? 'they spent years building their career' : 'they had a meaningful run'}. ${yearsSince <= 1 ? 'Still fresh — this one matters.' : 'The memories are still vivid.'}`;
  }
  if (sentiment === 'GRATEFUL') {
    return `${name} (${pos}) faces ${formerTeam}, a team that shaped their career over multiple seasons. More nostalgia than rage, but the familiarity is real.`;
  }
  return `${name} (${pos}) has history with ${formerTeam} from ${yearsSince} year${yearsSince === 1 ? '' : 's'} ago. Low emotional charge, but scheme familiarity could still be a factor.`;
}

/**
 * Get revenge game summary for a matchup
 * @param {string} team1
 * @param {string} team2
 * @returns {object} { total, highIntensity, games, headline }
 */
export function getRevengeGameSummary(team1, team2) {
  const games = getRevengeGames(team1, team2);
  const highIntensity = games.filter(g => g.intensity >= 50);

  return {
    total: games.length,
    highIntensity: highIntensity.length,
    games,
    headline: games.length === 0
      ? null
      : highIntensity.length > 0
        ? `${highIntensity.length} High-Intensity Revenge Game${highIntensity.length === 1 ? '' : 's'}`
        : `${games.length} Former Team Connection${games.length === 1 ? '' : 's'}`,
  };
}
