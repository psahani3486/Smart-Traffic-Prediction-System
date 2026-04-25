import React from 'react';
import { TrendingUp, Clock, BarChart3, Database, Zap, MapPin } from 'lucide-react';

export default function Hero({ stats }) {
  const s = stats || {};
  const cards = [
    { label: 'Avg Volume', value: s.avg_volume ? Math.round(s.avg_volume).toLocaleString() : '—', detail: 'vehicles / hour', color: 'cyan', icon: TrendingUp },
    { label: 'Peak Hour', value: s.peak_hour !== undefined ? `${s.peak_hour}:00` : '—', detail: 'highest traffic', color: 'purple', icon: Clock },
    { label: 'Data Points', value: s.total_records ? s.total_records.toLocaleString() : '—', detail: 'hourly records', color: 'green', icon: Database },
    { label: 'Max Volume', value: s.max_volume ? s.max_volume.toLocaleString() : '—', detail: 'peak recorded', color: 'amber', icon: BarChart3 },
    { label: 'Busiest Day', value: s.busiest_day || '—', detail: 'highest average', color: 'pink', icon: Zap },
    { label: 'Date Range', value: s.date_start && s.date_end ? `${s.date_start.slice(2)} - ${s.date_end.slice(2)}` : '—', detail: 'dataset span', color: 'blue', icon: MapPin },
  ];

  return (
    <section className="hero-section" id="hero-section">
      <h1 className="hero-title">
        Smart <span>Traffic Prediction</span> System
      </h1>
      <p className="hero-description">
        AI-powered traffic forecasting using Deep Learning Ensembles on Metro Interstate data.
        Predicting congestion with real-time analytics, weather integration, and route recommendations.
      </p>
      <div className="stats-grid">
        {cards.map((c, i) => (
          <div key={i} className={`stat-card ${c.color}`}>
            <span className="stat-label">{c.label}</span>
            <span className="stat-value">{c.value}</span>
            <span className="stat-detail">{c.detail}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
