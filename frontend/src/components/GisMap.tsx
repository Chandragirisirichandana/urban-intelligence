import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, Route, UrbanEvent } from '../types';
import { Layers, Eye, ShieldAlert, AlertTriangle, Car, Users, EyeOff } from 'lucide-react';

interface GisMapProps {
  buses: Bus[];
  routes: Route[];
  events: UrbanEvent[];
  onSelectEvent: (event: UrbanEvent) => void;
  selectedEventId?: number;
  height?: string;
}

export const GisMap: React.FC<GisMapProps> = ({
  buses,
  routes,
  events,
  onSelectEvent,
  selectedEventId,
  height = 'calc(100vh - 120px)'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer filter toggles
  const [showBuses, setShowBuses] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showDefects, setShowDefects] = useState(true);
  const [showCongestion, setShowCongestion] = useState(true);
  const [showSafety, setShowSafety] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Hyderabad City Center: 17.4100, 78.4700
    const map = L.map(mapContainerRef.current, {
      center: [17.4100, 78.4700],
      zoom: 12,
      zoomControl: false
    });

    // Custom dark sleek map tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    routesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polylines
  useEffect(() => {
    if (!mapInstanceRef.current || !routesLayerRef.current) return;
    routesLayerRef.current.clearLayers();

    if (showRoutes) {
      routes.forEach((rt, idx) => {
        const colors = ['#00f2fe', '#4facfe', '#8b5cf6', '#3b82f6', '#10b981'];
        const color = colors[idx % colors.length];

        const polyline = L.polyline(rt.waypoints, {
          color: color,
          weight: 4,
          opacity: 0.65,
          dashArray: '8, 8'
        });

        polyline.bindTooltip(`<b>${rt.route_number}:</b> ${rt.name}`, {
          sticky: true,
          className: 'glass-panel'
        });

        polyline.addTo(routesLayerRef.current!);
      });
    }
  }, [routes, showRoutes]);

  // Update Markers (Buses, Defects, Congestion, Safety, Incidents)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // 1. Bus Markers
    if (showBuses) {
      buses.forEach((bus) => {
        const busIcon = L.divIcon({
          className: 'custom-bus-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #00f2fe;
              border: 2px solid #ffffff;
              box-shadow: 0 0 14px #00f2fe;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #070a13;
              font-weight: 800;
              font-size: 11px;
              transform: rotate(${bus.heading || 0}deg);
            ">
              🚌
            </div>
            <div style="
              position: absolute;
              bottom: -18px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(7, 10, 19, 0.85);
              color: #00f2fe;
              font-size: 9px;
              font-weight: 700;
              padding: 1px 4px;
              border-radius: 4px;
              white-space: nowrap;
              border: 1px solid rgba(0, 242, 254, 0.4);
            ">
              ${bus.bus_number}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([bus.current_latitude, bus.current_longitude], { icon: busIcon });
        marker.bindPopup(`
          <div style="padding: 6px; font-family: system-ui;">
            <div style="font-weight: 800; color: #00f2fe; font-size: 13px;">${bus.bus_number}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${bus.route_name || 'Active Route'}</div>
            <div style="font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div>Speed: <b>${bus.speed} km/h</b></div>
              <div>Edge FPS: <b style="color:#10b981;">${bus.edge_fps || 21.4}</b></div>
              <div>Cams: <b>${bus.active_cameras || 4} HD</b></div>
              <div>Load: <b>${bus.passenger_load_pct || 60}%</b></div>
            </div>
          </div>
        `);
        marker.addTo(markersLayerRef.current!);
      });
    }

    // 2. Urban Events Markers
    events.forEach((evt) => {
      let isVisible = false;
      let markerColor = '#f59e0b';
      let iconSymbol = '⚠️';

      if (['pothole', 'crack', 'damaged_road', 'damaged_divider', 'missing_sign'].includes(evt.event_type)) {
        isVisible = showDefects;
        markerColor = evt.severity === 'critical' ? '#ef4444' : evt.severity === 'high' ? '#f97316' : '#f59e0b';
        iconSymbol = evt.event_type === 'pothole' ? '🕳️' : '⚠️';
      } else if (evt.event_type === 'waterlogging') {
        isVisible = showDefects;
        markerColor = '#06b6d4';
        iconSymbol = '🌊';
      } else if (evt.event_type === 'congestion') {
        isVisible = showCongestion;
        markerColor = '#ec4899';
        iconSymbol = '🚗';
      } else if (evt.event_type === 'pedestrian_risk') {
        isVisible = showSafety;
        markerColor = '#eab308';
        iconSymbol = '🚸';
      } else if (['hit_and_run', 'rash_driving', 'wrong_way', 'vehicle_violation'].includes(evt.event_type)) {
        isVisible = showIncidents;
        markerColor = '#ef4444';
        iconSymbol = '🚨';
      }

      if (!isVisible) return;

      const isSelected = evt.id === selectedEventId;
      const eventIcon = L.divIcon({
        className: 'custom-event-marker',
        html: `
          <div style="
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            border-radius: 50%;
            background: ${markerColor};
            border: ${isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.8)'};
            box-shadow: 0 0 ${isSelected ? '22px' : '12px'} ${markerColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '13px'};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            ${iconSymbol}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([evt.latitude, evt.longitude], { icon: eventIcon });
      marker.on('click', () => onSelectEvent(evt));

      marker.bindTooltip(`
        <div style="font-size: 11px; padding: 2px;">
          <b style="color:${markerColor}; text-transform:uppercase;">${evt.event_type.replace('_', ' ')}</b> (${Math.round(evt.confidence * 100)}%)
          <br/><span style="color:#94a3b8;">${evt.description.slice(0, 55)}...</span>
        </div>
      `, { sticky: true, className: 'glass-panel' });

      marker.addTo(markersLayerRef.current!);
    });

  }, [buses, events, selectedEventId, showBuses, showDefects, showCongestion, showSafety, showIncidents]);

  return (
    <div style={{ position: 'relative', width: '100%', height: height, borderRadius: '12px', overflow: 'hidden' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Layer Controls */}
      <div className="glass-panel" style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        padding: '10px 14px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '4px' }}>
          <Layers size={14} /> GIS MAP LAYERS
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: showBuses ? '#fff' : 'var(--text-muted)' }}>
          <input type="checkbox" checked={showBuses} onChange={(e) => setShowBuses(e.target.checked)} />
          <span>Active Buses ({buses.length})</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: showRoutes ? '#fff' : 'var(--text-muted)' }}>
          <input type="checkbox" checked={showRoutes} onChange={(e) => setShowRoutes(e.target.checked)} />
          <span>Transit Routes ({routes.length})</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: showDefects ? '#fff' : 'var(--text-muted)' }}>
          <input type="checkbox" checked={showDefects} onChange={(e) => setShowDefects(e.target.checked)} />
          <span style={{ color: '#f59e0b' }}>Road Defects & Waterlogging</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: showCongestion ? '#fff' : 'var(--text-muted)' }}>
          <input type="checkbox" checked={showCongestion} onChange={(e) => setShowCongestion(e.target.checked)} />
          <span style={{ color: '#ec4899' }}>Traffic Bottlenecks</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: showSafety ? '#fff' : 'var(--text-muted)' }}>
          <input type="checkbox" checked={showSafety} onChange={(e) => setShowSafety(e.target.checked)} />
          <span style={{ color: '#eab308' }}>Pedestrian Safety Hazards</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: showIncidents ? '#fff' : 'var(--text-muted)' }}>
          <input type="checkbox" checked={showIncidents} onChange={(e) => setShowIncidents(e.target.checked)} />
          <span style={{ color: '#ef4444' }}>Incidents & ANPR Hits</span>
        </label>
      </div>

      {/* Legend badge at bottom left */}
      <div className="glass-panel" style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        padding: '6px 12px',
        fontSize: '0.72rem',
        color: 'var(--text-secondary)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span>Detections: <b>{events.length} Active Events</b></span>
        <span>•</span>
        <span style={{ color: 'var(--brand-cyan)' }}>Auto-updating via Edge Stream</span>
      </div>
    </div>
  );
};
