import { tn } from './formatters';
import { DNA } from '../data/dna';

/**
 * Generate a 5-tweet thread from matchup data.
 * Returns an array of tweet strings, each <=280 chars.
 */
export function generateTweetThread(offTm, defTm, oStats, dStats, bl, grade) {
  const off = tn(offTm);
  const def = tn(defTm);
  const pct = v => (v * 100).toFixed(1) + "%";

  // Tweet 1: Hook — the matchup with grade
  const t1 = `${off} vs ${def} — Matchup Preview\n\nOffensive grade: ${grade}\n\n${DNA[offTm]?.s || ""}\n\nThread (1/5)\n\n#NFL #${off.replace(/\s/g, "")} #DownfieldOS`;

  // Tweet 2: Offensive profile
  const passLean = oStats.pr > bl.pr + 0.05 ? "pass-heavy" : oStats.pr < bl.pr - 0.05 ? "run-heavy" : "balanced";
  const effNote = oStats.sr > bl.sr + 0.03 ? "elite efficiency" : oStats.sr > bl.sr ? "above-avg efficiency" : "below-avg efficiency";
  const t2 = `${off} offense:\n\nPass rate: ${pct(oStats.pr)} (${passLean})\nSuccess rate: ${pct(oStats.sr)} (${effNote})\nExplosive rate: ${pct(oStats.xr)}\nCompletion: ${pct(oStats.compRate)}\n\n(2/5)`;

  // Tweet 3: Defensive profile of opponent
  const defStrong = dStats.dsr < bl.sr - 0.02 ? "stingy" : dStats.dsr > bl.sr + 0.02 ? "leaky" : "average";
  const t3 = `${def} defense:\n\nSuccess rate allowed: ${pct(dStats.dsr)} (${defStrong})\nExplosive rate allowed: ${pct(dStats.dxr)}\n\n${dStats.dsr > bl.sr + 0.02 ? "This defense is giving up yardage. Advantage offense." : dStats.dsr < bl.sr - 0.02 ? "Tough defense. Hard to move the ball." : "Middle of the pack — execution wins."}\n\n(3/5)`;

  // Tweet 4: Key matchup / edge
  let edge;
  if (oStats.xr > bl.xr + 0.02 && dStats.dxr > bl.xr + 0.02) {
    edge = `Explosive offense meets porous defense. Big play potential is sky-high.`;
  } else if (oStats.sr > bl.sr + 0.03 && dStats.dsr < bl.sr - 0.02) {
    edge = `Efficient offense vs elite defense. Something has to give.`;
  } else if (oStats.pr > 0.58 && dStats.dsr > bl.sr + 0.02) {
    edge = `Pass-heavy offense against a weak secondary. Air raid incoming.`;
  } else {
    edge = `No clear schematic edge. This comes down to execution.`;
  }
  const t4 = `The edge:\n\n${edge}\n\nPass rate gap: ${pct(oStats.pr)} vs ${pct(dStats.dpr)} faced\nEfficiency gap: ${pct(oStats.sr)} OFF vs ${pct(dStats.dsr)} DEF\n\n(4/5)`;

  // Tweet 5: Bottom line + CTA
  const proj = oStats.sr > dStats.dsr + 0.03 ? `${off} should move the ball.` : dStats.dsr < oStats.sr - 0.03 ? `${def}'s defense should hold.` : `Coin flip. Watch the trenches.`;
  const t5 = `Bottom line: ${proj}\n\nFull breakdown with fantasy scores, player matchups, and scouting report:\ndownfieldos.com\n\n#NFL #DownfieldOS\n\n(5/5)`;

  return [t1, t2, t3, t4, t5];
}
