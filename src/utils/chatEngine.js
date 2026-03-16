import { T } from '../data/teams';
import { DNA } from '../data/dna';
import { agg, lgbl } from './aggregation';
import { pct, tn } from './formatters';
import { teamSoWhat } from './narratives';

export function chatAnswer(question, plays, rosters) {
  const q = question.toLowerCase();
  const allStats = {}; T.forEach(t => { allStats[t.a] = agg(plays, t.a); });
  const bl = lgbl(plays);
  const teamMatch = T.find(t => q.includes(t.a.toLowerCase()) || q.includes(t.n.toLowerCase()));
  if (q.includes("best") && (q.includes("offense") || q.includes("team"))) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => (b.s.sr * .4 + b.s.xr * 3) - (a.s.sr * .4 + a.s.xr * 3));
    return `Best offenses:\n\n1. **${tn(sorted[0].t.a)}** — ${DNA[sorted[0].t.a].s}. Success rate ${pct(sorted[0].s.sr)}, explosive rate ${pct(sorted[0].s.xr)}.\n2. **${tn(sorted[1].t.a)}** — ${DNA[sorted[1].t.a].s}.\n3. **${tn(sorted[2].t.a)}** — ${DNA[sorted[2].t.a].s}.\n\nWorst: **${tn(sorted[31].t.a)}** and **${tn(sorted[30].t.a)}**.`;
  }
  if (q.includes("worst") && (q.includes("defense") || q.includes("defend"))) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => b.s.dsr - a.s.dsr);
    return `Worst defenses by success rate allowed:\n\n1. **${tn(sorted[0].t.a)}** — ${pct(sorted[0].s.dsr)} success rate allowed.\n2. **${tn(sorted[1].t.a)}** — ${pct(sorted[1].s.dsr)}.\n3. **${tn(sorted[2].t.a)}** — ${pct(sorted[2].s.dsr)}.`;
  }
  if (q.includes("explosive") || q.includes("big play")) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => b.s.xr - a.s.xr);
    return `Most explosive offenses:\n\n1. **${tn(sorted[0].t.a)}** — ${pct(sorted[0].s.xr)} big play rate\n2. **${tn(sorted[1].t.a)}** — ${pct(sorted[1].s.xr)}\n3. **${tn(sorted[2].t.a)}** — ${pct(sorted[2].s.xr)}\n\nLeague avg: ${pct(bl.xr)}.`;
  }
  if (q.includes("completion") || q.includes("comp rate")) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => b.s.compRate - a.s.compRate);
    return `Highest completion rates:\n\n1. **${tn(sorted[0].t.a)}** — ${pct(sorted[0].s.compRate)}\n2. **${tn(sorted[1].t.a)}** — ${pct(sorted[1].s.compRate)}\n3. **${tn(sorted[2].t.a)}** — ${pct(sorted[2].s.compRate)}\n\nLeague avg: ${pct(bl.compRate)}.`;
  }
  if (q.includes("sack")) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => b.s.sackRate - a.s.sackRate);
    return `Highest sack rates taken:\n\n1. **${tn(sorted[0].t.a)}** — ${pct(sorted[0].s.sackRate)} of dropbacks\n2. **${tn(sorted[1].t.a)}** — ${pct(sorted[1].s.sackRate)}\n3. **${tn(sorted[2].t.a)}** — ${pct(sorted[2].s.sackRate)}\n\nThese QBs are under siege.`;
  }
  if (q.includes("filter") || q.includes("how") && q.includes("use")) {
    return `Use the filter panel (funnel icon in the sidebar) to slice data by:\n\n- **Season** (2023, 2024, 2025)\n- **Weeks** (range slider)\n- **Down** (1st through 4th)\n- **Distance** (short/medium/long)\n- **Field position** (own territory/midfield/red zone)\n- **Quarter, Home/Away, Weather**\n- **Score differential** (winning/losing/close/blowout)\n- **Personnel grouping** (11, 12, 21, etc.)\n- **2-minute drill mode**\n\nAll pages update instantly when you change filters.`;
  }
  if (teamMatch) return teamSoWhat(teamMatch.a, allStats[teamMatch.a], bl);
  if (q.includes("red zone")) {
    const rz = plays.filter(p => p.rz);
    return `In the red zone, teams pass ${pct(rz.filter(p => p.type === "Pass").length / (rz.length || 1))} of the time (vs ${pct(bl.pr)} overall). Compressed fields make separation harder — power runs and quick passes dominate inside the 20.`;
  }
  if (q.includes("personnel") || q.includes("11 personnel") || q.includes("12 personnel")) {
    const p11 = plays.filter(p => p.pers === "11"), p12 = plays.filter(p => p.pers === "12");
    return `Personnel usage league-wide:\n\n- **11 personnel** (3WR/1TE/1RB): ${pct(p11.length / plays.length)} of plays, ${pct(p11.filter(p => p.type === "Pass").length / (p11.length || 1))} pass rate\n- **12 personnel** (2TE/1RB): ${pct(p12.length / plays.length)} of plays, ${pct(p12.filter(p => p.type === "Pass").length / (p12.length || 1))} pass rate\n\n11 is the passing formation. 12 is heavier and more run-oriented.`;
  }
  return `Try asking about:\n- Any team name ("Tell me about the Chiefs")\n- "Who has the best offense?"\n- "Which defenses are worst?"\n- "Most explosive teams?"\n- "Completion rate leaders"\n- "Who gets sacked most?"\n- "Red zone tendencies"\n- "Personnel grouping usage"\n- "How do I use filters?"`;
}
