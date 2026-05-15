import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

// Delhi traffic zone coordinates
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

export default function TrafficMap({ startArea = 'Connaught Place', endArea = 'IGI Airport' }) {
  const mapRef = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const polyline = useRef(null);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) return;

    // Create map centered on Delhi
    const delhibounds = {
      north: 28.8,
      south: 28.4,
      east: 77.4,
      west: 77.0
    };

    // Simple map SVG-based approach (since Google Maps API key might not be available)
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = '';

    // Create SVG canvas for map visualization
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 400 350');
    svg.style.background = 'rgba(20, 30, 60, 0.8)';
    svg.style.borderRadius = '12px';

    // Add map background
    const mapBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    mapBg.setAttribute('width', '400');
    mapBg.setAttribute('height', '350');
    mapBg.setAttribute('fill', 'rgba(10, 15, 40, 0.9)');
    svg.appendChild(mapBg);

    // Add grid lines (simplified Delhi map representation)
    const gridColor = 'rgba(100, 150, 200, 0.1)';
    for (let i = 0; i < 5; i++) {
      const vline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      vline.setAttribute('x1', (i * 100).toString());
      vline.setAttribute('y1', '0');
      vline.setAttribute('x2', (i * 100).toString());
      vline.setAttribute('y2', '350');
      vline.setAttribute('stroke', gridColor);
      vline.setAttribute('stroke-width', '1');
      svg.appendChild(vline);

      const hline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hline.setAttribute('x1', '0');
      hline.setAttribute('y1', (i * 87.5).toString());
      hline.setAttribute('x2', '400');
      hline.setAttribute('y2', (i * 87.5).toString());
      hline.setAttribute('stroke', gridColor);
      hline.setAttribute('stroke-width', '1');
      svg.appendChild(hline);
    }

    // Function to convert coordinates to SVG coordinates
    const coordsToSvg = (lat, lng) => {
      const x = ((lng - 77.0) / 0.4) * 400;
      const y = ((28.8 - lat) / 0.4) * 350;
      return { x, y };
    };

    // Draw all traffic zones
    Object.entries(AREA_COORDINATES).forEach(([name, coord]) => {
      const { x, y } = coordsToSvg(coord.lat, coord.lng);
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', 'rgba(74, 158, 255, 0.4)');
      circle.setAttribute('stroke', 'rgba(74, 158, 255, 0.8)');
      circle.setAttribute('stroke-width', '1');
      svg.appendChild(circle);

      // Add labels for main areas
      const mainAreas = ['Connaught Place', 'IGI Airport', 'AIIMS', 'Dwarka', 'Model Town'];
      if (mainAreas.includes(name)) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', (y - 12).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '9');
        text.setAttribute('fill', 'var(--accent-cyan)');
        text.setAttribute('font-weight', '600');
        text.textContent = name.split(' ')[0];
        svg.appendChild(text);
      }
    });

    // Draw route line
    if (AREA_COORDINATES[startArea] && AREA_COORDINATES[endArea]) {
      const startCoord = AREA_COORDINATES[startArea];
      const endCoord = AREA_COORDINATES[endArea];
      const { x: x1, y: y1 } = coordsToSvg(startCoord.lat, startCoord.lng);
      const { x: x2, y: y2 } = coordsToSvg(endCoord.lat, endCoord.lng);

      // Draw route line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('stroke', 'url(#routeGradient)');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);

      // Add gradient definition
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', 'routeGradient');
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');
      
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', '#22c55e');
      gradient.appendChild(stop1);

      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', '#f97316');
      gradient.appendChild(stop2);

      defs.appendChild(gradient);
      svg.insertBefore(defs, svg.firstChild);

      // Draw start marker (green)
      const startMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      startMarker.setAttribute('cx', x1.toString());
      startMarker.setAttribute('cy', y1.toString());
      startMarker.setAttribute('r', '6');
      startMarker.setAttribute('fill', '#22c55e');
      startMarker.setAttribute('stroke', 'white');
      startMarker.setAttribute('stroke-width', '2');
      svg.appendChild(startMarker);

      // Draw end marker (red)
      const endMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      endMarker.setAttribute('cx', x2.toString());
      endMarker.setAttribute('cy', y2.toString());
      endMarker.setAttribute('r', '6');
      endMarker.setAttribute('fill', '#ef4444');
      endMarker.setAttribute('stroke', 'white');
      endMarker.setAttribute('stroke-width', '2');
      svg.appendChild(endMarker);

      // Add labels
      const startText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      startText.setAttribute('x', x1.toString());
      startText.setAttribute('y', (y1 + 18).toString());
      startText.setAttribute('text-anchor', 'middle');
      startText.setAttribute('font-size', '10');
      startText.setAttribute('fill', '#22c55e');
      startText.setAttribute('font-weight', 'bold');
      startText.textContent = 'Start';
      svg.appendChild(startText);

      const endText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      endText.setAttribute('x', x2.toString());
      endText.setAttribute('y', (y2 - 8).toString());
      endText.setAttribute('text-anchor', 'middle');
      endText.setAttribute('font-size', '10');
      endText.setAttribute('fill', '#ef4444');
      endText.setAttribute('font-weight', 'bold');
      endText.textContent = 'End';
      svg.appendChild(endText);
    }

    mapContainer.appendChild(svg);
  }, [startArea, endArea]);

  return (
    <div className="glass-card traffic-map-card">
      <div className="section-header">
        <MapPin size={22} />
        <h3>Route Map</h3>
      </div>
      <div className="traffic-map" ref={mapRef}></div>
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#22c55e' }}></span>
          <span>Start Point</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444' }}></span>
          <span>End Point</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'rgba(74, 158, 255, 0.4)' }}></span>
          <span>Traffic Zones</span>
        </div>
      </div>
    </div>
  );
}
