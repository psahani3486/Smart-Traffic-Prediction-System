import React from 'react';
import { Navigation, AlertTriangle, Info, ArrowRight } from 'lucide-react';

const ROUTES = [
  {
    name: 'Interstate 94 Express',
    detail: 'Primary highway route - fastest during off-peak',
    time: '22 min',
    type: 'fast',
    delay: '+0 min',
  },
  {
    name: 'Highway 61 Alternate',
    detail: 'Scenic route via highway 61 - moderate traffic',
    time: '28 min',
    type: 'moderate',
    delay: '+6 min',
  },
  {
    name: 'Local Streets Route',
    detail: 'City streets - slower but avoids highway congestion',
    time: '35 min',
    type: 'slow',
    delay: '+13 min',
  },
];

export default function RouteRecommendation({ stats }) {
  const hour = new Date().getHours();
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18);

  return (
    <div id="route-recommendation">
      <div className="section-header">
        <Navigation size={22} />
        <h2>Route Recommendations</h2>
      </div>
      <p className="section-subtitle">Smart route suggestions based on current congestion patterns</p>

      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Suggested Routes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {ROUTES.map((r, i) => (
              <div key={i} className="route-card">
                <div className={`route-icon ${r.type}`}>
                  <ArrowRight size={20} />
                </div>
                <div className="route-info">
                  <div className="route-name">{r.name}</div>
                  <div className="route-detail">{r.detail}</div>
                </div>
                <div className="route-time" style={{
                  color: r.type === 'fast' ? 'var(--accent-green)' :
                         r.type === 'moderate' ? 'var(--accent-amber)' : 'var(--accent-red)'
                }}>
                  {r.time}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{r.delay}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Traffic alerts */}
          {isRushHour && (
            <div className="alert-banner warning">
              <AlertTriangle size={18} />
              <span><strong>Rush Hour Alert:</strong> Peak traffic expected. Consider alternate routes.</span>
            </div>
          )}
          <div className="alert-banner info">
            <Info size={18} />
            <span><strong>Pattern Insight:</strong> {stats?.busiest_day || 'Friday'} typically has the highest traffic volume.</span>
          </div>

          {/* Quick insights */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Congestion Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Morning Peak</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>07:00 - 09:00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Evening Peak</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>16:00 - 18:00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Lowest Traffic</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>02:00 - 04:00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Weekend Reduction</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>~30% less</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rain Impact</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>Slight decrease</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
