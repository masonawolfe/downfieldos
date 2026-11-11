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
 * `set -e` then fails its step rather than report forever. The Tuesday chain
 * calls it that way.
 *
 * --fail-closed-on-event E (the deploy passes push): a malformed date fails
 * closed only when GITHUB_EVENT_NAME is E. On any other event, a data job's
 * dispatch, it prints an ::error:: annotation and --report and exits 0, so a
 * bad date never freezes the site's data (plan step 7: "the next data job
 * still ships that commit"). scripts/test-contract.js checks the date with
 * the same isDay() in npm test, so a bad date fails CI before it reaches main.
 *
 * Proof pass: GATE_AS_OF=YYYY-MM-DD (or --as-of YYYY-MM-DD) judges as if today
 * were that day. Nothing in a workflow sets it.
 *
 * Node built-ins only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.resolve(__dirname, '..', '..', 'data', 'freshness_manifest.json');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A real UTC calendar day in YYYY-MM-DD: 2026-11-31 is refused. */
export function isDay(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const t = Date.parse(`${s}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
}

function main() {
  const argv = process.argv.slice(2);
  let asOf = process.env.GATE_AS_OF || null;
  let softUnless = null;
  const usage = (msg) => {
    console.error(`gate-blocking: ${msg} (usage: node scripts/_lib/gate-blocking.mjs [--as-of YYYY-MM-DD] [--fail-closed-on-event E])`);
    process.exit(2);
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--as-of') asOf = argv[++i];
    else if (argv[i].startsWith('--as-of=')) asOf = argv[i].slice('--as-of='.length);
    else if (argv[i] === '--fail-closed-on-event') softUnless = argv[++i];
    else usage(`unknown argument ${argv[i]}`);
  }
  if (softUnless != null && !/^[a-z_]+$/.test(softUnless)) usage(`--fail-closed-on-event takes an event name, got ${JSON.stringify(softUnless)}`);
  if (asOf != null && !isDay(asOf)) usage(`--as-of takes YYYY-MM-DD, got ${JSON.stringify(asOf)}`);

  // A bad manifest date: exit 2, unless the caller named the one event that
  // fails closed and this run is another event.
  const event = process.env.GITHUB_EVENT_NAME || '';
  const fail = (msg) => {
    if (softUnless != null && event !== softUnless) {
      // stderr: the caller reads stdout as its flag. The runner reads workflow
      // commands from both streams.
      console.error(`::error title=gate-blocking (${event || 'no event'}, reporting)::${msg}. Reporting, not blocking, because the event is not ${softUnless}; fix the date before the next ${softUnless}.`);
      process.stdout.write('--report\n');
      process.exit(0);
    }
    console.error(`gate-blocking: ${msg}`);
    process.exit(2);
  };

  let from;
  try {
    from = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).gate_blocking_from;
  } catch (err) {
    fail(`cannot read ${MANIFEST}: ${err.message}`);
  }
  if (!isDay(from)) fail(`gate_blocking_from in data/freshness_manifest.json must be a real YYYY-MM-DD day, got ${JSON.stringify(from)}`);

  const today = asOf ?? new Date().toISOString().slice(0, 10);
  const before = today < from;
  console.error(`gate_blocking_from ${from}, today ${today} (UTC${asOf != null ? ', as-of' : ''}): ${before ? 'report only' : 'blocking'}`);
  if (before) process.stdout.write('--report\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
