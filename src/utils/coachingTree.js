/**
 * Coaching Tree Overlap
 *
 * Coaches from the same tree run derivative playbooks.
 * When two teams share coaching lineage, there's real scheme familiarity —
 * both staffs know the other's tendencies because they come from the same system.
 *
 * This is different from scheme familiarity (DNA-based) — this is PEOPLE-based.
 * A coach who worked under another coach knows the playbook foundation,
 * the adjustments, the go-to calls in pressure situations.
 */

import { COACHING_TREES } from '../data/coachingTrees';

/**
 * Calculate coaching tree overlap between two teams.
 * @param {string} team1 - First team code
 * @param {string} team2 - Second team code
 * @returns {object} { sharedTrees, overlapScore, narrative, details }
 */
export function calcCoachingTreeOverlap(team1, team2) {
  const staff1 = COACHING_TREES.teams[team1];
  const staff2 = COACHING_TREES.teams[team2];

  if (!staff1 || !staff2) {
    return { sharedTrees: [], overlapScore: 0, narrative: '', details: null };
  }

  const trees1 = new Set(staff1.trees);
  const trees2 = new Set(staff2.trees);
  const shared = [...trees1].filter(t => trees2.has(t));

  // Score: more shared trees = higher overlap
  // 0 shared = 0, 1 shared = 40-60, 2+ shared = 70-90
  const overlapScore = shared.length === 0 ? 0
    : shared.length === 1 ? 50
    : Math.min(50 + shared.length * 20, 95);

  const sharedTreeDetails = shared.map(treeKey => {
    const tree = COACHING_TREES.trees[treeKey];
    return {
      key: treeKey,
      name: tree.name,
      founder: tree.founder,
      principles: tree.principles,
    };
  });

  const narrative = buildNarrative(team1, team2, staff1, staff2, shared, sharedTreeDetails);

  return {
    sharedTrees: sharedTreeDetails,
    overlapScore,
    narrative,
    details: {
      team1: { hc: staff1.hc, oc: staff1.oc, dc: staff1.dc, style: staff1.style, trees: staff1.trees },
      team2: { hc: staff2.hc, oc: staff2.oc, dc: staff2.dc, style: staff2.style, trees: staff2.trees },
    },
  };
}

function buildNarrative(team1, team2, staff1, staff2, shared, sharedDetails) {
  if (shared.length === 0) {
    return `No coaching tree overlap between ${staff1.hc} (${team1}) and ${staff2.hc} (${team2}). These staffs come from completely different schematic worlds — expect few shared tendencies or predictable patterns.`;
  }

  const treeNames = sharedDetails.map(t => t.name).join(' and ');

  if (shared.length >= 2) {
    return `Strong coaching tree overlap through the ${treeNames} trees. ${staff1.hc} (${team1}) and ${staff2.hc} (${team2}) share deep schematic DNA — both staffs know each other's playbook foundation, tendency breakers, and pressure-situation calls. Film study advantage for both sides.`;
  }

  const tree = sharedDetails[0];
  return `Both staffs trace back to the ${tree.name} tree (${tree.founder}). ${staff1.hc} (${team1}) and ${staff2.hc} (${team2}) run derivative systems with shared principles: ${tree.principles.slice(0, 2).join(', ').toLowerCase()}. Each side knows the other's base concepts — the edge goes to whoever has evolved the most from the shared foundation.`;
}

/**
 * Get all coaching tree connections for a specific team.
 * Returns teams grouped by shared tree affiliation.
 * @param {string} team - Team code
 * @returns {object} { trees, connections }
 */
export function getCoachingTreeConnections(team) {
  const staff = COACHING_TREES.teams[team];
  if (!staff) return { trees: [], connections: [] };

  const connections = [];
  const teamTrees = new Set(staff.trees);

  Object.entries(COACHING_TREES.teams).forEach(([code, s]) => {
    if (code === team) return;
    const shared = s.trees.filter(t => teamTrees.has(t));
    if (shared.length > 0) {
      connections.push({
        team: code,
        hc: s.hc,
        sharedTrees: shared.map(k => COACHING_TREES.trees[k].name),
        overlapCount: shared.length,
      });
    }
  });

  connections.sort((a, b) => b.overlapCount - a.overlapCount);

  return {
    trees: staff.trees.map(k => COACHING_TREES.trees[k]?.name || k),
    connections,
  };
}
