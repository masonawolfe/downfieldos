import { DNA_2026 } from '../data/dna2026';
import { DNA } from '../data/dna';
import { RECORDS_2025 } from '../data/records2025';
import { OPPONENTS_2026 } from '../data/opponents2026';
import { T } from '../data/teams';

// helper: get record string
export function recordStr(tm) {
  const r = RECORDS_2025[tm];
  if (!r) return "";
  return r.t ? `${r.w}-${r.l}-${r.t}` : `${r.w}-${r.l}`;
}

// ── WIN PROJECTION ENGINE ───────────────────────────────────
// Power rating: composite of DNA efficiency, explosive rate, and 2025 record
export function teamPower(tm) {
  const dna = DNA_2026[tm] || DNA[tm];
  const rec = RECORDS_2025[tm] || { w: 8, l: 9 };
  const winPct = rec.w / (rec.w + rec.l + (rec.t || 0) * 0.5);
  // Weighted: 40% prior record, 35% efficiency, 25% explosive
  return winPct * 0.40 + dna.e * 0.35 + dna.x * 2.5 * 0.25;
}

// Game-by-game win probability using log5 method + home advantage
export function gameWinProb(team, opp, isHome) {
  const pA = teamPower(team);
  const pB = teamPower(opp);
  // Log5 formula
  const raw = (pA * (1 - pB)) / (pA * (1 - pB) + pB * (1 - pA));
  // Home field advantage: ~57% historical NFL home win rate → +3.5% boost
  const hfa = isHome ? 0.035 : -0.035;
  return Math.min(0.95, Math.max(0.05, raw + hfa));
}

// Full season projection for a team
export function projectSeason(tm) {
  const opp = OPPONENTS_2026[tm];
  if (!opp) return null;
  const games = [
    ...opp.home.map(o => ({ opp: o, loc: "HOME", isHome: true })),
    ...opp.away.map(o => ({ opp: o, loc: "AWAY", isHome: false })),
  ];
  let totalWins = 0;
  const gameProbs = games.map(g => {
    const wp = gameWinProb(tm, g.opp, g.isHome);
    totalWins += wp;
    return { ...g, winProb: wp };
  });
  // Sort by difficulty (lowest win prob = hardest)
  const sorted = [...gameProbs].sort((a, b) => a.winProb - b.winProb);
  const hardest3 = sorted.slice(0, 3);
  const easiest3 = sorted.slice(-3).reverse();

  // Confidence band: use variance of Bernoulli trials
  // Var(total wins) = sum of p*(1-p), SD = sqrt(var)
  const variance = gameProbs.reduce((s, g) => s + g.winProb * (1 - g.winProb), 0);
  const sd = Math.sqrt(variance);
  const floor = Math.max(0, Math.round(totalWins - 1.5 * sd));
  const ceiling = Math.min(games.length, Math.round(totalWins + 1.5 * sd));

  // Strength of schedule: avg opponent power
  const sos = gameProbs.reduce((s, g) => s + teamPower(g.opp), 0) / gameProbs.length;

  // Division record projection
  const myInfo = T.find(t => t.a === tm);
  const divGames = gameProbs.filter(g => {
    const oppInfo = T.find(t => t.a === g.opp);
    return oppInfo && oppInfo.c === myInfo?.c && oppInfo.d === myInfo?.d;
  });
  const divWins = divGames.reduce((s, g) => s + g.winProb, 0);

  return {
    games: gameProbs,
    projectedWins: totalWins,
    floor, ceiling, sd,
    sos,
    hardest3, easiest3,
    divWins, divGames: divGames.length,
    sosRank: 0, // filled in by caller
    winsRank: 0,
  };
}

// All 32 teams projected — with ranks
export function projectAll32() {
  const projections = {};
  T.forEach(t => { projections[t.a] = projectSeason(t.a); });
  // Rank by SOS (higher = harder)
  const sosSorted = T.map(t => t.a).sort((a, b) => (projections[b]?.sos || 0) - (projections[a]?.sos || 0));
  sosSorted.forEach((tm, i) => { if (projections[tm]) projections[tm].sosRank = i + 1; });
  // Rank by projected wins
  const winsSorted = T.map(t => t.a).sort((a, b) => (projections[b]?.projectedWins || 0) - (projections[a]?.projectedWins || 0));
  winsSorted.forEach((tm, i) => { if (projections[tm]) projections[tm].winsRank = i + 1; });
  return projections;
}
