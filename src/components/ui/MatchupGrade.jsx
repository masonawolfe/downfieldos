export function MatchupGrade({ grade }) {
  const config = {
    "A+": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    "A": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    "B+": { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    "B": { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    "C": { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
    "D": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    "F": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };
  const c = config[grade] || config["C"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontWeight: 900, fontSize: 14, fontFamily: "monospace" }}>{grade}</span>
  );
}
