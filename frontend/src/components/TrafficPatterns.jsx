import React from 'react';
import { Clock, Layers } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const TIME_COLORS = {
  'Morning Peak': '#f59e0b',
  'Afternoon': '#10b981',
  'Evening Peak': '#ef4444',
  'Night': '#8b5cf6',
};

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
          {p.name}: {p.value} km/h
        </p>
      ))}
    </div>
  );
};

export default function TrafficPatterns({ timeOfDay, daily, crossAnalysis }) {
  // Time of Day chart data
  const timeData = timeOfDay ? timeOfDay.labels.map((l, i) => ({
    time: l,
    mean: timeOfDay.mean[i],
    median: timeOfDay.median[i],
    count: timeOfDay.count[i],
  })) : [];

  // Daily chart data
  const dailyData = daily ? daily.days.map((d, i) => ({
    day: d,
    mean: daily.mean[i],
    count: daily.count[i],
  })) : [];

  // Cross analysis: time x road_type
  const crossData = crossAnalysis ? crossAnalysis.times.map((t, ti) => {
    const row = { time: t };
    crossAnalysis.road_types.forEach((rt, ri) => {
      row[rt] = crossAnalysis.values[ti]?.[ri] || 0;
    });
    return row;
  }) : [];

  const ROAD_COLORS = ['#00d4ff', '#f59e0b', '#8b5cf6'];

  return (
    <div id="traffic-patterns">
      <div className="section-header">
        <Clock size={22} />
        <h2>Speed & Congestion Patterns</h2>
      </div>
      <p className="section-subtitle">Average vehicle speeds across different time periods, days, and road types</p>

      <div className="grid-2">
        {/* Time of Day */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Speed by Time of Day
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#5a5f73" fontSize={11} tickLine={false} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="mean" name="Avg Speed" radius={[6, 6, 0, 0]} barSize={42}>
                  {timeData.map((entry, i) => (
                    <Cell key={i} fill={TIME_COLORS[entry.time] || '#00d4ff'} fillOpacity={0.85} />
                  ))}
                </Bar>
                <Bar dataKey="median" name="Median Speed" fill="#3366ff" fillOpacity={0.4}
                  radius={[6, 6, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Weekday/Weekend */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Weekday vs Weekend Speed
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#5a5f73" fontSize={12} tickLine={false} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mean" name="Avg Speed" radius={[8, 8, 0, 0]} barSize={60}>
                  <Cell fill="#00d4ff" fillOpacity={0.8} />
                  <Cell fill="#8b5cf6" fillOpacity={0.8} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Insight card */}
          {dailyData.length === 2 && (
            <div style={{
              marginTop: '1rem', padding: '0.8rem 1rem',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 8, fontSize: '0.85rem', color: 'var(--accent-green)'
            }}>
              <strong>Insight:</strong> Weekend speeds are {((dailyData[1]?.mean / dailyData[0]?.mean - 1) * 100).toFixed(0)}% faster than weekdays
            </div>
          )}
        </div>
      </div>

      {/* Cross Analysis: Time x Road Type */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
          Speed Matrix — Time of Day × Road Type
        </h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={crossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#5a5f73" fontSize={11} tickLine={false} />
              <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              {crossAnalysis?.road_types?.map((rt, idx) => (
                <Bar key={rt} dataKey={rt} name={rt} fill={ROAD_COLORS[idx % ROAD_COLORS.length]}
                  fillOpacity={0.75} radius={[4, 4, 0, 0]} barSize={28} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
