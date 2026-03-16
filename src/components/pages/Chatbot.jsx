import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useIsMobile } from '../../hooks/useIsMobile';
import { chatAnswer } from '../../utils/chatEngine';

export function Chatbot({ plays, rosters }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "bot", text: "Hey! I'm your DownfieldOS assistant. Ask me anything — try \"tell me about the Chiefs\" or \"who has the best offense?\" or \"how do I use filters?\"" }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMsgs(prev => [...prev, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => { setMsgs(prev => [...prev, { role: "bot", text: chatAnswer(q, plays, rosters) }]); }, 300);
  };
  if (!open) return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      <style>{`@keyframes chatPulse { 0%,100% { box-shadow: 0 4px 20px rgba(249,115,22,0.4); } 50% { box-shadow: 0 4px 30px rgba(249,115,22,0.7); } }`}</style>
      <button onClick={() => setOpen(true)} style={{ width: 56, height: 56, borderRadius: "50%", background: "#f97316", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", animation: "chatPulse 2s ease-in-out infinite" }}>
        <MessageCircle size={24} />
      </button>
      <div style={{ position: "absolute", top: -4, right: -4, background: "#2563eb", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 8, border: "2px solid #fff" }}>AI</div>
    </div>
  );
  return (
    <div style={{ position: "fixed", bottom: 24, right: isMobile ? 16 : 24, width: isMobile ? "calc(100vw - 32px)" : 400, height: 520, background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", background: "#0f172a", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><MessageCircle size={18} /><span style={{ fontWeight: 700 }}>DownfieldOS Assistant</span></div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={18} /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "#f97316" : "#f1f5f9", color: m.role === "user" ? "#fff" : "#334155", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 12, borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything..." style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} />
        <button onClick={send} style={{ padding: "10px 14px", borderRadius: 12, background: "#f97316", border: "none", color: "#fff", cursor: "pointer" }}><Send size={16} /></button>
      </div>
    </div>
  );
}
