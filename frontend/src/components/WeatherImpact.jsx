import React from 'react';
import { CloudRain, Thermometer, CalendarCheck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';

const WEATHER_COLORS = {
  'Squall': '#ef4444', 'Thunderstorm': '#ec4899', 'Rain': '#3366ff',
  'Drizzle': '#60a5fa', 'Snow': '#c4b5fd', 'Fog': '#6b7280',
  'Mist': '#8b8fa3', 'Haze': '#a78bfa', 'Smoke': '#78716c',
  'Clouds': '#8b5cf6', 'Clear': '#10b981',
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
        <p key={i} style={{ color: p.color || '#00d4ff', fontWeight: 600 }}>
          {p.name}: {Math.round(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function WeatherImpact({ weather, temperature, holiday, monthly }) {
  const weatherData = weather ? weather.categories.map((c, i) => ({
    name: c, mean: weather.mean[i], count: weather.count[i],
  })) : [];

  const tempData = temperature ? temperature.bins.map((b, i) => ({
    range: b, mean: temperature.mean[i],
  })) : [];

  const monthlyData = monthly ? monthly.months.map((m, i) => ({
    month: m, mean: monthly.mean[i],
  })) : [];

  return (
    <div id="weather-impact">
      <div className="section-header">
        <CloudRain size={22} />
        <h2>Weather & Environmental Impact</h2>
      </div>
      <p className="section-subtitle">How weather, temperature, holidays, and seasons affect traffic</p>

      <div className="grid-2">
        {/* Weather categories */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Traffic by Weather Condition
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weatherData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#5a5f73" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#5a5f73" fontSize={11}
                  tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mean" name="Avg Volume" radius={[0, 6, 6, 0]} barSize={20}>
                  {weatherData.map((entry, i) => (
                    <Cell key={i} fill={WEATHER_COLORS[entry.name] || '#8b5cf6'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Thermometer size={16} style={{ color: 'var(--accent-amber)' }} />
            Traffic vs Temperature
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tempData}>
                <defs>
                  <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="#5a5f73" fontSize={10} tickLine={false} angle={-20} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mean" name="Avg Volume" fill="url(#gradTemp)" radius={[6,6,0,0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly trends */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Seasonal Traffic Trends
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <defs>
                  <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#5a5f73" fontSize={11} tickLine={false} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="mean" name="Avg Volume" stroke="#8b5cf6"
                  strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Holiday effect */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={16} style={{ color: 'var(--accent-green)' }} />
            Holiday Impact
          </h3>
          {holiday && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Regular Days</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {Math.round(holiday.regular_mean).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{holiday.regular_count.toLocaleString()} records</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Holidays</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                    {Math.round(holiday.holiday_mean).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{holiday.holiday_count.toLocaleString()} records</div>
                </div>
              </div>
              <div style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 8, padding: '0.8rem', textAlign: 'center'
              }}>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '1.1rem' }}>
                  {holiday.reduction_pct}% less traffic
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> on holidays</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
