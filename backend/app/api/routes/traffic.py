"""
Urban Intelligence Platform - Traffic Intelligence API Routes
"""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timedelta, timezone
from app.db.session import get_db
from app.models.models import (
    Event, TrafficObservation, EventType, Severity, EventStatus, CongestionLevel
)
from app.schemas.schemas import TrafficObservationCreate, CongestionHeatmapPoint

router = APIRouter(prefix="/api/traffic", tags=["Traffic Intelligence"])


@router.post("/observation")
async def create_traffic_observation(
    data: TrafficObservationCreate,
    db: AsyncSession = Depends(get_db),
):
    """Submit a traffic observation from edge AI."""
    # Create parent event
    event = Event(
        event_id=f"TRF-{uuid.uuid4().hex[:8].upper()}",
        event_type=EventType.CONGESTION,
        severity=Severity.MEDIUM,
        confidence=data.confidence,
        latitude=data.latitude,
        longitude=data.longitude,
        bus_id=data.bus_id,
        camera_id=data.camera_id,
        description=f"Traffic observation: {data.congestion_level or 'unknown'} congestion, {data.vehicle_count} vehicles",
        is_simulated=data.is_simulated,
    )
    db.add(event)
    await db.flush()

    obs = TrafficObservation(
        event_id=event.id,
        vehicle_count=data.vehicle_count,
        vehicle_breakdown=data.vehicle_breakdown,
        estimated_density=data.estimated_density,
        congestion_level=data.congestion_level,
        average_speed=data.average_speed,
        direction=data.direction,
    )
    db.add(obs)
    await db.flush()

    return {"status": "ok", "event_id": event.event_id, "observation_id": obs.id}


@router.get("/observations")
async def get_traffic_observations(
    hours: int = Query(default=24, le=168),
    congestion_level: Optional[str] = None,
    limit: int = Query(default=200, le=500),
    db: AsyncSession = Depends(get_db),
):
    """Get recent traffic observations."""
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = (
        select(TrafficObservation, Event)
        .join(Event, TrafficObservation.event_id == Event.id)
        .where(Event.timestamp >= since)
    )

    if congestion_level:
        query = query.where(TrafficObservation.congestion_level == congestion_level)

    query = query.order_by(Event.timestamp.desc()).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "id": obs.id,
            "vehicle_count": obs.vehicle_count,
            "vehicle_breakdown": obs.vehicle_breakdown,
            "density": obs.estimated_density,
            "congestion": obs.congestion_level.value if obs.congestion_level else None,
            "avg_speed": obs.average_speed,
            "direction": obs.direction,
            "lat": evt.latitude,
            "lng": evt.longitude,
            "timestamp": evt.timestamp.isoformat() if evt.timestamp else None,
            "bus_id": evt.bus_id,
        }
        for obs, evt in rows
    ]


@router.get("/heatmap")
async def get_congestion_heatmap(
    hours: int = Query(default=24, le=168),
    db: AsyncSession = Depends(get_db),
):
    """Get congestion heatmap data points."""
    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    result = await db.execute(
        select(TrafficObservation, Event)
        .join(Event, TrafficObservation.event_id == Event.id)
        .where(Event.timestamp >= since)
    )
    rows = result.all()

    intensity_map = {
        CongestionLevel.LOW: 0.25,
        CongestionLevel.MODERATE: 0.5,
        CongestionLevel.HIGH: 0.75,
        CongestionLevel.SEVERE: 1.0,
    }

    return [
        {
            "lat": evt.latitude,
            "lng": evt.longitude,
            "intensity": intensity_map.get(obs.congestion_level, 0.5) if obs.congestion_level else 0.3,
        }
        for obs, evt in rows
    ]


@router.get("/stats")
async def get_traffic_stats(
    hours: int = Query(default=24, le=168),
    db: AsyncSession = Depends(get_db),
):
    """Get traffic statistics."""
    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    result = await db.execute(
        select(TrafficObservation, Event)
        .join(Event, TrafficObservation.event_id == Event.id)
        .where(Event.timestamp >= since)
    )
    rows = result.all()

    total_vehicles = sum(obs.vehicle_count for obs, _ in rows)

    # Aggregate vehicle breakdown
    vehicle_totals = {}
    for obs, _ in rows:
        if obs.vehicle_breakdown:
            for vtype, count in obs.vehicle_breakdown.items():
                vehicle_totals[vtype] = vehicle_totals.get(vtype, 0) + count

    # Congestion level distribution
    congestion_dist = {}
    for obs, _ in rows:
        if obs.congestion_level:
            key = obs.congestion_level.value if hasattr(obs.congestion_level, 'value') else str(obs.congestion_level)
            congestion_dist[key] = congestion_dist.get(key, 0) + 1

    avg_speed = None
    speed_obs = [obs.average_speed for obs, _ in rows if obs.average_speed is not None]
    if speed_obs:
        avg_speed = round(sum(speed_obs) / len(speed_obs), 1)

    return {
        "total_observations": len(rows),
        "total_vehicles_counted": total_vehicles,
        "vehicle_composition": vehicle_totals,
        "congestion_distribution": congestion_dist,
        "average_speed_kmh": avg_speed,
        "period_hours": hours,
    }
