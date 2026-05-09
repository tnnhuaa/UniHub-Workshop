import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

type WorkshopHeaderVariant = "list" | "detail";
type WorkshopHeaderNavPlacement = "left" | "center";
type WorkshopHeaderTab = "workshops" | "schedule";

type WorkshopHeaderProps = {
  variant: WorkshopHeaderVariant;
  profileImage: string;
  activeTab?: WorkshopHeaderTab;
  navPlacement?: WorkshopHeaderNavPlacement;
};

const variantClasses: Record<WorkshopHeaderVariant, {
  root: string;
  left: string;
  brand: string;
  nav: string;
  actions: string;
}> = {
  list: {
    root: "workshop-topbar",
    left: "workshop-topbar-left",
    brand: "workshop-brand",
    nav: "workshop-topbar-nav",
    actions: "workshop-topbar-actions",
  },
  detail: {
    root: "workshop-detail-topbar",
    left: "detail-topbar-left",
    brand: "detail-brand",
    nav: "detail-nav",
    actions: "detail-topbar-actions",
  },
};

const WorkshopHeader = ({
  variant,
  profileImage,
  activeTab = "workshops",
  navPlacement = "center",
}: WorkshopHeaderProps) => {
  const classes = variantClasses[variant];
  const nav = (
    <nav className={classes.nav} aria-label="Workshop navigation">
      <Link className={activeTab === "workshops" ? "active" : undefined} to="/workshops">
        Workshops
      </Link>
      <Link className={activeTab === "schedule" ? "active" : undefined} to="/schedule">
        My Schedule
      </Link>
    </nav>
  );

  return (
    <header className={classes.root}>
      <div className={classes.left}>
        <div className={classes.brand}>UniHub</div>
        {navPlacement === "left" ? nav : null}
      </div>
      {navPlacement === "center" ? nav : null}
      <div className={classes.actions}>
        <button type="button" className="icon-button" aria-label="Alerts">
          <Bell className="icon icon-md" aria-hidden="true" />
        </button>
        <button type="button" className="avatar-button" aria-label="Profile">
          <img src={profileImage} alt="Student profile" />
        </button>
      </div>
    </header>
  );
};

export default WorkshopHeader;
