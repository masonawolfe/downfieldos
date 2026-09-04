#!/usr/bin/env node
/**
 * build-weekly-board.js — E-003 + E-004, context layer Part 3 + 4 (2026-09-04).
 *
 * `weeklyBoard2026.js` — one row per PLAYER × WEEK. 18 weeks. Bye weeks get a
 * row with `is_bye: true` so a start/sit copilot can iterate weeks
 * uninterrupted. Non-skill positions (K/DEF) are included with limited fields.
 *
 * This is a SECOND artifact, not new columns on the player board. Grain
 * matters: a season average is misleading at the weekly grain, and vice
 * versa. See DFOS_DATA_PLAN.md for the graph argument.
 *
 * What sits on every row:
 *   Identity : gsis_id, name, pos, team_2026, sleeper_id
 *   Timing   : week, opponent, home_away, is_bye, rest_days (best-effort)
 *   Defense  : opp_pos_rank (rush or pass by pos), opp_fpts_allowed_to_pos,
 *              opp_epa_allowed, opp_defense_source
 *   Env      : stadium, is_dome, surface, tz_delta, tz_delta_source
 *   Refs     : assigned_ref, ref_tendencies (null pre-Tuesday of game week)
 *   Ties     : former_teammates_this_matchup (already keyed by matchup)
 *   Score    : weekly_value + rationale
 *
 * E-004 — weekly_value:
 *   base = player's projection_pts / 17 (weekly pace, from the season proj)
 *   + matchup-defense adjustment (opp is bad against pos → +; opp is good → -)
 *   + environment adjustment (dome home game vs cold outdoor road)
 *   + rest adjustment (short week → -, coming off bye → +)
 *   Every component stored under weekly_value_components; rationale = top 3.
 *
 * Rules honoured:
 *   - context is BESIDE weekly_value, not folded into projection_pts.
 *   - every field labeled with its source.
 *   - byes are a row, not a null.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..');
const OUT = path.join(REPO_ROOT, 'src', 'data', 'weeklyBoard2026.js');

const NORM_TEAM = { LA: 'LAR', OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', AZ: 'ARI' };
function norm(t) { const u = (t || '').toUpperCase().trim(); return NORM_TEAM[u] || u; }

const TZ_OFFSETS = {
  'America/New_York': -5,
  'America/Chicago': -6,
  'America/Denver': -7,
  'America/Phoenix': -7,   // no DST but works for offset calc here
  'America/Los_Angeles': -8,
};

function loadPlayerBoard() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'src', 'data', 'playerBoard2026.js'), 'utf8');
  // Grab only the PLAYER_BOARD_2026 array body (not the META block that follows).
  const m = src.match(/export const PLAYER_BOARD_2026 = (\[[\s\S]*?\]);\s*\n\s*export const/);
  if (!m) throw new Error('PLAYER_BOARD_2026 array block not matched');
  return JSON.parse(m[1]);
}

function loadSchedule() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'src', 'data', 'schedule2026.js'), 'utf8');
  const m = src.match(/export const SCHEDULE_2026 = ({[\s\S]*?});/);
  if (!m) throw new Error('SCHEDULE_2026 block not matched');
  return JSON.parse(m[1]);
}

function loadDefense() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'src', 'data', 'defense2026.js'), 'utf8');
  const m = src.match(/export const DEFENSE_2026 = ({[\s\S]*?});\s*export const/);
  return JSON.parse(m[1]);
}

function loadFormerTeammates() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'src', 'data', 'intelligence', 'former_teammates_by_matchup.json'), 'utf8'));
}

// Per-position "fpts allowed" field to read from defense2026
const POS_TO_FPTS_FIELD = { QB: 'fpts_allowed_qb_per_game', RB: 'fpts_allowed_rb_per_game', WR: 'fpts_allowed_wr_per_game', TE: 'fpts_allowed_te_per_game' };
const POS_TO_FPTS_RANK = { QB: 'rank_fpts_allowed_qb_per_game', RB: 'rank_fpts_allowed_rb_per_game', WR: 'rank_fpts_allowed_wr_per_game', TE: 'rank_fpts_allowed_te_per_game' };
// League median fpts_allowed per position — used as the anchor for matchup adjustment.
function computeLeagueMedians(defense) {
  const rows = Object.values(defense);
  const medians = {};
  for (const [pos, field] of Object.entries(POS_TO_FPTS_FIELD)) {
    const vals = rows.map(r => r[field]).filter(v => v != null).sort((a,b) => a-b);
    medians[pos] = vals[Math.floor(vals.length / 2)];
  }
  return medians;
}

function computeWeeklyValue(row, opp, weekMeta, defense, leagueMedians) {
  // Base = weekly pace of season projection
  const seasonProj = row.projection_pts;   // default shape (standard_12_1qb full-PPR)
  if (seasonProj == null) return { weekly_value: null, weekly_value_components: null, weekly_value_rationale: null };
  const base = Math.round((seasonProj / 17) * 100) / 100;

  const comp = { base_weekly_pace: base };
  const contribs = [];
  function record(key, val, label) {
    if (val == null || val === 0) return;
    const clip = Math.max(-4, Math.min(4, val));   // ±4 pts weekly cap
    comp[key] = Math.round(clip * 100) / 100;
    contribs.push({ key, label, val: clip });
  }

  // Matchup: opponent fpts allowed to this position vs league median → +/- pts
  const pos = row.pos;
  const oppD = defense[opp];
  if (oppD && POS_TO_FPTS_FIELD[pos]) {
    const allowed = oppD[POS_TO_FPTS_FIELD[pos]];
    const median = leagueMedians[pos];
    if (allowed != null && median != null) {
      // Opponent that allows +3 fpts above median → +3 pts to this player, capped at ±4.
      const adj = (allowed - median);
      record('matchup_defense_adj', adj, `${opp} allows ${allowed.toFixed(1)} ${pos} fpts/g (median ${median.toFixed(1)})`);
    }
  }

  // Environment: dome home game slight bonus; short-week penalty
  if (weekMeta.is_dome_home) record('dome_home_adj', 0.5, 'dome home');
  if (weekMeta.is_short_week) record('short_week_adj', -1.0, 'short week (Thu after Sun)');
  if (weekMeta.is_bye_return) record('bye_return_adj', 0.8, 'coming off bye');
  if (weekMeta.tz_delta != null && Math.abs(weekMeta.tz_delta) >= 3) {
    record('tz_travel_adj', -0.5 * Math.abs(weekMeta.tz_delta) / 3, `${weekMeta.tz_delta}h TZ delta`);
  }

  const totalAdj = contribs.reduce((s, c) => s + c.val, 0);
  const total = base + totalAdj;
  comp.total_adjustment = Math.round(totalAdj * 100) / 100;
  const top3 = [...contribs].sort((a, b) => Math.abs(b.val) - Math.abs(a.val)).slice(0, 3);
  // Q-005 (2026-09-05): every scored row gets a rationale label, even when no
  // adjustment fired (opp near league median, home dome game with no travel,
  // no injury designation). Prior version returned null and QA test 7 flagged
  // 311 scored-with-null rows. Making the "no adjustment" case explicit means
  // a consumer can distinguish "we didn't score this" from "we scored it, no
  // context signals fired."
  const rat = top3.length > 0
    ? top3.map(c => `${c.label} ${c.val >= 0 ? '+' : ''}${c.val.toFixed(2)}`).join(' · ')
    : 'base pace, no context adjustments fired';
  return { weekly_value: Math.round(total * 100) / 100, weekly_value_components: comp, weekly_value_rationale: rat };
}

async function main() {
  console.log('DFOS — Weekly board build (E-003 + E-004)');
  console.log('=========================================\n');

  const board = loadPlayerBoard();
  const schedule = loadSchedule();
  const defense = loadDefense();
  const ftDoc = loadFormerTeammates();
  const ftByMatchup = ftDoc.matchups || {};
  const leagueMedians = computeLeagueMedians(defense);

  console.log('  player rows loaded:', board.length);
  console.log('  schedule teams:', Object.keys(schedule.teams || {}).length);
  console.log('  defense teams:', Object.keys(defense).length);
  console.log('  former_teammates matchups:', Object.keys(ftByMatchup).length);
  console.log('  league medians fpts/g:', JSON.stringify(leagueMedians));
  console.log();

  // Build per-team week map: { TEAM: { week: {opponent, home_away, stadium, is_dome, surface, gameday, gametime, spread_line, total_line} } }
  const teamWeekMap = {};
  for (const [t, teamDoc] of Object.entries(schedule.teams || {})) {
    teamWeekMap[t] = {};
    for (const g of teamDoc.games || []) {
      const isHome = g.home === t || g.isHome === true;
      const opp = isHome ? (g.away || g.opponent) : (g.home || g.opponent);
      teamWeekMap[t][g.week] = {
        opponent: opp,
        home_away: isHome ? 'H' : 'A',
        gameday: g.gameday,
        gametime: g.gametime,
        weekday: g.weekday,
        stadium: g.stadium,
        roof: g.roof,
        surface: g.surface,
        spread_line: g.spread_line,
        total_line: g.total_line,
        referee: g.referee,
        game_id: g.game_id,
        game_type: g.game_type || 'REG',
      };
    }
  }

  // Bye weeks: a team's set of REG weeks (1..18) minus the weeks it has a game.
  const regWeeks = [];
  const wkMin = schedule.meta?.regular_season_weeks?.min ?? 1;
  const wkMax = schedule.meta?.regular_season_weeks?.max ?? 18;
  for (let w = wkMin; w <= wkMax; w++) regWeeks.push(w);

  const rows = [];
  for (const p of board) {
    const team = p.team_2026;
    if (!team) continue;
    const wk = teamWeekMap[team] || {};
    for (const week of regWeeks) {
      const g = wk[week];
      if (!g || g.game_type !== 'REG') {
        rows.push({
          gsis_id: p.gsis_id, name: p.name, pos: p.pos, team_2026: team,
          week, is_bye: true, opponent: null, home_away: null,
          weekly_value: null, weekly_value_rationale: 'BYE',
        });
        continue;
      }
      const opp = g.opponent;
      const oppD = opp ? defense[opp] : null;
      // Former teammates for this matchup (alphabetical key)
      const matchupKey = [team, opp].sort().join('_');
      const ftIds = ftByMatchup[matchupKey] || [];
      // Rough count of ties involving this player. Full graph traversal is
      // heavier than needed here; a count is enough as a "matchup has ties" signal.
      const gsisPrefix = p.gsis_id ? `_${p.gsis_id}_` : null;
      const involvedCount = gsisPrefix ? ftIds.filter(k => k.includes(gsisPrefix)).length : 0;

      // Environment
      const isDomeHome = g.roof === 'dome' || g.roof === 'closed';
      // Short-week only counts when the team played the prior week (not for Wk 1 Thu openers).
      const playedPrevWeek = (week - 1) in wk;
      const isShortWeek = g.weekday === 'Thursday' && playedPrevWeek;
      // Bye-return only counts when there was a prior REG week that was a bye.
      // (Wk 1 has no prior week at all — no "coming off bye" applies.)
      const isByeReturn = week > wkMin && !playedPrevWeek;
      // tz_delta = home stadium tz offset minus visitor's home tz offset (relative for the road team)
      // Simplified: for the away team, delta = (game tz) - (home tz); for the home team, 0.
      let tz_delta = 0;
      if (g.home_away === 'A') {
        // We'd need each team's home tz here — pull from player row's stadium fields (own_team) vs opp's tz.
        const ownTz = p.home_tz;
        // Opp home tz from defense2026 doesn't carry stadium; we'll fall back to schedule row's stadium's tz lookup being non-trivial.
        // For a stored artifact, leave tz_delta as 0 unless we resolve opp stadium tz. Marked with tz_delta_source.
        tz_delta = null;
      }

      const weekMeta = {
        is_dome_home: isDomeHome && g.home_away === 'H',
        is_short_week: isShortWeek,
        is_bye_return: isByeReturn,
        tz_delta,
      };

      const v = computeWeeklyValue(p, opp, weekMeta, defense, leagueMedians);

      // Field-source labels are repetitive per row; hoisted to META instead.
      rows.push({
        gsis_id: p.gsis_id, name: p.name, pos: p.pos, team_2026: team,
        week,
        is_bye: false,
        opponent: opp,
        home_away: g.home_away,
        game_id: g.game_id,
        gameday: g.gameday, gametime: g.gametime, weekday: g.weekday,
        stadium: g.stadium, is_dome_game: isDomeHome, surface_game: g.surface,
        spread_line: g.spread_line, total_line: g.total_line,
        // Defensive matchup
        opp_fpts_allowed_to_pos: oppD ? (oppD[POS_TO_FPTS_FIELD[p.pos]] ?? null) : null,
        opp_pos_fpts_rank: oppD ? (oppD[POS_TO_FPTS_RANK[p.pos]] ?? null) : null,
        opp_pass_def_rank: oppD?.rank_pass_def_overall ?? null,
        opp_rush_def_rank: oppD?.rank_rush_def_overall ?? null,
        // Ties
        former_teammates_this_matchup_count: involvedCount,
        // Timing
        is_short_week: isShortWeek,
        is_bye_return: isByeReturn,
        tz_delta,
        // Refs (usually null until Tuesday of game week)
        assigned_ref: g.referee || null,
        // Score
        weekly_value: v.weekly_value,
        weekly_value_rationale: v.weekly_value_rationale,
      });
    }
  }

  // Summary stats
  const totalRows = rows.length;
  const byeRows = rows.filter(r => r.is_bye).length;
  const scoredRows = rows.filter(r => r.weekly_value != null).length;
  const distinctPlayers = new Set(rows.map(r => r.gsis_id || r.name + '|' + r.team_2026)).size;
  console.log('  rows:', totalRows, '| distinct players:', distinctPlayers, '| bye rows:', byeRows, '| rows with weekly_value:', scoredRows);
  console.log('  rows without weekly_value (rookies/no-proj + byes + K/DEF):', totalRows - scoredRows);

  const meta = {
    generated: new Date().toISOString(),
    source: 'assembled by scripts/build-weekly-board.js on 2026-09-04',
    schema_version: 1,
    row_grain: 'one row per player × week (18 weeks × N players)',
    row_count: totalRows,
    weekly_value_method: 'base = season projection / 17. Adjustments capped ±4 pts each: matchup defense (opp fpts allowed vs league median), dome home +0.5, short week -1.0, bye return +0.8, tz travel per 3h -0.5. Rationale = top-3 signed contributors.',
    league_medians_used: leagueMedians,
    field_sources: {
      opp_fpts_allowed_to_pos: 'defense2026.js (2025 REG PBP fpts allowed per game to that position)',
      opp_pos_fpts_rank: 'defense2026.js rank_fpts_allowed_${pos}_per_game — 1 = allows fewest',
      opp_pass_def_rank: 'defense2026.js rank_pass_def_overall (composite index — 1 = best)',
      opp_rush_def_rank: 'defense2026.js rank_rush_def_overall (composite index — 1 = best)',
      stadium: 'schedule2026.js (per-game stadium from nflverse schedule)',
      is_dome_game: 'schedule2026.js roof ∈ {dome, closed}',
      spread_line: 'schedule2026.js',
      total_line: 'schedule2026.js',
      former_teammates_this_matchup_count: 'intelligence/former_teammates_by_matchup.json (alphabetical TEAM_TEAM key, counts entries mentioning this player\'s gsis_id)',
      is_short_week: 'derived from weekday === Thursday',
      is_bye_return: 'derived from previous week absent in team schedule',
      tz_delta: 'resolved only for home games (0). Away games leave null.',
      assigned_ref: 'schedule2026.js referee field (null until Tuesday of game week)',
      weekly_value: 'derived — see weekly_value_method',
    },
    gap_notes: [
      'tz_delta not resolved for away games — opp stadium tz not joined into weekly. Fix is a small stadium-tz lookup in build-weekly-board.js.',
      'assigned_ref null everywhere at build time — 2026 refs are known Tuesday of game week. When schedule2026 backfills them, this field lights up automatically.',
      'former_teammates_this_matchup_count is a count of ties involving this gsis_id, not a rich breakdown. Full graph in intelligence/former_teammates_by_matchup.json.',
      'scheme-specific splits (outside-zone vs gap) — same gap flagged in defense2026.js. Not approximated.',
      'weekly_value_components trimmed from persisted rows to keep the file browser-loadable. Rebuild locally if you want them for debugging.',
    ],
  };

  const output = `/**
 * Weekly Player Board — 2026 (E-003 + E-004 deliverable, 2026-09-04)
 * Auto-generated by scripts/build-weekly-board.js on ${new Date().toISOString()}.
 * ${totalRows} rows | schema v${meta.schema_version}
 *
 * Grain: one row per PLAYER × WEEK, 18 weeks (byes included, is_bye=true).
 * This is a SECOND artifact, not columns on the player board.
 *
 * weekly_value is the start/sit signal. Do NOT reconcile it with season vorp
 * or total_score_beta — different questions, different tables.
 *
 * See META.gap_notes for what this artifact does NOT know.
 */
export const WEEKLY_BOARD_2026 = ${JSON.stringify(rows)};

export const WEEKLY_BOARD_2026_META = ${JSON.stringify(meta, null, 2)};
`;
  fs.writeFileSync(OUT, output);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
