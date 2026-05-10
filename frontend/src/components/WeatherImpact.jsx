import React from 'react';
import { CloudRain, Navigation, Shield } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const WEATHER_COLORS = {
  'Clear': '#10b981', 'Rain': '#3b82f6', 'Fog': '#94a3b8', 'Heatwave': '#ef4444',
};
const ROAD_COLORS = {
  'Highway': '#f59e0b', 'Main Road': '#8b5cf6', 'Inner Road': '#06b6d4',
};
const DENSITY_COLORS = {
  'Low': '#10b981', 'Medium': '#f59e0b', 'High': '#ef4444', 'Very High': '#ec4899',
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
          {p.name}: {typeof p.value === 'number' ? `${p.value} km/h` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function WeatherImpact({ weather, roadType, density }) {
  const weatherData = weather ? weather.categories.map((c, i) => ({
    name: c, mean: weather.mean[i], count: weather.count[i],
  })) : [];

  const roadData = roadType ? roadType.categories.map((c, i) => ({
    name: c, mean: roadType.mean[i], count: roadType.count[i],
  })) : [];

  const densityData = density ? density.levels.map((l, i) => ({
    name: l, value: density.count[i], mean: density.mean[i],
  })) : [];

  return (
    <div id="weather-impact">
      <div className="section-header">
        <CloudRain size={22} />
        <h2>Environmental & Infrastructure Impact</h2>
      </div>
      <p className="section-subtitle">How weather, road type, and traffic density affect vehicle speeds across Delhi</p>

      <div className="grid-3">
        {/* Weather categories */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Speed by Weather
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weatherData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#5a5f73" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                <YAxis dataKey="name" type="category" stroke="#5a5f73" fontSize={11}
                  tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mean" name="Avg Speed" radius={[0, 6, 6, 0]} barSize={22}>
                  {weatherData.map((entry, i) => (
                    <Cell key={i} fill={WEATHER_COLORS[entry.name] || '#8b5cf6'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Road Type */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
            <Navigation size={16} style={{ color: 'var(--accent-amber)' }} />
            Speed by Road Type
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#5a5f73" fontSize={11} tickLine={false} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mean" name="Avg Speed" radius={[6, 6, 0, 0]} barSize={42}>
                  {roadData.map((entry, i) => (
                    <Cell key={i} fill={ROAD_COLORS[entry.name] || '#10b981'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Density Distribution Pie */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
            <Shield size={16} style={{ color: 'var(--accent-green)' }} />
            Density Distribution
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={densityData} cx="50%" cy="45%"
                  innerRadius={55} outerRadius={90} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  stroke="rgba(255,255,255,0.1)" strokeWidth={1}>
                  {densityData.map((entry, i) => (
                    <Cell key={i} fill={DENSITY_COLORS[entry.name] || '#8b5cf6'} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val} trips`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Density speed cards */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {densityData.map((d, i) => (
              <div key={i} style={{
                flex: 1, minWidth: '80px', padding: '0.5rem',
                background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center',
                border: `1px solid ${DENSITY_COLORS[d.name]}33`
              }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d.name}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: DENSITY_COLORS[d.name] }}>{d.mean}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>km/h avg</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
