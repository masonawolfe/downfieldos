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
 * override would apply blind) or a kept edge that still carries a "lost" player
 * whose graph team rosters2026.js does not confirm. With --report (how
 * `npm run build` calls it) a fault prints a warning and exits 0, so this
 * line can never stop a deploy; the freshness gate is where reds live.
 * Run: node scripts/report-famoves-overrides.mjs [--json] [--report]
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

const REPORT = process.argv.includes('--report');
function fault(msg) {
  if (REPORT) { console.warn(`::warning::report-famoves-overrides: ${msg}`); return; }
  console.error(`report-famoves-overrides: ${msg}`);
  process.exit(1);
}

const rosterIndex = buildRosterIndex(ROSTERS_2026);
if (rosterIndex.size === 0) fault('rosters2026.js gave 0 players; every override would apply unchecked');

const { edges: out, stats } = applyFAOverrides(edges, FA_MOVES_2026, ROSTERS_2026);

// Field assertion: no kept edge may carry a "lost" faMoves player whose graph
// team rosters2026.js does not confirm (the stale BUF case: Bosa, Slay, Savage).
const { lostPlayers } = buildTeamOverrides(FA_MOVES_2026);
const stale = [];
Object.entries(out).forEach(([id, e]) => {
  const [g1, g2] = edgeGsisIds(e.edge_id || id);
  [[e.player_1, g1], [e.player_2, g2]].forEach(([p, g]) => {
    if (p?.name && p.name in lostPlayers && !(g && rosterIndex.get(g)?.has(p.team))) stale.push(`${p.name} ${p.team} (${id})`);
  });
});
if (stale.length) fault(`${stale.length} kept edge end(s) carry an unconfirmed lost player: ${stale.slice(0, 5).join('; ')}`);

console.log(overridesLine(stats));
const inN = Object.keys(edges).length;
const outN = Object.keys(out).length;
console.log(`  graph ${graph.meta?.generated || '?'}: ${inN} edges in, ${outN} kept; rosters2026.js ${rosterIndex.size} players`);
if (process.argv.includes('--json')) console.log(JSON.stringify({ ...stats, edges_in: inN, edges_kept: outN }));
