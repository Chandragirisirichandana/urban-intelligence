"""
Urban Intelligence Platform - Demonstration Event Generator

Generates high-fidelity demonstration events matching the Smart India Hackathon
judging workflow, strictly flagged with is_simulated=True.
"""
import uuid
import random
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


class DemoEventGenerator:
    """
    Generates sequenced SIH demonstration events with complete AI explainability.
    """

    DEMO_SCENARIOS = [
        {
            "name": "Nampally Deep Pothole Sighting",
            "bus_id": 12,
            "camera_id": 45,  # Front camera
            "event_type": "pothole",
            "severity": "high",
            "confidence": 0.92,
            "latitude": 17.4400,
            "longitude": 78.4980,
            "description": "Deep asphalt crater (approx 0.8m diameter) detected in central lane",
            "ai_reasoning": [
                "Identified Pothole with 92% model confidence via Edge YOLOv8s",
                "High-contrast depression contour with depth shadow profile",
                "Estimated road disruption footprint: 0.72 m²",
                "Severity escalated to HIGH due to lane obstruction on transit arterial"
            ],
            "extra_metadata": {"defect_type": "pothole", "estimated_area": "medium", "bus_num": "TS09-3212"}
        },
        {
            "name": "Nampally Pothole Sighting (Second Bus Verification)",
            "bus_id": 7,
            "camera_id": 25,
            "event_type": "pothole",
            "severity": "high",
            "confidence": 0.94,
            "latitude": 17.4402,
            "longitude": 78.4981,
            "description": "Corroborating sighting: Pothole re-identified at Nampally Main Road",
            "ai_reasoning": [
                "Spatial deduplicator matched existing cluster within 25m radius",
                "Bayesian observation confidence updated from 92% to 94%",
                "Observation count increased to 2 distinct fleet buses",
                "Surface deterioration tracking flag activated"
            ],
            "extra_metadata": {"defect_type": "pothole", "estimated_area": "medium", "bus_num": "TS09-3207"}
        },
        {
            "name": "Mehdipatnam Arterial Congestion",
            "bus_id": 7,
            "camera_id": 25,
            "event_type": "congestion",
            "severity": "high",
            "confidence": 0.89,
            "latitude": 17.4100,
            "longitude": 78.4680,
            "description": "Heavy traffic bottleneck detected at Mehdipatnam Junction",
            "ai_reasoning": [
                "Detected 16 vehicles in front camera FOV: 7 autos, 5 cars, 4 motorcycles",
                "Average corridor velocity: 8.4 km/h against 45 km/h route design speed",
                "Road occupancy density: 88%",
                "Persistent queue exceeding 120 seconds in bus transit priority lane"
            ],
            "extra_metadata": {"vehicle_count": 16, "congestion_level": "high", "avg_speed": 8.4}
        },
        {
            "name": "Charminar Monsoon Waterlogging",
            "bus_id": 8,
            "camera_id": 29,
            "event_type": "waterlogging",
            "severity": "critical",
            "confidence": 0.95,
            "latitude": 17.3850,
            "longitude": 78.4750,
            "description": "Severe road water accumulation exceeding 15cm covering bus lane",
            "ai_reasoning": [
                "Reflective water plane specular highlights detected over 40% of road surface",
                "Submersion indicator: Vehicle tire spray and ground contact obscuration",
                "Estimated standing water zone: 45m continuous corridor",
                "Critical safety alert generated for municipal drainage dispatch"
            ],
            "extra_metadata": {"defect_type": "waterlogging", "severity": "critical"}
        },
        {
            "name": "Ameerpet School Zone Pedestrian Hazard",
            "bus_id": 4,
            "camera_id": 13,
            "event_type": "pedestrian_risk",
            "severity": "high",
            "confidence": 0.91,
            "latitude": 17.4500,
            "longitude": 78.3800,
            "description": "Pedestrian group crossing roadway without zebra crossing near transit lane",
            "ai_reasoning": [
                "Detected cluster of 4 pedestrians in roadway plane at 7.5m forward proximity",
                "Estimated Time-to-Collision: 2.1s (Bus traveling at 22 km/h)",
                "Active School Zone Geofence hit: Ameerpet Education Hub (200m radius)",
                "Absence of marked zebra crossing or pedestrian signal"
            ],
            "extra_metadata": {"pedestrian_count": 4, "proximity_m": 7.5, "school_zone": True}
        },
        {
            "name": "Begumpet Rash Driving & Hit-and-Run Incident",
            "bus_id": 11,
            "camera_id": 41,
            "event_type": "hit_and_run",
            "severity": "critical",
            "confidence": 0.93,
            "latitude": 17.4580,
            "longitude": 78.4100,
            "description": "Vehicle collision with road divider followed by immediate rapid exit",
            "ai_reasoning": [
                "Vehicle #1084 (White Sedan) lateral impact detected with central road divider",
                "Sudden acceleration post-impact: 18 km/h -> 62 km/h within 3 seconds",
                "Erratic swerving across 3 lanes fleeing scene of incident",
                "Automatic ANPR trigger dispatched to capture high-res plate crop"
            ],
            "extra_metadata": {
                "vehicle_type": "car",
                "speed_kmh": 62.4,
                "incident_type": "hit_and_run",
                "anpr_triggered": True
            }
        },
        {
            "name": "Begumpet Incident Vehicle Plate Recognition",
            "bus_id": 11,
            "camera_id": 41,
            "event_type": "vehicle_violation",
            "severity": "critical",
            "confidence": 0.91,
            "latitude": 17.4582,
            "longitude": 78.4102,
            "description": "ANPR successfully localized and extracted number plate: TS09AB1234",
            "ai_reasoning": [
                "Number plate localized with 93% visual confidence",
                "OCR character recognition score: 89%",
                "Syntax validation: PASS (Valid Telangana State Transport Authority format)",
                "Combined ANPR confidence: 91%",
                "Evidence frame securely tagged with GPS and timestamp for police dispatch"
            ],
            "extra_metadata": {
                "plate_number": "TS09AB1234",
                "ocr_confidence": 0.89,
                "syntax_valid": True,
                "vehicle_type": "car"
            }
        }
    ]

    @classmethod
    def get_scenario(cls, index: int) -> Dict[str, Any]:
        """Fetch scenario by index (loops if out of bounds)."""
        idx = index % len(cls.DEMO_SCENARIOS)
        data = dict(cls.DEMO_SCENARIOS[idx])
        data["event_id"] = f"demo_evt_{uuid.uuid4().hex[:8]}"
        data["timestamp"] = datetime.now(timezone.utc).isoformat()
        data["is_simulated"] = True
        return data
