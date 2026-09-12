import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldAlert, Cpu, Sparkles,
  RefreshCw, MapPin, CheckCircle, AlertTriangle, Menu
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAlertsCount: number;
  activeBusesCount: number;
  onTriggerDemo: (scenarioIdx: number) => void;
  onGoLanding?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeAlertsCount,
  activeBusesCount,
  onTriggerDemo,
  onGoLanding,
  onToggleMobileSidebar
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
    setDemoStatus(`Scenario Triggered: ${name}`);
    setTimeout(() => setDemoStatus(null), 4000);
  };

  return (
    <header
      style={{
        margin: '12px 16px',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        position: 'sticky',
        top: '12px',
        zIndex: 1000,
        backgroundColor: 'rgba(17, 17, 19, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Brand, Hamburger & City Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="btn btn-ghost"
            style={{ padding: '6px', borderRadius: '6px', display: 'none' }}
            id="mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div
          onClick={onGoLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: onGoLanding ? 'pointer' : 'default',
          }}
          title={onGoLanding ? 'Return to Landing Page' : undefined}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(37, 99, 235, 0.4)',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Urban Intelligence
              </span>
              <span className="badge badge-accent" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>SIH26124</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="var(--accent-text)" /> Hyderabad Central Corridor
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#22c55e' }}>
                <span className="status-dot status-dot-active" style={{ width: '6px', height: '6px' }} /> Edge Sensing Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Ticker (Hidden on Mobile) */}
      <div
        className="hide-mobile"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} color="var(--accent-text)" />
          <span style={{ color: 'var(--text-muted)' }}>Buses:</span>
          <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeBusesCount}</span>
        </div>

        <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={14} color="#22c55e" />
          <span style={{ color: 'var(--text-muted)' }}>Edge AI:</span>
          <span className="mono" style={{ fontWeight: 600, color: '#22c55e' }}>22.0 FPS</span>
        </div>

        <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={14} color={activeAlertsCount > 0 ? 'var(--severity-critical)' : 'var(--text-muted)'} />
          <span style={{ color: 'var(--text-muted)' }}>Critical Alerts:</span>
          <span
            className="mono"
            style={{
              fontWeight: 700,
              color: activeAlertsCount > 0 ? 'var(--severity-critical)' : 'var(--text-primary)',
            }}
          >
            {activeAlertsCount}
          </span>
        </div>

        <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />

        <div className="mono" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>
          {currentTime}
        </div>
      </div>

      {/* Actions: Landing Page link & Demo Scenarios Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
        {demoStatus && (
          <div className="badge badge-low animate-fade-in hide-mobile" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} /> {demoStatus}
          </div>
        )}

        {onGoLanding && (
          <button
            onClick={onGoLanding}
            className="btn btn-secondary hide-mobile"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            Landing Page
          </button>
        )}

        <button
          className="btn btn-primary"
          onClick={() => setShowDemoMenu(!showDemoMenu)}
          style={{ fontSize: '0.78rem', padding: '7px 12px', gap: '6px' }}
          aria-expanded={showDemoMenu}
          aria-haspopup="true"
        >
          <Sparkles size={14} />
          <span>Demo Scenarios</span>
        </button>

        {showDemoMenu && (
          <div
            className="panel-elevated"
            style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              width: '330px',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 2000,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SIH Evaluation Scenarios
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Trigger Live Event</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { idx: 0, title: 'Bus 12 → Road Pothole Detected', icon: <AlertTriangle size={13} color="var(--severity-high)" />, tag: 'Road Defect' },
                { idx: 1, title: 'Bus 7 → Spatial Deduplication', icon: <RefreshCw size={13} color="var(--accent-text)" />, tag: 'Multi-Bus' },
                { idx: 2, title: 'Bus 7 → Mehdipatnam Congestion', icon: <Activity size={13} color="var(--severity-high)" />, tag: 'Mobility' },
                { idx: 3, title: 'Bus 8 → Severe Waterlogging', icon: <ShieldAlert size={13} color="var(--severity-critical)" />, tag: 'Flood Hazard' },
                { idx: 4, title: 'Bus 4 → School Pedestrian Risk', icon: <AlertTriangle size={13} color="var(--severity-high)" />, tag: 'Safety' },
                { idx: 5, title: 'Bus 11 → Hit-and-Run ANPR Extraction', icon: <ShieldAlert size={13} color="var(--severity-critical)" />, tag: 'Law Enforce' },
              ].map((s) => (
                <button
                  key={s.idx}
                  onClick={() => handleDemoClick(s.idx, s.title)}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s.icon}
                    <span>{s.title}</span>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>{s.tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
