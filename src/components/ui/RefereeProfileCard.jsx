import { useMemo, useState } from 'react';
import { Flag, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import refereeData from '../../data/intelligence/referee_profiles.json';

/**
 * RefereeProfileCard — referee crew tendencies and matchup impact.
 * Shows flag volume, over/under lean, and which team styles benefit/suffer.
 */
export function RefereeProfileCard({ compact = false }) {
  const [selectedRef, setSelectedRef] = useState(null);
  const crews = refereeData?.crews || [];

  const sorted = useMemo(() => {
    return [...crews].sort((a, b) => {
      const volOrder = { high: 3, 'moderate-high': 2, moderate: 1, low: 0 };
      return (volOrder[b.tendencies?.flagVolume] || 0) - (volOrder[a.tendencies?.flagVolume] || 0);
    });
  }, [crews]);

  if (crews.length === 0) return null;

  const volColor = (vol) => {
    if (vol === 'high') return { bg: '#fef2f2', color: '#dc2626', label: 'HIGH' };
    if (vol === 'moderate-high') return { bg: '#fff7ed', color: '#ea580c', label: 'MOD-HIGH' };
    if (vol === 'moderate') return { bg: '#fefce8', color: '#ca8a04', label: 'MODERATE' };
    if (vol === 'low') return { bg: '#f0fdf4', color: '#16a34a', label: 'LOW' };
    return { bg: '#f1f5f9', color: '#64748b', label: vol?.toUpperCase() || '—' };
  };

  const ouColor = (lean) => {
    if (!lean) return null;
    const l = lean.toLowerCase();
    if (l.includes('over')) return { color: '#dc2626', icon: TrendingUp, label: lean };
    if (l.includes('under')) return { color: '#2563eb', icon: TrendingDown, label: lean };
    return { color: '#64748b', icon: null, label: lean };
  };

  if (compact) {
    const top = sorted.filter(c => c.tendencies?.flagVolume === 'high').slice(0, 4);
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Flag size={20} color="#dc2626" />
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Flag-Happy Crews</span>
          <span style={{ fontSize: 12, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 10 }}>High volume</span>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {top.map(c => {
            const ou = ouColor(c.matchupImpact?.overUnderLean);
            return (
              <div key={c.referee} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                <Flag size={14} color="#dc2626" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', flex: 1 }}>{c.referee}</span>
                {ou && <span style={{ fontSize: 11, fontWeight: 700, color: ou.color }}>{ou.label}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const active = selectedRef ? crews.find(c => c.referee === selectedRef) : null;

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fefce8 100%)', padding: '20px 24px', borderBottom: '1px solid #fecaca' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Flag size={20} color="#dc2626" />
          <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Referee Crew Profiles</span>
          <span style={{ fontSize: 12, color: '#94a3b8', background: '#fff', padding: '2px 10px', borderRadius: 10 }}>{crews.length} crews</span>
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Flag tendencies, O/U lean, and matchup impact by crew</div>
      </div>

      {/* Crew grid */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {sorted.map(c => {
            const vol = volColor(c.tendencies?.flagVolume);
            const ou = ouColor(c.matchupImpact?.overUnderLean);
            const isSelected = selectedRef === c.referee;
            return (
              <button
                key={c.referee}
                onClick={() => setSelectedRef(isSelected ? null : c.referee)}
                style={{ padding: '12px 14px', background: isSelected ? '#0f172a' : vol.bg, borderRadius: 12, border: isSelected ? '2px solid #f97316' : '1px solid #f1f5f9', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? '#fff' : '#0f172a', marginBottom: 4 }}>{c.referee}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: isSelected ? '#f97316' : vol.color, background: isSelected ? '#1e293b' : vol.color + '15', padding: '1px 6px', borderRadius: 4 }}>{vol.label}</span>
                  {ou && <span style={{ fontSize: 10, fontWeight: 700, color: isSelected ? '#94a3b8' : ou.color }}>{ou.label}</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        {active && (
          <div style={{ marginTop: 16, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>{active.referee}</div>

            {/* Notes */}
            {active.tendencies?.notes && (
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>{active.tendencies.notes}</div>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              {active.tendencies?.estimatedPenaltiesPerGame && (
                <div style={{ background: '#fff', padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>PACE</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{active.tendencies.estimatedPenaltiesPerGame}</div>
                </div>
              )}
              {active.tendencies?.penaltyYardsWeek3 && (
                <div style={{ background: '#fff', padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>YDS (WK3)</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{active.tendencies.penaltyYardsWeek3}</div>
                </div>
              )}
              {active.matchupImpact?.overUnderLean && (
                <div style={{ background: '#fff', padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>O/U LEAN</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: ouColor(active.matchupImpact.overUnderLean)?.color || '#0f172a' }}>{active.matchupImpact.overUnderLean}</div>
                </div>
              )}
            </div>

            {/* Benefits / Hurts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {active.matchupImpact?.benefitsTeamsWith?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>✓ BENEFITS TEAMS WITH</div>
                  {active.matchupImpact.benefitsTeamsWith.map((b, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#475569', padding: '3px 0' }}>• {b}</div>
                  ))}
                </div>
              )}
              {active.matchupImpact?.hurtsTeamsWith?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>✗ HURTS TEAMS WITH</div>
                  {active.matchupImpact.hurtsTeamsWith.map((h, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#475569', padding: '3px 0' }}>• {h}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Source */}
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
          Source: {refereeData.metadata?.source || 'nflpenalties.com'} · {refereeData.metadata?.lastUpdated}
        </div>
      </div>
    </div>
  );
}
