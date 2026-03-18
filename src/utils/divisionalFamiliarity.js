/**
 * Divisional Familiarity Multiplier
 *
 * Teams in the same division play each other 2x/year and have deep
 * mutual scheme familiarity built over years of head-to-head matchups.
 * This familiarity is real — coordinators game-plan for divisional
 * opponents differently, players know tendencies from repetition,
 * and historical context compounds every season.
 *
 * Same-conference non-divisional teams meet roughly every 3 years.
 * Cross-conference teams meet every 4 years.
 */

import { T } from '../data/teams';

// Build lookup for fast access
const teamLookup = {};
T.forEach(t => { teamLookup[t.a] = t; });

/**
 * Calculate divisional familiarity between two teams.
 * @param {string} team1 - First team code
 * @param {string} team2 - Second team code
 * @returns {object} { relationship, familiarity, multiplier, narrative }
 */
export function calcDivisionalFamiliarity(team1, team2) {
  const t1 = teamLookup[team1];
  const t2 = teamLookup[team2];

  if (!t1 || !t2 || team1 === team2) {
    return { relationship: 'N/A', familiarity: 0, multiplier: 1.0, narrative: '' };
  }

  const sameDivision = t1.c === t2.c && t1.d === t2.d;
  const sameConference = t1.c === t2.c;

  if (sameDivision) {
    return {
      relationship: 'Division Rival',
      familiarity: 95,
      multiplier: 1.25,
      gamesPerYear: 2,
      badge: 'DIVISION',
      tone: 'hot',
      narrative: `${t1.n} and ${t2.n} are ${t1.c} ${t1.d} division rivals — they play each other twice every season. Both staffs have years of film study on each other's tendencies, adjustments, and personnel packages. Familiarity cuts both ways: no surprises, but also no hiding weaknesses. Divisional games are won on execution, not scheme.`,
    };
  }

  if (sameConference) {
    return {
      relationship: 'Conference Opponent',
      familiarity: 40,
      multiplier: 1.05,
      gamesPerYear: 0.33,
      badge: 'CONFERENCE',
      tone: 'warm',
      narrative: `${t1.n} and ${t2.n} are both in the ${t1.c} but different divisions. They meet roughly once every three years in the regular season, with occasional playoff matchups. Some familiarity from shared opponents and conference film study, but not the deep knowledge of divisional rivals.`,
    };
  }

  return {
    relationship: 'Cross-Conference',
    familiarity: 15,
    multiplier: 1.0,
    gamesPerYear: 0.25,
    badge: 'CROSS-CONF',
    tone: 'cold',
    narrative: `${t1.n} (${t1.c}) and ${t2.n} (${t2.c}) are cross-conference opponents — they meet roughly once every four years. Limited mutual familiarity means both staffs are working primarily from film study rather than lived experience. Less predictable game script.`,
  };
}

/**
 * Get all divisional rivals for a team.
 * @param {string} team - Team code
 * @returns {string[]} Array of team codes in the same division
 */
export function getDivisionalRivals(team) {
  const t = teamLookup[team];
  if (!t) return [];
  return T.filter(other => other.a !== team && other.c === t.c && other.d === t.d).map(other => other.a);
}
