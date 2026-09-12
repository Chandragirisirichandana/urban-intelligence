import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GisMap } from './components/GisMap';
import { EventModal } from './components/EventModal';

// Views
import { OverviewView } from './views/OverviewView';
import { FleetView } from './views/FleetView';
import { RoadView } from './views/RoadView';
import { TrafficView } from './views/TrafficView';
import { SafetyView } from './views/SafetyView';
import { IncidentsView } from './views/IncidentsView';
import { AlertsView } from './views/AlertsView';
import { RoutesView } from './views/RoutesView';
import { ReportsView } from './views/ReportsView';
import { MlOpsView } from './views/MlOpsView';

import { apiClient, DEMO_MODE, MOCK_BUSES, MOCK_ROUTES, MOCK_EVENTS, MOCK_ALERTS, MOCK_ROAD_SEGMENTS, MOCK_MAINTENANCE } from './services/api';
import { Bus, Route, UrbanEvent, Alert, RoadSegment, MaintenanceItem } from './types';

export const App: React.FC = () => {
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [buses, setBuses] = useState<Bus[]>(DEMO_MODE ? MOCK_BUSES : []);
  const [routes, setRoutes] = useState<Route[]>(DEMO_MODE ? MOCK_ROUTES : []);
  const [events, setEvents] = useState<UrbanEvent[]>(DEMO_MODE ? MOCK_EVENTS : []);
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_MODE ? MOCK_ALERTS : []);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>(DEMO_MODE ? MOCK_ROAD_SEGMENTS : []);
  const [maintenanceQueue, setMaintenanceQueue] = useState<MaintenanceItem[]>(DEMO_MODE ? MOCK_MAINTENANCE : []);

  const [selectedEvent, setSelectedEvent] = useState<UrbanEvent | null>(null);
  const [reportEvent, setReportEvent] = useState<UrbanEvent | null>(null);

  // Initial data fetch
  useEffect(() => {
    async function loadData() {
      try {
      const [b, r, e, a, roads, maint] = await Promise.all([
        apiClient.getBuses(),
        apiClient.getRoutes(),
        apiClient.getEvents(),
        apiClient.getAlerts(),
        apiClient.getRoadSegments(),
        apiClient.getMaintenanceQueue()
      ]);
      setBuses(b);
      setRoutes(r);
      setEvents(e);
      setAlerts(a);
      setRoadSegments(roads);
      setMaintenanceQueue(maint);
      setLoadError('');
      } catch {
        setLoadError('Unable to load backend data. Check the connection and refresh to retry.');
      } finally { setLoading(false); }
    }
    loadData();
  }, []);

  // Live simulation ticker: updates bus GPS coordinates smoothly along their routes
  useEffect(() => {
    if (!DEMO_MODE) return;
    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          // Slight jitter/movement along heading
          const speed = Math.max(12, Math.min(50, Math.round(bus.speed + (Math.random() * 4 - 2))));
          const latDelta = (Math.random() - 0.5) * 0.0004;
          const lngDelta = (Math.random() - 0.5) * 0.0004;
          return {
            ...bus,
            speed,
            current_latitude: Number((bus.current_latitude + latDelta).toFixed(5)),
            current_longitude: Number((bus.current_longitude + lngDelta).toFixed(5)),
            edge_fps: Number((20.5 + Math.random() * 3.2).toFixed(1))
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Trigger SIH Demonstration Scenario
  const handleTriggerDemo = async (scenarioIdx: number) => {
    try {
      await apiClient.triggerDemoScenario(scenarioIdx);
      if (!DEMO_MODE) {
        const [b, r, e, a, roads, maint] = await Promise.all([
          apiClient.getBuses(),
          apiClient.getRoutes(),
          apiClient.getEvents(),
          apiClient.getAlerts(),
          apiClient.getRoadSegments(),
          apiClient.getMaintenanceQueue()
        ]);
        setBuses(b);
        setRoutes(r);
        setEvents(e);
        setAlerts(a);
        setRoadSegments(roads);
        setMaintenanceQueue(maint);
      }
      setLoadError('');
    } catch {
      setLoadError('Unable to trigger the scenario. Check the backend connection and retry.');
    }

    // If scenario 1 (Spatial Deduplication): increment observation count of the Nampally pothole
    if (scenarioIdx === 1) {
      setEvents((prev) =>
        prev.map((evt) =>
          evt.event_type === 'pothole'
            ? {
                ...evt,
                confidence: 0.95,
                observation_count: (evt.observation_count || 1) + 1,
                ai_reasoning: [
                  ...(evt.ai_reasoning || []),
                  'Corroborating sighting: Re-identified by Bus TS09-3207. Confidence reinforced to 95%.'
                ]
              }
            : evt
        )
      );
    }
  };

  const handleOpenReport = (evt: UrbanEvent) => {
    setSelectedEvent(null);
    setReportEvent(evt);
    setActiveTab('reports');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div role="status" style={{ padding: '12px 20px', color: '#fff', background: '#283344' }}>
        {DEMO_MODE ? 'DEMO MODE — simulated events, locations and metrics.' : 'BACKEND MODE — prototype; some analytical panels still contain illustrative metrics. Backend records may include simulation data.'}
      </div>
      {loading && <p role="status">Loading data…</p>}
      {loadError && <p role="alert" style={{ color: '#ffb4b4', padding: '12px 20px' }}>{loadError}</p>}
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertsCount={alerts.filter(a => a.status === 'active' && a.category === 'critical').length}
        activeBusesCount={buses.length}
        onTriggerDemo={handleTriggerDemo}
      />

      {/* Main App Body */}
      <div style={{ display: 'flex', flex: 1, paddingRight: '16px' }}>
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alertsCount={alerts.filter(a => a.status === 'active').length}
        />

        {/* View Content Area */}
        <main style={{ flex: 1, padding: '0 0 20px 16px', overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <OverviewView
              buses={buses}
              events={events}
              alerts={alerts}
              roadSegments={roadSegments}
              routes={routes}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'live-map' && (
            <div className="glass-panel" style={{ padding: '14px' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#fff' }}>
                FULLSCREEN GIS SITUATIONAL OPERATIONS MAP
              </h2>
              <GisMap
                buses={buses}
                routes={routes}
                events={events}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
                height="calc(100vh - 170px)"
              />
            </div>
          )}

          {activeTab === 'fleet' && <FleetView buses={buses} routes={routes} />}

          {activeTab === 'roads' && (
            <RoadView
              roadSegments={roadSegments}
              events={events}
              maintenanceQueue={maintenanceQueue}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          )}

          {activeTab === 'traffic' && <TrafficView events={events} />}

          {activeTab === 'safety' && (
            <SafetyView
              events={events}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsView
              events={events}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onOpenReport={handleOpenReport}
            />
          )}

          {activeTab === 'alerts' && <AlertsView alerts={alerts} />}

          {activeTab === 'routes' && <RoutesView routes={routes} />}

          {activeTab === 'reports' && (
            <ReportsView
              events={events}
              initialSelectedEvent={reportEvent || events[0]}
            />
          )}

          {activeTab === 'mlops' && <MlOpsView />}
        </main>
      </div>

      {/* Detail Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onStatusChange={(id, newStatus) => {
            setEvents((prev) =>
              prev.map((e) => (e.id === id ? { ...e, status: newStatus as any } : e))
            );
          }}
          onOpenReport={handleOpenReport}
        />
      )}
    </div>
  );
};

export default App;
