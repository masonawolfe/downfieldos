/**
 * Matchup Intelligence Summary
 *
 * Combines all intelligence signals into a unified matchup narrative
 * and composite score. This is the "so what?" layer on top of
 * the individual intelligence cards.
 */

/**
 * Generate a composite intelligence summary for a matchup
 *
 * @param {object} params - All computed intelligence signals
 * @param {string} params.offTm - Offense team code
 * @param {string} params.defTm - Defense team code
 * @param {object} params.schemeFam - from calcSchemeFamiliarity
 * @param {object} params.coachTree - from calcCoachingTreeOverlap
 * @param {object} params.divFam - from calcDivisionalFamiliarity
 * @param {object} params.envFactors - from calcEnvironmentFactors
 * @param {object} params.revenge - from getRevengeGameSummary
 * @param {object} params.faIntel - from getFreeAgentIntel
 * @param {number} params.chemScore - from calculateChemistryScore
 * @returns {object} { totalSignals, keyEdges, narrative, topInsight }
 */
export function generateMatchupIntelSummary({
  offTm, defTm,
  schemeFam, coachTree, divFam, envFactors, revenge, faIntel, chemScore
}) {
  const edges = [];

  // Scheme Familiarity — high familiarity benefits the offense
  if (schemeFam) {
    const score = schemeFam.score || 0;
    if (score >= 70) {
      edges.push({ signal: 'Scheme Familiarity', impact: 'positive', weight: 3, detail: `${offTm} sees similar looks in practice (score: ${score})` });
    } else if (score <= 30) {
      edges.push({ signal: 'Scheme Unfamiliarity', impact: 'negative', weight: 2, detail: `${offTm} faces unfamiliar defensive looks (score: ${score})` });
    }
  }

  // Coaching Tree — shared trees mean scheme predictability
  if (coachTree && coachTree.overlapScore >= 50) {
    edges.push({ signal: 'Coaching Tree Overlap', impact: 'neutral', weight: 2, detail: `Shared coaching lineage means both sides know the playbook DNA` });
  }

  // Divisional Familiarity — rivals know each other deeply
  if (divFam) {
    if (divFam.familiarity >= 80) {
      edges.push({ signal: 'Division Rivalry', impact: 'neutral', weight: 3, detail: 'These teams play twice a year — no secrets, no surprises' });
    } else if (divFam.familiarity >= 40) {
      edges.push({ signal: 'Conference Familiarity', impact: 'neutral', weight: 1, detail: 'Conference opponents with some scheme familiarity' });
    }
  }

  // Environment — home field advantages
  if (envFactors && envFactors.factors) {
    const highFactors = envFactors.factors.filter(f => f.severity === 'high');
    if (highFactors.length > 0) {
      edges.push({ signal: 'Environment Edge', impact: 'negative', weight: 3, detail: `${highFactors.length} significant environment factor${highFactors.length > 1 ? 's' : ''} working against the visitor` });
    } else if (envFactors.factors.filter(f => f.severity === 'moderate').length > 0) {
      edges.push({ signal: 'Environment Factor', impact: 'negative', weight: 1, detail: 'Moderate environment factors in play' });
    }
  }

  // Revenge Games — emotional motivation
  if (revenge && revenge.highIntensity > 0) {
    edges.push({ signal: 'Revenge Factor', impact: 'wild_card', weight: 2, detail: `${revenge.highIntensity} player${revenge.highIntensity > 1 ? 's' : ''} with high emotional stakes` });
  }

  // Free Agent Intel — playbook knowledge transfer
  if (faIntel && faIntel.total > 0) {
    if (faIntel.eliteMoves > 0) {
      edges.push({ signal: 'Playbook Intel', impact: 'positive', weight: 3, detail: `${faIntel.eliteMoves} elite-value intel transfer${faIntel.eliteMoves > 1 ? 's' : ''} in this matchup` });
    } else if (faIntel.highMoves > 0) {
      edges.push({ signal: 'Scheme Knowledge', impact: 'positive', weight: 2, detail: `${faIntel.total} player${faIntel.total > 1 ? 's' : ''} carrying former team knowledge` });
    }
  }

  // Former Teammates — chemistry and insider knowledge
  if (chemScore && chemScore > 50) {
    edges.push({ signal: 'Cross-Roster Chemistry', impact: 'neutral', weight: 1, detail: `Strong former teammate connections (chemistry: ${chemScore})` });
  }

  // Sort by weight
  edges.sort((a, b) => b.weight - a.weight);

  // Build top insight
  const topInsight = edges.length > 0
    ? edges[0].detail
    : 'No significant intelligence edges detected in this matchup.';

  // Count signal categories
  const totalSignals = edges.length;
  const positiveEdges = edges.filter(e => e.impact === 'positive').length;
  const negativeEdges = edges.filter(e => e.impact === 'negative').length;
  const wildCards = edges.filter(e => e.impact === 'wild_card').length;

  // Build narrative
  let narrative = '';
  if (totalSignals === 0) {
    narrative = 'Clean matchup — no significant intelligence asymmetries. This one comes down to on-field execution.';
  } else if (positiveEdges > negativeEdges) {
    narrative = `Intelligence favors the offense here. ${positiveEdges} positive signal${positiveEdges > 1 ? 's' : ''} suggest familiarity and knowledge advantages.`;
  } else if (negativeEdges > positiveEdges) {
    narrative = `Environmental and situational factors work against the visiting offense. ${negativeEdges} factor${negativeEdges > 1 ? 's' : ''} to monitor.`;
  } else {
    narrative = `Balanced intelligence picture — ${totalSignals} signals in play, but no clear asymmetry. Watch the wild cards.`;
  }

  if (wildCards > 0) {
    narrative += ` Plus ${wildCards} emotional wild card${wildCards > 1 ? 's' : ''} that could swing the game.`;
  }

  return {
    edges,
    totalSignals,
    positiveEdges,
    negativeEdges,
    wildCards,
    topInsight,
    narrative,
  };
}
