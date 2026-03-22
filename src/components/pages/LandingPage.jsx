import { useMemo } from "react";
import { Swords, Flame, Calendar, Star, TrendingUp, Eye, Shield, ArrowRight, ExternalLink } from "lucide-react";
import { useIsMobile } from '../../hooks/useIsMobile';
import { Logo } from '../ui/Logo';
import { T } from '../../data/teams';
import fanSentimentData from '../../data/intelligence/fan_sentiment.json';

const MODULE_CARDS = [
  {
    icon: Swords, title: "Matchup Intelligence",
    desc: "9 intelligence signals per matchup — scheme familiarity, coaching trees, revenge games, film study asymmetry, and more. Not a stat sheet. A scouting report.",
    path: "/matchup-preview", color: "#f97316",
  },
  {
    icon: Flame, title: "Fantasy Intel",
    desc: "Matchup-based opportunity scores with boom/bust probability by position. Data-driven start/sit decisions backed by 100,000+ plays.",
    path: "/fantasy-intel", color: "#dc2626",
  },
  {
    icon: Calendar, title: "This Week",
    desc: "Every game at a glance. Expandable matchup stats, quick scout reports, and one-click social post generation.",
    path: "/this-week", color: "#2563eb",
  },
  {
    icon: Star, title: "So What?",
    desc: "Plain-English insights distilled from the noise. Fan sentiment, misery index, and the storylines that actually matter.",
    path: "/so-what", color: "#eab308",
  },
];

export function LandingPage({ onSelectTeam, navigate }) {
  const isMobile = useIsMobile();

  // Top 3 most miserable fan bases for the live hook
  const topMisery = useMemo(() => {
    const teams = fanSentimentData?.teams || (Array.isArray(fanSentimentData) ? fanSentimentData : []);
    if (!teams.length) return [];
    return [...teams]
      .sort((a, b) => (b.misery_index || 0) - (a.misery_index || 0))
      .slice(0, 3);
  }, []);

  const handleExplore = (team) => {
    onSelectTeam(team);
    navigate("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#fff", overflow: "auto" }}>
      {/* Hero */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "48px 20px" : "80px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Logo size={64} />
        </div>
        <h1 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 900, letterSpacing: -2, margin: "0 0 12px", lineHeight: 1.1 }}>
          Football, understood.
        </h1>
        <p style={{ fontSize: isMobile ? 16 : 20, color: "#8B949E", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
          The intelligence operating system for football. 100,000+ plays transformed into narrative, publishable, decision-ready intelligence.
        </p>

        {/* CTA Row */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              onChange={e => { if (e.target.value) handleExplore(e.target.value); }}
              defaultValue=""
              style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 16, fontWeight: 700, cursor: "pointer", minWidth: 200 }}
            >
              <option value="" disabled>Pick Your Team</option>
              {T.map(t => <option key={t.a} value={t.a}>{t.a} — {t.n}</option>)}
            </select>
          </div>
          <a
            href="https://the-audible.beehiiv.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid #30363d", borderRadius: 10, padding: "14px 24px", fontSize: 16, fontWeight: 700, color: "#e2e8f0", textDecoration: "none", cursor: "pointer" }}
          >
            Subscribe to The Audible <ExternalLink size={14} />
          </a>
        </div>

        {/* Live Hook — Misery Index */}
        {topMisery.length > 0 && (
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 16, padding: isMobile ? 20 : 28, marginBottom: 48, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 20 }}>😤</div>
              <span style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: "#f97316" }}>Most Miserable Fan Bases</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
              {topMisery.map((team, i) => (
                <div key={team.team} style={{ background: "#0d1117", borderRadius: 12, padding: 16, border: "1px solid #21262d" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: i === 0 ? "#dc2626" : i === 1 ? "#f97316" : "#eab308", fontFamily: "monospace" }}>#{i + 1}</span>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{team.team}</span>
                    <span style={{ fontSize: 12, color: "#8B949E" }}>{team.name}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#dc2626", fontFamily: "monospace" }}>{team.misery_index?.toFixed(1)}</div>
                  <div style={{ fontSize: 12, color: "#8B949E", marginTop: 4 }}>{team.one_liner}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { onSelectTeam("CHI"); navigate("/so-what"); }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#f97316", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 12, padding: 0 }}
            >
              See all 32 fan bases <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Module Cards */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "0 20px 48px" : "0 32px 80px" }}>
        <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#8B949E", marginBottom: 24, textAlign: "center" }}>8 Modules of Intelligence</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          {MODULE_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => { onSelectTeam("CHI"); navigate(card.path); }}
                style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 16, padding: 24, textAlign: "left", cursor: "pointer", transition: "border-color .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: card.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={card.color} />
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{card.title}</span>
                </div>
                <p style={{ fontSize: 14, color: "#8B949E", lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Additional modules row */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
          {[
            { icon: TrendingUp, label: "2026 Preview", path: "/2026-preview" },
            { icon: Eye, label: "Team Intel", path: "/team-intel" },
            { icon: Shield, label: "War Room", path: "/war-room" },
          ].map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                onClick={() => { onSelectTeam("CHI"); navigate(m.path); }}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #30363d", borderRadius: 8, padding: "8px 16px", color: "#8B949E", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                <Icon size={14} /> {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #21262d", padding: "32px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <Logo size={20} />
          <span style={{ fontSize: 14, fontWeight: 800 }}>DownfieldOS</span>
        </div>
        <p style={{ fontSize: 12, color: "#484f58", margin: 0 }}>Football intelligence. No fluff. No noise. Just signal.</p>
      </div>
    </div>
  );
}
