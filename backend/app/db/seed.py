"""
Urban Intelligence Platform - Database Seed Data

Creates demo data for Hyderabad city including buses, routes, cameras,
road segments, events, and realistic demonstration scenarios.
"""
import random
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import (
    User, Bus, Route, Camera, RoadSegment, Event, EventCluster,
    RoadDefect, TrafficObservation, VehicleTrack, PlateDetection,
    Incident, Alert, MaintenanceItem, RouteDelay, ModelVersion,
    UserRole, BusStatus, CameraPosition, CameraStatus, EventType,
    Severity, EventStatus, CongestionLevel, VehicleClass, RoadCondition,
    AlertCategory, AlertStatus
)
from app.core.security import hash_password


def utcnow():
    return datetime.now(timezone.utc)


# =============================================================================
# HYDERABAD ROUTES & COORDINATES
# =============================================================================

HYDERABAD_ROUTES = [
    {
        "route_number": "R1",
        "name": "Secunderabad - Charminar",
        "waypoints": [
            [17.4344, 78.5013], [17.4270, 78.4990], [17.4200, 78.4950],
            [17.4100, 78.4880], [17.3950, 78.4820], [17.3850, 78.4750],
            [17.3616, 78.4747]
        ],
        "distance_km": 12.5,
        "duration": 45
    },
    {
        "route_number": "R2",
        "name": "Miyapur - LB Nagar",
        "waypoints": [
            [17.4969, 78.3548], [17.4850, 78.3700], [17.4735, 78.3880],
            [17.4580, 78.4100], [17.4400, 78.4350], [17.4200, 78.4550],
            [17.3950, 78.4780], [17.3500, 78.5100]
        ],
        "distance_km": 28.0,
        "duration": 75
    },
    {
        "route_number": "R3",
        "name": "Kukatpally - Dilsukhnagar",
        "waypoints": [
            [17.4948, 78.3996], [17.4850, 78.4100], [17.4700, 78.4250],
            [17.4500, 78.4400], [17.4300, 78.4550], [17.4100, 78.4700],
            [17.3800, 78.5000]
        ],
        "distance_km": 20.0,
        "duration": 55
    },
    {
        "route_number": "R4",
        "name": "ECIL - Mehdipatnam",
        "waypoints": [
            [17.4700, 78.5500], [17.4600, 78.5300], [17.4450, 78.5100],
            [17.4350, 78.4900], [17.4200, 78.4700], [17.4050, 78.4500],
            [17.3950, 78.4420]
        ],
        "distance_km": 22.0,
        "duration": 60
    },
    {
        "route_number": "R5",
        "name": "Uppal - Tolichowki",
        "waypoints": [
            [17.4050, 78.5590], [17.4100, 78.5350], [17.4150, 78.5100],
            [17.4200, 78.4850], [17.4180, 78.4600], [17.4100, 78.4350],
            [17.3950, 78.4180]
        ],
        "distance_km": 24.0,
        "duration": 65
    },
    {
        "route_number": "R6",
        "name": "Kompally - Shamshabad",
        "waypoints": [
            [17.5350, 78.4850], [17.5100, 78.4800], [17.4800, 78.4750],
            [17.4500, 78.4700], [17.4200, 78.4650], [17.3800, 78.4600],
            [17.3400, 78.4350], [17.2400, 78.4300]
        ],
        "distance_km": 40.0,
        "duration": 95
    },
    {
        "route_number": "R7",
        "name": "Patancheru - Hayathnagar",
        "waypoints": [
            [17.5330, 78.2640], [17.5100, 78.3000], [17.4900, 78.3400],
            [17.4700, 78.3800], [17.4500, 78.4200], [17.4300, 78.4600],
            [17.3700, 78.5200]
        ],
        "distance_km": 35.0,
        "duration": 85
    },
    {
        "route_number": "R8",
        "name": "Jubilee Hills - Old City",
        "waypoints": [
            [17.4320, 78.4070], [17.4250, 78.4200], [17.4180, 78.4350],
            [17.4100, 78.4500], [17.4000, 78.4650], [17.3850, 78.4750],
            [17.3650, 78.4780]
        ],
        "distance_km": 15.0,
        "duration": 40
    },
]

BUS_NUMBERS = [
    "TS09-3201", "TS09-3202", "TS09-3203", "TS09-3204", "TS09-3205",
    "TS09-3206", "TS09-3207", "TS09-3208", "TS09-3209", "TS09-3210",
    "TS09-3211", "TS09-3212", "TS09-3213", "TS09-3214", "TS09-3215",
]

# Known problematic locations in Hyderabad (for demo events)
PROBLEM_LOCATIONS = [
    {"lat": 17.4400, "lng": 78.4980, "desc": "Nampally Road", "issues": ["pothole", "crack"]},
    {"lat": 17.4100, "lng": 78.4680, "desc": "Mehdipatnam Junction", "issues": ["congestion", "missing_sign"]},
    {"lat": 17.3850, "lng": 78.4750, "desc": "Charminar Area", "issues": ["waterlogging", "congestion"]},
    {"lat": 17.4500, "lng": 78.3800, "desc": "Ameerpet Crossing", "issues": ["congestion", "pedestrian_risk"]},
    {"lat": 17.4350, "lng": 78.4200, "desc": "Punjagutta", "issues": ["damaged_divider", "congestion"]},
    {"lat": 17.4700, "lng": 78.5500, "desc": "ECIL X Roads", "issues": ["pothole", "damaged_road"]},
    {"lat": 17.3950, "lng": 78.4420, "desc": "Rethi Bowli", "issues": ["missing_zebra", "pedestrian_risk"]},
    {"lat": 17.4948, "lng": 78.3996, "desc": "Kukatpally", "issues": ["congestion", "debris"]},
    {"lat": 17.4050, "lng": 78.5590, "desc": "Uppal Ring Road", "issues": ["damaged_sign", "pothole"]},
    {"lat": 17.3616, "lng": 78.4747, "desc": "Falaknuma", "issues": ["waterlogging", "damaged_road"]},
    {"lat": 17.4580, "lng": 78.4100, "desc": "Begumpet", "issues": ["rash_driving", "incident"]},
    {"lat": 17.4200, "lng": 78.4550, "desc": "Lakdi Ka Pul", "issues": ["congestion", "pedestrian_risk"]},
]


async def seed_database(db: AsyncSession):
    """Seed the database with demo data."""
    # Check if already seeded
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none():
        return False  # Already seeded

    now = utcnow()

    # -------------------------------------------------------------------------
    # USERS
    # -------------------------------------------------------------------------
    users = [
        User(
            username="admin",
            email="admin@urbanintel.city",
            hashed_password=hash_password("admin123"),
            full_name="System Administrator",
            role=UserRole.ADMIN,
        ),
        User(
            username="commander",
            email="commander@urbanintel.city",
            hashed_password=hash_password("commander123"),
            full_name="Command Center Operator",
            role=UserRole.COMMAND_CENTER,
        ),
        User(
            username="transport",
            email="transport@urbanintel.city",
            hashed_password=hash_password("transport123"),
            full_name="Transport Authority Officer",
            role=UserRole.TRANSPORT_AUTHORITY,
        ),
        User(
            username="maintenance",
            email="maintenance@urbanintel.city",
            hashed_password=hash_password("maintenance123"),
            full_name="Road Maintenance Engineer",
            role=UserRole.ROAD_MAINTENANCE,
        ),
        User(
            username="analyst",
            email="analyst@urbanintel.city",
            hashed_password=hash_password("analyst123"),
            full_name="Data Analyst",
            role=UserRole.ANALYST,
        ),
        User(
            username="viewer",
            email="viewer@urbanintel.city",
            hashed_password=hash_password("viewer123"),
            full_name="Public Viewer",
            role=UserRole.VIEWER,
        ),
    ]
    db.add_all(users)
    await db.flush()

    # -------------------------------------------------------------------------
    # ROUTES
    # -------------------------------------------------------------------------
    routes = []
    for r in HYDERABAD_ROUTES:
        route = Route(
            route_number=r["route_number"],
            name=r["name"],
            waypoints=r["waypoints"],
            expected_duration_minutes=r["duration"],
            distance_km=r["distance_km"],
        )
        routes.append(route)
    db.add_all(routes)
    await db.flush()

    # -------------------------------------------------------------------------
    # BUSES
    # -------------------------------------------------------------------------
    buses = []
    for i, bus_num in enumerate(BUS_NUMBERS):
        route = routes[i % len(routes)]
        wp = route.waypoints[0] if route.waypoints else [17.3850, 78.4867]
        bus = Bus(
            bus_number=bus_num,
            registration=f"TS09EA{3201 + i}",
            route_id=route.id,
            status=BusStatus.ACTIVE if i < 10 else BusStatus.INACTIVE,
            current_latitude=wp[0] + random.uniform(-0.005, 0.005),
            current_longitude=wp[1] + random.uniform(-0.005, 0.005),
            current_speed=random.uniform(15, 40),
            current_heading=random.uniform(0, 360),
            last_telemetry=now - timedelta(seconds=random.randint(0, 60)),
            is_simulated=True,
        )
        buses.append(bus)
    db.add_all(buses)
    await db.flush()

    # -------------------------------------------------------------------------
    # CAMERAS (5 per active bus)
    # -------------------------------------------------------------------------
    cameras = []
    positions = list(CameraPosition)
    for bus in buses:
        if bus.status == BusStatus.ACTIVE:
            for pos in positions:
                cam = Camera(
                    camera_id=f"{bus.bus_number}-{pos.value}",
                    bus_id=bus.id,
                    position=pos,
                    status=CameraStatus.ONLINE,
                    resolution="1920x1080",
                    fps=30,
                    last_frame_at=now,
                    inference_fps=random.uniform(12, 25),
                )
                cameras.append(cam)
    db.add_all(cameras)
    await db.flush()

    # -------------------------------------------------------------------------
    # ROAD SEGMENTS
    # -------------------------------------------------------------------------
    road_segments = []
    segment_names = [
        "Nampally Main Road", "Mehdipatnam-Tolichowki Road", "Charminar Bazaar Road",
        "Ameerpet-SR Nagar Road", "Punjagutta-Somajiguda Road", "ECIL Main Road",
        "Rethi Bowli Road", "Kukatpally Housing Board Road", "Uppal Ring Road",
        "Falaknuma-Chandrayangutta Road", "Begumpet Flyover Road", "Lakdi Ka Pul Road",
        "Jubilee Hills Road No. 36", "Banjara Hills Road No. 12", "Madhapur IT Corridor",
        "HITEC City Main Road", "Gachibowli-Nanakramguda Road", "Kondapur Main Road",
    ]
    conditions = [RoadCondition.GOOD, RoadCondition.FAIR, RoadCondition.POOR, RoadCondition.CRITICAL]
    for i, name in enumerate(segment_names):
        base_lat = 17.35 + random.uniform(0, 0.20)
        base_lng = 78.35 + random.uniform(0, 0.25)
        cond = random.choice(conditions)
        score_map = {RoadCondition.GOOD: 85, RoadCondition.FAIR: 65, RoadCondition.POOR: 40, RoadCondition.CRITICAL: 15}
        seg = RoadSegment(
            segment_id=f"SEG-{i+1:03d}",
            name=name,
            start_latitude=base_lat,
            start_longitude=base_lng,
            end_latitude=base_lat + random.uniform(0.005, 0.02),
            end_longitude=base_lng + random.uniform(0.005, 0.02),
            condition=cond,
            condition_score=score_map[cond] + random.uniform(-10, 10),
            observation_count=random.randint(5, 100),
            defect_count=random.randint(0, 20) if cond in [RoadCondition.POOR, RoadCondition.CRITICAL] else random.randint(0, 3),
            last_assessed=now - timedelta(hours=random.randint(1, 72)),
        )
        road_segments.append(seg)
    db.add_all(road_segments)
    await db.flush()

    # -------------------------------------------------------------------------
    # DEMO EVENTS (spread over last 24 hours)
    # -------------------------------------------------------------------------
    event_configs = [
        (EventType.POTHOLE, Severity.HIGH, "Pothole detected on road surface"),
        (EventType.POTHOLE, Severity.MEDIUM, "Small pothole detected"),
        (EventType.CRACK, Severity.LOW, "Longitudinal crack on road"),
        (EventType.DAMAGED_ROAD, Severity.HIGH, "Significant road damage observed"),
        (EventType.WATERLOGGING, Severity.CRITICAL, "Major waterlogging on road"),
        (EventType.WATERLOGGING, Severity.MEDIUM, "Moderate water accumulation"),
        (EventType.DEBRIS, Severity.MEDIUM, "Debris on road surface"),
        (EventType.DAMAGED_DIVIDER, Severity.HIGH, "Road divider damaged"),
        (EventType.MISSING_DIVIDER, Severity.MEDIUM, "Road divider missing in segment"),
        (EventType.DAMAGED_ZEBRA, Severity.LOW, "Zebra crossing markings faded"),
        (EventType.MISSING_ZEBRA, Severity.MEDIUM, "No zebra crossing at intersection"),
        (EventType.DAMAGED_SIGN, Severity.MEDIUM, "Traffic sign damaged/unreadable"),
        (EventType.MISSING_SIGN, Severity.HIGH, "Speed limit sign missing"),
        (EventType.ROAD_HAZARD, Severity.HIGH, "Road hazard detected"),
        (EventType.CONGESTION, Severity.HIGH, "Heavy traffic congestion"),
        (EventType.CONGESTION, Severity.MEDIUM, "Moderate congestion"),
        (EventType.CONGESTION, Severity.CRITICAL, "Severe gridlock"),
        (EventType.PEDESTRIAN_RISK, Severity.CRITICAL, "Pedestrians crossing in heavy traffic"),
        (EventType.PEDESTRIAN_RISK, Severity.HIGH, "Group of pedestrians near moving traffic"),
        (EventType.INCIDENT, Severity.CRITICAL, "Possible hit-and-run detected"),
        (EventType.RASH_DRIVING, Severity.HIGH, "Rash driving behaviour detected"),
    ]

    events_created = []
    active_buses = [b for b in buses if b.status == BusStatus.ACTIVE]

    for i in range(60):  # 60 demo events
        cfg = random.choice(event_configs)
        bus = random.choice(active_buses)
        loc = random.choice(PROBLEM_LOCATIONS)

        evt_time = now - timedelta(
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )

        confidence = round(random.uniform(0.55, 0.98), 2)

        ai_reasons = [
            f"{cfg[0].value} detected with {confidence*100:.0f}% confidence",
            f"Observed by bus {bus.bus_number}",
        ]
        if random.random() > 0.5:
            ai_reasons.append("Location previously associated with similar reports")
        if random.random() > 0.7:
            ai_reasons.append("Repeated observation from multiple buses")

        event = Event(
            event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            event_type=cfg[0],
            severity=cfg[1],
            confidence=confidence,
            latitude=loc["lat"] + random.uniform(-0.002, 0.002),
            longitude=loc["lng"] + random.uniform(-0.002, 0.002),
            timestamp=evt_time,
            bus_id=bus.id,
            camera_id=random.choice([c.id for c in cameras if c.bus_id == bus.id]) if cameras else None,
            status=random.choice([EventStatus.DETECTED, EventStatus.CONFIRMED, EventStatus.ACKNOWLEDGED]),
            description=cfg[2],
            ai_reasoning={"risk": cfg[1].value.upper(), "reasons": ai_reasons},
            is_simulated=True,
        )
        events_created.append(event)

    db.add_all(events_created)
    await db.flush()

    # -------------------------------------------------------------------------
    # TRAFFIC OBSERVATIONS
    # -------------------------------------------------------------------------
    traffic_obs = []
    congestion_levels = list(CongestionLevel)
    vehicle_classes = list(VehicleClass)

    for i in range(40):
        bus = random.choice(active_buses)
        loc = random.choice(PROBLEM_LOCATIONS)
        cong = random.choice(congestion_levels)

        # Create parent event
        t_event = Event(
            event_id=f"TRF-{uuid.uuid4().hex[:8].upper()}",
            event_type=EventType.CONGESTION,
            severity=Severity.MEDIUM if cong in [CongestionLevel.LOW, CongestionLevel.MODERATE] else Severity.HIGH,
            confidence=round(random.uniform(0.7, 0.95), 2),
            latitude=loc["lat"] + random.uniform(-0.003, 0.003),
            longitude=loc["lng"] + random.uniform(-0.003, 0.003),
            timestamp=now - timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59)),
            bus_id=bus.id,
            status=EventStatus.DETECTED,
            description=f"Traffic observation: {cong.value} congestion",
            is_simulated=True,
        )
        db.add(t_event)
        await db.flush()

        breakdown = {}
        total = 0
        for vc in vehicle_classes:
            count = random.randint(0, 30) if vc in [VehicleClass.CAR, VehicleClass.MOTORCYCLE] else random.randint(0, 10)
            if count > 0:
                breakdown[vc.value] = count
                total += count

        obs = TrafficObservation(
            event_id=t_event.id,
            vehicle_count=total,
            vehicle_breakdown=breakdown,
            estimated_density=round(random.uniform(0.2, 1.0), 2),
            congestion_level=cong,
            average_speed=round(random.uniform(5, 45), 1),
            direction=random.choice(["north", "south", "east", "west"]),
        )
        traffic_obs.append(obs)

    db.add_all(traffic_obs)
    await db.flush()

    # -------------------------------------------------------------------------
    # ALERTS
    # -------------------------------------------------------------------------
    alert_configs = [
        (AlertCategory.CRITICAL, "Possible Hit-and-Run Detected", "Vehicle fled scene after collision near Begumpet"),
        (AlertCategory.CRITICAL, "Severe Waterlogging", "Major waterlogging blocking road near Charminar"),
        (AlertCategory.CRITICAL, "Pedestrians in Danger", "Group of pedestrians crossing in heavy traffic at Rethi Bowli"),
        (AlertCategory.HIGH, "Large Pothole on Main Road", "Deep pothole detected on Nampally Main Road"),
        (AlertCategory.HIGH, "Rash Driving Detected", "Vehicle exhibiting dangerous driving behaviour near Ameerpet"),
        (AlertCategory.HIGH, "Road Divider Damaged", "Damaged road divider on ECIL Main Road"),
        (AlertCategory.MEDIUM, "Moderate Congestion", "Traffic building up at Lakdi Ka Pul junction"),
        (AlertCategory.MEDIUM, "Missing Traffic Sign", "Speed limit sign missing near Kukatpally"),
        (AlertCategory.LOW, "Minor Road Crack", "Small crack detected on Jubilee Hills Road"),
        (AlertCategory.LOW, "Faded Zebra Crossing", "Zebra crossing markings faded at Madhapur junction"),
    ]

    alerts = []
    for i, (cat, title, desc) in enumerate(alert_configs):
        evt = events_created[i % len(events_created)]
        alert = Alert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
            category=cat,
            title=title,
            description=desc,
            event_id=evt.id,
            status=random.choice([AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED]),
            created_at=now - timedelta(hours=random.randint(0, 12)),
        )
        alerts.append(alert)
    db.add_all(alerts)

    # -------------------------------------------------------------------------
    # MODEL VERSIONS
    # -------------------------------------------------------------------------
    models = [
        ModelVersion(
            model_name="vehicle_detector",
            version="1.0.0",
            model_type="YOLOv8n",
            dataset_info={"source": "COCO + custom", "classes": 8, "train_images": 15000},
            metrics={"mAP50": 0.72, "precision": 0.78, "recall": 0.69},
            is_active=True,
        ),
        ModelVersion(
            model_name="road_defect_detector",
            version="1.0.0",
            model_type="YOLOv8s",
            dataset_info={"source": "RDD2022 + custom", "classes": 6, "train_images": 8000},
            metrics={"mAP50": 0.65, "precision": 0.71, "recall": 0.61},
            is_active=True,
        ),
        ModelVersion(
            model_name="plate_detector",
            version="1.0.0",
            model_type="YOLOv8n + PaddleOCR",
            dataset_info={"source": "Indian plates dataset", "classes": 1, "train_images": 5000},
            metrics={"plate_detection_mAP50": 0.80, "ocr_accuracy": 0.68},
            is_active=True,
        ),
    ]
    db.add_all(models)

    # -------------------------------------------------------------------------
    # ROUTE DELAYS
    # -------------------------------------------------------------------------
    for route in routes:
        delay = RouteDelay(
            route_id=route.id,
            bus_id=random.choice(active_buses).id,
            expected_duration_minutes=route.expected_duration_minutes,
            actual_duration_minutes=route.expected_duration_minutes + random.uniform(-5, 25),
            delay_minutes=random.uniform(0, 25),
            congestion_contribution=round(random.uniform(0, 0.8), 2),
            timestamp=now - timedelta(hours=random.randint(0, 6)),
        )
        db.add(delay)

    # -------------------------------------------------------------------------
    # MAINTENANCE ITEMS
    # -------------------------------------------------------------------------
    maint_items = [
        MaintenanceItem(
            title="Fill pothole on Nampally Main Road",
            description="Large pothole detected by 3 buses. Immediate repair needed.",
            road_segment_id=road_segments[0].id if road_segments else None,
            defect_type="pothole",
            severity=Severity.HIGH,
            priority_score=85.0,
            observation_count=3,
            latitude=17.4400,
            longitude=78.4980,
            status="pending",
        ),
        MaintenanceItem(
            title="Repair road divider at ECIL X Roads",
            description="Damaged divider creating safety hazard.",
            road_segment_id=road_segments[5].id if len(road_segments) > 5 else None,
            defect_type="damaged_divider",
            severity=Severity.HIGH,
            priority_score=78.0,
            observation_count=5,
            latitude=17.4700,
            longitude=78.5500,
            status="pending",
        ),
        MaintenanceItem(
            title="Install zebra crossing at Rethi Bowli",
            description="No zebra crossing at busy pedestrian intersection.",
            defect_type="missing_zebra",
            severity=Severity.MEDIUM,
            priority_score=65.0,
            observation_count=8,
            latitude=17.3950,
            longitude=78.4420,
            status="scheduled",
        ),
        MaintenanceItem(
            title="Address waterlogging near Charminar",
            description="Recurring waterlogging during rain events.",
            defect_type="waterlogging",
            severity=Severity.CRITICAL,
            priority_score=92.0,
            observation_count=12,
            latitude=17.3616,
            longitude=78.4747,
            status="pending",
        ),
    ]
    db.add_all(maint_items)

    await db.commit()
    return True
