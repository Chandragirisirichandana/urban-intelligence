import React from 'react';
import { UrbanEvent } from '../types';
import { Car, Activity, TrendingDown, AlertTriangle, Clock, MapPin } from 'lucide-react';

interface TrafficViewProps {
  events: UrbanEvent[];
}

export const TrafficView: React.FC<TrafficViewProps> = ({ events }) => {
  const congestionEvents = events.filter(e => e.event_type === 'congestion');

  const vehicleComposition = [
    { label: 'Auto-Rickshaws', count: 34, pct: 36, color: '#f59e0b' },
    { label: 'Two-Wheelers', count: 28, pct: 30, color: '#00f2fe' },
    { label: 'Cars / Cabs', count: 20, pct: 21, color: '#8b5cf6' },
    { label: 'Buses & Trucks', count: 12, pct: 13, color: '#ec4899' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>TRAFFIC FLOW & CONGESTION INTELLIGENCE</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Vehicle detection, classification, density monitoring, and corridor bottleneck discovery from bus cameras
        </p>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>ACTIVE BOTTLENECK ZONES</div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-high)' }}>
            {congestionEvents.length} Corridors
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Mehdipatnam & Ameerpet</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>AVERAGE TRAFFIC VELOCITY</div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>19.4 km/h</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-critical)', marginTop: '4px' }}>-38% vs speed limit</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>TRANSIT FLOW RATE</div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-cyan)' }}>64 veh/min</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Peak Evening Flow</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>CONGESTION STATUS</div>
          <div className="badge badge-high" style={{ fontSize: '0.9rem', marginTop: '6px' }}>HIGH CONGESTION</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Bus delays estimated: 14 mins</div>
        </div>
      </div>

      {/* Grid: Vehicle Modal Split + Bottlenecks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px' }}>
        {/* Left: Vehicle Composition */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Car size={16} color="var(--brand-cyan)" /> VEHICLE MODAL COMPOSITION (BUS FOV)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {vehicleComposition.map((v, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.label}</span>
                  <span className="mono" style={{ color: v.color, fontWeight: 700 }}>{v.pct}% ({v.count} tracked)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${v.pct}%`, height: '100%', background: v.color }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Multi-class vehicle tracking executed on edge Jetson nodes using ByteTrack. Preserves anonymous aggregated vehicle counts without individual tracking.
          </div>
        </div>

        {/* Right: Bottleneck Hotspots */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--status-high)" /> IDENTIFIED TRAFFIC BOTTLENECK CORRIDORS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {congestionEvents.map((evt) => (
              <div key={evt.id} style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--status-high)', fontSize: '0.85rem' }}>
                    Mehdipatnam Junction Arterial
                  </span>
                  <span className="badge badge-high">Severe Slowdown</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {evt.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Corridor Velocity: <b style={{ color: 'var(--status-critical)' }}>8.4 km/h</b></span>
                  <span>Density: <b style={{ color: 'var(--brand-cyan)' }}>88%</b></span>
                  <span>Affected Routes: <b>R4, R5</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
