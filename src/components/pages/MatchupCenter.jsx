import { useState, useMemo, useEffect } from "react";
import { Swords, ChevronDown, ChevronRight } from "lucide-react";
import { useIsMobile } from '../../hooks/useIsMobile';
import { agg, lgbl } from '../../utils/aggregation';
import { pct, tn } from '../../utils/formatters';
import { matchupPreview, scriptedPlaysPreview, playerMatchupSummary } from '../../utils/narratives';
import { TeamSelect } from '../ui/TeamSelect';
import { MarkdownBlock } from '../ui/MarkdownBlock';
import { RatingBar } from '../ui/RatingBar';
import { MatchupGrade } from '../ui/MatchupGrade';

export function MatchupCenter({ plays, rosters, initialOff, initialDef }) {
  const isMobile = useIsMobile();
  const [offTm, setOffTm] = useState(initialOff || "KC");
  const [defTm, setDefTm] = useState(initialDef || "BUF");
  useEffect(() => { if (initialOff) setOffTm(initialOff); }, [initialOff]);
  useEffect(() => { if (initialDef) setDefTm(initialDef); }, [initialDef]);
  const [showPlayers, setShowPlayers] = useState(false);
  const os = useMemo(() => agg(plays, offTm), [plays, offTm]);
  const ds = useMemo(() => agg(plays, defTm), [plays, defTm]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const oR = rosters[offTm], dR = rosters[defTm];
  const preview = useMemo(() => matchupPreview(offTm, defTm, os, ds, bl), [offTm, defTm, os, ds, bl]);
  const offScript = useMemo(() => scriptedPlaysPreview(offTm, os, oR), [offTm, os, oR]);
  const defScript = useMemo(() => scriptedPlaysPreview(defTm, agg(plays, defTm), rosters[defTm]), [defTm, plays, rosters]);
  const playerMatchups = useMemo(() => playerMatchupSummary(oR, dR, offTm, defTm), [oR, dR, offTm, defTm]);

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -.5 }}>Matchup Preview</h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>A scouting report, not a stat sheet. Filters apply to underlying data.</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        <TeamSelect value={offTm} onChange={setOffTm} label="Offense" />
        <div style={{ fontSize: 24, color: "#94a3b8", fontWeight: 800, paddingBottom: 8 }}>vs</div>
        <TeamSelect value={defTm} onChange={setDefTm} label="Defense" />
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}><MarkdownBlock text={preview} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}><MarkdownBlock text={offScript} /></div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}><MarkdownBlock text={defScript} /></div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 20 }}>
        <button onClick={() => setShowPlayers(!showPlayers)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", borderBottom: showPlayers ? "1px solid #e2e8f0" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Swords size={20} color="#f97316" />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Player-Level Matchups</span>
            <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "2px 10px", borderRadius: 10 }}>{tn(offTm)} OFF vs {tn(defTm)} DEF</span>
          </div>
          {showPlayers ? <ChevronDown size={20} color="#94a3b8" /> : <ChevronRight size={20} color="#94a3b8" />}
        </button>
        {showPlayers && (
          <div style={{ padding: 24 }}>
            {playerMatchups.map((m, i) => {
              const edge = m.off.rating - m.def.rating;
              const edgeColor = edge > 10 ? "#16a34a" : edge < -10 ? "#dc2626" : "#eab308";
              const edgeLabel = edge > 10 ? "OFF +" + edge : edge < -10 ? "DEF +" + Math.abs(edge) : "EVEN";
              return (
                <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < playerMatchups.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f97316" }}>{m.label}</div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: edgeColor, background: edgeColor + "15", padding: "3px 10px", borderRadius: 8, fontFamily: "monospace" }}>{edgeLabel}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                    <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>OFFENSE</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{m.off.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{m.off.pos} | {m.off.grade} | {m.off.trait}</div>
                      <RatingBar value={m.off.rating} color="#16a34a" />
                    </div>
                    <div style={{ background: "#fef2f2", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>DEFENSE</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{m.def.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{m.def.pos} | {m.def.grade} | {m.def.trait}</div>
                      <RatingBar value={m.def.rating} color="#dc2626" />
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{m.verdict}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ background: "#0f172a", borderRadius: 16, padding: 24 }}>
        <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>By the Numbers</h3>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
          {[["Pass Rate", os.pr, ds.dpr, "Throw rate vs pass faced"], ["Success Rate", os.sr, ds.dsr, "Efficiency vs stinginess"], ["Explosive Rate", os.xr, ds.dxr, "Big plays vs prevention"], ["Completion", os.compRate, null, "Pass completion rate"], ["Sack Rate", os.sackRate, null, "How often QB is sacked"]].map(([lbl, ov, dv, desc]) => (
            <div key={lbl} style={{ background: "#1e293b", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace", marginBottom: 8 }}>{lbl}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#f97316", fontWeight: 700, fontSize: 20 }}>{pct(ov)}</span>
                {dv !== null && <span style={{ color: "#a855f7", fontWeight: 700, fontSize: 20 }}>{pct(dv)}</span>}
              </div>
              {dv !== null && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 8 }}><span>{offTm} OFF</span><span>{defTm} DEF</span></div>}
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
