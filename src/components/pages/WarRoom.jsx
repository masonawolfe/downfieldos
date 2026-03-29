import { useState, useMemo, useEffect } from "react";
import { Shield, Star, GraduationCap, Target } from "lucide-react";
import { agg, lgbl } from '../../utils/aggregation';
import { teamSoWhat, gmVoice, genNeeds } from '../../utils/narratives';
import { tn } from '../../utils/formatters';
import { TeamSelect } from '../ui/TeamSelect';
import { MarkdownBlock } from '../ui/MarkdownBlock';
import { NewsletterCTA } from '../ui/NewsletterCTA';
import { DRAFT_NEEDS_2026 } from '../../data/draftNeeds2026';
import draftProspects from '../../data/draftProspects2026.json';

export function WarRoom({ plays, primaryTeam }) {
  const [team, setTeam] = useState(primaryTeam || "CAR");
  useEffect(() => { if (primaryTeam) setTeam(primaryTeam); }, [primaryTeam]);
  const stats = useMemo(() => agg(plays, team), [plays, team]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const needs = useMemo(() => genNeeds(team, stats, bl), [team, stats, bl]);
  const gm = useMemo(() => gmVoice(team, stats, bl, needs), [team, stats, bl, needs]);
  const overview = useMemo(() => teamSoWhat(team, stats, bl), [team, stats, bl]);

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -.5 }}>Offseason War Room</h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>What would the GM say?</p>
      <TeamSelect value={team} onChange={setTeam} label="Team" />
      <div style={{ marginTop: 20, background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Season Assessment</h3>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#334155", whiteSpace: "pre-wrap" }}>{overview}</div>
      </div>
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}><Shield size={20} color="#f97316" /> GM's Take</h3>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#cbd5e1", whiteSpace: "pre-wrap" }}>{gm.replace(/\*\*(.*?)\*\*/g, (m, p) => p).replace(/\*(.*?)\*/g, (m, p) => p)}</div>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Draft Needs</h3>
      {needs.map((n, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${n.severity === "High" ? "#fecaca" : n.severity === "Medium" ? "#fed7aa" : "#e2e8f0"}`, borderLeft: `4px solid ${n.severity === "High" ? "#dc2626" : n.severity === "Medium" ? "#ea580c" : "#16a34a"}`, padding: 20, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{n.weakness}</span>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, fontWeight: 700, fontFamily: "monospace", background: n.severity === "High" ? "#fef2f2" : n.severity === "Medium" ? "#fff7ed" : "#f0fdf4", color: n.severity === "High" ? "#dc2626" : n.severity === "Medium" ? "#ea580c" : "#16a34a" }}>{n.severity}</span>
          </div>
          <div style={{ fontSize: 14, color: "#ea580c", fontWeight: 600, marginBottom: 4 }}>Target: {n.need}</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Archetype: {n.archetype}</div>
        </div>
      ))}

      <ProspectBoard team={team} />
      <NewsletterCTA />
    </div>
  );
}

/** Draft Prospect Board — matches prospects to team needs */
function ProspectBoard({ team }) {
  const [expanded, setExpanded] = useState(null);
  const teamNeeds = DRAFT_NEEDS_2026[team] || [];

  // Normalize position matching (EDGE matches EDGE/DE, OL matches OT/IOL, DL matches DL/DT)
  const posMatch = (need, pos) => {
    if (need === pos) return true;
    if (need === 'OL' && (pos === 'OT' || pos === 'IOL' || pos === 'OL')) return true;
    if (need === 'DL' && (pos === 'DL' || pos === 'DT')) return true;
    if (need === 'EDGE' && (pos === 'EDGE' || pos === 'DE')) return true;
    return false;
  };

  // Prospects that fit this team's needs, plus any that list this team as a top fit
  const fits = useMemo(() => {
    const matched = new Set();
    const result = [];
    // First: prospects who list this team as a top fit
    draftProspects.forEach(p => {
      if (p.topFitTeams?.includes(team)) { result.push({ ...p, fitType: 'targeted' }); matched.add(p.id); }
    });
    // Second: prospects whose position matches a team need
    teamNeeds.forEach(need => {
      draftProspects.forEach(p => {
        if (!matched.has(p.id) && posMatch(need, p.position)) { result.push({ ...p, fitType: 'positional' }); matched.add(p.id); }
      });
    });
    return result.slice(0, 12); // cap at 12 prospects
  }, [team, teamNeeds]);

  if (!fits.length) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
        <GraduationCap size={20} color="#f97316" /> Draft Prospect Board
      </h3>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
        52 prospects scouted — {fits.length} fit {team}'s needs ({teamNeeds.join(', ')})
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        {fits.map(p => (
          <div key={p.id} onClick={() => setExpanded(expanded === p.id ? null : p.id)} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 16, cursor: "pointer", transition: "all 0.15s", borderLeft: `4px solid ${p.fitType === 'targeted' ? '#f97316' : '#3b82f6'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{p.position} — {p.school}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", fontFamily: "monospace" }}>Rd {p.projectedRound}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{p.projectedPick}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>{p.summary?.substring(0, 120)}{p.summary?.length > 120 ? '...' : ''}</div>
            {p.comparisonPlayer && <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>Comp: {p.comparisonPlayer}</div>}

            {expanded === p.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                {p.height && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{p.height} / {p.weight} lbs</div>}
                {p.combineMeasurables?.fortyYard && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>40-yard: {p.combineMeasurables.fortyYard}s</div>}
                {p.strengths?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#16a34a", textTransform: "uppercase", marginBottom: 4 }}>Strengths</div>
                    {p.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: "#475569", paddingLeft: 8 }}>+ {s}</div>)}
                  </div>
                )}
                {p.risks?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#dc2626", textTransform: "uppercase", marginBottom: 4 }}>Risks</div>
                    {p.risks.map((r, i) => <div key={i} style={{ fontSize: 12, color: "#475569", paddingLeft: 8 }}>- {r}</div>)}
                  </div>
                )}
                {p.collegeStats && (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                    {p.collegeStats.completionPct && <MiniStat label="COMP%" value={`${p.collegeStats.completionPct}%`} />}
                    {p.collegeStats.passingYards && <MiniStat label="PASS YDS" value={p.collegeStats.passingYards.toLocaleString()} />}
                    {p.collegeStats.passingTDs && <MiniStat label="TD" value={p.collegeStats.passingTDs} />}
                    {p.collegeStats.rushingYards && <MiniStat label="RUSH YDS" value={p.collegeStats.rushingYards.toLocaleString()} />}
                    {p.collegeStats.tackles && <MiniStat label="TKL" value={p.collegeStats.tackles} />}
                    {p.collegeStats.sacks && <MiniStat label="SACKS" value={p.collegeStats.sacks} />}
                    {p.collegeStats.interceptions != null && p.position !== 'QB' && <MiniStat label="INT" value={p.collegeStats.interceptions} />}
                    {p.collegeStats.receptions && <MiniStat label="REC" value={p.collegeStats.receptions} />}
                    {p.collegeStats.receivingYards && <MiniStat label="REC YDS" value={p.collegeStats.receivingYards.toLocaleString()} />}
                  </div>
                )}
                {p.fitReason && <div style={{ fontSize: 12, color: "#f97316", fontWeight: 600, marginTop: 8 }}>{p.fitReason}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ textAlign: "center", minWidth: 48 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 8, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
