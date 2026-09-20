/**
 * scripts/_lib/starter_pick.js
 *
 * Shared starter picker (E-042) used by BOTH the roster build
 * (fetch-nflverse-roster-base.js) and the board build's reconcile
 * step (build-player-board.js, E-044 2026-09-20).
 *
 * One source of truth for "who starts given today's availability."
 * A single availability-designated-out predicate + a single
 * pool-walk that fills up to N slots, skipping designated-out
 * candidates in preferred order and attaching a `starter_reason`
 * when a demotion happened.
 *
 * The roster build seeds the pool from nflverse depth charts
 * (pos_rank 1-3). The board build's reconcile step seeds the pool
 * from `rosters2026.js`'s own `candidates` array — which the roster
 * build now emits — and re-runs the picker against the availability
 * snapshot the board is about to ship with. Rosters cron and
 * availability cron drift; this brings them back into sync at
 * every board build.
 */

export const OUT_STATUSES = new Set(['IR', 'PUP', 'NFI', 'SUSP']);
export const OUT_DESIGNATIONS = new Set(['O', 'Out']);

/**
 * Returns the reason a player is unavailable, or null if available.
 * Availability record shape: { status, game_designation, ... } from
 * Sleeper via availability_2026.json.
 */
export function outReason(availRec) {
  if (!availRec) return null;
  const s = String(availRec.status || '').toUpperCase();
  const gd = String(availRec.game_designation || '');
  if (OUT_STATUSES.has(s)) return s;
  if (OUT_DESIGNATIONS.has(gd)) return 'Out';
  return null;
}

/**
 * Fill up to `count` slots from `sortedCandidates`, in order,
 * skipping designated-out candidates.
 *
 * Each accepted candidate is returned as a shallow-copy carrying
 * `starter_reason: 'promoted after: <skipped list>'` when at least
 * one candidate ahead of it was skipped for availability. Skip trail
 * resets between picks so WR2 does not inherit WR1's trail.
 *
 * Inputs:
 *  - sortedCandidates: [{ gsis_id, name, posAbb, posRank, ... }]
 *  - count: number of slots to fill
 *  - availById: { [gsis_id]: { status, game_designation, ... } }
 *
 * Returns: chosen candidates + demotions log for the caller.
 */
export function pickAvailable(sortedCandidates, count, availById) {
  const chosen = [];
  const demotions = [];
  let skipped = [];
  for (const c of sortedCandidates) {
    if (chosen.length >= count) break;
    const reason = c.gsis_id ? outReason(availById[c.gsis_id]) : null;
    if (reason) {
      skipped.push({ name: c.name, reason });
      continue;
    }
    const starter_reason = skipped.length
      ? `promoted after: ${skipped.map(s => `${s.name} (${s.reason})`).join(', ')}`
      : null;
    chosen.push({ ...c, starter_reason });
    if (skipped.length) demotions.push({ pos: c.posAbb || null, name: c.name, skipped: [...skipped] });
    skipped = [];
  }
  return { chosen, demotions };
}
