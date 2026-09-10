"""
Urban Intelligence Platform - Bus Fleet & Event Simulator Tests
"""
import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from simulator.bus_sim import BusSimulator
from simulator.event_generator import DemoEventGenerator


def test_bus_simulator_fleet_initialization():
    """Verify fleet count, route assignment, and initial telemetry."""
    sim = BusSimulator(bus_count=10)
    assert len(sim.buses) == 10

    # Step simulation
    telemetries = sim.step(delta_time_seconds=2.0)
    assert len(telemetries) == 10

    for t in telemetries:
        assert t.bus_id.startswith("BUS_")
        assert 17.0 <= t.latitude <= 17.6  # Hyderabad latitude bound
        assert 78.2 <= t.longitude <= 78.6  # Hyderabad longitude bound
        assert t.speed_kmh > 0
        assert t.edge_fps > 15.0
        assert t.active_cameras == 4


def test_demo_event_generator():
    """Verify SIH scenario sequence and simulation labeling."""
    pothole_scenario = DemoEventGenerator.get_scenario(0)
    assert pothole_scenario["event_type"] == "pothole"
    assert pothole_scenario["is_simulated"] is True
    assert len(pothole_scenario["ai_reasoning"]) >= 3

    hit_and_run_scenario = DemoEventGenerator.get_scenario(5)
    assert hit_and_run_scenario["event_type"] == "hit_and_run"
    assert hit_and_run_scenario["severity"] == "critical"
    assert hit_and_run_scenario["extra_metadata"]["anpr_triggered"] is True

    anpr_scenario = DemoEventGenerator.get_scenario(6)
    assert anpr_scenario["extra_metadata"]["plate_number"] == "TS09AB1234"
    assert anpr_scenario["extra_metadata"]["syntax_valid"] is True
