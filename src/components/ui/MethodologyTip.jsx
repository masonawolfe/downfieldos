import { useState } from "react";
import { HelpCircle } from "lucide-react";

const METHODOLOGIES = {
  matchupGrade: {
    label: "Matchup Grade",
    calc: "Compares offense efficiency vs defense stinginess across success rate, explosive play rate, and pass rate. A+ means dominant offensive advantage, F means the defense owns this matchup.",
  },
  boomPct: {
    label: "Boom %",
    calc: "Probability of a high-ceiling performance. Based on offensive explosive play rate + defensive explosive rate allowed. Higher = more big-play upside.",
  },
  bustPct: {
    label: "Bust %",
    calc: "Probability of a floor game. Inverse of offensive success rate + defensive stinginess. Higher = more risk of a dud.",
  },
  opportunityScore: {
    label: "Opportunity Score",
    calc: "Composite score (0-100) combining pass/rush volume, defensive weakness, explosive potential, and efficiency. Higher = better fantasy environment for this position.",
  },
  schemeFamiliarity: {
    label: "Scheme Familiarity",
    calc: "How similar the opponent's scheme is to what the QB practices against daily. Based on pass rate, explosive rate, and DNA profile overlap. Higher = more comfort.",
  },
  miseryIndex: {
    label: "Misery Index",
    calc: "Fan emotional state scored 1-10 from Reddit subreddit sentiment analysis. Combines anger, hope, excitement, and delusion metrics. Higher = more miserable.",
  },
  playerRating: {
    label: "Player Rating",
    calc: "Based on NFL draft capital, years of experience, and known performance level. Top-3 picks start higher. Peaks at years 4-8. Star players have manual overrides.",
  },
  edgeLabel: {
    label: "Edge Indicator",
    calc: "Rating difference between the two players. OFF +N means the offensive player is rated N points higher. DEF +N means the defender has the edge. EVEN = within 5 points.",
  },
};

export function MethodologyTip({ type, style: customStyle }) {
  const [show, setShow] = useState(false);
  const method = METHODOLOGIES[type];
  if (!method) return null;

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", ...customStyle }}>
      <HelpCircle
        size={13}
        color="#94a3b8"
        style={{ cursor: "help" }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      />
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          width: 260, background: "#0d1117", border: "1px solid #30363d", borderRadius: 10,
          padding: "12px 14px", zIndex: 5000, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{method.label}</div>
          <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5 }}>{method.calc}</div>
          <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, background: "#0d1117", border: "1px solid #30363d", borderTop: "none", borderLeft: "none", rotate: "45deg" }} />
        </div>
      )}
    </span>
  );
}
