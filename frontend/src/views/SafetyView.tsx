import React from 'react';
import { UrbanEvent } from '../types';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface SafetyViewProps {
  events: UrbanEvent[];
  onSelectEvent: (event: UrbanEvent) => void;
}

export const SafetyView: React.FC<SafetyViewProps> = ({ events, onSelectEvent }) => {
  const safetyEvents = events.filter(e => e.event_type === 'pedestrian_risk');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="heading-md" style={{ marginBottom: '4px' }}>Vulnerable Road User & Pedestrian Safety</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Real-time detection for pedestrians in transit corridors, school zone geofencing, and proximity collision alerts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }} className="responsive-2col">
        {/* Left Column: Active Pedestrian Risk Events */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="var(--severity-high)" />
              <span>Detected Pedestrian Hazards</span>
            </h3>
            <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>{safetyEvents.length} Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {safetyEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="clickable-row"
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-high" style={{ fontSize: '0.6875rem' }}>Ameerpet School Zone</span>
                  <span className="mono" style={{ fontSize: '0.8125rem', color: 'var(--accent-text)', fontWeight: 600 }}>
                    {Math.round(evt.confidence * 100)}% Confidence
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>
                  {evt.description}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <div>Pedestrian Cluster: <b style={{ color: 'var(--text-primary)' }}>4 Persons</b></div>
                  <div>Estimated Proximity: <b style={{ color: 'var(--severity-critical)' }}>7.5 meters</b></div>
                  <div>Time-to-Collision: <b style={{ color: 'var(--severity-critical)' }}>2.1 sec</b></div>
                  <div>Crosswalk Status: <b style={{ color: 'var(--severity-high)' }}>Unmarked Crossing</b></div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--accent-text)', fontWeight: 500 }}>
                  Click to inspect full AI explainability reasoning & visual frame →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: School Zone Safety Geofence Status */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--accent-text)" />
              <span>School Zone Geofences</span>
            </h3>
            <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>Sample Geofences</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: "St. Ann's Secunderabad Zone", radius: "300m", status: "Secure", risk: "Low", sev: "low" },
              { name: "St. George's Abids Zone", radius: "250m", status: "Active Traffic", risk: "Medium", sev: "medium" },
              { name: "Ameerpet Education Hub", radius: "200m", status: "Hazard Detected", risk: "High", sev: "high" },
              { name: "Jubilee Hills Public School Zone", radius: "350m", status: "Normal Flow", risk: "Low", sev: "low" }
            ].map((sz, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{sz.name}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Geofence: {sz.radius} perimeter</div>
                </div>
                <span className={`badge badge-${sz.sev}`} style={{ fontSize: '0.6875rem' }}>
                  {sz.risk} Risk
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--accent-muted)', border: '1px solid var(--border-accent)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Contextual geofence triggers correlate camera-based pedestrian count, moving vehicle approach speed, and school calendar hours to suppress false alarms during off-peak times.
          </div>
        </div>
      </div>
    </div>
  );
};
export default SafetyView;
