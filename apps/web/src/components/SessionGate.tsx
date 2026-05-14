import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

type SessionGateProps = {
  title: string;
  description: string;
  primaryActionLabel: string;
  primaryActionTo: string;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
};

const SessionGate = ({
  title,
  description,
  primaryActionLabel,
  primaryActionTo,
  secondaryActionLabel = 'Back to workshops',
  secondaryActionTo = '/workshops',
}: SessionGateProps) => {
  return (
    <div className="session-gate-shell">
      <section className="session-gate-panel">
        <header className="session-gate-header">
          <span className="session-gate-kicker">Login required</span>
          <h2 id="session-gate-title">{title}</h2>
          <p>{description}</p>
          <div className="session-gate-actions">
            <Link className="session-gate-button" to={primaryActionTo}>
              <LogIn className="icon icon-sm" aria-hidden="true" />
              <span>{primaryActionLabel}</span>
            </Link>
            <Link className="session-gate-link" to={secondaryActionTo}>
              {secondaryActionLabel}
            </Link>
          </div>
        </header>
      </section>
    </div>
  );
};

export default SessionGate;
