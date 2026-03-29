import { Filter, RotateCcw } from "lucide-react";
import { DEFAULT_FILTERS } from '../../utils/filters';

export function FilterPanel({ filters, setFilters, playCount, totalCount }) {
  const update = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
  const isActive = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const selStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", fontWeight: 500, color: "#0f172a", width: "100%" };
  const lblStyle = { fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "#64748b", fontFamily: "monospace", marginBottom: 3 };
  const secStyle = { marginBottom: 14 };

  return (
    <div style={{ padding: "16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}><Filter size={14} /> Filters</div>
        {isActive && <button onClick={() => setFilters({ ...DEFAULT_FILTERS })} style={{ background: "none", border: "none", color: "#f97316", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><RotateCcw size={11} /> Reset</button>}
      </div>

      {isActive && (
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px", marginBottom: 14, fontSize: 11, color: "#94a3b8" }}>
          Showing <strong style={{ color: "#f97316" }}>{playCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} plays
        </div>
      )}

      <div style={secStyle}>
        <label htmlFor="filter-season" style={lblStyle}>Season</label>
        <select id="filter-season" value={filters.season} onChange={e => update("season", e.target.value)} style={selStyle}>
          <option value="all">All Seasons</option>
          <option value="2023">2023</option><option value="2024">2024</option><option value="2025">2025</option>
        </select>
      </div>

      <div style={secStyle}>
        <label style={lblStyle}>Weeks {filters.weekMin}–{filters.weekMax}</label>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="range" min={1} max={18} value={filters.weekMin} onChange={e => update("weekMin", Math.min(Number(e.target.value), filters.weekMax))} style={{ flex: 1, accentColor: "#f97316" }} aria-label={`Minimum week: ${filters.weekMin}`} />
          <input type="range" min={1} max={18} value={filters.weekMax} onChange={e => update("weekMax", Math.max(Number(e.target.value), filters.weekMin))} style={{ flex: 1, accentColor: "#f97316" }} aria-label={`Maximum week: ${filters.weekMax}`} />
        </div>
      </div>

      <div style={secStyle}>
        <label htmlFor="filter-down" style={lblStyle}>Down</label>
        <select id="filter-down" value={filters.down} onChange={e => update("down", e.target.value)} style={selStyle}>
          <option value="all">All Downs</option>
          <option value="1">1st Down</option><option value="2">2nd Down</option>
          <option value="3">3rd Down</option><option value="4">4th Down</option>
        </select>
      </div>

      <div style={secStyle}>
        <label htmlFor="filter-distance" style={lblStyle}>Distance</label>
        <select id="filter-distance" value={filters.distBucket} onChange={e => update("distBucket", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="short">Short (1-3)</option><option value="medium">Medium (4-7)</option><option value="long">Long (8+)</option>
        </select>
      </div>

      <div style={secStyle}>
        <label htmlFor="filter-fp" style={lblStyle}>Field Position</label>
        <select id="filter-fp" value={filters.fpZone} onChange={e => update("fpZone", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="own">Own Territory (1-50)</option><option value="mid">Midfield (51-79)</option><option value="rz">Red Zone (80+)</option>
        </select>
      </div>

      <div style={secStyle}>
        <label htmlFor="filter-quarter" style={lblStyle}>Quarter</label>
        <select id="filter-quarter" value={filters.quarter} onChange={e => update("quarter", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option>
        </select>
      </div>

      <div style={secStyle}>
        <label htmlFor="filter-context" style={lblStyle}>Game Context</label>
        <select id="filter-context" value={filters.scoreDiff} onChange={e => update("scoreDiff", e.target.value)} style={selStyle}>
          <option value="all">All Situations</option>
          <option value="winning">Winning</option><option value="losing">Losing</option>
          <option value="close">Close Game (within 7)</option><option value="blowout">Blowout (14+)</option>
        </select>
      </div>

      <div style={secStyle}>
        <label htmlFor="filter-homeaway" style={lblStyle}>Home / Away</label>
        <select id="filter-homeaway" value={filters.homeAway} onChange={e => update("homeAway", e.target.value)} style={selStyle}>
          <option value="all">All</option><option value="Home">Home</option><option value="Away">Away</option>
        </select>
      </div>

      <div style={secStyle}>
        <label htmlFor="filter-weather" style={lblStyle}>Weather</label>
        <select id="filter-weather" value={filters.env} onChange={e => update("env", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="Dome">Dome</option><option value="Clear">Clear</option>
          <option value="Rain">Rain</option><option value="Snow">Snow</option><option value="Wind">Wind</option>
        </select>
      </div>

      <div style={secStyle}>
        <label htmlFor="filter-personnel" style={lblStyle}>Personnel</label>
        <select id="filter-personnel" value={filters.pers} onChange={e => update("pers", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="11">11 (3WR/1TE/1RB)</option><option value="12">12 (2TE/1RB)</option>
          <option value="21">21 (1WR/1TE/2RB)</option><option value="13">13 (3TE/1RB)</option>
          <option value="22">22 (2TE/2RB)</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: filters.redZone ? "#f97316" : "#94a3b8", cursor: "pointer" }}>
          <input type="checkbox" checked={filters.redZone} onChange={e => update("redZone", e.target.checked)} style={{ accentColor: "#f97316" }} /> Red Zone Only
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: filters.twoMin ? "#f97316" : "#94a3b8", cursor: "pointer" }}>
          <input type="checkbox" checked={filters.twoMin} onChange={e => update("twoMin", e.target.checked)} style={{ accentColor: "#f97316" }} /> 2-Min Drill
        </label>
      </div>
    </div>
  );
}
