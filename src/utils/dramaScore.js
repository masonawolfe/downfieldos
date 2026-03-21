import { getRevengeGameSummary } from './revengeGames';
import { calcDivisionalFamiliarity } from './divisionalFamiliarity';
import { calcSchemeFamiliarity } from './schemeFamiliarity';
import { calcCoachingTreeOverlap } from './coachingTree';
import { getFreeAgentIntel } from './freeAgentIntel';

/**
 * Calculate a drama score for a game matchup.
 * Higher = more narratively interesting (revenge games, rivalries, coaching drama).
 * Returns { score, factors[] }
 */
export function calcDramaScore(team1, team2) {
  const factors = [];
  let score = 0;

  // Divisional rivalry
  const div = calcDivisionalFamiliarity(team1, team2);
  if (div?.isDivisional) {
    score += 25;
    factors.push({ label: "Divisional rivalry", weight: 25, icon: "🏟️" });
  }

  // Revenge games
  const revenge = getRevengeGameSummary(team1, team2);
  if (revenge?.totalPlayers > 0) {
    const revScore = Math.min(30, revenge.totalPlayers * 8);
    score += revScore;
    factors.push({ label: `${revenge.totalPlayers} revenge game${revenge.totalPlayers > 1 ? 's' : ''}`, weight: revScore, icon: "😤" });
  }

  // Coaching tree overlap
  const coach = calcCoachingTreeOverlap(team1, team2);
  if (coach?.sameTree) {
    score += 15;
    factors.push({ label: `${coach.treeName || 'Same'} coaching tree`, weight: 15, icon: "🌳" });
  }

  // Free agent intel (players who switched between these teams)
  const faIntel = getFreeAgentIntel(team1, team2);
  if (faIntel?.total > 0) {
    const faScore = Math.min(20, faIntel.total * 10);
    score += faScore;
    factors.push({ label: `${faIntel.total} FA move${faIntel.total > 1 ? 's' : ''} between teams`, weight: faScore, icon: "💰" });
  }

  // Scheme familiarity (high = chess match)
  const scheme = calcSchemeFamiliarity(team1, team2);
  if (scheme?.score > 70) {
    score += 10;
    factors.push({ label: "High scheme familiarity", weight: 10, icon: "📋" });
  }

  // Base drama from matchup quality (evenly matched teams are more dramatic)
  score += 10; // base

  return { score: Math.min(100, score), factors, team1, team2 };
}

/**
 * Rank all possible matchups by drama score.
 * Returns top N matchups sorted by drama.
 */
export function getTopDramaMatchups(teams, count = 10) {
  const matchups = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matchups.push(calcDramaScore(teams[i], teams[j]));
    }
  }
  return matchups.sort((a, b) => b.score - a.score).slice(0, count);
}
