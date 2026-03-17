import { useState, useMemo, useEffect } from "react";
import { Shield } from "lucide-react";
import { agg, lgbl } from '../../utils/aggregation';
import { teamSoWhat, gmVoice, genNeeds } from '../../utils/narratives';
import { tn } from '../../utils/formatters';
import { TeamSelect } from '../ui/TeamSelect';
import { MarkdownBlock } from '../ui/MarkdownBlock';

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
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Draft Board</h3>
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
    </div>
  );
}
