export function InsightCard({ headline, body, icon: Icon, tone = "neutral", stat }) {
  const colors = { positive: { bg: "#f0fdf4", border: "#bbf7d0", accent: "#16a34a" }, negative: { bg: "#fef2f2", border: "#fecaca", accent: "#dc2626" }, warning: { bg: "#fff7ed", border: "#fed7aa", accent: "#ea580c" }, neutral: { bg: "#f8fafc", border: "#e2e8f0", accent: "#475569" }, elite: { bg: "#eff6ff", border: "#bfdbfe", accent: "#2563eb" } };
  const c = colors[tone] || colors.neutral;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {Icon && <div style={{ marginTop: 2 }}><Icon size={20} color={c.accent} /></div>}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{headline}</div>
            {stat && <div style={{ fontSize: 24, fontWeight: 900, color: c.accent, fontFamily: "monospace", whiteSpace: "nowrap" }}>{stat}</div>}
          </div>
          <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{body}</div>
        </div>
      </div>
    </div>
  );
}
