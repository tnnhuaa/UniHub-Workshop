const imgAdminAvatar = "http://localhost:3845/assets/b4953046acec56080827af80f9f7729917d46a90.png";

const kpis = [
  {
    label: "Total Workshops",
    value: "142",
    trend: "12%",
    trendType: "up",
    icon: "fa-chalkboard-user",
    accent: "kpi-accent-blue",
  },
  {
    label: "Registrations",
    value: "3,845",
    trend: "8%",
    trendType: "up",
    icon: "fa-users",
    accent: "kpi-accent-green",
  },
  {
    label: "Gross Revenue",
    value: "$24.5k",
    trend: "2%",
    trendType: "down",
    icon: "fa-wallet",
    accent: "kpi-accent-gray",
  },
];

const workshops = [
  {
    title: "Advanced Data Analytics",
    titleLines: ["Advanced Data", "Analytics"],
    date: "Oct 12, 2023",
    enrolled: "45 / 50",
    status: "open",
  },
  {
    title: "Intro to Quantum Computing",
    titleLines: ["Intro to Quantum", "Computing"],
    date: "Oct 15, 2023",
    enrolled: "30 / 30",
    status: "full",
  },
  {
    title: "Cybersecurity Fundamentals",
    titleLines: ["Cybersecurity", "Fundamentals"],
    date: "Oct 18, 2023",
    enrolled: "0 / 40",
    status: "cancelled",
  },
  {
    title: "Design Systems at Scale",
    titleLines: ["Design Systems at", "Scale"],
    date: "Oct 22, 2023",
    enrolled: "12 / 25",
    status: "open",
  },
];

const AdminDashboard = () => {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-brand">
            <div className="admin-avatar">
              <img src={imgAdminAvatar} alt="Admin profile" />
            </div>
            <div>
              <h2>Admin Panel</h2>
              <p>Workshop Management</p>
            </div>
          </div>
          <nav className="admin-nav">
            <button className="admin-nav-item admin-nav-item--active">
              <i className="fa-solid fa-chart-line" aria-hidden="true" />
              Dashboard
            </button>
            <button className="admin-nav-item">
              <i className="fa-solid fa-calendar-days" aria-hidden="true" />
              Workshops
            </button>
          </nav>
        </div>
        <div className="admin-nav admin-nav--footer">
          <button className="admin-nav-item">
            <i className="fa-solid fa-gear" aria-hidden="true" />
            Settings
          </button>
          <button className="admin-nav-item">
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Overview</h1>
            <p>Manage active workshops and monitor system health.</p>
          </div>
          <button className="admin-primary-button" type="button">
            <i className="fa-solid fa-plus" aria-hidden="true" />
            New Workshop
          </button>
        </header>

        <section className="admin-grid">
          <div className="admin-left">
            <div className="admin-kpi-grid">
              {kpis.map((kpi) => (
                <article className="admin-kpi-card" key={kpi.label}>
                  <div className="admin-kpi-header">
                    <span>{kpi.label}</span>
                    <div className={`admin-kpi-icon ${kpi.accent}`}>
                      <i className={`fa-solid ${kpi.icon}`} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="admin-kpi-value">
                    <h3>{kpi.value}</h3>
                    <div
                      className={`admin-kpi-trend admin-kpi-trend--${kpi.trendType}`}
                    >
                      <i
                        className={`fa-solid ${
                          kpi.trendType === "up"
                            ? "fa-arrow-trend-up"
                            : "fa-arrow-trend-down"
                        }`}
                        aria-hidden="true"
                      />
                      {kpi.trend}
                    </div>
                  </div>
                  {kpi.label === "Total Workshops" ? (
                    <div className="admin-kpi-glow" aria-hidden="true" />
                  ) : null}
                </article>
              ))}
            </div>

            <section className="admin-table-card">
              <div className="admin-table-toolbar">
                <h2>Active Workshops</h2>
                <div className="admin-table-actions">
                  <div className="admin-search">
                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                    <input
                      type="search"
                      placeholder="Search workshops..."
                      aria-label="Search workshops"
                    />
                  </div>
                  <button className="admin-icon-button" type="button">
                    <i className="fa-solid fa-sliders" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="admin-table">
                <div className="admin-table-header">
                  <span>Workshop Title</span>
                  <span>Date</span>
                  <span>Enrolled</span>
                  <span>Status</span>
                  <span className="admin-table-actions-cell">Actions</span>
                </div>
                {workshops.map((workshop) => (
                  <div className="admin-table-row" key={workshop.title}>
                    <div className="admin-table-title">
                      {workshop.titleLines.map((line) => (
                        <span key={`${workshop.title}-${line}`}>{line}</span>
                      ))}
                    </div>
                    <span>{workshop.date}</span>
                    <span>{workshop.enrolled}</span>
                    <span
                      className={`badge badge--${workshop.status}`}
                      aria-label={`Status ${workshop.status}`}
                    >
                      {workshop.status.charAt(0).toUpperCase() +
                        workshop.status.slice(1)}
                    </span>
                    <div className="admin-row-actions">
                      <button type="button" aria-label="Edit">
                        <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                      </button>
                      <button type="button" aria-label="View">
                        <i className="fa-solid fa-eye" aria-hidden="true" />
                      </button>
                      <button type="button" aria-label="More">
                        <i className="fa-solid fa-ellipsis" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="admin-panel">
            <div className="admin-panel-header">
              <i className="fa-solid fa-heart-pulse" aria-hidden="true" />
              <h2>System Health</h2>
            </div>
            <div className="admin-panel-section">
              <h3>CSV Sync Jobs</h3>
              <div className="admin-job-card admin-job-card--failed">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
                <div>
                  <strong>Student_Roster_Q3.csv</strong>
                  <p>Failed at row 42</p>
                  <p>(Invalid format)</p>
                </div>
                <span className="admin-job-pill admin-job-pill--failed">
                  Sync Failed
                </span>
              </div>
              <div className="admin-job-card admin-job-card--pending">
                <i className="fa-solid fa-clock" aria-hidden="true" />
                <div>
                  <strong>Workshop_Catalog_Update.csv</strong>
                  <p>Queued 2 mins ago</p>
                </div>
                <span className="admin-job-pill admin-job-pill--pending">
                  Sync Pending
                </span>
              </div>
            </div>
            <div className="admin-panel-section">
              <h3>AI Processing</h3>
              <div className="admin-ai-row">
                <div>
                  <div className="admin-ai-icon admin-ai-icon--blue">
                    <i className="fa-solid fa-file-lines" aria-hidden="true" />
                  </div>
                  <div>
                    <strong>Description Generation</strong>
                    <p>Running for 3 items</p>
                  </div>
                </div>
                <div className="admin-progress">
                  <span className="admin-progress-bar" />
                </div>
              </div>
              <div className="admin-ai-row">
                <div>
                  <div className="admin-ai-icon admin-ai-icon--gray">
                    <i className="fa-solid fa-calendar-check" aria-hidden="true" />
                  </div>
                  <div>
                    <strong>Schedule Optimization</strong>
                    <p>Completed (12m ago)</p>
                  </div>
                </div>
                <i className="fa-solid fa-circle-check admin-ai-check" aria-hidden="true" />
              </div>
            </div>
            <button className="admin-secondary-button" type="button">
              View All System Logs
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
