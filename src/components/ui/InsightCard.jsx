import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function InsightCard({ headline, body, icon: Icon, tone = "neutral", stat }) {
  const [copied, setCopied] = useState(false);
  const colors = { positive: { bg: "#f0fdf4", border: "#bbf7d0", accent: "#16a34a" }, negative: { bg: "#fef2f2", border: "#fecaca", accent: "#dc2626" }, warning: { bg: "#fff7ed", border: "#fed7aa", accent: "#ea580c" }, neutral: { bg: "#f8fafc", border: "#e2e8f0", accent: "#475569" }, elite: { bg: "#eff6ff", border: "#bfdbfe", accent: "#2563eb" } };
  const c = colors[tone] || colors.neutral;

  const handleShare = async () => {
    const text = `${headline}\n\n${typeof body === 'string' ? body : ''}\n\n— via DownfieldOS (downfieldos.com)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <article role="article" style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: 20, marginBottom: 12, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {Icon && <div style={{ marginTop: 2 }}><Icon size={20} color={c.accent} aria-hidden="true" /></div>}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4, margin: 0 }}>{headline}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {stat && <div style={{ fontSize: 24, fontWeight: 900, color: c.accent, fontFamily: "monospace", whiteSpace: "nowrap" }}>{stat}</div>}
              <button
                onClick={handleShare}
                title={copied ? "Copied!" : "Copy to share"}
                aria-label="Copy insight to clipboard"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: copied ? "#16a34a" : "#94a3b8", transition: "color 0.15s" }}
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
              </button>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{body}</div>
        </div>
      </div>
    </article>
  );
}
