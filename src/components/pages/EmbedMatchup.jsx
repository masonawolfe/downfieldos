import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Swords } from "lucide-react";
import { agg, lgbl } from '../../utils/aggregation';
import { calcMatchupGrade } from '../../utils/grading';
import { pct } from '../../utils/formatters';

/**
 * Embeddable matchup grade card at /embed/matchup/{TEAM1}-{TEAM2}
 * Minimal, self-contained widget designed for iframe embedding.
 * No sidebar, no nav — just the matchup card with DownfieldOS branding.
 */
export function EmbedMatchup({ plays }) {
  const { matchup } = useParams();
  const parts = matchup?.split("-") || [];
  const off = parts[0]?.toUpperCase() || "CHI";
  const def = parts[1]?.toUpperCase() || "DET";

  const oStats = useMemo(() => agg(plays, off), [plays, off]);
  const dStats = useMemo(() => agg(plays, def), [plays, def]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const grade = useMemo(() => calcMatchupGrade(oStats, dStats, bl), [oStats, dStats, bl]);

  const gradeColor = {
    "A+": "#16a34a", "A": "#16a34a", "B+": "#2563eb", "B": "#2563eb",
    "C": "#ea580c", "D": "#dc2626", "F": "#dc2626",
  }[grade] || "#ea580c";

  const gradeBg = {
    "A+": "#f0fdf4", "A": "#f0fdf4", "B+": "#eff6ff", "B": "#eff6ff",
    "C": "#fff7ed", "D": "#fef2f2", "F": "#fef2f2",
  }[grade] || "#fff7ed";

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", maxWidth: 400, margin: "0 auto", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <div style={{ background: "#0d1117", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Swords size={16} color="#f97316" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>Matchup Preview</span>
          </div>
          <a href="https://downfieldos.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#64748b", textDecoration: "none", fontWeight: 600 }}>
            DownfieldOS
          </a>
        </div>

        {/* Matchup */}
        <div style={{ padding: "20px 20px 16px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", fontFamily: "monospace" }}>{off}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>@</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", fontFamily: "monospace" }}>{def}</div>
          </div>

          {/* Grade */}
          <div style={{ margin: "16px 0", display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 20px", background: gradeBg, borderRadius: 12, border: `1px solid ${gradeColor}20` }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: gradeColor, fontFamily: "monospace" }}>{grade}</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Matchup Grade</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{off} offense vs {def} defense</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <StatRow label="Success Rate" offVal={pct(oStats.sr)} defVal={pct(dStats.dsr)} />
          <StatRow label="Explosive Rate" offVal={pct(oStats.xr)} defVal={pct(dStats.dxr)} />
          <StatRow label="Pass Rate" offVal={pct(oStats.pr)} defVal={pct(dStats.dpr)} />
          <StatRow label="Plays" offVal={oStats.n?.toLocaleString()} defVal={dStats.n?.toLocaleString()} />
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Powered by DownfieldOS</span>
          <a href={`https://downfieldos.com/matchup/${off.toLowerCase()}-vs-${def.toLowerCase()}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#f97316", fontWeight: 700, textDecoration: "none" }}>
            Full Analysis →
          </a>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, offVal, defVal }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", background: "#f8fafc", borderRadius: 6, fontSize: 12 }}>
        <span style={{ color: "#64748b", fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#0f172a", fontWeight: 800, fontFamily: "monospace" }}>{offVal}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", background: "#f8fafc", borderRadius: 6, fontSize: 12 }}>
        <span style={{ color: "#64748b", fontWeight: 600 }}>vs</span>
        <span style={{ color: "#0f172a", fontWeight: 800, fontFamily: "monospace" }}>{defVal}</span>
      </div>
    </>
  );
}
