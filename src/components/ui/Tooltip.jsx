import { useState } from "react";

/**
 * Hoverable tooltip that explains stat abbreviations.
 * Usage: <Tooltip text="Success Rate — % of plays gaining positive expected yards">SR</Tooltip>
 */
export function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: "relative", cursor: "help", borderBottom: "1px dotted #94a3b8" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      role="term"
      aria-label={text}
    >
      {children}
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          background: "#0f172a", color: "#e2e8f0", fontSize: 11, fontWeight: 500, padding: "6px 10px",
          borderRadius: 8, zIndex: 100, pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", maxWidth: 240, whiteSpace: "normal", lineHeight: 1.4,
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

/** Common stat abbreviation tooltips */
export const STAT_TIPS = {
  SR: "Success Rate — % of plays gaining positive expected yards",
  XR: "Explosive Rate — % of plays gaining 15+ yards (pass) or 10+ yards (rush)",
  PR: "Pass Rate — % of plays that are pass attempts",
  "Def SR": "Defensive Success Rate — % of opponent plays held to negative expected yards",
  "Def XR": "Defensive Explosive Rate — % of opponent plays going 15+ yards",
  EPA: "Expected Points Added — average points added per play above baseline",
  COMP: "Completion Percentage",
  YPR: "Yards Per Reception",
  YPC: "Yards Per Carry",
};
