"""
Urban Intelligence Platform - SQLAlchemy Models

Complete database schema for the urban intelligence platform.
Designed for PostgreSQL/PostGIS compatibility but works with SQLite for development.
"""
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey,
    JSON, Enum as SQLEnum, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum


# =============================================================================
# ENUMS
# =============================================================================

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    COMMAND_CENTER = "command_center"
    TRANSPORT_AUTHORITY = "transport_authority"
    ROAD_MAINTENANCE = "road_maintenance"
    ANALYST = "analyst"
    VIEWER = "viewer"


class BusStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"


class CameraPosition(str, enum.Enum):
    FRONT = "front"
    REAR = "rear"
    LEFT = "left"
    RIGHT = "right"
    INTERIOR = "interior"


class CameraStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"


class EventType(str, enum.Enum):
    POTHOLE = "pothole"
    CRACK = "crack"
    DAMAGED_ROAD = "damaged_road"
    WATERLOGGING = "waterlogging"
    DEBRIS = "debris"
    DAMAGED_DIVIDER = "damaged_divider"
    MISSING_DIVIDER = "missing_divider"
    DAMAGED_ZEBRA = "damaged_zebra"
    MISSING_ZEBRA = "missing_zebra"
    DAMAGED_SIGN = "damaged_sign"
    MISSING_SIGN = "missing_sign"
    ROAD_HAZARD = "road_hazard"
    CONGESTION = "congestion"
    PEDESTRIAN_RISK = "pedestrian_risk"
    INCIDENT = "incident"
    RASH_DRIVING = "rash_driving"
    WRONG_WAY = "wrong_way"
    HIT_AND_RUN = "hit_and_run"
    VEHICLE_VIOLATION = "vehicle_violation"


class Severity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EventStatus(str, enum.Enum):
    DETECTED = "detected"
    CONFIRMED = "confirmed"
    ACKNOWLEDGED = "acknowledged"
    ASSIGNED = "assigned"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class CongestionLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    SEVERE = "severe"


class VehicleClass(str, enum.Enum):
    CAR = "car"
    BUS = "bus"
    TRUCK = "truck"
    MOTORCYCLE = "motorcycle"
    AUTO_RICKSHAW = "auto_rickshaw"
    BICYCLE = "bicycle"
    EMERGENCY = "emergency"
    OTHER = "other"


class RoadCondition(str, enum.Enum):
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"


class AlertCategory(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AlertStatus(str, enum.Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    ASSIGNED = "assigned"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


# =============================================================================
# HELPER
# =============================================================================

def utcnow():
    return datetime.now(timezone.utc)


# =============================================================================
# MODELS
# =============================================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="user")
    assigned_alerts = relationship("Alert", back_populates="assigned_to_user", foreign_keys="Alert.assigned_to")


class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String(50), unique=True, nullable=False, index=True)
    registration = Column(String(50))
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    status = Column(SQLEnum(BusStatus), default=BusStatus.INACTIVE)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    current_speed = Column(Float, nullable=True)
    current_heading = Column(Float, nullable=True)
    last_telemetry = Column(DateTime, nullable=True)
    edge_version = Column(String(50), nullable=True)
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    route = relationship("Route", back_populates="buses")
    cameras = relationship("Camera", back_populates="bus")
    events = relationship("Event", back_populates="bus")
    gps_points = relationship("GPSPoint", back_populates="bus")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_number = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    # Store route waypoints as JSON array of [lat, lng] pairs
    waypoints = Column(JSON, nullable=True)
    expected_duration_minutes = Column(Integer, nullable=True)
    distance_km = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    buses = relationship("Bus", back_populates="route")
    route_delays = relationship("RouteDelay", back_populates="route")


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String(100), unique=True, nullable=False, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    position = Column(SQLEnum(CameraPosition), nullable=False)
    status = Column(SQLEnum(CameraStatus), default=CameraStatus.OFFLINE)
    resolution = Column(String(20), nullable=True)  # e.g., "1920x1080"
    fps = Column(Integer, nullable=True)
    last_frame_at = Column(DateTime, nullable=True)
    inference_fps = Column(Float, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    bus = relationship("Bus", back_populates="cameras")
    events = relationship("Event", back_populates="camera")


class GPSPoint(Base):
    __tablename__ = "gps_points"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude = Column(Float, nullable=True)
    speed = Column(Float, nullable=True)
    heading = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=utcnow, index=True)
    is_simulated = Column(Boolean, default=False)

    # Relationships
    bus = relationship("Bus", back_populates="gps_points")

    __table_args__ = (
        Index("idx_gps_bus_time", "bus_id", "timestamp"),
    )


class Event(Base):
    """Core event table - every detection generates an event."""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(100), unique=True, nullable=False, index=True)
    event_type = Column(SQLEnum(EventType), nullable=False, index=True)
    severity = Column(SQLEnum(Severity), default=Severity.MEDIUM)
    confidence = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=utcnow, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=True)
    status = Column(SQLEnum(EventStatus), default=EventStatus.DETECTED)
    description = Column(Text, nullable=True)
    ai_reasoning = Column(JSON, nullable=True)  # Explainability data
    evidence_path = Column(String(500), nullable=True)
    evidence_clip_path = Column(String(500), nullable=True)
    is_simulated = Column(Boolean, default=False)
    cluster_id = Column(Integer, ForeignKey("event_clusters.id"), nullable=True)
    extra_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    bus = relationship("Bus", back_populates="events")
    camera = relationship("Camera", back_populates="events")
    cluster = relationship("EventCluster", back_populates="events")
    road_defect = relationship("RoadDefect", back_populates="event", uselist=False)
    traffic_observation = relationship("TrafficObservation", back_populates="event", uselist=False)
    incident = relationship("Incident", back_populates="event", uselist=False)
    alerts = relationship("Alert", back_populates="event")

    __table_args__ = (
        Index("idx_event_type_time", "event_type", "timestamp"),
        Index("idx_event_location", "latitude", "longitude"),
    )


class EventCluster(Base):
    """Spatial+temporal deduplication clusters for repeated observations."""
    __tablename__ = "event_clusters"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(String(100), unique=True, nullable=False)
    event_type = Column(SQLEnum(EventType), nullable=False)
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    observation_count = Column(Integer, default=1)
    first_observed = Column(DateTime, default=utcnow)
    last_observed = Column(DateTime, default=utcnow)
    aggregate_confidence = Column(Float, nullable=False)
    severity = Column(SQLEnum(Severity), default=Severity.MEDIUM)
    status = Column(SQLEnum(EventStatus), default=EventStatus.DETECTED)
    bus_ids = Column(JSON, nullable=True)  # List of bus IDs that observed this
    extra_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    events = relationship("Event", back_populates="cluster")


class RoadDefect(Base):
    __tablename__ = "road_defects"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, unique=True)
    defect_type = Column(String(100), nullable=False)
    estimated_area = Column(String(50), nullable=True)  # e.g., "small", "medium", "large"
    road_segment_id = Column(Integer, ForeignKey("road_segments.id"), nullable=True)
    repair_priority = Column(Integer, nullable=True)

    # Relationships
    event = relationship("Event", back_populates="road_defect")
    road_segment = relationship("RoadSegment", back_populates="defects")


class TrafficObservation(Base):
    __tablename__ = "traffic_observations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, unique=True)
    vehicle_count = Column(Integer, default=0)
    vehicle_breakdown = Column(JSON, nullable=True)  # {car: 10, bus: 2, ...}
    estimated_density = Column(Float, nullable=True)
    congestion_level = Column(SQLEnum(CongestionLevel), nullable=True)
    average_speed = Column(Float, nullable=True)
    direction = Column(String(50), nullable=True)
    road_segment_id = Column(Integer, ForeignKey("road_segments.id"), nullable=True)

    # Relationships
    event = relationship("Event", back_populates="traffic_observation")
    road_segment = relationship("RoadSegment", back_populates="traffic_observations")


class VehicleTrack(Base):
    __tablename__ = "vehicle_tracks"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(String(100), unique=True, nullable=False, index=True)
    vehicle_type = Column(SQLEnum(VehicleClass), nullable=True)
    first_seen = Column(DateTime, nullable=False)
    last_seen = Column(DateTime, nullable=False)
    trajectory = Column(JSON, nullable=True)  # Array of {lat, lng, time} points
    incident_type = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=True)
    extra_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    plate_detection = relationship("PlateDetection", back_populates="vehicle_track", uselist=False)


class PlateDetection(Base):
    __tablename__ = "plate_detections"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_track_id = Column(Integer, ForeignKey("vehicle_tracks.id"), nullable=True)
    plate_number = Column(String(50), nullable=True)  # NULL if unreadable
    plate_detection_confidence = Column(Float, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    overall_confidence = Column(Float, nullable=True)
    plate_image_path = Column(String(500), nullable=True)
    enhanced_image_path = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=utcnow)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    incident_type = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    vehicle_track = relationship("VehicleTrack", back_populates="plate_detection")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(100), unique=True, nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, unique=True)
    incident_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    vehicle_info = Column(JSON, nullable=True)
    plate_info = Column(JSON, nullable=True)
    evidence_paths = Column(JSON, nullable=True)
    ai_reasoning = Column(JSON, nullable=True)
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    report_generated = Column(Boolean, default=False)
    report_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    event = relationship("Event", back_populates="incident")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(SQLEnum(AlertCategory), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    status = Column(SQLEnum(AlertStatus), default=AlertStatus.ACTIVE)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    event = relationship("Event", back_populates="alerts")
    assigned_to_user = relationship("User", back_populates="assigned_alerts", foreign_keys=[assigned_to])


class RoadSegment(Base):
    __tablename__ = "road_segments"

    id = Column(Integer, primary_key=True, index=True)
    segment_id = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=True)
    start_latitude = Column(Float, nullable=False)
    start_longitude = Column(Float, nullable=False)
    end_latitude = Column(Float, nullable=False)
    end_longitude = Column(Float, nullable=False)
    condition = Column(SQLEnum(RoadCondition), default=RoadCondition.GOOD)
    condition_score = Column(Float, default=100.0)  # 0-100 scale
    last_assessed = Column(DateTime, nullable=True)
    observation_count = Column(Integer, default=0)
    defect_count = Column(Integer, default=0)
    importance = Column(String(50), default="normal")  # low, normal, high, critical
    extra_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    defects = relationship("RoadDefect", back_populates="road_segment")
    traffic_observations = relationship("TrafficObservation", back_populates="road_segment")
    maintenance_items = relationship("MaintenanceItem", back_populates="road_segment")


class MaintenanceItem(Base):
    __tablename__ = "maintenance_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    road_segment_id = Column(Integer, ForeignKey("road_segments.id"), nullable=True)
    defect_type = Column(String(100), nullable=True)
    severity = Column(SQLEnum(Severity), default=Severity.MEDIUM)
    priority_score = Column(Float, default=0.0)
    observation_count = Column(Integer, default=1)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(50), default="pending")  # pending, scheduled, in_progress, completed
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    scheduled_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    road_segment = relationship("RoadSegment", back_populates="maintenance_items")


class RouteDelay(Base):
    __tablename__ = "route_delays"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=True)
    expected_duration_minutes = Column(Float, nullable=True)
    actual_duration_minutes = Column(Float, nullable=True)
    delay_minutes = Column(Float, nullable=True)
    congestion_contribution = Column(Float, nullable=True)
    segment_delays = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=utcnow, index=True)

    # Relationships
    route = relationship("Route", back_populates="route_delays")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    model_type = Column(String(100), nullable=True)
    dataset_info = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)
    config = Column(JSON, nullable=True)
    file_path = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=False)
    deployed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    __table_args__ = (
        UniqueConstraint("model_name", "version", name="uq_model_version"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
