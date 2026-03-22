import { useState, useMemo } from "react";
import { Star, Zap, AlertTriangle, Eye, Activity, BookOpen, Target, ChevronDown, ChevronRight, Users } from "lucide-react";
import { T } from '../../data/teams';
import { DNA } from '../../data/dna';
import { useIsMobile } from '../../hooks/useIsMobile';
import { agg, lgbl } from '../../utils/aggregation';
import { pct, tn, tnp } from '../../utils/formatters';
import { InsightCard } from '../ui/InsightCard';
import { FanSentimentCard } from '../ui/FanSentimentCard';
import { getTopDramaMatchups } from '../../utils/dramaScore';

export function SoWhatDashboard({ plays, primaryTeam }) {
  const isMobile = useIsMobile();
  const [showCards, setShowCards] = useState(false);
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
      <InsightCard tone="elite" icon={Star} stat={`#1`} headline={`${tn(best.a)} have the best offense in football`} body={`#1 in our composite. ${DNA[best.a].s}. Success rate ${pct(best.s.sr)} (avg: ${pct(bl.sr)}), explosive rate ${pct(best.s.xr)}. They move the ball consistently AND can hurt you deep.`} />
      <InsightCard tone="positive" icon={Zap} stat={pct(mostExplosive.s.xr)} headline={`${tn(mostExplosive.a)} are the most dangerous per-play`} body={`${pct(mostExplosive.s.xr)} of plays go for a big gain (avg: ${pct(bl.xr)}). Roughly 1 in ${Math.round(1 / mostExplosive.s.xr)} plays is a chunk play. You cannot play conservative defense against them.`} />
      <InsightCard tone="negative" icon={AlertTriangle} stat={pct(leastEfficient.s.sr)} headline={`${tn(leastEfficient.a)} can't stay on schedule`} body={`Dead last at ${pct(leastEfficient.s.sr)} success rate. They constantly face 3rd-and-long, where defenses pin their ears back. Vicious cycle.`} />
      <InsightCard tone="warning" icon={Eye} stat={pct(worstDef.s.dsr)} headline={`${tnp(worstDef.a)} defense is getting shredded`} body={`Allowing ${pct(worstDef.s.dsr)} success rate — worst in the league. Opposing offenses gain positive yardage on ${(worstDef.s.dsr * 100).toFixed(0)}%+ of plays.`} />
      <InsightCard tone="neutral" icon={Activity} stat={pct(mostRunHeavy.s.pr)} headline={`${tn(mostRunHeavy.a)} run more than anyone`} body={`Only ${pct(mostRunHeavy.s.pr)} pass rate — lowest in the NFL. Stop the run and you stop this team.`} />
      {/* Team Identity Cards */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginTop: 12, marginBottom: 12 }}>
        <button onClick={() => setShowCards(!showCards)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", borderBottom: showCards ? "1px solid #e2e8f0" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={20} color="#f97316" />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Team Identity Cards</span>
            <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "2px 10px", borderRadius: 10 }}>32 teams</span>
          </div>
          {showCards ? <ChevronDown size={20} color="#94a3b8" /> : <ChevronRight size={20} color="#94a3b8" />}
        </button>
        {showCards && (
          <div style={{ padding: 20, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {ranked.map((r, i) => {
              const d = DNA[r.a];
              const rank = i + 1;
              const isMyTeam = primaryTeam && r.a === primaryTeam;
              const mood = rank <= 8 ? { label: "Rolling", color: "#16a34a", bg: "#f0fdf4" } : rank <= 16 ? { label: "Solid", color: "#2563eb", bg: "#eff6ff" } : rank <= 24 ? { label: "Struggling", color: "#d97706", bg: "#fffbeb" } : { label: "Pain", color: "#dc2626", bg: "#fef2f2" };
              const style = r.s.pr > bl.pr + 0.05 ? "Pass-heavy" : r.s.pr < bl.pr - 0.05 ? "Run-heavy" : "Balanced";
              return (
                <div key={r.a} style={{ background: mood.bg, borderRadius: 12, padding: 16, border: isMyTeam ? "2px solid #f97316" : "1px solid #f1f5f9", position: "relative" }}>
                  {isMyTeam && <div style={{ position: "absolute", top: 8, right: 10, fontSize: 10, fontWeight: 800, color: "#f97316", letterSpacing: 1 }}>MY TEAM</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", fontFamily: "monospace" }}>#{rank}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{tn(r.a)}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: mood.color, marginBottom: 6 }}>{d?.s || ""}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: mood.color + "15", color: mood.color, fontWeight: 700 }}>{mood.label}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", color: "#64748b", fontWeight: 600 }}>{style}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                    SR {pct(r.s.sr)} | XR {pct(r.s.xr)} | PR {pct(r.s.pr)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fan Sentiment — Misery Index */}
      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <FanSentimentCard primaryTeam={primaryTeam} />
      </div>

      {/* Drama Rankings */}
      {(() => {
        const teamCodes = T.map(t => t.a);
        const topDrama = getTopDramaMatchups(teamCodes, 5);
        return (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 20, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>🎭</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Drama Rankings</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Most narratively loaded matchups</span>
            </div>
            {topDrama.map((m, i) => (
              <div key={`${m.team1}-${m.team2}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < topDrama.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: i === 0 ? "#f97316" : "#94a3b8", fontFamily: "monospace", width: 24 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{tn(m.team1)} vs {tn(m.team2)}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    {m.factors.map((f, fi) => (
                      <span key={fi} style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 6 }}>{f.icon} {f.label}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: m.score > 60 ? "#dc2626" : m.score > 40 ? "#f97316" : "#eab308", fontFamily: "monospace" }}>{m.score}</div>
              </div>
            ))}
          </div>
        );
      })()}

      <InsightCard tone="neutral" icon={BookOpen} headline="How to use this app" body={`Every metric compares against a league baseline. Use the Filter Panel (funnel icon, sidebar) to slice data by down, distance, score, weather, personnel, and more. All pages update instantly.`} />
    </div>
  );
}
