import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import type { CsvBatchDto } from '../lib/unihubApi.ts';
import {
  fetchCsvBatches,
  processCsvBatch,
  uploadCsvBatch,
} from '../lib/unihubApi.ts';

const AdminCsvSync = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isForceRunning, setIsForceRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [batchList, setBatchList] = useState<CsvBatchDto[] | null>(null);
  const [selectedQueuedBatchId, setSelectedQueuedBatchId] = useState<
    string | null
  >(null);

  const recentBatches = useMemo(() => {
    if (!batchList || !Array.isArray(batchList)) {
      return [];
    }
    return batchList.slice(0, 5);
  }, [batchList]);

  useEffect(() => {
    void (async () => {
      const listResult = await fetchCsvBatches({ page: 1, pageSize: 5 });
      if (listResult.ok) {
        setBatchList(listResult.data);
      }
      setIsLoading(false);
    })();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setStatusMessage(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatusMessage('Please select a CSV file to upload.');
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    const result = await uploadCsvBatch(file);
    if (result.ok) {
      setStatusMessage(`Batch queued: ${result.data.id}`);
      const listResult = await fetchCsvBatches({ page: 1, pageSize: 5 });
      if (listResult.ok) {
        setBatchList(listResult.data);
      }
    } else {
      setStatusMessage(result.error);
    }

    setIsUploading(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    const listResult = await fetchCsvBatches({ page: 1, pageSize: 5 });
    if (listResult.ok) {
      setBatchList(listResult.data);
      setStatusMessage(null);
    } else {
      setStatusMessage(listResult.error);
    }
    setIsLoading(false);
  };

  const handleQueuedStatusClick = (batchId: string) => {
    setSelectedQueuedBatchId((current) =>
      current === batchId ? null : batchId,
    );
  };

  const handleForceRun = async () => {
    if (!selectedQueuedBatchId) {
      return;
    }

    const shouldContinue = window.confirm(
      'Force running can trigger high resource usage. Do you want to continue?',
    );
    if (!shouldContinue) {
      return;
    }

    setIsForceRunning(true);
    const result = await processCsvBatch(selectedQueuedBatchId);
    if (result.ok) {
      setStatusMessage(`Batch force-run requested: ${selectedQueuedBatchId}`);
      setIsLoading(true);
      const listResult = await fetchCsvBatches({ page: 1, pageSize: 5 });
      if (listResult.ok) {
        setBatchList(listResult.data);
      }
      setIsLoading(false);
      setSelectedQueuedBatchId(null);
    } else {
      setStatusMessage(result.error);
    }
    setIsForceRunning(false);
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <AdminSidebar />
        <main className="admin-main admin-loading-main">
          <LoadingSpinner label="Loading CSV batches..." />
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>CSV Import</h1>
            <p>Upload student CSV files and monitor batch processing.</p>
          </div>

          <button
            type="button"
            className="admin-muted-button"
            onClick={handleRefresh}
          >
            Refresh batches
          </button>
        </header>

        <div className="admin-grid">
          <section className="admin-left-column">
            <article className="admin-csv-card">
              <div className="admin-csv-card-header">
                <div>
                  <h2>Upload CSV</h2>
                  <p>
                    Supported format: .csv. Each upload creates a batch job.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Queue Batch'}
                </button>
              </div>

              <div className="admin-csv-upload">
                <label className="admin-csv-dropzone">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  <strong>{file ? file.name : 'Choose CSV file'}</strong>
                  <span>
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : 'Drag & drop or click to select'}
                  </span>
                </label>

                {statusMessage ? (
                  <p className="admin-csv-status">{statusMessage}</p>
                ) : null}
              </div>
            </article>

            <article className="admin-table-card">
              <div className="admin-table-toolbar">
                <h2>Recent Batches</h2>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Success</th>
                      <th>Failed</th>
                      <th>Conflicts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBatches.length === 0 ? (
                      <tr>
                        <td colSpan={6}>No batches yet.</td>
                      </tr>
                    ) : (
                      recentBatches.map((batch) => (
                        <tr key={batch.id}>
                          <td>{batch.id}</td>
                          <td>
                            {batch.status === 'pending' ? (
                              <button
                                type="button"
                                className={`admin-status-pill ${batch.status}`}
                                onClick={() =>
                                  handleQueuedStatusClick(batch.id)
                                }
                              >
                                {batch.status} ↓
                              </button>
                            ) : (
                              <span
                                className={`admin-status-pill ${batch.status}`}
                              >
                                {batch.status}
                              </span>
                            )}
                          </td>
                          <td>{batch.totalRecords}</td>
                          <td>{batch.successfulRecords}</td>
                          <td>{batch.failedRecords}</td>
                          <td>{batch.conflictRecords}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {selectedQueuedBatchId ? (
                <div className="admin-csv-queue-panel">
                  <p>
                    Batch <strong>{selectedQueuedBatchId}</strong> is queued.
                  </p>
                  <button
                    type="button"
                    className="admin-primary-button"
                    onClick={handleForceRun}
                    disabled={isForceRunning}
                  >
                    {isForceRunning ? 'Forcing...' : 'Force to run'}
                  </button>
                </div>
              ) : null}
            </article>
          </section>

          <aside className="admin-side-column">
            <article className="admin-side-card admin-csv-help">
              <h2>CSV Requirements</h2>
              <ul>
                <li>Column names are flexible (mssv, email, full_name).</li>
                <li>Invalid rows are skipped and logged.</li>
                <li>Last-write-wins for duplicate MSSV entries.</li>
              </ul>
            </article>

            <article className="admin-side-card admin-csv-help">
              <h2>Schedule</h2>
              <p>
                Automated imports run at 01:00 and 04:00 UTC. Manual uploads are
                queued and run at schedule time.
              </p>
            </article>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AdminCsvSync;
