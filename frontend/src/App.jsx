import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PredictionPanel from './components/PredictionPanel';
import TrafficPatterns from './components/TrafficPatterns';
import WeatherImpact from './components/WeatherImpact';
import ModelPerformance from './components/ModelPerformance';
import RouteRecommendation from './components/RouteRecommendation';
import SpeedDistribution from './components/SpeedDistribution';
import AreaInsights from './components/AreaInsights';

const API = import.meta.env.MODE === 'production' ? '' : 'http://localhost:8000';

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
          timeOfDay={analysis?.time_of_day_patterns}
          daily={analysis?.daily_patterns}
          crossAnalysis={analysis?.cross_analysis}
        />
        <WeatherImpact
          weather={analysis?.weather_impact}
          roadType={analysis?.road_type_impact}
          density={analysis?.density_distribution}
        />
        <SpeedDistribution
          speedDist={analysis?.speed_distribution}
          topRoutes={analysis?.top_routes}
        />
        <AreaInsights areaStats={analysis?.area_stats} />
        <ModelPerformance modelInfo={modelInfo} predictions={predictions} />
        <RouteRecommendation stats={analysis?.dataset_stats} topRoutes={analysis?.top_routes} />

        {/* Footer */}
        <footer style={{
          textAlign: 'center', padding: '2rem 0 1rem',
          borderTop: '1px solid var(--border-glass)',
          color: 'var(--text-muted)', fontSize: '0.8rem'
        }}>
          <p>Delhi Smart Traffic Prediction System &bull; Deep Learning DNNs &bull; Built with TensorFlow, FastAPI & React</p>
        </footer>
      </main>
    </>
  );
}
