#!/usr/bin/env node
/**
 * build-weekly-transactions.js — CoS audit 2026-08-30 finding #5.
 *
 * The audit noted `faMoves2026.js` has not changed since 2026-03-22 and
 * nflverse `trades` only covers player-for-pick. What's missing is a
 * live FA/waiver/cut/IR feed. A proper PFR transactions wire scraper is
 * a bigger project (HTML fragile, rate-limited). This is the
 * derived-from-nflverse alternative: diff `roster_weekly_${SEASON}.csv`
 * week-over-week and emit each player's transitions.
 *
 * What it catches:
 *   - signings (player appears on a team where they weren't previous week)
 *   - releases / cuts (player disappears entirely)
 *   - trades (team change between weeks)
 *   - status changes (Active → IR, PUP, NFI, Suspended)
 *   - Practice-squad elevations (Practice Squad → Active)
 *
 * What it doesn't catch:
 *   - Intra-week churn (Tue signing cut Friday) — nflverse's roster_weekly
 *     is a Wed snapshot; anything that unwinds inside a week doesn't show.
 *   - Signings BETWEEN league offices and PFR reports — occasional lag.
 *
 * Output: src/data/intelligence/weekly_transactions_${SEASON}.json
 *
 * Usage:
 *   node scripts/build-weekly-transactions.js
 *   SEASON=2025 node scripts/build-weekly-transactions.js
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function currentNflSeason() {
  const now = new Date();
  return now.getUTCMonth() + 1 >= 3 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

const SEASON = parseInt(process.env.SEASON || process.argv[2] || String(currentNflSeason()), 10);
const REPO = path.dirname(__dirname);
const ROSTER = path.join(REPO, '..', 'data', 'intelligence', 'raw', `roster_weekly_${SEASON}.csv.gz`);
const OUT = path.join(REPO, 'src', 'data', 'intelligence', `weekly_transactions_${SEASON}.json`);

function parseCsvLine(line) {
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

async function main() {
  console.log(`DFOS — Weekly transaction derivation (${SEASON})`);
  console.log('=============================================\n');

  let text;
  if (fs.existsSync(ROSTER)) {
    text = zlib.gunzipSync(fs.readFileSync(ROSTER)).toString('utf8');
    console.log(`  Loaded ${ROSTER}`);
  } else {
    const url = `https://github.com/nflverse/nflverse-data/releases/download/weekly_rosters/roster_weekly_${SEASON}.csv`;
    console.log(`  Local file missing — fetching ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for weekly rosters`);
    text = await res.text();
  }
  const lines = text.split('\n');
  const headers = parseCsvLine(lines[0]);
  const col = {
    week: headers.indexOf('week'),
    gsis_id: headers.indexOf('gsis_id'),
    full_name: headers.indexOf('full_name'),
    team: headers.indexOf('team'),
    position: headers.indexOf('position'),
    status: headers.indexOf('status'),
  };

  // gsis_id → sorted array of { week, team, status, name, position }
  const byPlayer = new Map();
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const v = parseCsvLine(lines[i]);
    const gsis = v[col.gsis_id];
    if (!gsis) continue;
    if (!byPlayer.has(gsis)) byPlayer.set(gsis, []);
    byPlayer.get(gsis).push({
      week: parseInt(v[col.week] || '0', 10),
      team: v[col.team] || null,
      status: v[col.status] || null,
      name: v[col.full_name] || null,
      position: v[col.position] || null,
    });
  }
  console.log(`  ${byPlayer.size.toLocaleString()} distinct players across all snapshots`);

  const transactions = [];
  let signs = 0, cuts = 0, trades = 0, statusChanges = 0;

  for (const [gsis, snaps] of byPlayer) {
    snaps.sort((a, b) => a.week - b.week);
    // Detect appearance in week N when player wasn't in week N-1 → SIGNED
    // Detect disappearance in week N when they were in N-1 → RELEASED
    // Detect team change → TRADED
    // Detect status change → STATUS_CHANGE
    const weeks = new Set(snaps.map(s => s.week));
    const maxWeek = Math.max(...weeks);
    for (let i = 1; i < snaps.length; i++) {
      const prev = snaps[i - 1];
      const cur = snaps[i];
      if (cur.week !== prev.week + 1) continue; // gap — treat conservatively
      if (cur.team !== prev.team) {
        transactions.push({
          type: 'TRADED_OR_CLAIMED',
          week: cur.week,
          gsis_id: gsis,
          name: cur.name,
          position: cur.position,
          from_team: prev.team,
          to_team: cur.team,
          old_status: prev.status,
          new_status: cur.status,
        });
        trades++;
      } else if (cur.status !== prev.status) {
        transactions.push({
          type: 'STATUS_CHANGE',
          week: cur.week,
          gsis_id: gsis,
          name: cur.name,
          position: cur.position,
          team: cur.team,
          from_status: prev.status,
          to_status: cur.status,
        });
        statusChanges++;
      }
    }
    // Signings/cuts: check first-appearance and last-appearance vs global weeks
    const first = snaps[0];
    if (first.week > 1) {
      transactions.push({
        type: 'SIGNED',
        week: first.week,
        gsis_id: gsis,
        name: first.name,
        position: first.position,
        team: first.team,
        status: first.status,
      });
      signs++;
    }
    const last = snaps[snaps.length - 1];
    // Find the global max week across all players
    // (Cheap version: use current player's max)
    // Only classify a cut if the player isn't on the final week's snapshot
    // and their last week isn't the file's last week
  }
  // Global last week (any player's max week)
  let globalLastWeek = 0;
  for (const snaps of byPlayer.values()) for (const s of snaps) if (s.week > globalLastWeek) globalLastWeek = s.week;
  for (const [gsis, snaps] of byPlayer) {
    const last = snaps[snaps.length - 1];
    if (last.week < globalLastWeek) {
      transactions.push({
        type: 'RELEASED',
        week: last.week,
        // "released after" that week — they weren't on the next week's snapshot
        gsis_id: gsis,
        name: last.name,
        position: last.position,
        team: last.team,
        last_status: last.status,
      });
      cuts++;
    }
  }

  // Sort by week ascending, then type
  transactions.sort((a, b) => (a.week - b.week) || a.type.localeCompare(b.type));

  const payload = {
    meta: {
      season: SEASON,
      generated: new Date().toISOString(),
      source: `nflverse weekly_rosters/roster_weekly_${SEASON}.csv (derived by week-over-week diff)`,
      total_records: transactions.length,
      by_type: { SIGNED: signs, RELEASED: cuts, TRADED_OR_CLAIMED: trades, STATUS_CHANGE: statusChanges },
      weeks_covered: [1, globalLastWeek],
      note: [
        'CoS audit 2026-08-30 finding #5. Derived from weekly roster snapshots — captures signings, cuts, team changes, and status changes at week granularity.',
        'Does not catch intra-week churn (Tue signing cut Fri disappears in the Wed snapshot). Does not include contract terms.',
        'A live PFR/NFL.com wire scraper would give finer granularity but is out of scope until PFR bot-protection posture is reassessed.',
      ].join(' '),
    },
    transactions,
  };

  fs.writeFileSync(OUT, JSON.stringify(payload));
  console.log(`\n  ${transactions.length} transaction records`);
  console.log(`    SIGNED: ${signs}`);
  console.log(`    RELEASED: ${cuts}`);
  console.log(`    TRADED_OR_CLAIMED: ${trades}`);
  console.log(`    STATUS_CHANGE: ${statusChanges}`);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
