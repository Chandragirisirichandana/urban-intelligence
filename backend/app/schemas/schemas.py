"""Urban Intelligence Platform - Pydantic Schemas for API Validation"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


# =============================================================================
# AUTH SCHEMAS
# =============================================================================

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    username: str
    full_name: Optional[str] = None


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: str
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    role: str = "viewer"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# =============================================================================
# BUS SCHEMAS
# =============================================================================

class BusResponse(BaseModel):
    id: int
    bus_number: str
    registration: Optional[str]
    route_id: Optional[int]
    status: str
    current_latitude: Optional[float]
    current_longitude: Optional[float]
    current_speed: Optional[float]
    current_heading: Optional[float]
    last_telemetry: Optional[datetime]
    is_simulated: bool
    cameras: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True


class BusTelemetry(BaseModel):
    bus_id: int
    latitude: float
    longitude: float
    speed: Optional[float] = None
    heading: Optional[float] = None
    timestamp: Optional[datetime] = None
    is_simulated: bool = False


# =============================================================================
# EVENT SCHEMAS
# =============================================================================

class EventCreate(BaseModel):
    event_type: str
    severity: str = "medium"
    confidence: float = Field(..., ge=0.0, le=1.0)
    latitude: float
    longitude: float
    bus_id: int
    camera_id: Optional[int] = None
    description: Optional[str] = None
    ai_reasoning: Optional[Dict[str, Any]] = None
    is_simulated: bool = False
    metadata: Optional[Dict[str, Any]] = None


class EventResponse(BaseModel):
    id: int
    event_id: str
    event_type: str
    severity: str
    confidence: float
    latitude: float
    longitude: float
    timestamp: datetime
    bus_id: int
    camera_id: Optional[int]
    status: str
    description: Optional[str]
    ai_reasoning: Optional[Dict[str, Any]]
    evidence_path: Optional[str]
    is_simulated: bool
    cluster_id: Optional[int]
    extra_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EventUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None


# =============================================================================
# TRAFFIC SCHEMAS
# =============================================================================

class TrafficObservationCreate(BaseModel):
    latitude: float
    longitude: float
    bus_id: int
    camera_id: Optional[int] = None
    vehicle_count: int = 0
    vehicle_breakdown: Optional[Dict[str, int]] = None
    estimated_density: Optional[float] = None
    congestion_level: Optional[str] = None
    average_speed: Optional[float] = None
    direction: Optional[str] = None
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    is_simulated: bool = False


class TrafficResponse(BaseModel):
    id: int
    vehicle_count: int
    vehicle_breakdown: Optional[Dict[str, int]]
    estimated_density: Optional[float]
    congestion_level: Optional[str]
    average_speed: Optional[float]
    timestamp: datetime
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


class CongestionHeatmapPoint(BaseModel):
    latitude: float
    longitude: float
    intensity: float  # 0.0 to 1.0


# =============================================================================
# INCIDENT SCHEMAS
# =============================================================================

class IncidentCreate(BaseModel):
    incident_type: str
    latitude: float
    longitude: float
    bus_id: int
    camera_id: Optional[int] = None
    description: Optional[str] = None
    vehicle_info: Optional[Dict[str, Any]] = None
    plate_info: Optional[Dict[str, Any]] = None
    confidence: float = Field(default=0.7, ge=0.0, le=1.0)
    ai_reasoning: Optional[Dict[str, Any]] = None
    is_simulated: bool = False


class IncidentResponse(BaseModel):
    id: int
    incident_id: str
    incident_type: str
    description: Optional[str]
    vehicle_info: Optional[Dict[str, Any]]
    plate_info: Optional[Dict[str, Any]]
    ai_reasoning: Optional[Dict[str, Any]]
    is_verified: bool
    created_at: datetime
    event: Optional[EventResponse] = None

    class Config:
        from_attributes = True


# =============================================================================
# ALERT SCHEMAS
# =============================================================================

class AlertCreate(BaseModel):
    category: str
    title: str
    description: Optional[str] = None
    event_id: Optional[int] = None


class AlertResponse(BaseModel):
    id: int
    alert_id: str
    category: str
    title: str
    description: Optional[str]
    status: str
    event_id: Optional[int]
    assigned_to: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlertUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    resolution_notes: Optional[str] = None


# =============================================================================
# ROAD SEGMENT SCHEMAS
# =============================================================================

class RoadSegmentResponse(BaseModel):
    id: int
    segment_id: str
    name: Optional[str]
    condition: str
    condition_score: float
    defect_count: int
    observation_count: int
    last_assessed: Optional[datetime]
    start_latitude: float
    start_longitude: float
    end_latitude: float
    end_longitude: float

    class Config:
        from_attributes = True


# =============================================================================
# ANALYTICS SCHEMAS
# =============================================================================

class DashboardStats(BaseModel):
    active_buses: int = 0
    total_events_today: int = 0
    critical_alerts: int = 0
    road_defects: int = 0
    traffic_congestion_zones: int = 0
    safety_incidents: int = 0
    fleet_coverage_percent: float = 0.0
    system_health: str = "healthy"


class RouteDelayResponse(BaseModel):
    route_id: int
    route_number: str
    route_name: str
    expected_duration: Optional[float]
    actual_duration: Optional[float]
    delay_minutes: Optional[float]
    congestion_contribution: Optional[float]
    timestamp: datetime

    class Config:
        from_attributes = True


# =============================================================================
# SYSTEM SCHEMAS
# =============================================================================

class SystemHealth(BaseModel):
    status: str
    database: str
    buses_online: int
    cameras_online: int
    events_last_hour: int
    api_version: str
    uptime: str
    model_versions: Optional[Dict[str, str]] = None
