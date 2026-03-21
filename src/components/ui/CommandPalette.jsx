import { useState, useEffect, useRef, useMemo } from "react";
import { Search, TrendingUp, Calendar, Star, Swords, Flame, Eye, Shield, Target, Home, ArrowRight } from "lucide-react";
import { T } from '../../data/teams';
import { tn } from '../../utils/formatters';

const MODULES = [
  { icon: Home, label: "Home", path: "/dashboard", keywords: "home dashboard hq" },
  { icon: TrendingUp, label: "2026 Preview", path: "/2026-preview", keywords: "season preview opponents projections roster draft" },
  { icon: Calendar, label: "This Week", path: "/this-week", keywords: "games week schedule matchups" },
  { icon: Star, label: "So What?", path: "/so-what", keywords: "insights headlines sentiment misery" },
  { icon: Swords, label: "Matchup Preview", path: "/matchup-preview", keywords: "matchup scouting intelligence scheme coaching" },
  { icon: Flame, label: "Fantasy Intel", path: "/fantasy-intel", keywords: "fantasy rankings boom bust start sit" },
  { icon: Eye, label: "Team Intel", path: "/team-intel", keywords: "team scouting report players roster grades" },
  { icon: Shield, label: "War Room", path: "/war-room", keywords: "gm draft board war room front office" },
  { icon: Target, label: "Admin", path: "/admin", keywords: "admin post manager instagram" },
];

export function CommandPalette({ isOpen, onClose, navigate, onSelectTeam }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { modules: MODULES.slice(0, 4), teams: [] };

    const modules = MODULES.filter(m =>
      m.label.toLowerCase().includes(q) || m.keywords.includes(q)
    );

    const teams = T.filter(t =>
      t.a.toLowerCase().includes(q) ||
      t.n.toLowerCase().includes(q) ||
      t.d.toLowerCase().includes(q) ||
      t.c.toLowerCase().includes(q)
    ).slice(0, 8);

    return { modules, teams };
  }, [query]);

  if (!isOpen) return null;

  const handleTeamSelect = (team) => {
    onSelectTeam(team);
    navigate("/");
    onClose();
  };

  const handleModuleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9000, backdropFilter: "blur(4px)" }} />
      {/* Palette */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: "min(520px, 90vw)", background: "#161b22", border: "1px solid #30363d", borderRadius: 16, zIndex: 9001, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}>
        {/* Search Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid #21262d" }}>
          <Search size={18} color="#8B949E" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search teams, modules..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 16, fontWeight: 500 }}
          />
          <kbd style={{ background: "#21262d", borderRadius: 4, padding: "2px 6px", fontSize: 11, color: "#8B949E", fontFamily: "monospace" }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px" }}>
          {/* Modules */}
          {results.modules.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: "#484f58", padding: "8px 10px 4px" }}>Modules</div>
              {results.modules.map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.path}
                    onClick={() => handleModuleSelect(m.path)}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: "none", border: "none", borderRadius: 8, color: "#e2e8f0", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#21262d"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <Icon size={16} color="#8B949E" />
                    <span style={{ flex: 1 }}>{m.label}</span>
                    <ArrowRight size={14} color="#484f58" />
                  </button>
                );
              })}
            </>
          )}

          {/* Teams */}
          {results.teams.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: "#484f58", padding: "12px 10px 4px" }}>Teams</div>
              {results.teams.map(t => (
                <button
                  key={t.a}
                  onClick={() => handleTeamSelect(t.a)}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: "none", border: "none", borderRadius: 8, color: "#e2e8f0", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#21262d"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <span style={{ width: 36, fontWeight: 800, color: "#f97316", fontFamily: "monospace" }}>{t.a}</span>
                  <span style={{ flex: 1 }}>{t.n}</span>
                  <span style={{ fontSize: 12, color: "#484f58" }}>{t.d} {t.c}</span>
                </button>
              ))}
            </>
          )}

          {/* No results */}
          {results.modules.length === 0 && results.teams.length === 0 && query && (
            <div style={{ padding: "24px 12px", textAlign: "center", color: "#484f58", fontSize: 14 }}>
              No results for "{query}"
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div style={{ borderTop: "1px solid #21262d", padding: "8px 18px", display: "flex", gap: 16, justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: "#484f58" }}><kbd style={{ background: "#21262d", borderRadius: 3, padding: "1px 4px", fontFamily: "monospace" }}>↵</kbd> select</span>
          <span style={{ fontSize: 11, color: "#484f58" }}><kbd style={{ background: "#21262d", borderRadius: 3, padding: "1px 4px", fontFamily: "monospace" }}>esc</kbd> close</span>
        </div>
      </div>
    </>
  );
}
