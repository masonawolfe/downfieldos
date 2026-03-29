import { useState, useMemo, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate, useParams, Link } from "react-router-dom";
import {
  Target, TrendingUp, Calendar, Star, Swords,
  Flame, Eye, Shield, Filter, Menu, Home, Mail
} from "lucide-react";
import { useIsMobile } from './hooks/useIsMobile';
import { T } from './data/teams';
import { DNA } from './data/dna';
import { DNA_2026 } from './data/dna2026';
import { DEFAULT_FILTERS, applyFilters } from './utils/filters';
import { generatePlays, loadCurrentSeason, loadAllSeasons } from './utils/playGenerator';
import { genRoster2026 } from './utils/roster';
import { agg, lgbl } from './utils/aggregation';
import { buildDynamicDNA } from './utils/teamIdentity';
import { sr } from './utils/rng';
import { NavItem, FilterPanel, InstaPostCard, Logo, TeamSelect, ErrorBoundary } from './components/ui';
import { CommandPalette } from './components/ui/CommandPalette';
import { Walkthrough, useWalkthrough } from './components/ui/Walkthrough';
import { Season2026 } from './components/pages/Season2026';
import { ThisWeek } from './components/pages/ThisWeek';
import { SoWhatDashboard } from './components/pages/SoWhatDashboard';
import { MatchupCenter } from './components/pages/MatchupCenter';
import { FantasyIntel } from './components/pages/FantasyIntel';
import { TeamIntel } from './components/pages/TeamIntel';
import { WarRoom } from './components/pages/WarRoom';
import { AdminPanel } from './components/pages/AdminPanel';
import { LandingPage } from './components/pages/LandingPage';
import { HomeDashboard } from './components/pages/HomeDashboard';
import { GamePrep } from './components/pages/GamePrep';

/**
 * Route config — maps URL paths to module metadata.
 * `id` is used for internal references, `path` for the URL.
 */
const MODULE_GROUPS = [
  { label: null, items: [
    { id: "home", path: "/dashboard", label: "Home", icon: Home },
  ]},
  { label: "OVERVIEW", items: [
    { id: "season2026", path: "/2026-preview", label: "2026 Preview", icon: TrendingUp },
    { id: "thisweek", path: "/this-week", label: "This Week", icon: Calendar },
    { id: "dashboard", path: "/so-what", label: "So What?", icon: Star },
  ]},
  { label: "INTELLIGENCE", items: [
    { id: "matchup", path: "/matchup-preview", label: "Matchup Preview", icon: Swords },
    { id: "intel", path: "/team-intel", label: "Team Intel", icon: Eye },
    { id: "warroom", path: "/war-room", label: "War Room", icon: Shield },
  ]},
  { label: "CONTENT", items: [
    { id: "fantasy", path: "/fantasy-intel", label: "Fantasy Intel", icon: Flame },
    { id: "admin", path: "/admin", label: "Admin", icon: Target },
  ]},
];
const MODULES = MODULE_GROUPS.flatMap(g => g.items);

/**
 * Page metadata — title, description, OG tags per route.
 */
const PAGE_META = {
  "/": {
    title: "DownfieldOS — Football Intelligence Operating System",
    description: "Football, understood. The intelligence operating system for football. 100,000+ plays transformed into narrative, publishable, decision-ready intelligence.",
  },
  "/dashboard": {
    title: "Dashboard | DownfieldOS",
    description: "Your personalized football intelligence dashboard. Matchup previews, fantasy intel, and decision-ready insights from 100,000+ plays.",
  },
  "/2026-preview": {
    title: "2026 Season Preview | DownfieldOS",
    description: "Full 2026 NFL season preview — opponent grades, win projections, roster analysis, and draft needs for all 32 teams.",
  },
  "/this-week": {
    title: "This Week — Every Game at a Glance | DownfieldOS",
    description: "Every NFL game this week — matchup stats, quick scout reports, and one-click post generation.",
  },
  "/so-what": {
    title: "What You Need to Know | DownfieldOS",
    description: "Plain-English NFL insights distilled from 100,000+ plays. The signal, not the noise.",
  },
  "/matchup-preview": {
    title: "Matchup Preview | DownfieldOS",
    description: "Deep NFL matchup scouting — scheme analysis, player-level matchups, intelligence signals, and game scripts.",
  },
  "/fantasy-intel": {
    title: "Fantasy Intel — Matchup Rankings | DownfieldOS",
    description: "Fantasy football matchup rankings with boom/bust probability by position. Data-driven start/sit decisions.",
  },
  "/team-intel": {
    title: "Team Intel — Full Scouting Report | DownfieldOS",
    description: "Full NFL team scouting reports — player cards, ratings, archetypes, and roster grids for all 32 teams.",
  },
  "/war-room": {
    title: "War Room — GM Perspective | DownfieldOS",
    description: "NFL analysis from the GM's chair — season assessments, draft boards, and front office decision-making.",
  },
  "/admin": {
    title: "Admin — Post Manager | DownfieldOS",
    description: "Auto-generate branded Instagram matchup posts. Batch creation with one click.",
  },
};

function updateMeta(path) {
  const meta = PAGE_META[path] || { title: "DownfieldOS — Football Intelligence Operating System", description: "Football, understood. 100,000+ plays of NFL data transformed into narrative, publishable, decision-ready intelligence." };
  document.title = meta.title;

  // Helper to set or create a meta tag
  const setMeta = (attr, key, content) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
    el.setAttribute("content", content);
  };

  setMeta("name", "description", meta.description);
  setMeta("property", "og:title", meta.title);
  setMeta("property", "og:description", meta.description);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:url", `https://downfieldos.com${path}`);
  setMeta("property", "og:site_name", "DownfieldOS");
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", meta.title);
  setMeta("name", "twitter:description", meta.description);

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
  canonical.setAttribute("href", `https://downfieldos.com${path}`);

  // JSON-LD structured data
  let jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (!jsonLd) { jsonLd = document.createElement("script"); jsonLd.type = "application/ld+json"; document.head.appendChild(jsonLd); }
  jsonLd.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DownfieldOS",
    "url": `https://downfieldos.com${path}`,
    "description": meta.description,
    "applicationCategory": "SportsApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  });
}

// Route wrappers for parameterized URLs
function TeamRouteWrapper({ plays, rosters }) {
  const { teamCode } = useParams();
  const team = teamCode?.toUpperCase() || "CHI";
  return <TeamIntel plays={plays} rosters={rosters} primaryTeam={team} />;
}

function MatchupRouteWrapper({ plays, rosters, primaryTeam }) {
  const { matchup } = useParams();
  const parts = matchup?.split("-vs-") || [];
  const off = parts[0]?.toUpperCase() || primaryTeam || "CHI";
  const def = parts[1]?.toUpperCase() || "DET";
  return <MatchupCenter plays={plays} rosters={rosters} initialOff={off} initialDef={def} primaryTeam={primaryTeam} />;
}

export default function DownfieldOS() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [matchupOff, setMatchupOff] = useState(null);
  const [matchupDef, setMatchupDef] = useState(null);
  const [postPreview, setPostPreview] = useState(null);
  const [primaryTeam, setPrimaryTeam] = useState(() => localStorage.getItem('dfos-primary-team') || 'CHI');
  const [showLandingPage, setShowLandingPage] = useState(() => !localStorage.getItem('dfos-primary-team'));
  useEffect(() => { localStorage.setItem('dfos-primary-team', primaryTeam); }, [primaryTeam]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [cmdKOpen, setCmdKOpen] = useState(false);
  const [showWalkthrough, dismissWalkthrough] = useWalkthrough();
  const isMobile = useIsMobile();

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdKOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => { if (!isMobile) setMobileSidebarOpen(false); }, [isMobile]);

  // Dynamic page title + meta tags
  useEffect(() => {
    const basePath = location.pathname.replace(/\/+$/, '') || '/';
    updateMeta(basePath);
  }, [location.pathname]);

  const navigateToMatchup = useCallback((off, def) => {
    setMatchupOff(off);
    setMatchupDef(def);
    navigate("/matchup-preview");
  }, [navigate]);

  const generatePost = useCallback((away, home, aStats, hStats) => {
    setPostPreview({ away, home, aStats, hStats });
  }, []);

  // Load real NFL play data (async, with synthetic fallback)
  const [allPlays, setAllPlays] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadCurrentSeason()
      .then(plays => { setAllPlays(plays); setDataLoading(false); })
      .catch(() => { setAllPlays(generatePlays()); setDataLoading(false); });
  }, []);

  // Background-prefetch older seasons after initial render
  useEffect(() => {
    if (!dataLoading && allPlays) {
      loadAllSeasons().then(setAllPlays);
    }
  }, [dataLoading]);

  // Override ALL static DNA objects with dynamic identity labels from real stats
  useMemo(() => {
    if (!allPlays || allPlays.length === 0) return;
    const dynamicDNA = buildDynamicDNA(allPlays, agg, lgbl, T);
    Object.keys(dynamicDNA).forEach(team => {
      DNA[team] = { ...DNA[team], ...dynamicDNA[team] };
      if (DNA_2026[team]) DNA_2026[team] = { ...DNA_2026[team], ...dynamicDNA[team] };
    });
  }, [allPlays]);

  const filteredPlays = useMemo(() => allPlays ? applyFilters(allPlays, filters) : [], [allPlays, filters]);
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  const rosters = useMemo(() => {
    const out = {};
    T.forEach(t => { out[t.a] = genRoster2026(t.a); });
    return out;
  }, []);

  // Which module is active based on current path
  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  const activeModule = MODULES.find(m => currentPath === m.path || currentPath.startsWith(m.path + '/'));

  // Loading state while play data fetches
  if (dataLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0d1117", flexDirection: "column", gap: 16 }}>
        <Logo size={48} />
        <div style={{ fontSize: 14, color: "#8B949E", fontWeight: 600 }}>Loading play data...</div>
        <div style={{ width: 200, height: 3, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: "60%", height: "100%", background: "#f97316", borderRadius: 2, animation: "loading 1.5s ease-in-out infinite" }} />
        </div>
      </div>
    );
  }

  // Landing page at root — always shown
  if (currentPath === '/') {
    return (
      <LandingPage
        onSelectTeam={(team) => { setPrimaryTeam(team); }}
        navigate={navigate}
      />
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* Skip to content — accessibility */}
      <a href="#main-content" style={{ position: "absolute", left: "-9999px", top: "auto", width: "1px", height: "1px", overflow: "hidden", zIndex: 9999 }} onFocus={e => { e.target.style.position = "fixed"; e.target.style.left = "8px"; e.target.style.top = "8px"; e.target.style.width = "auto"; e.target.style.height = "auto"; e.target.style.padding = "8px 16px"; e.target.style.background = "#f97316"; e.target.style.color = "#fff"; e.target.style.borderRadius = "8px"; e.target.style.fontWeight = "700"; e.target.style.fontSize = "14px"; e.target.style.textDecoration = "none"; }} onBlur={e => { e.target.style.position = "absolute"; e.target.style.left = "-9999px"; e.target.style.width = "1px"; e.target.style.height = "1px"; }}>Skip to content</a>
      {/* Sidebar */}
      <aside aria-label="Navigation" style={{ width: showFilters ? 440 : 220, background: "#0d1117", borderRight: "1px solid #1e293b", flexShrink: 0, display: isMobile && !mobileSidebarOpen ? "none" : "flex", transition: "width .2s", ...(isMobile ? { position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 1500 } : {}) }}>
        {/* Nav */}
        <nav style={{ width: 220, padding: "20px 12px", display: "flex", flexDirection: "column", flexShrink: 0 }} aria-label="Main navigation">
          <div style={{ padding: "0 4px", marginBottom: 32 }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <Logo size={36} />
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -.5 }}>DownfieldOS</div>
            </Link>
            <div style={{ fontSize: 11, color: "#8B949E", letterSpacing: 1.5, marginTop: 6, paddingLeft: 46 }}>Football, understood.</div>
          </div>
          <div style={{ padding: "0 4px", marginBottom: 16 }}>
            <label htmlFor="primary-team-select" style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1.2 }}>My Team</label>
            <select id="primary-team-select" value={primaryTeam} onChange={e => setPrimaryTeam(e.target.value)} style={{ width: "100%", background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
              {T.map(t => <option key={t.a} value={t.a}>{t.a} — {t.n}</option>)}
            </select>
          </div>
          <div role="list" style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {MODULE_GROUPS.map((group, gi) => (
              <div key={gi}>
                {group.label && <div style={{ fontSize: 9, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, padding: "8px 12px 4px", marginTop: gi > 0 ? 4 : 0 }}>{group.label}</div>}
                {group.items.map(m => (
                  <NavItem
                    key={m.id}
                    icon={m.icon}
                    label={m.label}
                    active={activeModule?.id === m.id}
                    onClick={() => { navigate(m.path); if (isMobile) setMobileSidebarOpen(false); }}
                  />
                ))}
              </div>
            ))}
            <div style={{ height: 1, background: "#1e293b", margin: "8px 0" }} />
            <NavItem icon={Filter} label="Filters" active={showFilters} onClick={() => setShowFilters(!showFilters)} badge={isFiltered ? "ON" : null} />
            <a href="https://the-audible.beehiiv.com" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 12, color: "#8B949E", textDecoration: "none", borderRadius: 8, marginTop: 4, transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "#f97316"} onMouseLeave={e => e.currentTarget.style.color = "#8B949E"}>
              <Mail size={14} />
              <span>Subscribe to The Audible</span>
            </a>
          </div>
          <div style={{ padding: "12px 16px", background: "#1e293b15", borderRadius: 10, marginTop: 16 }} aria-label="System status">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>System Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} aria-hidden="true" />
              <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>Engine Online</span>
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
              {isFiltered ? `${filteredPlays.length.toLocaleString()} / ${allPlays.length.toLocaleString()} plays` : `${allPlays.length.toLocaleString()} plays analyzed`}
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>v7 — {typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'dev'}</div>
            <a href="mailto:masonawolfe@gmail.com?subject=DownfieldOS%20Feedback" style={{ display: "block", fontSize: 10, color: "#f97316", marginTop: 8, textDecoration: "none" }}>Send Feedback</a>
          </div>
        </nav>

        {/* Filter panel (slide-out) */}
        {showFilters && (
          <div style={{ width: 220, borderLeft: "1px solid #1e293b", overflowY: "auto" }}>
            <FilterPanel filters={filters} setFilters={setFilters} playCount={filteredPlays.length} totalCount={allPlays.length} />
          </div>
        )}
      </aside>

      {isMobile && mobileSidebarOpen && <div onClick={() => setMobileSidebarOpen(false)} aria-hidden="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1400 }} />}
      {/* Main */}
      <main id="main-content" style={{ flex: 1, background: "#f8fafc", overflow: "auto" }}>
        <div style={{ padding: isMobile ? 16 : 32, maxWidth: 1000, margin: "0 auto", overflowX: "hidden" }}>
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} style={{ background: "#0d1117", border: "none", borderRadius: 8, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Menu size={20} color="#fff" />
              </button>
              <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                <Logo size={28} />
                <span style={{ fontWeight: 800, fontSize: 15, color: "#0d1117" }}>DownfieldOS</span>
              </Link>
            </div>
          )}
          <Routes>
            <Route path="/dashboard" element={<ErrorBoundary label="Home"><HomeDashboard plays={filteredPlays} rosters={rosters} primaryTeam={primaryTeam} navigate={navigate} onNavigateMatchup={navigateToMatchup} /></ErrorBoundary>} />
            <Route path="/2026-preview" element={<ErrorBoundary label="2026 Preview"><Season2026 plays={filteredPlays} rosters={rosters} onNavigateMatchup={navigateToMatchup} primaryTeam={primaryTeam} /></ErrorBoundary>} />
            <Route path="/this-week" element={<ErrorBoundary label="This Week"><ThisWeek plays={filteredPlays} rosters={rosters} onNavigateMatchup={navigateToMatchup} onGeneratePost={generatePost} primaryTeam={primaryTeam} /></ErrorBoundary>} />
            <Route path="/so-what" element={<ErrorBoundary label="So What?"><SoWhatDashboard plays={filteredPlays} primaryTeam={primaryTeam} /></ErrorBoundary>} />
            <Route path="/matchup-preview" element={<ErrorBoundary label="Matchup Preview"><MatchupCenter plays={filteredPlays} rosters={rosters} initialOff={matchupOff} initialDef={matchupDef} primaryTeam={primaryTeam} /></ErrorBoundary>} />
            <Route path="/fantasy-intel" element={<ErrorBoundary label="Fantasy Intel"><FantasyIntel plays={filteredPlays} rosters={rosters} primaryTeam={primaryTeam} /></ErrorBoundary>} />
            <Route path="/team-intel" element={<ErrorBoundary label="Team Intel"><TeamIntel plays={filteredPlays} rosters={rosters} primaryTeam={primaryTeam} /></ErrorBoundary>} />
            <Route path="/war-room" element={<ErrorBoundary label="War Room"><WarRoom plays={filteredPlays} primaryTeam={primaryTeam} /></ErrorBoundary>} />
            <Route path="/admin" element={<ErrorBoundary label="Admin"><AdminPanel plays={filteredPlays} rosters={rosters} /></ErrorBoundary>} />
            <Route path="/game-prep" element={<ErrorBoundary label="Game Prep"><GamePrep plays={filteredPlays} rosters={rosters} primaryTeam={primaryTeam} navigate={navigate} /></ErrorBoundary>} />
            {/* Team-specific routes */}
            <Route path="/team/:teamCode" element={<ErrorBoundary label="Team Intel"><TeamRouteWrapper plays={filteredPlays} rosters={rosters} /></ErrorBoundary>} />
            <Route path="/matchup/:matchup" element={<ErrorBoundary label="Matchup Preview"><MatchupRouteWrapper plays={filteredPlays} rosters={rosters} primaryTeam={primaryTeam} /></ErrorBoundary>} />
            {/* Catch-all — redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Post preview modal */}
      {postPreview && (
        <InstaPostCard
          away={postPreview.away} home={postPreview.home}
          aStats={postPreview.aStats} hStats={postPreview.hStats}
          bl={lgbl(filteredPlays)} rosters={rosters}
          onClose={() => setPostPreview(null)}
        />
      )}

      {/* First-visit walkthrough */}
      {showWalkthrough && <Walkthrough onDismiss={dismissWalkthrough} />}

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={cmdKOpen}
        onClose={() => setCmdKOpen(false)}
        navigate={navigate}
        onSelectTeam={(team) => setPrimaryTeam(team)}
      />

    </div>
  );
}
