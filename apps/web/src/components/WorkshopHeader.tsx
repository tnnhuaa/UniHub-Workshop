import { Bell, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

type WorkshopHeaderTab = 'workshops' | 'schedule' | 'notifications';

type WorkshopHeaderProps = {
  profileImage?: string;
  activeTab?: WorkshopHeaderTab;
  profileLink?: string;
};

const WorkshopHeader = ({
  profileImage,
  activeTab,
  profileLink,
}: WorkshopHeaderProps) => {
  const nav = (
    <nav className="workshop-topbar-nav" aria-label="Workshop navigation">
      <Link
        className={activeTab === 'workshops' ? 'active' : undefined}
        to="/workshops"
      >
        Workshops
      </Link>
      <Link
        className={activeTab === 'schedule' ? 'active' : undefined}
        to="/schedule"
      >
        My Schedule
      </Link>
    </nav>
  );

  return (
    <header className="workshop-topbar">
      <div className="workshop-topbar-left">
        <div className="workshop-brand">UniHub</div>
      </div>
      {nav}
      <div className="workshop-topbar-actions">
        <Link
          type="button"
          className={`icon-button${activeTab === 'notifications' ? ' active' : ''}`}
          aria-label="Alerts"
          to="/notifications"
        >
          <Bell className="icon icon-md" aria-hidden="true" />
        </Link>
        {profileLink && profileImage ? (
          <Link className="avatar-button" to={profileLink} aria-label="Profile">
            <img src={profileImage} alt="Student profile" />
          </Link>
        ) : (
          <Link
            className="header-login-button"
            to="/sign-in"
            aria-label="Login"
          >
            <LogIn className="icon icon-sm" aria-hidden="true" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default WorkshopHeader;
