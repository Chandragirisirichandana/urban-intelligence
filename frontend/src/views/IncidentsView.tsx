import React from 'react';
import { UrbanEvent } from '../types';
import { Camera, ShieldAlert, CheckCircle, AlertTriangle, Eye, FileText } from 'lucide-react';

interface IncidentsViewProps {
  events: UrbanEvent[];
  onSelectEvent: (event: UrbanEvent) => void;
  onOpenReport?: (event: UrbanEvent) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ events, onSelectEvent, onOpenReport }) => {
  const incidentEvents = events.filter(e =>
    ['hit_and_run', 'rash_driving', 'wrong_way', 'vehicle_violation'].includes(e.event_type)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>INCIDENTS, RECKLESS DRIVING & ANPR RECOGNITION</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Vehicle trajectory anomaly tracking, hit-and-run detection, and automated number plate extraction
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left Column: Tracked Incidents */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} color="var(--status-critical)" /> TRACKED DRIVING INCIDENTS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidentEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge badge-critical">{evt.event_type.replace(/_/g, ' ').toUpperCase()}</span>
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--brand-cyan)', fontWeight: 700 }}>
                    {Math.round(evt.confidence * 100)}% Conf
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>
                  {evt.description}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <div>Bus Tracker: <b style={{ color: '#fff' }}>Bus #{evt.bus_id}</b></div>
                  <div>Location: <b>{evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)}</b></div>
                  <div>Status: <b style={{ color: 'var(--brand-cyan)', textTransform: 'uppercase' }}>{evt.status}</b></div>
                  <div>ANPR Trigger: <b style={{ color: 'var(--status-low)' }}>SUCCESS</b></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-highlight)' }}>
                    Click to view AI reasoning →
                  </span>
                  {onOpenReport && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReport(evt);
                      }}
                      className="btn-secondary"
                      style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                    >
                      <FileText size={12} /> Generate Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: ANPR Plate Extraction Card */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={16} color="var(--brand-cyan)" /> ANPR NUMBER PLATE RECOGNITION PIPELINE
          </h3>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              OFFENDING VEHICLE IDENTIFICATION
            </div>

            {/* Simulated Indian Plate Box */}
            <div style={{
              background: '#fff',
              color: '#000',
              padding: '8px 18px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              border: '3px solid #1e293b',
              boxShadow: '0 0 15px rgba(255,255,255,0.2)',
              marginBottom: '14px'
            }}>
              <div style={{
                background: '#003399',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 4px',
                borderRadius: '2px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span>IND</span>
              </div>
              <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.12em' }}>
                TS09 AB 1234
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Plate Localization:</span>
                <span className="mono" style={{ marginLeft: '6px', color: 'var(--status-low)', fontWeight: 700 }}>93% Conf</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Character OCR:</span>
                <span className="mono" style={{ marginLeft: '6px', color: 'var(--status-low)', fontWeight: 700 }}>89% Conf</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>State Authority:</span>
                <span style={{ marginLeft: '6px', color: '#fff', fontWeight: 600 }}>Telangana (TS09)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Syntax Format:</span>
                <span className="badge badge-low" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>VALID PASS</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <b style={{ color: '#fff' }}>Engineering Ethics Guard:</b> The edge pipeline strictly marks ambiguous OCR readings as <code>UNKNOWN / LOW CONFIDENCE</code> to avoid false enforcement citations.
          </div>
        </div>
      </div>
    </div>
  );
};
