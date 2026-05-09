import { Bell, Check, LayoutGrid, List, Search } from "lucide-react";
import WorkshopCard from "../components/WorkshopCard.tsx";
import useWorkshopList from "../hooks/useWorkshopList.ts";

const imgStudentProfile =
  "https://www.figma.com/api/mcp/asset/065a2bff-6d30-4eb7-9d26-b63b86059f0d";

const WorkshopList = () => {
  const { workshops } = useWorkshopList();

  return (
    <div className="workshop-list-page">
      <header className="workshop-topbar">
        <div className="workshop-topbar-left">
          <div className="workshop-brand">UniHub</div>
          <label className="workshop-search" htmlFor="workshop-search-input">
            <Search className="icon icon-sm" aria-hidden="true" />
            <input
              id="workshop-search-input"
              type="search"
              placeholder="Search workshops..."
            />
          </label>
        </div>
        <nav className="workshop-topbar-nav" aria-label="Workshop navigation">
          <a className="active" href="/workshops">
            Workshops
          </a>
          <a href="/">My Schedule</a>
        </nav>
        <div className="workshop-topbar-actions">
          <button type="button" className="icon-button" aria-label="Alerts">
            <Bell className="icon icon-md" aria-hidden="true" />
          </button>
          <button type="button" className="avatar-button" aria-label="Profile">
            <img src={imgStudentProfile} alt="Student profile" />
          </button>
        </div>
      </header>

      <main className="workshop-layout">
        <aside className="workshop-filters" aria-label="Filters">
          <h2>Filters</h2>
          <div className="filter-group">
            <span className="filter-label">Date</span>
            <div className="filter-options">
              <label className="filter-option selected">
                <span className="selection-dot">
                  <Check className="icon icon-xs" aria-hidden="true" />
                </span>
                <span>Upcoming</span>
              </label>
              <label className="filter-option">
                <span className="selection-dot" />
                <span>This Week</span>
              </label>
              <label className="filter-option">
                <span className="selection-dot" />
                <span>Next Month</span>
              </label>
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Price</span>
            <div className="filter-options">
              <label className="filter-option selected square">
                <span className="selection-square">
                  <Check className="icon icon-xs" aria-hidden="true" />
                </span>
                <span>Free</span>
              </label>
              <label className="filter-option selected square">
                <span className="selection-square">
                  <Check className="icon icon-xs" aria-hidden="true" />
                </span>
                <span>Paid</span>
              </label>
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Availability</span>
            <div className="filter-pill-group">
              <button type="button" className="filter-pill active">
                Open
              </button>
              <button type="button" className="filter-pill">
                Almost Full
              </button>
            </div>
          </div>
        </aside>

        <section className="workshop-grid-section">
          <div className="workshop-grid-header">
            <div>
              <h1>Explore Workshops</h1>
              <p>Discover sessions to enhance your academic journey.</p>
            </div>
            <div className="view-toggle" role="group" aria-label="View toggle">
              <button
                type="button"
                className="toggle-button active"
                aria-label="Grid view"
              >
                <LayoutGrid className="icon icon-sm" aria-hidden="true" />
              </button>
              <button type="button" className="toggle-button" aria-label="List view">
                <List className="icon icon-sm" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="workshop-grid">
            {workshops.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default WorkshopList;
