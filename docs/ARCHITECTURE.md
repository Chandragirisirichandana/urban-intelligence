# System Architecture & Technical Specifications
## AI-Powered Mobile Urban Intelligence Platform Using Public Transport Buses

---

## 1. Executive Architectural Blueprint

```
+-------------------------------------------------------------------------+
|                  BUS ONBOARD EDGE SENSING UNIT                          |
|                                                                         |
|  [ Front Cam ]    [ Rear Cam ]    [ Left Cam ]    [ Right Cam ]         |
|        │               │               │               │                |
|        └───────────────┼───────────────┴───────────────┘                |
|                        ▼                                                |
|       [ MultiCameraManager: Real-time Ingestion & Synch ]               |
|                        │                                                |
|                        ▼                                                |
|         [ Edge Computer Vision Inference Engine ]                       |
|         ├─ YOLOv8s Road Defect Processor (Potholes, Cracks, Signs)      |
|         ├─ YOLOv8n + ByteTrack Vehicle Tracker (Flow & Density)         |
|         ├─ VRU Pedestrian Safety & Collision Hazard Estimator (TTC)     |
|         ├─ Incident & Rash-Driving Trajectory Analyzer                  |
|         └─ ANPR Number Plate OCR Engine & Format Validator              |
|                        │                                                |
|                        ▼                                                |
|            [ Edge Privacy Sanitization Filter ]                         |
|            (Face Blurring & Bystander Plate Obfuscation)                |
|                        │                                                |
|                        ▼                                                |
|       [ Edge Spatial-Temporal Deduplication & Bayesian Cluster ]        |
|                        │                                                |
|                        ▼                                                |
|       [ Edge Persistent Queue & Bandwidth-Throttling Sync ]             |
|       (Uploads metadata + compact evidence ONLY; 98.4% bandwidth saved) |
+────────────────────────┼────────────────────────────────────────────────+
                         │ Secure REST / WebSocket (TLS + JWT)
                         ▼
+─────────────────────────────────────────────────────────────────────────+
|                  CENTRAL URBAN INTELLIGENCE PLATFORM                    |
|                                                                         |
|  [ FastAPI Async Core ] ──── [ PostgreSQL + PostGIS Geospatial DB ]     |
|            │                                 │                          |
|            ├─ Central Cluster Aggregation    ├─ Road Deterioration Map  |
|            ├─ Alert Dispatch & Audit Trail   ├─ Congestion Hotspots     |
|            └─ Municipal Work Order Queue     └─ Route Delay Estimation  |
|                                                                         |
|  [ Command Center Frontend: React + TypeScript + Leaflet GIS ]          |
|  ├─ Live Interactive GIS Map & Fleet Radar                              |
|  ├─ AI Explainability Audit Panels                                      |
|  ├─ Automated Printable Municipal Incident Dossiers                     |
|  └─ Edge AI MLOps Health Telemetry                                      |
+-------------------------------------------------------------------------+
```

---

## 2. Edge-to-Cloud Bandwidth Reduction Analysis

Continuously streaming 4 cameras per bus at 1080p 30 FPS across a 1,000-bus metropolitan fleet requires:
- **Raw Video Streaming**: `1,000 buses × 4 cameras × 4 Mbps = 16 Gbps` continuous mobile data throughput. This is economically infeasible and vulnerable to cellular blackouts.
- **Edge Computing Architecture**:
  - Processing video locally on onboard NVIDIA Jetson units.
  - Emitting lightweight JSON metadata payloads (`~1.2 KB` per event).
  - Transmitting a compressed `150 KB` evidence crop frame **only** when an anomaly is confirmed.
  - **Bandwidth Reduction**: Greater than **98.4%** savings, allowing complete functionality over standard 4G/5G cellular bands with offline queuing during dead zones.

---

## 3. Spatial & Temporal Deduplication Algorithm

When 20 buses traverse the same arterial road per hour, transmitting 20 identical pothole records clutters dispatch systems.
The platform implements a local and central **Spatial-Temporal Clustering Engine**:
1. **Distance Metric**: Haversine distance formula with a configurable $R = 50\text{ meters}$ radius.
2. **Temporal Window**: $T = 3600\text{ seconds}$ (1 hour).
3. **Bayesian Confidence Update**:
   $$C_{\text{new}} = 1 - (1 - C_{\text{current}}) \times (1 - 0.5 \times C_{\text{observed}})$$
   Repeated sightings by independent buses reinforce verification certainty up to 99%, while single sightings are monitored for deterioration.

---

## 4. Privacy & Data Ethics Architecture

- **No Facial Recognition**: Strictly avoided to preserve citizen privacy.
- **Onboard Privacy Blurring**: Pedestrian faces and uninvolved bystander vehicle plates undergo Gaussian blurring at the edge before storage.
- **Role-Based Access Control (RBAC)**:
  - `COMMAND_CENTER`: Operational triage & live map monitoring.
  - `TRANSPORT_AUTHORITY`: Fleet dispatch & incident verification.
  - `ROAD_MAINTENANCE`: Work order execution & defect scheduling.
  - `ANALYST`: City-wide aggregate congestion & road condition analytics.
