#!/usr/bin/env node
/**
 * report-famoves-overrides.mjs (freshness plan step 13)
 *
 * Runs the same override rule the site runs (src/data/intelligence/faOverrides.js)
 * on the committed graph and prints the build-time line:
 *   faMoves overrides applied A, skipped S (graph team confirmed on rosters2026.js)
 *
 * Skipped means rosters2026.js carries the player (gsis id, slot or candidates
 * pool) on the graph's team, so the graph wins. Applied means it does not; the
 * March hand list then fills the gap. rosters2026.js is depth-chart slots and a
 * candidates pool, not a full roster: a player it lacks is unconfirmed, not gone.
 *
 * Exits non-zero only on a structural fault: an empty roster index (every
 * override would apply blind) or a counted player that is neither applied nor
 * skipped. Run: node scripts/report-famoves-overrides.mjs [--json]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FA_MOVES_2026 } from '../src/data/faMoves2026.js';
import { ROSTERS_2026 } from '../src/data/rosters2026.js';
import {
  applyFAOverrides, buildRosterIndex, buildTeamOverrides, edgeGsisIds, overridesLine,
} from '../src/data/intelligence/faOverrides.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const graphPath = path.join(root, 'src/data/intelligence/former_teammates_active.json');
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const edges = graph.edges || {};

const rosterIndex = buildRosterIndex(ROSTERS_2026);
if (rosterIndex.size === 0) {
  console.error('report-famoves-overrides: rosters2026.js gave 0 players; every override would apply unchecked');
  process.exit(1);
}

const { edges: out, stats } = applyFAOverrides(edges, FA_MOVES_2026, ROSTERS_2026);

// Independent recount: distinct faMoves players present in the graph.
const { overrides, lostPlayers } = buildTeamOverrides(FA_MOVES_2026);
const present = new Set();
Object.entries(edges).forEach(([id, e]) => {
  const [g1, g2] = edgeGsisIds(e.edge_id || id);
  [[e.player_1, g1], [e.player_2, g2]].forEach(([p, g]) => {
    if (p?.name && (p.name in overrides || p.name in lostPlayers)) present.add(g || `name:${p.name}`);
  });
});
if (present.size !== stats.applied + stats.skipped) {
  console.error(`report-famoves-overrides: ${present.size} faMoves players in the graph, but applied ${stats.applied} + skipped ${stats.skipped}`);
  process.exit(1);
}

console.log(overridesLine(stats));
const inN = Object.keys(edges).length;
const outN = Object.keys(out).length;
console.log(`  graph ${graph.meta?.generated || '?'}: ${inN} edges in, ${outN} kept; rosters2026.js ${rosterIndex.size} players`);
if (process.argv.includes('--json')) console.log(JSON.stringify({ ...stats, edges_in: inN, edges_kept: outN }));
