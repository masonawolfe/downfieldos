import { T } from '../../data/teams';

export function TeamSelect({ value, onChange, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
        {T.map(t => <option key={t.a} value={t.a}>{t.a} — {t.n}</option>)}
      </select>
    </div>
  );
}
