import React from 'react';
import { Bus, UrbanEvent, Alert, RoadSegment } from '../types';
import {
  Activity, AlertTriangle, ShieldAlert, Cpu, Car, MapPin,
  TrendingUp, Sparkles, CheckCircle, ArrowUpRight, Eye
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
  roadSegments,
  routes,
  onSelectEvent,
  setActiveTab
}) => {
  const criticalCount = alerts.filter(a => a.category === 'critical').length;
  const highCount = alerts.filter(a => a.category === 'high').length;
  const potholesCount = events.filter(e => e.event_type === 'pothole').length;
  const avgSpeed = Math.round(buses.reduce((acc, b) => acc + b.speed, 0) / (buses.length || 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px'
      }}>
        {/* Card 1: Active Sensing Fleet */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Fleet Sensing Units
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} color="var(--brand-cyan)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{buses.length}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--status-low)', fontWeight: 600 }}>Active Nodes</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            60 Onboard Cameras Ingesting
          </div>
        </div>

        {/* Card 2: Road Surface Defects */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Road Defects Detected
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="var(--status-medium)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-medium)' }}>
              {events.filter(e => ['pothole', 'crack', 'damaged_road', 'waterlogging'].includes(e.event_type)).length}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{potholesCount} Potholes</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Spatial Deduplication Active
          </div>
        </div>

        {/* Card 3: Critical Hazards */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Critical Safety Alerts
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={18} color="var(--status-critical)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-critical)' }}>{criticalCount}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--status-high)' }}>+ {highCount} High</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Automated Municipal Dispatch
          </div>
        </div>

        {/* Card 4: Edge AI Performance */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Edge Inference Speed
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={18} color="var(--status-low)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-low)' }}>21.6</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FPS Average</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            NVIDIA Edge Onboard Compute
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Recent Feed Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px' }}>
        {/* Left Column: Live GIS Map */}
        <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot status-dot-active" />
              <h3 style={{ fontSize: '0.95rem', color: '#fff' }}>LIVE URBAN SENSING GIS MAP</h3>
            </div>
            <button
              onClick={() => setActiveTab('live-map')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Expand Fullscreen <ArrowUpRight size={13} />
            </button>
          </div>
          <GisMap
            buses={buses}
            routes={routes}
            events={events}
            onSelectEvent={onSelectEvent}
            height="480px"
          />
        </div>

        {/* Right Column: Live Detections Feed */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff' }}>LIVE EDGE DETECTIONS</h3>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>METADATA ONLY</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '480px' }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-cyan)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 242, 254, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.25)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: evt.severity === 'critical' ? 'var(--status-critical)' : evt.severity === 'high' ? 'var(--status-high)' : 'var(--status-medium)',
                    textTransform: 'uppercase'
                  }}>
                    {evt.event_type.replace('_', ' ')}
                  </span>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--brand-cyan)', fontWeight: 700 }}>
                    {Math.round(evt.confidence * 100)}% Conf
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3 }}>
                  {evt.description}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>Bus #{evt.bus_id} • Cam Front</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-highlight)' }}>
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
