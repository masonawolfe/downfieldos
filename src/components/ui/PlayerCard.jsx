import { useState, useEffect, useMemo } from "react";
import { X, TrendingUp, Star, Flame, Shield, BarChart3 } from "lucide-react";
import contractYearData from '../../data/intelligence/contract_year_players.json';
import { PLAYER_STATS_2025 } from '../../data/playerStats2025';

const contractPlayers = contractYearData?.contract_year_players || [];

export function PlayerCard({ player, team, onClose }) {
  if (!player) return null;

  // Check contract year status
  const contractInfo = contractPlayers.find(p =>
    p.player === player.name && p.team === team
  );

  // Find player stats — match by last name abbreviation pattern (nflverse uses "J.Allen")
  const playerStats = useMemo(() => {
    const nameParts = player.name.split(' ');
    if (nameParts.length < 2) return null;
    const abbrev = nameParts[0][0] + '.' + nameParts[nameParts.length - 1];
    return PLAYER_STATS_2025.find(s => s.name === abbrev && s.team === team)
      || PLAYER_STATS_2025.find(s => s.name === abbrev);
  }, [player.name, team]);

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const gradeColor = player.grade === 'Elite' ? '#16a34a' : player.grade === 'Above Avg' ? '#2563eb' : player.grade === 'Average' ? '#eab308' : '#94a3b8';

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 6000, backdropFilter: "blur(2px)" }} />

      {/* Card */}
      <div role="dialog" aria-label={`${player.name} player card`} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(400px, 90vw)", background: "#fff", borderRadius: 16, zIndex: 6001, boxShadow: "0 24px 48px rgba(0,0,0,0.2)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "#0d1117", padding: "20px 24px", color: "#fff" }}>
          <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={18} color="#64748b" />
          </button>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{player.pos} — {team}</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{player.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: gradeColor, fontFamily: "monospace" }}>{player.rating}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: gradeColor }}>{player.grade}</div>
              <div style={{ fontSize: 12, color: "#8B949E" }}>{player.trait}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 24px 20px" }}>

          {/* FA badge */}
          {player.isNew && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff7ed", borderRadius: 8, marginBottom: 12 }}>
              <Flame size={14} color="#f97316" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>New Addition</div>
                {player.deal && <div style={{ fontSize: 11, color: "#94a3b8" }}>{player.deal}</div>}
                {player.faNote && <div style={{ fontSize: 11, color: "#64748b" }}>{player.faNote}</div>}
              </div>
            </div>
          )}

          {/* Contract year badge */}
          {contractInfo && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fef2f2", borderRadius: 8, marginBottom: 12 }}>
              <TrendingUp size={14} color="#dc2626" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>Contract Year</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{contractInfo.current_salary} — expires after 2026</div>
                {contractInfo.performance_incentive && <div style={{ fontSize: 11, color: "#94a3b8" }}>{contractInfo.performance_incentive}</div>}
              </div>
            </div>
          )}

          {/* Rating bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
              <span>Rating</span>
              <span>{player.rating}/100</span>
            </div>
            <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${player.rating}%`, background: gradeColor, borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          </div>

          {/* 2025 Season Stats */}
          {playerStats && (
            <div style={{ marginBottom: 12, padding: "10px 12px", background: "#f8fafc", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <BarChart3 size={12} color="#64748b" />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>2025 Season</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {playerStats.pos === 'QB' && <>
                  <StatCell label="COMP%" value={`${playerStats.comp_pct}%`} />
                  <StatCell label="YARDS" value={playerStats.passing_yards?.toLocaleString()} />
                  <StatCell label="TD" value={playerStats.passing_tds} />
                  <StatCell label="INT" value={playerStats.interceptions} />
                  <StatCell label="EPA/PLAY" value={playerStats.epa_per_play} />
                  <StatCell label="SACKS" value={playerStats.sacks} />
                </>}
                {playerStats.pos === 'WR' && <>
                  <StatCell label="TARGETS" value={playerStats.targets} />
                  <StatCell label="REC" value={playerStats.receptions} />
                  <StatCell label="YARDS" value={playerStats.receiving_yards?.toLocaleString()} />
                  <StatCell label="TD" value={playerStats.receiving_tds} />
                  <StatCell label="YPR" value={playerStats.ypr} />
                </>}
                {playerStats.pos === 'RB' && <>
                  <StatCell label="CARRIES" value={playerStats.carries} />
                  <StatCell label="YARDS" value={playerStats.rushing_yards?.toLocaleString()} />
                  <StatCell label="YPC" value={playerStats.ypc} />
                  <StatCell label="RUSH TD" value={playerStats.rushing_tds} />
                  {playerStats.receptions > 0 && <StatCell label="REC" value={playerStats.receptions} />}
                  {playerStats.receiving_yards > 0 && <StatCell label="REC YDS" value={playerStats.receiving_yards} />}
                </>}
              </div>
            </div>
          )}

          {/* Position context */}
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
            {player.grade === 'Elite' && `${player.name} is one of the best at the position. Game-plan around this player.`}
            {player.grade === 'Above Avg' && `${player.name} is a quality starter who can win individual matchups. Solid contributor.`}
            {player.grade === 'Average' && `${player.name} is a competent starter but won't dominate. Scheme and matchup dependent.`}
            {player.grade === 'Below Avg' && `${player.name} is a liability. Opponents will target this spot.`}
            {player.grade === 'TBD' && `${player.name} is ungraded — limited data available. Watch the preseason.`}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCell({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}
