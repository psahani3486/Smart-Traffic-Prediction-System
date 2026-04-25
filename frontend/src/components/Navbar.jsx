import React from 'react';
import { Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-brand">
        <Activity size={22} />
        TrafficAI
      </div>
      <div className="navbar-status">
        <div className="status-dot"></div>
        System Active
      </div>
    </nav>
  );
}
