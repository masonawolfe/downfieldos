// Scoring helpers for weekly_actuals_{SEASON}.json (DATA_FRESHNESS_PLAN
// 2026-11-01, step 1).
//
// Two different scorings live on every actuals row:
//
//   fantasy_points_graded  the board's own rules (SCORING_RULES.full_ppr in
//                          build-player-board.js, published as
//                          PLAYER_BOARD_2026_META.valuation_2026_09_04.scoring_rules).
//                          Yards, receptions and touchdowns only. This is what
//                          calibration grades, so both sides of a calibration
//                          row are scored by the same rules.
//   fantasy_points_ppr /   nflverse's own columns, kept exactly as nflverse
//   fantasy_points_std     wrote them. They also take 2 off per interception
//                          and per fumble lost, and add 2 per two-point
//                          conversion and 6 per special teams touchdown
//                          (a return or other special teams score).
//
// gradedPoints() is used by fetch-weekly-actuals.js to write the graded
// column. nflverseRecompute() and reconcileRows() are used by
// fetch-weekly-actuals.js (for the scoring_notes count) and by
// reconcile-actuals-scoring.mjs (the standalone report). The verifier's
// check #21 does NOT import this file: it recomputes the graded column from
// the board meta's rules on its own.

export const GRADED_RULES = 'full_ppr';

// nflverse's scoring as reconstructed from its own stats_player columns
// (2026 weeks 1 to 9, 2,725 of 2,725 skill rows). Fumble recovery
// touchdowns are NOT counted by nflverse's fantasy columns, so they are not
// here.
export const NFLVERSE_SCORING = {
  pass_yd: 0.04, pass_td: 4, pass_int: -2,
  rush_yd: 0.1, rush_td: 6,
  rec_yd: 0.1, rec_td: 6,
  fumbles_lost: -2,
  two_pt: 2,            // pass_2pt + rush_2pt + rec_2pt
  special_teams_td: 6,
  rec_ppr: 1, rec_std: 0,
};

const v = x => (typeof x === 'number' && Number.isFinite(x) ? x : 0);
const round2 = x => Math.round(x * 100) / 100;

export function gradedPoints(c, rules, pos) {
  const teBonus = pos === 'TE' ? (rules.te_rec_bonus || 0) : 0;
  return round2(
    v(c.receptions) * (rules.rec + teBonus)
    + v(c.rec_yd) * rules.rec_yd
    + v(c.rec_td) * rules.rec_td
    + v(c.rush_yd) * rules.rush_yd
    + v(c.rush_td) * rules.rush_td
    + v(c.pass_yd) * rules.pass_yd
    + v(c.pass_td) * rules.pass_td,
  );
}

// The components nflverse's fantasy columns need beyond the graded ones.
// A row written before step 1 lacks them; it cannot be reconciled.
export const NFLVERSE_ONLY_COMPONENTS = ['pass_int', 'fumbles_lost', 'pass_2pt', 'rush_2pt', 'rec_2pt', 'special_teams_td'];

export function nflverseRecompute(c, { ppr }) {
  const s = NFLVERSE_SCORING;
  const twoPt = v(c.pass_2pt) + v(c.rush_2pt) + v(c.rec_2pt);
  return round2(
    v(c.pass_yd) * s.pass_yd + v(c.pass_td) * s.pass_td + v(c.pass_int) * s.pass_int
    + v(c.rush_yd) * s.rush_yd + v(c.rush_td) * s.rush_td
    + v(c.receptions) * (ppr ? s.rec_ppr : s.rec_std) + v(c.rec_yd) * s.rec_yd + v(c.rec_td) * s.rec_td
    + v(c.fumbles_lost) * s.fumbles_lost
    + twoPt * s.two_pt
    + v(c.special_teams_td) * s.special_teams_td,
  );
}

// Per column: how many rows recompute within `tol` of what nflverse wrote,
// the largest absolute difference, and the rows that do not (a row missing
// a component counts as not reconciled).
export function reconcileRows(rows, tol = 0.01) {
  const cols = { fantasy_points_ppr: { ppr: true }, fantasy_points_std: { ppr: false } };
  const out = {};
  for (const [col, opt] of Object.entries(cols)) {
    let ok = 0, maxDiff = 0, compared = 0;
    const bad = [];
    for (const r of rows) {
      const c = r.components || {};
      const missing = NFLVERSE_ONLY_COMPONENTS.filter(k => !(k in c));
      if (r[col] == null) { bad.push({ row: r, reason: `${col} is null` }); continue; }
      if (missing.length) { bad.push({ row: r, reason: `missing ${missing.join(', ')}` }); continue; }
      compared++;
      const d = Math.abs(nflverseRecompute(c, opt) - r[col]);
      if (d > maxDiff) maxDiff = d;
      if (d <= tol) ok++; else bad.push({ row: r, reason: `recomputed ${nflverseRecompute(c, opt)} vs ${r[col]}` });
    }
    out[col] = { rows: rows.length, compared, reconciled: ok, max_abs_diff: round2(maxDiff), unexplained: bad };
  }
  // What separates nflverse's ppr column from the graded one, per row.
  const terms = { pass_int: 0, fumbles_lost: 0, two_pt: 0, special_teams_td: 0 };
  let differ = 0, onlyAdds = 0;
  for (const r of rows) {
    const c = r.components || {};
    if (r.fantasy_points_graded != null && r.fantasy_points_ppr != null && Math.abs(r.fantasy_points_graded - r.fantasy_points_ppr) > tol) differ++;
    if (v(c.pass_int)) terms.pass_int++;
    if (v(c.fumbles_lost)) terms.fumbles_lost++;
    const tp = v(c.pass_2pt) + v(c.rush_2pt) + v(c.rec_2pt);
    if (tp) terms.two_pt++;
    if (v(c.special_teams_td)) terms.special_teams_td++;
    if (tp || v(c.special_teams_td)) onlyAdds++;
  }
  return { columns: out, rows_graded_differs_from_ppr: differ, rows_with_term: terms, rows_with_two_pt_or_special_teams_td: onlyAdds };
}
