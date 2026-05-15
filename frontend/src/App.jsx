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

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ marginBottom: '1rem' }}>Loading dashboard...</div>
      <div style={{ 
        display: 'inline-block', 
        width: '40px', 
        height: '40px',
        border: '3px solid rgba(0,245,255,0.2)',
        borderTop: '3px solid #00f5ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Check health first
        await axios.get(`${API}/api/health`, { timeout: 3000 });
        
        // Fetch data with longer timeout
        const [anaRes, modelRes, predRes] = await Promise.allSettled([
          axios.get(`${API}/api/analysis`, { timeout: 30000 }),
          axios.get(`${API}/api/model-info`, { timeout: 5000 }),
          axios.get(`${API}/api/predictions/sample`, { timeout: 5000 }),
        ]);
        
        if (anaRes.status === 'fulfilled' && anaRes.value.data) {
          setAnalysis(anaRes.value.data);
        }
        if (modelRes.status === 'fulfilled' && modelRes.value.data) {
          setModelInfo(modelRes.value.data);
        }
        if (predRes.status === 'fulfilled' && predRes.value.data) {
          setPredictions(predRes.value.data);
        }
        
        // Show error for failed requests but allow rendering
        if (anaRes.status === 'rejected') {
          console.warn('Analysis load failed:', anaRes.reason);
        }
      } catch (e) {
        console.error('Data fetch error:', e);
        setError('Backend connection issue. Some features may be unavailable.');
      }
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <>
      <Navbar />
      <main className="main-content">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {error && (
              <div style={{
                padding: '1rem',
                marginBottom: '1rem',
                background: 'rgba(255,71,87,0.1)',
                border: '1px solid rgba(255,71,87,0.3)',
                borderRadius: '12px',
                color: '#ff4757',
                fontSize: '0.9rem'
              }}>
                ⚠️ {error}
              </div>
            )}
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
              borderTop: '1px solid var(--border-light)',
              color: 'var(--text-muted)', fontSize: '0.8rem'
            }}>
              <p>Delhi Smart Traffic Prediction System • Deep Learning DNNs • Built with TensorFlow, FastAPI & React</p>
            </footer>
          </>
        )}
      </main>
    </>
  );
}
