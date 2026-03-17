import { Download } from "lucide-react";

export function ExportButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 14px", borderRadius: 8,
        border: "1px solid #e2e8f0", background: "#fff",
        fontSize: 12, fontWeight: 600, color: "#64748b",
        cursor: "pointer", transition: "all .15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
    >
      <Download size={13} />
      {label || "Export CSV"}
    </button>
  );
}
