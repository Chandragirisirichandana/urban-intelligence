/**
 * Urban Intelligence Platform - Pothole-Aware Navigation View
 *
 * Features:
 * - Interactive Leaflet map with route visualization
 * - Satellite / standard map toggle
 * - Current GPS location (browser geolocation + demo simulation fallback)
 * - Destination search and route calculation
 * - Route-corridor hazard filtering
 * - Pothole-ahead proximity warnings
 * - Hazard detail panel
 * - Map layer selector (potholes, waterlogging, accidents, traffic)
 * - Route hazard summary and alternative routes
 *
 * Respects existing design-system CSS variables (dark theme, panel, badge, btn).
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Search, Navigation, AlertTriangle, Layers, Satellite,
  Fullscreen, Wind,
  ChevronLeft, Map as MapIcon
} from 'lucide-react';
import { apiClient, DEMO_MODE, MOCK_HAZARDS } from '../services/api';
import { Bus, Route, Hazard, HazardWarning, RouteOption } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavigationProps {
  buses: Bus[];
  routes: Route[];
  events: any[];
}

interface GpsState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  status: 'active' | 'unavailable' | 'simulated';
  speed: number | null;
  heading: number | null;
  lastUpdate: string | null;
}

// Severity → color mapping
const SEVERITY_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  critical: { dot: 'var(--severity-critical)', bg: 'var(--severity-critical-muted)', text: '#fca5a5' },
  high: { dot: 'var(--severity-high)', bg: 'var(--severity-high-muted)', text: '#fbbf24' },
  medium: { dot: 'var(--severity-medium)', bg: 'var(--severity-medium-muted)', text: '#fde047' },
  low: { dot: 'var(--severity-low)', bg: 'var(--severity-low-muted)', text: '#4ade80' },
};

// Hyderabad center defaults
const HYD_CENTER: [number, number] = [17.3880, 78.4590];

// ─── Utility ──────────────────────────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function pointToSegmentDistance(
  lat: number, lng: number,
  segA: [number, number], segB: [number, number]
): number {
  const refLat = (segA[0] + segB[0]) / 2;
  const R = 6371000;
  const px = lng * (R * Math.cos(refLat * Math.PI / 180)) * Math.PI / 180;
  const py = lat * R * Math.PI / 180;
  const x1 = segA[1] * (R * Math.cos(refLat * Math.PI / 180)) * Math.PI / 180;
  const y1 = segA[0] * R * Math.PI / 180;
  const x2 = segB[1] * (R * Math.cos(refLat * Math.PI / 180)) * Math.PI / 180;
  const y2 = segB[0] * R * Math.PI / 180;

  const dx = x2 - x1, dy = y2 - y1;
  const segLenSq = dx * dx + dy * dy;
  if (segLenSq < 1e-10) return haversine(lat, lng, segA[0], segA[1]);

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / segLenSq));
  const projLat = (y1 + t * dy) / (R * Math.PI / 180);
  const projLng = (x1 + t * dx) / (R * Math.cos(refLat * Math.PI / 180) * Math.PI / 180);
  return haversine(lat, lng, projLat, projLng);
}

function pointToRouteDistance(lat: number, lng: number, waypoints: [number, number][]): number {
  let minDist = Infinity;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = pointToSegmentDistance(lat, lng, waypoints[i], waypoints[i + 1]);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function distanceAlongRoute(
  lat: number, lng: number,
  waypoints: [number, number][]
): number {
  // Distance to nearest point on route + accumulated distance up to that point
  let minDist = Infinity;
  let closestSegIdx = 0;
  let t_at_closest = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const segA = waypoints[i];
    const segB = waypoints[i + 1];
    const refLat = (segA[0] + segB[0]) / 2;
    const R = 6371000;
    const px = lng * (R * Math.cos(refLat * Math.PI / 180)) * Math.PI / 180;
    const py = lat * R * Math.PI / 180;
    const x1 = segA[1] * (R * Math.cos(refLat * Math.PI / 180)) * Math.PI / 180;
    const y1 = segA[0] * R * Math.PI / 180;
    const x2 = segB[1] * (R * Math.cos(refLat * Math.PI / 180)) * Math.PI / 180;
    const y2 = segB[0] * R * Math.PI / 180;

    const dx = x2 - x1, dy = y2 - y1;
    const segLenSq = dx * dx + dy * dy;
    let t = 0;
    if (segLenSq > 1e-10) {
      t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / segLenSq));
      const projX = x1 + t * dx;
      const projY = y1 + t * dy;
      const projLat = projY / (R * Math.PI / 180);
      const projLng = projX / (R * Math.cos(refLat * Math.PI / 180) * Math.PI / 180);
      const d = haversine(lat, lng, projLat, projLng);
      if (d < minDist) {
        minDist = d;
        closestSegIdx = i;
        t_at_closest = t;
      }
    }
  }

  // Accumulate distance from start to the closest point on route
  let routeDist = 0;
  for (let i = 0; i < closestSegIdx; i++) {
    routeDist += haversine(waypoints[i][0], waypoints[i][1], waypoints[i+1][0], waypoints[i+1][1]);
  }
  const segA = waypoints[closestSegIdx];
  const segB = waypoints[closestSegIdx + 1];
  routeDist += haversine(segA[0], segA[1], segB[0], segB[1]) * t_at_closest;

  return routeDist;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const NavigationView: React.FC<NavigationProps> = ({ buses, routes, events }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const hazardsLayerRef = useRef<L.LayerGroup | null>(null);
  const busMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  // Navigation state
  const [gps, setGps] = useState<GpsState>({
    lat: null, lng: null, accuracy: null,
    status: DEMO_MODE ? 'simulated' : 'unavailable',
    speed: null, heading: null, lastUpdate: null,
  });
  const [destination, setDestination] = useState<string>('');
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [destinationName, setDestinationName] = useState<string>('');
  const [routePoly, setRoutePoly] = useState<[number, number][] | null>(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [hazardsOnRoute, setHazardsOnRoute] = useState<Hazard[]>([]);
  const [routeSummary, setRouteSummary] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeWarning, setActiveWarning] = useState<HazardWarning | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [mapStyle, setMapStyle] = useState<'map' | 'satellite'>('map');
  const [corridor, setCorridor] = useState(50);
  const [showHazardPanel, setShowHazardPanel] = useState(true);
  const [routeInputExpanded, setRouteInputExpanded] = useState(true);
  const [layers, setLayers] = useState({
    potholes: true, damagedRoads: true, waterlogging: true,
    accidents: true, traffic: true,
  });

  // Track which hazards have been warned about (to avoid repeat alerts)
  const warnedHazardsRef = useRef<Set<number>>(new Set());

  // ─── GPS Initialization ─────────────────────────────────────────────────────

  useEffect(() => {
    if (DEMO_MODE) {
      // Simulated GPS — use first active bus position
      const bus = buses.find(b => b.status === 'active');
      if (bus) {
        setGps({
          lat: bus.current_latitude,
          lng: bus.current_longitude,
          accuracy: 4.2,
          status: 'simulated',
          speed: bus.speed,
          heading: bus.heading || 0,
          lastUpdate: new Date().toISOString(),
        });
      }
      return;
    }

    // Real browser geolocation
    if (!navigator.geolocation) {
      setGps(g => ({ ...g, status: 'unavailable' }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          status: 'active',
          speed: pos.coords.speed ? pos.coords.speed * 3.6 : null,
          heading: pos.coords.heading,
          lastUpdate: new Date().toISOString(),
        });
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGps(g => ({ ...g, status: 'unavailable' }));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [buses]);

  // ─── Map Initialization ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const center = gps.lat && gps.lng ? [gps.lat, gps.lng] : HYD_CENTER;
    const map = L.map(mapContainerRef.current, {
      center: center as [number, number],
      zoom: 13,
      zoomControl: false,
    });

    // Base layer (CartoDB Dark Matter — existing design)
    const darkLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; OpenStreetMap contributors',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    );

    // Satellite layer (legitimate satellite tiles from provider)
    const satelliteUrl = import.meta.env.VITE_MAP_SATELLITE_URL ||
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const satelliteLayer = L.tileLayer(satelliteUrl, {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; WorldImagery',
      maxZoom: 19,
      subdomains: 'abcd',
    });

    darkLayer.addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    hazardsLayerRef.current = L.layerGroup().addTo(map);
    busMarkersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ─── Map Style Switch ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    // Access current base layer
    const baseLayers = (map as any)._layers;
    // Remove all existing tile layers
    Object.keys(baseLayers)
      .filter(k => baseLayers[k] instanceof L.TileLayer)
      .forEach(k => {
        (map as any)._layers[k].removeFrom(map);
      });

    if (mapStyle === 'satellite') {
      const satelliteUrl = import.meta.env.VITE_MAP_SATELLITE_URL ||
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      L.tileLayer(satelliteUrl, {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; WorldImagery',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
    } else {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; OpenStreetMap contributors',
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);
    }
  }, [mapStyle]);

  // ─── Update Vehicle Marker ──────────────────────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current || !vehicleMarkerRef.current) return;
    const { lat, lng } = gps;
    if (lat && lng) {
      vehicleMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [gps]);

  // ─── Bus Markers ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current || !busMarkersLayerRef.current) return;
    busMarkersLayerRef.current.clearLayers();

    if (!layers.potholes && !layers.damagedRoads && !layers.waterlogging && !layers.accidents && !layers.traffic) {
      // If all hazard layers off, still show buses
    }

    // Only show buses in demo mode (live mode would show real telemetry)
    if (DEMO_MODE) {
      buses.forEach((bus) => {
        if (bus.status !== 'active') return;
        const icon = L.divIcon({
          className: 'bus-nav-marker',
          html: `
            <div style="
              width: 26px; height: 26px; border-radius: 50%;
              background: #2563eb; border: 2px solid #fff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.5);
              display: flex; align-items: center; justify-content: center;
              color: #fff; font-size: 11px; font-weight: 700;
              transform: rotate(${(bus.heading || 0)}deg);
            ">🚌</div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const marker = L.marker([bus.current_latitude, bus.current_longitude], { icon });
        marker.bindTooltip(`${bus.bus_number} · ${bus.route_name || ''}`, {
          className: 'panel',
          direction: 'top',
        });
        marker.addTo(busMarkersLayerRef.current!);
      });
    }
  }, [buses, layers, DEMO_MODE]);

  // ─── Render Route ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();

    if (routePoly && routePoly.length >= 2) {
      // Main route
      L.polyline(routePoly, {
        color: '#2563eb', weight: 5, opacity: 0.85,
        lineCap: 'round', lineJoin: 'round',
      }).addTo(routeLayerRef.current);

      // Alternative routes
      alternativeRoutes.forEach((alt, idx) => {
        const colors = ['#38bdf8', '#8b5cf6', '#10b981'];
        L.polyline(alt.waypoints, {
          color: colors[idx % colors.length],
          weight: 3, opacity: 0.6, dashArray: '8, 6',
          lineCap: 'round', lineJoin: 'round',
        }).addTo(routeLayerRef.current!);
      });

      // Fit bounds
      const allPoints: [number, number][] = [...routePoly];
      alternativeRoutes.forEach(alt => allPoints.push(...alt.waypoints));
      if (gps.lat && gps.lng) allPoints.unshift([gps.lat, gps.lng]);
      if (destinationCoords) allPoints.push(destinationCoords);

      const firstBounds = L.latLngBounds([allPoints[0], allPoints[1]]);
      allPoints.slice(2).forEach(p => firstBounds.extend(p));
      if (firstBounds.isValid()) {
        mapInstanceRef.current.fitBounds(firstBounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [routePoly, alternativeRoutes, gps, destinationCoords]);

  // ─── Render Hazards ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current || !hazardsLayerRef.current) return;
    hazardsLayerRef.current.clearLayers();

    // Use hazards from the selected route or all events
    const hazardsToDisplay = routePoly
      ? hazardsOnRoute
      : events.filter(e => ['pothole', 'damaged_road', 'crack', 'waterlogging'].includes(e.event_type));

    hazardsToDisplay.forEach((hazard) => {
      const sev = SEVERITY_COLORS[hazard.severity] || SEVERITY_COLORS['low'];
      let isVisible = true;
      let iconSymbol = '🕳️';
      let color = sev.dot;

      if (hazard.hazard_type === 'waterlogging') {
        isVisible = layers.waterlogging;
        iconSymbol = '🌊';
        color = '#0284c7';
      } else if (['pothole', 'crack', 'damaged_road'].includes(hazard.hazard_type)) {
        isVisible = hazard.hazard_type === 'pothole' ? layers.potholes : layers.damagedRoads;
        iconSymbol = hazard.hazard_type === 'pothole' ? '🕳️' : '⚠️';
      } else if (['incident', 'accident'].includes(hazard.hazard_type)) {
        isVisible = layers.accidents;
        iconSymbol = '🚨';
        color = '#dc2626';
      } else {
        isVisible = layers.traffic;
        iconSymbol = '🚗';
        color = '#db2777';
      }

      if (!isVisible) return;

      const isSelected = selectedHazard?.id === hazard.id;
      const icon = L.divIcon({
        className: 'hazard-marker',
        html: `
          <div style="
            width: ${isSelected ? 32 : 26}px;
            height: ${isSelected ? 32 : 26}px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center;
            font-size: ${isSelected ? 15 : 12}px;
            cursor: pointer;
            transition: all 0.2s ease;
          ">${iconSymbol}</div>
        `,
        iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
        iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14],
      });

      const marker = L.marker([hazard.latitude, hazard.longitude], { icon });
      marker.on('click', () => setSelectedHazard(hazard));

      // Severity color for tooltip
      const tooltipColor = color;
      marker.bindTooltip(
        `
        <div style="font-size: 11px; padding: 2px; font-family: Inter, system-ui, sans-serif;">
          <b style="color:${tooltipColor}; text-transform:capitalize;">
            ${hazard.hazard_type || 'hazard'}
          </b> (${Math.round(hazard.confidence * 100)}% conf)
          <br><span style="color:#a1a1aa;">
            ${(hazard.description || '').slice(0, 60)}...
          </span>
        </div>
        `,
        { sticky: true, className: 'panel' }
      );

      marker.addTo(hazardsLayerRef.current!);
    });

    // Add vehicle marker
    if (gps.lat && gps.lng) {
      const busIcon = L.divIcon({
        className: 'vehicle-marker',
        html: `
          <div style="
            width: 32px; height: 32px; border-radius: 50%;
            background: #2563eb; border: 3px solid #fff;
            box-shadow: 0 0 12px rgba(37,99,235,0.6);
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 15px; font-weight: 700;
            transform: rotate(${gps.heading || 0}deg);
            z-index: 1000;
          ">🚌</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (!vehicleMarkerRef.current) {
        vehicleMarkerRef.current = L.marker([gps.lat, gps.lng], { icon: busIcon, zIndexOffset: 1000 });
        vehicleMarkerRef.current.addTo(mapInstanceRef.current);
      } else {
        vehicleMarkerRef.current.setIcon(busIcon);
        vehicleMarkerRef.current.setLatLng([gps.lat, gps.lng]);
      }
    }
  }, [hazardsOnRoute, events, layers, selectedHazard, gps, routePoly]);

  // ─── Pothole-Ahead Warning Detection ────────────────────────────────────────

  const WARNING_DISTANCE = 200; // meters — hazards ahead within this distance trigger warnings

  const checkWarnings = useCallback(() => {
    if (!gps.lat || !gps.lng || !routePoly || routePoly.length < 2) return;
    if (hazardsOnRoute.length === 0) return;

    const isResolved = (h: any): boolean => {
      const status = h.status || '';
      return status === 'resolved' || status === 'false_positive';
    };

    for (const hazard of hazardsOnRoute) {
      if (isResolved(hazard)) continue;  // Skip resolved hazards
      if (warnedHazardsRef.current.has(hazard.id)) continue; // Skip already-warned hazards

      const hazardDistAlongRoute = distanceAlongRoute(hazard.latitude, hazard.longitude, routePoly);
      const vehicleDistAlongRoute = distanceAlongRoute(gps.lat, gps.lng, routePoly);

      const aheadDistance = hazardDistAlongRoute - vehicleDistAlongRoute;

      if (aheadDistance > 0 && aheadDistance <= WARNING_DISTANCE) {
        // Calculate actual distance (not just along route) for the warning message
        const directDist = haversine(gps.lat, gps.lng, hazard.latitude, hazard.longitude);

        const warning: HazardWarning = {
          hazard,
          distanceMeters: Math.round(directDist),
          timeToArrivalSeconds: Math.round((directDist / ((gps.speed || 30) / 3.6))),
          isNewWarning: true,
        };

        setActiveWarning(warning);
        warnedHazardsRef.current.add(hazard.id);

        // Auto-clear warning after 10 seconds
        setTimeout(() => {
          setActiveWarning(prev => prev?.hazard.id === hazard.id ? null : prev);
        }, 10000);

        // Focus the map on the hazard
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([hazard.latitude, hazard.longitude], { animate: false });
        }
      }
    }
  }, [gps, routePoly, hazardsOnRoute]);

  // Run warning check periodically
  useEffect(() => {
    if (!routePoly) return;
    const interval = setInterval(checkWarnings, 3000);
    checkWarnings();
    return () => clearInterval(interval);
  }, [checkWarnings, routePoly]);

  // ─── Route Calculation ──────────────────────────────────────────────────────

  const calculateRoute = async (origin: [number, number], dest: [number, number]) => {
    setIsCalculating(true);
    setActiveWarning(null);
    warnedHazardsRef.current.clear();

    try {
      const analysis = await apiClient.analyzeRoute(origin, dest, corridor);

      setRoutePoly(analysis.route?.waypoints || null);
      setAlternativeRoutes(analysis.alternatives || []);
      setHazardsOnRoute(analysis.hazards || []);
      setRouteSummary(analysis.summary || null);
      setSelectedRoute(analysis.route ? {
        id: 'primary',
        name: analysis.route.source || 'Primary',
        distance_km: analysis.route.distance_km,
        eta_minutes: analysis.route.eta_minutes,
        hazard_count: analysis.hazards?.length || 0,
        severe_hazards: (analysis.hazards || []).filter((h: Hazard) => h.severity === 'critical' || h.severity === 'high').length,
        moderate_hazards: (analysis.hazards || []).filter((h: Hazard) => h.severity === 'medium').length,
        minor_hazards: (analysis.hazards || []).filter((h: Hazard) => h.severity === 'low').length,
        waypoints: analysis.route.waypoints,
      } : null);

      setRouteInputExpanded(false);
      setShowHazardPanel(true);
    } catch (err) {
      console.error('Route calculation failed:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSearch = async () => {
    if (!gps.lat || !gps.lng) return;
    let dest: [number, number] | null = null;

    // Try parsing coordinates or address
    const coords = parseDestination(destination);
    if (coords) {
      dest = coords;
    } else if (destination.trim()) {
      // In demo mode, use a predefined Hyderabad destination
      const HyderabadDests: Record<string, [number, number]> = {
        'charminar': [17.3714, 78.4840],
        'nampally': [17.4400, 78.4980],
        'mehedipatnam': [17.4045, 78.4572],
        'begumpet': [17.4580, 78.4650],
        'tank bund': [17.3750, 78.4650],
        'secunderabad': [17.4399, 78.5000],
        'amberpet': [17.4520, 78.4900],
      };

      const key = Object.keys(HyderabadDests).find(k =>
        destination.toLowerCase().includes(k)
      );
      if (key) dest = HyderabadDests[key];
    }

    if (!dest) {
      alert('Please enter a valid Hyderabad destination or coordinates (e.g. "Charminar" or "17.3714,78.4840")');
      return;
    }

    setDestinationCoords(dest);
    setDestinationName(destination || 'Destination');
    await calculateRoute([gps.lat, gps.lng], dest);
  };

  const handleUseCurrentLocation = () => {
    if (gps.lat && gps.lng) {
      const dest: [number, number] = [17.3714, 78.4840]; // Charminar as demo destination
      setDestinationCoords(dest);
      setDestinationName('Charminar, Hyderabad');
      calculateRoute([gps.lat, gps.lng], dest);
    }
  };

  const handleUseRoute = (r: RouteOption) => {
    setSelectedRoute(r);
    setRoutePoly(r.waypoints);
    // Re-filter hazards for this route
    if (DEMO_MODE) {
      const hazards = MOCK_HAZARDS.filter((h: Hazard) =>
        pointToRouteDistance(h.latitude, h.longitude, r.waypoints) <= corridor
      );
      setHazardsOnRoute(hazards);
      setRouteSummary({
        distance_km: r.distance_km,
        eta_minutes: r.eta_minutes,
        hazard_count: hazards.length,
        severe_count: hazards.filter((h: Hazard) => h.severity === 'critical' || h.severity === 'high').length,
        moderate_count: hazards.filter((h: Hazard) => h.severity === 'medium').length,
        minor_count: hazards.filter((h: Hazard) => h.severity === 'low').length,
        waterlogging_count: hazards.filter((h: Hazard) => h.hazard_type === 'waterlogging').length,
        accident_count: 0,
      });
      setRouteInputExpanded(false);
    }
  };

  function parseDestination(input: string): [number, number] | null {
    const trimmed = input.trim();
    // Check if it looks like "lat,lng"
    const parts = trimmed.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    return null;
  }

  // ─── Status Badge ───────────────────────────────────────────────────────────

  const getStatusBadge = (hazard: Hazard) => {
    const status = hazard.status || 'new';
    const labels: Record<string, string> = {
      new: 'NEW', verified: 'VERIFIED', reported: 'REPORTED',
      repair_in_progress: 'REPAIR', resolved: 'RESOLVED',
    };
    const colors: Record<string, string> = {
      new: 'var(--severity-info)', verified: '#60a5fa',
      reported: '#fbbf24', repair_in_progress: '#f59e0b', resolved: '#4ade80',
    };
    return (
      <span className="badge" style={{
        background: `rgba(${hexToRgb(colors[status] || '#60a5fa')}, 0.15)`,
        color: colors[status] || '#60a5fa',
        fontSize: '0.65rem',
        padding: '2px 6px',
      }}>
        {labels[status] || status.toUpperCase()}
      </span>
    );
  };

  function hexToRgb(hex: string): string {
    const h = hex.replace('#', '');
    if (h.length === 6) {
      const r = parseInt(h.substr(0, 2), 16);
      const g = parseInt(h.substr(2, 2), 16);
      const b = parseInt(h.substr(4, 2), 16);
      return `${r}, ${g}, ${b}`;
    }
    // Handle named colors via CSS variable lookup — return a neutral
    return '100, 100, 120';
  }

  const severityLabel = (sev: string) => {
    const map: Record<string, string> = {
      critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', low: 'LOW',
    };
    return map[sev] || sev.toUpperCase();
  };

  // ─── Render ─�────────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '14px',
      height: 'calc(100vh - 120px)',
    }}>
      {/* Top Bar: Search + Controls */}
      <div style={{
        display: 'flex', gap: '12px', alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Route Input Panel */}
        {routeInputExpanded && (
          <div className="panel" style={{
            padding: '14px 16px', flex: 1, minWidth: '280px',
          }}>
            <div style={{
              display: 'flex', gap: '8px', marginBottom: '10px',
              alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Destination Search
              </h3>
              <button
                onClick={() => setRouteInputExpanded(false)}
                className="btn btn-ghost btn-sm"
                aria-label="Collapse search"
              >
                <ChevronLeft size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Enter destination (e.g. Charminar, 17.37,78.48)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={handleSearch}
                className="btn btn-primary btn-sm"
                disabled={isCalculating || !gps.lat}
              >
                {isCalculating ? '...' : 'Go'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                onClick={handleUseCurrentLocation}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '5px 10px' }}
              >
                <MapPin size={12} /> Use My Location
              </button>
              {gps.status === 'simulated' && (
                <span className="badge badge-demo" style={{ fontSize: '0.65rem' }}>
                  SIMULATED GPS
                </span>
              )}
              {gps.status === 'unavailable' && (
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem', color: '#f87171' }}>
                  GPS UNAVAILABLE
                </span>
              )}
            </div>

            {destinationCoords && !routePoly && (
              <button
                onClick={() => calculateRoute([gps.lat!, gps.lng!], destinationCoords)}
                className="btn btn-primary"
                style={{ marginTop: '8px', width: '100%' }}
              >
                Calculate Route to {destinationName || 'Destination'}
              </button>
            )}
          </div>
        )}

        {/* Map Style Toggle */}
        <div className="panel" style={{
          padding: '4px', display: 'flex', borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setMapStyle('map')}
            className="btn btn-ghost btn-sm"
            style={{
              fontSize: '0.72rem', padding: '6px 12px',
              fontWeight: mapStyle === 'map' ? 600 : 500,
              backgroundColor: mapStyle === 'map' ? 'var(--accent-muted)' : 'transparent',
            }}
          >
            <MapIcon size={14} /> MAP
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className="btn btn-ghost btn-sm"
            style={{
              fontSize: '0.72rem', padding: '6px 12px',
              fontWeight: mapStyle === 'satellite' ? 600 : 500,
              backgroundColor: mapStyle === 'satellite' ? 'var(--accent-muted)' : 'transparent',
            }}
          >
            <Satellite size={14} /> SATELLITE
          </button>
        </div>

        {/* Full-screen button (when panel collapsed) */}
        {!routeInputExpanded && (
          <button
            onClick={() => setRouteInputExpanded(true)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.72rem' }}
          >
            <Search size={14} /> Search Destination
          </button>
        )}

        {/* Corridor Control */}
        <div className="panel" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
          <label>
            Corridor: {corridor}m
            <input
              type="range" min={20} max={200} step={10}
              value={corridor} onChange={(e) => setCorridor(Number(e.target.value))}
              style={{ verticalAlign: 'middle', marginLeft: '8px' }}
            />
          </label>
        </div>

        {/* Map Full-screen */}
        <button
          onClick={() => {
            const el = mapContainerRef.current?.closest('.map-wrapper');
            if (el && (el as any).requestFullscreen) {
              (el as any).requestFullscreen();
            }
          }}
          className="btn btn-ghost btn-sm"
          title="Toggle fullscreen"
        >
          <Fullscreen size={14} />
        </button>
      </div>

      {/* Main Content: Map + Side Panel */}
      <div style={{
        display: 'flex', gap: '12px', flex: 1, overflow: 'hidden',
      }} className="navigation-layout">

        {/* Map */}
        <div ref={mapContainerRef} className="map-wrapper" style={{
          flex: 1, height: '100%', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)', overflow: 'hidden',
          position: 'relative',
        }} />

        {/* Side Panel: Hazards + Warning + Details */}
        {(showHazardPanel && (routePoly || selectedHazard)) && (
          <div className="panel" style={{
            width: '340px', maxWidth: '340px', padding: '14px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Pothole-Ahead Warning Banner */}
            {activeWarning && (
              <div style={{
                background: 'var(--severity-critical-muted)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px', marginBottom: '10px',
                animation: 'pulse-critical 2s infinite',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: '#fca5a5', fontSize: '0.78rem', fontWeight: 600,
                }}>
                  <AlertTriangle size={14} /> ⚠ POTHOLE AHEAD
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {activeWarning.hazard.hazard_type === 'pothole'
                    ? 'Pothole'
                    : activeWarning.hazard.hazard_type === 'waterlogging'
                      ? 'Waterlogging'
                      : activeWarning.hazard.hazard_type || 'Hazard'} ahead
                  <br />
                  <b style={{ color: '#fca5a5' }}>{activeWarning.distanceMeters} m ahead</b>
                  <br />
                  Observed by {activeWarning.hazard.observation_count || 1} buses
                  <br />
                  Last detected {formatTimeAgo(activeWarning.hazard.last_observed || activeWarning.hazard.timestamp)}
                </div>
              </div>
            )}

            {/* Route Summary */}
            {routeSummary && (
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)',
                padding: '10px 12px', marginBottom: '10px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    ROUTE SUMMARY
                  </span>
                  <span className="badge badge-accent" style={{ fontSize: '0.62rem' }}>
                    {routeSummary.simulated ? 'SIMULATED' : 'LIVE'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div>Distance: <b style={{ color: 'var(--text-primary)' }}>{routeSummary.distance_km.toFixed(1)} km</b></div>
                  <div>ETA: <b style={{ color: 'var(--text-primary)' }}>{Math.round(routeSummary.eta_minutes)} min</b></div>
                  <div>Known Hazards: <b style={{ color: 'var(--text-primary)' }}>{routeSummary.hazard_count}</b></div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#dc2626' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
                      Severe: {routeSummary.severe_count}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ea580c' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ea580c' }} />
                      Moderate: {routeSummary.moderate_count}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#d97706' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
                      Minor: {routeSummary.minor_count}
                    </span>
                  </div>

                  {routeSummary.waterlogging_count > 0 && (
                    <div style={{ marginTop: '4px', color: '#0284c7' }}>
                      Waterlogging: {routeSummary.waterlogging_count}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alternative Routes */}
            {alternativeRoutes.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  ALTERNATIVE ROUTES
                </div>
                {alternativeRoutes.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => handleUseRoute(alt)}
                    className="btn btn-secondary"
                    style={{
                      width: '100%', padding: '8px 10px', fontSize: '0.72rem',
                      flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontWeight: 600 }}>{alt.name}</span>
                      <span className="mono">{alt.distance_km.toFixed(1)} km · {Math.round(alt.eta_minutes)} min</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem' }}>
                      <span>Currently: {alt.hazard_count || 0} hazards</span>
                      <span style={{ color: alt.severe_hazards === 0 ? '#4ade80' : '#f87171' }}>
                        {alt.severe_hazards === 0 ? '0 severe' : `${alt.severe_hazards} severe`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Hazard List / Detail Panel */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '8px',
              overflowY: 'auto', flex: 1,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Hazards on Route ({hazardsOnRoute.length})
                </span>
                <Layers size={14} color="var(--text-muted)" />
              </div>

              {hazardsOnRoute.map((hazard) => {
                const svc = SEVERITY_COLORS[hazard.severity] || SEVERITY_COLORS['low'];
                return (
                  <div
                    key={hazard.id}
                    onClick={() => setSelectedHazard(hazard)}
                    className="clickable-row"
                    style={{
                      padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: selectedHazard?.id === hazard.id ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '4px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: svc.dot, boxShadow: `0 0 6px ${svc.dot}`,
                        }} />
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize',
                          color: svc.text,
                        }}>
                          {hazard.hazard_type?.replace('_', ' ')}
                        </span>
                        {getStatusBadge(hazard)}
                      </div>
                      <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {Math.round(hazard.confidence * 100)}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {hazard.description?.slice(0, 80)}...
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Obs: {hazard.observation_count || 1} · {formatTimeAgo(hazard.last_observed || hazard.timestamp)}
                    </div>
                  </div>
                );
              })}

              {hazardsOnRoute.length === 0 && routePoly && (
                <div style={{
                  padding: '16px', textAlign: 'center',
                  color: 'var(--text-muted)', fontSize: '0.8rem',
                }}>
                  No hazards detected on this route corridor.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Info Overlay (bottom left of map) */}
      <div className="panel" style={{
        position: 'absolute', bottom: '16px', left: '16px',
        padding: '10px 14px', fontSize: '0.75rem', zIndex: 1000,
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: gps.status === 'active' ? '#22c55e' :
                         gps.status === 'simulated' ? '#a78bfa' : '#f87171',
            }} />
            <b>
              {gps.status === 'active' ? 'GPS ACTIVE' :
               gps.status === 'simulated' ? 'SIMULATED GPS' :
               'GPS UNAVAILABLE'}
            </b>
          </div>
          {gps.lat && gps.lng && (
            <div className="mono" style={{ color: 'var(--text-secondary)' }}>
              {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
            </div>
          )}
          {gps.speed !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
              <Wind size={12} /> {gps.speed?.toFixed(1)} km/h
            </div>
          )}
          {gps.heading !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <Navigation size={12} /> {gps.heading.toFixed(0)}°
            </div>
          )}
        </div>
        {gps.lastUpdate && (
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Last update: {new Date(gps.lastUpdate).toLocaleTimeString('en-IN')}
          </div>
        )}
      </div>
    </div>
  );
};

function formatTimeAgo(iso: string | null | undefined): string {
  if (!iso) return 'unknown';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default NavigationView;