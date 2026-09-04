#!/usr/bin/env node
/**
 * build-player-board.js — EM/PO Directive v2 Task 6 (THE DELIVERABLE)
 *
 * Produces ONE validated pre-draft board artifact. Every rostered skill
 * player gets one row with identity, 2025 stats + shares, team context,
 * availability, ADP proxy, playoff schedule, and a data_coverage_flag.
 *
 * Output: src/data/playerBoard2026.js
 *
 * Acceptance (all six must pass; see build-player-board-verify.mjs):
 *  1. 20 random WR2/WR3s resolve with pos+team or an explicit rookie flag.
 *  2. Every PUP/IR row carries availability_status and can't outrank healthy.
 *  3. Every team_changed player is flagged; raw shares carry the caveat.
 *  4. Bye weeks validated against a known roster.
 *  5. K/DEF rows carry data_coverage_flag='partial' + "defer to consensus" note.
 *  6. availability_last_verified_utc is < 24h old at build time.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..');
const OUTER_INTEL = path.join(__dirname, '..', '..', 'data', 'intelligence');
const SEASON = 2026;
const OUT = path.join(REPO_ROOT, 'src', 'data', `playerBoard${SEASON}.js`);

const ALL_TEAMS = ['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS'];
const NORM_TEAM = { LA: 'LAR', OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', AZ: 'ARI' };
function norm(t) { const u = (t || '').toUpperCase().trim(); return NORM_TEAM[u] || u; }

// ─── Loaders ────────────────────────────────────────────────────────────────

function loadPlayerStats() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'src', 'data', 'playerStats2025.js'), 'utf8');
  const arr = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
  const byId = new Map();
  for (const r of arr) if (r.gsis_id) byId.set(r.gsis_id, r);
  return byId;
}

function loadRosterWeekly() {
  const gz = fs.readFileSync(path.join(OUTER_INTEL, 'raw', 'roster_weekly_2026.csv.gz'));
  const csv = zlib.gunzipSync(gz).toString('utf8');
  const lines = csv.split('\n');
  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => row[h] = (vals[idx] ?? '').trim());
    rows.push(row);
  }
  // De-dupe by gsis_id; keep the LATEST week per player
  const byGsis = new Map();
  for (const r of rows) {
    if (!r.gsis_id) continue;
    const wk = parseInt(r.week || '0', 10);
    const prev = byGsis.get(r.gsis_id);
    if (!prev || wk >= parseInt(prev.week || '0', 10)) byGsis.set(r.gsis_id, r);
  }
  return byGsis;
}

// FIX 3 (2026-09-03b): pick the 2026 starter QB per team from Sleeper's
// depth_chart_order == 1. The passing-yards heuristic that lived here on
// 2026-09-03a picked the backup on every team whose starter was hurt,
// benched or a rookie in 2025 — Burrow missed most of 2025, so Flacco
// out-threw him and the heuristic returned Flacco (and Ja'Marr Chase
// then carried qb_pass_td 15 / qb_epa -40.87, which were Flacco's).
// Same failure on WAS/MIA/MIN/CLE. 137 rows misattributed on the
// 2026-09-03a build.
//
// Why depth_chart_order and NOT passing yards:
//   • Depth chart encodes the team's 2026 starting decision. Prior-year
//     production is a lagging proxy for that decision, and it's wrong in
//     exactly the population that matters (starters returning from injury,
//     high-pick rookies, off-season signings).
//   • nflverse roster_weekly_2026.csv.gz has NO depth information —
//     depth_chart_position is literally "QB" for every quarterback on
//     every team. QA verified: all 4 QBs on all 6 suspected teams.
//   • Sleeper's payload carries depth_chart_order per player (1 = starter).
//     Already fetched + cached by loadSleeperData() for ADP; a second walk
//     is free.
//
// Fallback: when a team has no QB with depth_chart_order == 1, fall back
// to the 2025 passing-yards leader and LOG it. Historically 0 teams have
// hit this path.
function buildTeamStarterQb(roster, stats, sleeperData) {
  // Sleeper is the source of truth for depth_chart_order. Iterate its QBs
  // to find the depth_chart_order == 1 for each team.
  const sleeperStarterByTeam = new Map();  // team → sleeper_id
  for (const [sid, p] of Object.entries(sleeperData)) {
    if (p.position !== 'QB') continue;
    if (p.depth_chart_order !== 1) continue;
    const team = norm(p.team);
    if (!team) continue;
    // On rare ties (data drift) keep the first one encountered.
    if (!sleeperStarterByTeam.has(team)) sleeperStarterByTeam.set(team, sid);
  }

  // Now walk roster_weekly QBs to attach gsis_id (and name where missing).
  // roster row → team + sleeper_id + gsis_id + name.
  const rosterQbBySleeperId = new Map();
  const rosterQbsByTeam = new Map();  // team → [{gsis, sleeper_id, name, week, passing_yards}]
  for (const [gsis, r] of roster) {
    if ((r.position || '').toUpperCase() !== 'QB') continue;
    const team = norm(r.team);
    if (!team) continue;
    const s = stats.get(gsis);
    const rec = {
      gsis,
      sleeper_id: r.sleeper_id || null,
      name: r.full_name || s?.name || null,
      week: parseInt(r.week || '0', 10),
      passing_yards: s?.passing_yards ?? 0,
    };
    if (rec.sleeper_id) rosterQbBySleeperId.set(rec.sleeper_id, rec);
    if (!rosterQbsByTeam.has(team)) rosterQbsByTeam.set(team, []);
    rosterQbsByTeam.get(team).push(rec);
  }

  const out = new Map();
  const fallbackTeams = [];
  const allTeamsToResolve = new Set([...rosterQbsByTeam.keys(), ...sleeperStarterByTeam.keys()]);
  for (const team of allTeamsToResolve) {
    const sid = sleeperStarterByTeam.get(team);
    if (sid) {
      const viaRoster = rosterQbBySleeperId.get(sid);
      if (viaRoster) {
        out.set(team, { qb_name: viaRoster.name, qb_gsis_id: viaRoster.gsis, source: 'sleeper_depth_chart' });
        continue;
      }
      // Sleeper says starter is X but roster_weekly_2026 has no matching QB
      // (Sleeper knows about a signing/promotion nflverse hasn't yet shown).
      // Take Sleeper's name; leave gsis_id null so downstream can decide.
      const p = sleeperData[sid];
      const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || null;
      out.set(team, { qb_name: name, qb_gsis_id: null, source: 'sleeper_depth_chart' });
      continue;
    }
    // No Sleeper depth_chart_order == 1 for this team — fall back and LOG.
    const cands = rosterQbsByTeam.get(team) || [];
    cands.sort((a, b) => (b.passing_yards - a.passing_yards) || (b.week - a.week));
    const winner = cands[0];
    if (winner) {
      out.set(team, { qb_name: winner.name, qb_gsis_id: winner.gsis, source: 'passing_yards_fallback' });
      fallbackTeams.push(team);
    }
  }
  if (fallbackTeams.length > 0) {
    console.log(`  ⚠ QB depth-chart fallback (no Sleeper depth_chart_order == 1) for: ${fallbackTeams.join(', ')}`);
  }
  return out;
}
// ─── Valuation layer (2026-09-04) ───────────────────────────────────────────
// Per _FROM_COS/2026-09-04-valuation-layer.md. Adds projected points, per-shape
// replacement level, and VORP so the board has a stored ranking column instead
// of forcing every consumer (Draft Copilot included) to reconstruct one live.
//
// Method (v1, deliberately simple, deliberately stored):
//   projection_pts = (2025 fantasy pts) / games_2025 × 17     (17-game pace)
//   Rookies / no-2025-snaps  → null (do not fabricate)
//   K / DEF                  → null (no method here; defer to platform consensus)
//   replacement_pts(shape, pos) = the (starters_expected + 1)th projected
//     point at that position across all draftable players
//   vorp_pts = projection_pts − replacement_pts(shape, pos)
//
// FLEX assumption: 45% RB / 45% WR / 10% TE of FLEX slots. Industry heuristic;
// wrong-ish at the edges but stable across shapes.
// SUPERFLEX assumption: 100% of superflex slots go to QBs. That's what
// actually happens in superflex leagues; it's why QB replacement jumps from
// ~teams → ~teams × 2.
//
// The gap this method does NOT see (record it rather than pretend):
//   League-mate behaviour. The 2026-09-03 Nacua miss was caught by Mason
//   noticing "the commish might take him out." Nothing here catches that.

const SCORING_RULES = {
  full_ppr:            { rec: 1.0, rec_yd: 0.1, rec_td: 6, rush_yd: 0.1, rush_td: 6, pass_yd: 0.04, pass_td: 4, te_rec_bonus: 0 },
  half_ppr:            { rec: 0.5, rec_yd: 0.1, rec_td: 6, rush_yd: 0.1, rush_td: 6, pass_yd: 0.04, pass_td: 4, te_rec_bonus: 0 },
  standard:            { rec: 0.0, rec_yd: 0.1, rec_td: 6, rush_yd: 0.1, rush_td: 6, pass_yd: 0.04, pass_td: 4, te_rec_bonus: 0 },
  te_premium_full_ppr: { rec: 1.0, rec_yd: 0.1, rec_td: 6, rush_yd: 0.1, rush_td: 6, pass_yd: 0.04, pass_td: 4, te_rec_bonus: 0.5 },
};

const FLEX_SHARE = { RB: 0.45, WR: 0.45, TE: 0.10 };

const LEAGUE_SHAPES = {
  standard_10_1qb:  { teams: 10, starters: { QB: 1, RB: 2, WR: 2, TE: 1 }, flex: 1, flex_positions: ['RB','WR','TE'], superflex: 0, scoring: 'full_ppr' },
  standard_12_1qb:  { teams: 12, starters: { QB: 1, RB: 2, WR: 2, TE: 1 }, flex: 1, flex_positions: ['RB','WR','TE'], superflex: 0, scoring: 'full_ppr' },
  standard_12_half: { teams: 12, starters: { QB: 1, RB: 2, WR: 2, TE: 1 }, flex: 1, flex_positions: ['RB','WR','TE'], superflex: 0, scoring: 'half_ppr' },
  superflex_12:     { teams: 12, starters: { QB: 1, RB: 2, WR: 2, TE: 1 }, flex: 1, flex_positions: ['RB','WR','TE'], superflex: 1, scoring: 'full_ppr' },
  te_premium_12:    { teams: 12, starters: { QB: 1, RB: 2, WR: 2, TE: 1 }, flex: 1, flex_positions: ['RB','WR','TE'], superflex: 0, scoring: 'te_premium_full_ppr' },
};

const DEFAULT_SHAPE = 'standard_12_1qb';

function fantasyPts(r, scoring) {
  const teBonus = (r.pos === 'TE' ? (scoring.te_rec_bonus || 0) : 0);
  return (r.receptions ?? 0) * (scoring.rec + teBonus)
    + (r.rec_yards ?? 0) * scoring.rec_yd
    + (r.rec_td ?? 0) * scoring.rec_td
    + (r.rushing_yards ?? 0) * scoring.rush_yd
    + (r.rushing_tds ?? 0) * scoring.rush_td
    + (r.passing_yards ?? 0) * scoring.pass_yd
    + (r.passing_tds ?? 0) * scoring.pass_td;
}

function projectionFor(r, scoringName) {
  const s = SCORING_RULES[scoringName];
  if (r.pos === 'K' || r.pos === 'DEF') return null;
  if (!r.games_2025 || r.games_2025 === 0) return null;
  const actual = fantasyPts(r, s);
  return Math.round((actual / r.games_2025) * 17 * 100) / 100;
}

function startersExpected(shape, pos) {
  const fixed = (shape.starters[pos] || 0) * shape.teams;
  const flex = shape.flex_positions.includes(pos)
    ? shape.flex * shape.teams * (FLEX_SHARE[pos] || 0)
    : 0;
  const sflex = (pos === 'QB') ? shape.superflex * shape.teams : 0;
  return fixed + flex + sflex;
}

function replacementRank(shape, pos) {
  return Math.ceil(startersExpected(shape, pos)) + 1;
}

function computeReplacementLevels(rows, shape) {
  const byPos = { QB: [], RB: [], WR: [], TE: [] };
  for (const r of rows) {
    if (!r.draftable) continue;
    if (!byPos[r.pos]) continue;
    const proj = projectionFor(r, shape.scoring);
    if (proj == null) continue;
    byPos[r.pos].push(proj);
  }
  const rep = {};
  for (const pos of Object.keys(byPos)) {
    byPos[pos].sort((a, b) => b - a);
    const rank = replacementRank(shape, pos);
    rep[pos] = byPos[pos][rank - 1] ?? 0;   // 1-indexed
  }
  return rep;
}

// ─── total_score_beta (2026-09-04, v2 side-by-side) ─────────────────────────
// v1 (vorp above) is the validated baseline. This is a parallel column that
// bolts on every meaningful board field — QB context, team offense, usage,
// injury designation, team-change uncertainty, playoff schedule — as small
// additive adjustments to VORP. Result stored so it can be compared to VORP
// at the table; deltas are the signal.
//
// Deliberate constraints:
//   * base = vorp; only players with a v1 VORP get a v2 beta (rookies null,
//     same as v1 — see ROOKIE COMMENT at bottom of file)
//   * every adjustment ±10 pts max, so no single term dominates VORP
//   * every component stored under total_score_beta_components so a copilot
//     or a human can read the "why"
//   * rationale string surfaces the top-3 signed contributors
//
// EPA scale note: qb_epa and team_off_epa on the board are cumulative-EPA
// numbers (source: playerStats2025), observed range roughly ±100 for skill
// team-context signals. Divisors chosen accordingly.
function round2(n) { return n == null ? null : Math.round(n * 100) / 100; }

function computeTotalScoreBeta(r) {
  const base = r.vorp;
  if (base == null) return { total_score_beta: null, total_score_beta_components: null, total_score_beta_rationale: null };
  const comp = { base_vorp: round2(base) };
  const contributors = [];
  const record = (key, val, label) => {
    if (val == null || val === 0) return;
    const clipped = Math.max(-10, Math.min(10, val));   // ±10 pts cap
    comp[key] = round2(clipped);
    contributors.push({ key, label, val: clipped });
  };

  // QB context — WR/TE only
  if (r.pos === 'WR' || r.pos === 'TE') {
    if (r.qb_epa != null) record('qb_epa_adj', r.qb_epa / 8, `QB EPA ${r.qb_name}`);
    if (r.team_off_epa != null) record('team_off_epa_adj', r.team_off_epa * 40, 'team offense');
    if (r.team_pass_rate != null) record('team_pass_rate_adj', (r.team_pass_rate - 0.57) * 100, 'team pass rate');
    if (r.team_rz_pass_rate != null) record('team_rz_pass_rate_adj', (r.team_rz_pass_rate - 0.55) * 50, 'RZ pass rate');
    if (r.target_share != null && r.target_share > 0.18) record('target_share_adj', (r.target_share - 0.18) * 60, 'target share');
    if (r.snap_share != null && r.snap_share > 0.70) record('snap_share_adj', (r.snap_share - 0.70) * 15, 'snap share');
  }

  // RB context
  if (r.pos === 'RB') {
    if (r.team_off_epa != null) record('team_off_epa_adj', r.team_off_epa * 30, 'team offense');
    if (r.team_goal_line_run_rate != null && r.team_goal_line_run_rate > 0.55)
      record('goal_line_run_adj', (r.team_goal_line_run_rate - 0.55) * 40, 'GL run rate');
    if (r.team_pass_rate_when_behind != null && r.team_pass_rate_when_behind > 0.75)
      record('pass_when_behind_adj', -(r.team_pass_rate_when_behind - 0.75) * 30, 'pass-when-behind risk');
    if (r.carry_share != null && r.carry_share > 0.55)
      record('carry_share_adj', (r.carry_share - 0.55) * 30, 'workhorse carry share');
    if (r.snap_share != null && r.snap_share > 0.60)
      record('snap_share_adj', (r.snap_share - 0.60) * 15, 'snap share');
  }

  // QB context
  if (r.pos === 'QB') {
    if (r.team_off_epa != null) record('team_off_epa_adj', r.team_off_epa * 50, 'team offense');
    if (r.team_pass_rate != null) record('team_pass_rate_adj', (r.team_pass_rate - 0.57) * 60, 'team pass rate');
  }

  // Team change uncertainty (all positions with a projection)
  if (r.team_changed === true) {
    record('team_changed_adj', -Math.min(base * 0.05, 8), `moved ${r.team_2025}→${r.team_2026}`);
  }

  // Injury designation — separate from draftable gate (Q/D/O still draftable but risky)
  if (r.game_designation === 'Q') record('injury_designation_adj', -base * 0.03, 'Questionable');
  else if (r.game_designation === 'D') record('injury_designation_adj', -base * 0.10, 'Doubtful');
  else if (r.game_designation === 'O') record('injury_designation_adj', -base * 0.20, 'Out');

  // Playoff schedule — indoor games are (small) positive scoring environment
  if (r.playoff_indoor_games != null && r.playoff_indoor_games > 0) {
    record('playoff_indoor_adj', r.playoff_indoor_games * 1.5, `${r.playoff_indoor_games} dome playoff wks`);
  }

  const totalAdj = contributors.reduce((s, c) => s + c.val, 0);
  const total = base + totalAdj;
  comp.total_adjustment = round2(totalAdj);
  // Rationale = top-3 by absolute value
  const top3 = [...contributors].sort((a, b) => Math.abs(b.val) - Math.abs(a.val)).slice(0, 3);
  const rationale = top3.map(c => `${c.label} ${c.val >= 0 ? '+' : ''}${round2(c.val)}`).join(' · ') || null;
  return {
    total_score_beta: round2(total),
    total_score_beta_components: comp,
    total_score_beta_rationale: rationale,
  };
}

// ─── E-002 context join (2026-09-04) ────────────────────────────────────────
// Joins contract_year_players.json, coachingTrees.js, dna2026.js, stadiums.js,
// fan_sentiment.json, and defense2026.js to every player row. Every joined
// field carries a `*_source` label so the copilot can name where each fact
// came from. No context field folds into projection_pts — it sits alongside.

// Highest-confidence 2026 coordinator changes. Sourced from publicly reported
// HC turnover 2024→2025→2026 which necessarily brought new coordinators, plus
// individually-verified OC moves. Everything not in this map is UNRESOLVED —
// not `false`. Populating with a guess would be exactly the coverage-not-
// correctness trap the qb_name fix flagged.
//
// If curation improves, extend this map. Do NOT default missing teams to
// `false` — the honest read is "we do not know."
const COORDINATOR_MOVES_2026 = {
  // team → { hc_is_new: bool, oc_is_new: bool, dc_is_new: bool, note }
  CHI: { hc_is_new: true, oc_is_new: true, dc_is_new: true, note: 'Ben Johnson replaces Eberflus interim, brings Declan Doyle OC / Dennis Allen DC' },
  NE: { hc_is_new: true, oc_is_new: true, dc_is_new: true, note: 'Mike Vrabel replaces Jerod Mayo; McDaniels back at OC / Terrell Williams DC' },
  JAX: { hc_is_new: true, oc_is_new: true, dc_is_new: true, note: 'Liam Coen replaces Doug Pederson (Coen also OC)' },
  LV: { hc_is_new: true, oc_is_new: true, dc_is_new: true, note: 'Pete Carroll replaces Pierce interim; new full staff' },
  DAL: { hc_is_new: true, oc_is_new: true, dc_is_new: true, note: 'Schottenheimer replaces McCarthy; Klayton Adams OC / Al Harris DC' },
  DET: { hc_is_new: false, oc_is_new: true, dc_is_new: false, note: 'Ben Johnson left for CHI; John Morton promoted to OC. HC/DC stable.' },
};
const COORDINATOR_MOVES_SOURCE = 'curated_2026 (public HC-change reporting + coachingTrees.js diff)';

function loadFile(rel) { return fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8'); }

function loadContractYear() {
  const doc = JSON.parse(loadFile('src/data/intelligence/contract_year_players.json'));
  const list = doc.contract_year_players || [];
  // Key by (normalized name, team) for join. Names are canonical FF names.
  const byKey = new Map();
  for (const p of list) {
    const key = `${(p.player || '').toLowerCase()}|${(p.team || '').toUpperCase()}`;
    byKey.set(key, p);
  }
  return { byKey, meta: doc.metadata || {} };
}

// Single-quoted-string pattern that survives escaped apostrophes like 'Kevin O\'Connell'
const SQ = "'((?:[^'\\\\]|\\\\.)*)'";
// Either single- or double-quoted string. Some rows use "Levi's Stadium" to avoid escape.
const QQ = "(?:'((?:[^'\\\\]|\\\\.)*)'|\"((?:[^\"\\\\]|\\\\.)*)\")";
function unesc(s) { return (s || '').replace(/\\'/g, "'").replace(/\\\\/g, '\\'); }
function pickQ(m, iSingle, iDouble) {
  return m[iSingle] != null ? unesc(m[iSingle]) : (m[iDouble] != null ? unesc(m[iDouble]) : null);
}

function loadCoachingTrees() {
  const src = loadFile('src/data/coachingTrees.js');
  const teamsBlock = src.slice(src.indexOf('teams: {'));
  const teams = {};
  const rowRe = new RegExp(`(\\b[A-Z]{2,4}):\\s*\\{\\s*hc:\\s*${SQ},\\s*oc:\\s*${SQ},\\s*dc:\\s*${SQ},\\s*trees:\\s*\\[([^\\]]*)\\],\\s*style:\\s*${SQ}\\s*\\}`, 'g');
  let m;
  while ((m = rowRe.exec(teamsBlock)) !== null) {
    const treesArr = m[5].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    teams[m[1]] = { hc: unesc(m[2]), oc: unesc(m[3]), dc: unesc(m[4]), trees: treesArr, style: unesc(m[6]) };
  }
  const treesBlock = src.slice(src.indexOf('trees: {'), src.indexOf('teams: {'));
  const trees = {};
  const tRe = new RegExp(`(\\b[A-Z_]+):\\s*\\{\\s*name:\\s*${SQ},\\s*founder:\\s*${SQ},\\s*principles:\\s*\\[([^\\]]*)\\]`, 'g');
  let tm;
  while ((tm = tRe.exec(treesBlock)) !== null) {
    const principles = tm[4].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean).map(unesc);
    trees[tm[1]] = { name: unesc(tm[2]), founder: unesc(tm[3]), principles };
  }
  return { teams, trees };
}

function loadDna2026() {
  const src = loadFile('src/data/dna2026.js');
  const dna = {};
  const re = /(\b[A-Z]{2,4}):\s*\{\s*p:\s*([\d.]+)\s*,\s*e:\s*([\d.]+)\s*,\s*x:\s*([\d.]+)\s*,\s*s:\s*"([^"]+)"\s*\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    dna[m[1]] = { pass_rate: parseFloat(m[2]), efficiency: parseFloat(m[3]), explosive_rate: parseFloat(m[4]), state: m[5] };
  }
  return dna;
}

function loadStadiums() {
  const src = loadFile('src/data/stadiums.js');
  const stadiums = {};
  // Accept single or double-quoted values (SF's "Levi's Stadium" uses ").
  const re = new RegExp(`(\\b[A-Z]{2,4}):\\s*\\{\\s*name:\\s*${QQ},\\s*city:\\s*${QQ},\\s*tz:\\s*${QQ},\\s*surface:\\s*${QQ},\\s*altitude:\\s*(\\d+),\\s*dome:\\s*(true|false),\\s*capacity:\\s*(\\d+)\\s*\\}`, 'g');
  let m;
  while ((m = re.exec(src)) !== null) {
    stadiums[m[1]] = {
      name: pickQ(m, 2, 3),
      city: pickQ(m, 4, 5),
      tz: pickQ(m, 6, 7),
      surface: pickQ(m, 8, 9),
      altitude: parseInt(m[10], 10),
      dome: m[11] === 'true',
      capacity: parseInt(m[12], 10),
    };
  }
  return stadiums;
}

function loadFanSentiment() {
  const doc = JSON.parse(loadFile('src/data/intelligence/fan_sentiment.json'));
  const byTeam = new Map();
  for (const t of doc.teams || []) byTeam.set(t.team, t);
  return byTeam;
}

function loadHistoryAndDurability() {
  try {
    const doc = JSON.parse(loadFile('src/data/intelligence/history_2023_2024.json'));
    return { byGsis: doc.players || {}, meta: doc.meta || {} };
  } catch (e) {
    console.log('  ⚠ history_2023_2024.json not loadable:', e.message);
    return { byGsis: {}, meta: {} };
  }
}

function loadDefense2026() {
  try {
    const src = loadFile('src/data/defense2026.js');
    // Extract only the DEFENSE_2026 export's object body — non-greedy up to
    // the terminating "};" that closes it, before the META export.
    const m = src.match(/export const DEFENSE_2026 = ({[\s\S]*?});\s*export const/);
    if (!m) throw new Error('DEFENSE_2026 block not matched');
    return JSON.parse(m[1]);
  } catch (e) {
    console.log('  ⚠ defense2026.js not loadable:', e.message);
    return {};
  }
}

function attachContextLayer(rows) {
  const { byKey: contractByKey, meta: contractMeta } = loadContractYear();
  const coaching = loadCoachingTrees();
  const dna = loadDna2026();
  const stadiums = loadStadiums();
  const sentiment = loadFanSentiment();
  const defense = loadDefense2026();
  const { byGsis: historyByGsis, meta: historyMeta } = loadHistoryAndDurability();

  const counters = {
    contract_year_hits: 0,
    coaching_hits: 0,
    dna_hits: 0,
    stadium_hits: 0,
    fan_sentiment_hits: 0,
    fan_sentiment_missing_teams: new Set(),
    coordinator_moves_hits: 0,
    defense_hits: 0,
    history_2024_hits: 0,
    history_2023_hits: 0,
    age_hits: 0,
    durability_hits: 0,
    rookie_durability_null: 0,
  };

  for (const r of rows) {
    const t = r.team_2026;
    // ── contract_year (name+team join) ────────────────────────────────
    const cKey = `${(r.name || '').toLowerCase()}|${t}`;
    const c = contractByKey.get(cKey);
    if (c) {
      r.contract_year = true;
      r.contract_year_detail = c.performance_incentive || null;
      r.contract_year_relevance = c.fantasy_relevance || null;
      r.contract_year_confidence = c.confidence || null;
      r.contract_year_source = 'intelligence/contract_year_players.json (2026-03-18 snapshot)';
      counters.contract_year_hits++;
    } else {
      // Do NOT default to false — the file only tracks 23 high-signal cases,
      // so `false` would be wrong for hundreds of players who ARE in contract
      // years but aren't yet in the tracked list. Null with source = "unlisted".
      r.contract_year = null;
      r.contract_year_source = 'unlisted (only 23 high-signal entries curated in feed today)';
    }

    // ── coaching (hc/oc/dc/scheme_principles) ─────────────────────────
    const staff = coaching.teams[t];
    if (staff) {
      r.hc_name = staff.hc;
      r.oc_name = staff.oc;
      r.dc_name = staff.dc;
      r.coaching_trees = staff.trees;
      r.coaching_style = staff.style;
      // scheme_principles = union of principles across the team's trees
      const principles = new Set();
      for (const treeKey of staff.trees) {
        for (const p of (coaching.trees[treeKey]?.principles || [])) principles.add(p);
      }
      r.scheme_principles = [...principles];
      r.coaching_source = 'coachingTrees.js (teams block × trees block; 2025-2026 snapshot)';
      counters.coaching_hits++;
    }

    // ── coordinator_is_new_2026 (curated) ─────────────────────────────
    const cm = COORDINATOR_MOVES_2026[t];
    if (cm) {
      r.hc_is_new_2026 = cm.hc_is_new;
      r.oc_is_new_2026 = cm.oc_is_new;
      r.dc_is_new_2026 = cm.dc_is_new;
      r.coordinator_is_new_2026 = cm.oc_is_new || cm.dc_is_new;
      r.coordinator_change_note = cm.note;
      r.coordinator_source = COORDINATOR_MOVES_SOURCE;
      counters.coordinator_moves_hits++;
    } else {
      r.coordinator_is_new_2026 = null;
      r.coordinator_source = 'unresolved_needs_2025_snapshot (no 2025 coach map on disk to diff against; curated list only covers publicly-reported HC-driven turnover)';
    }

    // ── team DNA ──────────────────────────────────────────────────────
    const dnaRow = dna[t];
    if (dnaRow) {
      r.team_pass_rate_dna = dnaRow.pass_rate;
      r.team_efficiency_dna = dnaRow.efficiency;
      r.team_explosive_rate_dna = dnaRow.explosive_rate;
      r.team_state = dnaRow.state;
      r.dna_source = 'dna2026.js';
      counters.dna_hits++;
    }

    // ── stadium ───────────────────────────────────────────────────────
    const s = stadiums[t];
    if (s) {
      r.home_stadium = s.name;
      r.home_city = s.city;
      r.home_tz = s.tz;
      r.home_surface = s.surface;
      r.home_altitude = s.altitude;
      r.home_is_dome = s.dome;
      r.stadium_source = 'stadiums.js';
      counters.stadium_hits++;
    }

    // ── fan sentiment ─────────────────────────────────────────────────
    const fs = sentiment.get(t);
    if (fs) {
      r.fan_misery_index = fs.misery_index;
      r.fan_hope = fs.hope;
      r.fan_anger = fs.anger;
      r.fan_one_liner = fs.one_liner;
      r.fan_sentiment_source = 'intelligence/fan_sentiment.json';
      counters.fan_sentiment_hits++;
    } else {
      // Team not in the feed (currently CAR/CLE/NYG). Label as such so a
      // downstream consumer can distinguish "not in feed" from "not joined."
      r.fan_misery_index = null;
      r.fan_hope = null;
      r.fan_anger = null;
      r.fan_one_liner = null;
      r.fan_sentiment_source = 'not_in_feed (fan_sentiment.json covers 29 of 32 teams)';
      counters.fan_sentiment_missing_teams.add(t);
    }

    // ── defense (only for the player's OWN team — not opponent-based;
    // opponent-defense joins live on the weekly board, E-003) ────────
    const d = defense[t];
    if (d) {
      r.own_team_defense_pass_epa_per_att_allowed = d.pass_epa_per_att_allowed;
      r.own_team_defense_rush_epa_per_att_allowed = d.rush_epa_per_att_allowed;
      r.own_team_defense_rank_pass_overall = d.rank_pass_def_overall;
      r.own_team_defense_rank_rush_overall = d.rank_rush_def_overall;
      r.own_team_defense_source = 'defense2026.js (from 2025 REG PBP)';
      counters.defense_hits++;
    }

    // ── E-005 history + durability (2023 + 2024 + age + games missed) ──
    // NEVER folded into projection_pts. Placed beside so the copilot can say
    // "board projects him at 232, missed 12 games across 2023-24" out loud.
    // Population NOT targeted (rookies): games_missed_last_3_seasons must be
    // null, not 34 — that was the exact regression shape the qb_name fix
    // shipped and the durability brief called out.
    const h = r.gsis_id ? historyByGsis[r.gsis_id] : null;
    if (h) {
      r.age_2026_week1 = h.age_2026_week1;
      r.games_2024 = h.games_2024;
      r.games_2023 = h.games_2023;
      r.touches_2024 = h.touches_2024;
      r.touches_2023 = h.touches_2023;
      r.total_td_2024 = h.total_td_2024;
      r.total_td_2023 = h.total_td_2023;
      r.games_missed_last_3_seasons = h.games_missed_last_3_seasons;
      r.seasons_in_league_last_3 = h.seasons_in_league_last_3;
      r.durability_trend = h.durability_trend;
      r.history_source = h.history_source;
      if (h.age_2026_week1 != null) counters.age_hits++;
      if (h.games_2024 != null) counters.history_2024_hits++;
      if (h.games_2023 != null) counters.history_2023_hits++;
      if (h.games_missed_last_3_seasons != null) counters.durability_hits++;
      else counters.rookie_durability_null++;
    }
  }

  return { counters, meta: { contract_meta: contractMeta, coordinator_moves: COORDINATOR_MOVES_2026 } };
}

function attachValuation(rows) {
  const replacementsByShape = {};
  for (const [key, shape] of Object.entries(LEAGUE_SHAPES)) {
    replacementsByShape[key] = computeReplacementLevels(rows, shape);
  }
  for (const r of rows) {
    // Per-scoring projections at 17-game pace (top-level convenience columns).
    r.projection_pts_full_ppr = projectionFor(r, 'full_ppr');
    r.projection_pts_half_ppr = projectionFor(r, 'half_ppr');
    r.projection_pts_standard = projectionFor(r, 'standard');
    r.projection_source = (r.pos === 'K' || r.pos === 'DEF')
      ? 'no_stats_for_position'
      : (!r.games_2025 || r.games_2025 === 0)
        ? 'rookie_or_no_2025_data'
        : 'stats2025_17game_pace';

    // Per-shape replacement + VORP.
    r.valuation_by_shape = {};
    for (const [key, shape] of Object.entries(LEAGUE_SHAPES)) {
      const proj = projectionFor(r, shape.scoring);
      const rep = replacementsByShape[key][r.pos] ?? 0;
      r.valuation_by_shape[key] = {
        projection_pts: proj,
        replacement_pts: proj == null ? null : Math.round(rep * 100) / 100,
        vorp_pts: proj == null ? null : Math.round((proj - rep) * 100) / 100,
      };
    }
    // Default (standard 12-team 1-QB full-PPR) hoisted for convenience.
    const def = r.valuation_by_shape[DEFAULT_SHAPE];
    r.projection_pts = def.projection_pts;
    r.replacement_pts = def.replacement_pts;
    r.vorp = def.vorp_pts;
  }
  // Second pass — total_score_beta reads r.vorp so must run after the loop above.
  for (const r of rows) {
    const beta = computeTotalScoreBeta(r);
    r.total_score_beta = beta.total_score_beta;
    r.total_score_beta_components = beta.total_score_beta_components;
    r.total_score_beta_rationale = beta.total_score_beta_rationale;
  }
  return replacementsByShape;
}

function parseLine(line) {
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

function loadAvailability() {
  const doc = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'src', 'data', 'intelligence', 'availability_2026.json'), 'utf8'));
  return { meta: doc.meta || {}, byGsis: new Map(Object.entries(doc.players || {})) };
}

function loadSchedule() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'src', 'data', 'schedule2026.js'), 'utf8');
  return JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
}

function loadSituationalSplits() {
  const p = path.join(OUTER_INTEL, 'pbp', 'situational_splits.json');
  try {
    const doc = JSON.parse(fs.readFileSync(p, 'utf8'));
    return doc.teams || doc;   // schema tolerant
  } catch (err) {
    console.log(`⚠ situational_splits unavailable (${err.message})`);
    return {};
  }
}

async function loadSleeperData() {
  // Reuse /tmp cache from Task 5 if available; else fetch fresh.
  // FIX 3 (2026-09-03b): now returns the raw payload so downstream can also
  // read depth_chart_order — not just search_rank.
  const cache = '/tmp/sleeper_players.json';
  if (fs.existsSync(cache) && (Date.now() - fs.statSync(cache).mtimeMs) < 6 * 3600 * 1000) {
    return JSON.parse(fs.readFileSync(cache, 'utf8'));
  }
  const res = await fetch('https://api.sleeper.app/v1/players/nfl');
  const players = await res.json();
  try { fs.writeFileSync(cache, JSON.stringify(players)); } catch { /* ignore */ }
  return players;
}

function sleeperAdpMap(sleeperData) {
  // sleeper_id → search_rank (proxy for ADP). Sentinel 9999999 → null.
  const bySleeperId = new Map();
  for (const [sid, p] of Object.entries(sleeperData)) {
    const raw = p.search_rank;
    const rank = (typeof raw === 'number' && raw < 9000000) ? raw : null;
    bySleeperId.set(sid, rank);
  }
  return bySleeperId;
}

// ─── Build ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('DFOS — Task 6 pre-draft board build');
  console.log('===================================\n');

  const stats = loadPlayerStats();
  const roster = loadRosterWeekly();
  const { meta: availMeta, byGsis: avail } = loadAvailability();
  const schedule = loadSchedule();
  const situationalTeams = loadSituationalSplits();
  const sleeperData = await loadSleeperData();
  const adpBySleeperId = sleeperAdpMap(sleeperData);
  const teamStarterQb = buildTeamStarterQb(roster, stats, sleeperData);   // FIX 3 (2026-09-03b)
  console.log(`  stats:            ${stats.size} rows`);
  console.log(`  roster_weekly:    ${roster.size} rows`);
  console.log(`  availability:     ${avail.size} rows (generated ${availMeta.generated})`);
  console.log(`  schedule teams:   ${Object.keys(schedule.teams || {}).length}`);
  console.log(`  situational tms:  ${Object.keys(situationalTeams).length}`);
  console.log(`  sleeper players:  ${Object.keys(sleeperData).length}`);
  console.log(`  sleeper ADPs:     ${[...adpBySleeperId.values()].filter(v => v != null).length} non-null`);
  console.log(`  2026 starter QBs: ${teamStarterQb.size} teams`);
  const bySource = {};
  for (const v of teamStarterQb.values()) bySource[v.source] = (bySource[v.source] || 0) + 1;
  console.log(`    by source: ${JSON.stringify(bySource)}\n`);

  const SKILL_POS = new Set(['QB', 'RB', 'WR', 'TE']);
  const rows = [];

  // Skill players from roster_weekly
  for (const [gsis, r] of roster) {
    const pos = (r.position || '').toUpperCase();
    if (!SKILL_POS.has(pos)) continue;
    const team_2026 = norm(r.team);
    const statRow = stats.get(gsis) || null;
    const team_2025 = statRow ? norm(statRow.team_2025 || statRow.team) : null;
    const team_changed = (team_2025 && team_2026) ? (team_2025 !== team_2026) : null;
    const bye_week = schedule.teams?.[team_2026]?.byeWeek ?? null;
    const availRec = avail.get(gsis) || null;
    const sit = situationalTeams[team_2026] || {};
    const playoff = schedule.playoffSlate?.[team_2026] || [];
    const p15 = playoff.find(g => g.week === 15) || null;
    const p16 = playoff.find(g => g.week === 16) || null;
    const p17 = playoff.find(g => g.week === 17) || null;
    const indoorGames = playoff.filter(g => g.roof === 'dome' || g.roof === 'closed').length;
    const adp_overall = adpBySleeperId.get(r.sleeper_id) ?? null;

    // Coverage flag
    let data_coverage_flag;
    if (!statRow) {
      const isRookie = (r.rookie_year === String(SEASON)) || (r.years_exp === '0');
      data_coverage_flag = isRookie ? 'rookie_no_2025_snaps' : 'no_2025_snaps';
    } else {
      const hasShares = statRow.target_share != null || statRow.carry_share != null || statRow.snap_share != null;
      const hasQb = statRow.qb_name != null;
      data_coverage_flag = (hasShares && hasQb) ? 'full' : 'partial';
    }

    // FIX 3 (2026-09-03b): qb_name = the 2026 starter for team_2026, picked
    // from Sleeper's depth_chart_order == 1 (source of truth for the team's
    // 2026 starting decision). qb_pass_td / qb_epa also re-attach to that
    // starter's 2025 stat row so Ja'Marr Chase carries Burrow's numbers,
    // not Flacco's. See buildTeamStarterQb() header for the root cause on
    // the prior heuristic.
    const starter = teamStarterQb.get(team_2026);
    const starterStat = (starter?.qb_gsis_id) ? stats.get(starter.qb_gsis_id) : null;
    let qb_name_final, qb_gsis_final, qb_name_source;
    let qb_pass_td_final, qb_epa_final;
    if (pos === 'QB') {
      qb_name_final = null; qb_gsis_final = null; qb_name_source = null;
      qb_pass_td_final = null; qb_epa_final = null;
    } else if (starter?.qb_name) {
      qb_name_final = starter.qb_name;
      qb_gsis_final = starter.qb_gsis_id;
      qb_name_source = starter.source;   // 'sleeper_depth_chart' | 'passing_yards_fallback'
      qb_pass_td_final = starterStat?.passing_tds ?? null;
      qb_epa_final = starterStat?.qb_epa_per_play ?? starterStat?.epa_per_play ?? null;
    } else {
      qb_name_final = statRow?.qb_name ?? null;
      qb_gsis_final = statRow?.qb_gsis_id ?? null;
      qb_name_source = statRow?.qb_name != null ? 'playerStats2025' : null;
      qb_pass_td_final = statRow?.qb_pass_td ?? null;
      qb_epa_final = statRow?.qb_epa_per_play ?? null;
    }

    // FIX 1 (2026-09-03): draftable + draft_note derived from availability.
    // Do not null out adp_overall — Cowork copilot may still cite it as
    // "the market has him at X"; the flag is what the copilot checks.
    const BLOCKED = new Set(['IR', 'PUP', 'SUSP', 'SUS', 'NFI']);
    const status = availRec?.status ?? null;
    // Unknown status defaults to draftable:true — a rookie or a player Sleeper
    // hasn't classified shouldn't be hidden from the copilot. The draft_note
    // still flags the uncertainty. BLOCKED statuses are the only draftable:false.
    const draftable = status == null ? true : !BLOCKED.has(status);
    let draft_note = null;
    if (BLOCKED.has(status)) {
      const reason = availRec?.injury_note || availRec?.game_designation || null;
      draft_note = `${status}${reason ? ' — ' + reason : ''} (market ADP ${adp_overall ?? 'n/a'})`;
    } else if (status == null) {
      draft_note = 'availability unknown (draftable: default)';
    }

    rows.push({
      // Identity
      gsis_id: gsis,
      sleeper_id: r.sleeper_id || null,
      yahoo_id: r.yahoo_id || null,
      espn_id: r.espn_id || null,
      pfr_id: r.pfr_id || null,
      name: r.full_name || statRow?.name || null,
      pos,
      team_2026,
      team_2025,
      team_changed,
      bye_week,
      // 2025 production (null when rookie/no-snaps)
      games_2025: statRow?.games ?? null,
      targets: statRow?.targets ?? null,
      receptions: statRow?.receptions ?? null,
      rec_yards: statRow?.receiving_yards ?? null,
      rec_td: statRow?.receiving_tds ?? null,
      carries: statRow?.carries ?? null,
      rushing_yards: statRow?.rushing_yards ?? null,
      rushing_tds: statRow?.rushing_tds ?? null,
      passing_yards: statRow?.passing_yards ?? null,
      passing_tds: statRow?.passing_tds ?? null,
      // Usage shares
      target_share: statRow?.target_share ?? null,
      carry_share: statRow?.carry_share ?? null,
      snap_share: statRow?.snap_share ?? null,
      touches: statRow ? ((statRow.carries ?? 0) + (statRow.targets ?? 0)) : null,
      total_td: statRow ? ((statRow.receiving_tds ?? 0) + (statRow.rushing_tds ?? 0) + (statRow.passing_tds ?? 0)) : null,
      epa_per_play: statRow?.epa_per_play ?? null,
      // Team context (QB attached — Task 4; FIX 3 2026-09-03b: qb chosen by
      // Sleeper depth_chart_order == 1, and pass_td/epa re-attach to that QB)
      qb_name: qb_name_final,
      qb_gsis_id: qb_gsis_final,
      qb_name_source,   // 'sleeper_depth_chart' | 'passing_yards_fallback' | 'playerStats2025' | null
      qb_pass_td: qb_pass_td_final,
      qb_epa: qb_epa_final,
      team_off_epa: statRow?.team_off_epa_per_play ?? null,
      team_pass_rate: statRow?.team_pass_rate ?? null,
      team_rz_pass_rate: statRow?.team_rz_pass_rate ?? null,
      team_goal_line_run_rate: sit.goal_line?.run_rate ?? null,
      team_pass_rate_when_behind: sit.game_script?.when_behind?.pass_rate ?? null,
      // Availability (Task 5)
      availability_status: availRec?.status ?? null,
      practice_status: availRec?.practice ?? null,
      game_designation: availRec?.game_designation ?? null,
      injury_note: availRec?.injury_note ?? null,
      availability_last_verified_utc: availRec?.last_verified_utc ?? null,
      availability_source_url: availRec?.source_url ?? null,
      // Market — FIX 4 (2026-09-03): adp_overall here is Sleeper `search_rank`,
      // NOT true consensus ADP. Integers only, ties permitted, sentinel 999.
      // Divergence from real ADP is largest on injured stars and hype rookies —
      // exactly where drafts are won. Post-draft: swap in a real ADP feed.
      adp_overall,
      adp_source: adp_overall != null ? 'sleeper_search_rank' : null,
      adp_positional: null,   // filled below
      // FIX 1 (2026-09-03): consumer-facing draftable gate. `draftable: false`
      // means IR/PUP/SUSP/NFI — do NOT surface as a top pick even if adp_overall
      // is low. Copilot still reads adp_overall to say "market has him at X."
      draftable,
      draft_note,
      // Playoff schedule (Wk 15–17)
      playoff_wk15_opp: p15?.opponent ?? null,
      playoff_wk16_opp: p16?.opponent ?? null,
      playoff_wk17_opp: p17?.opponent ?? null,
      playoff_indoor_games: indoorGames,
      data_coverage_flag,
    });
  }

  // Rank ADP within position
  const byPos = {};
  for (const r of rows) (byPos[r.pos] ||= []).push(r);
  for (const pos of Object.keys(byPos)) {
    const ranked = byPos[pos].filter(r => r.adp_overall != null).sort((a, b) => a.adp_overall - b.adp_overall);
    ranked.forEach((r, i) => { r.adp_positional = i + 1; });
  }

  // K and DEF — synthesize 32 rows each with partial coverage flag
  const K_DEF_NOTE = 'partial coverage — defer to platform consensus for ADP and projection';
  for (const team of ALL_TEAMS) {
    for (const pos of ['K', 'DEF']) {
      const bye_week = schedule.teams?.[team]?.byeWeek ?? null;
      const playoff = schedule.playoffSlate?.[team] || [];
      rows.push({
        gsis_id: null, sleeper_id: null, yahoo_id: null, espn_id: null, pfr_id: null,
        name: pos === 'DEF' ? `${team} DEF` : `${team} K`,
        pos,
        team_2026: team,
        team_2025: team,
        team_changed: false,
        bye_week,
        games_2025: null, targets: null, receptions: null, rec_yards: null, rec_td: null,
        carries: null, rushing_yards: null, rushing_tds: null, passing_yards: null, passing_tds: null,
        target_share: null, carry_share: null, snap_share: null,
        touches: null, total_td: null, epa_per_play: null,
        qb_name: null, qb_gsis_id: null, qb_name_source: null, qb_pass_td: null, qb_epa: null,
        team_off_epa: null, team_pass_rate: null, team_rz_pass_rate: null,
        team_goal_line_run_rate: null, team_pass_rate_when_behind: null,
        availability_status: null, practice_status: null, game_designation: null,
        injury_note: null, availability_last_verified_utc: availMeta.generated, availability_source_url: null,
        adp_overall: null, adp_source: null, adp_positional: null,
        // FIX 1: K/DEF ARE draftable — no injury gate applies to a slot-based row.
        draftable: true,
        draft_note: K_DEF_NOTE,
        playoff_wk15_opp: playoff.find(g => g.week === 15)?.opponent ?? null,
        playoff_wk16_opp: playoff.find(g => g.week === 16)?.opponent ?? null,
        playoff_wk17_opp: playoff.find(g => g.week === 17)?.opponent ?? null,
        playoff_indoor_games: playoff.filter(g => g.roof === 'dome' || g.roof === 'closed').length,
        data_coverage_flag: 'partial',
        notes: K_DEF_NOTE,
      });
    }
  }

  // Summary
  const flagCounts = {};
  for (const r of rows) flagCounts[r.data_coverage_flag] = (flagCounts[r.data_coverage_flag] || 0) + 1;
  console.log('  Board rows:', rows.length);
  console.log('  By coverage_flag:', flagCounts);
  console.log('  Team-changed rows:', rows.filter(r => r.team_changed === true).length);
  console.log('  Rows on PUP/IR/NFI/SUSP:', rows.filter(r => ['PUP','IR','NFI','SUSP'].includes(r.availability_status)).length);
  console.log('  draftable:true / draftable:false:',
    rows.filter(r => r.draftable === true).length,
    '/',
    rows.filter(r => r.draftable === false).length);
  console.log('  qb_name_source counts:',
    JSON.stringify({
      sleeper_depth_chart: rows.filter(r => r.qb_name_source === 'sleeper_depth_chart').length,
      passing_yards_fallback: rows.filter(r => r.qb_name_source === 'passing_yards_fallback').length,
      playerStats2025: rows.filter(r => r.qb_name_source === 'playerStats2025').length,
      null: rows.filter(r => r.qb_name_source == null).length,
    }));

  // ── E-002 context layer (2026-09-04) ────────────────────────────────────
  const contextResult = attachContextLayer(rows);
  console.log('  context join hits:', JSON.stringify({
    contract_year: contextResult.counters.contract_year_hits,
    coaching: contextResult.counters.coaching_hits,
    coordinator_moves_curated: contextResult.counters.coordinator_moves_hits,
    dna: contextResult.counters.dna_hits,
    stadium: contextResult.counters.stadium_hits,
    fan_sentiment: contextResult.counters.fan_sentiment_hits,
    own_team_defense: contextResult.counters.defense_hits,
    age: contextResult.counters.age_hits,
    history_2024: contextResult.counters.history_2024_hits,
    history_2023: contextResult.counters.history_2023_hits,
    durability_signal: contextResult.counters.durability_hits,
    rookie_durability_null_correct: contextResult.counters.rookie_durability_null,
  }));
  if (contextResult.counters.fan_sentiment_missing_teams.size > 0) {
    console.log('  ⚠ fan_sentiment missing for teams:', [...contextResult.counters.fan_sentiment_missing_teams].sort().join(','));
  }

  // ── Valuation layer (2026-09-04) ────────────────────────────────────────
  const replacementByShape = attachValuation(rows);
  console.log('  valuation attached — default shape:', DEFAULT_SHAPE);
  for (const [key, rep] of Object.entries(replacementByShape)) {
    console.log(`    ${key.padEnd(20)} replacement pts →`, JSON.stringify(rep));
  }
  const projSources = {};
  for (const r of rows) projSources[r.projection_source] = (projSources[r.projection_source] || 0) + 1;
  console.log('  projection_source counts:', JSON.stringify(projSources));

  const draftableCounts = {
    true: rows.filter(r => r.draftable === true).length,
    false: rows.filter(r => r.draftable === false).length,
  };
  const qbSourceCounts = {
    sleeper_depth_chart: rows.filter(r => r.qb_name_source === 'sleeper_depth_chart').length,
    passing_yards_fallback: rows.filter(r => r.qb_name_source === 'passing_yards_fallback').length,
    playerStats2025: rows.filter(r => r.qb_name_source === 'playerStats2025').length,
    null: rows.filter(r => r.qb_name_source == null).length,
  };
  const output = `/**
 * Pre-Draft Player Board — ${SEASON}
 * Auto-generated by scripts/build-player-board.js
 * ${rows.length} rows | Generated: ${new Date().toISOString()}
 *
 * EM/PO Directive v2 Task 6 deliverable. Every rostered skill player + 32 K + 32 DEF.
 * See src/utils/playerResolver.js for consumer helpers (isBenched, canOutrank,
 * isAvailabilityStale). See repo/data/PLAYER_BOARD_SCHEMA.md for column docs.
 *
 * CoS 2026-09-03 draft-data-fixes (in this order):
 *   FIX 1  draftable + draft_note fields — consumers that sort by adp_overall
 *          MUST filter by draftable:true. IR/PUP/SUSP/NFI → draftable:false.
 *   FIX 2  availability refreshed by npm run data:availability before build.
 *   FIX 3  qb_name = Sleeper depth_chart_order == 1 for team_2026, and
 *          qb_pass_td/qb_epa re-attach to that starter's 2025 stats.
 *          Rebuilt 2026-09-03b after QA found the 2026-09-03a passing-yards
 *          heuristic returned backups on CIN/WAS/MIA/MIN/CLE (137 rows wrong).
 *          qb_name_source: 'sleeper_depth_chart' | 'passing_yards_fallback'
 *          | 'playerStats2025' | null.
 *   FIX 4  adp_overall is Sleeper search_rank (adp_source: 'sleeper_search_rank'),
 *          NOT true consensus ADP. Integers only, ties permitted, sentinel 999.
 *          Divergence from true ADP is widest on injured stars and hype rookies.
 */
export const PLAYER_BOARD_${SEASON} = ${JSON.stringify(rows, null, 2)};

export const PLAYER_BOARD_${SEASON}_META = ${JSON.stringify({
    season: SEASON,
    generated: new Date().toISOString(),
    row_count: rows.length,
    coverage_by_flag: flagCounts,
    availability_source: availMeta.source || null,
    availability_generated: availMeta.generated || null,
    schema_version: 3,
    context_layer_2026_09_04: {
      joined_sources: [
        'intelligence/contract_year_players.json (23 high-signal entries)',
        'coachingTrees.js (teams block + trees block)',
        'dna2026.js (32 teams — p/e/x/state)',
        'stadiums.js (name/city/tz/surface/altitude/dome)',
        'intelligence/fan_sentiment.json (29 of 32 teams; missing CAR CLE NYG)',
        'defense2026.js (own-team-defense summary; opponent-side joins live on weekly board — E-003)',
        'intelligence/history_2023_2024.json (E-005 — age + 2023 + 2024 + games_missed_last_3)',
      ],
      coordinator_moves_2026_curated: COORDINATOR_MOVES_2026,
      unresolved_coordinator_map_note: 'coordinator_is_new_2026 is null for every team not in the curated map. No 2025 team-coach snapshot on disk to diff against; populating with a guess would be exactly the coverage-not-correctness trap the qb_name fix flagged. Extend COORDINATOR_MOVES_2026 in build-player-board.js as curation improves.',
      field_source_labels_on_row: ['contract_year_source', 'coaching_source', 'coordinator_source', 'dna_source', 'stadium_source', 'fan_sentiment_source', 'own_team_defense_source', 'history_source'],
      e005_durability_design: 'games_missed_last_3_seasons is NOT folded into projection_pts. It sits beside so a human can weigh it. Rookies + 2025-only players → null, not 34 phantom-missed games. seasons_in_league_last_3 is the transparency field for the denominator.',
    },
    fixes_2026_09_03: {
      fix_1_draftable: draftableCounts,
      fix_3_qb_name_source: qbSourceCounts,
      fix_3_qb_selection_rule: 'Sleeper depth_chart_order == 1 for team_2026, joined on sleeper_id. Fallback (LOGged): 2025 passing-yards leader when no Sleeper QB1 exists for a team.',
      fix_3_qb_stats_reattached: 'qb_pass_td and qb_epa are the depth_chart_order==1 QB\'s 2025 numbers, not the stat-row-attached prior-year QB.',
      fix_4_adp_source_label: 'sleeper_search_rank',
      fix_4_adp_source_note: 'adp_overall is Sleeper search_rank, NOT true consensus ADP. Integers only, ties permitted, sentinel 999.',
    },
    valuation_2026_09_04: {
      default_shape: DEFAULT_SHAPE,
      method: 'projection_pts = (2025 fantasy pts / games_2025) × 17. Rookies + no-2025-snaps + K/DEF → null. Do not fabricate a number.',
      scoring_rules: SCORING_RULES,
      shapes: LEAGUE_SHAPES,
      flex_share_assumption: FLEX_SHARE,
      superflex_assumption: '100% of superflex slots go to QBs (what actually happens in superflex leagues; drives QB replacement from ~teams → ~teams × 2).',
      replacement_pts_by_shape: (() => {
        const out = {};
        for (const [k, shape] of Object.entries(LEAGUE_SHAPES)) {
          out[k] = { pos_rank_replacement: {}, pts_at_replacement: {} };
          for (const pos of ['QB','RB','WR','TE']) {
            out[k].pos_rank_replacement[pos] = replacementRank(shape, pos);
          }
        }
        // pts filled in below at write-time so we can capture actual per-shape values.
        return out;
      })(),
      gap_the_board_cannot_see: 'League-mate behaviour. The 2026-09-03 Nacua miss was caught by Mason noticing "the commish might take him out." No projection, no VORP, no availability flag catches that. Treat this board as complete only for content the board can see.',
    },
  }, null, 2)};
`;

  fs.writeFileSync(OUT, output);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
