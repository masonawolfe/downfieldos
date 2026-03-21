import { useMemo } from "react";
import { Swords, Flame, Calendar, Star, TrendingUp, Eye, Shield, ArrowRight, Target } from "lucide-react";
import { useIsMobile } from '../../hooks/useIsMobile';
import { OPPONENTS_2026 } from '../../data/opponents2026';
import { DNA } from '../../data/dna';
import { DNA_2026 } from '../../data/dna2026';
import { agg, lgbl } from '../../utils/aggregation';
import { calcMatchupGrade } from '../../utils/grading';
import { MatchupGrade } from '../ui/MatchupGrade';
import { tn } from '../../utils/formatters';
import { calcSchemeFamiliarity } from '../../utils/schemeFamiliarity';
import { calcDivisionalFamiliarity } from '../../utils/divisionalFamiliarity';
import { calcEnvironmentFactors } from '../../utils/environmentFactors';
import fanSentimentData from '../../data/intelligence/fan_sentiment.json';

const QUICK_LINKS = [
  { icon: TrendingUp, label: "2026 Preview", path: "/" },
  { icon: Calendar, label: "This Week", path: "/this-week" },
  { icon: Star, label: "So What?", path: "/so-what" },
  { icon: Swords, label: "Matchup Preview", path: "/matchup-preview" },
  { icon: Flame, label: "Fantasy Intel", path: "/fantasy-intel" },
  { icon: Eye, label: "Team Intel", path: "/team-intel" },
  { icon: Shield, label: "War Room", path: "/war-room" },
  { icon: Target, label: "Admin", path: "/admin" },
];

export function HomeDashboard({ plays, rosters, primaryTeam, navigate, onNavigateMatchup }) {
  const isMobile = useIsMobile();
  const bl = useMemo(() => lgbl(plays), [plays]);

  // Next opponent — first home opponent as preview
  const opponents = OPPONENTS_2026[primaryTeam];
  const nextOpp = opponents?.home?.[0] || opponents?.away?.[0] || "BUF";
  const isHome = opponents?.home?.includes(nextOpp);

  // Stats for the matchup
  const myStats = useMemo(() => agg(plays, primaryTeam), [plays, primaryTeam]);
  const oppStats = useMemo(() => agg(plays, nextOpp), [plays, nextOpp]);
  const grade = useMemo(() => calcMatchupGrade(myStats, oppStats, bl), [myStats, oppStats, bl]);

  // Intelligence signals
  const signals = useMemo(() => {
    const sigs = [];
    const scheme = calcSchemeFamiliarity(primaryTeam, nextOpp);
    if (scheme?.score > 60) sigs.push({ type: "+", text: `Scheme familiarity advantage (${scheme.score}/100)` });
    else if (scheme?.score < 30) sigs.push({ type: "-", text: `Unfamiliar defensive scheme (${scheme.score}/100)` });

    const div = calcDivisionalFamiliarity(primaryTeam, nextOpp);
    if (div?.isDivisional) sigs.push({ type: "+", text: `Divisional rivalry — ${div.gamesPerSeason} games/year of film` });

    const env = calcEnvironmentFactors(nextOpp, primaryTeam);
    if (env?.factors?.length > 0) {
      const travel = env.factors.find(f => f.type === "travel" || f.type === "timezone");
      if (travel) sigs.push({ type: "-", text: travel.label || "Travel disadvantage" });
    }

    // Fill to at least 3 signals
    if (sigs.length < 3) {
      const dna = DNA_2026[primaryTeam] || DNA[primaryTeam];
      if (dna) {
        if (myStats.sr > bl.sr + 0.02) sigs.push({ type: "+", text: `${tn(primaryTeam)} offense is above-average in efficiency` });
        if (oppStats.xr > bl.xr + 0.01) sigs.push({ type: "-", text: `${tn(nextOpp)} has explosive play potential` });
        if (myStats.pr > 0.58) sigs.push({ type: "~", text: `Pass-heavy attack — game script dependent` });
      }
    }
    return sigs.slice(0, 4);
  }, [primaryTeam, nextOpp, myStats, oppStats, bl]);

  // League headlines from fan sentiment
  const headlines = useMemo(() => {
    const teams = fanSentimentData?.teams || [];
    const sorted = [...teams].sort((a, b) => (b.misery_index || 0) - (a.misery_index || 0));
    const lines = [];
    if (sorted[0]) lines.push(`${sorted[0].name} fans are the most miserable in the NFL (${sorted[0].misery_index?.toFixed(1)} misery index)`);
    const hopeful = [...teams].sort((a, b) => (b.hope || 0) - (a.hope || 0));
    if (hopeful[0]) lines.push(`${hopeful[0].name} have the most hope heading into 2026 (${hopeful[0].hope}/10)`);
    return lines;
  }, []);

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -1 }}>
          {tn(primaryTeam)} HQ
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Your personalized intelligence dashboard</p>
      </div>

      {/* Next Game Card */}
      <div style={{ background: "linear-gradient(135deg, #0d1117, #1e293b)", borderRadius: 16, padding: isMobile ? 20 : 28, marginBottom: 20, color: "#fff" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", marginBottom: 12 }}>Next Matchup</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
              {primaryTeam} <span style={{ color: "#64748b", fontWeight: 400 }}>vs</span> {nextOpp}
            </div>
            <div style={{ fontSize: 14, color: "#8B949E", marginTop: 4 }}>
              {tn(primaryTeam)} {isHome ? "(Home)" : "(Away)"} vs {tn(nextOpp)} — 2026 Season
            </div>
          </div>
          <div>
            <MatchupGrade grade={grade} size="lg" />
          </div>
        </div>

        {/* Intelligence Signals */}
        {signals.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            {signals.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, background: s.type === "+" ? "#16a34a20" : s.type === "-" ? "#dc262620" : "#eab30820", color: s.type === "+" ? "#22c55e" : s.type === "-" ? "#f87171" : "#facc15" }}>
                  {s.type === "+" ? "+" : s.type === "-" ? "−" : "~"}
                </span>
                <span style={{ color: "#cbd5e1" }}>{s.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
          <button onClick={() => onNavigateMatchup(primaryTeam, nextOpp)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f97316", border: "none", borderRadius: 8, padding: "10px 16px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Swords size={14} /> Full Matchup Preview
          </button>
          <button onClick={() => navigate("/fantasy-intel")} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 16px", color: "#e2e8f0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Flame size={14} /> Fantasy Intel
          </button>
          <button onClick={() => navigate("/this-week")} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 16px", color: "#e2e8f0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Calendar size={14} /> This Week
          </button>
        </div>
      </div>

      {/* League Headlines */}
      {headlines.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", marginBottom: 12, fontWeight: 800 }}>Around the League</div>
          {headlines.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i < headlines.length - 1 ? 10 : 0 }}>
              <span style={{ fontSize: 16, marginTop: -2 }}>{i === 0 ? "😤" : "🔥"}</span>
              <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>{h}</span>
            </div>
          ))}
          <button onClick={() => navigate("/so-what")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#f97316", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 12, padding: 0 }}>
            See all insights <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Jump To */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", marginBottom: 12, fontWeight: 800 }}>Jump To</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 8 }}>
          {QUICK_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155", textAlign: "left" }}
              >
                <Icon size={16} color="#64748b" /> {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
