"""
Urban Intelligence Platform - Bus Fleet & GPS Simulator

Simulates real-time telemetry, GPS movement, route tracking, and onboard edge computer
metrics for a fleet of public transport buses traversing Hyderabad corridors.
"""
import math
import random
import time
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class BusTelemetry:
    bus_id: str
    bus_number: str
    route_id: int
    route_name: str
    latitude: float
    longitude: float
    speed_kmh: float
    heading_deg: float
    status: str  # active, idle, maintenance
    edge_fps: float
    network_latency_ms: int
    active_cameras: int
    passenger_load_pct: int
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BusSimulator:
    """
    Simulates fleet movement along multi-point GIS route polylines.
    """

    ROUTES = [
        {
            "route_id": 1,
            "route_number": "R1",
            "name": "Secunderabad - Charminar",
            "waypoints": [
                [17.4344, 78.5013], [17.4270, 78.4990], [17.4200, 78.4950],
                [17.4100, 78.4880], [17.3950, 78.4820], [17.3850, 78.4750],
                [17.3616, 78.4747]
            ]
        },
        {
            "route_id": 2,
            "route_number": "R2",
            "name": "Miyapur - LB Nagar",
            "waypoints": [
                [17.4969, 78.3548], [17.4850, 78.3700], [17.4735, 78.3880],
                [17.4580, 78.4100], [17.4400, 78.4350], [17.4200, 78.4550],
                [17.3950, 78.4780], [17.3500, 78.5100]
            ]
        },
        {
            "route_id": 3,
            "route_number": "R3",
            "name": "Kukatpally - Dilsukhnagar",
            "waypoints": [
                [17.4948, 78.3996], [17.4850, 78.4100], [17.4700, 78.4250],
                [17.4500, 78.4400], [17.4300, 78.4550], [17.4100, 78.4700],
                [17.3800, 78.5000]
            ]
        },
        {
            "route_id": 4,
            "route_number": "R4",
            "name": "ECIL - Mehdipatnam",
            "waypoints": [
                [17.4700, 78.5500], [17.4600, 78.5300], [17.4450, 78.5100],
                [17.4350, 78.4900], [17.4200, 78.4700], [17.4050, 78.4500],
                [17.3950, 78.4420]
            ]
        },
        {
            "route_id": 5,
            "route_number": "R5",
            "name": "Uppal - Tolichowki",
            "waypoints": [
                [17.4050, 78.5590], [17.4100, 78.5350], [17.4150, 78.5100],
                [17.4200, 78.4850], [17.4180, 78.4600], [17.4100, 78.4350],
                [17.3950, 78.4180]
            ]
        }
    ]

    def __init__(self, bus_count: int = 10):
        self.buses: List[Dict[str, Any]] = []
        for i in range(bus_count):
            route = self.ROUTES[i % len(self.ROUTES)]
            bus_num = f"TS09-32{str(i+1).zfill(2)}"
            # Stagger initial position along route
            initial_progress = (i * 0.15) % 1.0
            self.buses.append({
                "bus_id": f"BUS_{i+1}",
                "bus_number": bus_num,
                "route": route,
                "progress": initial_progress,
                "speed_kmh": round(random.uniform(22.0, 48.0), 1),
                "direction": 1,  # 1 = forward, -1 = reverse
                "active_cameras": 4,
                "edge_fps": round(random.uniform(19.5, 23.8), 1),
                "network_latency": random.randint(18, 45),
                "passenger_load": random.randint(30, 85),
            })

    def step(self, delta_time_seconds: float = 2.0) -> List[BusTelemetry]:
        """
        Advances all buses along their route polylines and generates current telemetry.
        """
        telemetries = []
        now_str = datetime.now(timezone.utc).isoformat()

        for bus in self.buses:
            waypoints = bus["route"]["waypoints"]
            num_segments = len(waypoints) - 1

            # Advance progress: Speed in km/h to progress ratio
            # Approx route length ~ 20km
            progress_delta = (bus["speed_kmh"] / 20.0) * (delta_time_seconds / 3600.0)
            bus["progress"] += bus["direction"] * progress_delta

            # Reverse at route ends
            if bus["progress"] >= 1.0:
                bus["progress"] = 1.0
                bus["direction"] = -1
            elif bus["progress"] <= 0.0:
                bus["progress"] = 0.0
                bus["direction"] = 1

            # Interpolate position along waypoints
            global_pos = bus["progress"] * num_segments
            seg_idx = min(int(global_pos), num_segments - 1)
            t = global_pos - seg_idx

            p1 = waypoints[seg_idx]
            p2 = waypoints[seg_idx + 1]

            lat = p1[0] + t * (p2[0] - p1[0])
            lng = p1[1] + t * (p2[1] - p1[1])

            # Calculate heading angle
            dlat = p2[0] - p1[0]
            dlng = p2[1] - p1[1]
            if bus["direction"] < 0:
                dlat, dlng = -dlat, -dlng
            heading = (math.degrees(math.atan2(dlng, dlat)) + 360) % 360

            # Dynamic speed variation with traffic
            bus["speed_kmh"] = max(10.0, min(55.0, round(bus["speed_kmh"] + random.uniform(-2.5, 2.5), 1)))
            bus["edge_fps"] = round(random.uniform(19.2, 23.9), 1)
            bus["network_latency"] = max(15, min(80, bus["network_latency"] + random.randint(-4, 4)))

            telem = BusTelemetry(
                bus_id=bus["bus_id"],
                bus_number=bus["bus_number"],
                route_id=bus["route"]["route_id"],
                route_name=bus["route"]["name"],
                latitude=round(lat, 6),
                longitude=round(lng, 6),
                speed_kmh=bus["speed_kmh"],
                heading_deg=round(heading, 1),
                status="active",
                edge_fps=bus["edge_fps"],
                network_latency_ms=bus["network_latency"],
                active_cameras=bus["active_cameras"],
                passenger_load_pct=bus["passenger_load"],
                timestamp=now_str
            )
            telemetries.append(telem)

        return telemetries
