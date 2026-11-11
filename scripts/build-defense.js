#!/usr/bin/env node
/**
 * build-defense.js — DFOS Part 1 of the context-layer build (2026-09-04),
 * moved onto in-season play-by-play by DATA_FRESHNESS_PLAN step 2 (2026-11).
 *
 * The single missing input for weekly start-sit: opponent defensive splits.
 * Emits src/data/defense2026.js — one row per NFL team, computed from the
 * SEASON's regular-season nflverse play-by-play to date. Each row also
 * carries the previous season's rates under prior_<season-1>, read from the
 * static src/data/defense<season-1>.js.
 *
 * Every metric is a RATE stat (per game or per play) so defenses that faced
 * 600 plays are comparable to defenses that faced 500. Ranks are 1 = best
 * defense (fewest points/EPA allowed), 32 = worst.
 *
 * Inputs (argument, then env, then default):
 *   --season <yyyy>        SEASON                 default 2026
 *   --pbp <path>           DEFENSE_PBP            default ../data/intelligence/raw/play_by_play_<season>.csv.gz
 *   --roster <path>        DEFENSE_ROSTER         default ../data/intelligence/raw/roster_weekly_<season>.csv
 *                                                 (nflverse weekly rosters, .csv or .csv.gz; gsis_id → position)
 *   --through-week <n>     DEFENSE_THROUGH_WEEK   default: every REG week in the play-by-play
 *   --prior <path>         DEFENSE_PRIOR          default src/data/defense<season-1>.js
 *   --out <path>           DEFENSE_OUT            default src/data/defense2026.js
 *
 * The Tuesday chain (data-tuesday-results.yml) runs this after the results
 * gate with the play-by-play and weekly roster it already downloads, and
 * --through-week set to the week it grades.
 *
 * What's here vs what's not:
 *   ✓ FPts allowed to QB/RB/WR/TE per game (full-PPR)
 *   ✓ Pass/rush yards allowed per game
 *   ✓ Pass/rush EPA allowed per attempt
 *   ✓ Pass/rush TDs allowed per game
 *   ✓ Plays faced (so downstream can weight small-sample suspicion)
 *   ✓ Rankings for each rate stat, computed against 32-team spread
 *   ✗ Scheme-specific splits (outside-zone vs gap) — nflverse PBP does not
 *     carry defensive front alignment or run scheme labels reliably. Skipped
 *     rather than approximated.
 *
 * Rules honoured (from _FROM_COS/2026-09-04-context-layer-build.md):
 *   - Every row labelled with `defense_source: 'nflverse_pbp_<season>_REG'`.
 *   - Population NOT targeted is called out in meta rather than fabricated.
 *   - No coverage test masquerading as an acceptance test.
 *   - No model change: weekly_value has no matchup term (E-034 v2); this
 *     file is context only. scripts/check-defense-field.mjs recomputes it
 *     from weekly_actuals_<season>.json.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..');
const OUTER_RAW = path.join(REPO_ROOT, '..', 'data', 'intelligence', 'raw');

const ARGV = process.argv.slice(2);
function opt(flag, envKey) {
  const i = ARGV.indexOf(flag);
  if (i >= 0) {
    const v = ARGV[i + 1];
    if (v == null || v.startsWith('--')) throw new Error(`${flag} needs a value`);
    return v;
  }
  const e = process.env[envKey];
  return e != null && e !== '' ? e : null;
}
const SEASON = Number(opt('--season', 'SEASON') || 2026);
if (!Number.isInteger(SEASON) || SEASON < 1999) throw new Error(`bad season: ${SEASON}`);
const PRIOR_SEASON = SEASON - 1;
const PBP_PATH = path.resolve(opt('--pbp', 'DEFENSE_PBP') || path.join(OUTER_RAW, `play_by_play_${SEASON}.csv.gz`));
const ROSTER_PATH = path.resolve(opt('--roster', 'DEFENSE_ROSTER') || path.join(OUTER_RAW, `roster_weekly_${SEASON}.csv`));
const THROUGH_WEEK_RAW = opt('--through-week', 'DEFENSE_THROUGH_WEEK');
const THROUGH_WEEK = THROUGH_WEEK_RAW == null ? null : Number(THROUGH_WEEK_RAW);
if (THROUGH_WEEK != null && !(Number.isInteger(THROUGH_WEEK) && THROUGH_WEEK >= 1)) throw new Error(`bad --through-week: ${THROUGH_WEEK_RAW}`);
const PRIOR_PATH = path.resolve(opt('--prior', 'DEFENSE_PRIOR') || path.join(REPO_ROOT, 'src', 'data', `defense${PRIOR_SEASON}.js`));
const OUT = path.resolve(opt('--out', 'DEFENSE_OUT') || path.join(REPO_ROOT, 'src', 'data', 'defense2026.js'));
const SOURCE_LABEL = `nflverse_pbp_${SEASON}_REG`;

const ALL_TEAMS = ['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS'];
const NORM_TEAM = { LA: 'LAR', OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', AZ: 'ARI' };
function norm(t) { const u = (t || '').toUpperCase().trim(); return NORM_TEAM[u] || u; }

// Full-PPR scoring (same as valuation layer).
const SCORING = { rec: 1.0, rec_yd: 0.1, rec_td: 6, rush_yd: 0.1, rush_td: 6, pass_yd: 0.04, pass_td: 4 };

// Positions we bucket fpts_allowed against. Non-skill positions get
// filed under 'OTHER' and dropped when we compute per-position totals.
const SKILL_POS = new Set(['QB', 'RB', 'WR', 'TE']);

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

function readMaybeGz(p) {
  const buf = fs.readFileSync(p);
  return (p.endsWith('.gz') ? zlib.gunzipSync(buf) : buf).toString('utf8');
}

// gsis_id → position from nflverse weekly rosters. A player has one row per
// week; the latest week at or before THROUGH_WEEK wins.
function loadRosterPositions() {
  const csv = readMaybeGz(ROSTER_PATH);
  const lines = csv.split('\n');
  const headers = parseCsvLine(lines[0]);
  const gIdx = headers.indexOf('gsis_id');
  const pIdx = headers.indexOf('position');
  const wIdx = headers.indexOf('week');
  if (gIdx < 0 || pIdx < 0) throw new Error(`${ROSTER_PATH}: no gsis_id/position columns`);
  const byId = new Map();
  const weekOf = new Map();
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCsvLine(lines[i]);
    const g = vals[gIdx]; const p = (vals[pIdx] || '').toUpperCase();
    if (!g || !p) continue;
    const w = wIdx >= 0 ? Number(vals[wIdx]) || 0 : 0;
    if (THROUGH_WEEK != null && w > THROUGH_WEEK) continue;
    if (!byId.has(g) || w >= weekOf.get(g)) { byId.set(g, p); weekOf.set(g, w); }
  }
  return byId;
}

// The previous season's rates, read from the static defense<season-1>.js.
const PRIOR_FIELDS = [
  'pass_yards_allowed_per_game', 'rush_yards_allowed_per_game',
  'pass_td_allowed_per_game', 'rush_td_allowed_per_game',
  'pass_epa_per_att_allowed', 'rush_epa_per_att_allowed',
  'yards_per_pass_att_allowed', 'yards_per_rush_att_allowed',
  'fpts_allowed_qb_per_game', 'fpts_allowed_rb_per_game',
  'fpts_allowed_wr_per_game', 'fpts_allowed_te_per_game',
];
async function loadPrior() {
  if (!fs.existsSync(PRIOR_PATH)) return { rows: null, note: `${path.relative(REPO_ROOT, PRIOR_PATH)} not found; prior_${PRIOR_SEASON} omitted.` };
  const mod = await import(pathToFileURL(PRIOR_PATH).href);
  const key = Object.keys(mod).find(k => /^DEFENSE_\d{4}$/.test(k));
  if (!key) return { rows: null, note: `${path.relative(REPO_ROOT, PRIOR_PATH)} has no DEFENSE_<yyyy> export; prior_${PRIOR_SEASON} omitted.` };
  return { rows: mod[key], note: null };
}

function fantasyPtsForRusher(row) {
  return (row.yards_gained || 0) * SCORING.rush_yd + (row.rush_touchdown ? SCORING.rush_td : 0);
}
function fantasyPtsForReceiver(row) {
  // yards on this play credited to the receiver (only if completed pass)
  const yds = row.yards_gained || 0;
  return SCORING.rec + yds * SCORING.rec_yd + (row.pass_touchdown ? SCORING.rec_td : 0);
}
function fantasyPtsForPasser(row) {
  const yds = row.yards_gained || 0;
  return yds * SCORING.pass_yd + (row.pass_touchdown ? SCORING.pass_td : 0);
}

async function main() {
  console.log(`DFOS — Defense build: ${SEASON} REG play-by-play${THROUGH_WEEK != null ? ` through week ${THROUGH_WEEK}` : ''}`);
  console.log('=============================================\n');
  console.log(`  play-by-play: ${PBP_PATH}`);
  console.log(`  roster:       ${ROSTER_PATH}`);
  console.log(`  prior:        ${PRIOR_PATH}`);
  console.log(`  out:          ${OUT}`);

  const rosterPos = loadRosterPositions();
  console.log(`  roster ${SEASON} positions: ${rosterPos.size} players`);
  if (rosterPos.size === 0) throw new Error('roster gave 0 positions');

  console.log(`  reading ${path.basename(PBP_PATH)} ...`);
  const csv = readMaybeGz(PBP_PATH);
  const lines = csv.split('\n');
  const headers = parseCsvLine(lines[0]);
  const idx = Object.fromEntries(['posteam','defteam','play_type','yards_gained','pass_touchdown','rush_touchdown','interception','fumble_lost','complete_pass','receiver_player_id','rusher_player_id','passer_player_id','epa','week','season_type','game_id'].map(h => [h, headers.indexOf(h)]));

  // Accumulators per defensive team
  const D = Object.fromEntries(ALL_TEAMS.map(t => [t, {
    team: t,
    games: new Set(),
    plays_faced: 0,
    pass_attempts_faced: 0,
    rush_attempts_faced: 0,
    pass_yards_allowed: 0,
    rush_yards_allowed: 0,
    pass_epa_sum: 0,
    rush_epa_sum: 0,
    pass_td_allowed: 0,
    rush_td_allowed: 0,
    interceptions_forced: 0,
    fumbles_forced: 0,
    fpts_allowed: { QB: 0, RB: 0, WR: 0, TE: 0, OTHER: 0 },
  }]));

  for (const h of ['season_type', 'week', 'defteam', 'play_type', 'game_id']) {
    if (idx[h] < 0) throw new Error(`${PBP_PATH}: no ${h} column`);
  }
  let total = 0, skipped = 0;
  const weeksSeen = new Set();
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCsvLine(lines[i]);
    if (vals[idx.season_type] !== 'REG') continue;
    const wk = Number(vals[idx.week]);
    if (THROUGH_WEEK != null && wk > THROUGH_WEEK) continue;
    const defRaw = vals[idx.defteam];
    if (!defRaw) continue;
    const def = norm(defRaw);
    if (!D[def]) { skipped++; continue; }
    total++;
    weeksSeen.add(wk);

    const row = {
      play_type: vals[idx.play_type],
      yards_gained: parseFloat(vals[idx.yards_gained] || '0') || 0,
      pass_touchdown: vals[idx.pass_touchdown] === '1',
      rush_touchdown: vals[idx.rush_touchdown] === '1',
      interception: vals[idx.interception] === '1',
      fumble_lost: vals[idx.fumble_lost] === '1',
      complete_pass: vals[idx.complete_pass] === '1',
      receiver_id: vals[idx.receiver_player_id] || null,
      rusher_id: vals[idx.rusher_player_id] || null,
      passer_id: vals[idx.passer_player_id] || null,
      epa: parseFloat(vals[idx.epa] || '0'),
      game_id: vals[idx.game_id],
    };

    const d = D[def];
    d.games.add(row.game_id);
    d.plays_faced++;

    if (row.play_type === 'pass') {
      d.pass_attempts_faced++;
      d.pass_yards_allowed += row.yards_gained;
      if (!isNaN(row.epa)) d.pass_epa_sum += row.epa;
      if (row.pass_touchdown) d.pass_td_allowed++;
      if (row.interception) d.interceptions_forced++;
      // fpts to passer (QB assumed)
      const passerPos = (row.passer_id && rosterPos.get(row.passer_id)) || 'QB';
      const passerBucket = SKILL_POS.has(passerPos) ? passerPos : 'OTHER';
      d.fpts_allowed[passerBucket] += fantasyPtsForPasser(row);
      // fpts to receiver (only if completed pass — receiver only gets rec + yards + TD if the pass hit)
      if (row.complete_pass && row.receiver_id) {
        const recPos = rosterPos.get(row.receiver_id) || 'WR';
        const recBucket = SKILL_POS.has(recPos) ? recPos : 'OTHER';
        d.fpts_allowed[recBucket] += fantasyPtsForReceiver(row);
      }
    } else if (row.play_type === 'run') {
      d.rush_attempts_faced++;
      d.rush_yards_allowed += row.yards_gained;
      if (!isNaN(row.epa)) d.rush_epa_sum += row.epa;
      if (row.rush_touchdown) d.rush_td_allowed++;
      if (row.fumble_lost) d.fumbles_forced++;
      if (row.rusher_id) {
        const rusherPos = rosterPos.get(row.rusher_id) || 'RB';
        const bucket = SKILL_POS.has(rusherPos) ? rusherPos : 'OTHER';
        d.fpts_allowed[bucket] += fantasyPtsForRusher(row);
      }
    }
  }

  console.log(`  processed ${total.toLocaleString()} REG plays (${skipped} rows skipped for non-32-team defteam)`);
  if (total === 0) throw new Error('0 REG plays read; refusing to write an empty file');
  const weeksCovered = [...weeksSeen].sort((a, b) => a - b);
  console.log(`  weeks covered: ${weeksCovered.join(', ')}`);

  const prior = await loadPrior();
  if (prior.note) console.log(`  ⚠ ${prior.note}`);

  // Derive rate stats per team
  const rows = [];
  for (const t of ALL_TEAMS) {
    const d = D[t];
    const games = d.games.size;
    if (games === 0) continue;
    rows.push({
      team: t,
      [`games_${SEASON}`]: games,
      plays_faced: d.plays_faced,
      pass_attempts_faced: d.pass_attempts_faced,
      rush_attempts_faced: d.rush_attempts_faced,
      // Per-game rate stats
      pass_yards_allowed_per_game: Math.round(d.pass_yards_allowed / games * 10) / 10,
      rush_yards_allowed_per_game: Math.round(d.rush_yards_allowed / games * 10) / 10,
      pass_td_allowed_per_game: Math.round(d.pass_td_allowed / games * 100) / 100,
      rush_td_allowed_per_game: Math.round(d.rush_td_allowed / games * 100) / 100,
      // Per-attempt rate stats
      pass_epa_per_att_allowed: Math.round(d.pass_epa_sum / Math.max(1, d.pass_attempts_faced) * 1000) / 1000,
      rush_epa_per_att_allowed: Math.round(d.rush_epa_sum / Math.max(1, d.rush_attempts_faced) * 1000) / 1000,
      yards_per_pass_att_allowed: Math.round(d.pass_yards_allowed / Math.max(1, d.pass_attempts_faced) * 100) / 100,
      yards_per_rush_att_allowed: Math.round(d.rush_yards_allowed / Math.max(1, d.rush_attempts_faced) * 100) / 100,
      // Turnovers forced (context, not a rate)
      interceptions_forced: d.interceptions_forced,
      fumbles_forced: d.fumbles_forced,
      // Fantasy points allowed by position, per game
      fpts_allowed_qb_per_game: Math.round(d.fpts_allowed.QB / games * 10) / 10,
      fpts_allowed_rb_per_game: Math.round(d.fpts_allowed.RB / games * 10) / 10,
      fpts_allowed_wr_per_game: Math.round(d.fpts_allowed.WR / games * 10) / 10,
      fpts_allowed_te_per_game: Math.round(d.fpts_allowed.TE / games * 10) / 10,
    });
  }

  // Compute rankings — 1 = best (fewest allowed), 32 = worst.
  const rankFields = [
    'pass_yards_allowed_per_game', 'rush_yards_allowed_per_game',
    'pass_td_allowed_per_game', 'rush_td_allowed_per_game',
    'pass_epa_per_att_allowed', 'rush_epa_per_att_allowed',
    'yards_per_pass_att_allowed', 'yards_per_rush_att_allowed',
    'fpts_allowed_qb_per_game', 'fpts_allowed_rb_per_game',
    'fpts_allowed_wr_per_game', 'fpts_allowed_te_per_game',
  ];
  for (const f of rankFields) {
    const sorted = [...rows].sort((a, b) => a[f] - b[f]);   // ascending — fewer allowed = better = rank 1
    sorted.forEach((r, i) => { r[`rank_${f}`] = i + 1; });
  }

  // Convenience: composite ranks
  for (const r of rows) {
    r.rank_pass_def_overall = Math.round((r.rank_pass_epa_per_att_allowed + r.rank_yards_per_pass_att_allowed + r.rank_fpts_allowed_qb_per_game + r.rank_fpts_allowed_wr_per_game + r.rank_fpts_allowed_te_per_game) / 5);
    r.rank_rush_def_overall = Math.round((r.rank_rush_epa_per_att_allowed + r.rank_yards_per_rush_att_allowed + r.rank_fpts_allowed_rb_per_game) / 3);
    r.defense_source = SOURCE_LABEL;
    const p = prior.rows && prior.rows[r.team];
    if (p) {
      const o = { [`games_${PRIOR_SEASON}`]: p[`games_${PRIOR_SEASON}`] ?? null };
      for (const f of PRIOR_FIELDS) o[f] = p[f] ?? null;
      o.defense_source = p.defense_source ?? null;
      r[`prior_${PRIOR_SEASON}`] = o;
    }
  }

  // Object keyed by team code for cheap lookup at join time
  const byTeam = Object.fromEntries(rows.map(r => [r.team, r]));

  const weeksText = weeksCovered.length
    ? (weeksCovered.length === 1 ? `week ${weeksCovered[0]}` : `weeks ${weeksCovered[0]} to ${weeksCovered[weeksCovered.length - 1]}`)
    : 'no weeks';
  const generated = new Date().toISOString();
  const meta = {
    generated,
    source_season: SEASON,
    season_type: 'REG',
    weeks_covered: weeksCovered,
    through_week: THROUGH_WEEK,
    source: `nflverse play_by_play_${SEASON}.csv.gz (REG only, ${weeksText}) × roster_weekly_${SEASON}.csv (gsis_id → position)`,
    schema_version: 2,
    scoring: 'full_ppr',
    scoring_rules: SCORING,
    games_field: `games_${SEASON}`,
    prior_field: `prior_${PRIOR_SEASON}`,
    prior_source: prior.rows ? `${path.relative(REPO_ROOT, PRIOR_PATH)} (static, ${PRIOR_SEASON} REG play-by-play)` : null,
    prior_note: prior.note,
    populations_not_covered: [
      `Small samples: ${weeksText} of ${SEASON} play. One game moves a team's per-game numbers a lot early in the season; plays_faced and games_${SEASON} say how much each row rests on.`,
      'Teams that changed defensive personnel or coordinators mid-season: the season-to-date aggregate blends before and after.',
      `prior_${PRIOR_SEASON} is last season's table, earned partly by different personnel. It is context, not a blend into the ${SEASON} numbers.`,
    ],
    non_scheme_split: 'nflverse PBP does not carry reliable outside-zone vs gap or coverage-shell labels, so scheme-specific splits are not built here. If added later, source them from a separate PBP charting product (PFF, NGS) rather than approximating.',
    ranks_convention: '1 = best defense (fewest yards/EPA/fpts allowed), 32 = worst.',
    fields_source_label: `defense_source (on every row) = ${SOURCE_LABEL}`,
    model_use: 'Context only. weekly_value has no matchup term (E-034 v2, 00_System/DECISIONS.md 2026-10-10).',
  };

  const output = `/**
 * Defense ${SEASON}: team defensive splits from ${SEASON} REG play-by-play, ${weeksText}.
 * Source: nflverse play_by_play_${SEASON}.csv.gz (REG only) and roster_weekly_${SEASON}.csv.
 * Auto-generated by scripts/build-defense.js on ${generated}.
 * ${rows.length} teams | schema v${meta.schema_version} | source_season ${SEASON} | weeks_covered ${weeksCovered.join(',')}
 *
 * Every metric is a RATE STAT (per game or per attempt). Ranks 1-32:
 * 1 = best (fewest allowed), 32 = worst. Each row carries the ${PRIOR_SEASON} rates
 * under prior_${PRIOR_SEASON} (from the static defense${PRIOR_SEASON}.js).
 *
 * Read defense_source on any row before citing.
 */
export const DEFENSE_2026 = ${JSON.stringify(byTeam, null, 2)};

export const DEFENSE_2026_META = ${JSON.stringify(meta, null, 2)};
`;
  // Write on change, as build-weekly-board.js does: when the rows and the
  // META (less its generated stamp) match the committed file, leave it and
  // its stamp alone, so a force=yes rerun with nothing new commits nothing.
  if (fs.existsSync(OUT) && process.env.FORCE_DEFENSE_WRITE !== '1') {
    const prev = fs.readFileSync(OUT, 'utf8');
    const pm = prev.match(/export const DEFENSE_2026 = (\{[\s\S]*?\});\n\nexport const DEFENSE_2026_META = (\{[\s\S]*?\});\n?$/);
    if (pm) {
      let prevMeta = null;
      try { prevMeta = JSON.parse(pm[2]); } catch { prevMeta = null; }
      const strip = (m) => { const { generated: _g, ...rest } = m || {}; return JSON.stringify(rest); };
      if (prevMeta && pm[1] === JSON.stringify(byTeam, null, 2) && strip(prevMeta) === strip(meta)) {
        console.log(`\nRows and weeks_covered unchanged vs committed ${path.relative(REPO_ROOT, OUT)}; not rewriting (set FORCE_DEFENSE_WRITE=1 to force).`);
        return;
      }
    }
  }
  fs.writeFileSync(OUT, output);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
  console.log('  teams covered:', rows.length);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
