/**
 * Urban Intelligence Platform - TypeScript Type Definitions
 */

export type UserRole =
  | 'admin'
  | 'command_center'
  | 'transport_authority'
  | 'road_maintenance'
  | 'analyst'
  | 'viewer';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type EventStatus =
  | 'detected'
  | 'confirmed'
  | 'acknowledged'
  | 'assigned'
  | 'investigating'
  | 'resolved'
  | 'false_positive';

export type HazardStatus =
  | 'new'
  | 'verified'
  | 'reported'
  | 'repair_in_progress'
  | 'resolved';

export type HazardType =
  | 'pothole'
  | 'damaged_road'
  | 'waterlogging'
  | 'accident'
  | 'congestion';

export interface Hazard {
  id: number;
  hazard_id: string;
  hazard_type: HazardType;
  severity: SeverityLevel;
  confidence: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  last_observed: string;
  observation_count: number;
  status: HazardStatus;
  description: string;
  source_buses: number[];
  evidence_path?: string;
  ai_reasoning?: string[];
  is_simulated: boolean;
}

export interface RouteOption {
  id: string;
  name: string;
  distance_km: number;
  eta_minutes: number;
  hazard_count: number;
  severe_hazards: number;
  moderate_hazards: number;
  minor_hazards: number;
  waypoints: [number, number][];
}

export interface NavigationState {
  currentLocation: [number, number] | null;
  destination: [number, number] | null;
  destinationName: string;
  selectedRoute: RouteOption | null;
  alternativeRoutes: RouteOption[];
  hazardsAlongRoute: Hazard[];
  isCalculating: boolean;
  gpsStatus: 'active' | 'unavailable' | 'simulated';
  gpsAccuracy?: number;
  lastGpsUpdate?: string;
  warning?: HazardWarning;
  showHazardPanel: boolean;
  selectedHazard: Hazard | null;
  mapStyle: 'map' | 'satellite';
  corridorThreshold: number; // meters
}

export interface HazardWarning {
  hazard: Hazard;
  distanceMeters: number;
  timeToArrivalSeconds: number;
  isNewWarning: boolean;
}

export interface RouteSummary {
  distance_km: number;
  eta_minutes: number;
  hazard_count: number;
  severe_count: number;
  moderate_count: number;
  minor_count: number;
  waterlogging_count: number;
  accident_count: number;
}

export interface HazardCluster {
  id: number;
  cluster_id: string;
  hazard_type: HazardType;
  severity: SeverityLevel;
  confidence: number;
  latitude: number;
  longitude: number;
  observation_count: number;
  first_observed: string;
  last_observed: string;
  bus_count: number;
  status: HazardStatus;
}

export type MapStyle = 'map' | 'satellite';

export type EventType =
  | 'pothole'
  | 'crack'
  | 'damaged_road'
  | 'waterlogging'
  | 'debris'
  | 'damaged_divider'
  | 'missing_divider'
  | 'damaged_zebra'
  | 'missing_zebra'
  | 'damaged_sign'
  | 'missing_sign'
  | 'road_hazard'
  | 'congestion'
  | 'pedestrian_risk'
  | 'incident'
  | 'rash_driving'
  | 'wrong_way'
  | 'hit_and_run'
  | 'vehicle_violation';

export interface Bus {
  id: number;
  bus_number: string;
  route_id: number;
  route_name?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  current_latitude: number;
  current_longitude: number;
  speed: number;
  heading?: number;
  active_cameras?: number;
  edge_fps?: number;
  network_latency_ms?: number;
  passenger_load_pct?: number;
  last_ping?: string;
}

export interface Route {
  id: number;
  route_number: string;
  name: string;
  waypoints: [number, number][];
  distance_km: number;
  expected_duration_minutes: number;
  active_buses?: number;
}

export interface UrbanEvent {
  id: number;
  event_id: string;
  event_type: EventType;
  severity: SeverityLevel;
  confidence: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  bus_id: number;
  camera_id?: number;
  status: EventStatus;
  description: string;
  ai_reasoning?: string[];
  evidence_path?: string;
  is_simulated: boolean;
  extra_metadata?: Record<string, any>;
  cluster_id?: number;
  observation_count?: number;
}

export interface RoadSegment {
  id: number;
  segment_code: string;
  road_name: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  condition: 'good' | 'fair' | 'poor' | 'critical';
  condition_score: number; // 0 - 100
  defect_count: number;
  observation_count: number;
  importance: 'low' | 'normal' | 'high' | 'critical';
}

export interface Alert {
  id: number;
  alert_id: string;
  category: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  event_id?: number;
  status: 'active' | 'acknowledged' | 'assigned' | 'investigating' | 'resolved' | 'false_positive';
  created_at: string;
  event?: UrbanEvent;
}

export interface MaintenanceItem {
  id: number;
  title: string;
  description: string;
  defect_type: string;
  severity: SeverityLevel;
  priority_score: number;
  observation_count: number;
  latitude: number;
  longitude: number;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  road_segment_id?: number;
}

export interface SystemStats {
  active_buses: number;
  total_events_today: number;
  critical_alerts: number;
  road_defects_count: number;
  congestion_hotspots: number;
  pedestrian_risks_count: number;
  anpr_detections_today: number;
  avg_edge_fps: number;
  system_health_pct: number;
}
