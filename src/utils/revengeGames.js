/**
 * Revenge Game Detection
 *
 * Identifies players facing their former teams and scores the
 * emotional intensity of the matchup (grudge vs gratitude).
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
    const p1 = edge.player_1;
    const p2 = edge.player_2;

    // Player on team1 who previously played for team2
    if (p1.team === team1 && edge.co_teams?.includes(team2) && !seen.has(p1.id + '-' + team2)) {
      seen.add(p1.id + '-' + team2);
      revengeGames.push(buildRevengeEntry(p1, team1, team2, edge));
    }
    if (p2.team === team1 && edge.co_teams?.includes(team2) && !seen.has(p2.id + '-' + team2)) {
      seen.add(p2.id + '-' + team2);
      revengeGames.push(buildRevengeEntry(p2, team1, team2, edge));
    }

    // Player on team2 who previously played for team1
    if (p1.team === team2 && edge.co_teams?.includes(team1) && !seen.has(p1.id + '-' + team1)) {
      seen.add(p1.id + '-' + team1);
      revengeGames.push(buildRevengeEntry(p1, team2, team1, edge));
    }
    if (p2.team === team2 && edge.co_teams?.includes(team1) && !seen.has(p2.id + '-' + team1)) {
      seen.add(p2.id + '-' + team1);
      revengeGames.push(buildRevengeEntry(p2, team2, team1, edge));
    }
  });

  // Sort by intensity (highest first)
  return revengeGames.sort((a, b) => b.intensity - a.intensity);
}

function buildRevengeEntry(player, currentTeam, formerTeam, edge) {
  const yearsSince = edge.years_since_overlap || 0;
  const duration = edge.overlap_duration;

  // Intensity scoring (0-100):
  // Deep overlap + recent departure = high intensity
  // Brief overlap + long ago = low intensity
  const durationScore = duration === 'deep' ? 40 : duration === 'moderate' ? 25 : 10;
  const recencyScore = yearsSince <= 1 ? 40 : yearsSince <= 2 ? 30 : yearsSince <= 4 ? 20 : 10;
  const positionBonus = isImpactPosition(player.position) ? 20 : 0;
  const intensity = Math.min(durationScore + recencyScore + positionBonus, 100);

  // Sentiment inference based on duration and recency
  // Long tenure + left = likely mixed/positive (gratitude)
  // Short tenure + recent = likely negative (cut/traded)
  const sentiment = inferSentiment(duration, yearsSince);

  return {
    player: player.name,
    position: player.position,
    currentTeam,
    formerTeam,
    yearsSince,
    duration,
    intensity,
    sentiment,
    narrative: buildNarrative(player, currentTeam, formerTeam, duration, yearsSince, sentiment),
  };
}

function isImpactPosition(pos) {
  return ['QB', 'WR1', 'WR2', 'RB1', 'TE1', 'CB1', 'EDGE1', 'LB1', 'S1'].some(p =>
    pos?.toUpperCase().includes(p.replace(/[0-9]/g, ''))
  );
}

function inferSentiment(duration, yearsSince) {
  // Heuristic sentiment inference:
  // Deep tenure + recent departure = MIXED (could be grudge or gratitude)
  // Brief tenure + recent = likely GRUDGE (cut/didn't work out)
  // Deep tenure + long ago = GRATITUDE (career chapter)
  // Brief tenure + long ago = NEUTRAL (forgotten)
  if (duration === 'deep' && yearsSince <= 2) return 'MOTIVATED';
  if (duration === 'deep' && yearsSince > 2) return 'GRATEFUL';
  if (duration === 'brief' && yearsSince <= 2) return 'GRUDGE';
  if (duration === 'brief' && yearsSince > 4) return 'NEUTRAL';
  if (duration === 'moderate' && yearsSince <= 2) return 'MOTIVATED';
  return 'NEUTRAL';
}

function buildNarrative(player, currentTeam, formerTeam, duration, yearsSince, sentiment) {
  const name = player.name;
  const pos = player.position;

  if (sentiment === 'GRUDGE') {
    return `${name} (${pos}) faces ${formerTeam} after a brief stint ${yearsSince === 1 ? 'last year' : `${yearsSince} years ago`}. Short tenures often end badly — expect extra motivation.`;
  }
  if (sentiment === 'MOTIVATED') {
    return `${name} (${pos}) returns to face ${formerTeam} where ${duration === 'deep' ? 'they spent years building their career' : 'they had a meaningful run'}. ${yearsSince <= 1 ? 'Still fresh — this one matters.' : 'The memories are still vivid.'}`;
  }
  if (sentiment === 'GRATEFUL') {
    return `${name} (${pos}) faces ${formerTeam}, a team that shaped their career over multiple seasons. More nostalgia than rage, but the familiarity is real.`;
  }
  return `${name} (${pos}) has history with ${formerTeam} from ${yearsSince} years ago. Low emotional charge, but scheme familiarity could still be a factor.`;
}

/**
 * Get revenge game summary for a matchup
 * @param {string} team1
 * @param {string} team2
 * @returns {object} { total, highIntensity, narratives }
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
