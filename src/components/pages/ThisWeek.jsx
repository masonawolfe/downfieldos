import { useState, useMemo } from "react";
import { Trophy, ChevronUp, ChevronDown, ChevronRight, Flame, Eye, Calendar, Download } from "lucide-react";
import { agg, lgbl } from '../../utils/aggregation';
import { CURRENT_SEASON } from '../../config';
import { calcMatchupGrade } from '../../utils/grading';
import { pct, tn } from '../../utils/formatters';
import { DNA } from '../../data/dna';
import { matchupPreview } from '../../utils/narratives';
import { MatchupGrade } from '../ui/MatchupGrade';
import { InsightCard } from '../ui/InsightCard';
import { RatingBar } from '../ui/RatingBar';
import { FormerTeammatesCard } from '../ui/FormerTeammatesCard';
import { Tooltip } from '../ui/Tooltip';
import { NewsletterCTA } from '../ui/NewsletterCTA';

export function ThisWeek({ plays, rosters, onNavigateMatchup, onGeneratePost, primaryTeam }) {
  const [selectedWeek, setSelectedWeek] = useState(18);
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const [expandedGame, setExpandedGame] = useState(null);

  // Build the week's matchups from play data
  const weekGames = useMemo(() => {
    const weekPlays = plays.filter(p => p.season === selectedSeason && p.week === selectedWeek);
    const gameMap = {};
    weekPlays.forEach(p => {
      if (!gameMap[p.gameId]) gameMap[p.gameId] = { gameId: p.gameId, teams: new Set(), plays: [] };
      gameMap[p.gameId].teams.add(p.off);
      gameMap[p.gameId].teams.add(p.def);
      gameMap[p.gameId].plays.push(p);
    });
    const games = Object.values(gameMap).map(g => {
      const teams = [...g.teams];
      const home = teams.find(t => g.plays.some(p => p.off === t && p.ha === "Home")) || teams[0];
      const away = teams.find(t => t !== home) || teams[1];
      return { ...g, home, away };
    }).filter(g => g.home && g.away);
    // Game of the Week: closest matchup with most explosive potential
    if (games.length > 0) {
      let bestIdx = 0, bestScore = -Infinity;
      const allBl = lgbl(plays);
      games.forEach((g, i) => {
        const hs = agg(plays, g.home), as2 = agg(plays, g.away);
        const closeness = 1 - Math.abs(hs.sr - as2.sr) * 10;
        const excitement = (hs.xr + as2.xr) / 2 / (allBl.xr || 0.08);
        const score = closeness + excitement;
        if (score > bestScore) { bestScore = score; bestIdx = i; }
      });
      games[bestIdx].isGOTW = true;
    }
    return games;
  }, [plays, selectedWeek, selectedSeason]);

  const bl = useMemo(() => lgbl(plays), [plays]);

  function GameCard({ game }) {
    const hStats = useMemo(() => agg(plays, game.home), [game.home]);
    const aStats = useMemo(() => agg(plays, game.away), [game.away]);
    const hR = rosters[game.home], aR = rosters[game.away];
    const expanded = expandedGame === game.gameId;

    // Matchup grades
    const awayOffGrade = calcMatchupGrade(aStats, hStats, bl);
    const homeOffGrade = calcMatchupGrade(hStats, aStats, bl);
    const offEdge = aStats.sr - hStats.dsr;
    const defEdge = hStats.sr - aStats.dsr;
    const hAdv = defEdge - offEdge;
    const gameTemp = game.plays.length > 0 ? (hAdv > 0.04 ? "hot" : hAdv < -0.04 ? "cold" : "neutral") : "neutral";
    const tempColors = { hot: "#dc2626", cold: "#2563eb", neutral: "#64748b" };
    const gameQuality = Math.abs(hStats.sr - aStats.sr) < 0.03 && (hStats.xr + aStats.xr) / 2 > bl.xr;

    // Mismatch detection
    const mismatches = [];
    if (aStats.xr > bl.xr + .02 && hStats.dxr > bl.xr + .02) mismatches.push({ text: `${tn(game.away)} explosive O vs leaky ${tn(game.home)} D`, tone: "warning" });
    if (hStats.xr > bl.xr + .02 && aStats.dxr > bl.xr + .02) mismatches.push({ text: `${tn(game.home)} explosive O vs leaky ${tn(game.away)} D`, tone: "warning" });
    if (aStats.pr > bl.pr + .06 && hStats.dsr < bl.sr - .02) mismatches.push({ text: `${tn(game.away)} pass-heavy vs stingy ${tn(game.home)} D — chess match`, tone: "elite" });
    if (hStats.pr > bl.pr + .06 && aStats.dsr < bl.sr - .02) mismatches.push({ text: `${tn(game.home)} pass-heavy vs stingy ${tn(game.away)} D — chess match`, tone: "elite" });

    // "Watch for this"
    const watchFor = [];
    const hWR1 = hR?.offense.find(p => p.pos === "WR1"), aCB1 = aR?.defense.find(p => p.pos === "CB1");
    const aWR1 = aR?.offense.find(p => p.pos === "WR1"), hCB1 = hR?.defense.find(p => p.pos === "CB1");
    if (hWR1 && aCB1 && Math.abs(hWR1.rating - aCB1.rating) > 12) watchFor.push(`${hWR1.name} (${hWR1.rating}) vs ${aCB1.name} (${aCB1.rating}) — ${hWR1.rating > aCB1.rating ? "advantage offense" : "lockdown corner"}`);
    if (aWR1 && hCB1 && Math.abs(aWR1.rating - hCB1.rating) > 12) watchFor.push(`${aWR1.name} (${aWR1.rating}) vs ${hCB1.name} (${hCB1.rating}) — ${aWR1.rating > hCB1.rating ? "advantage offense" : "lockdown corner"}`);

    return (
      <div style={{ background: "#fff", borderRadius: 16, border: game.isGOTW ? "2px solid #f97316" : "1px solid #e2e8f0", overflow: "hidden", marginBottom: 12, transition: "all .2s", boxShadow: game.isGOTW ? "0 4px 20px rgba(249,115,22,0.12)" : "none" }}>
        {game.isGOTW && (
          <div style={{ background: "linear-gradient(90deg, #f97316, #fb923c)", padding: "6px 20px", display: "flex", alignItems: "center", gap: 6 }}>
            <Trophy size={12} color="#fff" />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.5 }}>Game of the Week</span>
          </div>
        )}
        <button onClick={() => setExpandedGame(expanded ? null : game.gameId)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ background: "#0f172a", color: "#fff", borderRadius: 8, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, fontFamily: "monospace" }}>{game.away}</div>
              <MatchupGrade grade={awayOffGrade} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#94a3b8" }}>@</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ background: "#f97316", color: "#fff", borderRadius: 8, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, fontFamily: "monospace" }}>{game.home}</div>
              <MatchupGrade grade={homeOffGrade} />
            </div>
            <div style={{ marginLeft: 12, textAlign: "left" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{tn(game.away)} at {tn(game.home)}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {DNA[game.away].s} vs {DNA[game.home].s}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {mismatches.length > 0 && <span style={{ background: "#fff7ed", color: "#ea580c", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>{mismatches.length} mismatch{mismatches.length > 1 ? "es" : ""}</span>}
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: tempColors[gameTemp] }} title={gameTemp === "hot" ? "Home advantage" : gameTemp === "cold" ? "Away advantage" : "Even"} />
            {expanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
          </div>
        </button>

        {expanded && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f1f5f9" }}>
            {/* Quick stat comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16, marginBottom: 16 }}>
              {[[game.away, aStats], [game.home, hStats]].map(([tm, s]) => (
                <div key={tm} style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{tn(tm)}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
                    <div><span style={{ color: "#94a3b8" }}>Pass Rate:</span> <strong>{pct(s.pr)}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Success:</span> <strong>{pct(s.sr)}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Explosive:</span> <strong>{pct(s.xr)}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Completion:</span> <strong>{pct(s.compRate)}</strong></div>
                    <div><Tooltip text="Defensive Success Rate — % of opponent plays held to negative expected yards"><span style={{ color: "#94a3b8" }}>Def SR:</span></Tooltip> <strong style={{ color: s.dsr > bl.sr + .02 ? "#dc2626" : s.dsr < bl.sr - .02 ? "#16a34a" : "#0f172a" }}>{pct(s.dsr)}</strong></div>
                    <div><Tooltip text="Defensive Explosive Rate — % of opponent plays going 15+ yards"><span style={{ color: "#94a3b8" }}>Def Exp:</span></Tooltip> <strong style={{ color: s.dxr > bl.xr + .01 ? "#dc2626" : "#0f172a" }}>{pct(s.dxr)}</strong></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Former Teammates compact badge */}
            <div style={{ marginBottom: 12 }}>
              <FormerTeammatesCard team1={game.away} team2={game.home} compact />
            </div>

            {/* Mismatches */}
            {mismatches.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Flame size={14} color="#ea580c" /> Key Mismatches</div>
                {mismatches.map((m, i) => (
                  <div key={i} style={{ background: m.tone === "warning" ? "#fff7ed" : "#eff6ff", border: `1px solid ${m.tone === "warning" ? "#fed7aa" : "#bfdbfe"}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "#334155", marginBottom: 6 }}>{m.text}</div>
                ))}
              </div>
            )}

            {/* Watch for this */}
            {watchFor.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Eye size={14} color="#2563eb" /> Watch For This</div>
                {watchFor.map((w, i) => (
                  <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "#334155", marginBottom: 6 }}>{w}</div>
                ))}
              </div>
            )}

            {/* Mini scouting report */}
            <div style={{ background: "#0f172a", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Quick Scout</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>
                {matchupPreview(game.away, game.home, aStats, { dsr: hStats.dsr, dxr: hStats.dxr, dpr: hStats.dpr }, bl).replace(/##\s*/g, "").replace(/\n+/g, " ").slice(0, 300)}...
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {onNavigateMatchup && (
                  <button onClick={() => onNavigateMatchup(game.away, game.home)} style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    Full Breakdown <ChevronRight size={14} />
                  </button>
                )}
                {onGeneratePost && (
                  <button onClick={() => onGeneratePost(game.away, game.home, aStats, hStats)} style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <Download size={14} /> Generate Post
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -1 }}>This Week</h2>
      <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>Every game at a glance. Click any matchup to expand.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Season</label>
          <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            <option value={2025}>2025</option><option value={2024}>2024</option><option value={2023}>2023</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Week</label>
          <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {Array.from({ length: 18 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", paddingBottom: 12 }}>{weekGames.length} games</div>
      </div>

      {weekGames.length === 0 ? (
        <InsightCard tone="neutral" icon={Calendar} headline="No games found" body={`No matchup data for Season ${selectedSeason}, Week ${selectedWeek}. Try a different week.`} />
      ) : (
        [...weekGames].sort((a, b) => {
          const aHas = primaryTeam && (a.home === primaryTeam || a.away === primaryTeam) ? 1 : 0;
          const bHas = primaryTeam && (b.home === primaryTeam || b.away === primaryTeam) ? 1 : 0;
          return bHas - aHas;
        }).map(g => <GameCard key={g.gameId} game={g} />)
      )}
      <NewsletterCTA />
    </div>
  );
}
