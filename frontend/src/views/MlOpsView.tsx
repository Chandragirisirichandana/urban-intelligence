import React from 'react';
import { Cpu } from 'lucide-react';

export const MlOpsView: React.FC = () => {
  const models = [
    { name: 'Road Defect Detector', version: 'v1.2.0', arch: 'YOLOv8s', dataset: 'RDD2022 (India) + Hyderabad Custom', mAP50: 0.76, status: 'Active on Edge' },
    { name: 'Traffic Vehicle Tracker', version: 'v1.4.1', arch: 'YOLOv8n + ByteTrack', dataset: 'Indian Driving Dataset (IDD) + COCO', mAP50: 0.81, status: 'Active on Edge' },
    { name: 'ANPR & Plate Recognizer', version: 'v1.0.3', arch: 'YOLOv8n + Bilateral OCR', dataset: 'Indian Plates Dataset', mAP50: 0.88, status: 'Active on Edge' },
    { name: 'Pedestrian Risk Classifier', version: 'v1.1.0', arch: 'Spatial Heuristics', dataset: 'VRU Trajectory Corpus', mAP50: 0.79, status: 'Active on Edge' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="heading-md" style={{ marginBottom: '4px' }}>Edge AI MLOps & System Health Diagnostics</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Real-time diagnostics for bus onboard inference devices, camera sensors, local queue buffers, and model versioning.
        </p>
      </div>

      {/* MLOps Key Metric Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>FLEET COMPUTE UNITS</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>10 / 10</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Onboard Edge Nodes Streaming</div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>AVERAGE INFERENCE RATE</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-text)' }}>22.0 FPS</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Real-time 1080p Processing (Demo)</div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>BANDWIDTH SAVINGS</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>98.4%</div>
          <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '4px' }}>Metadata vs Raw Video Stream</div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>LOCAL OFFLINE BUFFER</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>0 Backlog</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>All SQLite Edge Queues Synced</div>
        </div>
      </div>

      {/* Models Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--accent-text)" />
            <span>Active Edge AI Models in Production</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Validation metrics from offline benchmark tests</span>
        </div>

        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Model Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Version</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Architecture</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Training Corpus</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>mAP @ 0.50</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Deployment Status</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <tr
                  key={i}
                  className="clickable-row"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                  <td style={{ padding: '14px 16px' }}><span className="mono">{m.version}</span></td>
                  <td style={{ padding: '14px 16px', color: 'var(--accent-text)' }}>{m.arch}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{m.dataset}</td>
                  <td style={{ padding: '14px 16px' }}><span className="mono" style={{ fontWeight: 600, color: '#22c55e' }}>{m.mAP50}</span></td>
                  <td style={{ padding: '14px 16px' }}><span className="badge badge-low">{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default MlOpsView;
