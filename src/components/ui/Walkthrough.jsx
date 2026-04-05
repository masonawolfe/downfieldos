import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";

const STEPS = [
  {
    title: "Pick Your Team",
    body: "Select your team in the sidebar. Everything in DownfieldOS orients around your pick — matchup previews, fantasy rankings, and intelligence signals.",
    target: "primary-team-select",
  },
  {
    title: "Matchup Intelligence",
    body: "9 intelligence signals per matchup — scheme familiarity, coaching trees, revenge games, and more. Not just numbers. Scouting reports.",
    highlight: "Matchup Preview",
  },
  {
    title: "Quick Search",
    body: "Press Cmd+K (or Ctrl+K) to instantly search for any team or module. Type 'Eagles' or 'Fantasy' and jump right there.",
    highlight: null,
  },
  {
    title: "Export Anything",
    body: "Podcast prep sheets, tweet threads, article drafts — generate and download content from any matchup in one click.",
    highlight: "Matchup Preview",
  },
  {
    title: "You're Set",
    body: "Explore the modules in the sidebar. DownfieldOS updates with new intelligence as the season develops.",
    highlight: null,
  },
];

export function Walkthrough({ onDismiss }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    // Mark walkthrough as seen
    return () => { localStorage.setItem('dfos-walkthrough-seen', 'true'); };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onDismiss} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 8000, backdropFilter: "blur(2px)", cursor: "pointer" }} />
      {/* Card */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(420px, 90vw)", background: "#161b22", border: "1px solid #30363d", borderRadius: 16, zIndex: 8001, padding: 28, boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center" }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === step ? "#f97316" : i < step ? "#22c55e" : "#30363d", transition: "background .2s" }} />
          ))}
        </div>

        {/* Close */}
        <button onClick={onDismiss} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 6, zIndex: 8002 }} aria-label="Close walkthrough">
          <X size={18} color="#8B949E" />
        </button>

        {/* Content */}
        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>{current.title}</h3>
        <p style={{ fontSize: 14, color: "#8B949E", lineHeight: 1.7, margin: "0 0 24px" }}>{current.body}</p>

        {/* Step counter + nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#484f58" }}>{step + 1} of {STEPS.length}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onDismiss} style={{ background: "none", border: "none", padding: "8px 16px", color: "#484f58", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Skip
            </button>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{ background: "#21262d", border: "none", borderRadius: 8, padding: "8px 16px", color: "#e2e8f0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Back
              </button>
            )}
            <button onClick={() => isLast ? onDismiss() : setStep(step + 1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f97316", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {isLast ? "Get Started" : "Next"} {!isLast && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function useWalkthrough() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Show walkthrough on first app visit (not landing page)
    if (!localStorage.getItem('dfos-walkthrough-seen')) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);
  return [show, () => setShow(false)];
}
