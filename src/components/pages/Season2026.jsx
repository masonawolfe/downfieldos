import { useState, useMemo } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, BookOpen } from "lucide-react";
import { useIsMobile } from '../../hooks/useIsMobile';
import { T } from '../../data/teams';
import { DNA } from '../../data/dna';
import { DNA_2026 } from '../../data/dna2026';
import { OPPONENTS_2026 } from '../../data/opponents2026';
import { FA_MOVES_2026 } from '../../data/faMoves2026';
import { DRAFT_NEEDS_2026 } from '../../data/draftNeeds2026';
import { RECORDS_2025 } from '../../data/records2025';
import { agg, lgbl } from '../../utils/aggregation';
import { pct, tn } from '../../utils/formatters';
import { recordStr, projectAll32 } from '../../utils/projections';
import { genRoster2026 } from '../../utils/roster';
import { gmVoice, genNeeds } from '../../utils/narratives';
import { calcMatchupGrade } from '../../utils/grading';
import { MatchupGrade } from '../ui/MatchupGrade';
import { MarkdownBlock } from '../ui/MarkdownBlock';

export function Season2026({ plays, rosters, onNavigateMatchup }) {
  const isMobile = useIsMobile();
  const [myTeam, setMyTeam] = useState("BUF");
  const [viewMode, setViewMode] = useState("matchups"); // matchups | roster | needs
  const bl = useMemo(() => lgbl(plays), [plays]);

  const opp = OPPONENTS_2026[myTeam] || { home: [], away: [] };
  const allOpponents = [...opp.home.map(t => ({ team: t, loc: "HOME" })), ...opp.away.map(t => ({ team: t, loc: "AWAY" }))];
  // Deduplicate division (played twice — keep both as home/away)
  const myInfo = T.find(t => t.a === myTeam);
  const dna26 = DNA_2026[myTeam] || DNA[myTeam];
  const fa = FA_MOVES_2026[myTeam] || { added: [], lost: [] };
  const needs = DRAFT_NEEDS_2026[myTeam] || [];

  const posColor = p => {
    if (["QB"].includes(p)) return "#dc2626";
    if (["RB","WR","TE"].includes(p)) return "#f97316";
    if (["EDGE","DL","DT"].includes(p)) return "#2563eb";
    if (["CB","S","LB"].includes(p)) return "#7c3aed";
    if (["OL","OT","OG","C"].includes(p)) return "#059669";
    return "#64748b";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <TrendingUp size={20} color="#f97316" />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0 }}>2026 Season Preview</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Opponents confirmed — weekly schedule TBD. Updated with free agency moves.</p>
      </div>

      {/* Team Selector */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>My Team</label>
          <select value={myTeam} onChange={e => setMyTeam(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, background: "#fff", cursor: "pointer" }}>
            {T.map(t => <option key={t.a} value={t.a}>{t.a} — {t.n}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["matchups","projections","roster","needs"].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: "7px 16px", borderRadius: 8, border: viewMode === m ? "2px solid #f97316" : "1px solid #e2e8f0", background: viewMode === m ? "#fff7ed" : "#fff", fontSize: 12, fontWeight: 700, color: viewMode === m ? "#f97316" : "#64748b", cursor: "pointer", textTransform: "capitalize" }}>
              {m === "matchups" ? "Opponents" : m === "projections" ? "Win Projections" : m === "roster" ? "2026 Roster" : "Draft Needs"}
            </button>
          ))}
        </div>
      </div>

      {/* Team Identity Card */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 24, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, fontFamily: "monospace" }}>{myTeam}</div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>{myInfo?.n} — {myInfo?.c} {myInfo?.d}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f97316", marginTop: 6 }}>{dna26.s}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>2025 Record</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace" }}>{recordStr(myTeam)}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>17 games confirmed</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 12 : 24, marginTop: 16, flexWrap: "wrap" }}>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Pass Rate</div><div style={{ fontSize: 18, fontWeight: 800 }}>{(dna26.p * 100).toFixed(0)}%</div></div>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Efficiency</div><div style={{ fontSize: 18, fontWeight: 800 }}>{(dna26.e * 100).toFixed(0)}%</div></div>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Explosive</div><div style={{ fontSize: 18, fontWeight: 800 }}>{(dna26.x * 100).toFixed(0)}%</div></div>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Home Games</div><div style={{ fontSize: 18, fontWeight: 800 }}>{opp.home.length}</div></div>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Away Games</div><div style={{ fontSize: 18, fontWeight: 800 }}>{opp.away.length}</div></div>
        </div>
      </div>

      {/* -- MATCHUPS VIEW -- */}
      {viewMode === "matchups" && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>2026 Opponents</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {allOpponents.map((oItem, i) => {
              const oppDna = DNA_2026[oItem.team] || DNA[oItem.team];
              const oppRec = RECORDS_2025[oItem.team];
              const oppStats = agg(plays, oItem.team);
              const myStats = agg(plays, myTeam);
              const grade = oItem.loc === "HOME" ? calcMatchupGrade(myStats, oppStats, bl) : calcMatchupGrade(myStats, oppStats, bl);
              const isDivision = T.find(t => t.a === oItem.team)?.d === myInfo?.d && T.find(t => t.a === oItem.team)?.c === myInfo?.c;
              return (
                <div key={`${oItem.team}-${oItem.loc}-${i}`}
                  onClick={() => onNavigateMatchup && onNavigateMatchup(myTeam, oItem.team)}
                  style={{ background: "#fff", borderRadius: 12, border: isDivision ? "2px solid #f97316" : "1px solid #e2e8f0", padding: 16, cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: "#0f172a" }}>{oItem.team}</span>
                      {isDivision && <span style={{ fontSize: 9, fontWeight: 700, background: "#fff7ed", color: "#f97316", padding: "2px 6px", borderRadius: 4 }}>DIV</span>}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: oItem.loc === "HOME" ? "#dcfce7" : "#fef3c7", color: oItem.loc === "HOME" ? "#166534" : "#92400e" }}>
                      {oItem.loc === "HOME" ? "HOME" : "AWAY"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{tn(oItem.team)} — {oppDna?.s}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>2025: {recordStr(oItem.team)}</span>
                    <MatchupGrade grade={grade} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: "#f8fafc", borderRadius: 10, fontSize: 12, color: "#64748b" }}>
            <span style={{ fontWeight: 700, color: "#f97316" }}>DIV</span> = division game (played twice). Click any card to open full Matchup Center analysis.
          </div>
        </div>
      )}

      {/* -- WIN PROJECTIONS VIEW -- */}
      {viewMode === "projections" && (() => {
        const all32 = projectAll32();
        const proj = all32[myTeam];
        if (!proj) return <div>No projection data available.</div>;
        const pW = proj.projectedWins;
        // Bar color based on projected wins
        const barColor = w => w >= 11 ? "#22c55e" : w >= 9 ? "#f97316" : w >= 7 ? "#eab308" : "#ef4444";
        return (
          <div>
            {/* Season Outlook Card */}
            <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 16, padding: 24, marginBottom: 20, color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5 }}>Projected Record</div>
                  <div style={{ fontSize: 40, fontWeight: 900, fontFamily: "monospace", lineHeight: 1 }}>{pW.toFixed(1)}<span style={{ fontSize: 20, color: "#64748b" }}>-{(17 - pW).toFixed(1)}</span></div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Range: {proj.floor}–{proj.ceiling} wins (90% confidence)</div>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Win Rank</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: proj.winsRank <= 8 ? "#22c55e" : proj.winsRank <= 16 ? "#f97316" : "#ef4444" }}>#{proj.winsRank}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>SOS Rank</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#94a3b8" }}>#{proj.sosRank}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>of 32</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Div Record</div>
                    <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "monospace" }}>{proj.divWins.toFixed(1)}<span style={{ fontSize: 14, color: "#64748b" }}>-{(proj.divGames - proj.divWins).toFixed(1)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game-by-Game Win Probability */}
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Game-by-Game Win Probability</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
              {proj.games.map((g, i) => {
                const wp = (g.winProb * 100);
                const isDivGame = (() => { const oi = T.find(t => t.a === g.opp); return oi && oi.c === myInfo?.c && oi.d === myInfo?.d; })();
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, width: 32, color: "#64748b", textAlign: "right" }}>G{i+1}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "monospace", width: 36, color: "#0f172a" }}>{g.opp}</span>
                    <span style={{ fontSize: 10, width: 40, color: g.isHome ? "#166534" : "#92400e", fontWeight: 600 }}>{g.loc}</span>
                    {isDivGame && <span style={{ fontSize: 8, fontWeight: 700, background: "#fff7ed", color: "#f97316", padding: "1px 4px", borderRadius: 3 }}>DIV</span>}
                    <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 18, position: "relative", overflow: "hidden" }}>
                      <div style={{ width: `${wp}%`, height: "100%", background: wp >= 60 ? "#22c55e" : wp >= 45 ? "#f97316" : "#ef4444", borderRadius: 4, transition: "width .3s" }} />
                      <span style={{ position: "absolute", right: 6, top: 1, fontSize: 10, fontWeight: 700, color: "#334155" }}>{wp.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hardest / Easiest Stretch */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "#fef2f2", borderRadius: 12, padding: 16 }}>
                <h5 style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", margin: "0 0 8px" }}>Toughest Matchups</h5>
                {proj.hardest3.map((g, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                    <span style={{ fontWeight: 700 }}>{g.loc === "AWAY" ? "@" : "vs"} {tn(g.opp)}</span>
                    <span style={{ color: "#dc2626", fontWeight: 700 }}>{(g.winProb * 100).toFixed(0)}% win</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 16 }}>
                <h5 style={{ fontSize: 12, fontWeight: 700, color: "#166534", margin: "0 0 8px" }}>Easiest Matchups</h5>
                {proj.easiest3.map((g, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                    <span style={{ fontWeight: 700 }}>{g.loc === "AWAY" ? "@" : "vs"} {tn(g.opp)}</span>
                    <span style={{ color: "#166534", fontWeight: 700 }}>{(g.winProb * 100).toFixed(0)}% win</span>
                  </div>
                ))}
              </div>
            </div>

            {/* League-wide Rankings */}
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>League-Wide Win Projections</h4>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16, maxHeight: 400, overflowY: "auto" }}>
              {T.map(t => t.a).sort((a, b) => (all32[b]?.projectedWins || 0) - (all32[a]?.projectedWins || 0)).map((tm, i) => {
                const p = all32[tm];
                if (!p) return null;
                const w = p.projectedWins;
                const isMe = tm === myTeam;
                return (
                  <div key={tm} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 4px", background: isMe ? "#fff7ed" : "transparent", borderRadius: 6, border: isMe ? "1px solid #fed7aa" : "none", marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", width: 20, textAlign: "right" }}>{i+1}</span>
                    <span style={{ fontSize: 12, fontWeight: isMe ? 900 : 700, fontFamily: "monospace", width: 36, color: isMe ? "#f97316" : "#0f172a" }}>{tm}</span>
                    <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 14, position: "relative", overflow: "hidden" }}>
                      <div style={{ width: `${(w / 17) * 100}%`, height: "100%", background: barColor(w), borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "monospace", width: 50, textAlign: "right", color: "#334155" }}>{w.toFixed(1)}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", width: 50, textAlign: "right" }}>{p.floor}-{p.ceiling}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* -- ROSTER VIEW (MERGED 2026 PROJECTION) -- */}
      {viewMode === "roster" && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Projected 2026 Roster</h3>
          {fa.note && <p style={{ fontSize: 13, color: "#f97316", fontWeight: 600, margin: "4px 0 12px" }}>{fa.note}</p>}

          {/* Transaction Summary */}
          {(fa.added.length > 0 || fa.lost.length > 0) && (
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {fa.added.length > 0 && (
                <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><ArrowUpRight size={12} /> {fa.added.length} Added</div>
                  <div style={{ fontSize: 12, color: "#334155" }}>{fa.added.map(p => p.name).join(", ")}</div>
                </div>
              )}
              {fa.lost.length > 0 && (
                <div style={{ flex: 1, background: "#fef2f2", borderRadius: 10, padding: "10px 14px", border: "1px solid #fecaca" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><ArrowDownRight size={12} /> {fa.lost.length} Lost</div>
                  <div style={{ fontSize: 12, color: "#334155" }}>{fa.lost.map(p => p.name).join(", ")}</div>
                </div>
              )}
            </div>
          )}

          {/* Merged Depth Chart */}
          {(() => {
            const projected = genRoster2026(myTeam);
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {["offense","defense"].map(side => {
                  const players = projected[side] || [];
                  return (
                    <div key={side} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16 }}>
                      <h5 style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px", display: "flex", justifyContent: "space-between" }}>
                        <span>{side}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>{players.filter(p => p.isNew).length} new</span>
                      </h5>
                      {players.map((pl, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "6px 8px", marginBottom: 2, borderRadius: 6,
                          background: pl.isNew ? "#f0fdf4" : "transparent",
                          border: pl.isNew ? "1px solid #bbf7d0" : "1px solid transparent",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: posColor(pl.pos.replace(/[0-9]/g,"")), minWidth: 36 }}>{pl.pos}</span>
                            <span style={{ fontSize: 12, fontWeight: pl.isNew ? 800 : 600, color: "#0f172a" }}>{pl.name}</span>
                            {pl.isNew && <span style={{ fontSize: 8, fontWeight: 800, background: "#22c55e", color: "#fff", padding: "1px 5px", borderRadius: 3, marginLeft: 4 }}>NEW</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {pl.deal && <span style={{ fontSize: 9, color: "#059669", fontWeight: 600 }}>{pl.deal}</span>}
                            {pl.faNote && <span style={{ fontSize: 9, color: "#64748b", fontStyle: "italic" }}>{pl.faNote}</span>}
                            {!pl.isNew && <span style={{ fontSize: 10, color: "#94a3b8" }}>{pl.rating}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          {genRoster2026(myTeam).note && (
            <div style={{ marginTop: 12, padding: 10, background: "#fff7ed", borderRadius: 8, fontSize: 12, color: "#92400e", fontWeight: 600 }}>
              {genRoster2026(myTeam).note}
            </div>
          )}
        </div>
      )}

      {/* -- DRAFT NEEDS VIEW -- */}
      {viewMode === "needs" && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>2026 Draft Priorities</h3>

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {needs.map((pos, i) => (
              <div key={pos} style={{ flex: 1, background: i === 0 ? "linear-gradient(135deg, #f97316, #ea580c)" : "#fff", borderRadius: 14, padding: 20, border: i > 0 ? "1px solid #e2e8f0" : "none", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? "#fff9" : "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Priority {i + 1}</div>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "monospace", color: i === 0 ? "#fff" : posColor(pos) }}>{pos}</div>
                <div style={{ fontSize: 11, color: i === 0 ? "#ffffffcc" : "#64748b", marginTop: 4 }}>
                  {i === 0 ? "Primary Need" : i === 1 ? "Secondary" : i === 2 ? "Day 2 Target" : "Depth"}
                </div>
              </div>
            ))}
          </div>

          {/* Data-Driven Needs from play analysis */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: "0 0 8px" }}>Analytics-Based Assessment</h4>
            {(() => {
              const stats = agg(plays, myTeam);
              const computedNeeds = genNeeds(myTeam, stats, bl);
              return computedNeeds.map((n, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 14, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{n.need}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: n.severity === "High" ? "#fef2f2" : n.severity === "Medium" ? "#fff7ed" : "#f0fdf4", color: n.severity === "High" ? "#dc2626" : n.severity === "Medium" ? "#ea580c" : "#166534" }}>{n.severity}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{n.weakness}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>Archetype: {n.archetype}</div>
                </div>
              ));
            })()}
          </div>

          {/* GM Voice */}
          <div style={{ background: "#0f172a", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <BookOpen size={14} color="#f97316" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: 1.5 }}>GM Memo</span>
            </div>
            <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>
              <MarkdownBlock text={gmVoice(myTeam, agg(plays, myTeam), bl, genNeeds(myTeam, agg(plays, myTeam), bl))} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
