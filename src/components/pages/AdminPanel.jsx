import { useState, useMemo } from "react";
import { Zap } from "lucide-react";
import { useIsMobile } from '../../hooks/useIsMobile';
import { agg, lgbl } from '../../utils/aggregation';
import { CURRENT_SEASON } from '../../config';
import { calcMatchupGrade } from '../../utils/grading';
import { tn } from '../../utils/formatters';
import { MatchupGrade } from '../ui/MatchupGrade';
import { InstaPostCard } from '../ui/InstaPostCard';

export function AdminPanel({ plays, rosters }) {
  const isMobile = useIsMobile();
  const [selectedWeek, setSelectedWeek] = useState(18);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [previewPost, setPreviewPost] = useState(null);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const latestSeason = useMemo(() => plays.length > 0 ? plays[plays.length - 1].season : CURRENT_SEASON, [plays]);

  const weekGames = useMemo(() => {
    const weekPlays = plays.filter(p => p.season === latestSeason && p.week === selectedWeek);
    const gameMap = {};
    weekPlays.forEach(p => {
      if (!gameMap[p.gameId]) gameMap[p.gameId] = { gameId: p.gameId, teams: new Set() };
      gameMap[p.gameId].teams.add(p.off);
      gameMap[p.gameId].teams.add(p.def);
    });
    return Object.values(gameMap).map(g => {
      const teams = [...g.teams];
      const home = weekPlays.find(p => p.gameId === g.gameId && p.ha === "Home")?.off || teams[0];
      const away = teams.find(t => t !== home) || teams[1];
      return { ...g, home, away };
    }).filter(g => g.home && g.away);
  }, [plays, selectedWeek]);

  const generateAll = () => {
    const posts = weekGames.map(g => ({
      gameId: g.gameId,
      away: g.away,
      home: g.home,
      aStats: agg(plays, g.away),
      hStats: agg(plays, g.home),
      generated: new Date().toISOString(),
      status: "ready"
    }));
    setGeneratedPosts(posts);
  };

  return (
    <div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -1 }}>Admin — Post Manager</h2>
      <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>Generate and manage Instagram matchup posts for every game.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Week</label>
          <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {Array.from({ length: 18 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}
          </select>
        </div>
        <button onClick={generateAll} style={{ padding: "10px 24px", borderRadius: 10, background: "#f97316", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, height: 44 }}>
          <Zap size={16} /> Generate All ({weekGames.length} games)
        </button>
      </div>

      {generatedPosts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#16a34a", fontWeight: 600, marginBottom: 16 }}>
            {generatedPosts.length} posts generated and ready to preview
          </div>
        </div>
      )}

      {/* Post grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {(generatedPosts.length > 0 ? generatedPosts : weekGames.map(g => ({ away: g.away, home: g.home, aStats: agg(plays, g.away), hStats: agg(plays, g.home), status: "draft" }))).map((post, i) => {
          const aGrade = calcMatchupGrade(post.aStats, post.hStats, bl);
          const hGrade = calcMatchupGrade(post.hStats, post.aStats, bl);
          return (
            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {/* Mini preview */}
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", padding: 20, aspectRatio: "4/3" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Zap size={10} color="#f97316" />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#f97316", letterSpacing: 1.5, textTransform: "uppercase" }}>DownfieldOS</span>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{post.away}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{tn(post.away)}</div>
                    <MatchupGrade grade={aGrade} />
                  </div>
                  <span style={{ color: "#475569", fontWeight: 800, fontSize: 16 }}>@</span>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#f97316", fontFamily: "monospace" }}>{post.home}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{tn(post.home)}</div>
                    <MatchupGrade grade={hGrade} />
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{tn(post.away)} @ {tn(post.home)}</div>
                  <div style={{ fontSize: 11, color: post.status === "ready" ? "#16a34a" : "#94a3b8" }}>{post.status === "ready" ? "Ready to post" : "Draft"}</div>
                </div>
                <button onClick={() => setPreviewPost(post)} style={{ padding: "8px 14px", borderRadius: 8, background: "#f97316", border: "none", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Preview</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {previewPost && (
        <InstaPostCard
          away={previewPost.away} home={previewPost.home}
          aStats={previewPost.aStats} hStats={previewPost.hStats}
          bl={bl} rosters={rosters}
          onClose={() => setPreviewPost(null)}
        />
      )}
    </div>
  );
}
