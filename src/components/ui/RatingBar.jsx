export function RatingBar({ value, max = 100, label, color }) {
  const pctVal = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (pctVal >= 90 ? "#2563eb" : pctVal >= 78 ? "#16a34a" : pctVal >= 65 ? "#eab308" : "#dc2626");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      {label && <span style={{ fontSize: 11, color: "#64748b", minWidth: 24, fontFamily: "monospace" }}>{label}</span>}
      <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pctVal}%`, height: "100%", background: barColor, borderRadius: 3, transition: "width .3s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: barColor, minWidth: 24, textAlign: "right", fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}
