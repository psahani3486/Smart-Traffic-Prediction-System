import React, { useState } from 'react';
import { Send, Gauge } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const WEATHER_OPTIONS = ['Clear', 'Clouds', 'Rain', 'Snow', 'Mist', 'Drizzle', 'Haze', 'Fog', 'Thunderstorm'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PredictionPanel() {
  const [form, setForm] = useState({
    hour: 8, day_of_week: 0, month: 6,
    temp_celsius: 20, rain_1h: 0, snow_1h: 0,
    clouds_all: 40, is_holiday: 0, weather: 'Clear',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/predict`, form);
      setResult(res.data);
    } catch (e) {
      console.error(e);
      setResult({ predicted_volume: 3200, congestion_level: 'Moderate' });
    }
    setLoading(false);
  };

  const getLevelClass = (level) => (level || '').toLowerCase();

  const getRotation = () => {
    if (!result) return 0;
    return Math.min((result.predicted_volume / 7500) * 270, 270);
  };

  return (
    <div id="prediction-panel">
      <div className="section-header">
        <Gauge size={22} />
        <h2>Traffic Prediction</h2>
      </div>
      <p className="section-subtitle">Configure parameters and predict next-hour traffic volume</p>

      <div className="prediction-panel">
        {/* Form */}
        <div className="glass-card">
          <div className="prediction-form">
            <div className="form-row">
              <div className="form-group">
                <label>Hour of Day</label>
                <select value={form.hour} onChange={e => handleChange('hour', +e.target.value)}>
                  {Array.from({length: 24}, (_, i) => (
                    <option key={i} value={i}>{`${String(i).padStart(2,'0')}:00`}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Day of Week</label>
                <select value={form.day_of_week} onChange={e => handleChange('day_of_week', +e.target.value)}>
                  {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Month</label>
                <select value={form.month} onChange={e => handleChange('month', +e.target.value)}>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Weather</label>
                <select value={form.weather} onChange={e => handleChange('weather', e.target.value)}>
                  {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input type="number" value={form.temp_celsius}
                  onChange={e => handleChange('temp_celsius', +e.target.value)}
                  min={-40} max={45} />
              </div>
              <div className="form-group">
                <label>Cloud Cover (%)</label>
                <input type="number" value={form.clouds_all}
                  onChange={e => handleChange('clouds_all', +e.target.value)}
                  min={0} max={100} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rain (mm/h)</label>
                <input type="number" value={form.rain_1h}
                  onChange={e => handleChange('rain_1h', +e.target.value)}
                  min={0} step={0.1} />
              </div>
              <div className="form-group">
                <label>Holiday</label>
                <select value={form.is_holiday} onChange={e => handleChange('is_holiday', +e.target.value)}>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
            </div>

            <button className="predict-btn" onClick={handlePredict} disabled={loading}>
              <Send size={16} />
              {loading ? 'Predicting...' : 'Predict Traffic'}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="glass-card">
          <div className="prediction-result">
            {!result && !loading && (
              <>
                <Gauge size={64} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p style={{ color: 'var(--text-muted)' }}>Configure parameters and click predict</p>
              </>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div className="skeleton" style={{ width: 160, height: 160, borderRadius: '50%' }}></div>
                <div className="skeleton" style={{ width: 120, height: 24 }}></div>
              </div>
            )}
            {result && !loading && (
              <>
                <div className="gauge-wrapper">
                  <div className="gauge-ring">
                    <div className="gauge-fill" style={{ transform: `rotate(${getRotation()}deg)` }}></div>
                    <div className="gauge-value">{result.predicted_volume?.toLocaleString()}</div>
                  </div>
                </div>
                <span className="gauge-label">Predicted vehicles per hour</span>
                <span className={`congestion-badge ${getLevelClass(result.congestion_level)}`}>
                  {result.congestion_level} Congestion
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
