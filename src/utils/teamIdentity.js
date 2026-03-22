/**
 * teamIdentity.js — Dynamic team identity labels derived from real stats.
 *
 * Replaces hardcoded DNA[team].s strings like "Caleb's Rough Rookie Year"
 * with computed labels based on actual agg() output.
 *
 * Zero manual maintenance. Updates automatically when data changes.
 */

/**
 * Generate a team identity label from aggregated stats + league baseline.
 *
 * @param {object} stats - agg() output for this team
 * @param {object} bl - lgbl() league baseline
 * @returns {string} Dynamic identity label (e.g., "Pass-Heavy Explosive Attack")
 */
export function getTeamIdentity(stats, bl) {
  if (!stats || !bl) return "Unknown";

  const prDelta = stats.pr - bl.pr;
  const srDelta = stats.sr - bl.sr;
  const xrDelta = stats.xr - bl.xr;
  const dsrDelta = stats.dsr - bl.sr; // defense: higher = worse

  // Offensive style
  let style;
  if (prDelta > 0.06) style = "Pass-Heavy";
  else if (prDelta > 0.03) style = "Pass-First";
  else if (prDelta < -0.06) style = "Run-Dominant";
  else if (prDelta < -0.03) style = "Run-First";
  else style = "Balanced";

  // Offensive quality
  let quality;
  if (srDelta > 0.04 && xrDelta > 0.02) quality = "Juggernaut";
  else if (srDelta > 0.03) quality = "Efficient Machine";
  else if (xrDelta > 0.03) quality = "Explosive Attack";
  else if (xrDelta > 0.015) quality = "Big-Play Threat";
  else if (srDelta > 0.01) quality = "Steady Offense";
  else if (srDelta < -0.04) quality = "Struggling Offense";
  else if (srDelta < -0.02) quality = "Inconsistent Attack";
  else quality = "Middle-of-the-Pack";

  // Defensive modifier
  let defMod = "";
  if (dsrDelta > 0.03) defMod = ", Porous Defense";
  else if (dsrDelta < -0.03) defMod = ", Elite Defense";
  else if (dsrDelta < -0.015) defMod = ", Strong Defense";

  return `${style} ${quality}${defMod}`;
}

/**
 * Generate a short narrative hook for a team (replaces DNA[tm].s in narratives).
 *
 * @param {string} team - Team abbreviation
 * @param {object} stats - agg() output
 * @param {object} bl - lgbl() league baseline
 * @param {number} rank - Team's composite rank (1-32)
 * @returns {string} One-line narrative hook
 */
export function getTeamHook(team, stats, bl, rank) {
  if (!stats || !bl) return "";

  const prDelta = stats.pr - bl.pr;
  const srDelta = stats.sr - bl.sr;
  const xrDelta = stats.xr - bl.xr;

  // Build a descriptive hook from stats
  const parts = [];

  // Pass/run identity
  if (prDelta > 0.05) parts.push("throws it more than almost anyone");
  else if (prDelta < -0.05) parts.push("committed to the ground game");

  // Efficiency
  if (srDelta > 0.04) parts.push("moving the chains at an elite rate");
  else if (srDelta < -0.04) parts.push("struggling to sustain drives");

  // Explosiveness
  if (xrDelta > 0.02) parts.push("with big-play potential on every snap");
  else if (xrDelta < -0.02) parts.push("lacking chunk-play ability");

  // Rank context
  if (rank <= 3) parts.push("— a top-3 offense in football");
  else if (rank <= 8) parts.push("— a top-tier unit");
  else if (rank >= 30) parts.push("— one of the worst offenses in the league");
  else if (rank >= 25) parts.push("— bottom-third and fading");

  if (parts.length === 0) {
    return "Average across the board — no glaring strengths or weaknesses";
  }

  // Capitalize first letter
  const hook = parts.join(", ");
  return hook.charAt(0).toUpperCase() + hook.slice(1);
}

/**
 * Build a complete dynamic DNA object for all 32 teams.
 * Replaces the static DNA import with computed values from real play data.
 *
 * @param {Array} plays - All plays array
 * @param {function} aggFn - The agg() function
 * @param {function} lgblFn - The lgbl() function
 * @param {Array} teams - T array of team objects
 * @returns {object} DNA-compatible object keyed by team abbreviation
 */
export function buildDynamicDNA(plays, aggFn, lgblFn, teams) {
  const bl = lgblFn(plays);
  const dna = {};

  // Compute ranks for hook generation
  const ranked = teams.map(t => {
    const s = aggFn(plays, t.a);
    return { a: t.a, s };
  }).sort((a, b) =>
    (b.s.sr * 0.4 + b.s.xr * 3 + b.s.pr * 0.2) -
    (a.s.sr * 0.4 + a.s.xr * 3 + a.s.pr * 0.2)
  );

  ranked.forEach((r, idx) => {
    const rank = idx + 1;
    dna[r.a] = {
      p: r.s.pr,
      e: r.s.sr,
      x: r.s.xr,
      s: getTeamIdentity(r.s, bl),
      hook: getTeamHook(r.a, r.s, bl, rank),
      rank,
    };
  });

  return dna;
}
