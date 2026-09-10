import React from 'react';
import { UrbanEvent } from '../types';
import { Users, AlertTriangle, ShieldCheck, MapPin, Clock } from 'lucide-react';

interface SafetyViewProps {
  events: UrbanEvent[];
  onSelectEvent: (event: UrbanEvent) => void;
}

export const SafetyView: React.FC<SafetyViewProps> = ({ events, onSelectEvent }) => {
  const safetyEvents = events.filter(e => e.event_type === 'pedestrian_risk');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>VULNERABLE ROAD USER & PEDESTRIAN SAFETY</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Real-time hazard detection for pedestrians, school zones, unprotected crossing groups, and collision risk
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Left Column: Active Pedestrian Risk Events */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="var(--status-high)" /> DETECTED PEDESTRIAN HAZARDS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {safetyEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge badge-high">Ameerpet School Zone</span>
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--brand-cyan)', fontWeight: 700 }}>
                    {Math.round(evt.confidence * 100)}% Confidence
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>
                  {evt.description}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <div>Pedestrian Cluster: <b style={{ color: '#fff' }}>4 Persons</b></div>
                  <div>Estimated Proximity: <b style={{ color: 'var(--status-critical)' }}>7.5 meters</b></div>
                  <div>Time-to-Collision: <b style={{ color: 'var(--status-critical)' }}>2.1 sec</b></div>
                  <div>Crosswalk Status: <b style={{ color: 'var(--status-high)' }}>Unmarked Crossing</b></div>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Click to inspect full AI explainability reasoning & evidence frame →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: School Zone Safety Geofence Status */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--brand-cyan)" /> HYDERABAD TRANSIT SCHOOL ZONE MONITORING
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: "St. Ann's Secunderabad Zone", radius: "300m", status: "Secure", risk: "Low" },
              { name: "St. George's Abids Zone", radius: "250m", status: "Active Traffic", risk: "Medium" },
              { name: "Ameerpet Education Hub", radius: "200m", status: "Hazard Detected", risk: "High" },
              { name: "Jubilee Hills Public School Zone", radius: "350m", status: "Normal Flow", risk: "Low" }
            ].map((sz, i) => (
              <div key={i} style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff' }}>{sz.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Geofence: {sz.radius} around school gates</div>
                </div>
                <span className={`badge ${sz.risk === 'High' ? 'badge-high' : sz.risk === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                  {sz.risk} Risk
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Contextual Risk Indicators prevent false classifications by correlating pedestrian cluster size, moving vehicle proximity, and school zone metadata.
          </div>
        </div>
      </div>
    </div>
  );
};
