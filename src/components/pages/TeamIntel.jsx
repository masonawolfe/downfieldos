import { useState, useMemo, useEffect } from "react";
import { DNA } from '../../data/dna';
import { agg, lgbl } from '../../utils/aggregation';
import { pct, tn } from '../../utils/formatters';
import { teamSoWhat } from '../../utils/narratives';
import { PlayerLink } from '../ui/PlayerLink';
import { downloadCSV } from '../../utils/csvExport';
import { calcRosterFragility } from '../../utils/rosterFragility';
import { TeamSelect } from '../ui/TeamSelect';
import { ExportButton } from '../ui/ExportButton';
import { ContractYearCard } from '../ui/ContractYearCard';
import { NewsletterCTA } from '../ui/NewsletterCTA';
import { TeamNewsCard } from '../ui/TeamNewsCard';

export function TeamIntel({ plays, rosters, primaryTeam }) {
  const [team, setTeam] = useState(primaryTeam || "KC");
  useEffect(() => { if (primaryTeam) setTeam(primaryTeam); }, [primaryTeam]);
  const stats = useMemo(() => agg(plays, team), [plays, team]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const overview = useMemo(() => teamSoWhat(team, stats, bl), [team, stats, bl]);
  const roster = rosters[team];
  const fragility = useMemo(() => calcRosterFragility(roster), [roster]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -.5 }}>Team Intel</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Everything you need to know. Filters apply to all metrics.</p>
        </div>
        <ExportButton label="Export Roster" onClick={() => {
          const headers = ["Unit", "Position", "Player", "Grade", "Rating", "Trait"];
          const rows = [
            ...roster.offense.map(p => ["Offense", p.pos, p.name, p.grade, p.rating, p.trait]),
            ...roster.defense.map(p => ["Defense", p.pos, p.name, p.grade, p.rating, p.trait]),
          ];
          downloadCSV(`${team}-roster`, headers, rows);
        }} />
      </div>
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
      <TeamNewsCard team={team} />
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>The Scouting Report</h3>
        <div style={{ fontSize: 15, lineHeight: 1.8, color: "#334155", whiteSpace: "pre-wrap" }}>{overview}</div>
      </div>
      {/* Roster Fragility Score */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Roster Fragility</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: fragility.grade === "A" ? "#16a34a" : fragility.grade === "B" ? "#22c55e" : fragility.grade === "C" ? "#eab308" : fragility.grade === "D" ? "#f97316" : "#dc2626", fontFamily: "monospace" }}>{fragility.grade}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>({fragility.score}/100)</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
          How much does it hurt when a starter goes down? Higher score = more fragile.
        </div>
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ height: "100%", width: `${fragility.score}%`, borderRadius: 4, background: fragility.score >= 65 ? "#dc2626" : fragility.score >= 50 ? "#eab308" : "#16a34a", transition: "width 0.5s" }} />
        </div>
        {fragility.vulnerable.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Most Vulnerable</div>
            {fragility.vulnerable.map((v, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", fontFamily: "monospace", marginRight: 8 }}>{v.position}</span>
                  <span style={{ fontSize: 13, color: "#334155" }}>{v.starter} ({v.starterRating})</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}> → {v.backup} ({v.backupRating})</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>-{v.delta}</span>
              </div>
            ))}
          </div>
        )}
        {fragility.resilient.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Most Resilient</div>
            {fragility.resilient.map((v, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", fontFamily: "monospace", marginRight: 8 }}>{v.position}</span>
                  <span style={{ fontSize: 13, color: "#334155" }}>{v.starter} ({v.starterRating})</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}> → {v.backup} ({v.backupRating})</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>-{v.delta}</span>
              </div>
            ))}
          </div>
        )}
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
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}><PlayerLink player={p} team={team}>{p.name}</PlayerLink></div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.trait}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Contract Year Players for this team */}
      <div style={{ marginTop: 16 }}>
        <ContractYearCard filterTeam={team} compact />
      </div>
      <NewsletterCTA />
    </div>
  );
}
