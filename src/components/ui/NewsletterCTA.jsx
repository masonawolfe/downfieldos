import { Mail } from "lucide-react";

export function NewsletterCTA() {
  return (
    <div style={{
      background: "#0d1117",
      borderRadius: 14,
      padding: "20px 24px",
      marginTop: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Mail size={18} color="#f97316" />
        <span style={{ fontSize: 14, color: "#c9d1d9", fontWeight: 500 }}>
          Get this analysis delivered weekly
        </span>
      </div>
      <a
        href="https://the-audible.beehiiv.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#f97316",
          textDecoration: "none",
          padding: "8px 16px",
          border: "1px solid #f9731640",
          borderRadius: 8,
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.target.style.background = "#f97316"; e.target.style.color = "#fff"; e.target.style.borderColor = "#f97316"; }}
        onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#f97316"; e.target.style.borderColor = "#f9731640"; }}
      >
        Subscribe to The Audible →
      </a>
    </div>
  );
}
