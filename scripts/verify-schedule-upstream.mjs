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
// E-047 (2026-09-29): must be the SAME source of record fetch-schedule.js
// uses, or the gate grades the file against a feed that did not produce
// it. See DATA_SOURCES.md § Schedule source of record. Overridable only
// for tests; CI and cron always use the default.
const GAMES_URL = process.env.GAMES_URL || 'https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv';
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
  // Q-061 (2026-09-29): schedule2026.js stores EVERY game three times —
  // once in `byWeek[N]`, once in `teams[HOME].games`, once in
  // `teams[AWAY].games`. The first cut of this gate indexed only
  // `byWeek` and kept the FIRST copy per game_id, so the two `teams`
  // copies were never graded. QA proved it: mutating the `teams` block
  // passed the gate. The app reads the `teams` copy
  // (HomeDashboard.jsx:54, ThisWeek.jsx:51-52), so the ungraded copies
  // are the ones users actually see.
  //
  // Now: collect EVERY copy with its location, grade all of them
  // against upstream, and additionally fail when copies of the same
  // game disagree with each other.
  const localCopies = new Map(); // game_id → [{ loc, rec }]
  const addCopy = (loc, g) => {
    if (!g?.game_id) return;
    if (!localCopies.has(g.game_id)) localCopies.set(g.game_id, []);
    localCopies.get(g.game_id).push({ loc, rec: g });
  };
  for (const [w, wArr] of Object.entries(localObj.byWeek || {})) {
    for (const g of wArr) addCopy(`byWeek[${w}]`, g);
  }
  for (const [t, td] of Object.entries(localObj.teams || {})) {
    for (const g of (td.games || [])) addCopy(`teams[${t}]`, g);
  }
  // Representative copy per game_id, for the id-set comparison only.
  const localById = new Map();
  for (const [gid, copies] of localCopies) localById.set(gid, copies[0].rec);
  const totalCopies = [...localCopies.values()].reduce((n, c) => n + c.length, 0);

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
  console.log(`  local:    ${localById.size} REG game_ids across ${totalCopies} stored copies (byWeek + teams)`);
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
  const copyDivergences = [];
  const missingStamps = [];

  // Q-061: copies of the same game must agree with each other. This is
  // independent of upstream — a local edit (hand-edit, partial rewrite,
  // a bug in fetch-schedule.js's three compact() calls) that touches
  // one copy and not the others is corruption even if the touched copy
  // still matches upstream.
  const ALL_GRADED = ['week', 'home', 'away', 'gameday', 'gametime', 'weekday', 'stadium', 'roof', 'surface'];
  for (const [gid, copies] of localCopies) {
    if (copies.length < 2) continue;
    const [{ loc: baseLoc, rec: base }] = copies;
    for (const { loc, rec } of copies.slice(1)) {
      for (const f of ALL_GRADED) {
        if (base[f] !== rec[f]) {
          copyDivergences.push(`${gid} ${f}: ${baseLoc}=${JSON.stringify(base[f])} vs ${loc}=${JSON.stringify(rec[f])}`);
        }
      }
    }
  }
  if (copyDivergences.length) {
    errors.push(`${copyDivergences.length} copy divergence(s) inside schedule2026.js — the same game stored with different values in byWeek vs teams:\n    ${copyDivergences.slice(0, 15).join('\n    ')}${copyDivergences.length > 15 ? '\n    …' : ''}`);
  }

  for (const [gid, copies] of localCopies) {
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

    // Q-061: grade EVERY stored copy, not just the first. A copy that
    // the app reads (teams[...]) is as load-bearing as byWeek.
    for (const { loc, rec: local } of copies) {
      // HARD checks first
      for (const f of HARD_FIELDS) {
        if (local[f] !== upNorm[f]) {
          idMismatches.push(`${gid} @${loc} ${f}: local=${JSON.stringify(local[f])} upstream=${JSON.stringify(upNorm[f])}`);
        }
      }
      // SOFT checks
      for (const f of SOFT_FIELDS) {
        const l = local[f];
        const u = upNorm[f];
        if (l === u) continue;
        // Allowlist: intl venue roof/surface overrides
        if (f === 'roof' && INTL_ROOF_OVERRIDES[local.stadium] && l === INTL_ROOF_OVERRIDES[local.stadium]) {
          allowlistedDiffs.push(`${gid} @${loc} roof=${JSON.stringify(l)} vs upstream=${JSON.stringify(u)} (Melbourne/intl override)`);
          continue;
        }
        if (f === 'surface' && INTL_SURFACE_OVERRIDES[local.stadium] && l === INTL_SURFACE_OVERRIDES[local.stadium]) {
          allowlistedDiffs.push(`${gid} @${loc} surface=${JSON.stringify(l)} vs upstream=${JSON.stringify(u)} (Melbourne/intl override)`);
          continue;
        }
        // Allowlist: E-045 carry-forward (local has a value, upstream has null).
        // fetch-schedule.js restored a prior-committed non-null value; upstream
        // going null on a later refresh is the exact class E-045 was written
        // to survive. Not a drift — a survived drop.
        //
        // E-047 (2026-09-29): the allowance is now CONDITIONAL on the
        // stamp. QA found zero `<field>_source` stamps across all seven
        // committed versions, so a carried-forward value was
        // indistinguishable from a fetched one — and this allowlist
        // branch would wave through a genuine local corruption that
        // happened to coincide with an upstream null. A carried value
        // must say so.
        if (l != null && l !== '' && (u == null || u === '')) {
          const stamp = local[`${f}_source`];
          if (stamp && String(stamp).startsWith('carried-forward')) {
            allowlistedDiffs.push(`${gid} @${loc} ${f}=${JSON.stringify(l)} vs upstream=null (E-045 carry-forward, stamped)`);
          } else {
            missingStamps.push(`${gid} @${loc} ${f}=${JSON.stringify(l)} but upstream is null and there is no ${f}_source stamp`);
          }
          continue;
        }
        softMismatches.push(`${gid} @${loc} ${f}: local=${JSON.stringify(l)} upstream=${JSON.stringify(u)}`);
      }
    }
  }

  if (missingStamps.length) {
    errors.push(`${missingStamps.length} unstamped carry-forward value(s) — local holds a value where upstream is null, but no \`<field>_source\` stamp says it was carried:\n    ${missingStamps.slice(0, 15).join('\n    ')}${missingStamps.length > 15 ? '\n    …' : ''}`);
  }

  if (idMismatches.length) {
    errors.push(`${idMismatches.length} identity mismatch(es) (week/home/away):\n    ${idMismatches.slice(0, 10).join('\n    ')}${idMismatches.length > 10 ? '\n    …' : ''}`);
  }
  if (softMismatches.length) {
    errors.push(`${softMismatches.length} field mismatch(es) not on allowlist:\n    ${softMismatches.slice(0, 15).join('\n    ')}${softMismatches.length > 15 ? '\n    …' : ''}`);
  }

  // Report
  console.log(`  both-ways id compare: ${onlyLocal.length + onlyUpstream.length} discrepancies`);
  console.log(`  copy divergences (byWeek vs teams): ${copyDivergences.length}`);
  console.log(`  identity mismatches (week/home/away): ${idMismatches.length}`);
  console.log(`  soft field mismatches: ${softMismatches.length}`);
  console.log(`  unstamped carry-forwards: ${missingStamps.length}`);
  console.log(`  allowlisted diffs: ${allowlistedDiffs.length} (17 LA→LAR normalizations + Melbourne/intl overrides + stamped E-045 carry-forward)`);
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
  console.log(`\n✓ SCHEDULE UPSTREAM DRIFT GATE PASSED — ${localById.size} game_ids / ${totalCopies} stored copies clean vs upstream, copies agree with each other (${allowlistedDiffs.length} allowlisted diffs).`);
}

await main();
