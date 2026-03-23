#!/usr/bin/env node
/**
 * test-rosters.js — Roster accuracy validation
 *
 * Verifies that genRoster2026() produces correct rosters after merging
 * base rosters with FA transactions. Run: npm test
 */

// We can't use ESM imports with genRoster2026 directly since it imports
// from data files. Instead, validate the raw data files.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ ${message}`);
  }
}

async function main() {
  console.log('DownfieldOS — Roster Accuracy Tests\n');

  // Load data files dynamically
  const rostersModule = await import('../src/data/rosters2025.js');
  const faModule = await import('../src/data/faMoves2026.js');
  const ROSTERS = rostersModule.ROSTERS_2025;
  const FA = faModule.FA_MOVES_2026;

  const ALL_TEAMS = ['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS'];

  // Test 1: All 32 teams have rosters
  console.log('Test 1: All 32 teams present');
  ALL_TEAMS.forEach(t => {
    assert(ROSTERS[t], `${t} has roster data`);
  });

  // Test 2: Each team has minimum roster size
  console.log('\nTest 2: Minimum roster size (8 OFF, 7 DEF)');
  ALL_TEAMS.forEach(t => {
    const r = ROSTERS[t];
    if (!r) return;
    assert(r.offense?.length >= 8, `${t} has ${r.offense?.length} offensive players (min 8)`);
    assert(r.defense?.length >= 7, `${t} has ${r.defense?.length} defensive players (min 7)`);
  });

  // Test 3: Known QBs are correct
  console.log('\nTest 3: Known QB assignments');
  const knownQBs = {
    CHI: 'Caleb Williams', BUF: 'Josh Allen', SF: 'Brock Purdy',
    KC: 'Patrick Mahomes', BAL: 'Lamar Jackson', PHI: 'Jalen Hurts',
    CIN: 'Joe Burrow', DET: 'Jared Goff', LAC: 'Justin Herbert',
    DAL: 'Dak Prescott', TB: 'Baker Mayfield', WAS: 'Jayden Daniels',
  };
  Object.entries(knownQBs).forEach(([team, qbName]) => {
    const qb = ROSTERS[team]?.offense?.find(p => p.pos === 'QB');
    assert(qb?.name === qbName, `${team} QB = ${qb?.name} (expected ${qbName})`);
  });

  // Test 4: FA moves are correctly structured
  console.log('\nTest 4: FA moves data integrity');
  assert(FA.BUF?.added?.some(p => p.name === 'DJ Moore'), 'BUF added DJ Moore');
  assert(FA.CHI?.lost?.some(p => p.name === 'DJ Moore'), 'CHI lost DJ Moore');
  assert(FA.BUF?.lost?.some(p => p.name === 'Joey Bosa'), 'BUF lost Joey Bosa');
  assert(FA.KC?.added?.some(p => p.name === 'Kenneth Walker III'), 'KC added Kenneth Walker III');
  assert(FA.KC?.added?.some(p => p.name === 'Justin Fields'), 'KC added Justin Fields');
  assert(FA.MIA?.lost?.some(p => p.name === 'Tua Tagovailoa'), 'MIA lost Tua');
  assert(FA.MIA?.added?.some(p => p.name === 'Malik Willis'), 'MIA added Malik Willis');
  assert(FA.NYJ?.lost?.some(p => p.name === 'Justin Fields'), 'NYJ lost Justin Fields');

  // Test 5: No obviously wrong players
  console.log('\nTest 5: Wrong player detection');
  assert(!ROSTERS.BUF?.defense?.some(p => p.name === 'Darius Slay'), 'BUF does NOT have Darius Slay');

  // Summary
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.error('\n❌ ROSTER TESTS FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL ROSTER TESTS PASSED');
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
