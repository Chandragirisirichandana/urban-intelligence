import React from 'react';
import { Bus, UrbanEvent, Alert, RoadSegment } from '../types';
import {
  Activity, AlertTriangle, ShieldAlert, Cpu, ArrowUpRight, Eye
} from 'lucide-react';
import { GisMap } from '../components/GisMap';

interface OverviewViewProps {
  buses: Bus[];
  events: UrbanEvent[];
  alerts: Alert[];
  roadSegments: RoadSegment[];
  routes: any[];
  onSelectEvent: (event: UrbanEvent) => void;
  setActiveTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  buses,
  events,
  alerts,
  routes,
  onSelectEvent,
  setActiveTab
}) => {
  const criticalCount = alerts.filter(a => a.category === 'critical' && a.status === 'active').length;
  const highCount = alerts.filter(a => a.category === 'high' && a.status === 'active').length;
  const potholesCount = events.filter(e => e.event_type === 'pothole').length;
  const avgFps = (buses.reduce((acc, b) => acc + (b.edge_fps || 22.0), 0) / (buses.length || 1)).toFixed(1);
  const activeCamsCount = buses.reduce((acc, b) => acc + (b.active_cameras || 4), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Card 1: Active Fleet */}
        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Fleet Sensing Units
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="var(--accent-text)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{buses.length}</span>
            <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>Active Transit Buses</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {activeCamsCount} Optical HD Sensors Streamed
          </div>
        </div>

        {/* Card 2: Road Defects */}
        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Road Defects Flagged
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--severity-high-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="var(--severity-high)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--severity-high)' }}>
              {events.filter(e => ['pothole', 'crack', 'damaged_road', 'waterlogging'].includes(e.event_type)).length}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{potholesCount} Potholes</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Spatial Multi-Bus Deduplication
          </div>
        </div>

        {/* Card 3: Critical Hazards */}
        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Active Critical Alerts
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--severity-critical-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={16} color="var(--severity-critical)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--severity-critical)' }}>{criticalCount}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--severity-high)', fontWeight: 500 }}>+ {highCount} High Priority</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Triage & Incident Dispatch
          </div>
        </div>

        {/* Card 4: Edge AI Performance */}
        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Edge Inference Speed
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--severity-low-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={16} color="#22c55e" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>{avgFps}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FPS Fleet Average</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            YOLOv8s Real-Time Inference
          </div>
        </div>
      </div>

      {/* Main Map & Live Detection Feed Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '16px' }} className="responsive-2col">
        {/* Left Column: Live GIS Map */}
        <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot status-dot-active" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Live Urban Sensing GIS Map</h3>
            </div>
            <button
              onClick={() => setActiveTab('live-map')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '5px 10px', gap: '4px' }}
            >
              <span>Fullscreen Map</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
          <GisMap
            buses={buses}
            routes={routes}
            events={events}
            onSelectEvent={onSelectEvent}
            height="460px"
          />
        </div>

        {/* Right Column: Live Detection Feed */}
        <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Live Edge Ingestions</h3>
            <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>METADATA STREAM</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '460px' }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="clickable-row"
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      color: evt.severity === 'critical' ? 'var(--severity-critical)' : evt.severity === 'high' ? 'var(--severity-high)' : 'var(--text-primary)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {evt.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="badge badge-neutral mono" style={{ fontSize: '0.6875rem' }}>
                    {Math.round(evt.confidence * 100)}% Conf
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                  {evt.description}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  <span>Bus #{evt.bus_id} • Front Optical</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-text)', fontWeight: 500 }}>
                    <Eye size={12} /> Inspect
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default OverviewView;
