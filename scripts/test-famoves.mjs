#!/usr/bin/env node
/**
 * test-famoves.mjs (freshness plan step 13)
 *
 * Fixture test for applyFAOverrides under the strategist's 2026-11-07 ruling:
 * a graph team counts as the 2026 team only when rosters2026.js carries the
 * player on it; everywhere else the March hand list is the fallback. Uses
 * synthetic data only, so it does not move with the live files. The live case
 * it guards: Bosa, Slay and Savage (BUF in the graph, on no 2026 roster), 33
 * stale edges that "graph has a team" would have kept.
 */
import { applyFAOverrides } from '../src/data/intelligence/faOverrides.js';

let passed = 0, failed = 0;
const check = (name, ok) => { if (ok) passed++; else { failed++; console.log(`  FAIL ${name}`); } };

const P = (name, team) => ({ name, team });
const edge = (id, a, b) => ({ edge_id: id, type: 'former_teammate', player_1: a, player_2: b });
const edges = {
  e1: edge('00-0000001_00-0000009', P('Lost Unconfirmed', 'BUF'), P('Anchor', 'KC')),
  e2: edge('00-0000002_00-0000009', P('Lost Confirmed', 'LV'), P('Anchor', 'KC')),
  e3: edge('00-0000003_00-0000009', P('Added Confirmed', 'LAC'), P('Anchor', 'KC')),
  e4: edge('00-0000004_00-0000009', P('Added Unconfirmed', 'SEA'), P('Anchor', 'KC')),
  e5: edge('00-0000005_00-0000009', P('Added Elsewhere', 'NYJ'), P('Anchor', 'KC')),
};
const faMoves = {
  BUF: { added: [], lost: [{ name: 'Lost Unconfirmed' }] },
  MIN: { added: [{ name: 'Added Confirmed' }, { name: 'Added Unconfirmed' }, { name: 'Added Elsewhere' }], lost: [{ name: 'Lost Confirmed' }] },
};
const rosters = {
  LV: { offense: [{ gsis_id: '00-0000002' }] },
  LAC: { offense: [{ gsis_id: 'x', candidates: [{ gsis_id: '00-0000003' }] }] },
  DAL: { offense: [{ gsis_id: '00-0000005' }] },
  KC: { offense: [{ gsis_id: '00-0000009' }] },
};
const { edges: out, stats } = applyFAOverrides(edges, faMoves, rosters);

check('lost and unconfirmed drops the edge (the BUF case)', !('e1' in out));
check('lost but confirmed on rosters2026 keeps the edge', 'e2' in out && out.e2.player_1.team === 'LV');
check('added and confirmed (candidates pool) keeps the graph team', out.e3?.player_1.team === 'LAC');
check('added and unconfirmed takes the March team', out.e4?.player_1.team === 'MIN');
check('added, carried on another team: March list stays the fallback', out.e5?.player_1.team === 'MIN');
check('each player counted once: applied 3, skipped 2', stats.applied === 3 && stats.skipped === 2);
check('no rosters at all: every override applies', applyFAOverrides(edges, faMoves, {}).stats.skipped === 0);

console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
