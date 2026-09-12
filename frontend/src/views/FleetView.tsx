import React from 'react';
import { Bus, Route } from '../types';
import { Bus as BusIcon, Camera, Cpu, Wifi, CheckCircle } from 'lucide-react';

interface FleetViewProps {
  buses: Bus[];
  routes: Route[];
}

export const FleetView: React.FC<FleetViewProps> = ({ buses }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="heading-md" style={{ marginBottom: '4px' }}>Public Transit Sensing Fleet</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time telemetry, camera operational status, and edge compute performance across active transit units.
          </p>
        </div>
        <span className="badge badge-low" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={13} />
          <span>{buses.length} Buses Active Sensing</span>
        </span>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vehicle</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assigned Corridor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Speed</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Edge Inference</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Cameras</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Network Latency</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Passenger Load</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Telemetry Status</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr
                  key={bus.id}
                  className="clickable-row"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--accent-muted)',
                          color: 'var(--accent-text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BusIcon size={16} />
                      </div>
                      <div>
                        <div className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bus.bus_number}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>ID #{bus.id}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{bus.route_name || 'Corridor Route'}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      GPS {bus.current_latitude.toFixed(4)}, {bus.current_longitude.toFixed(4)}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bus.speed}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}> km/h</span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Cpu size={14} color="#22c55e" />
                      <span className="mono" style={{ fontWeight: 600, color: '#22c55e' }}>
                        {bus.edge_fps || 22.0} FPS
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontWeight: 500 }}>
                      <Camera size={14} />
                      <span>{bus.active_cameras || 4} HD Cams</span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Wifi size={14} color="var(--text-secondary)" />
                      <span className="mono">{bus.network_latency_ms || 24} ms</span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ width: '80px', background: 'rgba(255, 255, 255, 0.08)', height: '5px', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                      <div style={{ width: `${bus.passenger_load_pct || 60}%`, height: '100%', background: 'var(--accent)' }} />
                    </div>
                    <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                      {bus.passenger_load_pct || 60}% Occupancy
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span className="badge badge-low">Active Ingestion</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          * Edge Hardware Specification: Onboard Jetson/Orin compute units running TensorRT-optimized YOLOv8s models with 5G cellular uplink for event telemetry.
        </div>
      </div>
    </div>
  );
};
export default FleetView;
