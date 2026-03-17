import { useRef, useState } from "react";
import { Zap } from "lucide-react";
import { calcMatchupGrade } from '../../utils/grading';
import { pct, tn } from '../../utils/formatters';
import { DNA } from '../../data/dna';
import { MatchupGrade } from './MatchupGrade';

export function InstaPostCard({ away, home, aStats, hStats, bl, rosters, onClose }) {
  const aGrade = calcMatchupGrade(aStats, hStats, bl);
  const hGrade = calcMatchupGrade(hStats, aStats, bl);
  const topMismatch = (() => {
    if (aStats.xr > bl.xr + .02 && hStats.dxr > bl.xr + .02) return `${tn(away)} explosive offense meets porous ${tn(home)} defense`;
    if (hStats.xr > bl.xr + .02 && aStats.dxr > bl.xr + .02) return `${tn(home)} explosive offense meets porous ${tn(away)} defense`;
    if (aStats.sr > bl.sr + .03) return `${tn(away)} offense is rolling — top-tier efficiency`;
    if (hStats.sr > bl.sr + .03) return `${tn(home)} at home with elite efficiency`;
    return `Evenly matched — execution decides it`;
  })();
  const aWR1 = rosters[away]?.offense.find(p => p.pos === "WR1");
  const hWR1 = rosters[home]?.offense.find(p => p.pos === "WR1");
  const aCB1 = rosters[away]?.defense.find(p => p.pos === "CB1");
  const hCB1 = rosters[home]?.defense.find(p => p.pos === "CB1");

  const cardRef = useRef(null);
  const FORMATS = [
    { id: "ig-portrait", label: "IG Portrait", w: 440, ratio: "4/5" },
    { id: "ig-square", label: "IG Square", w: 440, ratio: "1/1" },
    { id: "twitter", label: "Twitter", w: 520, ratio: "1200/675" },
    { id: "story", label: "Story/TikTok", w: 340, ratio: "9/16" },
  ];
  const [formatIdx, setFormatIdx] = useState(0);
  const fmt = FORMATS[formatIdx];
  const isCompact = fmt.id === "twitter";
  const isTall = fmt.id === "story";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: fmt.w, background: "#0f172a", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Format selector */}
        <div style={{ display: "flex", gap: 4, padding: "12px 16px", background: "#1e293b", justifyContent: "center" }}>
          {FORMATS.map((f, i) => (
            <button key={f.id} onClick={() => setFormatIdx(i)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid", borderColor: i === formatIdx ? "#f97316" : "#334155", background: i === formatIdx ? "#f97316" : "transparent", color: i === formatIdx ? "#fff" : "#94a3b8", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{f.label}</button>
          ))}
        </div>
        {/* Post card */}
        <div ref={cardRef} style={{ width: fmt.w, aspectRatio: fmt.ratio, background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", padding: isCompact ? 20 : isTall ? 28 : 32, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          {/* Decorative elements */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(249,115,22,0.08)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(249,115,22,0.05)" }} />

          {/* Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Zap size={16} color="#f97316" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f97316", letterSpacing: 2, textTransform: "uppercase" }}>DownfieldOS</span>
              <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto" }}>Matchup Preview</span>
            </div>

            {/* Teams */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 16, background: "#1e293b", border: "2px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{away}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{tn(away)}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{DNA[away].s}</div>
                <MatchupGrade grade={aGrade} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#475569" }}>@</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 16, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{home}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{tn(home)}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{DNA[home].s}</div>
                <MatchupGrade grade={hGrade} />
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
              {[["Pass Rate", aStats.pr, hStats.pr], ["Success Rate", aStats.sr, hStats.sr], ["Explosive", aStats.xr, hStats.xr], ["Completion", aStats.compRate, hStats.compRate]].map(([lbl, av, hv]) => (
                <div key={lbl} style={{ display: "contents" }}>
                  <div style={{ textAlign: "right", fontSize: 18, fontWeight: 800, color: av > hv ? "#f97316" : "#94a3b8", fontFamily: "monospace" }}>{pct(av)}</div>
                  <div style={{ textAlign: "center", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, padding: "0 8px" }}>{lbl}</div>
                  <div style={{ textAlign: "left", fontSize: 18, fontWeight: 800, color: hv > av ? "#f97316" : "#94a3b8", fontFamily: "monospace" }}>{pct(hv)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key mismatch */}
          <div style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#f97316", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Key Matchup</div>
            <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>{topMismatch}</div>
          </div>

          {/* Player battles */}
          {aWR1 && hCB1 && (
            <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
              <span>{aWR1.name} ({aWR1.rating}) vs {hCB1.name} ({hCB1.rating})</span>
              <span>{hWR1?.name} ({hWR1?.rating}) vs {aCB1?.name} ({aCB1?.rating})</span>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 12 }}>
            <div style={{ fontSize: 10, color: "#475569" }}>downfieldos.com</div>
            <div style={{ fontSize: 10, color: "#475569" }}>Swipe for full breakdown →</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 24px", display: "flex", gap: 12, background: "#1e293b" }}>
          <button onClick={() => { if(cardRef.current) { navigator.clipboard?.writeText(`${tn(away)} @ ${tn(home)} — Matchup Preview by DownfieldOS\n\n${topMismatch}\n\n${tn(away)} OFF Grade: ${aGrade} | ${tn(home)} OFF Grade: ${hGrade}\n\nKey stats:\nPass Rate: ${pct(aStats.pr)} vs ${pct(hStats.pr)}\nSuccess: ${pct(aStats.sr)} vs ${pct(hStats.sr)}\nExplosive: ${pct(aStats.xr)} vs ${pct(hStats.xr)}\n\n#NFL #DownfieldOS #${tn(away).replace(/\s/g,"")} #${tn(home).replace(/\s/g,"")}`); } }} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "#f97316", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Copy Caption</button>
          <button onClick={onClose} style={{ padding: "12px 16px", borderRadius: 10, background: "#334155", border: "none", color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}
