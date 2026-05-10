import React from 'react';
import { TrendingUp, Clock, BarChart3, Database, Zap, MapPin } from 'lucide-react';

export default function Hero({ stats }) {
  const s = stats || {};
  const cards = [
    { label: 'Avg Speed', value: s.avg_speed ? `${s.avg_speed}` : '—', detail: 'km/h overall', color: 'cyan', icon: TrendingUp },
    { label: 'Top Origin', value: s.top_start_area || '—', detail: 'most trips start here', color: 'purple', icon: MapPin },
    { label: 'Data Points', value: s.total_records ? s.total_records.toLocaleString() : '—', detail: 'trip records', color: 'green', icon: Database },
    { label: 'Max Speed', value: s.max_speed ? `${s.max_speed}` : '—', detail: 'km/h peak', color: 'amber', icon: BarChart3 },
    { label: 'Delhi Areas', value: s.unique_areas || '—', detail: 'coverage zones', color: 'pink', icon: Zap },
    { label: 'Avg Distance', value: s.avg_distance ? `${s.avg_distance} km` : '—', detail: 'per trip', color: 'blue', icon: Clock },
  ];

  return (
    <section className="hero-section" id="hero-section">
      <h1 className="hero-title">
        Delhi <span>Traffic Prediction</span> System
      </h1>
      <p className="hero-description">
        AI-powered traffic speed forecasting using Deep Neural Networks on Delhi traffic data.
        Predicting congestion with real-time analytics across 25 Delhi zones, weather integration, and route recommendations.
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
