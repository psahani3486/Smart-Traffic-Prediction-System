import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PredictionPanel from './components/PredictionPanel';
import TrafficPatterns from './components/TrafficPatterns';
import WeatherImpact from './components/WeatherImpact';
import ModelPerformance from './components/ModelPerformance';
import RouteRecommendation from './components/RouteRecommendation';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [anaRes, modelRes, predRes] = await Promise.allSettled([
          axios.get(`${API}/api/analysis`),
          axios.get(`${API}/api/model-info`),
          axios.get(`${API}/api/predictions/sample`),
        ]);
        if (anaRes.status === 'fulfilled') setAnalysis(anaRes.value.data);
        if (modelRes.status === 'fulfilled') setModelInfo(modelRes.value.data);
        if (predRes.status === 'fulfilled') setPredictions(predRes.value.data);
      } catch (e) {
        console.error('Failed to fetch data:', e);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Hero stats={analysis?.dataset_stats} />
        <PredictionPanel />
        <TrafficPatterns
          hourly={analysis?.hourly_patterns}
          daily={analysis?.daily_patterns}
          heatmap={analysis?.weekly_heatmap}
        />
        <WeatherImpact
          weather={analysis?.weather_impact}
          temperature={analysis?.temperature_impact}
          holiday={analysis?.holiday_effect}
          monthly={analysis?.monthly_trends}
        />
        <ModelPerformance modelInfo={modelInfo} predictions={predictions} />
        <RouteRecommendation stats={analysis?.dataset_stats} />

        {/* Footer */}
        <footer style={{
          textAlign: 'center', padding: '2rem 0 1rem',
          borderTop: '1px solid var(--border-glass)',
          color: 'var(--text-muted)', fontSize: '0.8rem'
        }}>
          <p>Smart Traffic Prediction System &bull; LSTM Deep Learning &bull; Built with TensorFlow, FastAPI & React</p>
        </footer>
      </main>
    </>
  );
}
