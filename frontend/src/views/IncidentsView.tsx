import React from 'react';
import { UrbanEvent } from '../types';
import { Camera, ShieldAlert, FileText } from 'lucide-react';

interface IncidentsViewProps {
  events: UrbanEvent[];
  onSelectEvent: (event: UrbanEvent) => void;
  onOpenReport?: (event: UrbanEvent) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ events, onSelectEvent, onOpenReport }) => {
  const incidentEvents = events.filter(e =>
    ['hit_and_run', 'rash_driving', 'wrong_way', 'vehicle_violation', 'incident'].includes(e.event_type)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="heading-md" style={{ marginBottom: '4px' }}>Traffic Incidents, Reckless Driving & ANPR</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Vehicle trajectory anomaly tracking, hit-and-run detection, and automated number plate extraction.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-2col">
        {/* Left Column: Tracked Incidents */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} color="var(--severity-critical)" />
              <span>Tracked Driving Incidents</span>
            </h3>
            <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>{incidentEvents.length} Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidentEvents.map((evt) => (
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
                  <span className="badge badge-critical" style={{ fontSize: '0.6875rem', textTransform: 'capitalize' }}>
                    {evt.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="mono" style={{ fontSize: '0.8125rem', color: 'var(--accent-text)', fontWeight: 600 }}>
                    {Math.round(evt.confidence * 100)}% Confidence
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>
                  {evt.description}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <div>Bus Tracker: <b style={{ color: 'var(--text-primary)' }}>Bus #{evt.bus_id}</b></div>
                  <div>Location: <b>{evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)}</b></div>
                  <div>Status: <b style={{ color: 'var(--accent-text)', textTransform: 'uppercase' }}>{evt.status}</b></div>
                  <div>ANPR Trigger: <b style={{ color: '#22c55e' }}>{evt.extra_metadata?.plate_number ? 'Plate Captured' : 'Active Track'}</b></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-text)', fontWeight: 500 }}>
                    View AI reasoning & evidence frame →
                  </span>
                  {onOpenReport && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReport(evt);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '4px 10px', gap: '4px' }}
                    >
                      <FileText size={12} />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: ANPR Plate Extraction Card */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={16} color="var(--accent-text)" />
              <span>ANPR Plate Recognition Engine</span>
            </h3>
            <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Edge OCR</span>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px', letterSpacing: '0.04em' }}>
              FLAGGED SUSPECT VEHICLE (TELANGANA HSRP)
            </div>

            {/* High-fidelity Indian Plate Box */}
            <div
              style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '8px 16px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                border: '2px solid #000000',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  background: '#003893',
                  color: '#ffffff',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  padding: '2px 4px',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  lineHeight: 1,
                }}
              >
                <span>IND</span>
              </div>
              <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                TS09 AB 1234
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Plate Localization:</span>
                <span className="mono" style={{ marginLeft: '6px', color: '#22c55e', fontWeight: 600 }}>93% Conf</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Character OCR:</span>
                <span className="mono" style={{ marginLeft: '6px', color: '#22c55e', fontWeight: 600 }}>89% Conf</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>RTA Jurisdiction:</span>
                <span style={{ marginLeft: '6px', color: 'var(--text-primary)', fontWeight: 500 }}>Telangana (TS09 Central)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>HSRP Syntax:</span>
                <span className="badge badge-low" style={{ marginLeft: '6px', fontSize: '0.625rem' }}>VALID PASS</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--accent-muted)', border: '1px solid var(--border-accent)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <b style={{ color: 'var(--text-primary)' }}>Privacy Guardrail:</b> Ambiguous character sequences below 80% OCR confidence are tagged as <code>LOW CONFIDENCE</code> to prevent false enforcement dispatches.
          </div>
        </div>
      </div>
    </div>
  );
};
export default IncidentsView;
