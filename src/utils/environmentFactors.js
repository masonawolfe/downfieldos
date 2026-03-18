/**
 * Environment & Travel Factors
 *
 * Quantifies environmental edges in a matchup:
 * - Timezone travel fatigue (West→East, body clock disruption)
 * - Altitude advantage (Denver's thin air)
 * - Surface mismatch (grass team on turf, or vice versa)
 * - Dome/weather shelter
 *
 * These are real, measurable edges. NFL research shows:
 * - West Coast teams traveling East for 1pm ET games perform ~3 pts worse
 * - Denver home teams have a measurable 4th quarter advantage from altitude
 * - Teams practicing on grass underperform on turf (~0.5 pts)
 */

import { STADIUMS, TZ_OFFSETS } from '../data/stadiums';

/**
 * Calculate environment factors for a matchup at a specific venue.
 * @param {string} homeTeam - Home team code (venue team)
 * @param {string} awayTeam - Visiting team code
 * @returns {object} Environment factor analysis
 */
export function calcEnvironmentFactors(homeTeam, awayTeam) {
  const homeStadium = STADIUMS[homeTeam];
  const awayStadium = STADIUMS[awayTeam];

  if (!homeStadium || !awayStadium) {
    return { factors: [], totalEdge: 0, narrative: '' };
  }

  const factors = [];

  // 1. Timezone / Travel fatigue
  const homeOffset = TZ_OFFSETS[homeStadium.tz] || -5;
  const awayOffset = TZ_OFFSETS[awayStadium.tz] || -5;
  const tzDiff = Math.abs(homeOffset - awayOffset);

  if (tzDiff >= 2) {
    const direction = awayOffset < homeOffset ? 'west' : 'east';
    const eastward = direction === 'east'; // Eastward travel is harder on body clock
    factors.push({
      type: 'timezone',
      label: `${tzDiff}hr Time Zone Shift`,
      description: `${awayTeam} travels ${direction} across ${tzDiff} time zone${tzDiff > 1 ? 's' : ''}. ${eastward ? 'Eastward travel is harder on the body clock — early kickoffs feel even earlier.' : 'Westward travel means late-feeling games, but body clock adjustment is easier.'}`,
      edgeFor: homeTeam,
      severity: tzDiff >= 3 ? 'high' : 'moderate',
      icon: 'clock',
    });
  } else if (tzDiff === 1) {
    factors.push({
      type: 'timezone',
      label: '1hr Time Zone Shift',
      description: `Minor timezone adjustment for ${awayTeam}. Minimal fatigue impact.`,
      edgeFor: null,
      severity: 'low',
      icon: 'clock',
    });
  }

  // 2. Altitude
  if (homeStadium.altitude >= 5000) {
    factors.push({
      type: 'altitude',
      label: 'Mile High Altitude',
      description: `${homeStadium.name} sits at ${homeStadium.altitude.toLocaleString()} feet. Thin air affects visiting team conditioning, especially in the 4th quarter. ${homeTeam} players are acclimated; ${awayTeam} will feel it late.`,
      edgeFor: homeTeam,
      severity: 'high',
      icon: 'mountain',
    });
  } else if (homeStadium.altitude >= 2000) {
    factors.push({
      type: 'altitude',
      label: 'Moderate Elevation',
      description: `${homeStadium.name} at ${homeStadium.altitude.toLocaleString()} feet — slight altitude factor that can affect conditioning late in the game.`,
      edgeFor: homeTeam,
      severity: 'low',
      icon: 'mountain',
    });
  }

  // 3. Surface mismatch
  if (homeStadium.surface !== awayStadium.surface) {
    const homeOnGrass = homeStadium.surface === 'grass';
    factors.push({
      type: 'surface',
      label: `${homeOnGrass ? 'Grass' : 'Turf'} Surface`,
      description: `${awayTeam} practices on ${awayStadium.surface} but plays this game on ${homeStadium.surface}. ${homeOnGrass ? 'Natural grass slows down speed teams and requires different footing.' : 'Turf plays faster — speed advantages amplified, but higher injury risk for grass-trained players.'}`,
      edgeFor: homeTeam,
      severity: 'moderate',
      icon: 'surface',
    });
  }

  // 4. Dome vs outdoor
  if (homeStadium.dome && !awayStadium.dome) {
    factors.push({
      type: 'dome',
      label: 'Dome Advantage',
      description: `${homeStadium.name} is climate-controlled. ${homeTeam} never deals with weather disruption at home — passing games thrive indoors.`,
      edgeFor: homeTeam,
      severity: 'low',
      icon: 'dome',
    });
  } else if (!homeStadium.dome && awayStadium.dome) {
    factors.push({
      type: 'weather',
      label: 'Outdoor Elements',
      description: `${awayTeam} plays home games indoors but faces outdoor conditions at ${homeStadium.name}. Weather could be a factor — wind, cold, rain all disrupt precision passing.`,
      edgeFor: homeTeam,
      severity: 'moderate',
      icon: 'weather',
    });
  }

  // Calculate total edge
  const edgeSeverity = { high: 3, moderate: 2, low: 1 };
  const homeEdge = factors.filter(f => f.edgeFor === homeTeam).reduce((sum, f) => sum + edgeSeverity[f.severity], 0);
  const awayEdge = factors.filter(f => f.edgeFor === awayTeam).reduce((sum, f) => sum + edgeSeverity[f.severity], 0);
  const totalEdge = homeEdge - awayEdge;

  const narrative = buildNarrative(homeTeam, awayTeam, factors, totalEdge, homeStadium);

  return {
    factors,
    totalEdge,
    homeStadium: homeStadium.name,
    homeCity: homeStadium.city,
    surface: homeStadium.surface,
    dome: homeStadium.dome,
    narrative,
  };
}

function buildNarrative(homeTeam, awayTeam, factors, totalEdge, stadium) {
  if (factors.length === 0) {
    return `Neutral environment — no significant environmental edges for either team at ${stadium.name}.`;
  }

  const highFactors = factors.filter(f => f.severity === 'high');
  if (highFactors.length > 0) {
    return `Significant environment edge for ${homeTeam} at ${stadium.name}. ${highFactors.map(f => f.label).join(' + ')} create a real disadvantage for ${awayTeam}. ${totalEdge >= 4 ? 'This is one of the toughest road environments in the NFL.' : 'These factors compound over 60 minutes.'}`;
  }

  if (totalEdge >= 3) {
    return `Multiple environmental factors favor ${homeTeam} at ${stadium.name}: ${factors.filter(f => f.edgeFor === homeTeam).map(f => f.label.toLowerCase()).join(', ')}. None individually decisive, but they add up.`;
  }

  return `Minor environmental factors at ${stadium.name}. ${factors[0].description.split('.')[0]}. Not a game-changer, but worth noting for close games.`;
}
