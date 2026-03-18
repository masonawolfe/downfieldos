/**
 * Scheme Familiarity Score
 *
 * How similar is the opponent's scheme to what a team sees in practice?
 * High familiarity = comfort (QB faces similar looks daily).
 * Low familiarity = foreign looks, potential confusion.
 *
 * Uses team DNA profiles (pass rate, efficiency, explosive rate) as
 * proxy for scheme identity until nflverse coverage/blitz data is integrated.
 */

import { DNA } from '../data/dna';

/**
 * Calculate scheme similarity between two teams (0-100).
 * Compares offensive DNA profiles to determine how similar the schemes are.
 *
 * @param {string} team1 - First team code
 * @param {string} team2 - Second team code
 * @returns {number} Similarity score 0-100 (higher = more similar)
 */
export function schemeSimilarity(team1, team2) {
  const d1 = DNA[team1];
  const d2 = DNA[team2];
  if (!d1 || !d2) return 50; // default middle

  // Compare pass rate, efficiency, explosive rate
  const prDiff = Math.abs(d1.p - d2.p);     // pass rate
  const effDiff = Math.abs(d1.e - d2.e);     // efficiency
  const xrDiff = Math.abs(d1.x - d2.x);     // explosive rate

  // Max realistic diffs: pr ~0.18, eff ~0.19, xr ~0.07
  // Normalize each to 0-1 (1 = identical)
  const prSim = Math.max(0, 1 - prDiff / 0.18);
  const effSim = Math.max(0, 1 - effDiff / 0.19);
  const xrSim = Math.max(0, 1 - xrDiff / 0.07);

  // Weighted: pass rate matters most (scheme identity), then efficiency, then explosiveness
  const raw = prSim * 0.45 + effSim * 0.35 + xrSim * 0.20;
  return Math.round(raw * 100);
}

/**
 * Calculate how familiar a team's offense is with the opposing defense's scheme.
 * Logic: The offense practices against its OWN defense daily. If the opponent's
 * defense runs a similar scheme, the QB has seen those looks all week in practice.
 *
 * @param {string} offTeam - Offensive team code
 * @param {string} defTeam - Defensive team code
 * @returns {object} { score, label, narrative }
 */
export function calcSchemeFamiliarity(offTeam, defTeam) {
  // Compare opponent's defense to the offense's OWN defense (practice looks)
  // Since DNA is offense-focused, we compare defensive profiles via their
  // offensive tendencies (teams that run similar offenses tend to practice
  // similar defensive schemes)
  const score = schemeSimilarity(offTeam, defTeam);

  const label = score >= 75 ? 'Very Familiar'
    : score >= 60 ? 'Familiar'
    : score >= 40 ? 'Moderate'
    : score >= 25 ? 'Unfamiliar'
    : 'Foreign';

  const tone = score >= 75 ? 'positive'
    : score >= 60 ? 'neutral'
    : score >= 40 ? 'neutral'
    : 'warning';

  const d1 = DNA[offTeam];
  const d2 = DNA[defTeam];

  let narrative = '';
  if (score >= 75) {
    narrative = `${offTeam}'s offense should feel comfortable. ${defTeam} runs a scheme profile very similar to what ${offTeam} sees in practice daily. The QB has seen these looks all week.`;
  } else if (score >= 60) {
    narrative = `Decent scheme familiarity. ${defTeam}'s defensive tendencies overlap enough with ${offTeam}'s practice looks that there shouldn't be many surprises.`;
  } else if (score >= 40) {
    narrative = `Mixed familiarity. ${defTeam} runs some looks ${offTeam} has seen, but enough variation to force adjustments. Preparation matters here.`;
  } else {
    const reason = d1 && d2 && Math.abs(d1.p - d2.p) > 0.06
      ? `${offTeam} is ${d1.p > d2.p ? 'pass-heavy' : 'run-heavy'} while ${defTeam} is built to face the opposite.`
      : `These teams operate in very different schematic worlds.`;
    narrative = `Low familiarity — ${reason} Expect some uncomfortable looks for the offense early.`;
  }

  return { score, label, tone, narrative };
}

/**
 * Get the most and least familiar opponents for a team.
 * @param {string} team - Team code
 * @param {number} limit - How many to return per category
 * @returns {object} { mostFamiliar, leastFamiliar }
 */
export function getFamiliarityExtremes(team, limit = 5) {
  const teams = Object.keys(DNA).filter(t => t !== team);
  const scored = teams.map(t => ({
    team: t,
    ...calcSchemeFamiliarity(team, t),
  }));
  scored.sort((a, b) => b.score - a.score);

  return {
    mostFamiliar: scored.slice(0, limit),
    leastFamiliar: scored.slice(-limit).reverse(),
  };
}
