import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldAlert, Cpu, Radio, Sparkles, Bell,
  RefreshCw, MapPin, CheckCircle, AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAlertsCount: number;
  activeBusesCount: number;
  onTriggerDemo: (scenarioIdx: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeAlertsCount,
  activeBusesCount,
  onTriggerDemo
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showDemoMenu, setShowDemoMenu] = useState<boolean>(false);
  const [demoStatus, setDemoStatus] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDemoClick = (idx: number, name: string) => {
    onTriggerDemo(idx);
    setShowDemoMenu(false);
    setDemoStatus(`Triggered: ${name}`);
    setTimeout(() => setDemoStatus(null), 4000);
  };

  return (
    <header className="glass-panel" style={{
      margin: '12px 16px',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      position: 'sticky',
      top: '12px',
      zIndex: 1000
    }}>
      {/* Brand & City Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
        }}>
          <Radio size={22} color="#070a13" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              URBAN INTELLIGENCE
            </h1>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>SIH 2024 EDITION</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="var(--brand-cyan)" /> Hyderabad Smart City Core
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-low)' }}>
              <span className="status-dot status-dot-active" /> Edge Fleet Online
            </span>
          </div>
        </div>
      </div>

      {/* Live System Telemetry Ticker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '6px 16px',
        borderRadius: '30px',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={15} color="var(--brand-cyan)" />
          <span style={{ color: 'var(--text-muted)' }}>Buses Sensing:</span>
          <span className="mono" style={{ fontWeight: 700, color: '#fff' }}>{activeBusesCount}</span>
        </div>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={15} color="var(--status-low)" />
          <span style={{ color: 'var(--text-muted)' }}>Edge AI:</span>
          <span className="mono" style={{ fontWeight: 700, color: 'var(--status-low)' }}>21.6 FPS</span>
        </div>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={15} color={activeAlertsCount > 0 ? 'var(--status-critical)' : 'var(--text-muted)'} />
          <span style={{ color: 'var(--text-muted)' }}>Critical Alerts:</span>
          <span className="mono" style={{
            fontWeight: 700,
            color: activeAlertsCount > 0 ? 'var(--status-critical)' : 'var(--text-primary)'
          }}>
            {activeAlertsCount}
          </span>
        </div>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

        <div className="mono" style={{ color: 'var(--text-highlight)', fontWeight: 600 }}>
          {currentTime}
        </div>
      </div>

      {/* Demo Mode Button & Quick Action Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
        {demoStatus && (
          <div className="badge badge-info animate-fade-in" style={{ fontSize: '0.72rem' }}>
            <CheckCircle size={13} /> {demoStatus}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={() => setShowDemoMenu(!showDemoMenu)}
          style={{ fontSize: '0.8rem', padding: '7px 14px' }}
        >
          <Sparkles size={15} />
          <span>DEMO SCENARIOS</span>
        </button>

        {showDemoMenu && (
          <div className="glass-panel" style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '320px',
            padding: '12px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--brand-cyan)',
            zIndex: 2000
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '8px', textTransform: 'uppercase' }}>
              SIH Evaluation Demo Scenarios
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={() => handleDemoClick(0, 'Pothole Sighting')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem', padding: '8px 10px' }}
              >
                <AlertTriangle size={14} color="var(--status-high)" /> 1. Bus 12 → Road Pothole Detected
              </button>
              <button
                onClick={() => handleDemoClick(1, 'Spatial Deduplication')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem', padding: '8px 10px' }}
              >
                <RefreshCw size={14} color="var(--brand-cyan)" /> 2. Bus 7 → Deduplication & Confidence Up
              </button>
              <button
                onClick={() => handleDemoClick(2, 'Mehdipatnam Congestion')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem', padding: '8px 10px' }}
              >
                <Activity size={14} color="var(--status-medium)" /> 3. Bus 7 → Traffic Congestion Bottleneck
              </button>
              <button
                onClick={() => handleDemoClick(3, 'Monsoon Waterlogging')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem', padding: '8px 10px' }}
              >
                <ShieldAlert size={14} color="var(--status-critical)" /> 4. Bus 8 → Severe Waterlogging
              </button>
              <button
                onClick={() => handleDemoClick(4, 'School Zone Pedestrian Hazard')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem', padding: '8px 10px' }}
              >
                <AlertTriangle size={14} color="var(--status-high)" /> 5. Bus 4 → School Pedestrian Risk
              </button>
              <button
                onClick={() => handleDemoClick(5, 'Hit-and-Run ANPR Extraction')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.78rem', padding: '8px 10px' }}
              >
                <ShieldAlert size={14} color="var(--status-critical)" /> 6. Bus 11 → Rash Drive & ANPR Plate
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
