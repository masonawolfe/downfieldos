/**
 * Free Agent Intelligence
 *
 * Detects players in a matchup who recently moved between the two teams
 * via free agency or trade. These players carry playbook knowledge,
 * locker room intel, and scheme familiarity from their former team.
 *
 * Uses FA_MOVES_2026 data.
 */

import { FA_MOVES_2026 } from '../data/faMoves2026';
import { tn } from './formatters';

/**
 * Classify how much intel value a position carries
 * QB/OC/DC-level positions know the full playbook.
 * Skill players know route concepts and tendencies.
 * Linemen know blocking schemes and protection calls.
 */
function intelWeight(pos) {
  const p = (pos || '').toUpperCase();
  if (p === 'QB') return { weight: 100, tier: 'ELITE', reason: 'Knows the full playbook, audibles, signals, and protection calls' };
  if (['OC', 'DC', 'HC'].includes(p)) return { weight: 95, tier: 'ELITE', reason: 'Coordinator-level scheme knowledge' };
  if (['WR', 'TE'].includes(p)) return { weight: 70, tier: 'HIGH', reason: 'Knows route concepts, hot reads, and tendencies' };
  if (['RB'].includes(p)) return { weight: 65, tier: 'HIGH', reason: 'Knows run schemes, pass protection assignments, and audible checks' };
  if (['CB', 'S', 'FS', 'SS'].includes(p)) return { weight: 60, tier: 'MODERATE', reason: 'Knows coverage schemes, disguises, and blitz packages' };
  if (['EDGE', 'DE', 'OLB', 'DT', 'DL'].includes(p)) return { weight: 55, tier: 'MODERATE', reason: 'Knows pass rush packages and front alignments' };
  if (['LB', 'ILB', 'MLB'].includes(p)) return { weight: 55, tier: 'MODERATE', reason: 'Knows defensive playcalls and alignment signals' };
  if (['OT', 'OG', 'C', 'OL'].includes(p)) return { weight: 50, tier: 'MODERATE', reason: 'Knows blocking schemes and protection calls' };
  return { weight: 30, tier: 'LOW', reason: 'Limited scheme intel value' };
}

/**
 * Determine if a player moved from one team to the other
 * Returns move details if found, null otherwise
 */
function findMoveBetweenTeams(team1, team2) {
  const moves = [];
  const t1Data = FA_MOVES_2026[team1];
  const t2Data = FA_MOVES_2026[team2];

  if (!t1Data || !t2Data) return moves;

  // Check team1's additions against team2's losses
  const t2Lost = new Set((t2Data.lost || []).map(p => p.name));
  (t1Data.added || []).forEach(player => {
    // Direct match: player in team1's added list AND team2's lost list
    if (t2Lost.has(player.name)) {
      moves.push({
        player: player.name,
        position: player.pos,
        from: team2,
        to: team1,
        deal: player.deal || null,
        note: player.note || null,
        direction: 'departed', // left team2, now on team1
      });
    }
    // Also check for trade/move notes mentioning the other team (by name or abbreviation)
    if (player.note && !t2Lost.has(player.name)) {
      const noteLower = player.note.toLowerCase();
      if (noteLower.includes(`from ${tn(team2).toLowerCase()}`) || noteLower.includes(`from ${team2.toLowerCase()}`)) {
        moves.push({
          player: player.name,
          position: player.pos,
          from: team2,
          to: team1,
          deal: player.deal || null,
          note: player.note || null,
          direction: 'traded',
        });
      }
    }
  });

  // Check team2's additions against team1's losses
  const t1Lost = new Set((t1Data.lost || []).map(p => p.name));
  (t2Data.added || []).forEach(player => {
    if (t1Lost.has(player.name)) {
      moves.push({
        player: player.name,
        position: player.pos,
        from: team1,
        to: team2,
        deal: player.deal || null,
        note: player.note || null,
        direction: 'departed',
      });
    }
    if (player.note && !t1Lost.has(player.name)) {
      const noteLower = player.note.toLowerCase();
      if (noteLower.includes(`from ${tn(team1).toLowerCase()}`) || noteLower.includes(`from ${team1.toLowerCase()}`)) {
        moves.push({
          player: player.name,
          position: player.pos,
          from: team1,
          to: team2,
          deal: player.deal || null,
          note: player.note || null,
          direction: 'traded',
        });
      }
    }
  });

  return moves;
}

/**
 * Get free agent intelligence for a matchup
 * Returns enriched move data with intel scores and narratives
 */
export function getFreeAgentIntel(team1, team2) {
  const rawMoves = findMoveBetweenTeams(team1, team2);

  const moves = rawMoves.map(move => {
    const intel = intelWeight(move.position);
    return {
      ...move,
      intelScore: intel.weight,
      intelTier: intel.tier,
      intelReason: intel.reason,
      narrative: buildMoveNarrative(move, intel),
    };
  });

  // Sort by intel score (highest first)
  moves.sort((a, b) => b.intelScore - a.intelScore);

  const totalIntel = moves.reduce((sum, m) => sum + m.intelScore, 0);
  const maxIntel = Math.min(totalIntel, 100);
  const eliteMoves = moves.filter(m => m.intelTier === 'ELITE');
  const highMoves = moves.filter(m => m.intelTier === 'HIGH');

  return {
    moves,
    total: moves.length,
    intelScore: maxIntel,
    eliteMoves: eliteMoves.length,
    highMoves: highMoves.length,
    headline: buildHeadline(moves, team1, team2),
    narrative: buildSummaryNarrative(moves, team1, team2),
  };
}

function buildMoveNarrative(move, intel) {
  const name = move.player;
  const pos = move.position;
  const from = tn(move.from);
  const to = tn(move.to);

  if (intel.tier === 'ELITE') {
    return `${name} (${pos}) moved from ${from} to ${to}. ${intel.reason}. This is a significant intelligence advantage — expect ${to} to exploit their knowledge of ${from}'s tendencies.`;
  }
  if (intel.tier === 'HIGH') {
    return `${name} (${pos}) brings ${from} scheme knowledge to ${to}. ${intel.reason}. Coordinators will mine this intel for matchup-specific advantages.`;
  }
  return `${name} (${pos}) carries familiarity with ${from}'s system to ${to}. ${intel.reason}.`;
}

function buildHeadline(moves, team1, team2) {
  if (moves.length === 0) return null;
  const elite = moves.filter(m => m.intelTier === 'ELITE');
  if (elite.length > 0) {
    return `${elite.length} High-Value Intel Transfer${elite.length === 1 ? '' : 's'}`;
  }
  return `${moves.length} Offseason Move${moves.length === 1 ? '' : 's'} Between Teams`;
}

function buildSummaryNarrative(moves, team1, team2) {
  if (moves.length === 0) return null;

  const t1Name = tn(team1);
  const t2Name = tn(team2);
  const toT1 = moves.filter(m => m.to === team1);
  const toT2 = moves.filter(m => m.to === team2);

  const parts = [];
  if (toT1.length > 0) {
    parts.push(`${t1Name} acquired ${toT1.map(m => `${m.player} (${m.position})`).join(', ')} from ${t2Name}`);
  }
  if (toT2.length > 0) {
    parts.push(`${t2Name} picked up ${toT2.map(m => `${m.player} (${m.position})`).join(', ')} from ${t1Name}`);
  }

  return parts.join('. ') + '. These players carry playbook knowledge and scheme familiarity from their former team.';
}

/**
 * Get all offseason moves for a team
 */
export function getTeamMoves(team) {
  const data = FA_MOVES_2026[team];
  if (!data) return { added: [], lost: [], note: null };
  return {
    added: data.added || [],
    lost: data.lost || [],
    note: data.note || null,
  };
}
