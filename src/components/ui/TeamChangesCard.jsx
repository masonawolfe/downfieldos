import { ArrowUpRight, AlertTriangle, HeartPulse, ListOrdered, TrendingUp, TrendingDown, Repeat } from "lucide-react";
import teamChanges from '../../data/intelligence/team_changes_2026.json';
import { AsOf } from './AsOf';

// Team news plan step 5 (2026-11-19, Mason: "Yeah, build our own team
// news"). What changed for a team, built by scripts/build-team-changes.js
// from our own data: injury reports, reserve lists, roster moves, the depth
// chart and target counts. Each item prints its own sentence, which is
// written in words by the build; the raw position code is never printed.
// The card's date is the file's own label, through AsOf. A team with no
// items shows no card, since an empty box reads as broken.

const DETAIL_META = {
  out:          { label: "Injury report", color: "#dc2626", icon: AlertTriangle },
  doubtful:     { label: "Injury report", color: "#dc2626", icon: AlertTriangle },
  questionable: { label: "Injury report", color: "#ea580c", icon: AlertTriangle },
  reserve:      { label: "Reserve list",  color: "#dc2626", icon: AlertTriangle },
  back:         { label: "Return",        color: "#16a34a", icon: HeartPulse },
  activated:    { label: "Return",        color: "#16a34a", icon: HeartPulse },
  signed:       { label: "Roster move",   color: "#2563eb", icon: ArrowUpRight },
  released:     { label: "Roster move",   color: "#2563eb", icon: ArrowUpRight },
  traded_in:    { label: "Roster move",   color: "#2563eb", icon: Repeat },
  traded_out:   { label: "Roster move",   color: "#2563eb", icon: Repeat },
  new_starter:  { label: "Depth chart",   color: "#7c3aed", icon: ListOrdered },
  role_up:      { label: "Role",          color: "#16a34a", icon: TrendingUp },
  role_down:    { label: "Role",          color: "#ea580c", icon: TrendingDown },
};

export function TeamChangesCard({ team }) {
  const items = teamChanges?.teams?.[team] || [];
  if (!items.length) return null;

  return (
    <div data-card="team-changes" style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>What changed</h3>
        <AsOf meta={teamChanges?.meta} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => {
          const meta = DETAIL_META[item.detail] || DETAIL_META.signed;
          const Icon = meta.icon;
          return (
            <div key={`${item.gsis_id}-${item.detail}`} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: meta.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={14} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: meta.color }}>{meta.label}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Week {item.week}</span>
                </div>
                <div style={{ fontSize: 14, color: "#0f172a", lineHeight: 1.5 }}>{item.sentence}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 12, lineHeight: 1.5 }}>
        Built from injury reports, reserve lists, roster moves and the depth chart in our own data. Role changes count targets only.
      </div>
    </div>
  );
}
