import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';

export default function Navbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-brand">
        <Activity size={22} />
        Delhi TrafficAI
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Clock size={14} />
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="navbar-status">
          <div className="status-dot"></div>
          System Active
        </div>
      </div>
    </nav>
  );
}
