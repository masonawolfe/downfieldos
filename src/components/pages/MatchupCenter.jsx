import { useState, useMemo, useEffect } from "react";
import { Swords, ChevronDown, ChevronRight, Twitter, Copy, Check, Mic, FileText, Download, PenLine, Flame, Shield, GitBranch, ArrowRightLeft } from "lucide-react";
import { useIsMobile } from '../../hooks/useIsMobile';
import { agg, lgbl } from '../../utils/aggregation';
import { pct, tn } from '../../utils/formatters';
import { calcMatchupGrade } from '../../utils/grading';
import { generateTweetThread } from '../../utils/tweetThread';
import { generatePrepSheet, generateNewsletterDraft, generateArticle } from '../../utils/prepSheet';
import { matchupPreview, scriptedPlaysPreview, playerMatchupSummary } from '../../utils/narratives';
import { TeamSelect } from '../ui/TeamSelect';
import { MarkdownBlock } from '../ui/MarkdownBlock';
import { RatingBar } from '../ui/RatingBar';
import { MatchupGrade } from '../ui/MatchupGrade';
import { FormerTeammatesCard } from '../ui/FormerTeammatesCard';
import { getRevengeGameSummary } from '../../utils/revengeGames';
import { calcSchemeFamiliarity } from '../../utils/schemeFamiliarity';
import { calcCoachingTreeOverlap } from '../../utils/coachingTree';
import { calcDivisionalFamiliarity } from '../../utils/divisionalFamiliarity';
import { calcEnvironmentFactors } from '../../utils/environmentFactors';
import { getFreeAgentIntel } from '../../utils/freeAgentIntel';
import { generateMatchupIntelSummary } from '../../utils/matchupIntelSummary';
import { calculateChemistryScore } from '../../utils/formerTeammates';
import { calcFilmStudy } from '../../utils/filmStudy';
import { RefereeProfileCard } from '../ui/RefereeProfileCard';

export function MatchupCenter({ plays, rosters, initialOff, initialDef, primaryTeam }) {
  const isMobile = useIsMobile();
  const [offTm, setOffTm] = useState(initialOff || primaryTeam || "KC");
  const [defTm, setDefTm] = useState(initialDef || "BUF");
  useEffect(() => { if (initialOff) setOffTm(initialOff); }, [initialOff]);
  useEffect(() => { if (initialDef) setDefTm(initialDef); }, [initialDef]);
  useEffect(() => { if (primaryTeam && !initialOff) setOffTm(primaryTeam); }, [primaryTeam]);
  const [showPlayers, setShowPlayers] = useState(true);
  const [playerSide, setPlayerSide] = useState("off"); // "off" = offTm's offense, "def" = defTm's offense
  const [showThread, setShowThread] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [gameWeek, setGameWeek] = useState(1);
  const os = useMemo(() => agg(plays, offTm), [plays, offTm]);
  const ds = useMemo(() => agg(plays, defTm), [plays, defTm]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const oR = rosters[offTm], dR = rosters[defTm];
  const preview = useMemo(() => matchupPreview(offTm, defTm, os, ds, bl), [offTm, defTm, os, ds, bl]);
  const offScript = useMemo(() => scriptedPlaysPreview(offTm, os, oR), [offTm, os, oR]);
  const defScript = useMemo(() => scriptedPlaysPreview(defTm, agg(plays, defTm), rosters[defTm]), [defTm, plays, rosters]);
  const playerMatchupsOff = useMemo(() => playerMatchupSummary(oR, dR, offTm, defTm), [oR, dR, offTm, defTm]);
  const playerMatchupsDef = useMemo(() => playerMatchupSummary(rosters[defTm], rosters[offTm], defTm, offTm), [rosters, offTm, defTm]);
  const playerMatchups = playerSide === "off" ? playerMatchupsOff : playerMatchupsDef;
  const playerOffLabel = playerSide === "off" ? offTm : defTm;
  const playerDefLabel = playerSide === "off" ? defTm : offTm;
  const grade = useMemo(() => calcMatchupGrade(os, ds, bl), [os, ds, bl]);
  const thread = useMemo(() => generateTweetThread(offTm, defTm, os, ds, bl, grade), [offTm, defTm, os, ds, bl, grade]);
  const revenge = useMemo(() => getRevengeGameSummary(offTm, defTm), [offTm, defTm]);
  const schemeFam = useMemo(() => calcSchemeFamiliarity(offTm, defTm), [offTm, defTm]);
  const coachTree = useMemo(() => calcCoachingTreeOverlap(offTm, defTm), [offTm, defTm]);
  const divFam = useMemo(() => calcDivisionalFamiliarity(offTm, defTm), [offTm, defTm]);
  const envFactors = useMemo(() => calcEnvironmentFactors(defTm, offTm), [defTm, offTm]);
  const faIntel = useMemo(() => getFreeAgentIntel(offTm, defTm), [offTm, defTm]);
  const chemScore = useMemo(() => calculateChemistryScore(offTm, defTm), [offTm, defTm]);
  const filmStudy = useMemo(() => calcFilmStudy(offTm, defTm, gameWeek), [offTm, defTm, gameWeek]);
  const intelSummary = useMemo(() => generateMatchupIntelSummary({
    offTm, defTm, schemeFam, coachTree, divFam, envFactors, revenge, faIntel, chemScore
  }), [offTm, defTm, schemeFam, coachTree, divFam, envFactors, revenge, faIntel, chemScore]);

  const copyTweet = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const downloadText = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -.5 }}>Matchup Preview</h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>A scouting report, not a stat sheet. Filters apply to underlying data.</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        <TeamSelect value={offTm} onChange={setOffTm} label="Offense" />
        <div style={{ fontSize: 24, color: "#94a3b8", fontWeight: 800, paddingBottom: 8 }}>vs</div>
        <TeamSelect value={defTm} onChange={setDefTm} label="Defense" />
        {/* Week selector hidden until 2026 schedule is announced (mid-May) */}
      </div>
      {/* Quick Export Bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => downloadText(`${offTm}_vs_${defTm}_prep.txt`, generatePrepSheet(offTm, defTm, os, ds, bl, grade, oR, dR, playerMatchups))} style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d1117", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          <Mic size={14} /> Podcast Prep
        </button>
        <button onClick={() => setShowThread(!showThread)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d1117", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          <Twitter size={14} /> Tweet Thread
        </button>
        <button onClick={() => downloadText(`${offTm}_vs_${defTm}_article.txt`, preview + '\n\n' + offScript + '\n\n' + defScript)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d1117", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          <Download size={14} /> Article Draft
        </button>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}><MarkdownBlock text={preview} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}><MarkdownBlock text={offScript} /></div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}><MarkdownBlock text={defScript} /></div>
      </div>
      {/* Player-Level Matchups — always visible */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Swords size={20} color="#f97316" />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Player-Level Matchups</span>
            </div>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <button onClick={() => setPlayerSide("off")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: playerSide === "off" ? "#f97316" : "#fff", color: playerSide === "off" ? "#fff" : "#64748b" }}>
                {offTm} Offense
              </button>
              <button onClick={() => setPlayerSide("def")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, border: "none", borderLeft: "1px solid #e2e8f0", cursor: "pointer", background: playerSide === "def" ? "#f97316" : "#fff", color: playerSide === "def" ? "#fff" : "#64748b" }}>
                {defTm} Offense
              </button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{tn(playerOffLabel)} offense vs {tn(playerDefLabel)} defense</div>
        </div>
        <div style={{ padding: 24 }}>
          {playerMatchups.map((m, i) => {
            const edge = m.off.rating - m.def.rating;
            const edgeColor = edge > 5 ? "#16a34a" : edge < -5 ? "#dc2626" : "#eab308";
            const edgeLabel = edge > 5 ? "OFF +" + edge : edge < -5 ? "DEF +" + Math.abs(edge) : "EVEN";
            return (
              <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < playerMatchups.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f97316" }}>{m.label}</div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: edgeColor, background: edgeColor + "15", padding: "3px 10px", borderRadius: 8, fontFamily: "monospace" }}>{edgeLabel}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                  <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>OFFENSE</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{m.off.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{m.off.pos} | {m.off.grade} | {m.off.trait}</div>
                    <RatingBar value={m.off.rating} color="#16a34a" />
                  </div>
                  <div style={{ background: "#fef2f2", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>DEFENSE</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{m.def.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{m.def.pos} | {m.def.grade} | {m.def.trait}</div>
                    <RatingBar value={m.def.rating} color="#dc2626" />
                  </div>
                </div>
                <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{m.verdict}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: "#0f172a", borderRadius: 16, padding: 24 }}>
        <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>By the Numbers</h3>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
          {[["Pass Rate", os.pr, ds.dpr, "Throw rate vs pass faced", true], ["Success Rate", os.sr, ds.dsr, "Efficiency vs stinginess", true], ["Explosive Rate", os.xr, ds.dxr, "Big plays vs prevention", true], ["Completion", os.compRate, null, "Pass completion rate", false], ["Sack Rate", os.sackRate, null, "How often QB is sacked", false]].map(([lbl, ov, dv, desc, hasEdge]) => {
            const edgeText = hasEdge && dv !== null ? (ov > dv + 0.02 ? `Edge: ${offTm}` : dv > ov + 0.02 ? `Edge: ${defTm}` : "Even") : null;
            const edgeColor = edgeText?.includes(offTm) ? "#22c55e" : edgeText?.includes(defTm) ? "#f87171" : "#64748b";
            return (
            <div key={lbl} style={{ background: "#1e293b", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>{lbl}</div>
                {edgeText && <span style={{ fontSize: 10, fontWeight: 700, color: edgeColor, background: edgeColor + "20", padding: "2px 8px", borderRadius: 6 }}>{edgeText}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#f97316", fontWeight: 700, fontSize: 20 }}>{pct(ov)}</span>
                {dv !== null && <span style={{ color: "#a855f7", fontWeight: 700, fontSize: 20 }}>{pct(dv)}</span>}
              </div>
              {dv !== null && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 8 }}><span>{offTm} OFF</span><span>{defTm} DEF</span></div>}
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>{desc}</div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Matchup Intelligence */}
      <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
        {/* Intelligence Summary Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: 16, padding: "24px 28px", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🧠</span>
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>Matchup Intelligence</span>
              <span style={{ fontSize: 12, color: "#94a3b8", background: "#ffffff15", padding: "2px 10px", borderRadius: 10 }}>{intelSummary.totalSignals} signal{intelSummary.totalSignals === 1 ? "" : "s"}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {intelSummary.positiveEdges > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#16a34a25", color: "#4ade80" }}>+{intelSummary.positiveEdges} edge{intelSummary.positiveEdges > 1 ? "s" : ""}</span>}
              {intelSummary.negativeEdges > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#dc262625", color: "#f87171" }}>{intelSummary.negativeEdges} risk{intelSummary.negativeEdges > 1 ? "s" : ""}</span>}
              {intelSummary.wildCards > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#f9731625", color: "#fb923c" }}>{intelSummary.wildCards} wild card{intelSummary.wildCards > 1 ? "s" : ""}</span>}
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, marginBottom: intelSummary.edges.length > 0 ? 16 : 0 }}>{intelSummary.narrative}</div>
          {intelSummary.edges.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {intelSummary.edges.slice(0, 4).map((edge, i) => (
                <div key={i} style={{ fontSize: 11, padding: "6px 12px", borderRadius: 8, background: "#ffffff08", border: "1px solid #ffffff15", color: "#e2e8f0" }}>
                  <span style={{ fontWeight: 700, color: edge.impact === "positive" ? "#4ade80" : edge.impact === "negative" ? "#f87171" : edge.impact === "wild_card" ? "#fb923c" : "#94a3b8" }}>{edge.signal}</span>
                  <span style={{ color: "#64748b", marginLeft: 6 }}>·</span>
                  <span style={{ color: "#94a3b8", marginLeft: 6 }}>{edge.detail.length > 60 ? edge.detail.slice(0, 57) + "…" : edge.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divisional Familiarity Banner */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 12, background: divFam.tone === "hot" ? "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)" : divFam.tone === "warm" ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" : "#f8fafc", border: divFam.tone === "hot" ? "1px solid #fca5a5" : divFam.tone === "warm" ? "1px solid #fcd34d" : "1px solid #e2e8f0" }}>
          <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 6, background: divFam.tone === "hot" ? "#dc2626" : divFam.tone === "warm" ? "#f59e0b" : "#94a3b8", color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>{divFam.badge}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{divFam.relationship}</span>
          {divFam.gamesPerYear >= 2 && <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>2x per season</span>}
          <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>Familiarity: <strong style={{ color: divFam.tone === "hot" ? "#dc2626" : divFam.tone === "warm" ? "#d97706" : "#64748b" }}>{divFam.familiarity}</strong></span>
        </div>

        {/* Scheme Familiarity */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Shield size={20} color="#2563eb" />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Scheme Familiarity</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Score</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: schemeFam.tone === "positive" ? "#16a34a" : schemeFam.tone === "warning" ? "#f97316" : "#2563eb", fontFamily: "monospace" }}>{schemeFam.score}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: schemeFam.tone === "positive" ? "#f0fdf4" : schemeFam.tone === "warning" ? "#fff7ed" : "#eff6ff", color: schemeFam.tone === "positive" ? "#16a34a" : schemeFam.tone === "warning" ? "#ea580c" : "#2563eb" }}>{schemeFam.label}</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{tn(offTm)} offense vs {tn(defTm)} defense</span>
          </div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{schemeFam.narrative}</div>
        </div>

        {/* Coaching Tree Overlap */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <GitBranch size={20} color="#8b5cf6" />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Coaching Tree</span>
            </div>
            {coachTree.overlapScore > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Overlap</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: coachTree.overlapScore >= 70 ? "#8b5cf6" : "#94a3b8", fontFamily: "monospace" }}>{coachTree.overlapScore}</div>
              </div>
            )}
          </div>
          {coachTree.sharedTrees.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {coachTree.sharedTrees.map((tree, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#f5f3ff", color: "#7c3aed" }}>{tree.name} Tree</span>
              ))}
            </div>
          )}
          {coachTree.details && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{tn(offTm)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{coachTree.details.team1.hc}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>OC: {coachTree.details.team1.oc}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>DC: {coachTree.details.team1.dc}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>{coachTree.details.team1.style}</div>
              </div>
              <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{tn(defTm)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{coachTree.details.team2.hc}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>OC: {coachTree.details.team2.oc}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>DC: {coachTree.details.team2.dc}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>{coachTree.details.team2.style}</div>
              </div>
            </div>
          )}
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{coachTree.narrative}</div>
        </div>

        {/* Environment Factors */}
        {envFactors.factors.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🏟️</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Environment</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{envFactors.homeCity}</span>
                {envFactors.dome && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "#dbeafe", color: "#2563eb" }}>DOME</span>}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: envFactors.surface === "grass" ? "#dcfce7" : "#f1f5f9", color: envFactors.surface === "grass" ? "#16a34a" : "#64748b" }}>{envFactors.surface.toUpperCase()}</span>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              {envFactors.factors.filter(f => f.severity !== "low").map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: f.severity === "high" ? "#fef2f2" : "#f8fafc", borderRadius: 10, border: `1px solid ${f.severity === "high" ? "#fca5a5" : "#f1f5f9"}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: f.severity === "high" ? "#dc2626" : "#f59e0b", color: "#fff", textTransform: "uppercase", flexShrink: 0, marginTop: 2 }}>{f.severity}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{f.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{envFactors.narrative}</div>
          </div>
        )}

        {/* Film Study / Scheme Age */}
        {filmStudy.factors.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🎬</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Film Study</span>
                <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "2px 10px", borderRadius: 10 }}>Week {gameWeek}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: filmStudy.filmVolume === "None" || filmStudy.filmVolume === "Minimal" ? "#fef2f2" : filmStudy.filmVolume === "Limited" ? "#fff7ed" : "#f0fdf4", color: filmStudy.filmVolume === "None" || filmStudy.filmVolume === "Minimal" ? "#dc2626" : filmStudy.filmVolume === "Limited" ? "#ea580c" : "#16a34a" }}>{filmStudy.filmVolume} Film</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#eff6ff", color: "#2563eb" }}>{filmStudy.installationAge.label}</span>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              {filmStudy.factors.filter(f => f.severity !== "low").map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: f.severity === "high" ? "#fef2f2" : "#f8fafc", borderRadius: 10, border: `1px solid ${f.severity === "high" ? "#fca5a5" : "#f1f5f9"}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: f.severity === "high" ? "#dc2626" : "#f59e0b", color: "#fff", textTransform: "uppercase", flexShrink: 0, marginTop: 2 }}>{f.severity}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{f.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{filmStudy.narrative}</div>
          </div>
        )}

        {/* Free Agent Intelligence */}
        {faIntel.total > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ArrowRightLeft size={20} color="#0891b2" />
                <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Free Agent Intel</span>
                <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "2px 10px", borderRadius: 10 }}>{faIntel.total} move{faIntel.total === 1 ? "" : "s"}</span>
              </div>
              {faIntel.intelScore > 0 && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Intel Value</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: faIntel.intelScore >= 70 ? "#0891b2" : faIntel.intelScore >= 40 ? "#f97316" : "#94a3b8", fontFamily: "monospace" }}>{faIntel.intelScore}</div>
                </div>
              )}
            </div>
            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              {faIntel.moves.map((move, i) => {
                const tierColor = move.intelTier === "ELITE" ? "#0891b2" : move.intelTier === "HIGH" ? "#f97316" : "#94a3b8";
                return (
                  <div key={i} style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{move.player}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{move.position} · {tn(move.from)} → {tn(move.to)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: tierColor + "15", color: tierColor, textTransform: "uppercase", letterSpacing: 0.5 }}>{move.intelTier}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: tierColor, fontFamily: "monospace" }}>{move.intelScore}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{move.narrative}</div>
                    {move.deal && <div style={{ fontSize: 11, color: "#0891b2", marginTop: 4 }}>Deal: {move.deal}</div>}
                  </div>
                );
              })}
            </div>
            {faIntel.narrative && <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{faIntel.narrative}</div>}
          </div>
        )}

        {/* Revenge Games */}
        {revenge.total > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Flame size={20} color="#dc2626" />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{revenge.headline}</span>
              <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "2px 10px", borderRadius: 10 }}>{revenge.total} total</span>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {revenge.games.slice(0, 4).map((rg, i) => {
                const sentColor = rg.sentiment === "GRUDGE" ? "#dc2626" : rg.sentiment === "MOTIVATED" ? "#f97316" : rg.sentiment === "GRATEFUL" ? "#16a34a" : "#94a3b8";
                return (
                  <div key={i} style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{rg.player}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{rg.position} · {rg.currentTeam}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: sentColor + "15", color: sentColor, textTransform: "uppercase", letterSpacing: 0.5 }}>{rg.sentiment}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: rg.intensity >= 50 ? "#dc2626" : "#94a3b8", fontFamily: "monospace" }}>{rg.intensity}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{rg.narrative}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Former Teammates */}
        <FormerTeammatesCard team1={offTm} team2={defTm} />

        {/* Referee Crew Profiles */}
        <RefereeProfileCard />
      </div>

      {/* Content Export Tools */}
      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <button onClick={() => downloadText(`prep-sheet-${offTm}-vs-${defTm}.txt`, generatePrepSheet(offTm, defTm, os, ds, bl, grade, oR, dR, playerMatchups))} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 700, color: "#0f172a", cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}>
          <Mic size={16} /> Podcast Prep Sheet
          <Download size={13} style={{ opacity: 0.5 }} />
        </button>
        <button onClick={() => downloadText(`newsletter-${offTm}-vs-${defTm}.md`, generateNewsletterDraft(offTm, defTm, os, ds, bl, grade, oR, dR))} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 700, color: "#0f172a", cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}>
          <FileText size={16} /> Newsletter Draft
          <Download size={13} style={{ opacity: 0.5 }} />
        </button>
        <button onClick={() => downloadText(`article-${offTm}-vs-${defTm}.txt`, generateArticle(offTm, defTm, os, ds, bl, grade, oR, dR))} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 700, color: "#0f172a", cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}>
          <PenLine size={16} /> Article (~300 words)
          <Download size={13} style={{ opacity: 0.5 }} />
        </button>
      </div>

      {/* Tweet Thread Generator */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginTop: 20 }}>
        <button onClick={() => setShowThread(!showThread)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", borderBottom: showThread ? "1px solid #e2e8f0" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Twitter size={20} color="#1d9bf0" />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Generate Tweet Thread</span>
            <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "2px 10px", borderRadius: 10 }}>5 tweets</span>
          </div>
          {showThread ? <ChevronDown size={20} color="#94a3b8" /> : <ChevronRight size={20} color="#94a3b8" />}
        </button>
        {showThread && (
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>Ready to post. Copy each tweet individually or copy all at once.</div>
              <button onClick={() => copyTweet(thread.join("\n\n---\n\n"), -1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: copiedIdx === -1 ? "#f0fdf4" : "#fff", fontSize: 12, fontWeight: 600, color: copiedIdx === -1 ? "#16a34a" : "#64748b", cursor: "pointer" }}>
                {copiedIdx === -1 ? <Check size={13} /> : <Copy size={13} />}
                {copiedIdx === -1 ? "Copied!" : "Copy All"}
              </button>
            </div>
            {thread.map((tweet, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1d9bf0", fontFamily: "monospace" }}>Tweet {i + 1}/5</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: tweet.length > 280 ? "#dc2626" : "#94a3b8", fontFamily: "monospace" }}>{tweet.length}/280</span>
                    <button onClick={() => copyTweet(tweet, i)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: copiedIdx === i ? "#f0fdf4" : "#fff", fontSize: 11, fontWeight: 600, color: copiedIdx === i ? "#16a34a" : "#64748b", cursor: "pointer" }}>
                      {copiedIdx === i ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: "#0f172a", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{tweet}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
