/**
 * kickoff.js — schedule2026 game times → UTC instants (E-052, 2026-10-10).
 *
 * nflverse `gameday` + `gametime` are US Eastern wall-clock. The weekly
 * projection snapshots (weekly_projections/) and the calibration grade
 * depend on "was this written before kickoff?", so the conversion has to
 * respect EDT/EST rather than assume a fixed offset. Shared by
 * build-weekly-board.js, snapshot-weekly-projections.mjs, build-calibration.js
 * and verify-player-board.mjs so the four never disagree about a kickoff.
 */

const ET_PARTS = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

function etWallClock(ms) {
  const p = Object.fromEntries(ET_PARTS.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
}

/** 'YYYY-MM-DD' + 'HH:MM' (US Eastern) → epoch ms (UTC). */
export function etToUtcMs(gameday, gametime) {
  if (!gameday) return null;
  const [y, mo, d] = gameday.split('-').map(Number);
  const [h, mi] = (gametime || '13:00').split(':').map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  // First guess assumes EST (UTC-5); correct by however far the guess's
  // Eastern wall clock lands from the target wall clock (0 or -1h in EDT).
  let guess = wall + 5 * 3600e3;
  guess -= etWallClock(guess) - wall;
  return guess;
}

/** REG games for a week from SCHEDULE_2026.byWeek. */
export function weekGames(schedule, week) {
  const games = schedule.byWeek?.[week] || schedule.byWeek?.[String(week)] || [];
  return games.filter(g => (g.game_type || 'REG') === 'REG');
}

export function kickoffsUtc(schedule, week) {
  return weekGames(schedule, week)
    .map(g => ({ game_id: g.game_id, ms: etToUtcMs(g.gameday, g.gametime) }))
    .filter(k => k.ms != null)
    .sort((a, b) => a.ms - b.ms);
}

export function firstKickoffUtcMs(schedule, week) {
  const k = kickoffsUtc(schedule, week);
  return k.length ? k[0].ms : null;
}

export function lastKickoffUtcMs(schedule, week) {
  const k = kickoffsUtc(schedule, week);
  return k.length ? k[k.length - 1].ms : null;
}

export function regWeeks(schedule) {
  const min = schedule.meta?.regular_season_weeks?.min ?? 1;
  const max = schedule.meta?.regular_season_weeks?.max ?? 18;
  const out = [];
  for (let w = min; w <= max; w++) out.push(w);
  return out;
}

/** Smallest REG week whose first kickoff is still in the future (or null after the season). */
export function upcomingWeek(schedule, nowMs) {
  for (const w of regWeeks(schedule)) {
    const k = firstKickoffUtcMs(schedule, w);
    if (k != null && k > nowMs) return w;
  }
  return null;
}

/**
 * Week completeness from a weekly-actuals doc: distinct games (unordered
 * team/opponent pairs) with at least one player row, vs the schedule's
 * REG game count for that week. Returns { [week]: { games_seen, games_scheduled, complete } }.
 */
export function actualsCompleteness(schedule, actualsRows) {
  const seen = new Map();
  for (const r of actualsRows || []) {
    if (!r.team || !r.opponent) continue;
    const key = [r.team, r.opponent].sort().join('_');
    if (!seen.has(r.week)) seen.set(r.week, new Set());
    seen.get(r.week).add(key);
  }
  const out = {};
  for (const [week, set] of seen) {
    const scheduled = weekGames(schedule, week).length;
    out[week] = { games_seen: set.size, games_scheduled: scheduled, complete: scheduled > 0 && set.size >= scheduled };
  }
  return out;
}
