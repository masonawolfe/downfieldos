import { useState } from "react";
import { Newspaper, Twitter, Check, ArrowUpRight, Briefcase, AlertTriangle, Mic, FileText } from "lucide-react";
import teamNewsData from '../../data/intelligence/team_news.json';
import { tn } from '../../utils/formatters';

const KIND_META = {
  signing:   { label: "Signing",   color: "#16a34a", icon: Briefcase },
  trade:     { label: "Trade",     color: "#2563eb", icon: ArrowUpRight },
  departure: { label: "Departure", color: "#dc2626", icon: ArrowUpRight },
  injury:    { label: "Injury",    color: "#dc2626", icon: AlertTriangle },
  coaching:  { label: "Coaching",  color: "#7c3aed", icon: Mic },
  narrative: { label: "Narrative", color: "#f97316", icon: FileText },
};

function fmtDate(iso) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

export function TeamNewsCard({ team }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const items = teamNewsData?.teams?.[team] || [];

  if (!items.length) return null;

  const copyAsTweet = (item, idx) => {
    const text = `${item.headline}\n\n— ${tn(team)} via DownfieldOS\n\ndownfieldos.com/team/${team}`;
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Newspaper size={18} color="#f97316" />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Latest News</h3>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
          {teamNewsData.season_context?.replace(/_/g, " ") || "Recent"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => {
          const meta = KIND_META[item.kind] || KIND_META.narrative;
          const Icon = meta.icon;
          const copied = copiedIdx === i;
          return (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: meta.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={14} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: meta.color }}>{meta.label}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{fmtDate(item.date)}</span>
                </div>
                <div style={{ fontSize: 14, color: "#0f172a", lineHeight: 1.5 }}>{item.headline}</div>
              </div>
              <button
                onClick={() => copyAsTweet(item, i)}
                title="Copy as tweet"
                style={{ flexShrink: 0, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4, background: copied ? "#16a34a15" : "#fff", border: `1px solid ${copied ? "#16a34a" : "#e2e8f0"}`, borderRadius: 8, padding: "6px 10px", color: copied ? "#16a34a" : "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                aria-label={copied ? "Copied" : "Copy as tweet"}
              >
                {copied ? <><Check size={12} /> Copied</> : <><Twitter size={12} /> Tweet</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
