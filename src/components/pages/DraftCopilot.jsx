import { useMemo, useState } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import { PLAYER_BOARD_2026, PLAYER_BOARD_2026_META } from '../../data/playerBoard2026';
import { survivalProbabilities, slotForPick, picksForSlot } from '../../utils/survival';
import { PERSONAS, evaluate } from '../../utils/valuation';
import { NewsletterCTA } from '../ui/NewsletterCTA';

// Universe = playerBoard2026 filtered to draftable skill players, ordered by
// VORP (default shape: standard_12_1qb full-PPR — see PLAYER_BOARD_2026_META.
// valuation_2026_09_04). Players without a projection (rookies, no-2025-data,
// K/DEF) sort behind everyone with one; among them, adp_overall breaks the tie.
// Per CoS 2026-09-04-valuation-layer.md — was previously reading ROSTERS_2026
// (top depth slot per team, ~130 players) sorted by the snap-share proxy that
// the CoS 2026-08-30 audit flagged as a fake trait.
function buildUniverse() {
  const rows = PLAYER_BOARD_2026
    .filter(p => p.draftable && ['QB','RB','WR','TE'].includes(p.pos));
  // Attach a synthetic rating so downstream (survival, PERSONAS) still has a
  // number to weight. Prefer VORP (default shape); fall back to a rating that
  // orders by adp_overall so rookies without a projection still sort.
  const rated = rows.map(p => {
    const vorp = p.vorp;
    // Map VORP roughly onto the 0-100 rating scale the survival engine used
    // to consume. Anchor: top VORP ~230 → rating 99; VORP 0 → rating 70;
    // negative → rating 60. Rookies without VORP inherit a mid rating and
    // fall behind everyone with one, then order by ADP.
    let rating;
    if (vorp != null) {
      rating = Math.round(Math.min(99, Math.max(50, 70 + vorp / 3)));
    } else {
      rating = 60;
    }
    return {
      name: p.name,
      position: p.pos,
      team: p.team_2026,
      rating,
      trait: null,
      // Extended fields the copilot can surface directly.
      vorp,
      total_score_beta: p.total_score_beta,
      total_score_beta_rationale: p.total_score_beta_rationale,
      projection_pts: p.projection_pts,
      adp_overall: p.adp_overall,
      adp_source: p.adp_source,
      draftable: p.draftable,
      draft_note: p.draft_note,
      qb_name: p.qb_name,
      qb_name_source: p.qb_name_source,
      bye_week: p.bye_week,
      projection_source: p.projection_source,
    };
  });
  // Primary sort: VORP desc (nulls last); secondary: adp asc (nulls last).
  rated.sort((a, b) => {
    const av = a.vorp, bv = b.vorp;
    if (av == null && bv == null) {
      const aa = a.adp_overall ?? Infinity, ba = b.adp_overall ?? Infinity;
      return aa - ba;
    }
    if (av == null) return 1;
    if (bv == null) return -1;
    return bv - av;
  });
  return rated;
}

// One-per-line "1. Bijan Robinson RB ATL" → array of pick records. Loose but
// sufficient for a demo — anything the parser can't figure out is skipped.
function parsePicksText(text) {
  const picks = [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    // "1. Name Name POS TEAM" — POS is 2-3 upper letters, TEAM is 2-3 upper letters
    const m = line.match(/^(?:(\d+)[\.\)]\s+)?(.+?)\s+(QB|RB|WR|TE|K|DEF)\s+([A-Z]{2,4})\s*$/i);
    if (!m) continue;
    picks.push({
      pickNumber: parseInt(m[1] || String(picks.length + 1), 10),
      name: m[2].trim(),
      position: m[3].toUpperCase(),
      team: m[4].toUpperCase(),
    });
  }
  return picks;
}

const EXAMPLE_PICKS = `1. Ja'Marr Chase WR CIN
2. Bijan Robinson RB ATL
3. Justin Jefferson WR MIN
4. CeeDee Lamb WR DAL
5. Amon-Ra St. Brown WR DET
6. Jahmyr Gibbs RB DET
7. Puka Nacua WR LAR
8. Saquon Barkley RB PHI
9. Malik Nabers WR NYG
10. Christian McCaffrey RB SF
11. Derrick Henry RB BAL
12. Nico Collins WR HOU`;

export function DraftCopilot() {
  const [teamCount, setTeamCount] = useState(12);
  const [userSlot, setUserSlot] = useState(6);
  const [personaKey, setPersonaKey] = useState('BALANCED');   // was 'MASON'; renamed 2026-09-05 per binding constraint
  const [picksText, setPicksText] = useState(EXAMPLE_PICKS);

  const persona = useMemo(() => PERSONAS.find(p => p.key === personaKey) || PERSONAS[0], [personaKey]);
  const universe = useMemo(buildUniverse, []);
  const picks = useMemo(() => parsePicksText(picksText), [picksText]);

  const userPicks = useMemo(() => picksForSlot(userSlot, teamCount, 16), [userSlot, teamCount]);
  const nextPickNumber = picks.length + 1;

  const result = useMemo(() => {
    if (!universe.length) return null;
    return survivalProbabilities({
      picks,
      userSlot,
      teamCount,
      currentPickNumber: nextPickNumber,
      universe,
    });
  }, [picks, userSlot, teamCount, universe, nextPickNumber]);

  const rankedUndrafted = useMemo(() => {
    if (!result) return [];
    return result.candidates
      .filter(c => c.survival != null)
      .map(c => ({
        ...c,
        valuation: evaluate(
          { name: c.name, position: c.position, rating: c.rating, contract_year: false },
          persona
        ),
      }))
      // Show up to 40, sorted by v2 beta desc (falling back to VORP → rating)
      .sort((a, b) => {
        const av = a.total_score_beta ?? a.vorp ?? a.rating ?? 0;
        const bv = b.total_score_beta ?? b.vorp ?? b.rating ?? 0;
        return bv - av;
      })
      .slice(0, 40);
  }, [result, persona]);

  // "On the clock" — top pick per v1 (VORP) and v2 (BETA), plus the biggest
  // disagreement between the two among the currently draftable pool. This is
  // what a draft agent should read at Mason's turn.
  const onTheClock = useMemo(() => {
    if (!rankedUndrafted.length) return null;
    const byVorp = [...rankedUndrafted].sort((a, b) => (b.vorp ?? -Infinity) - (a.vorp ?? -Infinity));
    const byBeta = [...rankedUndrafted].sort((a, b) => (b.total_score_beta ?? -Infinity) - (a.total_score_beta ?? -Infinity));
    const vTop = byVorp[0], bTop = byBeta[0];
    const agree = vTop && bTop && vTop.name === bTop.name;
    // Biggest disagreement: player in top-5 by beta whose vorp rank is worst
    const vorpRank = new Map(byVorp.map((c, i) => [c.name, i + 1]));
    const top10Beta = byBeta.slice(0, 10);
    let biggestGap = null;
    for (const c of top10Beta) {
      const vR = vorpRank.get(c.name) || 999;
      const bR = byBeta.findIndex(x => x.name === c.name) + 1;
      const gap = vR - bR;
      if (biggestGap == null || Math.abs(gap) > Math.abs(biggestGap.gap)) {
        biggestGap = { candidate: c, vorpRank: vR, betaRank: bR, gap };
      }
    }
    return { vTop, bTop, agree, biggestGap };
  }, [rankedUndrafted]);

  const survivalColor = (s) => s > 0.75 ? '#16a34a' : s > 0.4 ? '#eab308' : '#dc2626';

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 4px', letterSpacing: -1 }}>On the Clock</h2>{/* Renamed 2026-09-05 per E-008: "Copilot" is Microsoft's; "War Room" is already ours. */}
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>
        Live survival probability + persona-weighted valuation over the pool. Paste your league's pick log below — the copilot computes each player's odds of surviving to your next pick.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b', fontFamily: 'monospace' }}>Team count</label>
          <select value={teamCount} onChange={e => setTeamCount(Number(e.target.value))} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>
            {[8, 10, 12, 14, 16].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b', fontFamily: 'monospace' }}>Your slot</label>
          <select value={userSlot} onChange={e => setUserSlot(Number(e.target.value))} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>
            {Array.from({ length: teamCount }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b', fontFamily: 'monospace' }}>Mode</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {PERSONAS.map(p => (
              <button key={p.key} onClick={() => setPersonaKey(p.key)} title={p.description} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid', borderColor: personaKey === p.key ? '#f97316' : '#e2e8f0', background: personaKey === p.key ? '#f97316' : '#fff', color: personaKey === p.key ? '#fff' : '#0f172a', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Next pick banner */}
      {result && (
        <div style={{ background: '#0d1117', color: '#fff', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Zap size={16} color="#f97316" />
          <span style={{ fontWeight: 700 }}>Pick {nextPickNumber} on the clock</span>
          <span style={{ color: '#94a3b8' }}>· Your next pick: <strong style={{ color: '#f97316' }}>#{result.meta.nextUserPick}</strong></span>
          <span style={{ color: '#94a3b8' }}>· {result.meta.interveningPickCount} picks between now and yours</span>
          {result.meta.run && (
            <span style={{ background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
              {result.meta.run.position} run: {result.meta.run.count} of last {result.meta.run.windowSize}
            </span>
          )}
        </div>
      )}

      {/* On the clock — v1 vs v2 recommendation with biggest delta */}
      {onTheClock && (
        <div style={{ background: '#fff', border: '2px solid #f97316', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: '#f97316', fontFamily: 'monospace', marginBottom: 10, fontWeight: 700 }}>On the clock — pick recommendation</div>
          {onTheClock.agree ? (
            <div style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.5 }}>
              <strong>Both v1 (VORP) and v2 (β) agree:</strong>{' '}
              <span style={{ fontSize: 16, fontWeight: 800 }}>{onTheClock.vTop.name}</span>{' '}
              <span style={{ color: '#64748b', fontSize: 12 }}>({onTheClock.vTop.position}/{onTheClock.vTop.team}, VORP {onTheClock.vTop.vorp?.toFixed(0)} · β {onTheClock.vTop.total_score_beta?.toFixed(0)})</span>
              {onTheClock.vTop.total_score_beta_rationale && (
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>β says: {onTheClock.vTop.total_score_beta_rationale}</div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.5 }}>
              <div><strong>v1 (VORP)</strong> says <strong>{onTheClock.vTop.name}</strong> <span style={{ color: '#64748b', fontSize: 12 }}>({onTheClock.vTop.position}/{onTheClock.vTop.team}, VORP {onTheClock.vTop.vorp?.toFixed(0)})</span></div>
              <div><strong>v2 (β)</strong> says <strong>{onTheClock.bTop.name}</strong> <span style={{ color: '#64748b', fontSize: 12 }}>({onTheClock.bTop.position}/{onTheClock.bTop.team}, β {onTheClock.bTop.total_score_beta?.toFixed(0)})</span></div>
              {onTheClock.bTop.total_score_beta_rationale && (
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>β preference driven by: {onTheClock.bTop.total_score_beta_rationale}</div>
              )}
            </div>
          )}
          {onTheClock.biggestGap && Math.abs(onTheClock.biggestGap.gap) >= 3 && (
            <div style={{ marginTop: 10, padding: '8px 10px', background: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#78350f' }}>
              <strong>Biggest v1↔v2 disagreement in the top 10 β:</strong>{' '}
              {onTheClock.biggestGap.candidate.name} — v1 rank #{onTheClock.biggestGap.vorpRank}, v2 rank #{onTheClock.biggestGap.betaRank}
              {onTheClock.biggestGap.candidate.total_score_beta_rationale && ` · ${onTheClock.biggestGap.candidate.total_score_beta_rationale}`}
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
            v1 is validated; v2 is beta. When they agree, high confidence. When they disagree, read the β rationale — that is what v1 does not see.
          </div>
        </div>
      )}

      {/* Pick log */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: 6 }}>Pick log — one per line: "1. Player Name POS TEAM"</label>
        <textarea
          value={picksText}
          onChange={e => setPicksText(e.target.value)}
          rows={10}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 12, border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc' }}
        />
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
          Parsed {picks.length} picks. Format is loose — {picks.length !== picksText.split(/\r?\n/).filter(l => l.trim()).length && <span style={{ color: '#dc2626' }}> some lines were skipped.</span>}
        </div>
      </div>

      {/* Survival table */}
      {rankedUndrafted.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Top {rankedUndrafted.length} undrafted — survival to pick #{result.meta.nextUserPick}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Ordered by ADP. Green = likely to fall to you; red = act now.</div>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              <strong>{persona.label}</strong> mode
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 50px 80px 70px 70px 60px 1.2fr', gap: 0, background: '#fff' }}>
            <div style={{ padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontFamily: 'monospace' }}>#</div>
            <div style={{ padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontFamily: 'monospace' }}>Player</div>
            <div style={{ padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontFamily: 'monospace' }}>Pos</div>
            <div style={{ padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontFamily: 'monospace' }}>Survival</div>
            <div style={{ padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontFamily: 'monospace' }} title="v1 valuation — projected pts minus positional replacement (default shape standard_12_1qb, full-PPR). Validated against Sleeper on 2026-09-04.">VORP</div>
            <div style={{ padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#f97316', fontFamily: 'monospace' }} title="v2 beta — VORP plus every context adjustment (QB, team offense, usage, injury designation, playoff schedule). Deltas vs VORP are what to read.">β</div>
            <div style={{ padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontFamily: 'monospace' }}>Δ</div>
            <div style={{ padding: '10px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontFamily: 'monospace' }}>β Rationale</div>
            {rankedUndrafted.map((c, i) => {
              const delta = c.total_score_beta != null && c.vorp != null ? c.total_score_beta - c.vorp : null;
              const deltaColor = delta == null ? '#94a3b8' : delta > 5 ? '#16a34a' : delta < -5 ? '#dc2626' : '#64748b';
              return (
              <div key={c.name + i} style={{ display: 'contents' }}>
                <div style={{ padding: '10px 12px', fontSize: 12, color: '#64748b', fontFamily: 'monospace', borderTop: '1px solid #f1f5f9' }}>{i + 1}</div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.team}{c.bye_week ? ` · bye ${c.bye_week}` : ''}{c.qb_name ? ` · ${c.qb_name}` : ''}</div>
                </div>
                <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#334155', borderTop: '1px solid #f1f5f9' }}>{c.position}</div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: survivalColor(c.survival), fontFamily: 'monospace' }}>{(c.survival * 100).toFixed(0)}%</span>
                </div>
                <div style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#0f172a', borderTop: '1px solid #f1f5f9', fontFamily: 'monospace' }}>{c.vorp != null ? c.vorp.toFixed(0) : '—'}</div>
                <div style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#f97316', borderTop: '1px solid #f1f5f9', fontFamily: 'monospace' }}>{c.total_score_beta != null ? c.total_score_beta.toFixed(0) : '—'}</div>
                <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: deltaColor, borderTop: '1px solid #f1f5f9', fontFamily: 'monospace' }}>{delta != null ? (delta > 0 ? '+' : '') + delta.toFixed(0) : '—'}</div>
                <div style={{ padding: '10px 12px', fontSize: 11, color: '#64748b', borderTop: '1px solid #f1f5f9', lineHeight: 1.4 }}>{c.total_score_beta_rationale || '—'}</div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AlertCircle size={16} color="#b45309" style={{ marginTop: 2 }} />
        <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
          <strong>Wired to playerBoard2026 · valuation layer 2026-09-04.</strong> Universe = draftable skill players from the board ({universe.length} ordered by VORP, default shape <code>{PLAYER_BOARD_2026_META.valuation_2026_09_04.default_shape}</code>). Projection = 17-game pace from 2025 actuals; rookies null and fall behind veterans with data. <strong>ADP shown is Sleeper <code>search_rank</code>, not consensus ADP.</strong> The board cannot see league-mate behaviour (the "commish takes Nacua early" pattern) — treat it as complete only for what it can see.
        </div>
      </div>
      <NewsletterCTA />
    </div>
  );
}
