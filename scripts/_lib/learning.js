/**
 * learning.js — the one place the 2026 learning rule's settings live
 * (2026-11-22, Mason: "I want the player's number to learn from the season";
 * QA L-1, 2026-11-23: the positions were a hand-written set in two places).
 *
 * K is fixed in advance from his words (2026 takes half the weight by about
 * the fourth game). Which positions learn is NOT written by hand: it is read
 * from the committed test result, data/backtests/player-learning.json, written
 * by scripts/backtest-player-learning.mjs. A position learns when its 95%
 * interval for "learned minus 2025 pace" lies wholly below zero (a smaller
 * average miss, clear of noise). Re-running the test and committing the new
 * file switches positions on or off; nothing else needs editing. Tight ends
 * are off today because their interval (-0.081 to +0.085) crosses zero.
 */
import fs from 'fs';
import path from 'path';

export const LEARNING_K = 4;
export const LEARNING_BACKTEST = 'data/backtests/player-learning.json';

/** Positions whose test interval clears zero, from the committed result. Throws if the file is missing or malformed. */
export function learningPositions(repoRoot) {
  const doc = JSON.parse(fs.readFileSync(path.join(repoRoot, LEARNING_BACKTEST), 'utf8'));
  const by = doc.design_minus_pace_by_pos;
  if (!by || typeof by !== 'object') throw new Error(`${LEARNING_BACKTEST} has no design_minus_pace_by_pos`);
  if (doc.k_design != null && doc.k_design !== LEARNING_K) throw new Error(`${LEARNING_BACKTEST} tested K ${doc.k_design}, the rule uses K ${LEARNING_K}`);
  return new Set(Object.entries(by).filter(([, v]) => Array.isArray(v.ci95) && v.ci95[1] < 0).map(([pos]) => pos));
}
