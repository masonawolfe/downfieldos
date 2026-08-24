#!/usr/bin/env node
/**
 * fetch-availability.js — EM/PO Directive v2 Task 5
 *
 * Pulls current player availability from Sleeper's public players API
 * (no auth, cached CDN, refreshed multiple times daily by Sleeper).
 * Cross-references gsis_id via roster_weekly_2026 so downstream consumers
 * (playerResolver, the pre-draft board) can key on gsis_id.
 *
 * The Aug 22 draft had two silent availability misses. Zach Charbonnet
 * was recommended over Pollard despite being on PUP with a torn ACL
 * (2026-02-20 surgery); Ashton Jeanty went down draft day and DFOS had
 * zero mentions between Aug 17–23. Both cases are surfaced by this feed.
 *
 * Output: src/data/intelligence/availability_${SEASON}.json
 *
 * Usage:
 *   node scripts/fetch-availability.js
 *   SEASON=2026 node scripts/fetch-availability.js
 *
 * Schema (per directive):
 *   {
 *     status:            "ACT" | "PUP" | "IR" | "NFI" | "SUSP",
 *     game_designation:  "Q"  | "D"  | "O" | null,
 *     practice:          null,   // not in Sleeper — populated by nflverse
 *                                //   injuries CSV in-season only
 *     injury_note:       string | null,
 *     source_url:        string,
 *     last_verified_utc: ISO8601
 *   }
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEASON = parseInt(process.env.SEASON || process.argv[2] || '2026', 10);
const SLEEPER_URL = 'https://api.sleeper.app/v1/players/nfl';
const ROSTER_WEEKLY = path.join(__dirname, '..', '..', 'data', 'intelligence', 'raw', `roster_weekly_${SEASON}.csv.gz`);
const OUT = path.join(__dirname, '..', 'src', 'data', 'intelligence', `availability_${SEASON}.json`);

// Sleeper → directive schema mapping.
function mapStatus(sleeper) {
  const inj = sleeper.injury_status || '';
  const s = sleeper.status || '';
  // Roster-status supersedes injury_status for IR.
  if (s === 'Injured Reserve' || inj === 'IR') return { status: 'IR', game_designation: null };
  if (inj === 'PUP') return { status: 'PUP', game_designation: null };
  if (inj === 'NFI') return { status: 'NFI', game_designation: null };
  if (inj === 'Sus') return { status: 'SUSP', game_designation: null };
  if (inj === 'Questionable') return { status: 'ACT', game_designation: 'Q' };
  if (inj === 'Doubtful') return { status: 'ACT', game_designation: 'D' };
  if (inj === 'Out') return { status: 'ACT', game_designation: 'O' };
  if (inj === 'DNR' || inj === 'COV') return { status: 'ACT', game_designation: 'O' };
  // Active roster, no active injury tag.
  if (s === 'Active') return { status: 'ACT', game_designation: null };
  if (s === 'Inactive') return { status: 'IR', game_designation: null };
  return { status: 'ACT', game_designation: null };
}

function parseCSVLine(line) {
  const out = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (c === ',' && !inQ) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
function parseCSV(text) {
  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => row[h] = (vals[idx] ?? '').trim());
    rows.push(row);
  }
  return rows;
}

async function main() {
  console.log(`DownfieldOS — Availability ingest (${SEASON})`);
  console.log('============================================\n');

  // 1. Build sleeper_id → gsis_id map from roster_weekly_2026.
  const sleeperToGsis = new Map();
  const gsisToRosterName = new Map();
  try {
    const gz = fs.readFileSync(ROSTER_WEEKLY);
    const csv = zlib.gunzipSync(gz).toString('utf8');
    const rows = parseCSV(csv);
    for (const r of rows) {
      if (r.sleeper_id && r.gsis_id) sleeperToGsis.set(r.sleeper_id, r.gsis_id);
      if (r.gsis_id && r.full_name) gsisToRosterName.set(r.gsis_id, r.full_name);
    }
    console.log(`  Loaded roster_weekly_${SEASON}: ${sleeperToGsis.size} sleeper→gsis mappings`);
  } catch (err) {
    console.log(`  ⚠ roster_weekly_${SEASON} unavailable (${err.message}) — will fall back to Sleeper's own gsis_id field only`);
  }

  // 2. Fetch Sleeper players.
  console.log(`  Fetching ${SLEEPER_URL}...`);
  const res = await fetch(SLEEPER_URL, { headers: { 'User-Agent': 'DFOS/1.0' } });
  if (!res.ok) throw new Error(`Sleeper HTTP ${res.status}`);
  const players = await res.json();
  console.log(`  ${Object.keys(players).length.toLocaleString()} Sleeper player records`);

  // 3. For each Sleeper player: map to gsis_id (via roster_weekly or Sleeper's own field).
  const now = new Date().toISOString();
  const byGsis = {};
  let mapped = 0;
  let onPupIrNfi = 0;
  let flaggedQdo = 0;
  for (const [sid, p] of Object.entries(players)) {
    const gsis = p.gsis_id || sleeperToGsis.get(sid) || null;
    if (!gsis) continue;
    const { status, game_designation } = mapStatus(p);
    const note = [p.injury_body_part, p.injury_notes].filter(Boolean).join(' — ') || null;
    byGsis[gsis] = {
      status,
      game_designation,
      practice: null,   // Sleeper doesn't carry practice reports; nflverse injuries CSV does, in-season only
      injury_note: note,
      injury_body_part: p.injury_body_part || null,
      injury_start_date: p.injury_start_date || null,
      team: p.team || null,
      position: p.position || null,
      sleeper_id: sid,
      source_url: `https://sleeper.app/nfl/player/${sid}`,
      last_verified_utc: now,
    };
    mapped++;
    if (status === 'PUP' || status === 'IR' || status === 'NFI') onPupIrNfi++;
    if (game_designation) flaggedQdo++;
  }

  const payload = {
    meta: {
      season: SEASON,
      source: 'Sleeper players API (api.sleeper.app/v1/players/nfl)',
      generated: now,
      total_records: mapped,
      on_pup_ir_nfi: onPupIrNfi,
      questionable_doubtful_out: flaggedQdo,
      note: 'Availability keyed by gsis_id. Consumers must gate any recommendation on status; a status of PUP/IR/NFI/SUSP must be surfaced. A record with last_verified_utc older than 24h should be treated as stale.',
    },
    players: byGsis,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload));

  console.log(`\n  Mapped ${mapped} records to gsis_id`);
  console.log(`  PUP/IR/NFI: ${onPupIrNfi}`);
  console.log(`  Q/D/O flagged: ${flaggedQdo}`);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
