/**
 * faMoves2026 overrides on the former-teammates graph (freshness plan step 13).
 *
 * Pure functions: no imports, so the site (src/data/intelligence/index.js) and
 * the build-time report (scripts/report-famoves-overrides.mjs) run the same rule.
 *
 * Rule (plan owner's ruling, 2026-11-07): a graph team counts as the 2026 team
 * only when rosters2026.js carries that player (by gsis id, in a depth-chart
 * slot or its candidates pool) on that same team. Then the graph wins and the
 * March hand list is skipped for him. Everywhere else the override applies:
 * an "added" name takes the override team, a "lost" name with no destination
 * drops the edge.
 *
 * Limit: rosters2026.js holds depth-chart slots and a candidates pool, not a
 * full roster. A player it lacks is unconfirmed, not gone, so the March
 * override stays a fallback there, never a correction of the graph.
 *
 * The graph stores no team season (former_teammates_active.json gives each
 * player his most recent nflverse team), which is why "graph has a team" was
 * never enough: Joey Bosa, Darius Slay and Darnell Savage carry BUF, their
 * 2025 team, on 33 edges as of the 2026-11-01 graph.
 */

/** Map gsis_id -> Set of teams on which rosters2026 carries that player. */
export function buildRosterIndex(rosters) {
  const index = new Map();
  const add = (id, team) => {
    if (!id) return;
    if (!index.has(id)) index.set(id, new Set());
    index.get(id).add(team);
  };
  Object.entries(rosters || {}).forEach(([team, units]) => {
    Object.values(units || {}).forEach(slots => {
      (Array.isArray(slots) ? slots : []).forEach(slot => {
        add(slot?.gsis_id, team);
        (slot?.candidates || []).forEach(c => add(c?.gsis_id, team));
      });
    });
  });
  return index;
}

/** Name -> team maps from FA_MOVES_2026, as the site has always read them. */
export function buildTeamOverrides(faMoves) {
  const overrides = {};
  const lostPlayers = {};
  Object.entries(faMoves || {}).forEach(([team, moves]) => {
    (moves.lost || []).forEach(p => { lostPlayers[p.name] = team; });
  });
  Object.entries(faMoves || {}).forEach(([team, moves]) => {
    (moves.added || []).forEach(p => {
      overrides[p.name] = team;
      delete lostPlayers[p.name]; // we know where he went
    });
  });
  return { overrides, lostPlayers };
}

/** gsis ids of [player_1, player_2] from the edge id (rt_<id>_<TEAM>, ft_<id1>_<id2>). */
export function edgeGsisIds(edgeId) {
  const ids = String(edgeId || '').match(/\d{2}-\d{7}/g) || [];
  return [ids[0] || null, ids[1] || null];
}

/**
 * Apply the overrides under the ruling.
 * Returns { edges, stats } where stats.applied and stats.skipped count the
 * distinct faMoves players found in the graph (by gsis id when the edge id
 * carries one, else by name).
 */
export function applyFAOverrides(edges, faMoves, rosters) {
  const { overrides, lostPlayers } = buildTeamOverrides(faMoves);
  const rosterIndex = buildRosterIndex(rosters);
  const applied = new Set();
  const skipped = new Set();
  const corrected = {};

  // Graph team confirmed on rosters2026.js for this player?
  const confirmed = (player, gsis) =>
    !!(gsis && player?.team && rosterIndex.get(gsis)?.has(player.team));

  // Returns the corrected player, or DROP when the edge must go.
  const DROP = Symbol('drop');
  const resolve = (player, gsis) => {
    if (!player?.name) return player;
    const name = player.name;
    const isAdded = Object.prototype.hasOwnProperty.call(overrides, name);
    const isLost = !isAdded && Object.prototype.hasOwnProperty.call(lostPlayers, name);
    if (!isAdded && !isLost) return player;
    const key = gsis || `name:${name}`;
    if (confirmed(player, gsis)) {
      skipped.add(key);
      return player; // graph wins
    }
    applied.add(key);
    if (isAdded) return { ...player, team: overrides[name] };
    return DROP; // lost, destination unknown
  };

  Object.entries(edges || {}).forEach(([id, edge]) => {
    const e = { ...edge };
    const [g1, g2] = edgeGsisIds(e.edge_id || id);

    // Resolve both ends before dropping, so the counts see every faMoves
    // player in the graph and not only those met before an earlier drop.
    const p1 = resolve(e.player_1, g1);
    const p2 = resolve(e.player_2, g2); // null on revenge edges, passed through
    if (p1 === DROP || p2 === DROP) return;
    e.player_1 = p1;
    e.player_2 = p2;

    // Revenge games: skip if the player now plays for the "former team".
    if (e.type === 'revenge_game' && e.player_1?.team === e.former_team) return;

    corrected[id] = e;
  });

  return { edges: corrected, stats: { applied: applied.size, skipped: skipped.size } };
}

export function overridesLine(stats) {
  return `faMoves overrides applied ${stats.applied}, skipped ${stats.skipped} (graph team confirmed on rosters2026.js)`;
}

/** Keys are sorted team pairs (e.g. "BUF_CHI"). */
export function rebuildMatchupIndex(edges) {
  const matchups = {};
  Object.entries(edges).forEach(([id, edge]) => {
    const t1 = edge.player_1?.team;
    const t2 = edge.type === 'revenge_game' ? edge.former_team : edge.player_2?.team;
    if (!t1 || !t2 || t1 === t2) return;
    const key = [t1, t2].sort().join('_');
    if (!matchups[key]) matchups[key] = [];
    matchups[key].push(id);
  });
  return { matchups };
}
