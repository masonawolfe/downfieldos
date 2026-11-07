#!/usr/bin/env node
/**
 * gate-blocking.mjs: does the freshness gate block today? (DATA_FRESHNESS_PLAN
 * step 7, 2026-11-07.)
 *
 * data/freshness_manifest.json carries one top-level date, gate_blocking_from.
 * The gate itself only reports it (check-freshness.mjs header, "Blocking
 * dates"); each caller decides. The Tuesday chain's last step and the deploy's
 * structural and built steps call this and pass what it prints:
 *
 *   before gate_blocking_from   prints --report   (the gate annotates, exit 0)
 *   on or after it              prints nothing    (a red fails the step)
 *
 * Dates compare as UTC calendar days, so the chain's 04:45 UTC slot on the
 * blocking Tuesday already blocks. One date covers the chain and the deploy,
 * and moving it needs no workflow edit.
 *
 * Fails closed: a missing or malformed date exits 2, and a caller running under
 * `set -e` then fails its step rather than report forever.
 *
 * Proof pass: GATE_AS_OF=YYYY-MM-DD (or --as-of YYYY-MM-DD) judges as if today
 * were that day. Nothing in a workflow sets it.
 *
 * Node built-ins only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.resolve(__dirname, '..', '..', 'data', 'freshness_manifest.json');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDay(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const t = Date.parse(`${s}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
}

function fail(msg) {
  console.error(`gate-blocking: ${msg}`);
  process.exit(2);
}

const argv = process.argv.slice(2);
let asOf = process.env.GATE_AS_OF || null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--as-of') asOf = argv[++i];
  else if (argv[i].startsWith('--as-of=')) asOf = argv[i].slice('--as-of='.length);
  else fail(`unknown argument ${argv[i]} (usage: node scripts/_lib/gate-blocking.mjs [--as-of YYYY-MM-DD])`);
}
if (asOf != null && !isDay(asOf)) fail(`--as-of takes YYYY-MM-DD, got ${JSON.stringify(asOf)}`);

let from;
try {
  from = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).gate_blocking_from;
} catch (err) {
  fail(`cannot read ${MANIFEST}: ${err.message}`);
}
if (!isDay(from)) fail(`gate_blocking_from in data/freshness_manifest.json must be YYYY-MM-DD, got ${JSON.stringify(from)}`);

const today = asOf ?? new Date().toISOString().slice(0, 10);
const before = today < from;
console.error(`gate_blocking_from ${from}, today ${today} (UTC${asOf != null ? ', as-of' : ''}): ${before ? 'report only' : 'blocking'}`);
if (before) process.stdout.write('--report\n');
