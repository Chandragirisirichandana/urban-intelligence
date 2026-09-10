import React from 'react';
import { Cpu, Camera, Activity, CheckCircle, Database, ShieldCheck, Zap } from 'lucide-react';

export const MlOpsView: React.FC = () => {
  const models = [
    { name: 'Road Defect Detector', version: 'v1.2.0', arch: 'YOLOv8s', dataset: 'RDD2022 (India) + Hyderabad Custom', mAP50: 0.76, status: 'Active on Edge' },
    { name: 'Traffic Vehicle Tracker', version: 'v1.4.1', arch: 'YOLOv8n + ByteTrack', dataset: 'Indian Driving Dataset (IDD) + COCO', mAP50: 0.81, status: 'Active on Edge' },
    { name: 'ANPR & Plate Recognizer', version: 'v1.0.3', arch: 'YOLOv8n + Bilateral OCR', dataset: 'Indian Plates Dataset', mAP50: 0.88, status: 'Active on Edge' },
    { name: 'Pedestrian Risk Classifier', version: 'v1.1.0', arch: 'Contextual Spatial Heuristics', dataset: 'VRU Trajectory Corpus', mAP50: 0.79, status: 'Active on Edge' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>EDGE AI MLOPS & SYSTEM HEALTH MONITORING</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Real-time diagnostics for bus onboard inference devices, camera sensors, local queue buffers, and model versioning
        </p>
      </div>

      {/* MLOps Key Metric Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>FLEET COMPUTE UNITS</div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-low)' }}>10 / 10</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>NVIDIA Jetson Orin Edge Nodes</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>AVERAGE INFERENCE RATE</div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-cyan)' }}>21.6 FPS</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Real-time 1080p Processing</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>BANDWIDTH SAVINGS</div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>98.4%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-low)', marginTop: '4px' }}>Edge Metadata vs Raw Video</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>LOCAL OFFLINE QUEUE</div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-low)' }}>0 Backlog</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>All Edge Buffers Synchronized</div>
        </div>
      </div>

      {/* Models Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.92rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} color="var(--brand-cyan)" /> ACTIVE EDGE AI MODELS IN PRODUCTION
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px' }}>MODEL NAME</th>
              <th style={{ padding: '12px 16px' }}>VERSION</th>
              <th style={{ padding: '12px 16px' }}>ARCHITECTURE</th>
              <th style={{ padding: '12px 16px' }}>DATASET SOURCE</th>
              <th style={{ padding: '12px 16px' }}>mAP @ 0.50</th>
              <th style={{ padding: '12px 16px' }}>DEPLOYMENT STATUS</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => (
              <tr
                key={i}
                style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>{m.name}</td>
                <td style={{ padding: '12px 16px' }}><span className="mono">{m.version}</span></td>
                <td style={{ padding: '12px 16px', color: 'var(--text-highlight)' }}>{m.arch}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{m.dataset}</td>
                <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontWeight: 700, color: 'var(--status-low)' }}>{m.mAP50}</span></td>
                <td style={{ padding: '12px 16px' }}><span className="badge badge-low">{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
