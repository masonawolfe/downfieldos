import { useMemo, useState } from 'react';
import { Smile, Frown, TrendingUp, Zap } from 'lucide-react';
import sentimentData from '../../data/intelligence/fan_sentiment.json';
import { tn } from '../../utils/formatters';

/**
 * FanSentimentCard — 32-team fan sentiment dashboard / misery index.
 * Displays hope, anger, excitement, delusion, and a one-liner per team.
 * Sourced from agent-produced fan_sentiment.json (Reddit subreddit analysis).
 */
export function FanSentimentCard({ primaryTeam, compact = false }) {
  const [sortBy, setSortBy] = useState('misery');
  const teams = sentimentData?.teams || [];

  const sorted = useMemo(() => {
    const list = [...teams];
    if (sortBy === 'misery') list.sort((a, b) => b.misery_index - a.misery_index);
    else if (sortBy === 'hope') list.sort((a, b) => b.hope - a.hope);
    else if (sortBy === 'excitement') list.sort((a, b) => b.excitement - a.excitement);
    else if (sortBy === 'delusion') list.sort((a, b) => b.delusion - a.delusion);
    return list;
  }, [teams, sortBy]);

  if (teams.length === 0) return null;

  const miseryColor = (val) => {
    if (val >= 7) return '#dc2626';
    if (val >= 5) return '#f97316';
    if (val >= 3) return '#eab308';
    return '#16a34a';
  };

  const sentBar = (val, color, max = 10) => (
    <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${(val / max) * 100}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .3s' }} />
    </div>
  );

  if (compact) {
    // Top 5 most miserable
    const top5 = [...teams].sort((a, b) => b.misery_index - a.misery_index).slice(0, 5);
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Frown size={20} color="#dc2626" />
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Misery Index</span>
          <span style={{ fontSize: 12, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 10 }}>Top 5</span>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {top5.map((t, i) => (
            <div key={t.team} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: t.team === primaryTeam ? '#fff7ed' : '#f8fafc', borderRadius: 10, border: t.team === primaryTeam ? '1px solid #fed7aa' : '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', fontFamily: 'monospace', width: 20 }}>{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', width: 36 }}>{t.team}</span>
              <div style={{ flex: 1, fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.one_liner}</div>
              <span style={{ fontSize: 16, fontWeight: 900, color: miseryColor(t.misery_index), fontFamily: 'monospace', minWidth: 32, textAlign: 'right' }}>{t.misery_index.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)', padding: '20px 24px', borderBottom: '1px solid #fed7aa' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Frown size={20} color="#dc2626" />
            <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Fan Sentiment</span>
            <span style={{ fontSize: 12, color: '#94a3b8', background: '#fff', padding: '2px 10px', borderRadius: 10 }}>32 teams</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['misery', 'Misery'], ['hope', 'Hope'], ['excitement', 'Hype'], ['delusion', 'Delusion']].map(([key, label]) => (
              <button key={key} onClick={() => setSortBy(key)} style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: sortBy === key ? '#0f172a' : '#fff', color: sortBy === key ? '#fff' : '#64748b', transition: 'all .15s' }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>{sentimentData.league_context || ''}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Source: Reddit team subreddits · {sentimentData.date}</div>
      </div>

      {/* Team Grid */}
      <div style={{ padding: '16px 24px', maxHeight: 600, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {sorted.map((t, i) => (
            <div key={t.team} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: t.team === primaryTeam ? '#fff7ed' : i % 2 === 0 ? '#f8fafc' : '#fff', borderRadius: 12, border: t.team === primaryTeam ? '2px solid #f97316' : '1px solid #f1f5f9', transition: 'all .15s' }}>
              {/* Rank */}
              <span style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', fontFamily: 'monospace', width: 24, textAlign: 'center' }}>{i + 1}</span>

              {/* Team + One Liner */}
              <div style={{ minWidth: 60 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{t.team}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{tn(t.team)}</div>
              </div>

              {/* Sentiment Bars */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, minWidth: 0 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#16a34a', fontWeight: 600, marginBottom: 2 }}>HOPE {t.hope}</div>
                  {sentBar(t.hope, '#16a34a')}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#2563eb', fontWeight: 600, marginBottom: 2 }}>HYPE {t.excitement}</div>
                  {sentBar(t.excitement, '#2563eb')}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#dc2626', fontWeight: 600, marginBottom: 2 }}>ANGER {t.anger}</div>
                  {sentBar(t.anger, '#dc2626')}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#a855f7', fontWeight: 600, marginBottom: 2 }}>DELUSION {t.delusion}</div>
                  {sentBar(t.delusion, '#a855f7')}
                </div>
              </div>

              {/* Misery Index */}
              <div style={{ textAlign: 'right', minWidth: 50 }}>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>MISERY</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: miseryColor(t.misery_index), fontFamily: 'monospace' }}>{t.misery_index.toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
