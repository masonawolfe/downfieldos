#!/usr/bin/env node
/**
 * fetch-injuries.js
 *
 * Ingests the nflverse `injuries` release. One CSV per season, per-week
 * per-player designation (Out / Doubtful / Questionable / Probable) plus
 * body-part and practice-participation notes.
 *
 * Output: src/data/intelligence/injuries_${SEASON}.json
 *
 * Usage:
 *   node scripts/fetch-injuries.js            # SEASON=2025 default
 *   SEASON=2024 node scripts/fetch-injuries.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchCSV, normTeam } from './_lib/nflverse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Current NFL season derivation. The league year rolls over ~March 1 (free
// agency, new contract year). Before March we're still on the previous
// season's data; after we're on the current. Prevents the "hardcoded '2025'"
// rot the CoS audit flagged 2026-08-30 — the workflow will still be pulling
// the right file next August without a human edit.
function currentNflSeason() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;   // 1–12
  return m >= 3 ? y : y - 1;
}
const SEASON = parseInt(process.env.SEASON || process.argv[2] || String(currentNflSeason()), 10);
const URL = `https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries_${SEASON}.csv`;
// OUT is computed in main() using the season that actually returned data —
// so a fallback run writes injuries_2025.json rather than a phantom
// injuries_2026.json with 2025 contents.

async function fetchInjuriesWithFallback() {
  try {
    const rows = await fetchCSV(URL, `injuries (${SEASON})`);
    return { rows, seasonUsed: SEASON };
  } catch (err) {
    // Before the season starts, nflverse hasn't published the current-year
    // file yet. Fall back to previous season so downstream isn't broken —
    // it's stale-but-shaped-right rather than absent.
    const fallback = SEASON - 1;
    const fallbackUrl = `https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries_${fallback}.csv`;
    console.log(`  ⚠ ${SEASON} injuries unavailable (${err.message}); falling back to ${fallback}`);
    const rows = await fetchCSV(fallbackUrl, `injuries (${fallback})`);
    return { rows, seasonUsed: fallback };
  }
}

async function main() {
  console.log(`DownfieldOS — Injuries ingest (target ${SEASON})`);
  console.log('=========================================\n');

  const { rows, seasonUsed } = await fetchInjuriesWithFallback();
  console.log(`  ${rows.length.toLocaleString()} injury reports\n`);

  // Group by (team, player) — keep every week's designation so consumers can
  // pull "latest" or "history" as needed.
  const byPlayer = new Map();
  for (const r of rows) {
    const team = normTeam(r.team);
    const key = `${team}::${r.gsis_id || r.full_name}`;
    if (!byPlayer.has(key)) {
      byPlayer.set(key, {
        team,
        gsis_id: r.gsis_id || null,
        name: r.full_name || null,
        position: r.position || null,
        weeks: [],
      });
    }
    byPlayer.get(key).weeks.push({
      season: parseInt(r.season, 10) || SEASON,
      week: parseInt(r.week, 10) || null,
      game_type: r.game_type || null,
      report_status: r.report_status || null,   // Out / Doubtful / Questionable / null
      report_primary_injury: r.report_primary_injury || null,
      report_secondary_injury: r.report_secondary_injury || null,
      practice_status: r.practice_status || null,
      practice_primary_injury: r.practice_primary_injury || null,
      date_modified: r.date_modified || null,
    });
  }

  // Sort weeks chronologically and expose a `latest` field per player
  const players = [...byPlayer.values()].map(p => {
    p.weeks.sort((a, b) => (a.week ?? 0) - (b.week ?? 0));
    p.latest = p.weeks[p.weeks.length - 1] || null;
    return p;
  });

  // Team index: teamCode -> [players]
  const byTeam = {};
  for (const p of players) {
    if (!byTeam[p.team]) byTeam[p.team] = [];
    byTeam[p.team].push(p);
  }

  // Ranking of currently-out players by team, useful for a fantasy sit/start card
  const currentlyOut = players.filter(p => p.latest?.report_status === 'Out').length;
  const currentlyQ = players.filter(p => p.latest?.report_status === 'Questionable').length;

  const OUT = path.join(__dirname, `../src/data/intelligence/injuries_${seasonUsed}.json`);
  const meta = {
    season: seasonUsed,
    season_requested: SEASON,
    season_fallback: seasonUsed !== SEASON,
    source: 'nflverse (injuries release)',
    generated: new Date().toISOString(),
    total_reports: rows.length,
    unique_players: players.length,
    currently_out: currentlyOut,
    currently_questionable: currentlyQ,
  };

  // Compact "current status" file — only the latest status per player, no weekly
  // history. This is what UI code imports (kept small enough to bundle).
  const compact = players
    .filter(p => p.latest?.report_status || p.latest?.practice_status)
    .map(p => ({
      team: p.team,
      name: p.name,
      position: p.position,
      status: p.latest.report_status || null,          // Out / Doubtful / Questionable
      injury: p.latest.report_primary_injury || p.latest.practice_primary_injury || null,
      week: p.latest.week,
      updated: p.latest.date_modified,
    }));
  const byTeamCompact = {};
  for (const p of compact) {
    if (!byTeamCompact[p.team]) byTeamCompact[p.team] = [];
    byTeamCompact[p.team].push(p);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  // Full (weeks history) — reserved for deep-history analysis.
  fs.writeFileSync(OUT, JSON.stringify({ meta, byTeam, players }));
  // Compact (latest only) — the file consumed by UI code.
  const compactOut = OUT.replace(/\.json$/, '_current.json');
  fs.writeFileSync(compactOut, JSON.stringify({ meta, byTeam: byTeamCompact, players: compact }));

  console.log(`  ${players.length} unique players, ${currentlyOut} currently Out, ${currentlyQ} Questionable`);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB — full)`);
  console.log(`Wrote ${compactOut} (${(fs.statSync(compactOut).size / 1024).toFixed(0)} KB — current-status only)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
