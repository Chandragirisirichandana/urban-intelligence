# Smart India Hackathon (SIH) - Live Demonstration Guide
## AI-Powered Mobile Urban Intelligence Platform Using Public Transport Buses

This document walks judges and evaluators through the complete 20-step demonstration flow illustrating how public transit fleets transform into autonomous city sensing platforms.

---

## 1. Quick Start Demonstration Setup

### Running Backend
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### Running Frontend
```bash
cd frontend
npm run dev
```
Command Center Interface: `http://localhost:5173`

---

## 2. The 20-Step Coherent Evaluation Story

1. **Open Command Center**: Point browser to `http://localhost:5173`. Highlight the real-time operational header with active bus counters, edge FPS (21.6 FPS), critical alert counts, and live IST clock.
2. **Fleet Operations GIS Map**: Show 10 public buses actively traversing Hyderabad corridors (Secunderabad-Charminar, Miyapur-LB Nagar, ECIL-Mehdipatnam). Note the real-time heading angles and speeds.
3. **Trigger Scenario 1 (Pothole Detection)**:
   - Click `DEMO SCENARIOS` in the top right header → Select `1. Bus 12 → Road Pothole Detected`.
   - Bus 12 detects a deep crater on Nampally Main Road.
   - An event marker appears on the GIS map with 92% confidence and HIGH severity.
4. **Inspect AI Explainability**:
   - Click the pothole marker on the map.
   - The modal opens displaying:
     - Edge model confidence: 92%
     - Explainability: High-contrast depression contour, 0.72 m² surface disruption area.
     - Evidence frame with normalized bounding box and privacy-sanitized background.
5. **Trigger Scenario 2 (Spatial Deduplication & Confidence Reinforcement)**:
   - Select `2. Bus 7 → Deduplication & Confidence Up`.
   - Bus 7 traverses the same road 15 minutes later and detects the pothole.
   - Point out that **no duplicate event** is created; instead, the observation count increases to 2, and aggregate confidence is Bayesian-reinforced to 95%!
6. **Trigger Scenario 3 (Traffic Bottleneck Identification)**:
   - Select `3. Bus 7 → Traffic Congestion Bottleneck`.
   - High traffic congestion alert pops up at Mehdipatnam Junction (speed drops to 8.4 km/h, 88% density).
   - Navigate to the **Traffic & Flow** module to see the vehicle modal breakdown (autos, cars, 2-wheelers) and congestion heat levels.
7. **Trigger Scenario 4 (Monsoon Waterlogging Emergency)**:
   - Select `4. Bus 8 → Severe Waterlogging`.
   - Critical alert triggers at Charminar Bus Lane (>15cm water accumulation, 95% confidence).
   - Show how the system flags this for municipal drainage dispatch.
8. **Trigger Scenario 5 (Vulnerable Road User Safety in School Zone)**:
   - Select `5. Bus 4 → School Pedestrian Risk`.
   - Navigate to the **Pedestrian Safety** module.
   - Show the detected cluster of 4 pedestrians crossing near moving transit traffic in Ameerpet Education Hub.
   - Time-to-Collision (TTC) of 2.1s triggers high-priority safety alert.
9. **Trigger Scenario 6 (Rash Driving, Collision & ANPR Plate Extraction)**:
   - Select `6. Bus 11 → Rash Drive & ANPR Plate`.
   - Vehicle #1084 collides with a divider at Begumpet and flees at 62 km/h.
   - Automatic ANPR pipeline extracts the offending vehicle license plate: `TS09AB1234`.
   - Format syntax check confirms valid Telangana State registration.
10. **Incident Dossier Generation**:
    - Navigate to the **Incident Reports** tab.
    - Click **Print / Export Formal PDF** to generate an official certified municipal report with chain of custody, GPS coordinates, vehicle plate, and authority signature block.
11. **Road Condition Scoring**:
    - Open **Road Condition** to display Hyderabad road segments scored on a 0–100 scale (GOOD, FAIR, POOR, CRITICAL).
    - Demonstrate how municipal engineers prioritize repair budgets based on sensor frequency.
12. **Route Delay Estimation**:
    - Open **Route Delays** to show how heavy traffic bottlenecks directly impact bus schedules (e.g. +18 min delay on R4).
13. **Edge AI MLOps Health**:
    - Open **AI Model Health** to show 10 Jetson Orin nodes running at 21.6 FPS, 98.4% bandwidth savings, and version-controlled deep learning models.
