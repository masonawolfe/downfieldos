import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, Flame, Star, Shield, GraduationCap } from "lucide-react";
import { T } from '../../data/teams';
import { genRoster2026 } from '../../utils/roster';
import { PLAYER_STATS_2025 } from '../../data/playerStats2025';
import contractYearData from '../../data/intelligence/contract_year_players.json';
import draftProspects from '../../data/draftProspects2026.json';
import { DRAFT_NEEDS_2026 } from '../../data/draftNeeds2026';
import { analyzeDraftPick } from '../../utils/draftAnalysis';
import { NewsletterCTA } from '../ui/NewsletterCTA';

const contractPlayers = contractYearData?.contract_year_players || [];

/**
 * Standalone player page at /player/:playerId
 * Supports both rostered players and draft prospects.
 */
export function PlayerPage() {
  const { playerId } = useParams();
  const slug = playerId?.toLowerCase() || '';

  // Try to find as a rostered player first
  const rosterMatch = useMemo(() => {
    for (const t of T) {
      const roster = genRoster2026(t.a);
      const allPlayers = [...(roster.offense || []), ...(roster.defense || [])];
      for (const p of allPlayers) {
        const pSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (pSlug === slug) return { player: p, team: t.a, teamName: t.n };
      }
    }
    return null;
  }, [slug]);

  // Try draft prospect
  const prospectMatch = useMemo(() => {
    return draftProspects.find(p => p.id === slug);
  }, [slug]);

  if (rosterMatch) return <RosteredPlayerView {...rosterMatch} />;
  if (prospectMatch) return <ProspectView prospect={prospectMatch} />;

  return (
    <div>
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", textDecoration: "none", fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={14} /> Back to dashboard
      </Link>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>Player not found</h2>
      <p style={{ color: "#64748b" }}>No player matched "{playerId}". Try searching from the Team Intel or War Room page.</p>
    </div>
  );
}

function RosteredPlayerView({ player, team, teamName }) {
  const gradeColor = player.grade === 'Elite' ? '#16a34a' : player.grade === 'Above Avg' ? '#2563eb' : player.grade === 'Average' ? '#eab308' : '#94a3b8';

  // Player stats
  const playerStats = useMemo(() => {
    const nameParts = player.name.split(' ');
    if (nameParts.length < 2) return null;
    const abbrev = nameParts[0][0] + '.' + nameParts[nameParts.length - 1];
    return PLAYER_STATS_2025.find(s => s.name === abbrev && s.team === team)
      || PLAYER_STATS_2025.find(s => s.name === abbrev);
  }, [player.name, team]);

  // Contract status
  const contractInfo = contractPlayers.find(p => p.player === player.name && p.team === team);

  return (
    <div>
      <Link to={`/team/${team.toLowerCase()}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", textDecoration: "none", fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={14} /> {team} — {teamName}
      </Link>

      {/* Header card */}
      <div style={{ background: "#0d1117", borderRadius: 16, padding: 28, marginBottom: 20, color: "#fff" }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{player.pos} — {team}</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 12px" }}>{player.name}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: gradeColor, fontFamily: "monospace" }}>{player.rating}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: gradeColor }}>{player.grade}</div>
            <div style={{ fontSize: 13, color: "#8B949E" }}>{player.trait}</div>
          </div>
        </div>
        {/* Rating bar */}
        <div style={{ marginTop: 16, maxWidth: 300 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
            <span>Rating</span><span>{player.rating}/100</span>
          </div>
          <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${player.rating}%`, background: gradeColor, borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {player.isNew && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#fff7ed", borderRadius: 12, border: "1px solid #fed7aa" }}>
            <Flame size={16} color="#f97316" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f97316" }}>New Addition</div>
              {player.deal && <div style={{ fontSize: 12, color: "#94a3b8" }}>{player.deal}</div>}
              {player.faNote && <div style={{ fontSize: 12, color: "#64748b" }}>{player.faNote}</div>}
            </div>
          </div>
        )}
        {contractInfo && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca" }}>
            <TrendingUp size={16} color="#dc2626" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>Contract Year</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{contractInfo.current_salary} — expires after 2026</div>
              {contractInfo.performance_incentive && <div style={{ fontSize: 12, color: "#94a3b8" }}>{contractInfo.performance_incentive}</div>}
            </div>
          </div>
        )}
      </div>

      {/* 2025 Season Stats */}
      {playerStats && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <BarChart3 size={18} color="#f97316" />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>2025 Season Stats</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 16 }}>
            {playerStats.pos === 'QB' && <>
              <BigStat label="COMP%" value={`${playerStats.comp_pct}%`} />
              <BigStat label="PASS YARDS" value={playerStats.passing_yards?.toLocaleString()} />
              <BigStat label="PASS TD" value={playerStats.passing_tds} />
              <BigStat label="INT" value={playerStats.interceptions} />
              <BigStat label="EPA/PLAY" value={playerStats.epa_per_play} />
              <BigStat label="SACKS" value={playerStats.sacks} />
            </>}
            {playerStats.pos === 'WR' && <>
              <BigStat label="TARGETS" value={playerStats.targets} />
              <BigStat label="RECEPTIONS" value={playerStats.receptions} />
              <BigStat label="REC YARDS" value={playerStats.receiving_yards?.toLocaleString()} />
              <BigStat label="REC TD" value={playerStats.receiving_tds} />
              <BigStat label="YPR" value={playerStats.ypr} />
            </>}
            {playerStats.pos === 'RB' && <>
              <BigStat label="CARRIES" value={playerStats.carries} />
              <BigStat label="RUSH YARDS" value={playerStats.rushing_yards?.toLocaleString()} />
              <BigStat label="YPC" value={playerStats.ypc} />
              <BigStat label="RUSH TD" value={playerStats.rushing_tds} />
              {playerStats.receptions > 0 && <BigStat label="REC" value={playerStats.receptions} />}
              {playerStats.receiving_yards > 0 && <BigStat label="REC YARDS" value={playerStats.receiving_yards} />}
            </>}
          </div>
        </div>
      )}

      {/* Scouting note */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <Star size={16} color="#f97316" /> Scouting Note
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "#334155", margin: 0 }}>
          {player.grade === 'Elite' && `${player.name} is one of the best at the position. Game-plan around this player. Opponents will scheme specifically to neutralize this matchup.`}
          {player.grade === 'Above Avg' && `${player.name} is a quality starter who can win individual matchups. Solid contributor who elevates the unit around them.`}
          {player.grade === 'Average' && `${player.name} is a competent starter but won't dominate. Scheme and matchup dependent — effective when protected by system design.`}
          {player.grade === 'Below Avg' && `${player.name} is a liability. Opponents will target this spot. ${team} needs to scheme around this weakness.`}
          {player.grade === 'TBD' && `${player.name} is ungraded — limited data available. Watch the preseason for role clarity.`}
        </p>
      </div>

      <NewsletterCTA />
    </div>
  );
}

function ProspectView({ prospect }) {
  // Find which teams this prospect fits best
  const topFitAnalysis = useMemo(() => {
    return (prospect.topFitTeams || []).slice(0, 3).map(team => {
      const result = analyzeDraftPick(team, prospect.id);
      return { team, ...result };
    });
  }, [prospect]);

  return (
    <div>
      <Link to="/war-room" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", textDecoration: "none", fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={14} /> War Room
      </Link>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 16, padding: 28, marginBottom: 20, color: "#fff" }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
          <GraduationCap size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
          2026 DRAFT PROSPECT
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 4px" }}>{prospect.name}</h2>
        <div style={{ fontSize: 14, color: "#94a3b8" }}>{prospect.position} — {prospect.school}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#f97316", fontFamily: "monospace" }}>Rd {prospect.projectedRound}</div>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Projected</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#e2e8f0", fontFamily: "monospace" }}>{prospect.projectedPick}</div>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Pick Range</div>
          </div>
          {prospect.height && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#e2e8f0", fontFamily: "monospace" }}>{prospect.height}</div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Height</div>
            </div>
          )}
          {prospect.weight && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#e2e8f0", fontFamily: "monospace" }}>{prospect.weight}</div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Weight</div>
            </div>
          )}
        </div>
      </div>

      {/* Summary + Comp */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20 }}>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "#334155", margin: "0 0 12px" }}>{prospect.summary}</p>
        {prospect.comparisonPlayer && (
          <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700 }}>NFL Comp: {prospect.comparisonPlayer}</div>
        )}
      </div>

      {/* Strengths / Risks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {prospect.strengths?.length > 0 && (
          <div style={{ background: "#f0fdf4", borderRadius: 14, border: "1px solid #bbf7d0", padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Strengths</div>
            {prospect.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: "#166534", marginBottom: 4 }}>+ {s}</div>)}
          </div>
        )}
        {prospect.risks?.length > 0 && (
          <div style={{ background: "#fef2f2", borderRadius: 14, border: "1px solid #fecaca", padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Risks</div>
            {prospect.risks.map((r, i) => <div key={i} style={{ fontSize: 13, color: "#991b1b", marginBottom: 4 }}>- {r}</div>)}
          </div>
        )}
      </div>

      {/* College Stats */}
      {prospect.collegeStats && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={16} color="#f97316" /> College Stats ({prospect.collegeStats.statsSeason})
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 16 }}>
            {prospect.collegeStats.completionPct && <BigStat label="COMP%" value={`${prospect.collegeStats.completionPct}%`} />}
            {prospect.collegeStats.passingYards && <BigStat label="PASS YDS" value={prospect.collegeStats.passingYards.toLocaleString()} />}
            {prospect.collegeStats.passingTDs && <BigStat label="TD" value={prospect.collegeStats.passingTDs} />}
            {prospect.collegeStats.interceptions != null && prospect.position === 'QB' && <BigStat label="INT" value={prospect.collegeStats.interceptions} />}
            {prospect.collegeStats.rushingYards && <BigStat label="RUSH YDS" value={prospect.collegeStats.rushingYards.toLocaleString()} />}
            {prospect.collegeStats.tackles && <BigStat label="TACKLES" value={prospect.collegeStats.tackles} />}
            {prospect.collegeStats.sacks && <BigStat label="SACKS" value={prospect.collegeStats.sacks} />}
            {prospect.collegeStats.receptions && <BigStat label="REC" value={prospect.collegeStats.receptions} />}
            {prospect.collegeStats.receivingYards && <BigStat label="REC YDS" value={prospect.collegeStats.receivingYards.toLocaleString()} />}
          </div>
        </div>
      )}

      {/* Combine Measurables */}
      {prospect.combineMeasurables && Object.values(prospect.combineMeasurables).some(Boolean) && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Combine Measurables</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 16 }}>
            {prospect.combineMeasurables.fortyYard && <BigStat label="40-YARD" value={`${prospect.combineMeasurables.fortyYard}s`} />}
            {prospect.combineMeasurables.benchPress && <BigStat label="BENCH" value={prospect.combineMeasurables.benchPress} />}
            {prospect.combineMeasurables.verticalJump && <BigStat label="VERT" value={`${prospect.combineMeasurables.verticalJump}"`} />}
            {prospect.combineMeasurables.broadJump && <BigStat label="BROAD" value={`${prospect.combineMeasurables.broadJump}"`} />}
            {prospect.combineMeasurables.threeConeDrill && <BigStat label="3-CONE" value={`${prospect.combineMeasurables.threeConeDrill}s`} />}
            {prospect.combineMeasurables.twentyYardShuttle && <BigStat label="SHUTTLE" value={`${prospect.combineMeasurables.twentyYardShuttle}s`} />}
          </div>
        </div>
      )}

      {/* Team Fit Analysis */}
      {topFitAnalysis.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={16} color="#f97316" /> Top Team Fits
          </h3>
          {topFitAnalysis.map(({ team, schemeFit, schemeFitScore, fantasyImpact }) => (
            <div key={team} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <Link to={`/team/${team.toLowerCase()}`} style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textDecoration: "none" }}>{team}</Link>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: schemeFitScore >= 85 ? "#16a34a" : "#ea580c" }}>{schemeFit} ({schemeFitScore})</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{fantasyImpact}</div>
            </div>
          ))}
        </div>
      )}

      {prospect.fitReason && (
        <div style={{ background: "#fff7ed", borderRadius: 14, border: "1px solid #fed7aa", padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#ea580c", fontWeight: 600 }}>{prospect.fitReason}</div>
        </div>
      )}

      <NewsletterCTA />
    </div>
  );
}

function BigStat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}
