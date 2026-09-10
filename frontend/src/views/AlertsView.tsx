import React from 'react';
import { Alert } from '../types';
import { Bell, ShieldAlert, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AlertsViewProps {
  alerts: Alert[];
  onAcknowledgeAlert?: (id: number) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>CENTRAL ALERT & DISPATCH MANAGEMENT CENTER</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Triage, acknowledge, and assign critical road safety, defect, and incident alerts with full audit trail
          </p>
        </div>
        <span className="badge badge-critical">{alerts.length} Active System Alerts</span>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px' }}>SEVERITY</th>
              <th style={{ padding: '12px 16px' }}>ALERT ID</th>
              <th style={{ padding: '12px 16px' }}>TITLE & DESCRIPTION</th>
              <th style={{ padding: '12px 16px' }}>TIMESTAMP</th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
              <th style={{ padding: '12px 16px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alt) => (
              <tr
                key={alt.id}
                style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${
                    alt.category === 'critical' ? 'badge-critical' : alt.category === 'high' ? 'badge-high' : 'badge-medium'
                  }`}>
                    {alt.category}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="mono" style={{ fontWeight: 700, color: 'var(--text-highlight)' }}>{alt.alert_id}</span>
                </td>
                <td style={{ padding: '12px 16px', maxWidth: '380px' }}>
                  <div style={{ fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{alt.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{alt.description}</div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  <div className="mono" style={{ fontSize: '0.75rem' }}>
                    {new Date(alt.created_at).toLocaleTimeString()}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    {alt.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                      Acknowledge
                    </button>
                    <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '4px 8px', color: 'var(--status-low)' }}>
                      Resolve
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
