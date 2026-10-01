#!/usr/bin/env node
/**
 * scripts/check-data-sources.mjs
 *
 * E-048 (2026-10-01) — DATA_SOURCES.md completeness gate.
 *
 * Counsel's C-012 found DATA_SOURCES.md listing only the nflverse
 * releases while the shipped data and the fetch scripts referenced
 * fourteen other external domains — Wikipedia (75 URLs in
 * coachingTrees.js), thirteen NFL team official sites, Football Zebras,
 * nflpenalties.com, sharpfootballanalysis.com, cbssports.com,
 * crew2026.co, nfl.com/operations, Sleeper and ESPN. Attribution
 * obligations attach to several of those, so an incomplete file is a
 * compliance gap, not a tidiness one.
 *
 * This check extracts every external host that appears in the scanned
 * trees and fails when one is not declared in DATA_SOURCES.md. It also
 * reports declared-but-unseen hosts so the file does not rot in the
 * other direction.
 *
 * Two forms are matched, because the data uses both:
 *   - full URLs            https://en.wikipedia.org/wiki/...
 *   - bare domain strings  "footballzebras.com, nflpenalties.com, ..."
 *     (referee_profiles.json metadata.source)
 *
 * Usage:
 *   node scripts/check-data-sources.mjs
 *   VERBOSE=1 node scripts/check-data-sources.mjs   # list every host + hit count
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const DOC = path.join(REPO_ROOT, 'DATA_SOURCES.md');

// Trees that ship or produce data. src/components is excluded: a UI file
// linking to a source is rendering an attribution the data already
// carries, so it adds no new collection.
const SCAN_DIRS = ['src/data', 'scripts', 'public/data'];
const SCAN_EXT = new Set(['.js', '.mjs', '.json', '.md', '.sh', '.py']);

// This file and the doc are the registry itself — scanning them would
// make the check pass by self-reference.
const SKIP_FILES = new Set([
  'scripts/check-data-sources.mjs',
]);

// Hosts that are ours, or are not an external data source.
const NOT_A_SOURCE = new Set([
  'downfieldos.com',
  'www.downfieldos.com',
  // Licence and spec links are legal/reference text, not data inputs.
  'creativecommons.org',
  'www.creativecommons.org',
  'foundation.wikimedia.org',
  'developers.beehiiv.com',
  'schema.org',
  'www.w3.org',
]);

const TLDS = ['com', 'org', 'net', 'co', 'app', 'io', 'gov', 'edu'];

function normHost(h) {
  return h.toLowerCase().replace(/^www\./, '').replace(/[.,;:)\]'"]+$/, '');
}

function walk(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'raw') continue;
      walk(full, out);
    } else if (SCAN_EXT.has(path.extname(e.name))) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const doc = fs.readFileSync(DOC, 'utf8');

  // Hosts found in the scanned trees → Map<host, Set<relative file>>
  const found = new Map();
  const note = (host, rel) => {
    const h = normHost(host);
    if (!h || NOT_A_SOURCE.has(h) || NOT_A_SOURCE.has('www.' + h)) return;
    if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(h)) return;
    if (!found.has(h)) found.set(h, new Set());
    found.get(h).add(rel);
  };

  const urlRe = /https?:\/\/([a-zA-Z0-9._-]+)/g;
  const bareRe = new RegExp(`\\b([a-z0-9][a-z0-9-]*(?:\\.[a-z0-9-]+)*\\.(?:${TLDS.join('|')}))\\b`, 'gi');

  for (const dir of SCAN_DIRS) {
    for (const file of walk(path.join(REPO_ROOT, dir))) {
      const rel = path.relative(REPO_ROOT, file);
      if (SKIP_FILES.has(rel)) continue;
      const src = fs.readFileSync(file, 'utf8');
      for (const m of src.matchAll(urlRe)) note(m[1], rel);
      for (const m of src.matchAll(bareRe)) note(m[1], rel);
    }
  }

  // Hosts declared in DATA_SOURCES.md — same two forms.
  const declared = new Set();
  for (const m of doc.matchAll(urlRe)) {
    const h = normHost(m[1]);
    if (h) declared.add(h);
  }
  for (const m of doc.matchAll(bareRe)) {
    const h = normHost(m[1]);
    if (h) declared.add(h);
  }

  const missing = [...found.keys()].filter(h => !declared.has(h)).sort();
  const stale = [...declared].filter(h => !found.has(h) && !NOT_A_SOURCE.has(h)).sort();

  console.log('DownfieldOS — DATA_SOURCES.md completeness gate (E-048)');
  console.log('========================================================\n');
  console.log(`  scanned:  ${SCAN_DIRS.join(', ')}`);
  console.log(`  hosts in data/scripts: ${found.size}`);
  console.log(`  hosts declared in DATA_SOURCES.md: ${declared.size}`);
  console.log(`  undeclared: ${missing.length}`);
  console.log(`  declared but not seen (informational): ${stale.length}`);

  if (process.env.VERBOSE) {
    console.log('\n  --- every host found ---');
    for (const h of [...found.keys()].sort()) {
      const files = [...found.get(h)];
      const where = files.length > 2 ? `${files.slice(0, 2).join(', ')} +${files.length - 2} more` : files.join(', ');
      console.log(`    ${declared.has(h) ? '✓' : '✗'} ${h}  — ${where}`);
    }
    if (stale.length) {
      console.log('\n  --- declared but not seen in the scanned trees ---');
      for (const h of stale) console.log(`    · ${h}`);
    }
  }

  if (missing.length > 0) {
    console.error('\n===== DATA_SOURCES.md IS INCOMPLETE =====');
    for (const h of missing) {
      const files = [...found.get(h)];
      console.error(`  ✗ ${h}`);
      console.error(`      appears in: ${files.slice(0, 4).join(', ')}${files.length > 4 ? `, +${files.length - 4} more` : ''}`);
    }
    console.error('=========================================\n');
    console.error('Every external domain the data or the fetch scripts touch must be');
    console.error('declared in DATA_SOURCES.md with what is taken from it and where it');
    console.error('lands. Several carry attribution obligations (Wikipedia is CC BY-SA');
    console.error('4.0), so an undeclared source is a compliance gap. Counsel C-012.');
    process.exit(1);
  }

  console.log('\n✓ DATA_SOURCES.md COMPLETE — every external host in the data and the fetch scripts is declared.');
}

main();
