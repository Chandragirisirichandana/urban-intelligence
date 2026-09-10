"""Urban Intelligence Platform - Edge AI Sensing Subsystem"""
from edge.processors.road_defect import RoadDefectProcessor, DefectDetection
from edge.processors.traffic import TrafficProcessor, TrackedVehicle, TrafficMetrics
from edge.processors.safety import SafetyProcessor, PedestrianSafetyAlert
from edge.processors.incident import IncidentProcessor, IncidentDetection
from edge.processors.anpr import ANPRProcessor, PlateResult
from edge.managers.camera_stream import MultiCameraManager, CameraConfig
from edge.managers.spatial_dedup import SpatialDeduplicator, LocalCluster
from edge.managers.event_queue import EdgeEventQueue, EdgeQueueItem
from edge.managers.privacy import PrivacyFilter
