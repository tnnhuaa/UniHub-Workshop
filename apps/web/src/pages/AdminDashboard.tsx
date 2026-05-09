import AdminSidebar from "../components/AdminSidebar.tsx";

const imgNewWorkshop =
  "https://www.figma.com/api/mcp/asset/1c3b467b-1867-4898-8ec4-83dffde5d81d";
const imgKpiWorkshops =
  "https://www.figma.com/api/mcp/asset/e37d5346-d57c-46b7-9647-6408c9aeecfc";
const imgKpiRegistrations =
  "https://www.figma.com/api/mcp/asset/f7d6772e-df2f-4691-842e-bbd919fe3fc3";
const imgKpiRevenue =
  "https://www.figma.com/api/mcp/asset/146d85ff-8453-4021-a05a-10f0eff1956d";
const imgTrendUp =
  "https://www.figma.com/api/mcp/asset/7844c768-4798-4fbc-9c7d-36747b0d058f";
const imgTrendDown =
  "https://www.figma.com/api/mcp/asset/1d8ebd96-b816-481d-9e8d-8c808b384ad6";
const imgSearch =
  "https://www.figma.com/api/mcp/asset/637616ad-aaa3-43fd-96fd-1f03ae58b88c";
const imgFilter =
  "https://www.figma.com/api/mcp/asset/0d80eeb8-22a3-46f3-b9eb-24d3be3c75ff";
const imgActionOpen =
  "https://www.figma.com/api/mcp/asset/9dccb94a-b415-474b-8fea-b2a93810b36c";
const imgActionEdit =
  "https://www.figma.com/api/mcp/asset/e04d9ab0-18f6-41f6-9cc3-88616dcabdd0";
const imgActionDelete =
  "https://www.figma.com/api/mcp/asset/107b852e-134f-4a99-9c6f-27c3726592c9";
const imgSystemHealth =
  "https://www.figma.com/api/mcp/asset/db6cf4a4-c436-47a6-b528-58e93275b0a6";
const imgJobFailed =
  "https://www.figma.com/api/mcp/asset/85795ce2-9a08-42e2-b83c-adfa1e08d7ed";
const imgJobPending =
  "https://www.figma.com/api/mcp/asset/9313d707-6643-4ed6-b6a9-ddcaa33345c3";
const imgAiDescription =
  "https://www.figma.com/api/mcp/asset/42b80789-2465-4f91-81dd-d5596dd8f5f5";
const imgAiOptimization =
  "https://www.figma.com/api/mcp/asset/ea93dad6-6c5e-4dee-850b-2ff14b192819";
const imgAiDone =
  "https://www.figma.com/api/mcp/asset/284ef3fe-cc12-4bc9-8b67-31ab681d3a57";

const kpiCards = [
  {
    label: "TOTAL WORKSHOPS",
    value: "142",
    trend: "12%",
    trendTone: "up",
    icon: imgKpiWorkshops,
    iconTone: "blue",
  },
  {
    label: "REGISTRATIONS",
    value: "3,845",
    trend: "8%",
    trendTone: "up",
    icon: imgKpiRegistrations,
    iconTone: "green",
  },
  {
    label: "GROSS REVENUE",
    value: "$24.5k",
    trend: "2%",
    trendTone: "down",
    icon: imgKpiRevenue,
    iconTone: "neutral",
  },
];

const workshops = [
  {
    title: "Advanced Data Analytics",
    date: "Oct 12,\n2023",
    enrolled: "45 / 50",
    status: "Open",
    statusTone: "open",
  },
  {
    title: "Intro to Quantum Computing",
    date: "Oct 15,\n2023",
    enrolled: "30 / 30",
    status: "Full",
    statusTone: "full",
  },
  {
    title: "Cybersecurity Fundamentals",
    date: "Oct 18,\n2023",
    enrolled: "0 / 40",
    status: "Cancelled",
    statusTone: "cancelled",
  },
  {
    title: "Design Systems at Scale",
    date: "Oct 22,\n2023",
    enrolled: "12 / 25",
    status: "Open",
    statusTone: "open",
  },
];

const AdminDashboard = () => {
  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Overview</h1>
            <p>Manage active workshops and monitor system health.</p>
          </div>

          <button type="button" className="admin-primary-button">
            <img src={imgNewWorkshop} alt="" aria-hidden="true" />
            <span>New Workshop</span>
          </button>
        </header>

        <div className="admin-grid">
          <section className="admin-left-column">
            <div className="admin-kpi-grid">
              {kpiCards.map((card) => (
                <article key={card.label} className="admin-kpi-card">
                  <div className="admin-kpi-top">
                    <span>{card.label}</span>
                    <div className={`admin-kpi-icon ${card.iconTone}`}>
                      <img src={card.icon} alt="" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="admin-kpi-bottom">
                    <strong>{card.value}</strong>
                    <span className={`admin-kpi-trend ${card.trendTone}`}>
                      <img
                        src={card.trendTone === "up" ? imgTrendUp : imgTrendDown}
                        alt=""
                        aria-hidden="true"
                      />
                      {card.trend}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <section className="admin-table-card">
              <div className="admin-table-toolbar">
                <h2>Active Workshops</h2>

                <div className="admin-table-actions">
                  <label className="admin-search-input" htmlFor="admin-search">
                    <img src={imgSearch} alt="" aria-hidden="true" />
                    <input
                      id="admin-search"
                      type="search"
                      placeholder="Search workshops..."
                    />
                  </label>

                  <button type="button" className="admin-filter-button">
                    <img src={imgFilter} alt="" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Workshop Title</th>
                      <th>Date</th>
                      <th>Enrolled</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshops.map((workshop) => (
                      <tr key={workshop.title}>
                        <td>{workshop.title}</td>
                        <td>
                          {workshop.date.split("\n").map((line) => (
                            <span key={line}>{line}</span>
                          ))}
                        </td>
                        <td>{workshop.enrolled}</td>
                        <td>
                          <span className={`admin-status-pill ${workshop.statusTone}`}>
                            {workshop.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button type="button">
                              <img src={imgActionOpen} alt="" aria-hidden="true" />
                            </button>
                            <button type="button">
                              <img src={imgActionEdit} alt="" aria-hidden="true" />
                            </button>
                            <button type="button">
                              <img src={imgActionDelete} alt="" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          <aside className="admin-side-card">
            <div className="admin-side-title">
              <img src={imgSystemHealth} alt="" aria-hidden="true" />
              <h2>System Health</h2>
            </div>

            <section className="admin-side-section">
              <h3>CSV SYNC JOBS</h3>

              <article className="admin-job-card failed">
                <img src={imgJobFailed} alt="" aria-hidden="true" />
                <div className="admin-job-copy">
                  <strong>Student_Roster_Q3.csv</strong>
                  <p>Failed at row 42</p>
                  <p>(Invalid format)</p>
                </div>
                <span className="admin-job-badge failed">Sync Failed</span>
              </article>

              <article className="admin-job-card pending">
                <img src={imgJobPending} alt="" aria-hidden="true" />
                <div className="admin-job-copy">
                  <strong>Workshop_Catalog_Update.csv</strong>
                  <p>Queued 2 mins ago</p>
                </div>
                <span className="admin-job-badge pending">Sync Pending</span>
              </article>
            </section>

            <section className="admin-side-section">
              <h3>AI PROCESSING</h3>

              <div className="admin-ai-row">
                <div className="admin-ai-copy">
                  <div className="admin-ai-icon blue">
                    <img src={imgAiDescription} alt="" aria-hidden="true" />
                  </div>
                  <div>
                    <strong>Description Generation</strong>
                    <p>Running for 3 items</p>
                  </div>
                </div>

                <div className="admin-progress">
                  <span />
                </div>
              </div>

              <div className="admin-ai-row">
                <div className="admin-ai-copy">
                  <div className="admin-ai-icon neutral">
                    <img src={imgAiOptimization} alt="" aria-hidden="true" />
                  </div>
                  <div>
                    <strong>Schedule Optimization</strong>
                    <p>Completed (12m ago)</p>
                  </div>
                </div>

                <img
                  className="admin-ai-done"
                  src={imgAiDone}
                  alt=""
                  aria-hidden="true"
                />
              </div>
            </section>

            <button type="button" className="admin-secondary-button">
              View All System Logs
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
