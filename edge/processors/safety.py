"""










Urban Intelligence Platform - Edge Pedestrian & VRU Safety Processor

Edge processor for Vulnerable Road User (VRU) safety, pedestrian crossing risk,
school zone alerting, and collision hazard assessment.
"""
import uuid
import math
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class PedestrianSafetyAlert:
    """Represents a detected pedestrian safety hazard."""
    alert_id: str
    risk_level: str  # low, medium, high, critical
    confidence: float
    pedestrian_count: int
    is_group: bool
    is_school_zone: bool
    proximity_meters: float
    time_to_collision_sec: Optional[float]
    bbox_list: List[List[float]]
    explainability: List[str]
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SafetyProcessor:
    """
    Edge vision processor for pedestrian safety.
    Analyzes spatial positioning of pedestrians relative to vehicle trajectory.
    """

    def __init__(self, school_zones: Optional[List[Dict[str, float]]] = None):
        # Hyderabad school zone centroids [lat, lng, radius_m]
        self.school_zones = school_zones or [
            {"lat": 17.4400, "lng": 78.4980, "name": "St. Ann's Secunderabad Zone", "radius_m": 300},
            {"lat": 17.4100, "lng": 78.4680, "name": "St. George's Abids Zone", "radius_m": 250},
            {"lat": 17.4320, "lng": 78.4070, "name": "Jubilee Hills Public School Zone", "radius_m": 350},
            {"lat": 17.4500, "lng": 78.3800, "name": "Ameerpet Education Hub", "radius_m": 200},
        ]

    def evaluate_pedestrians(
        self,
        pedestrian_boxes: List[List[float]],
        bus_speed_kmh: float,
        gps_lat: float,
        gps_lng: float,
        has_zebra_crossing: bool = False
    ) -> Optional[PedestrianSafetyAlert]:
        """
        Evaluates detected pedestrians for safety hazards.
        """
        if not pedestrian_boxes:
            return None

        ped_count = len(pedestrian_boxes)
        is_group = ped_count >= 3

        # Check if current GPS is within an active school zone
        school_zone_hit = self._check_school_zone(gps_lat, gps_lng)

        # Estimate closest distance using normalized bounding box bottom (ground contact)
        # Closer pedestrians have higher ymax in front camera view
        max_ymax = max(box[2] for box in pedestrian_boxes)
        # Empirical camera projection: ymax 0.9 ≈ 3m, ymax 0.6 ≈ 15m, ymax 0.4 ≈ 30m
        proximity_meters = max(2.0, round(30.0 * (1.0 - max_ymax) ** 1.5, 1))

        # Time to collision (TTC)
        speed_mps = max(0.1, bus_speed_kmh * (1000.0 / 3600.0))
        ttc = round(proximity_meters / speed_mps, 1) if speed_mps > 1.0 else 99.0

        # Assess Risk Level
        if (ttc < 3.0 and bus_speed_kmh > 20.0) or (proximity_meters < 4.0 and bus_speed_kmh > 15.0):
            risk_level = "critical"
            confidence = 0.94
        elif (ttc < 5.0) or (is_group and proximity_meters < 10.0) or (school_zone_hit and proximity_meters < 15.0):
            risk_level = "high"
            confidence = 0.88
        elif proximity_meters < 18.0 and not has_zebra_crossing:
            risk_level = "medium"
            confidence = 0.78
        else:
            risk_level = "low"
            confidence = 0.65

        # Only alert for medium, high, critical
        if risk_level == "low":
            return None

        explainability = [
            f"Detected {ped_count} pedestrian(s) in roadway path at estimated {proximity_meters}m distance",
            f"Estimated Time-to-Collision: {ttc}s (Bus velocity: {round(bus_speed_kmh, 1)} km/h)"
        ]
        if is_group:
            explainability.append(f"Pedestrian cluster detected ({ped_count} individuals moving together)")
        if school_zone_hit:
            explainability.append(f"Active School Zone Alert: {school_zone_hit['name']} (increased vulnerability)")
        if not has_zebra_crossing:
            explainability.append("No marked pedestrian crossing detected in roadway sector (jaywalking hazard)")

        return PedestrianSafetyAlert(
            alert_id=f"safe_{uuid.uuid4().hex[:8]}",
            risk_level=risk_level,
            confidence=confidence,
            pedestrian_count=ped_count,
            is_group=is_group,
            is_school_zone=bool(school_zone_hit),
            proximity_meters=proximity_meters,
            time_to_collision_sec=ttc if ttc < 60.0 else None,
            bbox_list=pedestrian_boxes,
            explainability=explainability
        )

    def _check_school_zone(self, lat: float, lng: float) -> Optional[Dict[str, Any]]:
        """Geofencing check against registered Hyderabad school zones."""
        for sz in self.school_zones:
            # Simple equirectangular distance approximation
            dlat = (lat - sz["lat"]) * 111320.0
            dlng = (lng - sz["lng"]) * (111320.0 * math.cos(math.radians(lat)))
            dist = math.sqrt(dlat * dlat + dlng * dlng)
            if dist <= sz["radius_m"]:
                return sz
        return None
