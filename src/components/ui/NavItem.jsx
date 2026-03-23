export function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button role="menuitem" aria-current={active ? "page" : undefined} onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", background: active ? "#1e293b" : "transparent", border: "none", borderRadius: 10, color: active ? "#fff" : "#cbd5e1", cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400, transition: "all .15s", textAlign: "left", position: "relative", outline: "none" }} onFocus={e => { e.target.style.boxShadow = "0 0 0 2px #f97316"; }} onBlur={e => { e.target.style.boxShadow = "none"; }}>
      <Icon size={18} aria-hidden="true" /><span>{label}</span>
      {badge && <span style={{ position: "absolute", right: 12, background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8 }} aria-label={`${label} filter ${badge}`}>{badge}</span>}
    </button>
  );
}
