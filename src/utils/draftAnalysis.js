import { DRAFT_NEEDS_2026 } from '../data/draftNeeds2026';
import draftProspects from '../data/draftProspects2026.json';

/**
 * Generate instant analysis for a draft pick.
 * Returns tweet, analysis paragraph, and fantasy impact.
 *
 * @param {string} team - 3-letter abbreviation (e.g., "CHI")
 * @param {string} playerId - prospect id from draftProspects2026.json
 * @param {number} [pickNumber] - overall pick number (optional, for display)
 * @returns {{ tweet: string, analysis: string, fantasyImpact: string, schemeFit: string }}
 */
export function analyzeDraftPick(team, playerId, pickNumber) {
  const prospect = draftProspects.find(p => p.id === playerId);
  if (!prospect) return { tweet: '', analysis: '', fantasyImpact: '', schemeFit: '' };

  const needs = DRAFT_NEEDS_2026[team] || [];
  const needRank = needs.indexOf(prospect.position) + 1;
  const isTopNeed = needRank > 0 && needRank <= 2;
  const isNeed = needRank > 0;
  const isTargeted = prospect.topFitTeams?.includes(team);

  // Scheme fit score (0-100)
  const schemeFitScore = isTargeted ? 92 : isTopNeed ? 85 : isNeed ? 70 : 50;
  const schemeFit = schemeFitScore >= 85 ? 'Elite' : schemeFitScore >= 70 ? 'Strong' : schemeFitScore >= 55 ? 'Moderate' : 'Project';

  // Need assessment
  const needLabel = isTopNeed ? 'top-2 need' : isNeed ? `need (#${needRank})` : 'off-board pick';

  // Pick display
  const pickStr = pickNumber ? `Pick ${pickNumber}: ` : '';

  // ── Tweet (under 280 chars) ──
  const comp = prospect.comparisonPlayer ? ` (comp: ${prospect.comparisonPlayer})` : '';
  const tweet = `${pickStr}${team} selects ${prospect.name}, ${prospect.position} — ${prospect.school}${comp}. ${isTopNeed ? '✅ Fills a ' + needLabel + '.' : isNeed ? '📋 Addresses ' + needLabel + '.' : '🤔 Reach — not a listed need.'} Scheme fit: ${schemeFit}.`;

  // ── Analysis paragraph ──
  const strengthsStr = prospect.strengths?.slice(0, 2).join(' and ') || 'solid all-around tools';
  const riskStr = prospect.risks?.[0] || 'no major red flags';
  const statsLine = buildStatsLine(prospect);

  const analysis = [
    `${team} ${isTopNeed ? 'addresses a critical need' : isNeed ? 'fills a roster gap' : 'makes a surprising selection'} with ${prospect.name} out of ${prospect.school}.`,
    `${prospect.name} brings ${strengthsStr} to a ${team} roster that listed ${prospect.position} as ${isNeed ? `their #${needRank} priority` : 'a non-priority'} entering the draft.`,
    statsLine ? `In his final college season: ${statsLine}.` : '',
    `The main concern: ${riskStr}.`,
    prospect.comparisonPlayer ? `NFL comp: ${prospect.comparisonPlayer} — ${schemeFit.toLowerCase()} scheme fit for ${team}'s system.` : `Scheme fit: ${schemeFit} for ${team}'s system.`,
  ].filter(Boolean).join(' ');

  // ── Fantasy impact ──
  const fantasyImpact = buildFantasyImpact(prospect, team, isTopNeed);

  return { tweet, analysis, fantasyImpact, schemeFit, schemeFitScore, needRank, isTopNeed };
}

function buildStatsLine(prospect) {
  const s = prospect.collegeStats;
  if (!s) return '';
  const parts = [];
  if (s.completionPct) parts.push(`${s.completionPct}% completion`);
  if (s.passingYards) parts.push(`${s.passingYards.toLocaleString()} pass yards`);
  if (s.passingTDs) parts.push(`${s.passingTDs} TDs`);
  if (s.rushingYards) parts.push(`${s.rushingYards.toLocaleString()} rush yards`);
  if (s.tackles) parts.push(`${s.tackles} tackles`);
  if (s.sacks) parts.push(`${s.sacks} sacks`);
  if (s.receptions) parts.push(`${s.receptions} receptions`);
  if (s.receivingYards) parts.push(`${s.receivingYards.toLocaleString()} rec yards`);
  return parts.join(', ');
}

function buildFantasyImpact(prospect, team, isTopNeed) {
  const pos = prospect.position;
  if (pos === 'QB') {
    return isTopNeed
      ? `Day 1 starter potential. ${team}'s QB room gets a massive upgrade. Monitor for Week 1 starting role — could be a late-round fantasy target in redraft.`
      : `Developmental pick. Unlikely to impact fantasy in Year 1 unless the veteran falters.`;
  }
  if (pos === 'RB') {
    return isTopNeed
      ? `Immediate fantasy relevance. ${team} needed a featured back — ${prospect.name} could see 15+ touches per game by mid-season. Draft as RB3/flex in redraft.`
      : `Timeshare risk. ${team} has backs on the roster. ${prospect.name} will need to earn the lead role. Dynasty stash, not a redraft priority.`;
  }
  if (pos === 'WR') {
    return isTopNeed
      ? `Target magnet in waiting. ${team} needed a playmaker outside — ${prospect.name} should see 5+ targets per game by Week 4. Late-round flier in redraft.`
      : `Crowded receiver room. ${prospect.name} may need time to climb the depth chart. Dynasty buy, limited Year 1 redraft value.`;
  }
  if (pos === 'TE') {
    return `Tight ends rarely produce in Year 1. ${prospect.name} is a dynasty stash — don't overdraft in redraft leagues.`;
  }
  // Defensive positions
  return `Defensive pick — no direct fantasy impact. However, ${team}'s defense improving helps the entire offensive environment. Monitor for IDP leagues.`;
}

/**
 * Get all prospects that fit a team's needs.
 * @param {string} team
 * @returns {Array} sorted by fit quality
 */
export function getTeamProspects(team) {
  const needs = DRAFT_NEEDS_2026[team] || [];
  const posMatch = (need, pos) => {
    if (need === pos) return true;
    if (need === 'OL' && (pos === 'OT' || pos === 'IOL' || pos === 'OL')) return true;
    if (need === 'DL' && (pos === 'DL' || pos === 'DT')) return true;
    if (need === 'EDGE' && (pos === 'EDGE' || pos === 'DE')) return true;
    return false;
  };

  return draftProspects
    .map(p => {
      const isTargeted = p.topFitTeams?.includes(team);
      const needIdx = needs.findIndex(n => posMatch(n, p.position));
      const score = isTargeted ? 100 : needIdx === 0 ? 90 : needIdx === 1 ? 80 : needIdx >= 0 ? 70 : 30;
      return { ...p, fitScore: score, needRank: needIdx + 1 };
    })
    .filter(p => p.fitScore > 30)
    .sort((a, b) => b.fitScore - a.fitScore || a.projectedRound - b.projectedRound);
}
