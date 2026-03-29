/**
 * Roster Fragility Score
 * Measures how much a team's performance drops when starters go down.
 * Higher score = more fragile (bigger gap between starter and backup).
 */

const POSITION_WEIGHTS = {
  QB: 3.0,
  WR1: 1.5, WR2: 1.0,
  RB1: 1.2,
  TE: 1.0,
  EDGE1: 1.5, EDGE2: 1.0,
  CB1: 1.3, CB2: 1.0,
  DT1: 1.0,
  LB1: 1.0, LB2: 0.8,
  LT: 1.2, RT: 1.0,
  FS: 0.9, SS: 0.9,
};

/**
 * Calculate roster fragility for a single team.
 * @param {{ offense: Array, defense: Array }} roster - Team roster from genRoster2026
 * @returns {{ score: number, grade: string, vulnerable: Array, resilient: Array, byPosition: Array }}
 */
export function calcRosterFragility(roster) {
  if (!roster) return { score: 50, grade: "C", vulnerable: [], resilient: [], byPosition: [] };

  const all = [...(roster.offense || []), ...(roster.defense || [])];

  // Group players by base position
  const groups = {};
  all.forEach(p => {
    const basePos = p.pos.replace(/[0-9]/g, "");
    const num = parseInt(p.pos.replace(/\D/g, "")) || 0;
    if (!groups[basePos]) groups[basePos] = [];
    groups[basePos].push({ ...p, posRank: num });
  });

  const positionDeltas = [];

  Object.entries(groups).forEach(([basePos, players]) => {
    // Sort by rating descending
    players.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    if (players.length < 2) {
      // Only one player at this position = maximum fragility for that spot
      positionDeltas.push({
        position: basePos,
        starter: players[0]?.name || "Unknown",
        starterRating: players[0]?.rating || 70,
        backup: "None",
        backupRating: 50,
        delta: (players[0]?.rating || 70) - 50,
        weight: POSITION_WEIGHTS[`${basePos}1`] || POSITION_WEIGHTS[basePos] || 0.8,
      });
      return;
    }

    // First player = starter, second = backup
    const starter = players[0];
    const backup = players[1];
    const delta = (starter.rating || 70) - (backup.rating || 60);

    positionDeltas.push({
      position: basePos,
      starter: starter.name,
      starterRating: starter.rating || 70,
      backup: backup.name,
      backupRating: backup.rating || 60,
      delta,
      weight: POSITION_WEIGHTS[`${basePos}1`] || POSITION_WEIGHTS[basePos] || 0.8,
    });
  });

  // Weighted fragility score (0-100)
  if (positionDeltas.length === 0) return { score: 50, grade: "C", vulnerable: [], resilient: [], byPosition: [] };

  const totalWeight = positionDeltas.reduce((s, d) => s + d.weight, 0);
  const weightedSum = positionDeltas.reduce((s, d) => s + d.delta * d.weight, 0);
  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Normalize: 0 delta = score 0 (resilient), 30+ delta = score 100 (fragile)
  const score = Math.min(100, Math.max(0, Math.round((rawScore / 25) * 100)));

  const grade = score >= 80 ? "F" : score >= 65 ? "D" : score >= 50 ? "C" : score >= 35 ? "B" : "A";

  // Sort by delta to find most/least vulnerable
  const sorted = [...positionDeltas].sort((a, b) => b.delta - a.delta);
  const vulnerable = sorted.slice(0, 3);
  const resilient = sorted.filter(d => d.delta <= 5).slice(0, 3);

  return {
    score,
    grade,
    vulnerable,
    resilient,
    byPosition: sorted,
  };
}

/**
 * Calculate fragility for all 32 teams.
 * @param {Object} rosters - { teamCode: roster } mapping
 * @returns {Object} - { teamCode: fragilityResult }
 */
export function calcAllFragility(rosters) {
  const results = {};
  Object.entries(rosters).forEach(([team, roster]) => {
    results[team] = calcRosterFragility(roster);
  });
  return results;
}

/**
 * Get league-wide fragility rankings.
 * @returns {Array} - Sorted array of { team, ...fragilityResult }
 */
export function getFragilityRankings(rosters) {
  const all = calcAllFragility(rosters);
  return Object.entries(all)
    .map(([team, data]) => ({ team, ...data }))
    .sort((a, b) => b.score - a.score);
}
