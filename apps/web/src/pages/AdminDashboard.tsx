import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.tsx';
import { fetchAdminDashboard } from '../lib/unihubApi.ts';
import type { AdminDashboardResponseDto } from '../lib/unihubApi.ts';

const imgNewWorkshop = '/figma-mcp/1c3b467b-1867-4898-8ec4-83dffde5d81d.svg';
const imgKpiWorkshops = '/figma-mcp/e37d5346-d57c-46b7-9647-6408c9aeecfc.svg';
const imgKpiRegistrations =
  '/figma-mcp/f7d6772e-df2f-4691-842e-bbd919fe3fc3.svg';
const imgKpiRevenue = '/figma-mcp/146d85ff-8453-4021-a05a-10f0eff1956d.svg';
const imgSearch = '/figma-mcp/637616ad-aaa3-43fd-96fd-1f03ae58b88c.svg';
const imgFilter = '/figma-mcp/0d80eeb8-22a3-46f3-b9eb-24d3be3c75ff.svg';
const imgActionOpen = '/figma-mcp/9dccb94a-b415-474b-8fea-b2a93810b36c.svg';
const imgActionEdit = '/figma-mcp/e04d9ab0-18f6-41f6-9cc3-88616dcabdd0.svg';
const imgActionDelete = '/figma-mcp/107b852e-134f-4a99-9c6f-27c3726592c9.svg';
const imgSystemHealth = '/figma-mcp/db6cf4a4-c436-47a6-b528-58e93275b0a6.svg';
const imgJobFailed = '/figma-mcp/85795ce2-9a08-42e2-b83c-adfa1e08d7ed.svg';
const imgJobPending = '/figma-mcp/9313d707-6643-4ed6-b6a9-ddcaa33345c3.svg';
const imgAiDescription = '/figma-mcp/42b80789-2465-4f91-81dd-d5596dd8f5f5.svg';
const imgAiOptimization = '/figma-mcp/ea93dad6-6c5e-4dee-850b-2ff14b192819.svg';
const imgAiDone = '/figma-mcp/284ef3fe-cc12-4bc9-8b67-31ab681d3a57.svg';

type TrendTone = 'up' | 'down' | 'neutral';

const formatDateLines = (isoDate: string) => {
  const date = new Date(isoDate);
  return [
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    }),
    date.toLocaleDateString('en-US', { year: 'numeric' }),
  ];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const getWorkshopStatus = (
  workshop: AdminDashboardResponseDto['workshops'][number],
) => {
  if (workshop.status === 'cancelled') {
    return { label: 'Cancelled', tone: 'cancelled' };
  }

  if (workshop.registeredCount >= workshop.capacity) {
    return { label: 'Full', tone: 'full' };
  }

  return { label: 'Open', tone: 'open' };
};

const getCsvBadge = (status: string) => {
  if (status === 'failed') {
    return { label: 'Sync Failed', tone: 'failed' };
  }

  if (status === 'running') {
    return { label: 'Sync Running', tone: 'pending' };
  }

  if (status === 'completed') {
    return { label: 'Sync Completed', tone: 'pending' };
  }

  return { label: 'Sync Pending', tone: 'pending' };
};

const formatTimestamp = (value: string | null) => {
  if (!value) {
    return 'No completed jobs yet.';
  }

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboardResponseDto | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const debounce = window.setTimeout(() => {
      const loadDashboard = async () => {
        setIsLoading(true);
        setError(null);

        const result = await fetchAdminDashboard({
          q: searchTerm.trim() || undefined,
        });

        if (!isActive) {
          return;
        }

        setIsLoading(false);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setDashboard(result.data);
      };

      void loadDashboard();
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(debounce);
    };
  }, [searchTerm]);

  const kpiCards = useMemo(() => {
    if (!dashboard) {
      return [] as Array<{
        label: string;
        value: string;
        trend?: string;
        trendTone: TrendTone;
        icon: string;
        iconTone: string;
      }>;
    }

    return [
      {
        label: 'TOTAL WORKSHOPS',
        value: dashboard.kpis.totalWorkshops.toLocaleString('en-US'),
        trendTone: 'neutral' as TrendTone,
        icon: imgKpiWorkshops,
        iconTone: 'blue',
      },
      {
        label: 'REGISTRATIONS',
        value: dashboard.kpis.totalRegistrations.toLocaleString('en-US'),
        trendTone: 'neutral' as TrendTone,
        icon: imgKpiRegistrations,
        iconTone: 'green',
      },
      {
        label: 'GROSS REVENUE',
        value: formatCurrency(dashboard.kpis.grossRevenue),
        trendTone: 'neutral' as TrendTone,
        icon: imgKpiRevenue,
        iconTone: 'neutral',
      },
    ];
  }, [dashboard]);

  const workshops = dashboard?.workshops ?? [];
  const csvBatches = dashboard?.systemHealth.csvSync.batches ?? [];
  const aiSummary = dashboard?.systemHealth.aiSummary;
  const aiRunningCount = aiSummary?.counts.running ?? 0;
  const aiProgress = Math.min(aiRunningCount * 12, 100);
  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Overview</h1>
            <p>Manage active workshops and monitor system health.</p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={() => navigate('/admin/workshops/new')}
          >
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
                      --
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {error ? <p className="helper-text">{error}</p> : null}
            {isLoading ? (
              <p className="helper-text">Loading dashboard...</p>
            ) : null}

            <section className="admin-table-card">
              <div className="admin-table-toolbar">
                <h2>Active Workshops</h2>

                <div className="admin-table-actions">
                  <label className="admin-search-input" htmlFor="admin-search">
                    <img src={imgSearch} alt="" aria-hidden="true" />
                    <input
                      id="admin-search"
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
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
                    {workshops.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          {searchTerm.trim()
                            ? 'No workshops match your search.'
                            : 'No workshops available.'}
                        </td>
                      </tr>
                    ) : (
                      workshops.map((workshop) => {
                        const statusMeta = getWorkshopStatus(workshop);
                        const [dateLine, yearLine] = formatDateLines(
                          workshop.startTime,
                        );

                        return (
                          <tr key={workshop.id}>
                            <td>{workshop.title}</td>
                            <td>
                              <span>{dateLine}</span>
                              <span>{yearLine}</span>
                            </td>
                            <td>
                              {workshop.registeredCount} / {workshop.capacity}
                            </td>
                            <td>
                              <span
                                className={`admin-status-pill ${statusMeta.tone}`}
                              >
                                {statusMeta.label}
                              </span>
                            </td>
                            <td>
                              <div className="admin-row-actions">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/admin/workshops/${workshop.id}`)
                                  }
                                >
                                  <img
                                    src={imgActionOpen}
                                    alt=""
                                    aria-hidden="true"
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/admin/workshops/${workshop.id}`)
                                  }
                                >
                                  <img
                                    src={imgActionEdit}
                                    alt=""
                                    aria-hidden="true"
                                  />
                                </button>
                                <button type="button">
                                  <img
                                    src={imgActionDelete}
                                    alt=""
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
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

              {csvBatches.length === 0 ? (
                <p className="helper-text">No CSV sync batches yet.</p>
              ) : (
                csvBatches.map((batch) => {
                  const badge = getCsvBadge(batch.status);
                  const isFailed = batch.status === 'failed';
                  const lastError = batch.lastError;

                  return (
                    <article
                      key={batch.id}
                      className={`admin-job-card ${badge.tone}`}
                    >
                      <img
                        src={isFailed ? imgJobFailed : imgJobPending}
                        alt=""
                        aria-hidden="true"
                      />
                      <div className="admin-job-copy">
                        <strong>{batch.sourceFile}</strong>
                        {isFailed && lastError ? (
                          <>
                            <p>Failed at row {lastError.rowNumber}</p>
                            <p>({lastError.message})</p>
                          </>
                        ) : (
                          <p>
                            {batch.status === 'running'
                              ? 'Processing batch'
                              : batch.status === 'completed'
                                ? 'Completed'
                                : 'Queued'}
                          </p>
                        )}
                      </div>
                      <span className={`admin-job-badge ${badge.tone}`}>
                        {badge.label}
                      </span>
                    </article>
                  );
                })
              )}
            </section>

            <section className="admin-side-section">
              <h3>AI PROCESSING</h3>

              <div className="admin-ai-row">
                <div className="admin-ai-copy">
                  <div className="admin-ai-icon blue">
                    <img src={imgAiDescription} alt="" aria-hidden="true" />
                  </div>
                  <div>
                    <strong>Summary Generation</strong>
                    <p>
                      {aiRunningCount > 0
                        ? `Running for ${aiRunningCount} items`
                        : 'No jobs running'}
                    </p>
                  </div>
                </div>

                <div className="admin-progress">
                  <span style={{ width: `${aiProgress}%` }} />
                </div>
              </div>

              <div className="admin-ai-row">
                <div className="admin-ai-copy">
                  <div className="admin-ai-icon neutral">
                    <img src={imgAiOptimization} alt="" aria-hidden="true" />
                  </div>
                  <div>
                    <strong>Last Completed Summary</strong>
                    <p>{formatTimestamp(aiSummary?.lastCompletedAt ?? null)}</p>
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
