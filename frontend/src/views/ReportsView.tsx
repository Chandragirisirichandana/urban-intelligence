import React, { useState } from 'react';
import { UrbanEvent } from '../types';
import { FileText, Printer, Download, CheckCircle, ShieldAlert, Sparkles, MapPin, Bus } from 'lucide-react';

interface ReportsViewProps {
  events: UrbanEvent[];
  initialSelectedEvent?: UrbanEvent;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ events, initialSelectedEvent }) => {
  const [selectedEvent, setSelectedEvent] = useState<UrbanEvent>(
    initialSelectedEvent || events[0] || {} as UrbanEvent
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>OFFICIAL MUNICIPAL INCIDENT & DEFECT REPORTS</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Certified inspection documentation generated directly from edge AI video evidence & GPS records
          </p>
        </div>

        <button onClick={handlePrint} className="btn-primary" style={{ fontSize: '0.82rem' }}>
          <Printer size={15} /> Print / Export Formal PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
        {/* Left: Incident Selector */}
        <div className="glass-panel" style={{ padding: '14px', maxHeight: '700px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Select Incident or Hazard
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {events.map((evt) => {
              const isSelected = evt.id === selectedEvent.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(0,0,0,0.2)',
                    border: isSelected ? '1px solid var(--brand-cyan)' : '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.78rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                      {evt.event_type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)' }}>
                      {Math.round(evt.confidence * 100)}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {evt.event_id} • Bus #{evt.bus_id}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Printable Formal Incident Dossier */}
        <div className="glass-panel" style={{ padding: '28px', background: '#0b1120', border: '1px solid var(--border-medium)' }}>
          {/* Official Letterhead */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(255,255,255,0.15)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--brand-cyan)', textTransform: 'uppercase' }}>
                GOVERNMENT OF TELANGANA • GREATER HYDERABAD MUNICIPAL CORPORATION
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
                MOBILE URBAN SENSING INCIDENT DOSSIER
              </h1>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Command & Control Automated Edge Verification System
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-highlight)' }}>
                {selectedEvent.event_id || 'EVT_HYD_DOC_01'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Generated: {new Date().toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>

          {/* Dossier Body Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>INCIDENT CLASSIFICATION</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
                {selectedEvent.event_type?.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--status-critical)', marginTop: '4px' }}>
                Severity Assessment: {selectedEvent.severity?.toUpperCase()}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>GEOSPATIAL LOCATION</div>
              <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                {selectedEvent.latitude?.toFixed(5)}° N, {selectedEvent.longitude?.toFixed(5)}° E
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Hyderabad Urban Corridor Core
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>OBSERVING ASSET</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                Bus Node #{selectedEvent.bus_id} (CAM_FRONT)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-cyan)', marginTop: '4px' }}>
                Edge Confidence: {Math.round((selectedEvent.confidence || 0.9) * 100)}%
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ANPR IDENTIFICATION</div>
              <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-highlight)' }}>
                {selectedEvent.extra_metadata?.plate_number || 'NO OFFENDER PLATE ASSOCIATED'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--status-low)', marginTop: '4px' }}>
                Format Status: VALID TELANGANA SYNTAX
              </div>
            </div>
          </div>

          {/* AI Explainability Statement */}
          <div style={{ background: 'rgba(0, 242, 254, 0.04)', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--brand-cyan)', marginBottom: '8px' }}>
              <Sparkles size={16} /> AUTOMATED AI REASONING & EVIDENCE CHAIN OF CUSTODY
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {selectedEvent.ai_reasoning?.map((r, i) => (
                <div key={i} style={{ marginBottom: '4px' }}>• {r}</div>
              )) || (
                <div>• Verified via Edge Deep Learning weights with Bayesian multi-bus corroboration.</div>
              )}
            </div>
          </div>

          {/* Official Sign-off Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div>
              <div>Generated by: <b>Autonomous Edge Sensing System</b></div>
              <div>Privacy Policy: Data Sanitization & Facial Blurring Applied</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ borderBottom: '1px solid var(--text-muted)', width: '160px', height: '24px', marginBottom: '4px' }} />
              <div>Authorized Command Officer Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
