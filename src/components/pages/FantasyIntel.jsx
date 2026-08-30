import { useState, useMemo } from "react";
import { Flame, AlertTriangle } from "lucide-react";
import { T } from '../../data/teams';
import { DNA } from '../../data/dna';
import { agg, lgbl } from '../../utils/aggregation';
import { CURRENT_SEASON } from '../../config';
import { calcMatchupGrade } from '../../utils/grading';
import { pct, tn } from '../../utils/formatters';
import { downloadCSV } from '../../utils/csvExport';
import { MatchupGrade } from '../ui/MatchupGrade';
import { RatingBar } from '../ui/RatingBar';
import { MethodologyTip } from '../ui/MethodologyTip';
import { PlayerLink } from '../ui/PlayerLink';
import contractYearData from '../../data/intelligence/contract_year_players.json';
import { InsightCard } from '../ui/InsightCard';
import { NewsletterCTA } from '../ui/NewsletterCTA';
import { ExportButton } from '../ui/ExportButton';
import { ContractYearCard } from '../ui/ContractYearCard';
import { byeWeekFor, teamsOnByeInWeek, opponentInWeek } from '../../utils/schedule';
import { injuryFor } from '../../utils/injuries';
import { PERSONAS, evaluate } from '../../utils/valuation';

const INJ_BADGE = {
  Out:          { color: '#dc2626', bg: '#dc262615', label: 'OUT' },
  Doubtful:     { color: '#ea580c', bg: '#ea580c15', label: 'D' },
  Questionable: { color: '#eab308', bg: '#eab30815', label: 'Q' },
};

export function FantasyIntel({ plays, rosters, primaryTeam }) {
  const [posFilter, setPosFilter] = useState("QB");
  const [selectedWeek, setSelectedWeek] = useState(18);
  const [personaKey, setPersonaKey] = useState('MASON');
  const persona = useMemo(() => PERSONAS.find(p => p.key === personaKey) || PERSONAS[0], [personaKey]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const latestSeason = useMemo(() => plays.length > 0 ? plays[plays.length - 1].season : CURRENT_SEASON, [plays]);

  // Generate fantasy matchup board
  const matchupBoard = useMemo(() => {
    const weekPlays = plays.filter(p => p.season === latestSeason && p.week === selectedWeek);
    const gameMap = {};
    weekPlays.forEach(p => {
      if (!gameMap[p.gameId]) gameMap[p.gameId] = { teams: new Set() };
      gameMap[p.gameId].teams.add(p.off);
      gameMap[p.gameId].teams.add(p.def);
    });
    const matchups = [];
    Object.values(gameMap).forEach(g => {
      const teams = [...g.teams];
      if (teams.length >= 2) {
        matchups.push([teams[0], teams[1]]);
        matchups.push([teams[1], teams[0]]);
      }
    });

    return matchups.map(([off, def]) => {
      const oStats = agg(plays, off), dStats = agg(plays, def);
      const oR = rosters[off], dR = rosters[def];
      const d = DNA[off];

      // Fantasy opportunity scores by position
      const passVol = oStats.pr * 35; // estimated pass attempts per game
      const rushVol = (1 - oStats.pr) * 30;
      const defPassSR = dStats.dsr;
      const defExpRate = dStats.dxr;

      // QB score: pass volume + efficiency environment + explosive upside
      const qbScore = (passVol / 35) * 30 + (defPassSR / (bl.sr || 0.45)) * 25 + (oStats.xr / (bl.xr || 0.08)) * 25 + (oStats.compRate / (bl.compRate || 0.62)) * 20;
      const unknown = { name: "TBD", grade: "TBD", rating: 65, pos: "?" };
      const qb = oR.offense.find(p => p.pos === "QB") || unknown;

      // RB score: rush volume + receiving + defense weakness
      const rbScore = (rushVol / 30) * 30 + (dStats.dsr / (bl.sr || 0.45)) * 25 + (d.p < 0.52 ? 15 : 5) + (oStats.sr / (bl.sr || 0.45)) * 20;
      const rb = oR.offense.find(p => p.pos === "RB1") || unknown;

      // WR1 score: pass volume + explosive + target share proxy
      const wr1Score = (passVol / 35) * 25 + (defExpRate / (bl.xr || 0.08)) * 25 + (oStats.xr / (bl.xr || 0.08)) * 25 + (d.p > 0.56 ? 15 : 5);
      const wr1 = oR.offense.find(p => p.pos === "WR1") || unknown;

      // TE score
      const te = oR.offense.find(p => p.pos === "TE") || unknown;
      // teScore: trait-based branch removed 2026-08-30 (CoS finding #2).
      // Previously `te.trait === "Receiving TE" ? 30 : 10` — the trait was
      // assigned by name length and carried no information. Using the
      // baseline (10) keeps the score shape stable until a real receiving-TE
      // signal (route participation, snap share) is wired in.
      const teScore = (passVol / 35) * 20 + 10 + (defPassSR / (bl.sr || 0.45)) * 20 + (dStats.dxr > bl.xr ? 15 : 5);

      // Boom/bust
      const boomProb = (off2) => Math.min(0.95, Math.max(0.05, (oStats.xr + defExpRate) / 2 * 5 + (oStats.sr > bl.sr + 0.03 ? 0.1 : 0)));
      const bustProb = (off2) => Math.min(0.95, Math.max(0.05, 0.5 - oStats.sr * 0.5 + (dStats.dsr < bl.sr - 0.02 ? 0.15 : 0)));

      return {
        off, def, oStats, dStats,
        QB: { player: qb, score: qbScore, boom: boomProb("qb"), bust: bustProb("qb") },
        RB: { player: rb, score: rbScore, boom: boomProb("rb") * 0.85, bust: bustProb("rb") * 1.1 },
        WR: { player: wr1, score: wr1Score, boom: boomProb("wr"), bust: bustProb("wr") },
        TE: { player: te, score: teScore, boom: boomProb("te") * 0.7, bust: bustProb("te") * 1.2 },
      };
    });
  }, [plays, rosters, selectedWeek, bl]);

  // Persona-adjusted ranking: keep the raw opportunity score in tact, but sort
  // by opportunity × persona value delta so a Ceiling-first (Howie) drafter
  // gets high-upside players surfaced ahead of same-opportunity floor plays.
  const sorted = useMemo(() => {
    return [...matchupBoard]
      .map(item => {
        const pos = item[posFilter];
        if (!pos || !pos.player) return { item, adj: -Infinity };
        const v = evaluate(
          {
            name: pos.player.name,
            position: posFilter,
            rating: pos.player.rating,
            contract_year: contractYearNames.has(pos.player.name),
            injury_status: injuryFor(pos.player.name, item.off)?.status,
          },
          persona
        );
        // Persona value is 5-40; multiply into opportunity so we keep the
        // matchup shape but let persona break ties + reorder tiers.
        return { item, adj: (pos.score || 0) * (0.5 + v.value / 40), personaValue: v.value, personaNote: v.note };
      })
      .sort((a, b) => b.adj - a.adj)
      .map(x => x.item);
  }, [matchupBoard, posFilter, persona, contractYearNames]);

  const contractYearNames = useMemo(() => {
    const players = contractYearData?.contract_year_players || [];
    return new Set(players.map(p => p.player));
  }, []);

  function FantasyRow({ item, rank }) {
    const pos = item[posFilter];
    if (!pos || !pos.player) return null;
    const grade = pos.score > 85 ? "A+" : pos.score > 75 ? "A" : pos.score > 65 ? "B+" : pos.score > 55 ? "B" : pos.score > 45 ? "C" : "D";
    const gradeColor = pos.score > 75 ? "#16a34a" : pos.score > 55 ? "#2563eb" : pos.score > 45 ? "#eab308" : "#dc2626";
    const boomPct = Math.round(pos.boom * 100);
    const bustPct = Math.round(pos.bust * 100);
    const isMyTeam = primaryTeam && item.off === primaryTeam;
    const isContractYear = contractYearNames.has(pos.player.name);
    const injury = injuryFor(pos.player.name, item.off);
    const injBadge = injury ? INJ_BADGE[injury.status] : null;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: isMyTeam ? "#fff7ed" : "transparent", borderLeft: isMyTeam ? "3px solid #f97316" : "3px solid transparent" }}>
        <div style={{ width: 28, fontSize: 14, fontWeight: 800, color: rank <= 3 ? "#f97316" : rank <= 8 ? "#0f172a" : "#94a3b8", fontFamily: "monospace" }}>#{rank}</div>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: gradeColor + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: gradeColor, fontFamily: "monospace" }}>{grade}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}><PlayerLink player={pos.player} team={item.off}>{pos.player.name}</PlayerLink></span>
            {injBadge && (
              <span title={`${injury.status}${injury.injury ? ' — ' + injury.injury : ''}`} style={{ fontSize: 9, fontWeight: 800, color: injBadge.color, background: injBadge.bg, padding: "1px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{injBadge.label}</span>
            )}
            {isContractYear && <span style={{ fontSize: 9, fontWeight: 800, color: "#f97316", background: "#f9731615", padding: "1px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Contract Yr</span>}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{tn(item.off)} {posFilter} vs {tn(item.def)}</div>
        </div>
        <div style={{ width: 100 }}>
          <RatingBar value={Math.round(pos.score)} label="" />
        </div>
        <div style={{ display: "flex", gap: 8, width: 120 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}>{boomPct}%</div>
            <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" }}>Boom</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#dc2626" }}>{bustPct}%</div>
            <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" }}>Bust</div>
          </div>
        </div>
      </div>
    );
  }

  // Best and worst environments
  const bestEnv = sorted[0];
  const worstEnv = sorted[sorted.length - 1];

  return (
    <div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -1 }}>Fantasy Intel</h2>
      <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>Matchup-based opportunity scores, boom/bust probability, and rankings.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Position</label>
          <div style={{ display: "flex", gap: 4 }}>
            {["QB", "RB", "WR", "TE"].map(pos => (
              <button key={pos} onClick={() => setPosFilter(pos)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid", borderColor: posFilter === pos ? "#f97316" : "#e2e8f0", background: posFilter === pos ? "#f97316" : "#fff", color: posFilter === pos ? "#fff" : "#0f172a", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{pos}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Week</label>
          <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {Array.from({ length: 18 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label title="Format + horizon + risk bundled into a named GM persona (P1-1)" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Mode</label>
          <div style={{ display: "flex", gap: 4 }}>
            {PERSONAS.map(p => (
              <button key={p.key} onClick={() => setPersonaKey(p.key)} title={p.description} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid", borderColor: personaKey === p.key ? "#f97316" : "#e2e8f0", background: personaKey === p.key ? "#f97316" : "#fff", color: personaKey === p.key ? "#fff" : "#0f172a", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{p.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, marginTop: -8 }}>
        <strong>{persona.label}</strong> — {persona.description}
      </div>

      {/* Bye-week context — real 2026 schedule */}
      {(() => {
        const byeTeams = teamsOnByeInWeek(selectedWeek);
        const primaryBye = primaryTeam ? byeWeekFor(primaryTeam) : null;
        const primaryOnBye = primaryTeam && primaryBye === selectedWeek;
        if (!byeTeams.length && !primaryBye) return null;
        return (
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", fontSize: 13, color: "#7c2d12" }}>
            {byeTeams.length > 0 && (
              <span>
                <strong>{byeTeams.length}</strong> {byeTeams.length === 1 ? "team" : "teams"} on bye Week {selectedWeek}: {byeTeams.map(t => tn(t)).join(", ")}
              </span>
            )}
            {primaryTeam && primaryBye != null && (
              <span style={{ marginLeft: byeTeams.length ? 0 : 0, fontWeight: primaryOnBye ? 700 : 500 }}>
                {tn(primaryTeam)} bye: Week {primaryBye}{primaryOnBye ? " — that's this week." : ""}
              </span>
            )}
          </div>
        );
      })()}

      {/* Top insight */}
      {bestEnv && bestEnv[posFilter] && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <InsightCard tone="positive" icon={Flame} stat={Math.round(bestEnv[posFilter].score).toString()}
            headline={`Best ${posFilter} environment: ${bestEnv[posFilter].player?.name}`}
            body={`${tn(bestEnv.off)} vs ${tn(bestEnv.def)} — ${bestEnv[posFilter].boom > 0.3 ? "high ceiling week" : "solid floor"}. ${posFilter === "QB" ? `Pass volume projects high against a defense allowing ${pct(bestEnv.dStats.dsr)} success rate.` : posFilter === "RB" ? `This run game should find lanes against a defense giving up yards.` : `Receivers should eat against this secondary.`}`} />
          {worstEnv && worstEnv[posFilter] && (
            <InsightCard tone="negative" icon={AlertTriangle} stat={Math.round(worstEnv[posFilter].score).toString()}
              headline={`Worst ${posFilter} environment: ${worstEnv[posFilter].player?.name}`}
              body={`${tn(worstEnv.off)} vs ${tn(worstEnv.def)} — tough sledding. ${worstEnv.dStats.dsr < bl.sr - 0.02 ? "This defense is stingy." : "The offense's efficiency is the problem here."}`} />
          )}
        </div>
      )}

      {/* Rankings table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{posFilter} Matchup Rankings — Week {selectedWeek}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ExportButton onClick={() => {
              const headers = ["Rank", "Player", "Team", "Opponent", "Score", "Grade", "Boom%", "Bust%"];
              const rows = sorted.slice(0, 16).map((item, i) => {
                const pos = item[posFilter];
                if (!pos || !pos.player) return null;
                const grade = pos.score > 85 ? "A+" : pos.score > 75 ? "A" : pos.score > 65 ? "B+" : pos.score > 55 ? "B" : pos.score > 45 ? "C" : "D";
                return [i + 1, pos.player.name, item.off, item.def, Math.round(pos.score), grade, Math.round(pos.boom * 100), Math.round(pos.bust * 100)];
              }).filter(Boolean);
              downloadCSV(`fantasy-${posFilter}-week${selectedWeek}`, headers, rows);
            }} />
            <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Score <MethodologyTip type="opportunityScore" /></span><span style={{ display: "flex", alignItems: "center", gap: 4, width: 120, justifyContent: "center" }}>Boom / Bust <MethodologyTip type="boomPct" /></span>
            </div>
          </div>
        </div>
        {sorted.slice(0, 16).map((item, i) => <FantasyRow key={`${item.off}-${item.def}`} item={item} rank={i + 1} />)}
      </div>

      {/* Contract Year Players */}
      <div style={{ marginTop: 20 }}>
        <ContractYearCard />
      </div>
      <NewsletterCTA />
    </div>
  );
}
