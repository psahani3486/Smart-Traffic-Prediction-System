import React, { useState, useEffect } from 'react';
import { Send, Gauge, MapPin, Clock, Zap, Navigation } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.MODE === 'production' ? '' : 'http://localhost:8000';

const AREAS = ["AIIMS","Chandni Chowk","Civil Lines","Connaught Place","Dwarka","Greater Kailash","Hauz Khas","IGI Airport","Janakpuri","Kalkaji","Karol Bagh","Lajpat Nagar","Mayur Vihar","Model Town","Nehru Place","Noida Sector 18","Okhla","Pitampura","Preet Vihar","Punjabi Bagh","Rajouri Garden","Rohini","Saket","Shahdara","Vasant Kunj"];
const TIME_OF_DAY = ["Morning Peak", "Afternoon", "Evening Peak", "Night"];
const DAY_OF_WEEK = ["Weekday", "Weekend"];
const WEATHER = ["Clear", "Rain", "Fog", "Heatwave"];
const DENSITY = ["Low", "Medium", "High", "Very High"];
const ROAD_TYPE = ["Highway", "Main Road", "Inner Road"];

// Delhi traffic zone coordinates for distance calculation
const AREA_COORDINATES = {
  "AIIMS": { lat: 28.5677, lng: 77.1988 },
  "Chandni Chowk": { lat: 28.6505, lng: 77.2303 },
  "Civil Lines": { lat: 28.6368, lng: 77.2256 },
  "Connaught Place": { lat: 28.6329, lng: 77.1877 },
  "Dwarka": { lat: 28.5921, lng: 77.0468 },
  "Greater Kailash": { lat: 28.5244, lng: 77.2010 },
  "Hauz Khas": { lat: 28.5492, lng: 77.1971 },
  "IGI Airport": { lat: 28.5562, lng: 77.1197 },
  "Janakpuri": { lat: 28.5143, lng: 77.1178 },
  "Kalkaji": { lat: 28.5206, lng: 77.2599 },
  "Karol Bagh": { lat: 28.6447, lng: 77.1973 },
  "Lajpat Nagar": { lat: 28.5585, lng: 77.2242 },
  "Mayur Vihar": { lat: 28.5832, lng: 77.2627 },
  "Model Town": { lat: 28.7041, lng: 77.2296 },
  "Nehru Place": { lat: 28.5524, lng: 77.2561 },
  "Noida Sector 18": { lat: 28.5355, lng: 77.3680 },
  "Okhla": { lat: 28.5244, lng: 77.2599 },
  "Pitampura": { lat: 28.7447, lng: 77.1012 },
  "Preet Vihar": { lat: 28.6180, lng: 77.2890 },
  "Punjabi Bagh": { lat: 28.6789, lng: 77.1185 },
  "Rajouri Garden": { lat: 28.6825, lng: 77.0838 },
  "Rohini": { lat: 28.7695, lng: 77.0538 },
  "Saket": { lat: 28.5244, lng: 77.1971 },
  "Shahdara": { lat: 28.6506, lng: 77.2879 },
  "Vasant Kunj": { lat: 28.5244, lng: 77.1756 }
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (startArea, endArea) => {
  const coord1 = AREA_COORDINATES[startArea];
  const coord2 = AREA_COORDINATES[endArea];
  
  if (!coord1 || !coord2) return 0;
  
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10; // Round to 1 decimal place
};

export default function PredictionPanel() {
  const [form, setForm] = useState({
    start_area: 'Connaught Place',
    end_area: 'IGI Airport',
    time_of_day: 'Morning Peak',
    day_of_week: 'Weekday',
    weather_condition: 'Clear',
    traffic_density_level: 'Medium',
    road_type: 'Main Road'
  });
  
  const [distance, setDistance] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Auto-calculate distance when areas change
  useEffect(() => {
    const newDistance = calculateDistance(form.start_area, form.end_area);
    setDistance(newDistance);
  }, [form.start_area, form.end_area]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const predictionData = {
        ...form,
        distance_km: distance
      };
      const res = await axios.post(`${API}/api/predict`, predictionData);
      setResult({
        ...res.data,
        distance_km: distance
      });
      setHistory(prev => [{
        from: form.start_area,
        to: form.end_area,
        distance: distance,
        speed: res.data.predicted_speed,
        level: res.data.congestion_level,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev].slice(0, 5));
    } catch (e) {
      console.error(e);
      setResult({ predicted_speed: 24.5, congestion_level: 'Moderate', distance_km: distance });
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
    if (speed >= 40) return '#22c55e';      // Green - Free flow
    if (speed >= 25) return '#eab308';      // Yellow - Moderate
    if (speed >= 15) return '#f97316';      // Orange - Heavy
    return '#ef4444';                       // Red - Severe
  };

  const estTime = result && distance
    ? Math.round((distance / result.predicted_speed) * 60)
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

            {/* Distance display instead of input */}
            <div className="form-row">
              <div className="form-group distance-display">
                <label>Calculated Distance</label>
                <div className="distance-value">
                  <Navigation size={18} />
                  <span>{distance} km</span>
                </div>
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
                    <span>Est. travel: <strong>{estTime} min</strong> for {distance} km</span>
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
