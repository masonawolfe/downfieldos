/**
 * Film Study Asymmetry
 *
 * Quantifies how much game film is available for each team in a matchup.
 * Early season = less film = more unpredictable.
 * New coordinators = prior year film is less useful.
 * Teams coming off a bye = extra prep time.
 *
 * This utility computes a "film edge" for any given week.
 */

import { COACHING_TREES } from '../data/coachingTrees';

/**
 * Coordinators in their first year with a new team (2026 season).
 * New OC/DC means prior-year film is less predictive —
 * the new scheme is still being installed.
 *
 * Sourced from 2026 offseason coaching changes.
 */
const NEW_COORDINATORS_2026 = {
  // team: { oc: boolean, dc: boolean }
  // Only teams with known 2026 coaching changes
  ATL: { oc: false, dc: false },
  CHI: { oc: false, dc: false },
  // Add more as offseason coaching changes are confirmed
};

/**
 * Calculate film study factors for a matchup at a given week
 *
 * @param {string} team1 - First team code
 * @param {string} team2 - Second team code
 * @param {number} week - Game week (1-18)
 * @returns {object} Film study analysis
 */
export function calcFilmStudy(team1, team2, week = 1) {
  const gamesPlayed = Math.max(0, week - 1);
  const factors = [];

  // Film volume assessment
  const filmVolume = getFilmVolumeLabel(gamesPlayed);

  if (gamesPlayed === 0) {
    factors.push({
      label: 'Zero Current-Year Film',
      description: 'Week 1 — both teams are operating blind. Scouting is based entirely on preseason and last year\'s tendencies. New schemes are hardest to prepare for here.',
      severity: 'high',
      affectsTeam: 'both',
    });
  } else if (gamesPlayed <= 3) {
    factors.push({
      label: 'Limited Film Sample',
      description: `Only ${gamesPlayed} game${gamesPlayed === 1 ? '' : 's'} of current-year film available. Defensive coordinators are still pattern-matching, and offenses haven\'t fully opened the playbook yet.`,
      severity: 'moderate',
      affectsTeam: 'both',
    });
  } else if (gamesPlayed >= 10) {
    factors.push({
      label: 'Deep Film Library',
      description: `${gamesPlayed} games of film available. Both defensive coordinators have extensive data on tendencies, formations, and play-calling patterns. Surprise factor is minimal.`,
      severity: 'low',
      affectsTeam: 'both',
    });
  }

  // New coordinator asymmetry
  const t1NewCoord = checkNewCoordinator(team1);
  const t2NewCoord = checkNewCoordinator(team2);

  if (t1NewCoord && gamesPlayed <= 4) {
    factors.push({
      label: `${team1} New ${t1NewCoord} Scheme`,
      description: `New coordinator still installing scheme. Prior-year film on ${team1} is unreliable — expect new wrinkles each week.`,
      severity: gamesPlayed <= 2 ? 'high' : 'moderate',
      affectsTeam: team2,
    });
  }

  if (t2NewCoord && gamesPlayed <= 4) {
    factors.push({
      label: `${team2} New ${t2NewCoord} Scheme`,
      description: `New coordinator still installing scheme. Prior-year film on ${team2} is unreliable — expect new wrinkles each week.`,
      severity: gamesPlayed <= 2 ? 'high' : 'moderate',
      affectsTeam: team1,
    });
  }

  // Scheme installation curve
  const installationAge = getInstallationAge(gamesPlayed);

  // Build narrative
  const narrative = buildFilmNarrative(team1, team2, gamesPlayed, factors);

  return {
    week,
    gamesPlayed,
    filmVolume,
    installationAge,
    factors,
    narrative,
  };
}

function getFilmVolumeLabel(gamesPlayed) {
  if (gamesPlayed === 0) return 'None';
  if (gamesPlayed <= 2) return 'Minimal';
  if (gamesPlayed <= 5) return 'Limited';
  if (gamesPlayed <= 10) return 'Moderate';
  return 'Extensive';
}

function getInstallationAge(gamesPlayed) {
  if (gamesPlayed <= 2) return { label: 'Early Installation', predictability: 'low', description: 'Schemes are basic — coordinators haven\'t shown their full playbook yet' };
  if (gamesPlayed <= 5) return { label: 'Expanding', predictability: 'moderate', description: 'Playbook opening up week by week, but still evolving' };
  if (gamesPlayed <= 10) return { label: 'Established', predictability: 'high', description: 'Full scheme installed. Tendencies are locked in and well-scouted' };
  return { label: 'Late Season', predictability: 'very_high', description: 'Maximum film available. Both teams know exactly what to expect' };
}

function checkNewCoordinator(team) {
  const newCoord = NEW_COORDINATORS_2026[team];
  if (!newCoord) return null;
  if (newCoord.oc) return 'OC';
  if (newCoord.dc) return 'DC';
  return null;
}

function buildFilmNarrative(team1, team2, gamesPlayed, factors) {
  if (gamesPlayed === 0) {
    return `Week 1 — zero current-year film for either side. Both defenses are game-planning off preseason and prior-year tendencies. New coordinators have the biggest advantage here because their scheme is a blank slate.`;
  }

  if (gamesPlayed <= 3) {
    return `Only ${gamesPlayed} game${gamesPlayed === 1 ? '' : 's'} of 2026 film available. Scouting reports are thin. Expect base schemes with selective wrinkles — coordinators are still feeling out what works.`;
  }

  if (gamesPlayed >= 12) {
    return `${gamesPlayed} games of data. Both teams are fully scouted. No surprises in base concepts. The edge goes to in-game adjustments and one-off wrinkles, not scheme novelty.`;
  }

  return `${gamesPlayed} games of film available. Tendencies are forming, but coordinators still have room to surprise. Mid-season matchups reward the team that adjusts faster.`;
}
