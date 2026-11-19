#!/usr/bin/env node
/**
 * build-team-changes.js — team news plan step 2 (2026-11-19).
 *
 * Plan: 01_Schuhbox/DFOS/TEAM_NEWS_OWN_FEED_PLAN_2026-11-17.md, part 6 step 2,
 * on Mason's "Yeah, build our own team news" (2026-11-19, relayed by CoS).
 *
 * Writes src/data/intelligence/team_changes_2026.json: up to five items per
 * team saying what changed, one sentence each from a fixed template in our
 * own words, each tied to the source file and that file's generated time.
 *
 * Two rules the plan sets, and how they are kept:
 *   1. No network call. This file imports only node:fs, node:path,
 *      node:url and scripts/_lib/season.js (the season setting, built-ins
 *      only) plus our own data files; scripts/test-build-team-changes.mjs
 *      fails on any other import, any call to the network or any web
 *      address in it, and runs the real build with the network refused.
 *   2. The availability file has no names, so it joins by gsis_id only.
 *
 * Inputs, all local (paths relative to --root, default the repo):
 *   src/data/intelligence/injuries_2026.json        out, doubtful, questionable, back
 *       (the weekly history beside injuries_2026_current.json, from the same
 *        nflverse job; it carries gsis_id and every week, which the compact
 *        file does not)
 *   src/data/intelligence/availability_2026.json    which reserve list, active or not
 *   src/data/intelligence/weekly_transactions_2026.json  signed, released, traded or claimed, reserve moves
 *   src/data/rosters2026.js                         the depth chart's starters
 *   src/data/intelligence/weekly_actuals_2026.json  targets by week, last week's top three
 *   src/data/teams.js                               team names for trade sentences
 *   data/team_changes_weights.json                  the kind order counted from our own issues (step 4)
 *   data/team_changes_starters.json                 the starters it last saw (its own state,
 *                                                   kept out of src/ so the site never bundles it)
 *
 * Usage:
 *   node scripts/build-team-changes.js [--root DIR] [--out FILE] [--state FILE] [--weights FILE] [--now ISO]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SEASON } from './_lib/season.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_PER_TEAM = 5;
const OUT_REL = `src/data/intelligence/team_changes_${SEASON}.json`;
const STATE_REL = 'data/team_changes_starters.json';
const WEIGHTS_REL = 'data/team_changes_weights.json';

const IN = {
  injuries: `src/data/intelligence/injuries_${SEASON}.json`,
  availability: `src/data/intelligence/availability_${SEASON}.json`,
  transactions: `src/data/intelligence/weekly_transactions_${SEASON}.json`,
  rosters: `src/data/rosters${SEASON}.js`,
  actuals: `src/data/intelligence/weekly_actuals_${SEASON}.json`,
  teams: 'src/data/teams.js',
};

// The rules, printed into the output so every item can be traced.
export const RULES = {
  week_now: 'the highest of the last graded week in weekly_actuals plus one, the latest week in weekly_transactions and the latest injury report week (at most 18), so one late grading run does not blank the newer files',
  window: 'a transaction, new starter or role item is kept when its week is week_now or week_now minus 1; an injury item is kept from the team\'s latest report week when that week is week_now minus 2 or later, so a team just off a bye keeps its last report; a report week before week_now is written in the past tense',
  teams: 'team codes are normalised before any join (LA to LAR and the older codes OAK, SD, STL, WSH, JAC); a code still unknown is listed in meta.unknown_teams and its rows are not used',
  kinds: 'the kind order inside each group comes from data/team_changes_weights.json (card_kind_rank, counted from our own issues by scripts/count-team-change-kinds.js, plan part 6 step 4); with no usable weights file it is the plan\'s part 4 order, out_or_back first and role and roster_move level. No betting or draft kind exists',
  order: 'plan part 4 as ruled by CoS 2026-11-19 15:31. First, a trade, signing or release of a player who matters (for a trade, one who matters to either team) always makes the card, newest first if more than five. Then, for the slots left, players who matter before players who do not, whatever the kind; within each group, kind rank, then the newer week, then the detail order below, then name',
  matters: 'a depth chart starter now, a starter the state saw this season (including one who left the starting slots, so an injured starter still counts), a player the depth chart names in a slot\'s starter_reason ("promoted after: NAME (IR)"), matched to a gsis_id through that slot\'s candidates, or one of the team\'s top three in the graded column (fantasy_points_graded) in any of the last three graded weeks. Plan part 4 says graded usage; the graded points are the one usage measure the actuals file carries for every position (it stores no attempts or carries)',
  detail_order: 'reserve, out, doubtful, back, activated, questionable, traded_in, traded_out, signed, released, new_starter, role_up, role_down',
  cap: `at most ${MAX_PER_TEAM} items per team and one item per player per team (the first in the order)`,
  out_or_back: 'listed out, doubtful or questionable on the team\'s latest injury report week; back when listed out on the team\'s previous report week (a bye week is skipped) and, on the latest week, not listed out or doubtful while the availability file says active for the same team',
  reserve: 'a STATUS_CHANGE from ACT or INA to RES in weekly_transactions; the list is named from the availability file (IR injured reserve, PUP physically unable to perform), otherwise "a reserve list"',
  activated: 'a STATUS_CHANGE from RES to ACT (returned to the active roster), or from RES to INA while availability still places him on that team (came off a reserve list)',
  signed: 'SIGNED with status ACT; a TRADED_OR_CLAIMED row whose old_status is CUT (a free agent) and new_status ACT is written as a signing; one whose old_status is DEV and new_status ACT is written as a signing off the other team\'s practice squad, with no item for the team that lost him',
  traded: 'TRADED_OR_CLAIMED with old_status and new_status each ACT, INA or RES, written for both teams as a trade or waiver claim (the file cannot tell the two apart)',
  released: 'RELEASED with last_status ACT, RES or INA, or a STATUS_CHANGE from one of those to CUT. Left out when the player is still on that team (availability, the depth chart or a weekly_actuals row for that team in that week or later), and every release in a team-week with more than 20 RELEASED rows is left out as a snapshot gap and listed in meta.skipped_release_weeks. Practice squad only moves are left out',
  new_starter: 'a player in the team\'s depth chart starter slots who was not in them at the last build (state in data/team_changes_starters.json); the first build only records the starters; a starter who leaves the slots is kept in the state for the rest of the season, and when he returns his old record comes back with no new starter item',
  role: 'wide receivers, tight ends and running backs with targets in the last graded week, against their average over up to three earlier games for the same team (at least two); up when 4 or more targets above the average and at least 6 targets; down when 4 or more below an average of at least 6. Targets only: the actuals file carries no carries',
  sentences: 'fixed templates in our own words, positions written out in words; no source text is copied',
};

const DETAIL_ORDER = ['reserve', 'out', 'doubtful', 'back', 'activated', 'questionable', 'traded_in', 'traded_out', 'signed', 'released', 'new_starter', 'role_up', 'role_down'];
const DEFAULT_KIND_RANK = { out_or_back: 1, role: 2, roster_move: 2 };
/** The weights file's card ranks when every card kind has a positive integer rank, else the plan's order. */
export function kindRankFrom(weights) {
  const r = weights?.card_kind_rank;
  const ok = r && ['out_or_back', 'role', 'roster_move'].every((k) => Number.isInteger(r[k]) && r[k] > 0);
  return ok ? { out_or_back: r.out_or_back, role: r.role, roster_move: r.roster_move } : DEFAULT_KIND_RANK;
}
const ROLE_POS = new Set(['WR', 'TE', 'RB']);
const TEAM_ALIAS = { LA: 'LAR', STL: 'LAR', OAK: 'LV', SD: 'LAC', WSH: 'WAS', JAC: 'JAX' };
const RELEASE_GAP_FLOOR = 20;

// Positions in words, so no abbreviation reaches a reader.
export const POSITION_WORDS = {
  QB: 'quarterback', RB: 'running back', FB: 'fullback', WR: 'wide receiver', TE: 'tight end',
  OL: 'offensive lineman', T: 'tackle', OT: 'tackle', LT: 'left tackle', RT: 'right tackle',
  G: 'guard', OG: 'guard', LG: 'left guard', RG: 'right guard', C: 'center',
  DL: 'defensive lineman', DE: 'defensive end', DT: 'defensive tackle', NT: 'nose tackle', EDGE: 'edge rusher',
  LB: 'linebacker', ILB: 'inside linebacker', OLB: 'outside linebacker', MLB: 'middle linebacker',
  DB: 'defensive back', CB: 'cornerback', SCB: 'slot cornerback', S: 'safety', FS: 'free safety', SS: 'strong safety',
  K: 'kicker', P: 'punter', LS: 'long snapper',
};
const posWord = (code) => POSITION_WORDS[code] || 'player';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "Updated November 19, 2026": the build time as a US Eastern calendar date (team news plan step 5: the card shows its file's date). */
export function updatedLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d).map((x) => [x.type, x.value]));
  return `Updated ${MONTHS[Number(parts.month) - 1]} ${Number(parts.day)}, ${parts.year}`;
}
const cap1 = (w) => w.charAt(0).toUpperCase() + w.slice(1);

function readJson(root, rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}
async function readExport(root, rel, name) {
  const mod = await import(pathToFileURL(path.resolve(root, rel)).href);
  if (!Object.prototype.hasOwnProperty.call(mod, name)) throw new Error(`${rel} has no export ${name}`);
  return mod[name];
}

const round1 = (x) => Math.round(x * 10) / 10;
const fmtNum = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
const slotGroup = (pos) => String(pos).replace(/\d+$/, '');

/**
 * Pure: every input in, the output object back. No clock and no disk.
 */
export function buildTeamChanges(input) {
  const { injuries, availability, transactions, rosters, rostersMeta, actuals, teams, prior, now, weights } = input;
  const KIND_RANK = kindRankFrom(weights);
  if (prior?.generated_at && now && Date.parse(prior.generated_at) > Date.parse(now)) {
    throw new Error(`the starters state says generated ${prior.generated_at}, after this build's ${now}: a state from a test clock cannot feed a build`);
  }
  const unknownPositions = new Set();
  const unknownTeams = new Map();
  const pw = (code) => { if (!POSITION_WORDS[code]) unknownPositions.add(String(code)); return posWord(code); };
  const teamName = Object.fromEntries(teams.map((t) => [t.a, t.n]));
  const teamCodes = teams.map((t) => t.a);
  const known = new Set(teamCodes);
  const norm = (c) => {
    if (c == null || c === '') return null;
    const v = TEAM_ALIAS[c] || c;
    if (!known.has(v)) { unknownTeams.set(String(c), (unknownTeams.get(String(c)) || 0) + 1); return null; }
    return v;
  };
  const avail = availability.players || {};
  const availTeam = (id) => (avail[id] ? norm(avail[id].team) : null);

  const actualRows = (actuals.rows || []).map((r) => ({ ...r, team: norm(r.team) })).filter((r) => r.team);
  const txs = (transactions.transactions || []).map((x) => ({ ...x, team: norm(x.team), from_team: norm(x.from_team), to_team: norm(x.to_team) }));
  const latestWeekByTeam = {};
  for (const [c, w] of Object.entries(injuries.meta?.report_week_by_team || {})) { const t = norm(c); if (t) latestWeekByTeam[t] = w; }

  const weeksPresent = actuals.meta?.weeks_present || [...new Set(actualRows.map((r) => r.week))];
  const gradedWeek = weeksPresent.length ? Math.max(...weeksPresent) : 0;
  const txWeek = Math.max(0, ...txs.map((x) => x.week).filter(Number.isInteger));
  const reportWeek = Math.max(0, ...Object.values(latestWeekByTeam).filter(Number.isInteger));
  const weekNow = Math.min(18, Math.max(gradedWeek + 1, txWeek, reportWeek));
  const inWindow = (w) => Number.isInteger(w) && w >= weekNow - 1 && w <= weekNow;

  const src = {
    injuries: { file: IN.injuries, generated: injuries.meta?.generated_at || injuries.meta?.generated || null },
    availability: { file: IN.availability, generated: availability.meta?.generated || null },
    transactions: { file: IN.transactions, generated: transactions.meta?.generated || null },
    rosters: { file: IN.rosters, generated: rostersMeta?.reconciled_at || rostersMeta?.generated || null },
    actuals: { file: IN.actuals, generated: actuals.meta?.generated_at || null },
    prior: { file: STATE_REL, generated: prior && prior.season === SEASON ? prior.generated_at || null : null },
    weights: { file: WEIGHTS_REL, generated: kindRankFrom(weights) === DEFAULT_KIND_RANK ? null : weights?.meta?.generated_at || null },
  };

  // Starters now, by team: gsis_id -> slot group.
  const startersNow = {};
  for (const tm of teamCodes) {
    const t = rosters[tm] || {};
    const m = {};
    for (const side of ['offense', 'defense']) {
      for (const s of t[side] || []) if (s?.gsis_id) m[s.gsis_id] = { pos: slotGroup(s.pos), name: s.name };
    }
    startersNow[tm] = m;
  }

  // Starters the depth chart says were moved out for injury: a slot's
  // starter_reason reads "promoted after: NAME (IR), ...". Each name is
  // matched to a gsis_id through that slot's own candidates, never by name
  // across the league.
  const displaced = {};
  for (const tm of teamCodes) {
    const set = new Set();
    for (const side of ['offense', 'defense']) {
      for (const s of (rosters[tm] || {})[side] || []) {
        const m = /^promoted after:\s*(.+)$/.exec(s?.starter_reason || '');
        if (!m) continue;
        for (const part of m[1].split(/,\s*/)) {
          const nm = part.replace(/\s*\([^)]*\)\s*$/, '').trim();
          const hit = (s.candidates || []).filter((c) => c.name === nm && c.gsis_id);
          if (hit.length === 1) set.add(hit[0].gsis_id);
        }
      }
    }
    displaced[tm] = set;
  }

  // Top three in the graded column, each of the last three graded weeks.
  const top3 = {};
  for (const tm of teamCodes) {
    const set = new Set();
    for (const w of [gradedWeek, gradedWeek - 1, gradedWeek - 2]) {
      actualRows.filter((r) => r.team === tm && r.week === w)
        .sort((a, b) => (b.fantasy_points_graded || 0) - (a.fantasy_points_graded || 0)).slice(0, 3).forEach((r) => set.add(r.gsis_id));
    }
    top3[tm] = set;
  }

  const items = Object.fromEntries(teamCodes.map((t) => [t, []]));
  const add = (tm, it) => { if (tm && items[tm]) items[tm].push(it); };

  // ── out or back, from the injury report history ────────────────────────
  const reportWeeksByTeam = {};
  for (const p of injuries.players || []) {
    const tm = norm(p.team);
    if (!tm) continue;
    for (const x of p.weeks || []) if (x.game_type === 'REG' && Number.isInteger(x.week)) (reportWeeksByTeam[tm] ||= new Set()).add(x.week);
  }
  const behind = {};
  for (const p of injuries.players || []) {
    const tm = norm(p.team);
    const wt = latestWeekByTeam[tm];
    if (!tm || !Number.isInteger(wt) || !p.gsis_id || wt < weekNow - 2) continue;
    if (wt < weekNow - 1) behind[tm] = wt;
    const prevWeek = Math.max(-1, ...[...(reportWeeksByTeam[tm] || [])].filter((w) => w < wt));
    const at = (w) => (p.weeks || []).find((x) => x.week === w && x.game_type === 'REG') || null;
    const cur = at(wt);
    const prev = prevWeek >= 0 ? at(prevWeek) : null;
    const st = cur?.report_status || null;
    const verb = wt >= weekNow ? 'is' : 'was';
    const base = { gsis_id: p.gsis_id, name: p.name, position: p.position, week: wt, sources: [src.injuries] };
    if (st === 'Out' || st === 'Doubtful' || st === 'Questionable') {
      const word = st.toLowerCase();
      add(tm, { ...base, kind: 'out_or_back', detail: word, sentence: `${cap1(pw(p.position))} ${p.name} ${verb} listed ${word} on the week ${wt} injury report.` });
      continue;
    }
    const a = avail[p.gsis_id];
    if (prev?.report_status === 'Out' && a?.status === 'ACT' && availTeam(p.gsis_id) === tm && a?.game_designation !== 'O' && a?.game_designation !== 'D') {
      add(tm, { ...base, kind: 'out_or_back', detail: 'back', sentence: `${cap1(pw(p.position))} ${p.name} was listed out for week ${prevWeek} and ${verb} not listed out for week ${wt}.`, sources: [src.injuries, src.availability] });
    }
  }

  // ── reserve moves and roster moves, from weekly transactions ──────────
  const LIST_NAME = { IR: 'injured reserve', PUP: 'the physically unable to perform list' };
  const FROM_ROSTER = ['ACT', 'RES', 'INA'];
  const releaseCount = new Map();
  for (const x of txs) if (x.type === 'RELEASED' && x.team) releaseCount.set(`${x.team}|${x.week}`, (releaseCount.get(`${x.team}|${x.week}`) || 0) + 1);
  const skippedReleaseWeeks = [...releaseCount].filter(([, n]) => n > RELEASE_GAP_FLOOR)
    .map(([k, n]) => { const [team, week] = k.split('|'); return { team, week: Number(week), rows: n }; }).sort((a, b) => a.week - b.week || a.team.localeCompare(b.team));
  const gap = new Set(skippedReleaseWeeks.map((g) => `${g.team}|${g.week}`));
  const stillOn = (id, tm, week) => availTeam(id) === tm || Boolean(startersNow[tm]?.[id]) || actualRows.some((r) => r.gsis_id === id && r.team === tm && r.week >= week);
  let releasesDropped = 0;
  for (const x of txs) {
    if (!inWindow(x.week) || !x.gsis_id) continue;
    const base = { gsis_id: x.gsis_id, name: x.name, position: x.position, week: x.week, sources: [src.transactions] };
    const who = `${pw(x.position)} ${x.name}`;
    const release = () => {
      if (gap.has(`${x.team}|${x.week}`) || stillOn(x.gsis_id, x.team, x.week)) { releasesDropped++; return; }
      add(x.team, { ...base, kind: 'roster_move', detail: 'released', sentence: `Released ${who} before week ${x.week}.`, sources: [src.transactions, src.availability] });
    };
    if (x.type === 'STATUS_CHANGE') {
      if ((x.from_status === 'ACT' || x.from_status === 'INA') && x.to_status === 'RES') {
        const a = avail[x.gsis_id];
        const list = LIST_NAME[a?.status] || 'a reserve list';
        add(x.team, { ...base, kind: 'out_or_back', detail: 'reserve', sentence: `${cap1(who)} moved to ${list} before week ${x.week}.`, sources: LIST_NAME[a?.status] ? [src.transactions, src.availability] : [src.transactions] });
      } else if (x.from_status === 'RES' && x.to_status === 'ACT') {
        add(x.team, { ...base, kind: 'out_or_back', detail: 'activated', sentence: `${cap1(who)} returned to the active roster before week ${x.week}.` });
      } else if (x.from_status === 'RES' && x.to_status === 'INA' && availTeam(x.gsis_id) === x.team) {
        add(x.team, { ...base, kind: 'out_or_back', detail: 'activated', sentence: `${cap1(who)} came off a reserve list before week ${x.week}.`, sources: [src.transactions, src.availability] });
      } else if (FROM_ROSTER.includes(x.from_status) && x.to_status === 'CUT') {
        release();
      }
    } else if (x.type === 'SIGNED') {
      if (x.status === 'ACT') add(x.team, { ...base, kind: 'roster_move', detail: 'signed', sentence: `Signed ${who} to the active roster before week ${x.week}.` });
    } else if (x.type === 'RELEASED') {
      if (FROM_ROSTER.includes(x.last_status)) release();
    } else if (x.type === 'TRADED_OR_CLAIMED') {
      if (!x.to_team) continue;
      if (x.old_status === 'CUT' && x.new_status === 'ACT') {
        add(x.to_team, { ...base, kind: 'roster_move', detail: 'signed', sentence: `Signed ${who} to the active roster before week ${x.week}.` });
      } else if (x.old_status === 'DEV' && x.new_status === 'ACT') {
        if (teamName[x.from_team]) add(x.to_team, { ...base, kind: 'roster_move', detail: 'signed', sentence: `Signed ${who} off the ${teamName[x.from_team]} practice squad before week ${x.week}.` });
      } else if (FROM_ROSTER.includes(x.old_status) && FROM_ROSTER.includes(x.new_status) && teamName[x.from_team]) {
        add(x.to_team, { ...base, other_team: x.from_team, kind: 'roster_move', detail: 'traded_in', sentence: `Added ${who} from the ${teamName[x.from_team]} by trade or waiver claim before week ${x.week}.` });
        add(x.from_team, { ...base, other_team: x.to_team, kind: 'roster_move', detail: 'traded_out', sentence: `Lost ${who} to the ${teamName[x.to_team]} by trade or waiver claim before week ${x.week}.` });
      }
    }
  }

  // ── new starters, against the starters the last build recorded ──────
  // State per team: gsis_id -> { pos, name, since_week, replaced, left_week }.
  // since_week null means a starter since before the first build. left_week
  // marks one who left the slots; he is kept while that week is in the window.
  const stateUsable = prior && prior.season === SEASON;
  const priorStarters = stateUsable ? prior.teams || null : null;
  const starters = {};
  for (const tm of teamCodes) {
    const before = priorStarters?.[tm] || null;
    const rec = {};
    for (const [id, s] of Object.entries(startersNow[tm])) {
      const old = before?.[id];
      if (old) { rec[id] = { ...old, pos: s.pos, name: s.name, left_week: null }; continue; }
      if (!before) { rec[id] = { pos: s.pos, name: s.name, since_week: null, replaced: null, left_week: null }; continue; }
      const gone = Object.entries(before).filter(([oid, o]) => o.pos === s.pos && o.left_week == null && !startersNow[tm][oid]);
      rec[id] = { pos: s.pos, name: s.name, since_week: weekNow, replaced: gone.length === 1 ? gone[0][1].name : null, left_week: null };
    }
    for (const [id, o] of Object.entries(before || {})) {
      if (rec[id]) continue;
      rec[id] = { ...o, left_week: o.left_week ?? weekNow }; // kept all season, so a starter back from a long injury is not new
    }
    starters[tm] = rec;
    for (const [id, s] of Object.entries(rec)) {
      if (s.left_week != null || !inWindow(s.since_week)) continue;
      if (before?.[id]?.left_week != null) continue; // a starter back in his slot is not new
      const tail = s.replaced ? `, in place of ${s.replaced}` : '';
      add(tm, { gsis_id: id, name: s.name, position: s.pos, week: s.since_week, kind: 'role', detail: 'new_starter', sentence: `${s.name} moved into the starting lineup at ${pw(s.pos)} on the depth chart before week ${s.since_week}${tail}.`, sources: [src.rosters, src.prior] });
    }
  }
  const matters = (tm, id) => Boolean(starters[tm]?.[id] || displaced[tm]?.has(id) || top3[tm]?.has(id));

  // ── role grew or shrank, by targets ────────────────────────────────────
  const byPlayer = new Map();
  for (const r of actualRows) {
    if (!ROLE_POS.has(r.pos) || !r.gsis_id) continue;
    if (!byPlayer.has(r.gsis_id)) byPlayer.set(r.gsis_id, []);
    byPlayer.get(r.gsis_id).push(r);
  }
  for (const rows of byPlayer.values()) {
    const last = rows.find((r) => r.week === gradedWeek);
    if (!last || !inWindow(gradedWeek)) continue;
    const earlier = rows.filter((r) => r.team === last.team && r.week < gradedWeek).sort((a, b) => b.week - a.week).slice(0, 3);
    if (earlier.length < 2) continue;
    const t = last.components?.targets ?? 0;
    const avg = round1(earlier.reduce((s, r) => s + (r.components?.targets ?? 0), 0) / earlier.length);
    const base = { gsis_id: last.gsis_id, name: last.name, position: last.pos, week: gradedWeek, kind: 'role', sources: [src.actuals] };
    const who = cap1(`${pw(last.pos)} ${last.name}`);
    if (t - avg >= 4 && t >= 6) add(last.team, { ...base, detail: 'role_up', sentence: `${who} drew ${t} targets in week ${gradedWeek}, up from an average of ${fmtNum(avg)} over the previous ${earlier.length} games.` });
    else if (avg - t >= 4 && avg >= 6) add(last.team, { ...base, detail: 'role_down', sentence: `${who} drew ${t} targets in week ${gradedWeek}, down from an average of ${fmtNum(avg)} over the previous ${earlier.length} games.` });
  }

  // ── rank, one per player, cap ──────────────────────────────────────────
  const teamsOut = {};
  let total = 0;
  for (const tm of teamCodes) {
    // A trade counts for both cards when the player matters to either team.
    const scored = items[tm].map((it) => ({ ...it, matters: matters(tm, it.gsis_id) || Boolean(it.other_team && matters(it.other_team, it.gsis_id)) }));
    const tie = (a, b) => (b.week - a.week)
      || (DETAIL_ORDER.indexOf(a.detail) - DETAIL_ORDER.indexOf(b.detail))
      || String(a.name).localeCompare(String(b.name));
    const isMove = (it) => it.kind === 'roster_move' && it.matters;
    const ranked = [
      ...scored.filter(isMove).sort(tie),
      ...scored.filter((it) => !isMove(it)).sort((a, b) => (Number(b.matters) - Number(a.matters))
        || (KIND_RANK[a.kind] - KIND_RANK[b.kind])
        || tie(a, b)),
    ];
    const seen = new Set();
    const keep = [];
    for (const it of ranked) {
      if (seen.has(it.gsis_id)) continue;
      seen.add(it.gsis_id);
      keep.push(it);
      if (keep.length === MAX_PER_TEAM) break;
    }
    teamsOut[tm] = keep.map(({ other_team, ...it }) => it); // other_team is for ranking only, not the reader file
    total += keep.length;
  }

  return {
    meta: {
      season: SEASON,
      source_season: SEASON,
      generated_at: now,
      generated_by: 'scripts/build-team-changes.js',
      label: updatedLabel(now),
      label_basis: 'the build\'s own time (generated_at) as a calendar date in US Eastern time, the date a reader sees on the card',
      graded_week: gradedWeek,
      week_now: weekNow,
      week_now_basis: { graded_plus_one: gradedWeek + 1, latest_transactions_week: txWeek, latest_report_week: reportWeek },
      total_items: total,
      first_build: !priorStarters,
      state_reset: Boolean(prior) && !stateUsable ? `the state was for season ${prior.season ?? 'unknown'}, not ${SEASON}` : null,
      injury_report_weeks_behind: behind,
      skipped_release_weeks: skippedReleaseWeeks,
      releases_left_out: releasesDropped,
      unknown_teams: Object.fromEntries([...unknownTeams].sort()),
      unknown_positions: [...unknownPositions].sort(),
      kind_rank: KIND_RANK,
      kind_rank_from: KIND_RANK === DEFAULT_KIND_RANK ? 'the plan\'s part 4 order (no usable weights file)' : `${WEIGHTS_REL}, counted through week ${weights?.meta?.counted_through_week}`,
      sources: [src.injuries, src.availability, src.transactions, src.rosters, src.actuals, src.prior, src.weights],
      rules: RULES,
    },
    teams: teamsOut,
    state: { season: SEASON, generated_at: now, generated_by: 'scripts/build-team-changes.js', week_now: weekNow, note: 'Starters the last build saw, per team. Read and rewritten by scripts/build-team-changes.js; never edited by hand.', teams: starters },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const root = path.resolve(opt('--root') || path.join(__dirname, '..'));
  const outFile = path.resolve(root, opt('--out') || OUT_REL);
  const stateFile = path.resolve(root, opt('--state') || STATE_REL);
  const now = opt('--now') || new Date().toISOString();

  const weightsFile = path.resolve(root, opt('--weights') || WEIGHTS_REL);
  let weights = null;
  if (fs.existsSync(weightsFile)) {
    try { weights = JSON.parse(fs.readFileSync(weightsFile, 'utf8')); } catch (e) { console.log(`build-team-changes: ${weightsFile} does not parse (${e.message}); the plan's kind order is used`); }
  }
  let prior = null;
  if (fs.existsSync(stateFile)) {
    try { prior = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch (e) { throw new Error(`${stateFile} exists but does not parse: ${e.message}`); }
  }
  const out = buildTeamChanges({
    injuries: readJson(root, IN.injuries),
    availability: readJson(root, IN.availability),
    transactions: readJson(root, IN.transactions),
    rosters: await readExport(root, IN.rosters, `ROSTERS_${SEASON}`),
    rostersMeta: await readExport(root, IN.rosters, 'ROSTERS_META'),
    actuals: readJson(root, IN.actuals),
    teams: await readExport(root, IN.teams, 'T'),
    prior,
    now,
    weights,
  });
  const teamsWith = Object.values(out.teams).filter((v) => v.length).length;
  if (Object.keys(out.teams).length !== 32) throw new Error(`expected 32 teams, built ${Object.keys(out.teams).length}`);
  const { state, ...card } = out;
  fs.writeFileSync(outFile, JSON.stringify(card, null, 2) + '\n');
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');
  console.log(`team_changes: ${out.meta.total_items} items across ${teamsWith} of 32 teams, week_now ${out.meta.week_now}, graded week ${out.meta.graded_week}${out.meta.first_build ? ', first build (starters recorded, no new starter items)' : ''}${out.meta.unknown_positions.length ? `, positions with no word: ${out.meta.unknown_positions.join(', ')}` : ''}${Object.keys(out.meta.unknown_teams).length ? `, unknown team codes: ${JSON.stringify(out.meta.unknown_teams)}` : ''}${out.meta.skipped_release_weeks.length ? `, release snapshot gaps skipped: ${out.meta.skipped_release_weeks.map((g) => `${g.team} week ${g.week} (${g.rows})`).join(', ')}` : ''}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(`build-team-changes: ${e.message}`); process.exit(1); });
}
