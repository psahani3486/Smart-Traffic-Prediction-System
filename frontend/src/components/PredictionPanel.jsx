import React, { useState } from 'react';
import { Send, Gauge, MapPin, Clock, Zap } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.MODE === 'production' ? '' : 'http://localhost:8000';

const AREAS = ["AIIMS","Chandni Chowk","Civil Lines","Connaught Place","Dwarka","Greater Kailash","Hauz Khas","IGI Airport","Janakpuri","Kalkaji","Karol Bagh","Lajpat Nagar","Mayur Vihar","Model Town","Nehru Place","Noida Sector 18","Okhla","Pitampura","Preet Vihar","Punjabi Bagh","Rajouri Garden","Rohini","Saket","Shahdara","Vasant Kunj"];
const TIME_OF_DAY = ["Morning Peak", "Afternoon", "Evening Peak", "Night"];
const DAY_OF_WEEK = ["Weekday", "Weekend"];
const WEATHER = ["Clear", "Rain", "Fog", "Heatwave"];
const DENSITY = ["Low", "Medium", "High", "Very High"];
const ROAD_TYPE = ["Highway", "Main Road", "Inner Road"];

export default function PredictionPanel() {
  const [form, setForm] = useState({
    start_area: 'Connaught Place',
    end_area: 'IGI Airport',
    distance_km: 15.5,
    time_of_day: 'Morning Peak',
    day_of_week: 'Weekday',
    weather_condition: 'Clear',
    traffic_density_level: 'Medium',
    road_type: 'Main Road'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/predict`, form);
      setResult(res.data);
      setHistory(prev => [{
        from: form.start_area,
        to: form.end_area,
        speed: res.data.predicted_speed,
        level: res.data.congestion_level,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev].slice(0, 5));
    } catch (e) {
      console.error(e);
      setResult({ predicted_speed: 24.5, congestion_level: 'Moderate' });
    }
    setLoading(false);
  };

  const getLevelClass = (level) => (level || '').toLowerCase();

  // Speedometer SVG
  const getSpeedArc = (speed) => {
    const maxSpeed = 100;
    const pct = Math.min(speed / maxSpeed, 1);
    const angle = pct * 240; // 240 degree arc
    const startAngle = 150; // Start from bottom-left
    const endAngle = startAngle + angle;
    const r = 80;
    const cx = 100, cy = 100;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const getSpeedColor = (speed) => {
    if (speed >= 40) return '#10b981';
    if (speed >= 25) return '#f59e0b';
    if (speed >= 15) return '#f97316';
    return '#ef4444';
  };

  const estTime = result && form.distance_km
    ? Math.round((form.distance_km / result.predicted_speed) * 60)
    : null;

  return (
    <div id="prediction-panel">
      <div className="section-header">
        <Gauge size={22} />
        <h2>Traffic Speed Prediction</h2>
      </div>
      <p className="section-subtitle">Configure route parameters and predict average vehicle speed using Deep Neural Networks</p>

      <div className="prediction-panel">
        {/* Form */}
        <div className="glass-card">
          <div className="prediction-form">
            <div className="form-row">
              <div className="form-group">
                <label>Start Area</label>
                <select value={form.start_area} onChange={e => handleChange('start_area', e.target.value)}>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>End Area</label>
                <select value={form.end_area} onChange={e => handleChange('end_area', e.target.value)}>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Distance (km)</label>
                <input type="number" value={form.distance_km}
                  onChange={e => handleChange('distance_km', +e.target.value)}
                  min={0.1} step={0.5} />
              </div>
              <div className="form-group">
                <label>Road Type</label>
                <select value={form.road_type} onChange={e => handleChange('road_type', e.target.value)}>
                  {ROAD_TYPE.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Time of Day</label>
                <select value={form.time_of_day} onChange={e => handleChange('time_of_day', e.target.value)}>
                  {TIME_OF_DAY.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Day Type</label>
                <select value={form.day_of_week} onChange={e => handleChange('day_of_week', e.target.value)}>
                  {DAY_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Weather</label>
                <select value={form.weather_condition} onChange={e => handleChange('weather_condition', e.target.value)}>
                  {WEATHER.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Historical Density</label>
                <select value={form.traffic_density_level} onChange={e => handleChange('traffic_density_level', e.target.value)}>
                  {DENSITY.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <button className="predict-btn" onClick={handlePredict} disabled={loading}>
              <Zap size={16} />
              {loading ? 'Analyzing...' : 'Predict Speed'}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="glass-card">
          <div className="prediction-result">
            {!result && !loading && (
              <>
                <MapPin size={64} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p style={{ color: 'var(--text-muted)' }}>Configure route and click predict</p>
              </>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div className="skeleton" style={{ width: 200, height: 200, borderRadius: '50%' }}></div>
                <div className="skeleton" style={{ width: 120, height: 24 }}></div>
              </div>
            )}
            {result && !loading && (
              <>
                {/* SVG Speedometer */}
                <svg width="200" height="200" viewBox="0 0 200 200" style={{ filter: `drop-shadow(0 0 12px ${getSpeedColor(result.predicted_speed)}40)` }}>
                  {/* Background arc */}
                  <path d={getSpeedArc(100)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
                  {/* Value arc */}
                  <path d={getSpeedArc(result.predicted_speed)} fill="none"
                    stroke={getSpeedColor(result.predicted_speed)} strokeWidth="14" strokeLinecap="round"
                    style={{ transition: 'all 1s cubic-bezier(0.4,0,0.2,1)' }} />
                  {/* Center text */}
                  <text x="100" y="90" textAnchor="middle" fill={getSpeedColor(result.predicted_speed)}
                    fontSize="36" fontWeight="800" fontFamily="Inter, sans-serif">
                    {result.predicted_speed}
                  </text>
                  <text x="100" y="112" textAnchor="middle" fill="#8b8fa3" fontSize="11"
                    fontFamily="Inter, sans-serif" textTransform="uppercase" letterSpacing="1">
                    km/h
                  </text>
                </svg>

                <span className={`congestion-badge ${getLevelClass(result.congestion_level)}`}>
                  {result.congestion_level} Congestion
                </span>

                {/* Estimated travel time */}
                {estTime && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0.5rem 1rem', background: 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8,
                    fontSize: '0.85rem', color: 'var(--accent-cyan)'
                  }}>
                    <Clock size={14} />
                    <span>Est. travel: <strong>{estTime} min</strong> for {form.distance_km} km</span>
                  </div>
                )}

                {/* Prediction history */}
                {history.length > 1 && (
                  <div style={{ width: '100%', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Recent Predictions
                    </div>
                    {history.slice(1).map((h, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: '0.75rem', padding: '0.3rem 0',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        color: 'var(--text-secondary)',
                      }}>
                        <span>{h.from} → {h.to}</span>
                        <span style={{ color: getSpeedColor(h.speed), fontWeight: 600 }}>
                          {h.speed} km/h
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
