import React, { useState } from 'react';
import { UrbanEvent } from '../types';
import {
  X, CheckCircle, AlertTriangle, ShieldAlert, MapPin, Clock,
  Bus, Camera, Sparkles, FileText, CheckSquare, CornerDownRight
} from 'lucide-react';

interface EventModalProps {
  event: UrbanEvent;
  onClose: () => void;
  onStatusChange?: (eventId: number, newStatus: string) => void;
  onOpenReport?: (event: UrbanEvent) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onStatusChange,
  onOpenReport
}) => {
  const [currentStatus, setCurrentStatus] = useState(event.status);

  const handleAction = (status: string) => {
    setCurrentStatus(status as any);
    if (onStatusChange) {
      onStatusChange(event.id, status);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical': return <span className="badge badge-critical">Critical Hazard</span>;
      case 'high': return <span className="badge badge-high">High Priority</span>;
      case 'medium': return <span className="badge badge-medium">Medium</span>;
      default: return <span className="badge badge-low">Low</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: '20px'
    }}>
      <div className="glass-panel-glow animate-fade-in" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: '6px'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {getSeverityBadge(event.severity)}
          <span className="badge badge-info mono">{event.event_id}</span>
          {event.is_simulated && (
            <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>SIMULATED DEMO</span>
          )}
        </div>

        <h2 style={{ fontSize: '1.35rem', marginBottom: '6px', color: '#fff' }}>
          {event.event_type.replace(/_/g, ' ').toUpperCase()}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          {event.description}
        </p>

        {/* Grid of Telemetry Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confidence</div>
            <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-cyan)' }}>
              {Math.round(event.confidence * 100)}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GPS Geotag</div>
            <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
              {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Observing Bus</div>
            <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Bus #{event.bus_id}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Multi-Bus Cluster</div>
            <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--status-low)' }}>
              {event.observation_count || 1} Sightings
            </div>
          </div>
        </div>

        {/* AI Explainability Card */}
        <div style={{
          backgroundColor: 'rgba(0, 242, 254, 0.04)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--brand-cyan)',
            marginBottom: '10px'
          }}>
            <Sparkles size={16} /> AI EXPLAINABILITY & REASONING AUDIT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {event.ai_reasoning && event.ai_reasoning.length > 0 ? (
              event.ai_reasoning.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                  <CornerDownRight size={14} color="var(--brand-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{r}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Edge model verified feature contours and bounding box consistency across consecutive frames.
              </div>
            )}
          </div>
        </div>

        {/* Visual Evidence Mockup Frame */}
        <div style={{
          position: 'relative',
          height: '180px',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#0a0f1d',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'rgba(0,0,0,0.7)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            color: 'var(--brand-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Camera size={12} /> BUS #{event.bus_id} • CAM_FRONT • 1080p
          </div>

          {/* Synthetic road bounding box overlay */}
          <div style={{
            width: '120px',
            height: '70px',
            border: '2px solid #00f2fe',
            boxShadow: '0 0 10px rgba(0,242,254,0.4)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'flex-start',
            padding: '4px',
            backgroundColor: 'rgba(0,242,254,0.1)'
          }}>
            <span style={{ background: '#00f2fe', color: '#070a13', fontSize: '0.65rem', fontWeight: 800, padding: '1px 3px' }}>
              {event.event_type.toUpperCase()} {Math.round(event.confidence * 100)}%
            </span>
          </div>

          <div style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Privacy Blurred: Citizen faces & bystander plates sanitized at edge
          </div>
        </div>

        {/* Action Buttons & Status Triage */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handleAction('acknowledged')}
              className={currentStatus === 'acknowledged' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              Acknowledge
            </button>
            <button
              onClick={() => handleAction('assigned')}
              className={currentStatus === 'assigned' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              Assign Maintenance
            </button>
            <button
              onClick={() => handleAction('false_positive')}
              className={currentStatus === 'false_positive' ? 'btn-danger' : 'btn-secondary'}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              Mark False Positive
            </button>
          </div>

          {onOpenReport && (
            <button
              onClick={() => onOpenReport(event)}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: 'var(--brand-cyan)', color: 'var(--brand-cyan)' }}
            >
              <FileText size={15} /> Incident Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
