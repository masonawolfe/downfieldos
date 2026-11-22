/**
 * weekly-defense.js — model build part 6 (2026-11-22, Mason: "Yeah, build
 * it"; the defensive players item scoped 2026-11-19, his words then: "we
 * need on all players to show right level matchups").
 *
 * From the nflverse stats_player_week rows the weekly actuals job already
 * downloads (no second fetch), two outputs:
 *   weekly_defense_<season>.json  one row per defender-week (DL, LB, DB) with
 *                                 the defensive columns, plus quarterback
 *                                 rows with sacks taken. Data, not shipped
 *                                 to the page.
 *   defenders_<season>.json       one entry per defender, season to date:
 *                                 games, totals and per-game rates, his team
 *                                 by week. This is the small file the
 *                                 Matchup Preview reads.
 * A defender who changes teams keeps every week under the team he played
 * for that week (by_team), so his production counts for his new team from
 * the week he arrives; his season totals are his own, wherever he played.
 */

export const DEF_GROUPS = ['DL', 'LB', 'DB'];
export const REQUIRED_COLUMNS = [
  'player_id', 'player_display_name', 'position', 'position_group', 'season', 'week', 'season_type', 'team', 'opponent_team',
  'def_tackles_solo', 'def_tackle_assists', 'def_tackles_for_loss', 'def_sacks', 'def_qb_hits',
  'def_pass_defended', 'def_interceptions', 'def_fumbles_forced', 'def_tds', 'sacks_suffered', 'sack_yards_lost',
];
const STAT_FIELDS = {
  tackles_solo: 'def_tackles_solo',
  tackle_assists: 'def_tackle_assists',
  tackles_for_loss: 'def_tackles_for_loss',
  sacks: 'def_sacks',
  qb_hits: 'def_qb_hits',
  passes_defended: 'def_pass_defended',
  interceptions: 'def_interceptions',
  fumbles_forced: 'def_fumbles_forced',
  def_tds: 'def_tds',
};

const n = v => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const r2 = x => Math.round(x * 100) / 100;

/** Throws when the file lacks a column we read: a renamed column must fail loudly, not write zeros. */
export function assertColumns(rows) {
  if (!rows.length) throw new Error('weekly defense: 0 rows in stats_player_week');
  const missing = REQUIRED_COLUMNS.filter(c => !(c in rows[0]));
  if (missing.length) throw new Error(`weekly defense: stats_player_week lacks column(s) ${missing.join(', ')}`);
}

export function buildWeeklyDefense(rows, { season, normTeam = t => t }) {
  assertColumns(rows);
  const reg = rows.filter(r => r.season_type === 'REG' && r.player_id && r.week);
  const defRows = [];
  const qbRows = [];
  for (const r of reg) {
    const week = Number(r.week);
    const base = { gsis_id: r.player_id, name: r.player_display_name, pos: r.position, team: normTeam(r.team), opponent: normTeam(r.opponent_team), week };
    if (DEF_GROUPS.includes(r.position_group)) {
      const row = { ...base, pos_group: r.position_group };
      for (const [k, col] of Object.entries(STAT_FIELDS)) row[k] = n(r[col]);
      defRows.push(row);
    } else if (r.position === 'QB') {
      qbRows.push({ ...base, sacks_taken: n(r.sacks_suffered), sack_yards_lost: n(r.sack_yards_lost) });
    }
  }
  defRows.sort((a, b) => a.week - b.week || a.team.localeCompare(b.team) || String(a.gsis_id).localeCompare(String(b.gsis_id)));
  qbRows.sort((a, b) => a.week - b.week || a.team.localeCompare(b.team));

  // Season to date, per defender.
  const players = {};
  for (const r of defRows) {
    const p = (players[r.gsis_id] ||= { name: r.name, pos: r.pos, pos_group: r.pos_group, team: r.team, last_week: 0, games: 0, totals: Object.fromEntries(Object.keys(STAT_FIELDS).map(k => [k, 0])), by_team: {} });
    p.games++;
    for (const k of Object.keys(STAT_FIELDS)) p.totals[k] += r[k];
    const bt = (p.by_team[r.team] ||= { first_week: r.week, last_week: r.week, games: 0 });
    bt.games++; bt.first_week = Math.min(bt.first_week, r.week); bt.last_week = Math.max(bt.last_week, r.week);
    if (r.week >= p.last_week) { p.last_week = r.week; p.team = r.team; p.name = r.name; p.pos = r.pos; }
  }
  for (const p of Object.values(players)) {
    for (const k of Object.keys(p.totals)) p.totals[k] = r2(p.totals[k]);
    p.per_game = {
      pressure: r2((p.totals.sacks + p.totals.qb_hits) / p.games),
      passes_defended: r2(p.totals.passes_defended / p.games),
      tackles_for_loss: r2(p.totals.tackles_for_loss / p.games),
      takeaways: r2((p.totals.interceptions + p.totals.fumbles_forced) / p.games),
      tackles: r2((p.totals.tackles_solo + p.totals.tackle_assists) / p.games),
    };
  }
  const qbs = {};
  for (const r of qbRows) {
    const q = (qbs[r.gsis_id] ||= { name: r.name, team: r.team, games: 0, sacks_taken: 0, sack_yards_lost: 0, last_week: 0 });
    q.games++; q.sacks_taken += r.sacks_taken; q.sack_yards_lost += r.sack_yards_lost;
    if (r.week >= q.last_week) { q.last_week = r.week; q.team = r.team; }
  }
  for (const q of Object.values(qbs)) q.sacks_taken_per_game = r2(q.sacks_taken / q.games);
  const weeks = [...new Set(defRows.map(r => r.week))].sort((a, b) => a - b);
  return { season, weeks, defRows, qbRows, players, qbs };
}
