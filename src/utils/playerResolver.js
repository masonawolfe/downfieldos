// EM/PO Directive v2 Task 2 — player resolver.
//
// `playerStats2025.js` is the canonical player-stat source (610 rows,
// gsis_id + pos + team + full stat lines + share metrics from usage
// enrichment). But not every 2026-rostered skill player has a 2025 stat
// row — some are rookies, some were on practice squads all last year,
// some churned across rosters without game action. Consumers that look up
// a player MUST NOT silently return "no data" — that's the exact failure
// that hit two live drafts (Jameson Williams and TreVeyon Henderson both
// returned as "no data" when they had full 2025 seasons; the real cause
// was the copilot joining to rosters2026.js, which only holds 143 skill
// starters).
//
// Every consumer that looks up a player by gsis_id must go through
// `resolvePlayer()` here. It returns one of four explicit outcomes —
// never null, never silent.

import { PLAYER_STATS_2025 } from '../data/playerStats2025';
import availabilityDoc from '../data/intelligence/availability_2026.json';

// Index the canonical source once at module load.
const STATS_BY_GSIS = new Map();
for (const r of PLAYER_STATS_2025) {
  if (r.gsis_id) STATS_BY_GSIS.set(r.gsis_id, r);
}

// Availability index (Sleeper players API, keyed by gsis_id). Task 5 requires
// that any recommendation gate on status; a PUP/IR/NFI/SUSP player must not
// be ranked above a healthy player without an explicit override.
const AVAIL_BY_GSIS = new Map(Object.entries(availabilityDoc.players || {}));

// Optional roster-weekly injection point. If a consumer has already loaded
// roster_weekly_2026 (as a Map keyed by gsis_id), they pass it in; otherwise
// the resolver returns a coarser `no_2025_snaps` classification.
//
// Returns one of:
//   { kind: 'resolved',       stats,   source: 'playerStats2025' }
//   { kind: 'no_2025_snaps',  sub: 'rookie' | 'no_game_action', roster? }
//   { kind: 'data_gap',       reason: 'no_gsis_id' | 'not_in_roster_weekly' }
//   { kind: 'unknown',        reason: 'no_source_available' }
export function resolvePlayer(gsis_id, opts = {}) {
  if (!gsis_id) {
    return { kind: 'data_gap', reason: 'no_gsis_id' };
  }
  const stats = STATS_BY_GSIS.get(gsis_id);
  if (stats) {
    return { kind: 'resolved', stats, source: 'playerStats2025' };
  }
  const rosterWeekly = opts.rosterWeekly;
  if (rosterWeekly && rosterWeekly.get) {
    const rw = rosterWeekly.get(gsis_id);
    if (rw) {
      const rookieYear = String(rw.rookie_year || '');
      const yearsExp = String(rw.years_exp || '');
      const sub = (rookieYear === String(opts.currentSeason || '2026') || yearsExp === '0') ? 'rookie' : 'no_game_action';
      return { kind: 'no_2025_snaps', sub, roster: rw };
    }
    return { kind: 'data_gap', reason: 'not_in_roster_weekly' };
  }
  // No roster_weekly injected — best we can do without it.
  return { kind: 'no_2025_snaps', sub: 'unknown_reason' };
}

// Convenience: does this player have a 2025 stat row?
export function hasStats(gsis_id) {
  return !!gsis_id && STATS_BY_GSIS.has(gsis_id);
}

// Direct accessor if a caller has already decided it wants the raw row.
export function getStats(gsis_id) {
  return gsis_id ? (STATS_BY_GSIS.get(gsis_id) || null) : null;
}

// Metadata about the canonical index (row count + share coverage).
export function statsIndexMeta() {
  let withShares = 0;
  for (const r of STATS_BY_GSIS.values()) {
    if (r.target_share != null || r.carry_share != null || r.snap_share != null) withShares++;
  }
  return {
    total_rows: STATS_BY_GSIS.size,
    rows_with_share_metrics: withShares,
    availability_records: AVAIL_BY_GSIS.size,
    availability_source: availabilityDoc.meta?.source || null,
    availability_generated: availabilityDoc.meta?.generated || null,
  };
}

// ─── Availability (EM/PO Directive v2 Task 5) ──────────────────────────────

// Return the raw availability record for a player, or null.
export function getAvailability(gsis_id) {
  if (!gsis_id) return null;
  return AVAIL_BY_GSIS.get(gsis_id) || null;
}

// True if the player's status disqualifies them from a "healthy" ranking.
// PUP / IR / NFI / SUSP are disqualifying. Q / D / O are surfaced but not
// disqualifying — a starting QB at "Q" is often the top play at the position.
export function isBenched(gsis_id) {
  const a = getAvailability(gsis_id);
  if (!a) return false;
  return ['PUP', 'IR', 'NFI', 'SUSP'].includes(a.status);
}

// Age of the availability record in hours. Returns Infinity if never verified.
export function availabilityAgeHours(gsis_id) {
  const a = getAvailability(gsis_id);
  if (!a || !a.last_verified_utc) return Infinity;
  const ageMs = Date.now() - new Date(a.last_verified_utc).getTime();
  return ageMs / (1000 * 60 * 60);
}

// True if the availability record is older than the threshold (default 24h,
// per directive). Consumers must label a recommendation stale in this case.
export function isAvailabilityStale(gsis_id, thresholdHours = 24) {
  return availabilityAgeHours(gsis_id) > thresholdHours;
}

// Gate a ranking decision: for a pair of gsis_ids (candidate, incumbent),
// return true if the candidate CAN outrank the incumbent given availability
// state. A benched candidate can never outrank a healthy incumbent unless
// `allowOverride` is passed.
export function canOutrank(candidateGsis, incumbentGsis, opts = {}) {
  const cBenched = isBenched(candidateGsis);
  const iBenched = isBenched(incumbentGsis);
  if (opts.allowOverride) return true;
  // If both benched or both healthy — no gate.
  if (cBenched === iBenched) return true;
  // Candidate benched vs healthy incumbent — refuse.
  if (cBenched && !iBenched) return false;
  // Candidate healthy vs benched incumbent — allowed (healthy outranks benched).
  return true;
}
