// Format-aware + horizon-aware fantasy valuation engine — P1-1 in
// FANTASY_ENGINE_BUILD_PLAN.md.
//
// The pilot draft proved one implicit ranking model is not enough: a board
// built for 12-team full-PPR 4-pt-TD leagues misled badly in the same league,
// and its keeper-league age penalties leaked into redraft prose (Davante
// Adams fell 42 picks past ADP).
//
// This module accepts three dials — FORMAT, HORIZON, RISK — plus a fourth
// synthesis dial (PERSONA) that bundles opinionated defaults. Every dial is a
// pure config object; every consumer of the engine is one call to
// `evaluate(player, config)`.
//
// Design guarantees:
//  1. Horizon INVERTS variables where it should (contract year: positive in
//     redraft, warning in keeper/dynasty). It does not just add penalties.
//  2. Format changes positional value curves, not just per-player scores.
//     6-pt passing TDs make elite QBs more valuable ACROSS THE BOARD relative
//     to skill positions, not just the specific QB you're looking at.
//  3. Home-team bias is NOT part of the engine (P0-4). "Your team" is a
//     display/filter layer applied after evaluation.

// ─── Format presets ─────────────────────────────────────────────────────────

export const FORMAT_KMC_TRAUMA = Object.freeze({
  name: 'KMC Trauma (12-team full PPR, 4-pt TD)',
  team_count: 12,
  scoring: {
    passing_td_pts: 4,
    ppr: 1.0,
    te_premium: 0,
    passing_yard_per_pt: 25,
    rushing_yard_per_pt: 10,
    receiving_yard_per_pt: 10,
    six_pt_td_bonus: false,
  },
  superflex: false,
});

export const FORMAT_THE_CASINO = Object.freeze({
  name: 'The Casino (10-team half-PPR, 6-pt TD, keepers)',
  team_count: 10,
  scoring: {
    passing_td_pts: 6,
    ppr: 0.5,
    te_premium: 0,
    passing_yard_per_pt: 25,
    rushing_yard_per_pt: 10,
    receiving_yard_per_pt: 10,
    six_pt_td_bonus: true,
  },
  superflex: false,
});

export const FORMAT_STANDARD = Object.freeze({
  name: 'Standard (12-team half-PPR, 4-pt TD)',
  team_count: 12,
  scoring: {
    passing_td_pts: 4,
    ppr: 0.5,
    te_premium: 0,
    passing_yard_per_pt: 25,
    rushing_yard_per_pt: 10,
    receiving_yard_per_pt: 10,
    six_pt_td_bonus: false,
  },
  superflex: false,
});

export const FORMATS = { FORMAT_KMC_TRAUMA, FORMAT_THE_CASINO, FORMAT_STANDARD };

// ─── Horizon presets ────────────────────────────────────────────────────────
//
// Each horizon defines WEIGHTS for the components the engine considers. These
// invert cleanly: contract_year_bonus is positive in REDRAFT (motivator +
// usage) and negative in DYNASTY (may leave, may regress after payday).

export const HORIZON_REDRAFT = Object.freeze({
  name: 'Redraft',
  horizon_years: 1,
  weights: {
    projected_production: 1.0,
    contract_year_bonus: 1.0,     // motivation + expected usage bump
    age_penalty_over_28: 0.05,    // mild; doesn't matter much for 1 year
    draft_capital_bonus: 0.15,    // weak signal in year N
    playoff_weeks_sos: 1.0,       // matters — decides the fantasy title
    injury_penalty: 1.0,
    situation_change_bonus: 0.6,  // new offense, new coach, etc.
  },
});

export const HORIZON_KEEPER_3YR = Object.freeze({
  name: 'Keeper (3-year)',
  horizon_years: 3,
  weights: {
    projected_production: 1.0,
    contract_year_bonus: -0.4,    // WARNING — may leave / may regress
    age_penalty_over_28: 0.4,
    draft_capital_bonus: 0.6,
    playoff_weeks_sos: 0.4,       // matters less; roster carries year to year
    injury_penalty: 0.9,
    situation_change_bonus: 0.9,
  },
});

export const HORIZON_DYNASTY = Object.freeze({
  name: 'Dynasty',
  horizon_years: 5,
  weights: {
    projected_production: 1.0,
    contract_year_bonus: -0.7,    // strong WARNING
    age_penalty_over_28: 1.0,     // decisive
    draft_capital_bonus: 1.2,     // strong signal
    playoff_weeks_sos: 0.0,       // schedules reset each year
    injury_penalty: 1.1,          // history compounds
    situation_change_bonus: 1.1,
  },
});

export const HORIZONS = { HORIZON_REDRAFT, HORIZON_KEEPER_3YR, HORIZON_DYNASTY };

// ─── Risk posture presets ───────────────────────────────────────────────────

export const RISK_FLOOR = Object.freeze({
  name: 'Floor',
  ceiling_multiplier: 0.4,
  floor_multiplier: 1.6,
  volatility_penalty: 0.6,
});
export const RISK_BALANCED = Object.freeze({
  name: 'Balanced',
  ceiling_multiplier: 1.0,
  floor_multiplier: 1.0,
  volatility_penalty: 0.0,
});
export const RISK_CEILING = Object.freeze({
  name: 'Ceiling',
  ceiling_multiplier: 1.6,
  floor_multiplier: 0.4,
  volatility_penalty: -0.4,
});

export const RISKS = { RISK_FLOOR, RISK_BALANCED, RISK_CEILING };

// ─── Personas — named bundles of dials ──────────────────────────────────────
//
// The "modes" idea from the pilot: Poles = long-horizon, floor-first; Howie
// = short-horizon, ceiling-first. Same mechanism the engine already exposes,
// packaged into personas because they're legible to a football audience and
// on-brand.

export const PERSONA_MASON = Object.freeze({
  key: 'MASON',
  label: 'Mason',
  description: 'The house default — redraft, balanced. Whatever format you pick, use this until you know why to override.',
  format: FORMAT_STANDARD,
  horizon: HORIZON_REDRAFT,
  risk: RISK_BALANCED,
});
export const PERSONA_POLES = Object.freeze({
  key: 'POLES',
  label: 'Poles',
  description: 'Ryan Poles — long-horizon, floor-first. Rewards draft capital and O-line continuity; skeptical of contract-year and age-31 spikes.',
  format: FORMAT_STANDARD,
  horizon: HORIZON_KEEPER_3YR,
  risk: RISK_FLOOR,
});
export const PERSONA_HOWIE = Object.freeze({
  key: 'HOWIE',
  label: 'Howie',
  description: 'Howie Roseman — short-horizon, ceiling-first. Buys the year-of-the-cliff bounce; treats contract-year as a positive signal.',
  format: FORMAT_STANDARD,
  horizon: HORIZON_REDRAFT,
  risk: RISK_CEILING,
});

export const PERSONAS = [PERSONA_MASON, PERSONA_POLES, PERSONA_HOWIE];

// ─── Positional value curves ────────────────────────────────────────────────
//
// Baseline points-per-game estimates at each roster slot. Combined with team
// count and superflex, they set the replacement level for a position — which
// determines how much an "elite" tier is worth beyond a "mid" tier.

const POSITION_BASELINES = {
  // pos: [tier1_ppg, tier2, tier3, tier4, tier5] (top-4 QB, top-10 QB, ...)
  QB: [24, 20, 17, 15, 13],
  RB: [22, 17, 14, 11, 9],
  WR: [20, 16, 13, 11, 9],
  TE: [17, 12, 9, 7, 6],
  K:  [10, 9, 8.5, 8, 7.5],
  DEF: [10, 8, 6.5, 5.5, 5],
};

// ─── The scoring function ───────────────────────────────────────────────────

function positionMultiplierFromFormat(pos, format) {
  const { scoring, superflex } = format;
  let m = 1.0;
  // 6-pt passing TDs: QBs +25% in relative value (an elite QB scores more
  // fantasy points per real-life TD than an elite WR).
  if (pos === 'QB' && scoring.six_pt_td_bonus) m *= 1.25;
  // Superflex: QBs +40% because you can start two.
  if (pos === 'QB' && superflex) m *= 1.4;
  // Full PPR: WR/TE +30%, RB +20% (RBs catch fewer passes than WRs).
  if (scoring.ppr >= 1) {
    if (pos === 'WR' || pos === 'TE') m *= 1.3;
    if (pos === 'RB') m *= 1.2;
  } else if (scoring.ppr >= 0.5) {
    if (pos === 'WR' || pos === 'TE') m *= 1.15;
    if (pos === 'RB') m *= 1.1;
  }
  // TE premium: TE bump on top of PPR.
  if (pos === 'TE' && scoring.te_premium >= 0.5) m *= (1 + scoring.te_premium * 0.4);
  return m;
}

function projectedProduction(player, format) {
  // Rating-based proxy until we have real projections. Player rating (~60-99)
  // maps to a tier, tier maps to a baseline PPG, format multiplies the value.
  const baselines = POSITION_BASELINES[player.position] || [12, 10, 8];
  const rating = Math.max(60, Math.min(99, player.rating ?? 75));
  const tierIndex = Math.min(baselines.length - 1, Math.floor((99 - rating) / 6));
  const basePPG = baselines[tierIndex];
  const posMult = positionMultiplierFromFormat(player.position, format);
  return basePPG * posMult;
}

function ageEffect(player, horizon) {
  const age = player.age;
  if (age == null) return 0;
  if (age <= 28) return 0;
  // -1 per year over 28, then scaled by horizon.
  const overshoot = age - 28;
  return -overshoot * horizon.weights.age_penalty_over_28;
}

function contractYearEffect(player, horizon) {
  if (!player.contract_year) return 0;
  // Redraft weight is positive (motivation + usage); dynasty weight is
  // negative (regression / departure risk).
  return 2.0 * horizon.weights.contract_year_bonus;
}

function draftCapitalEffect(player, horizon) {
  // Only meaningful for younger players; the value fades after their rookie deal.
  if (player.years_experience == null || player.years_experience > 4) return 0;
  const round = player.draft_round;
  if (round == null || round > 3) return 0;
  const bonus = (4 - round) * 0.7; // rd1 = 2.1, rd2 = 1.4, rd3 = 0.7
  return bonus * horizon.weights.draft_capital_bonus;
}

function playoffSOSEffect(player, horizon) {
  // Bigger SOS number = harder playoff schedule = lower value.
  const sos = player.playoff_weeks_sos;
  if (sos == null) return 0;
  // Center at 0.5 (neutral). Range roughly 0.3-0.7.
  return (0.5 - sos) * 4 * horizon.weights.playoff_weeks_sos;
}

function injuryEffect(player, horizon) {
  const status = (player.injury_status || '').toLowerCase();
  if (!status) return 0;
  const magnitudes = { out: -6, doubtful: -4, questionable: -1.5, probable: -0.5 };
  const base = magnitudes[status] ?? 0;
  return base * horizon.weights.injury_penalty;
}

function situationChangeEffect(player, horizon) {
  // A new team, new HC/OC, or a coordinator lineage change signals volatility
  // — either upside (breakout) or downside (regression).
  if (!player.situation_changed) return 0;
  // +1.5 baseline, ambient — the horizon dial decides how much to trust it.
  return 1.5 * horizon.weights.situation_change_bonus;
}

function riskAdjust(component, risk) {
  // Ceiling / floor / volatility mixer applied to the production score. A
  // ceiling-first drafter cares about upside; a floor-first drafter about
  // week-in / week-out reliability.
  const ceiling = component.ceiling ?? component.value;
  const floor = component.floor ?? component.value;
  return (
    ceiling * risk.ceiling_multiplier * 0.5 +
    floor * risk.floor_multiplier * 0.5 -
    (component.volatility ?? 0) * risk.volatility_penalty
  );
}

// The single public entry point. Accepts a lightly-typed player and a config
// object with format/horizon/risk (any missing dial defaults to standard).
export function evaluate(player, config = {}) {
  const format = config.format || FORMAT_STANDARD;
  const horizon = config.horizon || HORIZON_REDRAFT;
  const risk = config.risk || RISK_BALANCED;

  const production = projectedProduction(player, format);
  // Volatility proxy: elite (rating > 85) high-ceiling players carry it; mid
  // (rating 72-82) don't; low is capped floor.
  const volatility = Math.max(0, ((player.rating ?? 75) - 82) / 5);

  const productionScore = riskAdjust(
    { value: production, ceiling: production * (1 + volatility * 0.2), floor: production * (1 - volatility * 0.15), volatility },
    risk
  );

  const adjustments = {
    age: ageEffect(player, horizon),
    contract_year: contractYearEffect(player, horizon),
    draft_capital: draftCapitalEffect(player, horizon),
    playoff_sos: playoffSOSEffect(player, horizon),
    injury: injuryEffect(player, horizon),
    situation_change: situationChangeEffect(player, horizon),
  };
  const adjTotal = Object.values(adjustments).reduce((a, b) => a + b, 0);

  const value = Math.max(0, productionScore + adjTotal);

  // Human-readable "why" — pick the largest signed adjustment.
  const strongest = Object.entries(adjustments)
    .filter(([, v]) => v !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  const note = strongest
    ? `${strongest[1] > 0 ? '↑' : '↓'} ${strongest[0].replace(/_/g, ' ')} (${strongest[1].toFixed(1)})`
    : null;

  return {
    value: Number(value.toFixed(2)),
    productionScore: Number(productionScore.toFixed(2)),
    adjustments,
    note,
    config: {
      format: format.name,
      horizon: horizon.name,
      risk: risk.name,
    },
  };
}

// Rank a list of players by a config. Returns the same player objects with a
// new .valuation field, sorted by value desc.
export function rankPlayers(players, config) {
  return [...players]
    .map(p => ({ ...p, valuation: evaluate(p, config) }))
    .sort((a, b) => b.valuation.value - a.valuation.value);
}
