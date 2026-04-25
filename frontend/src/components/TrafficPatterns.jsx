import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
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
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {Math.round(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function TrafficPatterns({ hourly, daily, heatmap }) {
  // Hourly chart data
  const hourlyData = hourly ? hourly.hours.map((h, i) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    mean: hourly.mean[i],
    median: hourly.median[i],
  })) : [];

  // Daily chart data
  const dailyData = daily ? daily.days.map((d, i) => ({
    day: d.slice(0, 3),
    mean: daily.mean[i],
  })) : [];

  // Heatmap color mapping
  const getHeatColor = (value) => {
    if (!value) return 'rgba(255,255,255,0.02)';
    const max = 7000;
    const ratio = Math.min(value / max, 1);
    if (ratio < 0.3) return `rgba(16,185,129,${0.15 + ratio})`;
    if (ratio < 0.6) return `rgba(245,158,11,${0.15 + ratio * 0.6})`;
    return `rgba(239,68,68,${0.15 + ratio * 0.7})`;
  };

  return (
    <div id="traffic-patterns">
      <div className="section-header">
        <Clock size={22} />
        <h2>Traffic Patterns</h2>
      </div>
      <p className="section-subtitle">Hourly, daily, and weekly traffic flow analysis</p>

      <div className="grid-2">
        {/* Hourly */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            24-Hour Traffic Curve
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#5a5f73" fontSize={11} tickLine={false}
                  interval={2} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="mean" name="Avg Volume" stroke="#00d4ff"
                  fill="url(#gradCyan)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="median" name="Median" stroke="#8b5cf6"
                  fill="none" strokeWidth={1.5} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Weekly Traffic Volume
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#5a5f73" fontSize={12} tickLine={false} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mean" name="Avg Volume" fill="#8b5cf6" radius={[6, 6, 0, 0]}
                  barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} style={{ color: 'var(--accent-cyan)' }} />
          Weekly Congestion Heatmap
        </h3>
        {heatmap && (
          <div className="heatmap-grid">
            {/* Header row */}
            <div className="heatmap-label"></div>
            {heatmap.hours.map(h => (
              <div key={h} className="heatmap-label">{h}</div>
            ))}
            {/* Data rows */}
            {heatmap.days.map((day, di) => (
              <React.Fragment key={day}>
                <div className="heatmap-label">{day}</div>
                {heatmap.values[di]?.map((val, hi) => (
                  <div key={hi} className="heatmap-cell"
                    style={{ background: getHeatColor(val) }}
                    title={`${day} ${hi}:00 - ${Math.round(val).toLocaleString()} vehicles`}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.8rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(16,185,129,0.3)' }}></span> Low
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(245,158,11,0.5)' }}></span> Medium
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(239,68,68,0.7)' }}></span> High
          </span>
        </div>
      </div>
    </div>
  );
}
