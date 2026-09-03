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

// FIX 3 (2026-09-03): fill qb_name for skill rows whose 2025 stat row is null
// (rookies, no-snap 2025). Picks a 2026 starter per team by preferring the QB
// with the most 2025 passing yards; falls back to the roster_weekly QB with the
// most recent week when no stat row exists for any candidate.
function buildTeamStarterQb(roster, stats) {
  const candidatesByTeam = new Map();  // team → [{gsis, name, week, passing_yards}]
  for (const [gsis, r] of roster) {
    if ((r.position || '').toUpperCase() !== 'QB') continue;
    const team = norm(r.team);
    if (!team) continue;
    const s = stats.get(gsis);
    const py = s?.passing_yards ?? 0;
    if (!candidatesByTeam.has(team)) candidatesByTeam.set(team, []);
    candidatesByTeam.get(team).push({
      gsis, name: r.full_name || s?.name || null,
      week: parseInt(r.week || '0', 10), passing_yards: py,
    });
  }
  const out = new Map();
  for (const [team, cands] of candidatesByTeam) {
    // Sort by 2025 passing_yards desc, then latest week desc as a tiebreak
    cands.sort((a, b) => (b.passing_yards - a.passing_yards) || (b.week - a.week));
    const winner = cands[0];
    if (winner) out.set(team, { qb_name: winner.name, qb_gsis_id: winner.gsis });
  }
  return out;
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

async function loadSleeperAdp() {
  // Reuse /tmp cache from Task 5 if available; else fetch fresh.
  const cache = '/tmp/sleeper_players.json';
  let players;
  if (fs.existsSync(cache) && (Date.now() - fs.statSync(cache).mtimeMs) < 6 * 3600 * 1000) {
    players = JSON.parse(fs.readFileSync(cache, 'utf8'));
  } else {
    const res = await fetch('https://api.sleeper.app/v1/players/nfl');
    players = await res.json();
    try { fs.writeFileSync(cache, JSON.stringify(players)); } catch { /* ignore */ }
  }
  // sleeper_id → search_rank (proxy for ADP). Sentinel 9999999 → null.
  const bySleeperId = new Map();
  for (const [sid, p] of Object.entries(players)) {
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
  const adpBySleeperId = await loadSleeperAdp();
  const teamStarterQb = buildTeamStarterQb(roster, stats);   // FIX 3
  console.log(`  stats:            ${stats.size} rows`);
  console.log(`  roster_weekly:    ${roster.size} rows`);
  console.log(`  availability:     ${avail.size} rows (generated ${availMeta.generated})`);
  console.log(`  schedule teams:   ${Object.keys(schedule.teams || {}).length}`);
  console.log(`  situational tms:  ${Object.keys(situationalTeams).length}`);
  console.log(`  sleeper ADPs:     ${[...adpBySleeperId.values()].filter(v => v != null).length} non-null`);
  console.log(`  2026 starter QBs: ${teamStarterQb.size} teams\n`);

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

    // FIX 3 (2026-09-03): a draft-board qb_name must reflect the 2026 QB
    // who will actually throw to this player, not the 2025 QB whose stats
    // they earned last year. So: always prefer the 2026 depth-chart starter
    // for team_2026; fall back to the 2025 stat row's qb_name only when
    // no 2026 starter is identified for the team.
    // (CoS text asked for this on missing-stat rows; QA also flagged 18
    // mismatches on players who moved teams — Mike Evans SF reading Mac
    // Jones from his 2025 TB stat row is the canonical example. Handling
    // both cases with the same rule.)
    const starter = teamStarterQb.get(team_2026);
    let qb_name_final, qb_gsis_final, qb_name_source;
    if (pos === 'QB') {
      qb_name_final = null; qb_gsis_final = null; qb_name_source = null;
    } else if (starter?.qb_name) {
      qb_name_final = starter.qb_name;
      qb_gsis_final = starter.qb_gsis_id;
      qb_name_source = 'roster_weekly_2026_depth';
    } else {
      qb_name_final = statRow?.qb_name ?? null;
      qb_gsis_final = statRow?.qb_gsis_id ?? null;
      qb_name_source = statRow?.qb_name != null ? 'playerStats2025' : null;
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
      // Team context (QB attached — Task 4; FIX 3 fallback to 2026 depth)
      qb_name: qb_name_final,
      qb_gsis_id: qb_gsis_final,
      qb_name_source,   // FIX 3: 'playerStats2025' | 'roster_weekly_2026_depth' | null
      qb_pass_td: statRow?.qb_pass_td ?? null,
      qb_epa: statRow?.qb_epa_per_play ?? null,
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
  console.log('  qb_name from 2026 depth fallback (FIX 3):',
    rows.filter(r => r.qb_name_source === 'roster_weekly_2026_depth').length);

  const draftableCounts = {
    true: rows.filter(r => r.draftable === true).length,
    false: rows.filter(r => r.draftable === false).length,
  };
  const qbSourceCounts = {
    playerStats2025: rows.filter(r => r.qb_name_source === 'playerStats2025').length,
    roster_weekly_2026_depth: rows.filter(r => r.qb_name_source === 'roster_weekly_2026_depth').length,
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
 *   FIX 3  qb_name falls back to 2026 depth-chart starter when no 2025 stat row.
 *          qb_name_source: 'playerStats2025' | 'roster_weekly_2026_depth' | null.
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
    schema_version: 2,
    fixes_2026_09_03: {
      fix_1_draftable: draftableCounts,
      fix_3_qb_name_source: qbSourceCounts,
      fix_4_adp_source_label: 'sleeper_search_rank',
      fix_4_adp_source_note: 'adp_overall is Sleeper search_rank, NOT true consensus ADP. Integers only, ties permitted, sentinel 999.',
    },
  }, null, 2)};
`;

  fs.writeFileSync(OUT, output);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
