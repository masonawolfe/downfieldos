import { useState, useMemo, useEffect } from "react";
import { DNA } from '../../data/dna';
import { agg, lgbl } from '../../utils/aggregation';
import { pct, tn } from '../../utils/formatters';
import { teamSoWhat } from '../../utils/narratives';
import { TeamSelect } from '../ui/TeamSelect';

export function TeamIntel({ plays, rosters, primaryTeam }) {
  const [team, setTeam] = useState(primaryTeam || "KC");
  useEffect(() => { if (primaryTeam) setTeam(primaryTeam); }, [primaryTeam]);
  const stats = useMemo(() => agg(plays, team), [plays, team]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const overview = useMemo(() => teamSoWhat(team, stats, bl), [team, stats, bl]);
  const roster = rosters[team];

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -.5 }}>Team Intel</h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Everything you need to know. Filters apply to all metrics.</p>
      <TeamSelect value={team} onChange={setTeam} label="Team" />
      <div style={{ marginTop: 20, background: "#0f172a", borderRadius: 16, padding: 24, marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ background: "#1e293b", borderRadius: 14, width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{team}</span>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{tn(team)}</div>
          <div style={{ fontSize: 15, color: "#f97316", fontWeight: 600 }}>{DNA[team].s}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Comp: {pct(stats.compRate)} | Sack: {pct(stats.sackRate)} | {stats.n.toLocaleString()} plays</div>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>The Scouting Report</h3>
        <div style={{ fontSize: 15, lineHeight: 1.8, color: "#334155", whiteSpace: "pre-wrap" }}>{overview}</div>
      </div>
      {[["Offense", roster.offense], ["Defense", roster.defense]].map(([unit, players]) => (
        <div key={unit} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>{unit}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {players.map((p, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: 12, border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", fontFamily: "monospace" }}>{p.pos}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.grade === "Elite" ? "#2563eb" : p.grade === "Above Avg" ? "#16a34a" : "#64748b" }}>{p.grade} ({p.rating})</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.trait}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
