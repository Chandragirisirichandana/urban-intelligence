import React from 'react';
import { Bus, Route } from '../types';
import { Bus as BusIcon, Camera, Cpu, Wifi, Activity, CheckCircle, Navigation } from 'lucide-react';

interface FleetViewProps {
  buses: Bus[];
  routes: Route[];
}

export const FleetView: React.FC<FleetViewProps> = ({ buses, routes }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>PUBLIC TRANSPORT BUS SENSING FLEET</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time telemetry, camera status, and edge AI compute stats across active transit nodes in Hyderabad
          </p>
        </div>
        <span className="badge badge-low">
          <CheckCircle size={14} /> All 10 Buses Telemetry Active
        </span>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px' }}>BUS NUMBER</th>
              <th style={{ padding: '12px 16px' }}>ASSIGNED ROUTE</th>
              <th style={{ padding: '12px 16px' }}>SPEED</th>
              <th style={{ padding: '12px 16px' }}>EDGE INFERENCE</th>
              <th style={{ padding: '12px 16px' }}>CAMERAS</th>
              <th style={{ padding: '12px 16px' }}>NETWORK LATENCY</th>
              <th style={{ padding: '12px 16px' }}>PASSENGER LOAD</th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr
                key={bus.id}
                style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,242,254,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BusIcon size={16} color="var(--brand-cyan)" />
                    </div>
                    <div>
                      <div className="mono" style={{ fontWeight: 700, color: '#fff' }}>{bus.bus_number}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: #{bus.id}</div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{bus.route_name || 'Corridor Route'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GPS: {bus.current_latitude.toFixed(4)}, {bus.current_longitude.toFixed(4)}</div>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <span className="mono" style={{ fontWeight: 700, color: '#fff' }}>{bus.speed}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> km/h</span>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={14} color="var(--status-low)" />
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--status-low)' }}>
                      {bus.edge_fps || 21.4} FPS
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NVIDIA Orin Edge</div>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-cyan)', fontWeight: 600 }}>
                    <Camera size={14} />
                    <span>{bus.active_cameras || 4} Active</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Front • Rear • L • R</div>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wifi size={14} color="var(--brand-blue)" />
                    <span className="mono">{bus.network_latency_ms || 24} ms</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>5G Cellular Band</div>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <div style={{ width: '80px', background: 'rgba(255,255,255,0.08)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ width: `${bus.passenger_load_pct || 60}%`, height: '100%', background: 'var(--brand-cyan)' }} />
                  </div>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {bus.passenger_load_pct || 60}% Occupancy
                  </span>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <span className="badge badge-low">Active Sensing</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
