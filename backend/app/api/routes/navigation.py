"""
Urban Intelligence Platform - Pothole-Aware Navigation API Routes

Provides route-corridor hazard filtering, route analysis with hazard summary,
alternative route comparison, and hazard status updates for the navigation
module. Reuses the existing Event / EventCluster deduplication pipeline.
"""
import uuid
from math import radians, cos, sin, asin, sqrt
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from datetime import datetime, timedelta, timezone

from app.db.session import get_db
from app.models.models import (
    Event, EventCluster, Bus, Route, EventType, Severity, EventStatus, BusStatus
)
from app.core.config import settings

router = APIRouter(prefix="/api/navigation", tags=["Pothole-Aware Navigation"])


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in meters between two GPS coordinates."""
    R = 6371000.0  # Earth radius in meters
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 2 * R * asin(sqrt(a))


# Hazard types that are navigation-relevant
NAVIGATION_HAZARD_TYPES = [
    EventType.POTHOLE, EventType.CRACK, EventType.DAMAGED_ROAD,
    EventType.WATERLOGGING, EventType.DEBRIS, EventType.ROAD_HAZARD,
]

# Types that count as accidents / incidents for navigation warnings
ACCIDENT_TYPES = [
    EventType.INCIDENT, EventType.HIT_AND_RUN, EventType.RASH_DRIVING,
    EventType.WRONG_WAY, EventType.VEHICLE_VIOLATION,
]

# Resolved / inactive statuses that should NOT trigger warnings
INACTIVE_STATUSES = {EventStatus.RESOLVED, EventStatus.FALSE_POSITIVE}


def _severity_rank(sev: str) -> int:
    """Map severity string to numeric rank for sorting."""
    mapping = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    return mapping.get(sev.lower(), 0)


def _event_to_hazard(event_row) -> dict:
    """Convert an Event model row into a hazard dict for the frontend."""
    bus_num = ""
    if event_row.bus_id:
        # We may pre-load bus via relationship; otherwise fetch lazily
        bus = getattr(event_row, "bus", None)
        if bus is not None:
            bus_num = bus.bus_number or ""

    return {
        "id": event_row.id,
        "hazard_id": event_row.event_id,
        "hazard_type": event_row.event_type.value if hasattr(event_row.event_type, "value") else str(event_row.event_type),
        "severity": event_row.severity.value if hasattr(event_row.severity, "value") else str(event_row.severity),
        "confidence": round(float(event_row.confidence), 3),
        "latitude": event_row.latitude,
        "longitude": event_row.longitude,
        "timestamp": event_row.timestamp.isoformat() if event_row.timestamp else None,
        "last_observed": event_row.updated_at.isoformat() if getattr(event_row, "updated_at", None) else (
            event_row.timestamp.isoformat() if event_row.timestamp else None
        ),
        "observation_count": 1,
        "status": "new",
        "description": event_row.description or "",
        "source_bus": event_row.bus_id,
        "source_bus_number": bus_num,
        "evidence_path": event_row.evidence_path,
        "ai_reasoning": event_row.ai_reasoning,
        "is_simulated": event_row.is_simulated,
        "cluster_id": getattr(event_row, "cluster_id", None),
    }


def _cluster_to_hazard(cluster_row) -> dict:
    """Convert an EventCluster row into a hazard dict (fused / deduplicated)."""
    return {
        "id": cluster_row.id,
        "hazard_id": cluster_row.cluster_id,
        "hazard_type": cluster_row.event_type.value if hasattr(cluster_row.event_type, "value") else str(cluster_row.event_type),
        "severity": cluster_row.severity.value if hasattr(cluster_row.severity, "value") else str(cluster_row.severity),
        "confidence": round(float(cluster_row.aggregate_confidence), 3),
        "latitude": cluster_row.center_latitude,
        "longitude": cluster_row.center_longitude,
        "timestamp": cluster_row.first_observed.isoformat() if cluster_row.first_observed else None,
        "last_observed": cluster_row.last_observed.isoformat() if cluster_row.last_observed else None,
        "observation_count": cluster_row.observation_count,
        "status": cluster_row.status.value if hasattr(cluster_row.status, "value") else str(cluster_row.status),
        "description": "",
        "source_bus": None,
        "source_buses": cluster_row.bus_ids or [],
        "source_bus_numbers": [],
        "evidence_path": None,
        "ai_reasoning": None,
        "is_simulated": True,
        "cluster_id": cluster_row.id,
    }


@router.get("/hazards", response_model=List[dict])
async def get_hazards(
    lat: Optional[float] = Query(None, description="Center latitude for bounding box filter"),
    lng: Optional[float] = Query(None, description="Center longitude for bounding box filter"),
    radius_km: float = Query(default=50.0, le=500.0),
    hazard_types: Optional[str] = Query(None, description="Comma-separated hazard types"),
    limit: int = Query(default=200, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """
    Get hazards within a radius (bounding-box optimized) of a point.
    Returns cluster-level (deduplicated) hazards.
    """
    types_filter = None
    if hazard_types:
        types_filter = [t.strip() for t in hazard_types.split(",") if t.strip()]

    # Start with EventCluster rows (spatial+temporal dedup already done)
    cluster_query = select(EventCluster)
    if types_filter:
        cluster_query = cluster_query.where(
            EventCluster.event_type.in_([
                getattr(EventType, t.upper().replace("-", "_"), None) for t in types_filter
            ])
        )
    # Filter active (not resolved/false-positive) clusters
    cluster_query = cluster_query.where(
        EventCluster.status.notin_([EventStatus.RESOLVED, EventStatus.FALSE_POSITIVE])
    )
    cluster_query = cluster_query.order_by(desc(EventCluster.last_observed)).limit(limit)

    result = await db.execute(cluster_query)
    clusters = result.scalars().all()

    hazards = []
    for c in clusters:
        # Apply bounding box filter
        if lat is not None and lng is not None:
            dist = haversine(lat, lng, c.center_latitude, c.center_longitude)
            if dist > radius_km * 1000:
                continue

        bus_ids = c.bus_ids or []
        # Look up bus numbers
        if bus_ids:
            bus_result = await db.execute(select(Bus).where(Bus.id.in_(bus_ids)))
            bus_objs = bus_result.scalars().all()
            bus_numbers = [b.bus_number for b in bus_objs]
        else:
            bus_numbers = []

        h = _cluster_to_hazard(c)
        h["source_buses"] = bus_ids
        h["source_bus_numbers"] = bus_numbers
        hazards.append(h)

    return hazards


@router.get("/hazards/near-route", response_model=List[dict])
async def get_hazards_near_route(
    route_id: Optional[int] = Query(None, description="Route ID to use as corridor"),
    waypoints: Optional[str] = Query(None, description="JSON array of [lat,lng] pairs as alternative route"),
    corridor: float = Query(default=50.0, description="Corridor half-width in meters (configurable)"),
    hazard_types: Optional[str] = Query(None, description="Comma-separated hazard types, or 'all'"),
    include_resolved: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
):
    """
    Query hazards within a configurable corridor around a route polyline.

    Concept:
      Route polyline → create route corridor → query hazards → return those
      inside the corridor (not every hazard in the city).
    """
    # Build corridor polyline
    polyline: List[List[float]] = []

    if route_id:
        result = await db.execute(select(Route).where(Route.id == route_id))
        route = result.scalar_one_or_none()
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        polyline = route.waypoints or []
    elif waypoints:
        import json as _json
        try:
            parsed = _json.loads(waypoints)
            if isinstance(parsed, list) and all(isinstance(wp, (list, tuple)) and len(wp) >= 2 for wp in parsed):
                polyline = [[float(wp[0]), float(wp[1])] for wp in parsed]
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid waypoints parameter")
    else:
        raise HTTPException(status_code=400, detail="Either route_id or waypoints must be provided")

    if not polyline or len(polyline) < 2:
        raise HTTPException(status_code=400, detail="Route must have at least 2 waypoints")

    # Determine hazard types to include
    if hazard_types and hazard_types.lower() != 'all':
        requested_types = [t.strip() for t in hazard_types.split(",") if t.strip()]
        evt_type_values = []
        for t in requested_types:
            try:
                evt_type_values.append(getattr(EventType, t.upper().replace("-", "_")))
            except AttributeError:
                pass
    else:
        evt_type_values = NAVIGATION_HAZARD_TYPES + ACCIDENT_TYPES

    # Fetch recent events of relevant types (bounding-box pre-filter for performance)
    # Compute bounding box of the route
    min_lat = min(wp[0] for wp in polyline) - (corridor / 111000.0) * 2
    max_lat = max(wp[0] for wp in polyline) + (corridor / 111000.0) * 2
    min_lng = min(wp[1] for wp in polyline) - (corridor / 111000.0) * 2
    max_lng = max(wp[1] for wp in polyline) + (corridor / 111000.0) * 2

    since = datetime.now(timezone.utc) - timedelta(hours=24)

    result = await db.execute(
        select(Event)
        .where(
            and_(
                Event.event_type.in_(evt_type_values),
                Event.latitude >= min_lat,
                Event.latitude <= max_lat,
                Event.longitude >= min_lng,
                Event.longitude <= max_lng,
                Event.timestamp >= since,
                Event.status.notin_(INACTIVE_STATUSES) if not include_resolved else True,
            )
        )
        .order_by(Event.timestamp.desc())
        .limit(500)
    )
    events = result.scalars().all()

    hazards_in_corridor = []
    for evt in events:
        if _point_to_route_distance(lat=evt.latitude, lng=evt.longitude, polyline=polyline) <= corridor:
            hazard = _event_to_hazard(evt)
            hazards_in_corridor.append(hazard)

    return hazards_in_corridor


def _point_to_route_distance(lat: float, lng: float, polyline: List[List[float]]) -> float:
    """
    Compute the minimum perpendicular distance from a point to a route polyline
    (series of connected line segments).  Returns distance in meters.
    """
    min_dist = float('inf')
    for i in range(len(polyline) - 1):
        seg_start = polyline[i]
        seg_end = polyline[i + 1]
        dist = _point_to_segment_distance(
            lat, lng,
            seg_start[0], seg_start[1],
            seg_end[0], seg_end[1],
        )
        if dist < min_dist:
            min_dist = dist
    return min_dist


def _point_to_segment_distance(
    lat: float, lng: float,
    lat1: float, lon1: float,
    lat2: float, lon2: float,
) -> float:
    """Distance from point to a single line segment using equirectangular approximation."""
    R = 6371000.0  # Earth radius in meters

    # Convert to a local equirectangular projection for fast planar math
    def to_xy(lat_val, lon_val, ref_lat):
        x = R * radians(lon_val - ref_lat) * cos(radians(ref_lat))
        y = R * radians(lat_val - ref_lat)
        return x, y

    ref_lat = (lat1 + lat2) / 2.0
    px, py = to_xy(lat, lng, ref_lat)
    x1, y1 = to_xy(lat1, lon1, ref_lat)
    x2, y2 = to_xy(lat2, lon2, ref_lat)

    dx = x2 - x1
    dy = y2 - y1
    seg_len_sq = dx * dx + dy * dy

    if seg_len_sq < 1e-10:
        # Degenerate segment: treat as point
        return haversine(lat, lng, lat1, lon1)

    # Project point onto segment
    t = ((px - x1) * dx + (py - y1) * dy) / seg_len_sq
    t = max(0.0, min(1.0, t))

    proj_x = x1 + t * dx
    proj_y = y1 + t * dy

    # Convert back distance using haversine for accuracy
    # proj_lat/ proj_lng approximation
    proj_lat = lat1 + (y2 - y1) * t * (lat2 - lat1) / max(seg_len_sq, 1e-10) * R / R
    # Simpler: just use haversine from point to the closest endpoint or projection
    # Use planar distance then convert back
    plan_dist = sqrt((px - proj_x) ** 2 + (py - proj_y) ** 2)
    return plan_dist


@router.post("/route-analysis", response_model=dict)
async def analyze_route(
    origin_lat: float = Query(...),
    origin_lng: float = Query(...),
    dest_lat: float = Query(...),
    dest_lng: float = Query(...),
    corridor: float = Query(default=50.0, description="Corridor half-width in meters"),
    db: AsyncSession = Depends(get_db),
):
    """
    Analyze a route between two points for hazards.

    If an external routing provider (OSRM / Google Maps / etc.) is configured via
    NAVIGATION_ROUTING_PROVIDER, it will be used for real routing.
    Otherwise, a straight-line corridor is used with a clear "SIMULATED" label.
    """
    from app.core.config import settings as _settings

    # Check if external routing provider is configured
    if getattr(_settings, "NAVIGATION_ROUTING_PROVIDER", None) and getattr(_settings, "NAVIGATION_ROUTING_API_KEY", None):
        route_data = await _external_route(
            origin_lat, origin_lng, dest_lat, dest_lng,
            _settings.NAVIGATION_ROUTING_PROVIDER,
            _settings.NAVIGATION_ROUTING_API_KEY,
        )
    else:
        # Fallback: straight-line corridor with demo data
        route_data = {
            "waypoints": [[origin_lat, origin_lng], [dest_lat, dest_lng]],
            "distance_km": haversine(origin_lat, origin_lng, dest_lat, dest_lng) / 1000.0,
            "eta_minutes": (haversine(origin_lat, origin_lng, dest_lat, dest_lng) / 1000.0) / 30.0 * 60,
            "source": "simulated_straight_line",
            "alternatives": [],
        }

    # Get hazards along the main route
    polyline = route_data["waypoints"]
    hazards = await _get_hazards_along_polyline(polyline, corridor, db)

    # Analyze alternatives if present
    alternatives_with_hazards = []
    for alt in route_data.get("alternatives", []):
        alt_polyline = alt.get("waypoints", [])
        alt_hazards = await _get_hazards_along_polyline(alt_polyline, corridor, db)
        alt["hazard_count"] = len(alt_hazards)
        alt["severe_hazards"] = sum(1 for h in alt_hazards if h["severity"] in ("critical", "high"))
        alternatives_with_hazards.append(alt)

    # Build summary
    severe = sum(1 for h in hazards if h["severity"] == "critical")
    moderate = sum(1 for h in hazards if h["severity"] in ("high", "medium"))
    minor = sum(1 for h in hazards if h["severity"] == "low")
    waterlogging = sum(1 for h in hazards if h["hazard_type"] == "waterlogging")
    accidents = sum(1 for h in hazards if h.get("hazard_type") in [t.value for t in ACCIDENT_TYPES])

    return {
        "route": {
            "waypoints": route_data["waypoints"],
            "distance_km": route_data["distance_km"],
            "eta_minutes": route_data["eta_minutes"],
            "source": route_data.get("source", "unknown"),
        },
        "alternatives": alternatives_with_hazards,
        "hazards": hazards,
        "summary": {
            "distance_km": route_data["distance_km"],
            "eta_minutes": route_data["eta_minutes"],
            "hazard_count": len(hazards),
            "severe_count": severe,
            "moderate_count": moderate,
            "minor_count": minor,
            "waterlogging_count": waterlogging,
            "accident_count": accidents,
        },
        "corridor_meters": corridor,
        "simulated": route_data.get("source", "") == "simulated_straight_line",
    }


async def _get_hazards_along_polyline(polyline, corridor_m, db):
    """Internal helper: get hazards within corridor of a polyline."""
    if not polyline or len(polyline) < 2:
        return []

    min_lat = min(wp[0] for wp in polyline) - (corridor_m / 111000.0) * 2
    max_lat = max(wp[0] for wp in polyline) + (corridor_m / 111000.0) * 2
    min_lng = min(wp[1] for wp in polyline) - (corridor_m / 111000.0) * 2
    max_lng = max(wp[1] for wp in polyline) + (corridor_m / 111000.0) * 2

    since = datetime.now(timezone.utc) - timedelta(hours=24)
    all_types = NAVIGATION_HAZARD_TYPES + ACCIDENT_TYPES

    result = await db.execute(
        select(Event)
        .where(
            and_(
                Event.event_type.in_(all_types),
                Event.latitude >= min_lat,
                Event.latitude <= max_lat,
                Event.longitude >= min_lng,
                Event.longitude <= max_lng,
                Event.timestamp >= since,
                Event.status.notin_(INACTIVE_STATUSES),
            )
        )
        .order_by(Event.timestamp.desc())
        .limit(500)
    )
    events = result.scalars().all()

    hazards = []
    for evt in events:
        if _point_to_route_distance(evt.latitude, evt.longitude, polyline) <= corridor_m:
            hazards.append(_event_to_hazard(evt))
    return hazards


async def _external_route(origin_lat, origin_lng, dest_lat, dest_lng, provider, api_key):
    """Call an external routing provider. Currently supports OSRM. Returns dict with waypoints, distance, eta, alternatives."""
    import json as _json
    import httpx as _httpx

    if provider == "osrm":
        url = f"http://router.project-osrm.org/route/v1/driving/{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
        params = {"overview": "full", "alternatives": "true", "geometries": "geojson"}
        async with _httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, timeout=10.0)
            data = resp.json()
            if data.get("code") == "Ok" and data.get("routes"):
                routes = data["routes"]
                main = routes[0]
                waypoints = [[c[1], c[0]] for c in main["geometry"]["coordinates"]]  # [lat, lng]
                result = {
                    "waypoints": waypoints,
                    "distance_km": main["distance"] / 1000.0,
                    "eta_minutes": main["duration"] / 60.0,
                    "source": "osrm",
                    "alternatives": [],
                }
                for alt in routes[1:]:
                    alt_coords = [[c[1], c[0]] for c in alt["geometry"]["coordinates"]]
                    result["alternatives"].append({
                        "waypoints": alt_coords,
                        "distance_km": alt["distance"] / 1000.0,
                        "eta_minutes": alt["duration"] / 60.0,
                        "source": "osrm",
                    })
                return result
            return {
                "waypoints": [[origin_lat, origin_lng], [dest_lat, dest_lng]],
                "distance_km": haversine(origin_lat, origin_lng, dest_lat, dest_lng) / 1000.0,
                "eta_minutes": (haversine(origin_lat, origin_lng, dest_lat, dest_lng) / 1000.0) / 30.0 * 60,
                "source": "simulated_fallback",
                "alternatives": [],
            }
    else:
        return {
            "waypoints": [[origin_lat, origin_lng], [dest_lat, dest_lng]],
            "distance_km": haversine(origin_lat, origin_lng, dest_lat, dest_lng) / 1000.0,
            "eta_minutes": (haversine(origin_lat, origin_lng, dest_lat, dest_lng) / 1000.0) / 30.0 * 60,
            "source": f"simulated_fallback_provider_{provider}",
            "alternatives": [],
        }


@router.get("/hazards/{hazard_id}", response_model=dict)
async def get_hazard_detail(
    hazard_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific hazard (event)."""
    result = await db.execute(select(Event).where(Event.id == hazard_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Hazard not found")

    hazard = _event_to_hazard(event)

    # Enrich with cluster data if available
    if event.cluster_id:
        cl_result = await db.execute(select(EventCluster).where(EventCluster.id == event.cluster_id))
        cluster = cl_result.scalar_one_or_none()
        if cluster:
            hazard["cluster_id"] = cluster.cluster_id
            hazard["observation_count"] = cluster.observation_count
            hazard["bus_count"] = len(cluster.bus_ids or [])
            hazard["aggregate_confidence"] = round(float(cluster.aggregate_confidence), 3)

    # Look up bus info
    bus_result = await db.execute(select(Bus).where(Bus.id == event.bus_id))
    bus = bus_result.scalar_one_or_none()
    if bus:
        hazard["source_bus_number"] = bus.bus_number
        hazard["source_bus_route"] = None
        if bus.route_id:
            rt_result = await db.execute(select(Route).where(Route.id == bus.route_id))
            rt = rt_result.scalar_one_or_none()
            if rt:
                hazard["source_bus_route"] = rt.route_number

    # Check if evidence file exists
    if event.evidence_path:
        import os
        evidence_path = os.path.join(settings.EVIDENCE_DIR, event.evidence_path) \
            if not os.path.isabs(event.evidence_path) else event.evidence_path
        hazard["evidence_available"] = os.path.exists(evidence_path)

    return hazard


@router.patch("/hazards/{hazard_id}/status", response_model=dict)
async def update_hazard_status(
    hazard_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
):
    """Update the status of a hazard (new, verified, reported, repair_in_progress, resolved)."""
    result = await db.execute(select(Event).where(Event.id == hazard_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Hazard not found")

    valid_statuses = ["new", "verified", "reported", "repair_in_progress", "resolved",
                      "detected", "confirmed", "acknowledged", "assigned", "investigating",
                      "false_positive"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    old_status = event.status.value if hasattr(event.status, 'value') else str(event.status)
    event.status = status
    await db.flush()

    return {
        "status": "updated",
        "hazard_id": event.id,
        "old_status": old_status,
        "new_status": status,
    }


@router.get("/hazards/{hazard_id}/observations", response_model=List[dict])
async def get_hazard_observations(
    hazard_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get all individual observations (events) that were fused into a hazard cluster.
    Returns evidence from multiple buses that detected the same hazard.
    """
    result = await db.execute(select(Event).where(Event.id == hazard_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Hazard not found")

    observations = []
    # Include the primary event
    primary_obs = _event_to_hazard(event)
    primary_obs["role"] = "primary"
    observations.append(primary_obs)

    # Include events from the same cluster
    if event.cluster_id:
        cluster_result = await db.execute(select(Event).where(Event.cluster_id == event.cluster_id))
        cluster_events = cluster_result.scalars().all()
        for ce in cluster_events:
            if ce.id == event.id:
                continue
            obs = _event_to_hazard(ce)
            obs["role"] = "supporting_observation"
            observations.append(obs)

    return observations


@router.get("/live-telemetry", response_model=dict)
async def get_live_telemetry(
    bus_id: Optional[int] = Query(None, description="Specific bus ID; if omitted returns all active buses"),
    db: AsyncSession = Depends(get_db),
):
    """Get current live GPS telemetry for buses (used for vehicle position tracking)."""
    query = select(Bus).where(Bus.status == BusStatus.ACTIVE)
    if bus_id:
        query = query.where(Bus.id == bus_id)

    result = await db.execute(query)
    buses = result.scalars().all()

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "buses": [
            {
                "id": b.id,
                "bus_number": b.bus_number,
                "route_id": b.route_id,
                "latitude": b.current_latitude,
                "longitude": b.current_longitude,
                "speed_kmh": b.current_speed,
                "heading": b.current_heading,
                "last_telemetry": b.last_telemetry.isoformat() if b.last_telemetry else None,
                "is_simulated": b.is_simulated,
            }
            for b in buses
        ]
    }
