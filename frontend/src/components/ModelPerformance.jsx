import React from 'react';
import { Brain, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,14,39,0.95)', border: '1px solid rgba(0,212,255,0.2)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem'
    }}>
      <p style={{ color: '#8b8fa3', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? (p.value < 1 ? p.value.toFixed(6) : Math.round(p.value).toLocaleString()) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ModelPerformance({ modelInfo, predictions }) {
  if (!modelInfo) return null;

  const { best_model, models, histories } = modelInfo;

  // Predictions chart (last 200 points for readability)
  const predData = predictions?.y_true ? predictions.y_true.slice(-200).map((v, i) => ({
    idx: i,
    actual: Math.round(v),
    predicted: Math.round(predictions.y_pred[predictions.y_true.length - 200 + i]),
  })) : [];

  // Training loss curves for best model
  const bestHistory = histories?.[best_model];
  const lossData = bestHistory ? bestHistory.loss.map((v, i) => ({
    epoch: i + 1,
    train_loss: v,
    val_loss: bestHistory.val_loss[i],
  })) : [];

  return (
    <div id="model-performance">
      <div className="section-header">
        <Brain size={22} />
        <h2>Model Performance</h2>
      </div>
      <p className="section-subtitle">
        Deep learning model comparison and evaluation metrics
      </p>

      {/* Model comparison table */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Model Comparison
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="model-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>RMSE</th>
                <th>MAE</th>
                <th>R² Score</th>
                <th>MAPE (%)</th>
              </tr>
            </thead>
            <tbody>
              {models && Object.entries(models).map(([name, m]) => (
                <tr key={name}>
                  <td style={{ fontWeight: 600 }}>
                    {name.replace(/_/g, ' ')}
                    {name === best_model && <span className="best-badge">BEST</span>}
                  </td>
                  <td>{m.rmse?.toLocaleString()}</td>
                  <td>{m.mae?.toLocaleString()}</td>
                  <td style={{ color: m.r2 > 0.9 ? 'var(--accent-green)' : m.r2 > 0.8 ? 'var(--accent-amber)' : 'var(--accent-red)', fontWeight: 700 }}>
                    {m.r2?.toFixed(4)}
                  </td>
                  <td>{m.mape}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        {/* Actual vs Predicted */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
            Actual vs Predicted
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="idx" stroke="#5a5f73" fontSize={10} tickLine={false}
                  label={{ value: 'Test Sample', position: 'insideBottom', offset: -5, fill: '#5a5f73', fontSize: 10 }} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#00d4ff"
                  strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#f59e0b"
                  strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training Loss Curves */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Training Loss Curves ({best_model?.replace(/_/g, ' ')})
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lossData}>
                <defs>
                  <linearGradient id="gradLossTrain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLossVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" stroke="#5a5f73" fontSize={11} tickLine={false}
                  label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fill: '#5a5f73', fontSize: 10 }} />
                <YAxis stroke="#5a5f73" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="train_loss" name="Train Loss" stroke="#00d4ff"
                  fill="url(#gradLossTrain)" strokeWidth={2} />
                <Area type="monotone" dataKey="val_loss" name="Val Loss" stroke="#ec4899"
                  fill="url(#gradLossVal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
