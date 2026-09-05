#!/usr/bin/env node
/**
 * check-draft-freeze.mjs — E-009b enforcement.
 *
 * Parses the YAML block in DRAFT_WINDOW.md, finds any window whose
 * freeze_start ≤ now < draft_end, and exits non-zero if one is
 * active — unless DRAFT_FREEZE_OVERRIDE=yes is set. That covers both
 * the scheduled workflow_run entry (env var passed from the job) and
 * a manual workflow_dispatch with `override_freeze: yes`.
 *
 * The gate covers the ENGINEER too, per the E-009b spec:
 *   "On 2026-09-03 the board changed twice within 40 minutes of live
 *    picks."
 *
 * Uses only Node built-ins so it runs before `npm install` in CI.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO = path.dirname(path.dirname(path.dirname(__filename)));
const DRAFT_WINDOW = path.join(REPO, 'DRAFT_WINDOW.md');

function parseWindows(text) {
  const out = [];
  const re = /```yaml([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const block = m[1];
    // Very small YAML subset: a sequence of `- key: value` items.
    const items = block.split(/\n(?=- )/).map(s => s.trim()).filter(s => s.startsWith('- '));
    for (const item of items) {
      const obj = {};
      for (const line of item.split('\n')) {
        const kv = line.replace(/^- /, '').trim();
        const idx = kv.indexOf(':');
        if (idx < 0) continue;
        const key = kv.slice(0, idx).trim();
        let val = kv.slice(idx + 1).trim();
        // Strip inline # comment
        const hashIdx = val.indexOf('#');
        if (hashIdx > 0) val = val.slice(0, hashIdx).trim();
        obj[key] = val;
      }
      if (obj.id) out.push(obj);
    }
  }
  return out;
}

function isActive(w, nowMs) {
  const fs = new Date(w.freeze_start).getTime();
  const de = new Date(w.draft_end).getTime();
  if (isNaN(fs) || isNaN(de)) return false;
  return fs <= nowMs && nowMs < de;
}

const override = (process.env.DRAFT_FREEZE_OVERRIDE || '').toLowerCase();
const isOverride = override === 'yes' || override === '1' || override === 'true';

if (!fs.existsSync(DRAFT_WINDOW)) {
  console.log('No DRAFT_WINDOW.md — no freeze configured.');
  process.exit(0);
}

const text = fs.readFileSync(DRAFT_WINDOW, 'utf8');
const windows = parseWindows(text);
const now = Date.now();
console.log(`DRAFT_WINDOW.md — ${windows.length} window(s) declared. now = ${new Date(now).toISOString()}`);
for (const w of windows) {
  const active = isActive(w, now);
  console.log(`  ${active ? '★ ACTIVE' : '  inactive'} ${w.id}  freeze_start=${w.freeze_start}  draft_end=${w.draft_end}`);
}

const active = windows.filter(w => isActive(w, now));
if (active.length === 0) {
  console.log('No active draft window. Proceeding.');
  process.exit(0);
}

if (isOverride) {
  console.log('\n⚠ DRAFT_FREEZE_OVERRIDE=yes — bypassing the gate.');
  console.log(`   Active window(s): ${active.map(w => w.id).join(', ')}`);
  console.log('   This override is recorded in the workflow run log. Use only for genuine emergencies.');
  process.exit(0);
}

console.error('\nBOARD REBUILD BLOCKED by an active draft window.');
console.error(`  Active window(s): ${active.map(w => w.id).join(', ')}`);
console.error('  See DRAFT_WINDOW.md for the freeze rationale.');
console.error('  Override: dispatch the workflow with `override_freeze: yes`,');
console.error('            or set DRAFT_FREEZE_OVERRIDE=yes in the job env.');
process.exit(1);
