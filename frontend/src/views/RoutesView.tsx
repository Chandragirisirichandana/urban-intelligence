import React from 'react';
import { Route as RouteType } from '../types';

interface RoutesViewProps {
  routes: RouteType[];
}

export const RoutesView: React.FC<RoutesViewProps> = () => {
  const routeDelays = [
    { route: 'R1: Secunderabad - Charminar', expectedMin: 45, actualMin: 47, delayMin: 2, congestionPct: 41, status: 'Normal', sev: 'low' },
    { route: 'R2: Miyapur - LB Nagar', expectedMin: 75, actualMin: 79, delayMin: 4, congestionPct: 18, status: 'Normal', sev: 'low' },
    { route: 'R3: Kukatpally - Dilsukhnagar', expectedMin: 55, actualMin: 67, delayMin: 12, congestionPct: 52, status: 'Moderate Delay', sev: 'medium' },
    { route: 'R4: ECIL - Mehdipatnam', expectedMin: 60, actualMin: 78, delayMin: 18, congestionPct: 54, status: 'High Delay', sev: 'critical' },
    { route: 'R5: Uppal - Tolichowki', expectedMin: 65, actualMin: 74, delayMin: 9, congestionPct: 61, status: 'Moderate Delay', sev: 'medium' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="heading-md" style={{ marginBottom: '4px' }}>Transit Route Progress & Delay Estimation</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Real-time comparison between scheduled timetable progress and observed GPS fleet telemetry. (Estimated from demo simulation).
        </p>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Transit Corridor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Scheduled Duration</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Observed Runtime</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Estimated Delay</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Congestion Factor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Service Status</th>
              </tr>
            </thead>
            <tbody>
              {routeDelays.map((rd, i) => (
                <tr
                  key={i}
                  className="clickable-row"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {rd.route}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono">{rd.expectedMin} min</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontWeight: 600, color: rd.delayMin > 10 ? 'var(--severity-critical)' : 'var(--text-primary)' }}>
                      {rd.actualMin} min
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      className="mono"
                      style={{
                        fontWeight: 700,
                        color: rd.delayMin > 10 ? 'var(--severity-critical)' : rd.delayMin > 5 ? 'var(--severity-high)' : '#22c55e',
                      }}
                    >
                      +{rd.delayMin} min
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${rd.congestionPct}%`, height: '100%', background: 'var(--accent)' }} />
                      </div>
                      <span className="mono">{rd.congestionPct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge badge-${rd.sev}`}>
                      {rd.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default RoutesView;
