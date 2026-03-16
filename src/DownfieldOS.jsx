import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Zap, Target, TrendingUp, Calendar, Star, Swords,
  Flame, Eye, Shield, Filter, Menu
} from "lucide-react";
import { useIsMobile } from './hooks/useIsMobile';
import { T } from './data/teams';
import { DEFAULT_FILTERS, applyFilters } from './utils/filters';
import { generatePlays } from './utils/playGenerator';
import { genRoster } from './utils/roster';
import { lgbl } from './utils/aggregation';
import { sr } from './utils/rng';
import { NavItem, FilterPanel, InstaPostCard } from './components/ui';
import { Season2026 } from './components/pages/Season2026';
import { ThisWeek } from './components/pages/ThisWeek';
import { SoWhatDashboard } from './components/pages/SoWhatDashboard';
import { MatchupCenter } from './components/pages/MatchupCenter';
import { FantasyIntel } from './components/pages/FantasyIntel';
import { TeamIntel } from './components/pages/TeamIntel';
import { WarRoom } from './components/pages/WarRoom';
import { AdminPanel } from './components/pages/AdminPanel';
import { Chatbot } from './components/pages/Chatbot';

const MODULES = [
  { id: "season2026", label: "2026 Preview", icon: TrendingUp },
  { id: "thisweek", label: "This Week", icon: Calendar },
  { id: "dashboard", label: "So What?", icon: Star },
  { id: "matchup", label: "Matchup Preview", icon: Swords },
  { id: "fantasy", label: "Fantasy Intel", icon: Flame },
  { id: "intel", label: "Team Intel", icon: Eye },
  { id: "warroom", label: "War Room", icon: Shield },
  { id: "admin", label: "Admin", icon: Target },
];

export default function DownfieldOS() {
  const [active, setActive] = useState("season2026");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [matchupOff, setMatchupOff] = useState(null);
  const [matchupDef, setMatchupDef] = useState(null);
  const [postPreview, setPostPreview] = useState(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => { if (!isMobile) setMobileSidebarOpen(false); }, [isMobile]);

  const navigateToMatchup = useCallback((off, def) => {
    setMatchupOff(off);
    setMatchupDef(def);
    setActive("matchup");
  }, []);

  const generatePost = useCallback((away, home, aStats, hStats) => {
    setPostPreview({ away, home, aStats, hStats });
  }, []);

  const allPlays = useMemo(() => generatePlays(), []);
  const filteredPlays = useMemo(() => applyFilters(allPlays, filters), [allPlays, filters]);
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  const rosters = useMemo(() => {
    const r = sr(99);
    const out = {};
    T.forEach(t => { out[t.a] = genRoster(t.a, r); });
    return out;
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: showFilters ? 440 : 220, background: "#0d1117", borderRight: "1px solid #1e293b", flexShrink: 0, display: isMobile && !mobileSidebarOpen ? "none" : "flex", transition: "width .2s", ...(isMobile ? { position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 1500 } : {}) }}>
        {/* Nav */}
        <div style={{ width: 220, padding: "20px 12px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px", marginBottom: 32 }}>
            <div style={{ background: "#1e293b", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="#f97316" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -.5 }}>DownfieldOS</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {MODULES.map(m => <NavItem key={m.id} icon={m.icon} label={m.label} active={active === m.id} onClick={() => { setActive(m.id); if (isMobile) setMobileSidebarOpen(false); }} />)}
            <div style={{ height: 1, background: "#1e293b", margin: "8px 0" }} />
            <NavItem icon={Filter} label="Filters" active={showFilters} onClick={() => setShowFilters(!showFilters)} badge={isFiltered ? "ON" : null} />
          </div>
          <div style={{ padding: "12px 16px", background: "#1e293b15", borderRadius: 10, marginTop: 16 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>System Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>Engine Online</span>
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
              {isFiltered ? `${filteredPlays.length.toLocaleString()} / ${allPlays.length.toLocaleString()} plays` : `${allPlays.length.toLocaleString()} plays analyzed`}
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>v6 — 2026 Season Preview</div>
          </div>
        </div>

        {/* Filter panel (slide-out) */}
        {showFilters && (
          <div style={{ width: 220, borderLeft: "1px solid #1e293b", overflowY: "auto" }}>
            <FilterPanel filters={filters} setFilters={setFilters} playCount={filteredPlays.length} totalCount={allPlays.length} />
          </div>
        )}
      </div>

      {isMobile && mobileSidebarOpen && <div onClick={() => setMobileSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1400 }} />}
      {/* Main */}
      <div style={{ flex: 1, background: "#f8fafc", overflow: "auto" }}>
        <div style={{ padding: isMobile ? 16 : 32, maxWidth: 1000, margin: "0 auto", overflowX: "hidden" }}>
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} style={{ background: "#0d1117", border: "none", borderRadius: 8, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Menu size={20} color="#fff" />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={16} color="#f97316" />
                <span style={{ fontWeight: 800, fontSize: 15, color: "#0d1117" }}>DownfieldOS</span>
              </div>
            </div>
          )}
          {active === "season2026" && <Season2026 plays={filteredPlays} rosters={rosters} onNavigateMatchup={navigateToMatchup} />}
          {active === "thisweek" && <ThisWeek plays={filteredPlays} rosters={rosters} onNavigateMatchup={navigateToMatchup} onGeneratePost={generatePost} />}
          {active === "dashboard" && <SoWhatDashboard plays={filteredPlays} />}
          {active === "matchup" && <MatchupCenter plays={filteredPlays} rosters={rosters} initialOff={matchupOff} initialDef={matchupDef} />}
          {active === "fantasy" && <FantasyIntel plays={filteredPlays} rosters={rosters} />}
          {active === "intel" && <TeamIntel plays={filteredPlays} rosters={rosters} />}
          {active === "warroom" && <WarRoom plays={filteredPlays} />}
          {active === "admin" && <AdminPanel plays={filteredPlays} rosters={rosters} />}
        </div>
      </div>

      {/* Post preview modal */}
      {postPreview && (
        <InstaPostCard
          away={postPreview.away} home={postPreview.home}
          aStats={postPreview.aStats} hStats={postPreview.hStats}
          bl={lgbl(filteredPlays)} rosters={rosters}
          onClose={() => setPostPreview(null)}
        />
      )}

      {/* Chatbot */}
      <Chatbot plays={filteredPlays} rosters={rosters} />
    </div>
  );
}
