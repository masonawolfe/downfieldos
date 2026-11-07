// Lookup helpers over injuries_${SEASON}_current.json. Compact file with one
// current row per player, safe to bundle.

import injuries from '../data/intelligence/injuries_2026_current.json';
import { buildInjuryIndex } from './injuryIndex';

// Only rows from each team's report week count (freshness plan step 10): a
// status that cannot be dated to the team's current report is not an active
// designation, so the card says nothing rather than something possibly
// false. The rule lives in ./injuryIndex.js, where scripts/test-injuries.js
// tests it.
const index = buildInjuryIndex(injuries);

// Return this player's row from his team's current report, or null.
export function injuryFor(name, team) {
  return index.injuryFor(name, team);
}

// Return every player on a team's current report, sorted
// Out → Doubtful → Questionable.
export function injuriesForTeam(team) {
  return index.injuriesForTeam(team);
}

// The report week a team's rows come from, or null when it has none.
export function injuriesReportWeek(team) {
  return index.reportWeekFor(team);
}

// The league's latest report week (meta.latest_report_week).
export function injuriesLatestWeek() {
  return (injuries.meta && injuries.meta.latest_report_week) ?? null;
}

// Metadata about the underlying source and its freshness.
export function injuriesMeta() {
  return injuries.meta || null;
}
