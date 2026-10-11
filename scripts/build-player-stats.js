#!/usr/bin/env node
/**
 * build-player-stats.js
 *
 * Aggregates per-player stats from nflverse play-by-play CSVs.
 * Produces src/data/playerStats2025.js with position-specific stat lines.
 *
 * QB: comp%, yards, TD, INT, EPA/play, sack rate
 * WR/TE: targets, receptions, yards, TDs, YPR
 * RB: carries, yards, YPC, receiving yards, total TDs
 * DEF: tackles, sacks, INTs, PD (from player_stats CSV)
 *
 * Usage: node scripts/build-player-stats.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SEASON = the completed NFL season we're aggregating stats from. Defaults to
// 2025 (the most recent completed season). 2026 stats do not exist yet — running
// SEASON=2026 will 404 until nflverse publishes the first weekly stats.
const SEASON = parseInt(process.env.SEASON || process.argv[2] || '2025', 10);
const PBP_URL = `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${SEASON}.csv`;
// nflverse retired the `player_stats` release in favor of `stats_player`; regular-season
// aggregates live at stats_player_reg_YYYY.csv. Fields renamed: `interceptions` →
// `passing_interceptions`, `sacks` → `sacks_suffered`.
const PLAYER_STATS_URL = `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_reg_${SEASON}.csv`;

// E-4 (2026-10-10): season-aware enrichment sources.
// The weekly CI job (data-player-stats-v2.yml) only ever had the repo
// checkout, and the E-023 probes below looked for <repo>/data/intelligence/…
// and <parent>/data/intelligence/… — neither exists in CI. From 2026-09-23
// every CI rebuild shipped target_share / carry_share / snap_share /
// team_pass_rate / team_off_epa_per_play / team_rz_pass_rate = null on every
// row. The 2025 usage + team-offense files now live in the repo with the
// season in the filename and are probed FIRST; the old probes stay as
// fallbacks. src/data/intelligence/pbp/player_usage_data.json and
// team_scheme_profiles.json (no suffix) are the 2026 ROLLING outputs of
// data-pbp-derived-v2.yml and must never feed a 2025 build — they are not
// in the candidate list, and any candidate whose metadata.season is missing
// or disagrees with SEASON is rejected.
const REPO_ROOT = path.join(__dirname, '..');
function relRepo(p) { return path.relative(REPO_ROOT, p).split(path.sep).join('/'); }
// Label for the committed header/META: never a machine-specific absolute
// path. In-repo → repo-relative; the legacy parent probe → ../data/…;
// anything else (an env override pointing at a scratch dir) → basename.
function sourceLabel(p) {
  const rel = relRepo(p);
  if (rel.startsWith('../') && !rel.startsWith('../data/')) return `external:${path.basename(p)}`;
  return rel;
}

// Returns { path, doc } for the first candidate that exists, parses, and
// declares metadata.season === SEASON; null when none qualifies. When the env
// override is set it is the ONLY candidate (used by the floor's
// induced-failure proof: PLAYER_USAGE_PATH=/nonexistent).
function loadSeasonJson(label, envVar, candidates) {
  const override = process.env[envVar];
  const list = override ? [override] : candidates;
  for (const p of list) {
    if (!fs.existsSync(p)) continue;
    let doc;
    try { doc = JSON.parse(fs.readFileSync(p, 'utf8')); }
    catch (err) { console.log(`⚠ ${label}: ${relRepo(p)} unreadable (${err.message}) — trying next candidate`); continue; }
    // Strict: a file that cannot prove its season is rejected. The 2026
    // rolling outputs of data-pbp-derived-v2.yml carry no metadata.season,
    // so they can never be picked up by a 2025 build through a fallback.
    const fileSeason = doc?.metadata?.season;
    if (fileSeason == null || Number(fileSeason) !== SEASON) {
      console.log(`⚠ ${label}: ${relRepo(p)} has metadata.season=${fileSeason ?? 'missing'}, build is ${SEASON} — skipped`);
      continue;
    }
    return { path: p, doc };
  }
  console.log(`⚠ ${label}: no usable file among ${list.map(relRepo).join(', ')}`);
  return null;
}

const TEAM_MAP = {
  OAK: 'LV', STL: 'LAR', LA: 'LAR', SD: 'LAC', WSH: 'WAS',
};
function normalizeTeam(code) {
  if (!code) return '';
  const upper = code.trim().toUpperCase();
  return TEAM_MAP[upper] || upper;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

async function fetchCSV(url, label) {
  console.log(`Fetching ${label}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${label}: ${res.status}`);
  const text = await res.text();
  console.log(`  ${(text.length / 1024 / 1024).toFixed(1)}MB downloaded`);
  return text;
}

function parseCSVToRows(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

async function main() {
  console.log(`\nBuilding player stats for ${SEASON}\n`);

  // Try player_stats CSV first (pre-aggregated by nflverse)
  let usePlayerStats = false;
  let playerStatsRows = [];

  try {
    const csv = await fetchCSV(PLAYER_STATS_URL, 'player_stats');
    playerStatsRows = parseCSVToRows(csv);
    usePlayerStats = playerStatsRows.length > 100;
    console.log(`  ${playerStatsRows.length} player stat rows parsed\n`);
  } catch (e) {
    console.log(`  player_stats not available (${e.message}), falling back to PBP aggregation\n`);
  }

  const stats = {};

  if (usePlayerStats) {
    // nflverse player_stats has pre-aggregated season stats
    for (const r of playerStatsRows) {
      const name = r.player_display_name || r.player_name || '';
      const team = normalizeTeam(r.recent_team || r.team);
      const pos = (r.position || '').toUpperCase();
      if (!name || !team || !pos) continue;

      const key = `${name}_${team}`;

      // gsis_id is the canonical join key across all layers. Nflverse ships it as
      // `player_id` in stats_player and as `gsis_id` in rosters/depth charts.
      const gsis_id = r.player_id || r.gsis_id || null;
      if (pos === 'QB') {
        stats[key] = {
          gsis_id,
          name, team, pos,
          games: int(r.games) || int(r.g),
          completions: int(r.completions),
          attempts: int(r.attempts),
          passing_yards: int(r.passing_yards),
          passing_tds: int(r.passing_tds),
          interceptions: int(r.passing_interceptions ?? r.interceptions),
          sacks: int(r.sacks_suffered ?? r.sacks),
          comp_pct: pct(r.completions, r.attempts),
          rushing_yards: int(r.rushing_yards),
          rushing_tds: int(r.rushing_tds),
          epa_per_play: parseFloat(r.passing_epa) || 0,
        };
      } else if (pos === 'WR' || pos === 'TE') {
        stats[key] = {
          gsis_id,
          name, team, pos,
          games: int(r.games) || int(r.g),
          targets: int(r.targets),
          receptions: int(r.receptions),
          receiving_yards: int(r.receiving_yards),
          receiving_tds: int(r.receiving_tds),
          ypr: div(r.receiving_yards, r.receptions),
        };
      } else if (pos === 'RB') {
        stats[key] = {
          gsis_id,
          name, team, pos,
          games: int(r.games) || int(r.g),
          carries: int(r.carries) || int(r.rushing_attempts),
          rushing_yards: int(r.rushing_yards),
          rushing_tds: int(r.rushing_tds),
          ypc: div(r.rushing_yards, r.carries || r.rushing_attempts),
          targets: int(r.targets),
          receptions: int(r.receptions),
          receiving_yards: int(r.receiving_yards),
          receiving_tds: int(r.receiving_tds),
        };
      } else if (['LB', 'CB', 'S', 'SS', 'FS', 'DT', 'DE', 'EDGE', 'ILB', 'OLB', 'MLB', 'NT', 'DB'].includes(pos)) {
        // Defensive stats may not be in player_stats, skip for now
        // They'll be added from a different source if available
      }
    }
  }

  if (!usePlayerStats) {
    // Fallback: aggregate from PBP
    console.log('Aggregating from PBP data...');
    const csv = await fetchCSV(PBP_URL, 'play-by-play');
    const rows = parseCSVToRows(csv);
    console.log(`  ${rows.length} plays to process\n`);

    const qbs = {};
    const receivers = {};
    const rushers = {};

    for (const r of rows) {
      const playType = (r.play_type || '').toLowerCase();
      if (playType !== 'pass' && playType !== 'run') continue;

      const off = normalizeTeam(r.posteam);
      if (!off) continue;

      if (playType === 'pass') {
        const qb = r.passer_player_name || '';
        if (qb) {
          if (!qbs[qb]) qbs[qb] = { gsis_id: r.passer_player_id || null, name: qb, team: off, att: 0, comp: 0, yds: 0, td: 0, int: 0, sacks: 0, epa: 0, plays: 0 };
          if (!qbs[qb].gsis_id && r.passer_player_id) qbs[qb].gsis_id = r.passer_player_id;
          qbs[qb].att++;
          qbs[qb].plays++;
          if (r.complete_pass === '1') { qbs[qb].comp++; qbs[qb].yds += int(r.yards_gained); }
          if (r.pass_touchdown === '1') qbs[qb].td++;
          if (r.interception === '1') qbs[qb].int++;
          if (r.sack === '1') qbs[qb].sacks++;
          qbs[qb].epa += parseFloat(r.epa) || 0;
        }

        const rec = r.receiver_player_name || '';
        if (rec) {
          if (!receivers[rec]) receivers[rec] = { gsis_id: r.receiver_player_id || null, name: rec, team: off, tgt: 0, rec: 0, yds: 0, td: 0 };
          if (!receivers[rec].gsis_id && r.receiver_player_id) receivers[rec].gsis_id = r.receiver_player_id;
          receivers[rec].tgt++;
          if (r.complete_pass === '1') { receivers[rec].rec++; receivers[rec].yds += int(r.yards_gained); }
          if (r.pass_touchdown === '1') receivers[rec].td++;
        }
      }

      if (playType === 'run') {
        const rb = r.rusher_player_name || '';
        if (rb) {
          if (!rushers[rb]) rushers[rb] = { gsis_id: r.rusher_player_id || null, name: rb, team: off, car: 0, yds: 0, td: 0 };
          if (!rushers[rb].gsis_id && r.rusher_player_id) rushers[rb].gsis_id = r.rusher_player_id;
          rushers[rb].car++;
          rushers[rb].yds += int(r.yards_gained);
          if (r.rush_touchdown === '1') rushers[rb].td++;
        }
      }
    }

    // Track which abbreviated names are QBs (they also appear as rushers)
    const qbNames = new Set(Object.keys(qbs).filter(n => qbs[n].att >= 10));

    // Convert to stats format — QBs first (include their rushing stats)
    for (const [, q] of Object.entries(qbs)) {
      if (q.att < 10) continue; // skip trick plays / emergency QBs
      const key = `${q.name}_${q.team}`;
      const rush = rushers[q.name] || {};
      stats[key] = {
        gsis_id: q.gsis_id || null,
        name: q.name, team: q.team, pos: 'QB',
        completions: q.comp, attempts: q.att,
        passing_yards: q.yds, passing_tds: q.td,
        interceptions: q.int, sacks: q.sacks,
        comp_pct: q.att > 0 ? Math.round(q.comp / q.att * 1000) / 10 : 0,
        epa_per_play: q.plays > 0 ? Math.round(q.epa / q.plays * 100) / 100 : 0,
        rushing_yards: rush.yds || 0,
        rushing_tds: rush.td || 0,
      };
    }
    for (const [, r] of Object.entries(receivers)) {
      if (r.tgt < 5) continue; // skip players with negligible targets
      const key = `${r.name}_${r.team}`;
      stats[key] = {
        gsis_id: r.gsis_id || null,
        name: r.name, team: r.team, pos: 'WR',
        targets: r.tgt, receptions: r.rec,
        receiving_yards: r.yds, receiving_tds: r.td,
        ypr: r.rec > 0 ? Math.round(r.yds / r.rec * 10) / 10 : 0,
      };
    }
    for (const [, r] of Object.entries(rushers)) {
      if (qbNames.has(r.name)) continue; // skip QBs (already included above)
      if (r.car < 5) continue; // skip minimal usage
      const key = `${r.name}_${r.team}`;
      if (stats[key]) continue; // skip if already added as WR (dual-role)
      stats[key] = {
        gsis_id: r.gsis_id || null,
        name: r.name, team: r.team, pos: 'RB',
        carries: r.car, rushing_yards: r.yds, rushing_tds: r.td,
        ypc: r.car > 0 ? Math.round(r.yds / r.car * 10) / 10 : 0,
      };
    }
  }

  // EM/PO Directive v2 Task 4 — join QB production + team offense to WR/TE/RB rows.
  // Rationale: a 27.9% target share on last year's worst offense is worth
  // materially less than a 20% share on a healthy offense. Every WR/TE/RB
  // row needs a QB attached so consumers don't compare shares in a vacuum.
  //
  // Primary QB per team = highest-passing-attempts row in playerStats2025 for
  // that team. Team offense EPA + pass rate come from team_scheme_profiles.
  // QB attribution is by team_2026 when known (that's the QB the player will
  // work with going forward), team_2025 when team_2026 is unknown.
  //
  // Computed lazily below AFTER team_2025/team_2026 are populated.

  // EM/PO Directive v2 Task 3 — flag team changes 2025 → 2026.
  // Load roster_weekly_2026 by gsis_id; every row gets team_2026 (may be null
  // if the player isn't on a 2026 roster) and team_changed (boolean, only true
  // when both sides are known). LA→LAR normalization matches the rest of the
  // pipeline (nflverse uses "LA" for the Rams; DFOS uses "LAR").
  const NORM_TEAM = { LA: 'LAR', OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', AZ: 'ARI' };
  function norm(t) { const u = (t || '').toUpperCase().trim(); return NORM_TEAM[u] || u; }
  // E-023: probe repo-relative first (CI), fall back to parent (Mason-local).
  // E-4: this file is NOT committed (2026 rolling, ~380KB gz); the
  // player-stats workflow now fetches it into <repo>/data/intelligence/raw/
  // the same way data-board.yml does. ROSTER_WEEKLY_PATH env overrides.
  const ROSTER_WEEKLY_PATH = [
    process.env.ROSTER_WEEKLY_PATH || null,
    path.join(__dirname, '..', 'data', 'intelligence', 'raw', 'roster_weekly_2026.csv.gz'),
    path.join(__dirname, '..', '..', 'data', 'intelligence', 'raw', 'roster_weekly_2026.csv.gz'),
  ].find(p => p && fs.existsSync(p)) || path.join(__dirname, '..', '..', 'data', 'intelligence', 'raw', 'roster_weekly_2026.csv.gz');
  const rosterWeeklyByGsis = new Map();
  try {
    const zlib = await import('zlib');
    const gzText = fs.readFileSync(ROSTER_WEEKLY_PATH);
    const csvText = zlib.gunzipSync(gzText).toString('utf8');
    const rows = parseCSVToRows(csvText);
    // De-dupe by gsis_id — most recent week wins
    const byGsis = new Map();
    for (const r of rows) {
      if (!r.gsis_id) continue;
      const wk = parseInt(r.week || '0', 10);
      const prev = byGsis.get(r.gsis_id);
      if (!prev || wk >= parseInt(prev.week || '0', 10)) byGsis.set(r.gsis_id, r);
    }
    for (const [id, r] of byGsis) rosterWeeklyByGsis.set(id, { team: norm(r.team), position: r.position, sleeper_id: r.sleeper_id || null, yahoo_id: r.yahoo_id || null, espn_id: r.espn_id || null });
    console.log(`\nLoaded roster_weekly_2026: ${rosterWeeklyByGsis.size} unique gsis_ids`);
  } catch (err) {
    console.log(`\n⚠ roster_weekly_2026 unavailable (${err.message}) — team_2026/team_changed will be null on every row`);
  }
  let teamChangedCount = 0;
  for (const s of Object.values(stats)) {
    const rw = s.gsis_id ? rosterWeeklyByGsis.get(s.gsis_id) : null;
    s.team_2025 = norm(s.team);
    s.team_2026 = rw ? rw.team : null;
    s.team_changed = (s.team_2026 && s.team_2025) ? (s.team_2025 !== s.team_2026) : null;
    if (s.team_changed === true) teamChangedCount++;
  }
  console.log(`Team-change flags: ${teamChangedCount}/${Object.keys(stats).length} players changed teams 2025→2026`);

  // ── Task 4 continuation — compute per-team QB + team offense now that
  // team_2025 / team_2026 are populated. ──
  // E-4: season-labelled committed file first; E-023 probes as fallbacks.
  const teamScheme = loadSeasonJson('team_scheme_profiles', 'TEAM_SCHEME_PATH', [
    path.join(REPO_ROOT, 'src', 'data', 'intelligence', 'pbp', `team_scheme_profiles_${SEASON}.json`),
    path.join(__dirname, '..', 'data', 'intelligence', 'pbp', 'team_scheme_profiles.json'),
    path.join(__dirname, '..', '..', 'data', 'intelligence', 'pbp', 'team_scheme_profiles.json'),
  ]);
  let teamOff = {};
  if (teamScheme) {
    // File shape: { metadata: {...}, teams: { KC: { offense: {...}, defense: {...} }, … } }
    teamOff = teamScheme.doc.teams || teamScheme.doc;
    console.log(`Loaded team_scheme_profiles: ${Object.keys(teamOff).length} teams from ${relRepo(teamScheme.path)}`);
  } else {
    console.log(`⚠ team_scheme_profiles unavailable — team_off_epa_per_play / team_pass_rate / team_rz_pass_rate will be null`);
  }
  // Primary QB per team from playerStats2025
  const qbByTeam = {};
  for (const s of Object.values(stats)) {
    if (s.pos !== 'QB') continue;
    const t = s.team_2025;
    if (!t) continue;
    const prev = qbByTeam[t];
    if (!prev || (s.attempts || 0) > (prev.attempts || 0)) qbByTeam[t] = s;
  }
  console.log(`Primary QBs identified for ${Object.keys(qbByTeam).length} teams`);
  let qbJoinedCount = 0;
  for (const s of Object.values(stats)) {
    if (s.pos === 'QB' || s.pos === 'DEF' || s.pos === 'K') continue;
    const t = s.team_2026 || s.team_2025;
    const qb = t ? qbByTeam[t] : null;
    const off = t ? (teamOff[t]?.offense || null) : null;
    s.qb_name = qb ? qb.name : null;
    s.qb_gsis_id = qb ? qb.gsis_id : null;
    s.qb_pass_td = qb ? (qb.passing_tds ?? null) : null;
    s.qb_attempts = qb ? (qb.attempts ?? null) : null;
    s.qb_epa_per_play = qb ? (qb.epa_per_play ?? null) : null;
    s.team_off_epa_per_play = off ? (off.epa_per_play ?? null) : null;
    s.team_pass_rate = off ? (off.pass_rate ?? null) : null;
    s.team_rz_pass_rate = off ? (off.red_zone_pass_rate ?? null) : null;
    if (qb) qbJoinedCount++;
  }
  const nonQbCount = Object.values(stats).filter(s => s.pos !== 'QB' && s.pos !== 'DEF' && s.pos !== 'K').length;
  console.log(`QB-production join: ${qbJoinedCount}/${nonQbCount} skill rows have qb_name populated (${(qbJoinedCount/nonQbCount*100).toFixed(1)}%)`);

  // EM/PO Directive v2 Task 2 — enrich with usage shares from
  // src/data/intelligence/pbp/player_usage_data_${SEASON}.json (E-4; was
  // data/intelligence/pbp/player_usage_data.json). gsis_id is the join key.
  // Missing usage file is not fatal — the stats rows still emit, with the
  // three share fields set null and metadata.usage_join_rate reflecting the miss.
  let usageJoinedCount = 0;
  let usageAvailable = false;
  // E-4: season-labelled committed file first; E-023 probes as fallbacks.
  const usage = loadSeasonJson('player_usage_data', 'PLAYER_USAGE_PATH', [
    path.join(REPO_ROOT, 'src', 'data', 'intelligence', 'pbp', `player_usage_data_${SEASON}.json`),
    path.join(__dirname, '..', 'data', 'intelligence', 'pbp', 'player_usage_data.json'),
    path.join(__dirname, '..', '..', 'data', 'intelligence', 'pbp', 'player_usage_data.json'),
  ]);
  try {
    if (!usage) throw new Error('no season-matching usage file');
    const usageDoc = usage.doc;
    const usageByGsis = {};
    for (const p of Object.values(usageDoc.players || {})) {
      if (p.gsis_id) usageByGsis[p.gsis_id] = p;
    }
    for (const s of Object.values(stats)) {
      const u = s.gsis_id ? usageByGsis[s.gsis_id] : null;
      s.target_share = u?.target_share ?? null;
      s.carry_share = u?.carry_share ?? null;
      s.snap_share = u?.snap_share ?? null;
      if (u) usageJoinedCount++;
    }
    usageAvailable = true;
    console.log(`\nUsage-share enrichment: ${usageJoinedCount}/${Object.keys(stats).length} rows joined (${(usageJoinedCount/Object.keys(stats).length*100).toFixed(1)}%) from ${relRepo(usage.path)}`);
  } catch (err) {
    console.log(`\n⚠ usage enrichment skipped (${err.message}) — share fields will be null on every row`);
    for (const s of Object.values(stats)) {
      s.target_share = null;
      s.carry_share = null;
      s.snap_share = null;
    }
  }

  // Write output
  const entries = Object.values(stats);
  const outPath = path.join(__dirname, `../src/data/playerStats${SEASON}.js`);
  const enrichmentMeta = {
    usage_source: usageAvailable ? sourceLabel(usage.path) : null,
    usage_join_rate: entries.length > 0 ? Number((usageJoinedCount / entries.length).toFixed(3)) : null,
    // E-4: record the team-offense and 2026-roster sources too, so a header
    // read shows all three enrichment inputs. Informational only — the
    // floor (scripts/check-player-stats-floor.mjs) asserts the row fields.
    team_offense_source: teamScheme ? sourceLabel(teamScheme.path) : null,
    roster_2026_source: rosterWeeklyByGsis.size > 0 ? sourceLabel(ROSTER_WEEKLY_PATH) : null,
  };

  const output = `/**
 * Player Stats — ${SEASON} Season (canonical player-stat source)
 * Auto-generated by scripts/build-player-stats.js from nflverse data.
 * ${entries.length} players | Generated: ${new Date().toISOString().split('T')[0]}
 *
 * Enrichment (EM/PO Directive v2 Task 2):
 *   usage source: ${enrichmentMeta.usage_source || 'unavailable'}
 *   usage join rate: ${enrichmentMeta.usage_join_rate == null ? 'n/a' : (enrichmentMeta.usage_join_rate * 100).toFixed(1) + '%'}
 *   team offense source: ${enrichmentMeta.team_offense_source || 'unavailable'}
 *   2026 roster source: ${enrichmentMeta.roster_2026_source || 'unavailable'}
 *
 * Each row carries: gsis_id (canonical join key), name, team, pos, games,
 * stat lines, plus target_share / carry_share / snap_share when the usage
 * layer has a matching gsis_id. Consumers must key on gsis_id — display
 * names have collisions (Bijan Robinson / Brian Robinson Jr, etc.).
 */
export const PLAYER_STATS_${SEASON} = ${JSON.stringify(entries, null, 2)};

export const PLAYER_STATS_${SEASON}_META = ${JSON.stringify(enrichmentMeta, null, 2)};
`;

  fs.writeFileSync(outPath, output);
  console.log(`\n✅ Wrote ${entries.length} player stats to ${outPath}`);

  // Summary
  const qbCount = entries.filter(e => e.pos === 'QB').length;
  const wrCount = entries.filter(e => e.pos === 'WR' || e.pos === 'TE').length;
  const rbCount = entries.filter(e => e.pos === 'RB').length;
  console.log(`   QBs: ${qbCount} | WR/TE: ${wrCount} | RB: ${rbCount}`);
}

function int(v) { return parseInt(v) || 0; }
function pct(num, den) { const n = int(num), d = int(den); return d > 0 ? Math.round(n / d * 1000) / 10 : 0; }
function div(num, den) { const n = int(num), d = int(den); return d > 0 ? Math.round(n / d * 10) / 10 : 0; }

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
