#!/usr/bin/env node
/**
 * build-games-2026.js
 *
 * Joins nflverse `schedules/games.csv` (final scores + dates) with the
 * already-cached `public/data/plays-2026.json` (DFOS play schema) to emit
 * one compact per-game recap file the site can read directly.
 *
 * Output: src/data/games2026.json
 *   {
 *     generated_at: ISO,
 *     source: 'nflverse/games.csv + public/data/plays-2026.json',
 *     season: 2026,
 *     weeks_included: [1],
 *     games: [
 *       {
 *         gameId, week, date, gametime, weekday,
 *         home, away, home_score, away_score, winner, margin,
 *         total, overtime,
 *         home_stats: { plays, sr, xr, pr, epa_per_play_est },
 *         away_stats: { plays, sr, xr, pr, epa_per_play_est },
 *         expected_pass_rate_baseline: 0.55, // league baseline reference
 *         narrative: '<one-liner> — e.g., "Chiefs blow out Broncos 31-10 in Mahomes return"'
 *       }, ...
 *     ]
 *   }
 *
 * The narrative is deterministic (built from score margin + top stat),
 * never LLM-generated — the recap is a data view, not an editorial one.
 * Deeper editorial recaps live in the newsletter, not the site.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.dirname(path.dirname(__filename));
const GAMES_CSV_URL = 'https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv';
const PLAYS_JSON = path.join(REPO_ROOT, 'public/data/plays-2026.json');
const OUT = path.join(REPO_ROOT, 'src/data/games2026.json');

const SEASON = 2026;
const WEEKS = process.env.WEEKS
  ? process.env.WEEKS.split(',').map(w => parseInt(w.trim(), 10)).filter(n => !Number.isNaN(n))
  : null; // null = every week present in the plays file

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { q = false; }
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

async function fetchGames() {
  const res = await fetch(GAMES_CSV_URL);
  if (!res.ok) throw new Error(`nflverse games.csv fetch failed: ${res.status}`);
  const text = await res.text();
  const lines = text.split('\n').filter(l => l.length > 0);
  const header = parseCSVLine(lines[0]);
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    if (cells[idx.season] !== String(SEASON)) continue;
    // nflverse encodes the Rams as "LA" in the schedule while the DFOS
    // team registry uses "LAR" (matches every other feed). Normalize on
    // ingest so downstream lookups (tn(), TeamIntel joins, weeklyBoard
    // opponent joins) hit the right row instead of falling through to
    // the raw code. QA lane-1, 2026-09-16: /this-week showed "LA / LA".
    const norm = (t) => (t === 'LA' ? 'LAR' : t);
    rows.push({
      game_id: cells[idx.game_id],
      season: parseInt(cells[idx.season], 10),
      week: parseInt(cells[idx.week], 10),
      gameday: cells[idx.gameday],
      weekday: cells[idx.weekday],
      gametime: cells[idx.gametime],
      away_team: norm(cells[idx.away_team]),
      away_score: cells[idx.away_score] === '' ? null : parseInt(cells[idx.away_score], 10),
      home_team: norm(cells[idx.home_team]),
      home_score: cells[idx.home_score] === '' ? null : parseInt(cells[idx.home_score], 10),
      total: cells[idx.total] === '' ? null : parseInt(cells[idx.total], 10),
      overtime: cells[idx.overtime] === '1',
    });
  }
  return rows;
}

function loadPlays() {
  return JSON.parse(fs.readFileSync(PLAYS_JSON, 'utf8'));
}

// Compact per-team offensive stats for one game
function teamStats(playsForGame, team) {
  const own = playsForGame.filter(p => p.off === team);
  const n = own.length;
  if (n === 0) return null;
  const passPlays = own.filter(p => p.type === 'Pass');
  const runPlays = own.filter(p => p.type === 'Run');
  const succ = own.filter(p => p.isS === 1).length;
  const expl = own.filter(p => p.isX === 1).length;
  const rz = own.filter(p => p.rz === 1).length;
  return {
    plays: n,
    pass_rate: n ? passPlays.length / n : 0,
    success_rate: n ? succ / n : 0,
    explosive_rate: n ? expl / n : 0,
    redzone_snaps: rz,
    // rough EPA proxy — success rate above 0.45 baseline as a signed number
    epa_proxy: n ? (succ / n) - 0.45 : 0,
  };
}

// Deterministic one-liner per game. No em dashes (AGENTS.md content rule),
// no contradictory margin/total combos (QA lane-1: prior version produced
// "blowout, even" because the total-shape bucket 26-44 was labelled "even"
// regardless of the margin). Kickoff time carries an ET label — nflverse
// gametime is US Eastern.
function narrative(g, homeStats, awayStats) {
  const { home, away, home_score, away_score, winner, margin } = g;
  if (home_score == null || away_score == null) {
    const kick = g.gametime ? ` ${g.gametime} ET` : '';
    return `${away} at ${home}. Kickoff ${g.weekday}${kick}.`.trim();
  }
  const loser = winner === home ? away : home;
  const winnerScore = winner === home ? home_score : away_score;
  const loserScore = winner === home ? away_score : home_score;
  // Pick one shape word for the whole game: prefer margin over total so a
  // blowout stays a blowout even if the total happens to be middling; only
  // fall back to a total-shape word when the margin is a normal single-
  // score/close game (nothing meaningful about the margin) AND the total is
  // an outlier (shootout / defensive struggle).
  const total = home_score + away_score;
  let shape;
  if (margin >= 21) shape = 'blowout';
  else if (margin >= 14) shape = 'double-digit win';
  else if (margin >= 8) shape = 'one-score win';
  else if (margin >= 4) shape = 'tight one-score win';
  else if (margin >= 1) {
    if (total >= 60) shape = 'shootout, decided late';
    else if (total <= 25) shape = 'low-scoring nail-biter';
    else shape = 'nail-biter';
  } else shape = 'tie';
  const otSuffix = g.overtime ? ', OT' : '';
  return `${winner} ${winnerScore}, ${loser} ${loserScore}. ${shape}${otSuffix}.`;
}

async function main() {
  console.log('DFOS — build-games-2026');
  console.log('=======================\n');

  const gamesAll = await fetchGames();
  console.log(`  fetched ${gamesAll.length} ${SEASON} games from nflverse`);

  const plays = loadPlays();
  const playsByGame = new Map();
  for (const p of plays) {
    if (!playsByGame.has(p.gameId)) playsByGame.set(p.gameId, []);
    playsByGame.get(p.gameId).push(p);
  }
  console.log(`  loaded ${plays.length} plays across ${playsByGame.size} gameIds`);

  // Default: every regular-season week the schedule knows about (1-18),
  // so the site can render "played" weeks alongside "upcoming" weeks. Override
  // with WEEKS=1,2 to narrow.
  const weeksWanted = WEEKS ?? [...new Set(gamesAll.filter(g => g.week && g.week <= 18).map(g => g.week))].sort((a, b) => a - b);
  const games = [];
  for (const g of gamesAll) {
    if (!weeksWanted.includes(g.week)) continue;
    const gp = playsByGame.get(g.game_id) || [];
    const homeStats = teamStats(gp, g.home_team);
    const awayStats = teamStats(gp, g.away_team);
    const played = g.home_score != null && g.away_score != null;
    const winner = !played ? null : g.home_score > g.away_score ? g.home_team : g.home_score < g.away_score ? g.away_team : 'TIE';
    const margin = !played ? null : Math.abs(g.home_score - g.away_score);
    const record = {
      gameId: g.game_id,
      week: g.week,
      date: g.gameday,
      weekday: g.weekday,
      gametime: g.gametime,
      home: g.home_team,
      away: g.away_team,
      home_score: g.home_score,
      away_score: g.away_score,
      total: g.total,
      overtime: g.overtime,
      winner,
      margin,
      played,
      home_stats: homeStats,
      away_stats: awayStats,
    };
    record.narrative = narrative(record, homeStats, awayStats);
    games.push(record);
  }
  games.sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.gametime || '').localeCompare(b.gametime || ''));

  const out = {
    generated_at: new Date().toISOString(),
    source: 'nflverse/games.csv + public/data/plays-2026.json',
    season: SEASON,
    weeks_included: [...new Set(games.map(g => g.week))].sort((a, b) => a - b),
    games,
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\n  Wrote ${OUT}`);
  console.log(`  ${games.length} games, weeks: ${out.weeks_included.join(', ')}`);
  console.log(`  played: ${games.filter(g => g.played).length}, scheduled: ${games.filter(g => !g.played).length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
