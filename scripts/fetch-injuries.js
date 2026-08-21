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
const SEASON = parseInt(process.env.SEASON || process.argv[2] || '2025', 10);
const URL = `https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries_${SEASON}.csv`;
const OUT = path.join(__dirname, `../src/data/intelligence/injuries_${SEASON}.json`);

async function main() {
  console.log(`DownfieldOS — Injuries ingest (${SEASON})`);
  console.log('=========================================\n');

  const rows = await fetchCSV(URL, `injuries (${SEASON})`);
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

  const meta = {
    season: SEASON,
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
