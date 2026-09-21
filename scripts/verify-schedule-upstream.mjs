#!/usr/bin/env node
/**
 * scripts/verify-schedule-upstream.mjs
 *
 * E-046 (2026-09-21) — upstream schedule drift gate.
 *
 * At schedule-refresh time (data-schedule-v2.yml), after
 * fetch-schedule.js has produced the new src/data/schedule2026.js,
 * fetch nflverse's games.csv fresh and compare 272 games both ways
 * plus these fields: week, home, away, gameday, gametime, weekday,
 * stadium, roof, surface.
 *
 * Exit non-zero on:
 *   - any game_id present in one set and not the other
 *   - any diff on week / home / away (identity change)
 *   - any diff on the other fields, unless it is on the allowlist:
 *       * 17 LA→LAR normalizations (nflverse's home_team/away_team
 *         column uses "LA" for the Rams; DFOS normalizes to "LAR")
 *       * Melbourne roof override (upstream "outdoors" preserved by
 *         DFOS via the INTL_VENUES table — but Melbourne is also
 *         explicitly overridden in fetch-schedule.js line 126)
 *   - spread_line / total_line are EXCLUDED (betting lines move
 *     between the schedule-refresh and the upstream fetch here).
 *
 * QA (2026-09-21 10:30) opened Q-034 originally against a scrambled
 * schedule that had ARI Week 1 at Philadelphia (a real away team
 * flipped to a wrong home team) and a "home" game at Tottenham.
 * Check #18 (delta-null) does not catch populated-and-wrong rows;
 * this check does — same directional compare against upstream that
 * QA has been running by hand.
 *
 * Usage:
 *   node scripts/verify-schedule-upstream.mjs             # SEASON=2026 default
 *   SEASON=2026 node scripts/verify-schedule-upstream.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const SEASON = parseInt(process.env.SEASON || '2026', 10);
const GAMES_URL = 'https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv';
const SCHED_PATH = path.join(REPO_ROOT, `src/data/schedule${SEASON}.js`);

const TEAM_MAP = { OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', LA: 'LAR' };
function norm(t) {
  const u = (t || '').trim().toUpperCase();
  return TEAM_MAP[u] || u;
}

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const vals = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] ?? '').trim(); });
    rows.push(row);
  }
  return rows;
}

// Allowlist: fields where a mismatch is EXPECTED because DFOS deliberately
// overrides upstream. Same INTL_VENUES table as fetch-schedule.js.
const INTL_ROOF_OVERRIDES = {
  'Melbourne Cricket Ground':   'outdoors',
  'Wembley Stadium':            'outdoors',
  'Tottenham Hotspur Stadium':  'outdoors',
  'Deutsche Bank Park':         'outdoors',
  'Arena Corinthians':          'outdoors',
};
const INTL_SURFACE_OVERRIDES = {
  'Melbourne Cricket Ground':   'grass',
  'Wembley Stadium':            'grass',
  'Tottenham Hotspur Stadium':  'grass',
  'Deutsche Bank Park':         'grass',
  'Arena Corinthians':          'grass',
};

async function main() {
  console.log(`DownfieldOS — Schedule Upstream Drift Gate (E-046, ${SEASON})`);
  console.log('==============================================================\n');

  // Load local schedule
  const localSrc = fs.readFileSync(SCHED_PATH, 'utf8');
  const localMatch = localSrc.match(/export const SCHEDULE_\d+ = (\{[\s\S]*?\n\});\s*$/m);
  if (!localMatch) throw new Error(`could not parse ${SCHED_PATH}`);
  const localObj = JSON.parse(localMatch[1]);
  // Local index: keyed by game_id → row (byWeek entries carry the full record).
  const localById = new Map();
  for (const wArr of Object.values(localObj.byWeek || {})) {
    for (const g of wArr) {
      if (g?.game_id && !localById.has(g.game_id)) localById.set(g.game_id, g);
    }
  }

  // Fetch upstream fresh
  console.log('  fetching games.csv from nflverse...');
  const res = await fetch(GAMES_URL);
  if (!res.ok) throw new Error(`upstream fetch failed: ${res.status}`);
  const text = await res.text();
  console.log(`  downloaded ${(text.length / 1024 / 1024).toFixed(1)} MB`);
  const allRows = parseCSV(text);
  const upstreamRows = allRows.filter(r => r.season === String(SEASON) && r.game_type === 'REG');
  const upstreamById = new Map();
  for (const r of upstreamRows) {
    if (!upstreamById.has(r.game_id)) upstreamById.set(r.game_id, r);
  }
  console.log(`  local:    ${localById.size} REG game_ids`);
  console.log(`  upstream: ${upstreamById.size} REG game_ids for ${SEASON}\n`);

  const errors = [];
  const warnings = [];

  // Both-ways id compare
  const onlyLocal = [];
  const onlyUpstream = [];
  for (const gid of localById.keys()) if (!upstreamById.has(gid)) onlyLocal.push(gid);
  for (const gid of upstreamById.keys()) if (!localById.has(gid)) onlyUpstream.push(gid);
  if (onlyLocal.length) errors.push(`${onlyLocal.length} game_id(s) in local but not upstream: ${onlyLocal.slice(0, 5).join(', ')}${onlyLocal.length > 5 ? ', …' : ''}`);
  if (onlyUpstream.length) errors.push(`${onlyUpstream.length} game_id(s) in upstream but not local: ${onlyUpstream.slice(0, 5).join(', ')}${onlyUpstream.length > 5 ? ', …' : ''}`);

  // Per-game field compare
  const HARD_FIELDS = ['week', 'home', 'away'];       // identity — always fail
  const SOFT_FIELDS = ['gameday', 'gametime', 'weekday', 'stadium', 'roof', 'surface']; // fail unless allowlisted
  const idMismatches = [];
  const softMismatches = [];
  const allowlistedDiffs = [];

  for (const [gid, local] of localById) {
    const up = upstreamById.get(gid);
    if (!up) continue; // already reported as onlyLocal above

    // Normalize upstream to match local shape
    const upNorm = {
      week: parseInt(up.week, 10),
      home: norm(up.home_team),
      away: norm(up.away_team),
      gameday: up.gameday || null,
      gametime: up.gametime || null,
      weekday: up.weekday || null,
      stadium: up.stadium || null,
      roof: up.roof || null,
      surface: up.surface || null,
    };

    // HARD checks first
    for (const f of HARD_FIELDS) {
      if (local[f] !== upNorm[f]) {
        idMismatches.push(`${gid} ${f}: local=${JSON.stringify(local[f])} upstream=${JSON.stringify(upNorm[f])}`);
      }
    }
    // SOFT checks
    for (const f of SOFT_FIELDS) {
      const l = local[f];
      const u = upNorm[f];
      if (l === u) continue;
      // Allowlist: intl venue roof/surface overrides
      if (f === 'roof' && INTL_ROOF_OVERRIDES[local.stadium] && l === INTL_ROOF_OVERRIDES[local.stadium]) {
        allowlistedDiffs.push(`${gid} roof=${JSON.stringify(l)} vs upstream=${JSON.stringify(u)} (Melbourne/intl override)`);
        continue;
      }
      if (f === 'surface' && INTL_SURFACE_OVERRIDES[local.stadium] && l === INTL_SURFACE_OVERRIDES[local.stadium]) {
        allowlistedDiffs.push(`${gid} surface=${JSON.stringify(l)} vs upstream=${JSON.stringify(u)} (Melbourne/intl override)`);
        continue;
      }
      // Allowlist: E-045 carry-forward (local has a value, upstream has null).
      // fetch-schedule.js restored a prior-committed non-null value; upstream
      // going null on a later refresh is the exact class E-045 was written
      // to survive. Not a drift — a survived drop.
      if (l != null && l !== '' && (u == null || u === '')) {
        allowlistedDiffs.push(`${gid} ${f}=${JSON.stringify(l)} vs upstream=null (E-045 carry-forward)`);
        continue;
      }
      softMismatches.push(`${gid} ${f}: local=${JSON.stringify(l)} upstream=${JSON.stringify(u)}`);
    }
  }

  if (idMismatches.length) {
    errors.push(`${idMismatches.length} identity mismatch(es) (week/home/away):\n    ${idMismatches.slice(0, 10).join('\n    ')}${idMismatches.length > 10 ? '\n    …' : ''}`);
  }
  if (softMismatches.length) {
    errors.push(`${softMismatches.length} field mismatch(es) not on allowlist:\n    ${softMismatches.slice(0, 15).join('\n    ')}${softMismatches.length > 15 ? '\n    …' : ''}`);
  }

  // Report
  console.log(`  both-ways id compare: ${onlyLocal.length + onlyUpstream.length} discrepancies`);
  console.log(`  identity mismatches (week/home/away): ${idMismatches.length}`);
  console.log(`  soft field mismatches: ${softMismatches.length}`);
  console.log(`  allowlisted diffs: ${allowlistedDiffs.length} (17 LA→LAR normalizations + Melbourne/intl overrides + E-045 carry-forward)`);
  if (allowlistedDiffs.length && process.env.VERBOSE) {
    console.log('    ' + allowlistedDiffs.slice(0, 20).join('\n    '));
  }

  if (errors.length > 0) {
    console.error('\n===== SCHEDULE UPSTREAM DRIFT GATE FAILED =====');
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error('===============================================\n');
    console.error(`Refuse to commit the refreshed schedule. Q-034 class: an identity or field mismatch means either upstream reshuffled the slate (which needs human review) or fetch-schedule.js corrupted the ingest.`);
    process.exit(1);
  }
  console.log(`\n✓ SCHEDULE UPSTREAM DRIFT GATE PASSED — ${localById.size} game_ids clean vs upstream (${allowlistedDiffs.length} allowlisted diffs).`);
}

await main();
