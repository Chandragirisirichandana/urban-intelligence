import React from 'react';
import {
  LayoutDashboard, Map, Bus, AlertOctagon, Car, Users,
  Camera, FileText, Cpu, Bell, Route
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  alertsCount
}) => {
  const menuItems = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'live-map', label: 'Live GIS Map', icon: Map },
    { id: 'fleet', label: 'Bus Fleet', icon: Bus },
    { id: 'roads', label: 'Road Condition', icon: AlertOctagon },
    { id: 'traffic', label: 'Traffic & Flow', icon: Car },
    { id: 'safety', label: 'Pedestrian Safety', icon: Users },
    { id: 'incidents', label: 'Incidents & ANPR', icon: Camera },
    { id: 'alerts', label: 'Alerts Center', icon: Bell, badge: alertsCount },
    { id: 'routes', label: 'Route Delays', icon: Route },
    { id: 'reports', label: 'Incident Reports', icon: FileText },
    { id: 'mlops', label: 'AI Model Health', icon: Cpu },
  ];

  return (
    <aside className="glass-panel" style={{
      width: '230px',
      margin: '0 0 16px 16px',
      padding: '16px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      height: 'calc(100vh - 100px)',
      position: 'sticky',
      top: '84px',
      flexShrink: 0
    }}>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        padding: '6px 12px 10px 12px'
      }}>
        Operations Modules
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 242, 254, 0.35)' : '1px solid transparent',
                transition: 'all 0.18s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? 'var(--brand-cyan)' : 'currentColor'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="badge badge-critical" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Edge System Health Footer */}
      <div style={{
        marginTop: 'auto',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Fleet Ingestion</span>
          <span style={{ color: 'var(--status-low)', fontWeight: 700 }}>60 Cams Active</span>
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          borderRadius: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '94%',
            height: '100%',
            backgroundColor: 'var(--status-low)',
            borderRadius: '2px'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>Bandwidth Saved</span>
          <span className="mono" style={{ color: 'var(--brand-cyan)' }}>98.4%</span>
        </div>
      </div>
    </aside>
  );
};
