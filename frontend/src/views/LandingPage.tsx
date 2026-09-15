import React from 'react';
import { ArrowRight, Activity, Map, ShieldCheck } from 'lucide-react';
import './LandingPage.css';
interface LandingPageProps {
  onOpenDashboard: (tab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenDashboard }) => (
  <main className="landing-page">
    <section className="landing-hero">
      <div className="landing-copy">
        <div className="landing-kicker">
          <span className="status-dot status-dot-active" /> Urban sensing operations
        </div>
        <h1>See the city in motion.</h1>
        <p>
          A live command center for transit intelligence, road conditions, and safer streets across Hyderabad.
        </p>
        <button className="btn btn-primary" onClick={() => onOpenDashboard('overview')}>
          Open command center <ArrowRight size={16} />
        </button>
      </div>
      <div className="landing-signal" aria-hidden="true">
        <div className="landing-signal-ring landing-signal-ring-large" />
        <div className="landing-signal-ring landing-signal-ring-small" />
        <Activity className="landing-signal-icon" size={38} />
      </div>
    </section>

    <section className="landing-features" aria-label="Platform capabilities">
      <article className="landing-feature">
        <Map size={20} />
        <div><strong>Fleet-aware mapping</strong><span>Track transit movement against city corridors.</span></div>
      </article>
      <article className="landing-feature">
        <ShieldCheck size={20} />
        <div><strong>Actionable alerts</strong><span>Turn edge detections into maintenance decisions.</span></div>
      </article>
    </section>
  </main>
);
