import React from 'react';
import { RoadSegment, UrbanEvent, MaintenanceItem } from '../types';
import { AlertOctagon, Wrench, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface RoadViewProps {
  roadSegments: RoadSegment[];
  events: UrbanEvent[];
  maintenanceQueue: MaintenanceItem[];
  onSelectEvent: (event: UrbanEvent) => void;
}

export const RoadView: React.FC<RoadViewProps> = ({
  roadSegments,
  events,
  maintenanceQueue,
  onSelectEvent
}) => {
  const defectEvents = events.filter(e =>
    ['pothole', 'crack', 'damaged_road', 'waterlogging', 'damaged_divider', 'missing_sign'].includes(e.event_type)
  );

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'good': return 'var(--status-low)';
      case 'fair': return 'var(--status-medium)';
      case 'poor': return 'var(--status-high)';
      case 'critical': return 'var(--status-critical)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>ROAD CONDITION & INFRASTRUCTURE DEFICIENCY INTELLIGENCE</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Continuous mobile sensing of road surface quality, structural cracks, potholes, and prioritized repair queues
        </p>
      </div>

      {/* Road Condition Score Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {roadSegments.map((segment) => (
          <div key={segment.id} className="glass-panel" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{segment.segment_code}</span>
              <span className="badge" style={{
                backgroundColor: `rgba(${segment.condition === 'critical' ? '239,68,68' : segment.condition === 'poor' ? '249,115,22' : segment.condition === 'fair' ? '245,158,11' : '16,185,129'}, 0.15)`,
                color: getConditionColor(segment.condition),
                border: `1px solid ${getConditionColor(segment.condition)}`
              }}>
                {segment.condition.toUpperCase()}
              </span>
            </div>

            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem', marginBottom: '10px' }}>
              {segment.road_name}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Health Score:</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: '1.2rem', color: getConditionColor(segment.condition) }}>
                {segment.condition_score}/100
              </span>
            </div>

            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ width: `${segment.condition_score}%`, height: '100%', background: getConditionColor(segment.condition) }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>Defects: <b>{segment.defect_count}</b></span>
              <span>Bus Passes: <b>{segment.observation_count}</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column: Active Road Defect Clusters + Prioritized Maintenance Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Left: Defect Detections with Cluster Deduplication */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={16} color="var(--brand-cyan)" /> DETECTED ROAD DEFECTS (SPATIALLY DEDUPLICATED)
            </h3>
            <span className="badge badge-info">{defectEvents.length} Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {defectEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: evt.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-high)', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                      {evt.event_type.replace('_', ' ')}
                    </span>
                    <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>
                      <RefreshCw size={11} /> {evt.observation_count || 1} Bus Observations
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {evt.description}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Geotag: {evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontWeight: 800, color: 'var(--brand-cyan)', fontSize: '1.1rem' }}>
                    {Math.round(evt.confidence * 100)}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aggregate Conf</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Prioritized Maintenance Repair Queue */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={16} color="var(--status-low)" /> MUNICIPAL MAINTENANCE QUEUE
            </h3>
            <span className="badge badge-low">{maintenanceQueue.length} Work Orders</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {maintenanceQueue.map((item) => (
              <div key={item.id} style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>{item.title}</span>
                  <span className="mono" style={{
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: item.priority_score > 85 ? 'var(--status-critical)' : 'var(--status-medium)'
                  }}>
                    Priority: {Math.round(item.priority_score)}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {item.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>Status: <b style={{ color: 'var(--brand-cyan)', textTransform: 'uppercase' }}>{item.status}</b></span>
                  <span>Observation Count: <b>{item.observation_count}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
