import React from 'react';
import { Navigation, AlertTriangle, Info, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';

export default function RouteRecommendation({ stats, topRoutes }) {
  const hour = new Date().getHours();
  const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);

  // Build dynamic routes from topRoutes data
  const dynamicRoutes = topRoutes?.routes ? topRoutes.routes.slice(0, 3).map((r, i) => ({
    name: r,
    detail: `${topRoutes.avg_distance[i]} km · ${topRoutes.count[i]} recorded trips`,
    speed: `${topRoutes.avg_speed[i]} km/h`,
    type: topRoutes.avg_speed[i] >= 35 ? 'fast' : topRoutes.avg_speed[i] >= 25 ? 'moderate' : 'slow',
  })) : [
    { name: 'Connaught Place → IGI Airport', detail: 'Via NH48 – fastest at night', speed: '42 km/h', type: 'fast' },
    { name: 'Rohini → Dwarka', detail: 'Via Ring Road – moderate during peak', speed: '28 km/h', type: 'moderate' },
    { name: 'Chandni Chowk → Nehru Place', detail: 'Via ITO – heavy congestion zones', speed: '15 km/h', type: 'slow' },
  ];

  return (
    <div id="route-recommendation">
      <div className="section-header">
        <Navigation size={22} />
        <h2>Route Intelligence</h2>
      </div>
      <p className="section-subtitle">AI-driven route suggestions based on Delhi traffic patterns and congestion analysis</p>

      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Top Routes by Speed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {dynamicRoutes.map((r, i) => (
              <div key={i} className="route-card">
                <div className={`route-icon ${r.type}`}>
                  {r.type === 'fast' ? <TrendingUp size={20} /> :
                   r.type === 'slow' ? <TrendingDown size={20} /> :
                   <ArrowRight size={20} />}
                </div>
                <div className="route-info">
                  <div className="route-name">{r.name}</div>
                  <div className="route-detail">{r.detail}</div>
                </div>
                <div className="route-time" style={{
                  color: r.type === 'fast' ? 'var(--accent-green)' :
                         r.type === 'moderate' ? 'var(--accent-amber)' : 'var(--accent-red)'
                }}>
                  {r.speed}
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
              <span><strong>Rush Hour Alert:</strong> Peak traffic expected in Delhi. Consider alternate routes via Highways.</span>
            </div>
          )}
          <div className="alert-banner info">
            <Info size={18} />
            <span><strong>Data Insight:</strong> {stats?.total_records?.toLocaleString() || '4,000'} trips analyzed across {stats?.unique_areas || 25} Delhi zones.</span>
          </div>

          {/* Delhi congestion insights */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Delhi Congestion Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Slowest Period</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>Evening Peak</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Fastest Period</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>Night</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Best Road Type</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>Highway (39+ km/h)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Weekend Boost</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>~29% faster</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Fog Impact</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>45% slower</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
