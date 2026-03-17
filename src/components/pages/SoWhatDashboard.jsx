import { useMemo } from "react";
import { Star, Zap, AlertTriangle, Eye, Activity, BookOpen, Target } from "lucide-react";
import { T } from '../../data/teams';
import { DNA } from '../../data/dna';
import { agg, lgbl } from '../../utils/aggregation';
import { pct, tn } from '../../utils/formatters';
import { InsightCard } from '../ui/InsightCard';

export function SoWhatDashboard({ plays, primaryTeam }) {
  const bl = useMemo(() => lgbl(plays), [plays]);
  const ranked = useMemo(() => T.map(t => ({ a: t.a, n: t.n, s: agg(plays, t.a) })).sort((a, b) => (b.s.sr * .4 + b.s.xr * 3 + b.s.pr * .2) - (a.s.sr * .4 + a.s.xr * 3 + a.s.pr * .2)), [plays]);
  const best = ranked[0], worst = ranked[31];
  const mostExplosive = [...ranked].sort((a, b) => b.s.xr - a.s.xr)[0];
  const leastEfficient = [...ranked].sort((a, b) => a.s.sr - b.s.sr)[0];
  const mostRunHeavy = [...ranked].sort((a, b) => a.s.pr - b.s.pr)[0];
  const worstDef = [...ranked].sort((a, b) => b.s.dsr - a.s.dsr)[0];
  const isFiltered = plays.length < 500000;
  const filterNote = isFiltered ? ` (based on ${plays.length.toLocaleString()} filtered plays)` : "";

  return (
    <div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -1 }}>What You Need to Know</h2>
      <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 28px" }}>The state of the NFL, in plain English.{filterNote}</p>
      {primaryTeam && (() => {
        const myRank = ranked.findIndex(r => r.a === primaryTeam) + 1;
        const my = ranked.find(r => r.a === primaryTeam);
        if (!my) return null;
        const tone = myRank <= 8 ? "positive" : myRank <= 16 ? "neutral" : myRank <= 24 ? "warning" : "negative";
        return <InsightCard tone={tone} icon={Target} stat={`#${myRank}`} headline={`Your ${tn(primaryTeam)}: ranked #${myRank} of 32`} body={`${DNA[primaryTeam].s}. Success rate ${pct(my.s.sr)} (avg: ${pct(bl.sr)}), explosive rate ${pct(my.s.xr)}, pass rate ${pct(my.s.pr)}. ${myRank <= 10 ? "Top-third offense." : myRank <= 20 ? "Middle of the pack." : "Below average — needs to improve efficiency."}`} />;
      })()}
      <InsightCard tone="elite" icon={Star} stat={`#1`} headline={`${tn(best.a)} has the best offense in football`} body={`#1 in our composite. ${DNA[best.a].s}. Success rate ${pct(best.s.sr)} (avg: ${pct(bl.sr)}), explosive rate ${pct(best.s.xr)}. They move the ball consistently AND can hurt you deep.`} />
      <InsightCard tone="positive" icon={Zap} stat={pct(mostExplosive.s.xr)} headline={`${tn(mostExplosive.a)} is the most dangerous per-play`} body={`${pct(mostExplosive.s.xr)} of plays go for a big gain (avg: ${pct(bl.xr)}). Roughly 1 in ${Math.round(1 / mostExplosive.s.xr)} plays is a chunk play. You cannot play conservative defense against them.`} />
      <InsightCard tone="negative" icon={AlertTriangle} stat={pct(leastEfficient.s.sr)} headline={`${tn(leastEfficient.a)} can't stay on schedule`} body={`Dead last at ${pct(leastEfficient.s.sr)} success rate. They constantly face 3rd-and-long, where defenses pin their ears back. Vicious cycle.`} />
      <InsightCard tone="warning" icon={Eye} stat={pct(worstDef.s.dsr)} headline={`${tn(worstDef.a)}'s defense is getting shredded`} body={`Allowing ${pct(worstDef.s.dsr)} success rate — worst in the league. Opposing offenses gain positive yardage on ${(worstDef.s.dsr * 100).toFixed(0)}%+ of plays.`} />
      <InsightCard tone="neutral" icon={Activity} stat={pct(mostRunHeavy.s.pr)} headline={`${tn(mostRunHeavy.a)} runs more than anyone`} body={`Only ${pct(mostRunHeavy.s.pr)} pass rate — lowest in the NFL. Stop the run and you stop this team.`} />
      <InsightCard tone="neutral" icon={BookOpen} headline="How to use this app" body={`Every metric compares against a league baseline. Use the Filter Panel (funnel icon, sidebar) to slice data by down, distance, score, weather, personnel, and more. All pages update instantly. The chatbot (orange button) answers questions about anything you see.`} />
    </div>
  );
}
