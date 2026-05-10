import React from 'react';
import { MapPin } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,14,39,0.95)', border: '1px solid rgba(0,212,255,0.2)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem'
    }}>
      <p style={{ color: '#8b8fa3', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#00d4ff', fontWeight: 600 }}>
          {p.name}: {p.value} {p.dataKey === 'mean' ? 'km/h' : 'trips'}
        </p>
      ))}
    </div>
  );
};

const getSpeedColor = (speed) => {
  if (speed >= 40) return '#10b981';
  if (speed >= 30) return '#22c55e';
  if (speed >= 25) return '#f59e0b';
  if (speed >= 20) return '#f97316';
  return '#ef4444';
};

export default function AreaInsights({ areaStats }) {
  const areaData = areaStats ? areaStats.areas.map((a, i) => ({
    area: a,
    mean: areaStats.mean[i],
    count: areaStats.count[i],
  })) : [];

  return (
    <div id="area-insights">
      <div className="section-header">
        <MapPin size={22} />
        <h2>Delhi Area-Wise Speed Analysis</h2>
      </div>
      <p className="section-subtitle">Average vehicle speed across all 25 Delhi zones — ranked from fastest to slowest</p>

      <div className="glass-card">
        <div style={{ width: '100%', height: 500 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={areaData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#5a5f73" fontSize={11} tickLine={false} domain={[0, 'auto']} />
              <YAxis dataKey="area" type="category" stroke="#5a5f73" fontSize={10}
                tickLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="mean" name="Avg Speed" radius={[0, 6, 6, 0]} barSize={16}>
                {areaData.map((entry, i) => (
                  <Cell key={i} fill={getSpeedColor(entry.mean)} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.8rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444' }}></span> &lt;20 km/h (Critical)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b' }}></span> 25-30 km/h (Slow)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#22c55e' }}></span> 30-40 km/h (Moderate)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }}></span> 40+ km/h (Fast)
          </span>
        </div>
      </div>
    </div>
  );
}
