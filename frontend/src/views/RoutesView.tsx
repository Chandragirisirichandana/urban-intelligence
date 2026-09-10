import React from 'react';
import { Route as RouteType } from '../types';
import { Route as RouteIcon, Clock, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface RoutesViewProps {
  routes: RouteType[];
}

export const RoutesView: React.FC<RoutesViewProps> = ({ routes }) => {
  const routeDelays = [
    { route: 'R1: Secunderabad - Charminar', expectedMin: 45, actualMin: 47, delayMin: 2, congestionPct: 41, status: 'Normal' },
    { route: 'R2: Miyapur - LB Nagar', expectedMin: 75, actualMin: 79, delayMin: 4, congestionPct: 18, status: 'Normal' },
    { route: 'R3: Kukatpally - Dilsukhnagar', expectedMin: 55, actualMin: 67, delayMin: 12, congestionPct: 52, status: 'Moderate Delay' },
    { route: 'R4: ECIL - Mehdipatnam', expectedMin: 60, actualMin: 78, delayMin: 18, congestionPct: 54, status: 'High Delay' },
    { route: 'R5: Uppal - Tolichowki', expectedMin: 65, actualMin: 74, delayMin: 9, congestionPct: 61, status: 'Moderate Delay' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>TRANSIT ROUTE PROGRESS & DELAY ESTIMATION</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Real-time comparison between scheduled timetable progress and observed GPS fleet telemetry
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px' }}>CORRIDOR ROUTE</th>
              <th style={{ padding: '12px 16px' }}>SCHEDULED DURATION</th>
              <th style={{ padding: '12px 16px' }}>OBSERVED RUNTIME</th>
              <th style={{ padding: '12px 16px' }}>ESTIMATED DELAY</th>
              <th style={{ padding: '12px 16px' }}>CONGESTION FACTOR</th>
              <th style={{ padding: '12px 16px' }}>SERVICE STATUS</th>
            </tr>
          </thead>
          <tbody>
            {routeDelays.map((rd, i) => (
              <tr
                key={i}
                style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>
                  {rd.route}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="mono">{rd.expectedMin} min</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="mono" style={{ fontWeight: 700, color: rd.delayMin > 10 ? 'var(--status-critical)' : 'var(--text-primary)' }}>
                    {rd.actualMin} min
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="mono" style={{
                    fontWeight: 800,
                    color: rd.delayMin > 10 ? 'var(--status-critical)' : rd.delayMin > 5 ? 'var(--status-medium)' : 'var(--status-low)'
                  }}>
                    +{rd.delayMin} min
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${rd.congestionPct}%`, height: '100%', background: 'var(--brand-cyan)' }} />
                    </div>
                    <span className="mono">{rd.congestionPct}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${
                    rd.status.includes('High') ? 'badge-critical' : rd.status.includes('Moderate') ? 'badge-medium' : 'badge-low'
                  }`}>
                    {rd.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
