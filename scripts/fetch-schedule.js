#!/usr/bin/env node
/**
 * fetch-schedule.js
 *
 * Ingests the nflverse `schedules` release (games.csv) and produces a
 * week-indexed schedule for the requested season. Unblocks bye-week
 * collision checking, playoff-weeks SOS, and the K/DEF December
 * environment model (P0-3, P2-1 in FANTASY_ENGINE_BUILD_PLAN.md).
 *
 * Output: src/data/schedule${SEASON}.js
 *
 * Usage:
 *   node scripts/fetch-schedule.js               # defaults to SEASON=2026
 *   SEASON=2025 node scripts/fetch-schedule.js
 *   node scripts/fetch-schedule.js 2025
 *
 * Source: https://github.com/nflverse/nflverse-data/releases/tag/schedules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEASON = parseInt(process.env.SEASON || process.argv[2] || '2026', 10);
const GAMES_URL = 'https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv';
const OUT_PATH = path.join(__dirname, `../src/data/schedule${SEASON}.js`);

const TEAM_MAP = { OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', LA: 'LAR' };
const ALL_TEAMS = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG',
  'NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS',
];

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

function intOrNull(s) {
  if (s == null || s === '') return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

async function main() {
  console.log(`DownfieldOS — nflverse Schedule Ingest (${SEASON})`);
  console.log('==================================================\n');

  console.log(`  Fetching games.csv...`);
  const res = await fetch(GAMES_URL);
  if (!res.ok) throw new Error(`Failed to fetch games.csv: ${res.status}`);
  const text = await res.text();
  console.log(`  Downloaded ${(text.length / 1024 / 1024).toFixed(1)}MB`);

  const rows = parseCSV(text);
  console.log(`  Total rows across all seasons: ${rows.length.toLocaleString()}`);

  // Filter to the target season, regular season only (bye derivation looks at REG only)
  const seasonRows = rows.filter(r => r.season === String(SEASON));
  const regRows = seasonRows.filter(r => r.game_type === 'REG');
  const postRows = seasonRows.filter(r => r.game_type && r.game_type !== 'REG');
  console.log(`  ${SEASON} regular-season games: ${regRows.length}`);
  console.log(`  ${SEASON} post-season games:    ${postRows.length}`);

  if (regRows.length === 0) {
    console.error(`  No regular-season games found for ${SEASON}. Aborting.`);
    process.exit(1);
  }

  // Regular-season weeks span (usually 1–18)
  const weeks = [...new Set(regRows.map(r => parseInt(r.week, 10)))].filter(w => !isNaN(w)).sort((a, b) => a - b);
  const minWeek = weeks[0];
  const maxWeek = weeks[weeks.length - 1];
  console.log(`  Regular-season weeks: ${minWeek}–${maxWeek} (${weeks.length} distinct)\n`);

  // E-036 (2026-09-17): international-venue overrides. nflverse's `schedules`
  // release inherits the home team's usual `roof` / `surface` / stadium_id for
  // international games — so a game at Melbourne Cricket Ground shows
  // `roof: dome, surface: matrixturf, stadium_id: LAX01` (SoFi's values,
  // LAR's home). That flatters the wrong environment: a +0.50 "dome home"
  // bonus went to a team that lost 27-7 after a trans-Pacific trip. Patch
  // the venue characteristics at ingest, and stamp a `venue_tz` + `intl` flag
  // downstream code can use for tz_delta and int'l asserts. Add rows here as
  // NFL announces new intl games each season.
  const INTL_VENUES = {
    'Melbourne Cricket Ground':   { roof: 'outdoors', surface: 'grass', venue_tz: 'Australia/Melbourne', country: 'AU' },
    'Wembley Stadium':            { roof: 'outdoors', surface: 'grass', venue_tz: 'Europe/London',       country: 'GB' },
    // Tottenham Hotspur Stadium's "retractable" element is the pitch (the
    // football/soccer turf slides out to expose the NFL artificial-grass
    // surface); the roof over the seating shell is fixed and the pitch is
    // open sky. Upstream nflverse correctly codes it `outdoors`. QA
    // 2026-09-17 20:05 caught the wrong override here.
    'Tottenham Hotspur Stadium':  { roof: 'outdoors', surface: 'grass', venue_tz: 'Europe/London',       country: 'GB' },
    'Deutsche Bank Park':         { roof: 'outdoors', surface: 'grass', venue_tz: 'Europe/Berlin',       country: 'DE' },
    // Real Madrid's Bernabéu. Upstream spells it 'Bernabeu' (no accent);
    // match that exactly. Roof/surface deliberately left unset so upstream
    // (roof: null, surface: fieldturf) rides through — the roof is
    // retractable but nflverse doesn't tell us whether the NFL game
    // was played with it closed. venue_tz + country make the assert fire
    // and tz_delta compute for the trip.
    'Bernabeu':                   { venue_tz: 'Europe/Madrid',    country: 'ES' },
    'Arena Corinthians':          { roof: 'outdoors', surface: 'grass', venue_tz: 'America/Sao_Paulo',   country: 'BR' },
  };

  // E-045 (2026-09-21): never overwrite a populated schedule field with
  // an upstream null. QA (09:05 CT) caught the Monday refresh 7034753
  // silently dropping `surface` on 14 Week-2 games (NO_BAL / MIN_CHI
  // grass → null; PIT_NE / GB_NYJ / CAR_ATL fieldturf → null; +9 more).
  // Zero impact today (surface carried, not scored) but the moment a
  // scoring term reads surface it sees a null. Fix: load HEAD's
  // committed schedule, build a prev-by-game_id index, and if a new
  // record's roof/surface/venue_tz is null AND the prior committed
  // value was non-null, carry the prior value forward with a stamp
  // `<field>_source: 'carried-forward <ISO> (from HEAD)'`.
  const CARRIED_FIELDS = ['roof', 'surface', 'venue_tz'];
  const prevByGameId = new Map();
  let prevLoadError = null;
  // E-045 restore path: `PREV_REF=<sha>` overrides HEAD when a prior
  // refresh dropped a field and HEAD has the drop baked in. One-time
  // use to unstick the state; from then on the default HEAD is fine
  // because the new HEAD will carry the restored values.
  const PREV_REF = process.env.PREV_REF || 'HEAD';
  try {
    const prevSrc = execFileSync('git', ['show', `${PREV_REF}:src/data/schedule${SEASON}.js`], { encoding: 'utf8', cwd: path.resolve(__dirname, '..'), maxBuffer: 32 * 1024 * 1024 });
    // Extract SCHEDULE_2026 = {...}; via a small trick — parse as a
    // Function returning the object. Safe: source is our own committed
    // file, not untrusted input.
    const jsonSlice = prevSrc.match(/export const SCHEDULE_\d+ = (\{[\s\S]*?\n\});\s*$/m);
    if (jsonSlice) {
      const prevObj = JSON.parse(jsonSlice[1]);
      // Walk both indices — byWeek and per-team games — dedup by game_id.
      const collect = (rec) => {
        if (!rec?.game_id) return;
        if (!prevByGameId.has(rec.game_id)) {
          prevByGameId.set(rec.game_id, { roof: rec.roof, surface: rec.surface, venue_tz: rec.venue_tz });
        }
      };
      for (const wArr of Object.values(prevObj.byWeek || {})) for (const g of wArr) collect(g);
      for (const t of Object.values(prevObj.teams || {})) for (const g of (t.games || [])) collect(g);
      console.log(`  loaded prev schedule from ${PREV_REF}: ${prevByGameId.size} unique game_ids indexed for carry-forward`);
    }
  } catch (e) {
    prevLoadError = e.message;
    console.log(`  ⚠ could not load ${PREV_REF}:src/data/schedule${SEASON}.js — carry-forward disabled for this run (${e.message.split('\n')[0]})`);
  }
  const carryStamp = new Date().toISOString();
  const carryLog = [];

  // Compact per-game record — used by both byWeek index and per-team games list
  function compact(row, teamSide /* 'home' | 'away' | null */) {
    const home = norm(row.home_team);
    const away = norm(row.away_team);
    const stadium = row.stadium || null;
    const intl = stadium ? INTL_VENUES[stadium] : null;
    // E-045: candidate values BEFORE carry-forward. Then per-field, if
    // upstream is null and prev committed value is non-null, restore
    // the prev value and stamp `<field>_source`.
    const proposed = {
      roof: (intl?.roof ?? row.roof) || null,
      surface: (intl?.surface ?? row.surface) || null,
      venue_tz: intl?.venue_tz ?? null,
    };
    const prev = prevByGameId.get(row.game_id) || {};
    const sourceStamps = {};
    for (const f of CARRIED_FIELDS) {
      if ((proposed[f] == null || proposed[f] === '') && prev[f] != null && prev[f] !== '') {
        // Never overwrite value with null.
        proposed[f] = prev[f];
        sourceStamps[`${f}_source`] = `carried-forward ${carryStamp} (from HEAD)`;
        carryLog.push({ game_id: row.game_id, field: f, from: prev[f] });
      }
    }
    const rec = {
      game_id: row.game_id,
      week: intOrNull(row.week),
      game_type: row.game_type,
      gameday: row.gameday || null,
      weekday: row.weekday || null,
      gametime: row.gametime || null,
      home: home,
      away: away,
      div_game: row.div_game === '1',
      // If it's a known international venue, override nflverse's roof/surface
      // (which are inherited from the home team's usual stadium and wrong).
      roof: proposed.roof,
      surface: proposed.surface,
      stadium: stadium,
      stadium_id: row.stadium_id || null,
      referee: row.referee || null,
      spread_line: row.spread_line !== '' && row.spread_line != null ? Number(row.spread_line) : null,
      total_line: row.total_line !== '' && row.total_line != null ? Number(row.total_line) : null,
      // E-036: `venue_tz` and `venue_country` populated for international
      // games only. build-weekly-board.js reads `venue_tz` to compute the
      // right tz_delta for both sides (nflverse's default assumed the home
      // team was on their usual time zone, giving tz_delta 0 for
      // trans-Pacific trips).
      venue_tz: proposed.venue_tz,
      venue_country: intl?.country ?? null,
      ...sourceStamps,
    };
    if (teamSide === 'home') {
      return { ...rec, opponent: away, isHome: true };
    }
    if (teamSide === 'away') {
      return { ...rec, opponent: home, isHome: false };
    }
    return rec;
  }

  // Per-team schedule (regular season)
  const teams = {};
  ALL_TEAMS.forEach(t => { teams[t] = { games: [], byeWeek: null }; });

  for (const row of regRows) {
    const home = norm(row.home_team);
    const away = norm(row.away_team);
    if (teams[home]) teams[home].games.push(compact(row, 'home'));
    if (teams[away]) teams[away].games.push(compact(row, 'away'));
  }

  // Derive bye weeks — the one regular-season week each team has no game
  const missingBye = [];
  const multiBye = [];
  for (const t of ALL_TEAMS) {
    const weeksPlayed = new Set(teams[t].games.map(g => g.week));
    const byes = weeks.filter(w => !weeksPlayed.has(w));
    if (byes.length === 1) {
      teams[t].byeWeek = byes[0];
    } else if (byes.length === 0) {
      missingBye.push(t);
    } else {
      teams[t].byeWeek = byes[0]; // pick the first, but flag it
      multiBye.push({ team: t, weeks: byes });
    }
    // Sort games by week
    teams[t].games.sort((a, b) => a.week - b.week);
  }
  if (missingBye.length) console.log(`  ⚠ Teams with no bye: ${missingBye.join(', ')}`);
  if (multiBye.length) {
    console.log(`  ⚠ Teams with multiple missing weeks (schedule may be partial):`);
    multiBye.forEach(x => console.log(`    ${x.team}: ${x.weeks.join(', ')}`));
  }

  // Week index — for a "who plays whom this week" lookup
  const byWeek = {};
  for (const row of regRows) {
    const w = intOrNull(row.week);
    if (w == null) continue;
    if (!byWeek[w]) byWeek[w] = [];
    byWeek[w].push(compact(row, null));
  }
  // Sort each week's games by gameday then gametime for deterministic output
  for (const w of Object.keys(byWeek)) {
    byWeek[w].sort((a, b) => (a.gameday || '').localeCompare(b.gameday || '') || (a.gametime || '').localeCompare(b.gametime || ''));
  }

  // Bye-week index — teams grouped by their bye week (feeds stacked-bye checks)
  const byeByWeek = {};
  for (const t of ALL_TEAMS) {
    const w = teams[t].byeWeek;
    if (w == null) continue;
    if (!byeByWeek[w]) byeByWeek[w] = [];
    byeByWeek[w].push(t);
  }

  // Playoff-weeks slate (weeks 15–17 = fantasy playoffs)
  const playoffWeeks = [15, 16, 17].filter(w => weeks.includes(w));
  const playoffSlate = {};
  for (const t of ALL_TEAMS) {
    playoffSlate[t] = playoffWeeks.map(pw => {
      const g = teams[t].games.find(x => x.week === pw);
      if (!g) return { week: pw, bye: true };
      return {
        week: pw,
        opponent: g.opponent,
        isHome: g.isHome,
        roof: g.roof,
        surface: g.surface,
        stadium: g.stadium,
      };
    });
  }

  // Summary
  console.log('\nBye week distribution:');
  Object.keys(byeByWeek).sort((a, b) => a - b).forEach(w => {
    console.log(`  Week ${w}: ${byeByWeek[w].length} team(s) — ${byeByWeek[w].join(', ')}`);
  });

  // E-045: carry-forward summary. `carryLog` will have duplicates
  // because `compact()` runs three times per game (byWeek + home
  // team's list + away team's list); dedup by game_id+field for the
  // human-readable count.
  const uniqCarries = new Map(); // key = `${game_id}|${field}` → {game_id, field, from}
  for (const c of carryLog) uniqCarries.set(`${c.game_id}|${c.field}`, c);
  if (uniqCarries.size) {
    console.log(`\nCarry-forward (E-045): ${uniqCarries.size} field(s) restored from HEAD after upstream returned null`);
    for (const c of uniqCarries.values()) {
      console.log(`  ${c.game_id} ${c.field}: null → ${JSON.stringify(c.from)} (carried)`);
    }
  } else if (prevLoadError) {
    console.log('\nCarry-forward (E-045): skipped — HEAD load failed');
  } else {
    console.log('\nCarry-forward (E-045): 0 fields needed carry-forward (upstream matched or exceeded HEAD for every game).');
  }

  const meta = {
    season: SEASON,
    regular_season_weeks: { min: minWeek, max: maxWeek, count: weeks.length },
    playoff_weeks: playoffWeeks,
    total_regular_games: regRows.length,
    total_postseason_games: postRows.length,
    source: 'nflverse (github.com/nflverse/nflverse-data — schedules release)',
    generated: new Date().toISOString(),
    notes: 'Bye = week within regular-season span with no scheduled game. LA normalized to LAR. Env fields (roof, surface, stadium) preserved for K/DEF environment model.',
  };

  const payload = { meta, teams, byWeek, byeByWeek, playoffSlate };

  const output = `// Auto-generated from nflverse schedules release (games.csv) — season ${SEASON}
// Generated: ${meta.generated}
// Source: ${meta.source}
// Do not edit manually — re-run: SEASON=${SEASON} node scripts/fetch-schedule.js

export const SCHEDULE_${SEASON} = ${JSON.stringify(payload, null, 2)};
`;

  fs.writeFileSync(OUT_PATH, output);
  console.log(`\nWrote ${OUT_PATH} (${(fs.statSync(OUT_PATH).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
