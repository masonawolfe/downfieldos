#!/usr/bin/env node
/**
 * check-release-surfaces.mjs — E-008 enforcement.
 *
 * Two build-fail checks (RELEASE_PROCESS.md §Enforcement):
 *
 *   1. NAV CHECK — every path in the nav array (MODULES flattened from
 *      MODULE_GROUPS in DownfieldOS.jsx) must appear in the exported
 *      PUBLIC_SURFACES set. Adding a nav line without also adding the
 *      surface to that set fails CI, which is the moment Mason gets
 *      asked whether a Beta/Internal surface should be promoted.
 *
 *   2. PRERENDER CHECK — every path that has a <Route path="..."> in the
 *      router (DownfieldOS.jsx <Route> lines) must be listed in
 *      scripts/prerender-routes.js ROUTES. Missing prerender = 404 for
 *      a real URL, per RELEASE_PROCESS.md's core observation that this
 *      repo has no SPA fallback. This is the check that would have
 *      caught /2026-preview and /draft-copilot before QA did.
 *
 * Runs BEFORE the build so it fails fast. Extracts the arrays via regex
 * from the source files — deliberately not importing the modules, so
 * a broken import somewhere in the app can't disable this check.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.join(__dirname, '..', '..');

function readFile(rel) { return fs.readFileSync(path.join(REPO, rel), 'utf8'); }

// ─── (a) parse nav paths ────────────────────────────────────────────────
function extractNavPaths(src) {
  const start = src.indexOf('const MODULE_GROUPS');
  if (start < 0) throw new Error('MODULE_GROUPS not found in DownfieldOS.jsx');
  const end = src.indexOf('const MODULES', start);
  if (end < 0) throw new Error('MODULES sentinel not found after MODULE_GROUPS');
  const block = src.slice(start, end);
  const paths = [];
  const re = /path:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(block)) !== null) paths.push(m[1]);
  return paths;
}

// ─── (b) parse PUBLIC_SURFACES ──────────────────────────────────────────
function extractPublicSurfaces(src) {
  const start = src.indexOf('export const PUBLIC_SURFACES');
  if (start < 0) throw new Error('PUBLIC_SURFACES not exported in DownfieldOS.jsx');
  const brk = src.indexOf(']', start);
  const block = src.slice(start, brk);
  const paths = [];
  const re = /['"](\/[^'"]*)['"]/g;
  let m;
  while ((m = re.exec(block)) !== null) paths.push(m[1]);
  return new Set(paths);
}

// ─── (c) parse router <Route path=...> ──────────────────────────────────
function extractRouterPaths(src) {
  const paths = [];
  const re = /<Route\s+path=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const p = m[1];
    // Skip dynamic routes (/:param) — those are catch-alls, not fixed URLs
    // a prerender could satisfy. Skip splat / wildcard.
    if (p.includes(':') || p === '*') continue;
    paths.push(p);
  }
  return paths;
}

// ─── (d) parse prerender ROUTES ─────────────────────────────────────────
function extractPrerenderedPaths(src) {
  const start = src.indexOf('const ROUTES = [');
  if (start < 0) throw new Error('ROUTES not found in prerender-routes.js');
  const end = src.indexOf('];', start);
  const block = src.slice(start, end);
  const paths = [];
  const re = /path:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(block)) !== null) paths.push(m[1]);
  return paths;
}

const downfieldSrc = readFile('src/DownfieldOS.jsx');
const prerenderSrc = readFile('scripts/prerender-routes.js');

const navPaths = extractNavPaths(downfieldSrc);
const publicSurfaces = extractPublicSurfaces(downfieldSrc);
const routerPaths = extractRouterPaths(downfieldSrc);
const prerenderedPaths = new Set(extractPrerenderedPaths(prerenderSrc));

console.log('E-008 release-surface checks');
console.log('============================');
console.log(`  nav paths       : ${navPaths.length}`);
console.log(`  PUBLIC_SURFACES : ${publicSurfaces.size}`);
console.log(`  router <Route>  : ${routerPaths.length} (fixed paths only)`);
console.log(`  prerendered     : ${prerenderedPaths.size}`);
console.log();

let failed = false;

// Check 1 — nav ⊆ PUBLIC_SURFACES. A nav line without a public-surfaces
// entry means the engineer added something to the visible nav without a
// scope decision. Fails the build.
const navGaps = navPaths.filter(p => !publicSurfaces.has(p));
if (navGaps.length) {
  failed = true;
  console.error('CHECK 1 FAILED — nav paths missing from PUBLIC_SURFACES:');
  for (const p of navGaps) console.error(`  ${p}`);
  console.error('  Add the path to PUBLIC_SURFACES in DownfieldOS.jsx OR remove it from the nav.');
  console.error();
} else {
  console.log('CHECK 1 OK — every nav path is in PUBLIC_SURFACES.');
}

// Check 2 — every router path is prerendered. Missing prerender = 404.
const notPrerendered = routerPaths.filter(p => !prerenderedPaths.has(p));
if (notPrerendered.length) {
  failed = true;
  console.error('CHECK 2 FAILED — router paths missing from scripts/prerender-routes.js ROUTES:');
  for (const p of notPrerendered) console.error(`  ${p}`);
  console.error('  Add the path (with stage, title, description) to ROUTES.');
  console.error();
} else {
  console.log('CHECK 2 OK — every router path is prerendered.');
}

// Advisory: PUBLIC_SURFACES entries that aren't in the router are harmless
// but indicate stale state — warn, do not fail.
const publicNotRouted = [...publicSurfaces].filter(p => !routerPaths.includes(p));
if (publicNotRouted.length) {
  console.warn('\nWARNING — PUBLIC_SURFACES entries not backed by a <Route> path (advisory):');
  for (const p of publicNotRouted) console.warn(`  ${p}`);
}

if (failed) {
  console.error('\nRelease-surface checks failed. See RELEASE_PROCESS.md.');
  process.exit(1);
}
console.log('\nAll release-surface checks passed.');
