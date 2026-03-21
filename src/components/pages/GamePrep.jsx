import { useState, useMemo } from "react";
import { Swords, Mic, Twitter, Download, ArrowLeft } from "lucide-react";
import { useIsMobile } from '../../hooks/useIsMobile';
import { T } from '../../data/teams';
import { agg, lgbl } from '../../utils/aggregation';
import { calcMatchupGrade } from '../../utils/grading';
import { matchupPreview, playerMatchupSummary } from '../../utils/narratives';
import { generateTweetThread } from '../../utils/tweetThread';
import { generatePrepSheet } from '../../utils/prepSheet';
import { pct, tn } from '../../utils/formatters';
import { MatchupGrade } from '../ui/MatchupGrade';
import { MarkdownBlock } from '../ui/MarkdownBlock';
import { RatingBar } from '../ui/RatingBar';
import { TeamSelect } from '../ui/TeamSelect';
import { generateMatchupIntelSummary } from '../../utils/matchupIntelSummary';
import { calcSchemeFamiliarity } from '../../utils/schemeFamiliarity';
import { calcCoachingTreeOverlap } from '../../utils/coachingTree';
import { calcDivisionalFamiliarity } from '../../utils/divisionalFamiliarity';
import { calcEnvironmentFactors } from '../../utils/environmentFactors';
import { getRevengeGameSummary } from '../../utils/revengeGames';
import { getFreeAgentIntel } from '../../utils/freeAgentIntel';
import { calculateChemistryScore } from '../../utils/formerTeammates';

export function GamePrep({ plays, rosters, primaryTeam, navigate }) {
  const isMobile = useIsMobile();
  const [offTm, setOffTm] = useState(primaryTeam || "CHI");
  const [defTm, setDefTm] = useState("DET");

  const os = useMemo(() => agg(plays, offTm), [plays, offTm]);
  const ds = useMemo(() => agg(plays, defTm), [plays, defTm]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const oR = rosters[offTm], dR = rosters[defTm];
  const preview = useMemo(() => matchupPreview(offTm, defTm, os, ds, bl), [offTm, defTm, os, ds, bl]);
  const grade = useMemo(() => calcMatchupGrade(os, ds, bl), [os, ds, bl]);
  const playerMatchups = useMemo(() => playerMatchupSummary(oR, dR, offTm, defTm), [oR, dR, offTm, defTm]);
  const thread = useMemo(() => generateTweetThread(offTm, defTm, os, ds, bl, grade), [offTm, defTm, os, ds, bl, grade]);

  const intelSummary = useMemo(() => {
    const schemeFam = calcSchemeFamiliarity(offTm, defTm);
    const coachTree = calcCoachingTreeOverlap(offTm, defTm);
    const divFam = calcDivisionalFamiliarity(offTm, defTm);
    const envFactors = calcEnvironmentFactors(defTm, offTm);
    const revenge = getRevengeGameSummary(offTm, defTm);
    const faIntel = getFreeAgentIntel(offTm, defTm);
    const chemScore = calculateChemistryScore(offTm, defTm);
    return generateMatchupIntelSummary({ offTm, defTm, schemeFam, coachTree, divFam, envFactors, revenge, faIntel, chemScore });
  }, [offTm, defTm]);

  const downloadText = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={18} color="#64748b" />
        </button>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: -0.5 }}>Game Prep</h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Everything you need in one scroll</p>
        </div>
      </div>

      {/* Team Selectors + Exports */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
        <TeamSelect value={offTm} onChange={setOffTm} label="Offense" />
        <div style={{ fontSize: 20, color: "#94a3b8", fontWeight: 800, paddingBottom: 8 }}>vs</div>
        <TeamSelect value={defTm} onChange={setDefTm} label="Defense" />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => downloadText(`${offTm}_vs_${defTm}_prep.txt`, generatePrepSheet(offTm, defTm, os, ds, bl, grade, oR, dR, playerMatchups))} style={{ display: "flex", alignItems: "center", gap: 5, background: "#f97316", border: "none", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <Mic size={13} /> Prep Sheet
          </button>
          <button onClick={() => downloadText(`${offTm}_vs_${defTm}_thread.txt`, thread.map((t, i) => `${i + 1}/${thread.length}\n${t}`).join('\n\n'))} style={{ display: "flex", alignItems: "center", gap: 5, background: "#0d1117", border: "none", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <Twitter size={13} /> Thread
          </button>
        </div>
      </div>

      {/* Big Picture + Grade */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280, background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
          <MarkdownBlock text={preview} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, minWidth: 120 }}>
          <MatchupGrade grade={grade} size="lg" />
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, textAlign: "center" }}>{offTm} OFF vs {defTm} DEF</div>
        </div>
      </div>

      {/* Intelligence Summary */}
      {intelSummary && intelSummary.edges?.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #0d1117, #1e293b)", borderRadius: 16, padding: 20, marginBottom: 16, color: "#fff" }}>
          <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: "#f97316", marginBottom: 10 }}>Intelligence Signals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {intelSummary.edges.slice(0, 5).map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, background: e.direction === "positive" ? "#16a34a20" : e.direction === "negative" ? "#dc262620" : "#eab30820", color: e.direction === "positive" ? "#22c55e" : e.direction === "negative" ? "#f87171" : "#facc15" }}>
                  {e.direction === "positive" ? "+" : e.direction === "negative" ? "−" : "~"}
                </span>
                <span style={{ color: "#cbd5e1" }}>{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Player Matchups (top 4) */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Swords size={16} color="#f97316" /> Key Player Matchups
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          {playerMatchups.slice(0, 4).map((m, i) => {
            const edge = m.off.rating - m.def.rating;
            const edgeColor = edge > 5 ? "#16a34a" : edge < -5 ? "#dc2626" : "#eab308";
            return (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>{m.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: edgeColor, background: edgeColor + "15", padding: "2px 8px", borderRadius: 6 }}>{edge > 5 ? "OFF +" + edge : edge < -5 ? "DEF +" + Math.abs(edge) : "EVEN"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{m.off.name} <span style={{ color: "#94a3b8" }}>({m.off.rating})</span></span>
                  <span style={{ fontWeight: 600 }}>{m.def.name} <span style={{ color: "#94a3b8" }}>({m.def.rating})</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10 }}>
        {[["Pass Rate", pct(os.pr)], ["Success", pct(os.sr)], ["Explosive", pct(os.xr)], ["Sack Rate", pct(os.sackRate)]].map(([lbl, val]) => (
          <div key={lbl} style={{ background: "#0d1117", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{lbl}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f97316" }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
