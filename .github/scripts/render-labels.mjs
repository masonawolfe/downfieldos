/**
 * render-labels.mjs: the render proof for static and last-season labels
 * (DATA_FRESHNESS_PLAN v4.3 step 5, 2026-11-07).
 *
 * Every row of data/freshness_manifest.json with a label_route says: open
 * that route and the row's label is in the rendered text. render-smoke.mjs
 * reads each route's innerText already; it passes that text here. A card
 * opened only by a click (PlayerCard) stays with QA, because the smoke test
 * never clicks.
 *
 * Node built-ins only, so the assert is testable without a browser:
 *   node .github/scripts/render-labels.mjs <route> <file-with-rendered-text>
 * exits 1 and names each missing label, 0 when all are present.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** { route: [{ label, file }] } from the manifest's label_route rows. */
export function labelExpectations(manifestPath = path.join(REPO, 'data', 'freshness_manifest.json')) {
  const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const out = {};
  for (const r of m.rows || []) {
    if (!r.label_route) continue;
    (out[r.label_route] ||= []).push({ label: r.label, file: r.path });
  }
  return out;
}

/** The expected labels on this route that the rendered text lacks. */
export function missingLabels(route, text, expectations) {
  const norm = (s) => String(s || '').replace(/\s+/g, ' ');
  const body = norm(text);
  return (expectations[route] || []).filter(e => !e.label || !body.includes(norm(e.label)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [route, textFile] = process.argv.slice(2);
  if (!route || !textFile) {
    console.error('usage: node .github/scripts/render-labels.mjs <route> <file-with-rendered-text>');
    process.exit(2);
  }
  const exp = labelExpectations();
  const miss = missingLabels(route, fs.readFileSync(textFile, 'utf8'), exp);
  const want = exp[route] || [];
  for (const e of want) console.log(`${miss.includes(e) ? 'MISSING' : 'ok     '} ${route}  "${e.label}"  (${e.file})`);
  console.log(`${want.length - miss.length} of ${want.length} labels rendered on ${route}`);
  process.exit(miss.length ? 1 : 0);
}
