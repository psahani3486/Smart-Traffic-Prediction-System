import React from 'react';
import { BarChart3, Route } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';

const BIN_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,14,39,0.95)', border: '1px solid rgba(0,212,255,0.2)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem'
    }}>
      <p style={{ color: '#8b8fa3', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill || '#00d4ff', fontWeight: 600 }}>
          {p.name}: {p.value?.toLocaleString?.() || p.value}
        </p>
      ))}
    </div>
  );
};

export default function SpeedDistribution({ speedDist, topRoutes }) {
  const histData = speedDist ? speedDist.bins.map((b, i) => ({
    range: `${b} km/h`, count: speedDist.count[i],
  })) : [];

  const routeData = topRoutes ? topRoutes.routes.map((r, i) => ({
    route: r.length > 25 ? r.slice(0, 22) + '…' : r,
    fullRoute: r,
    count: topRoutes.count[i],
    avg_speed: topRoutes.avg_speed[i],
    avg_distance: topRoutes.avg_distance[i],
  })) : [];

  return (
    <div id="speed-distribution">
      <div className="section-header">
        <BarChart3 size={22} />
        <h2>Speed Distribution & Popular Routes</h2>
      </div>
      <p className="section-subtitle">Frequency distribution of vehicle speeds and the most traveled routes in Delhi</p>

      <div className="grid-2">
        {/* Speed Distribution Histogram */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Speed Distribution (Histogram)
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData}>
                <defs>
                  <linearGradient id="gradHist" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="#5a5f73" fontSize={10} tickLine={false} angle={-15} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Trip Count" radius={[6, 6, 0, 0]} barSize={36}>
                  {histData.map((_, i) => (
                    <Cell key={i} fill={BIN_COLORS[i % BIN_COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Routes */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
            <Route size={16} style={{ color: 'var(--accent-purple)' }} />
            Top 10 Busiest Routes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto' }}>
            {routeData.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.7rem 0.8rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.background = 'rgba(0,212,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: `rgba(139,92,246,${0.15 + (1 - i / 10) * 0.2})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)',
                  flexShrink: 0,
                }}>
                  #{i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={r.fullRoute}>{r.fullRoute}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {r.avg_distance} km · {r.avg_speed} km/h avg
                  </div>
                </div>
                <div style={{
                  fontSize: '0.8rem', fontWeight: 700,
                  color: r.count > 5 ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  flexShrink: 0,
                }}>
                  {r.count} trips
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
