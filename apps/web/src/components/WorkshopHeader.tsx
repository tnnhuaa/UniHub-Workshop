import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

type WorkshopHeaderTab = "workshops" | "schedule";

type WorkshopHeaderProps = {
  profileImage: string;
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
      <Link className={activeTab === "workshops" ? "active" : undefined} to="/workshops">
        Workshops
      </Link>
      <Link className={activeTab === "schedule" ? "active" : undefined} to="/schedule">
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
        <button type="button" className="icon-button" aria-label="Alerts">
          <Bell className="icon icon-md" aria-hidden="true" />
        </button>
        {profileLink ? (
          <Link className="avatar-button" to={profileLink} aria-label="Profile">
            <img src={profileImage} alt="Student profile" />
          </Link>
        ) : (
          <button type="button" className="avatar-button" aria-label="Profile">
            <img src={profileImage} alt="Student profile" />
          </button>
        )}
      </div>
    </header>
  );
};

export default WorkshopHeader;
