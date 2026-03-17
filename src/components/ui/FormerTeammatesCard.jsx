import { useMemo } from 'react';
import { Users, Zap } from 'lucide-react';
import { generateInsights, getDeepestConnections, calculateChemistryScore } from '../../utils/formerTeammates';
import { tn } from '../../utils/formatters';

/**
 * FormerTeammatesCard — shows former teammate connections between two teams.
 * Inline styles to match DownfieldOS codebase pattern (no Tailwind).
 */
export function FormerTeammatesCard({ team1, team2, compact = false }) {
  const insights = useMemo(() => generateInsights(team1, team2), [team1, team2]);
  const topConnections = useMemo(() => getDeepestConnections(team1, team2, 4), [team1, team2]);
  const chemScore = useMemo(() => calculateChemistryScore(team1, team2), [team1, team2]);
  const hasConnections = insights.stats?.total_connections > 0;

  if (!hasConnections) {
    if (compact) return null;
    return (
      <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={16} color="#94a3b8" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>No former teammate connections between {tn(team1)} and {tn(team2)}</span>
        </div>
      </div>
    );
  }

  const durationStyle = (d) => {
    if (d === "deep") return { background: "#f97316", color: "#fff" };
    if (d === "moderate") return { background: "#fb923c33", color: "#ea580c" };
    return { background: "#f1f5f9", color: "#64748b" };
  };

  if (compact) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "#fff7ed", border: "1px solid #fed7aa" }}>
        <Users size={13} color="#f97316" />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#ea580c" }}>
          {insights.stats?.total_connections} Former Teammate{insights.stats?.total_connections === 1 ? "" : "s"}
        </span>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", padding: "20px 24px", borderBottom: "1px solid #fed7aa" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={20} color="#f97316" />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Former Teammates</span>
            <span style={{ fontSize: 12, color: "#94a3b8", background: "#fff", padding: "2px 10px", borderRadius: 10 }}>{insights.stats?.total_connections} connection{insights.stats?.total_connections === 1 ? "" : "s"}</span>
          </div>
          {chemScore > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Chemistry</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: chemScore >= 60 ? "#16a34a" : chemScore >= 30 ? "#f97316" : "#64748b", fontFamily: "monospace" }}>{chemScore}</div>
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{insights.narrative}</div>
      </div>

      {/* Bullet points */}
      {insights.bullet_points.length > 0 && (
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
          {insights.bullet_points.map((point, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i < insights.bullet_points.length - 1 ? 6 : 0 }}>
              <Zap size={12} color="#f97316" style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#334155" }}>{point}</span>
            </div>
          ))}
        </div>
      )}

      {/* Top connections */}
      {topConnections.length > 0 && (
        <div style={{ padding: "16px 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Key Connections</div>
          <div style={{ display: "grid", gap: 8 }}>
            {topConnections.map((conn, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                    {conn.player_1_name} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({conn.player_1_position})</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    ↔ {conn.player_2_name} <span style={{ color: "#94a3b8" }}>({conn.player_2_position})</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {conn.teams?.join(", ")}{conn.same_position_group ? " · Same position room" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, ...durationStyle(conn.overlap_duration) }}>
                    {conn.overlap_duration}
                  </span>
                  {conn.years_since_overlap != null && (
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{conn.years_since_overlap}y ago</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
