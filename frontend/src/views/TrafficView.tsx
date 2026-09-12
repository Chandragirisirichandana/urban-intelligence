import React from 'react';
import { UrbanEvent } from '../types';
import { Car, Activity } from 'lucide-react';

interface TrafficViewProps {
  events: UrbanEvent[];
}

export const TrafficView: React.FC<TrafficViewProps> = ({ events }) => {
  const congestionEvents = events.filter(e => e.event_type === 'congestion');

  const vehicleComposition = [
    { label: 'Auto-Rickshaws', count: 34, pct: 36, color: '#f59e0b' },
    { label: 'Two-Wheelers', count: 28, pct: 30, color: '#2563eb' },
    { label: 'Cars & Cabs', count: 20, pct: 21, color: '#8b5cf6' },
    { label: 'Buses & Commercial', count: 12, pct: 13, color: '#ec4899' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="heading-md" style={{ marginBottom: '4px' }}>Traffic Flow & Congestion Intelligence</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Real-time vehicle detection, modal classification, flow density, and transit bottleneck discovery.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            ACTIVE BOTTLENECK CORRIDORS
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--severity-high)' }}>
            {congestionEvents.length} Zones
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Mehdipatnam & Ameerpet</div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            CORRIDOR VELOCITY (DEMO EST.)
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>19.4 km/h</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--severity-critical)', marginTop: '4px' }}>-38% vs route design speed</div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            TRANSIT FLOW RATE (DEMO EST.)
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-text)' }}>64 veh/min</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Peak Evening Transit Period</div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            ESTIMATED TRANSIT DELAY
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--severity-high)' }}>+14</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>minutes</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Affecting Routes R4 & R5</div>
        </div>
      </div>

      {/* Grid: Vehicle Composition + Identified Bottlenecks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px' }} className="responsive-2col">
        {/* Left: Vehicle Composition */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car size={16} color="var(--accent-text)" />
              <span>Vehicle Modal Composition</span>
            </h3>
            <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>Sample Aggregation</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {vehicleComposition.map((v, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v.label}</span>
                  <span className="mono" style={{ color: v.color, fontWeight: 600 }}>{v.pct}% ({v.count} tracked)</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${v.pct}%`, height: '100%', background: v.color }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Vehicle tracking executes onboard via ByteTrack. Transmits only aggregated density and flow counts — zero individual citizen vehicle paths are tracked or stored.
          </div>
        </div>

        {/* Right: Bottleneck Hotspots */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--severity-high)" />
              <span>Identified Bottleneck Corridors</span>
            </h3>
            <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>Live Alerting</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {congestionEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--severity-high)', fontSize: '0.875rem' }}>
                    Mehdipatnam Junction Arterial
                  </span>
                  <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>Severe Slowdown</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                  {evt.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Velocity: <b style={{ color: 'var(--severity-critical)' }}>8.4 km/h</b></span>
                  <span>Lane Density: <b style={{ color: 'var(--accent-text)' }}>88%</b></span>
                  <span>Affected Routes: <b style={{ color: 'var(--text-primary)' }}>R4, R5</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TrafficView;
