import { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import contractData from '../../data/intelligence/contract_year_players.json';
import { tn } from '../../utils/formatters';

/**
 * ContractYearCard — players entering the final year of their contract.
 * Highlights contract year motivation, fantasy relevance, and financial stakes.
 */
export function ContractYearCard({ filterTeam, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const [posFilter, setPosFilter] = useState('ALL');
  const players = contractData?.contract_year_players || [];

  const filtered = useMemo(() => {
    let list = [...players];
    if (filterTeam) list = list.filter(p => p.team === filterTeam);
    if (posFilter !== 'ALL') list = list.filter(p => p.position === posFilter);
    return list;
  }, [players, filterTeam, posFilter]);

  const positions = useMemo(() => {
    const set = new Set(players.map(p => p.position));
    return ['ALL', ...Array.from(set).sort()];
  }, [players]);

  if (players.length === 0) return null;

  const relevanceColor = (rel) => {
    if (rel === 'high') return { bg: '#dcfce7', color: '#16a34a', label: 'HIGH' };
    if (rel === 'medium') return { bg: '#fef9c3', color: '#ca8a04', label: 'MED' };
    return { bg: '#f1f5f9', color: '#64748b', label: 'LOW' };
  };

  const posColor = (pos) => {
    if (pos === 'QB') return '#7c3aed';
    if (pos === 'RB') return '#16a34a';
    if (['WR', 'TE'].includes(pos)) return '#2563eb';
    if (['CB', 'S', 'LB', 'EDGE', 'DT', 'DE'].includes(pos)) return '#dc2626';
    return '#64748b';
  };

  if (compact) {
    const top = filtered.filter(p => p.fantasy_relevance === 'high').slice(0, 5);
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <DollarSign size={20} color="#16a34a" />
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Contract Year Watch</span>
          <span style={{ fontSize: 12, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 10 }}>
            {filterTeam ? tn(filterTeam) : `${players.length} players`}
          </span>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {top.map(p => (
            <div key={`${p.player}-${p.team}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: posColor(p.position), background: posColor(p.position) + '15', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{p.position}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', flex: 1 }}>{p.player}</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>{p.team}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>{p.current_salary}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '20px 24px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: 'none', cursor: 'pointer', borderBottom: expanded ? '1px solid #bbf7d0' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DollarSign size={20} color="#16a34a" />
          <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Contract Year Players</span>
          <span style={{ fontSize: 12, color: '#94a3b8', background: '#fff', padding: '2px 10px', borderRadius: 10 }}>
            {filterTeam ? tn(filterTeam) : `${players.length} players`}
          </span>
        </div>
        {expanded ? <ChevronDown size={20} color="#94a3b8" /> : <ChevronRight size={20} color="#94a3b8" />}
      </button>

      {expanded && (
        <div style={{ padding: '16px 24px' }}>
          {/* Position filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {positions.map(pos => (
              <button key={pos} onClick={() => setPosFilter(pos)} style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: posFilter === pos ? '#0f172a' : '#f1f5f9', color: posFilter === pos ? '#fff' : '#64748b', transition: 'all .15s' }}>{pos}</button>
            ))}
          </div>

          {/* Player list */}
          <div style={{ display: 'grid', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
            {filtered.map(p => {
              const rel = relevanceColor(p.fantasy_relevance);
              return (
                <div key={`${p.player}-${p.team}`} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: posColor(p.position), background: posColor(p.position) + '15', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>{p.position}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{p.player}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{p.team} · {tn(p.team)}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: rel.color, background: rel.bg, padding: '2px 8px', borderRadius: 6 }}>FANTASY: {rel.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span><strong style={{ color: '#0f172a' }}>{p.current_salary}</strong> salary</span>
                    <span>Age {p.age_entering_season}</span>
                    <span>{p.free_agent_class}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                    <TrendingUp size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} color="#f97316" />
                    {p.performance_incentive}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Source */}
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
            Source: {contractData.metadata?.source || 'Spotrac, Over The Cap'} · {contractData.metadata?.generated}
          </div>
        </div>
      )}
    </div>
  );
}
