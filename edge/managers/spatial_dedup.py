"""
Urban Intelligence Platform - Edge Spatial-Temporal Event Deduplication

Prevents redundant edge event emissions when buses traverse the same road segments.
Maintains local spatial hash index and increases observation confidence upon repeated sightings.
"""
import math
import time
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class LocalCluster:
    """Represents a localized event cluster maintained at edge / bus level."""
    cluster_id: str
    event_type: str
    lat: float
    lng: float
    observation_count: int = 1
    aggregate_confidence: float = 0.5
    first_seen: float = field(default_factory=time.time)
    last_seen: float = field(default_factory=time.time)


class SpatialDeduplicator:
    """
    Edge spatial and temporal event deduplicator.
    Radius defaults to 50 meters, time window defaults to 3600 seconds (1 hour).
    """

    def __init__(self, radius_meters: float = 50.0, time_window_seconds: float = 3600.0):
        self.radius_meters = radius_meters
        self.time_window_seconds = time_window_seconds
        # Key: event_type, Value: list of LocalCluster
        self.clusters: Dict[str, List[LocalCluster]] = {}

    def check_and_update(
        self,
        event_type: str,
        lat: float,
        lng: float,
        confidence: float
    ) -> Tuple[bool, Optional[LocalCluster]]:
        """
        Checks if an observation matches an existing cluster within radius and time window.
        Returns:
            (is_duplicate: bool, cluster: LocalCluster)
            If is_duplicate is True: an existing cluster was matched and its count/confidence updated.
            If is_duplicate is False: a new cluster was created.
        """
        now = time.time()
        # Clean up stale clusters
        self._cleanup(now)

        if event_type not in self.clusters:
            self.clusters[event_type] = []

        # Search for nearby cluster of same event type
        for cluster in self.clusters[event_type]:
            dist = self.haversine_distance(lat, lng, cluster.lat, cluster.lng)
            if dist <= self.radius_meters:
                # Existing cluster matched!
                cluster.observation_count += 1
                cluster.last_seen = now
                # Bayesian-like confidence reinforcement:
                # Each independent observation increases aggregate confidence towards 1.0
                cluster.aggregate_confidence = round(
                    1.0 - (1.0 - cluster.aggregate_confidence) * (1.0 - confidence * 0.5), 3
                )
                return True, cluster

        # No match found: create new cluster
        cluster_id = f"c_{event_type[:4]}_{int(now)}_{int(lat*1000)}"
        new_cluster = LocalCluster(
            cluster_id=cluster_id,
            event_type=event_type,
            lat=lat,
            lng=lng,
            observation_count=1,
            aggregate_confidence=round(confidence, 3),
            first_seen=now,
            last_seen=now
        )
        self.clusters[event_type].append(new_cluster)
        return False, new_cluster

    def _cleanup(self, current_time: float):
        """Prunes clusters older than time window."""
        for event_type in list(self.clusters.keys()):
            self.clusters[event_type] = [
                c for c in self.clusters[event_type]
                if (current_time - c.last_seen) < self.time_window_seconds
            ]

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Computes great-circle distance in meters between two coordinates."""
        r = 6371000.0  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)

        a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return r * c
