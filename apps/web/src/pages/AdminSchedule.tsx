import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.tsx';
import {
  fetchDocumentSummary,
  fetchWorkshop,
  fetchWorkshopDocuments,
  uploadWorkshopDocument,
} from '../lib/unihubApi.ts';
import type {
  DocumentSummaryApiDto,
  WorkshopApiDto,
  WorkshopDocumentApiDto,
} from '../lib/unihubApi.ts';

const imgBack =
  'https://www.figma.com/api/mcp/asset/b5782a50-bb86-4df4-ad5c-eae9bec1a501';
const imgSave =
  'https://www.figma.com/api/mcp/asset/4c887932-c917-4777-ab6d-a9f718724f24';
const imgSpeaker =
  'https://www.figma.com/api/mcp/asset/71a0a35a-c9aa-455c-980e-658e90444090';
const imgLocation =
  'https://www.figma.com/api/mcp/asset/e9c1f6d1-e4dc-447e-b63a-893c755fded6';
const imgDate =
  'https://www.figma.com/api/mcp/asset/1767af85-7c7a-4f16-84e5-4fb396aa3ad9';
const imgCapacity =
  'https://www.figma.com/api/mcp/asset/597340f1-8ec4-427f-9f8e-014f2ddf90f2';
const imgPrice =
  'https://www.figma.com/api/mcp/asset/d1e11ae4-aa19-482b-a3bc-64a786fa9244';
const imgTranscript =
  'https://www.figma.com/api/mcp/asset/a5f54d4e-a0a6-436c-8a7d-746c84f09d21';
const imgTranscriptStatus =
  'https://www.figma.com/api/mcp/asset/f6847724-7a0a-44ff-9e88-efb2b6b813b7';
const imgExport =
  'https://www.figma.com/api/mcp/asset/a8559913-825d-42b5-89ee-132355562ff3';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatUploadedAt = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Unable to read file.'));
        return;
      }

      const [, base64] = result.split(',');
      if (!base64) {
        reject(new Error('Unable to parse file.'));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });

const getSummaryStatusLabel = (status: DocumentSummaryApiDto['status']) => {
  if (status === 'completed') {
    return 'Completed';
  }

  if (status === 'failed') {
    return 'Failed';
  }

  if (status === 'running') {
    return 'Running';
  }

  return 'Pending';
};

const AdminSchedule = () => {
  const { id } = useParams();
  const workshopId = id ?? '';
  const [workshop, setWorkshop] = useState<WorkshopApiDto | null>(null);
  const [documents, setDocuments] = useState<WorkshopDocumentApiDto[]>([]);
  const [summary, setSummary] = useState<DocumentSummaryApiDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const latestDocument = documents[0] ?? null;

  const registrationProgress = useMemo(() => {
    if (!workshop) {
      return 0;
    }

    if (workshop.capacity === 0) {
      return 0;
    }

    return Math.min(
      Math.round((workshop.registeredCount / workshop.capacity) * 100),
      100,
    );
  }, [workshop]);

  const registrationLabel = useMemo(() => {
    if (!workshop) {
      return 'Registration Status';
    }

    if (workshop.status === 'cancelled') {
      return 'Registration Closed';
    }

    if (workshop.registeredCount >= workshop.capacity) {
      return 'Registration Full';
    }

    return 'Registration Open';
  }, [workshop]);

  useEffect(() => {
    if (!workshopId) {
      setError('Workshop ID is required.');
      setIsLoading(false);
      return;
    }

    localStorage.setItem('admin:lastWorkshopId', workshopId);

    const loadWorkshop = async () => {
      const result = await fetchWorkshop(workshopId);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setWorkshop(result.data);
    };

    const loadDocuments = async () => {
      const result = await fetchWorkshopDocuments(workshopId);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDocuments(result.data);
      if (result.data.length === 0) {
        setSummary(null);
        return;
      }

      const latest = result.data[0];
      const summaryResult = await fetchDocumentSummary(
        workshopId,
        latest.id,
      );

      if (!summaryResult.ok) {
        setSummaryError(summaryResult.error);
        setSummary(null);
        return;
      }

      setSummary(summaryResult.data);
    };

    const loadAll = async () => {
      setIsLoading(true);
      setError(null);
      setSummaryError(null);
      await Promise.all([loadWorkshop(), loadDocuments()]);
      setIsLoading(false);
    };

    void loadAll();
  }, [workshopId]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !workshopId) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const base64 = await readFileAsBase64(file);
      const result = await uploadWorkshopDocument(workshopId, {
        fileName: file.name,
        contentBase64: base64,
        contentType: file.type || 'application/pdf',
      });

      if (!result.ok) {
        setUploadError(result.error);
        return;
      }

      const docsResult = await fetchWorkshopDocuments(workshopId);
      if (docsResult.ok) {
        setDocuments(docsResult.data);
      }

      const latest = docsResult.ok ? docsResult.data[0] : null;
      if (latest) {
        const summaryResult = await fetchDocumentSummary(
          workshopId,
          latest.id,
        );
        if (summaryResult.ok) {
          setSummary(summaryResult.data);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const refreshSummary = async () => {
    if (!latestDocument || !workshopId) {
      return;
    }

    setSummaryError(null);
    const summaryResult = await fetchDocumentSummary(
      workshopId,
      latestDocument.id,
    );

    if (!summaryResult.ok) {
      setSummaryError(summaryResult.error);
      return;
    }

    setSummary(summaryResult.data);
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <AdminSidebar />
        <main className="admin-main admin-schedule-main">
          <p className="helper-text">Loading workshop details...</p>
        </main>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="admin-page">
        <AdminSidebar />
        <main className="admin-main admin-schedule-main">
          <p className="helper-text">{error ?? 'Workshop not found.'}</p>
        </main>
      </div>
    );
  }
  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-main admin-schedule-main">
        <div className="admin-schedule-shell">
          <header className="admin-schedule-header">
            <div className="admin-schedule-heading">
              <Link to="/admin/dashboard" className="admin-back-link">
                <img src={imgBack} alt="" aria-hidden="true" />
                <span>Back to List</span>
              </Link>
              <h1>Edit Workshop</h1>
            </div>

            <div className="admin-schedule-header-actions">
              <button type="button" className="admin-muted-button">
                Discard Changes
              </button>
              <button type="button" className="admin-primary-button">
                <img src={imgSave} alt="" aria-hidden="true" />
                <span>Save Workshop</span>
              </button>
            </div>
          </header>

          <div className="admin-schedule-grid">
            <section className="admin-schedule-form-column">
              <article className="admin-form-card">
                <h2>Core Information</h2>

                <div className="admin-form-stack">
                  <label className="admin-form-field">
                    <span>Workshop Title</span>
                    <input
                      type="text"
                      value={workshop.title}
                      readOnly
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>Description</span>
                    <textarea
                      rows={5}
                      value={workshop.description ?? 'No description provided.'}
                      readOnly
                    />
                  </label>

                  <div className="admin-form-grid two">
                    <label className="admin-form-field">
                      <span>Primary Speaker</span>
                      <div className="admin-input-with-icon">
                        <img src={imgSpeaker} alt="" aria-hidden="true" />
                        <input
                          type="text"
                          value={workshop.speaker ?? 'TBD'}
                          readOnly
                        />
                      </div>
                    </label>

                    <label className="admin-form-field">
                      <span>Room Location</span>
                      <div className="admin-input-with-icon">
                        <img src={imgLocation} alt="" aria-hidden="true" />
                        <input
                          type="text"
                          value={workshop.room ?? 'TBD'}
                          readOnly
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </article>

              <article className="admin-form-card">
                <h2>Logistics & Capacity</h2>

                <div className="admin-form-grid two gap-lg">
                  <label className="admin-form-field">
                    <span>Date</span>
                    <div className="admin-input-with-icon">
                      <img src={imgDate} alt="" aria-hidden="true" />
                      <input
                        type="text"
                        value={formatDate(workshop.startTime)}
                        readOnly
                      />
                    </div>
                  </label>

                  <div className="admin-form-field">
                    <span>Time</span>
                    <div className="admin-time-row">
                      <input
                        type="text"
                        value={formatTime(workshop.startTime)}
                        readOnly
                      />
                      <span>to</span>
                      <input
                        type="text"
                        value={formatTime(workshop.endTime)}
                        readOnly
                      />
                    </div>
                  </div>

                  <label className="admin-form-field">
                    <span>Max Capacity</span>
                    <div className="admin-input-with-icon">
                      <img src={imgCapacity} alt="" aria-hidden="true" />
                      <input
                        type="text"
                        value={workshop.capacity}
                        readOnly
                      />
                    </div>
                  </label>

                  <label className="admin-form-field">
                    <span>Registration Price ($)</span>
                    <div className="admin-input-with-icon">
                      <img src={imgPrice} alt="" aria-hidden="true" />
                      <input
                        type="text"
                        value={Number(workshop.price).toFixed(2)}
                        readOnly
                      />
                    </div>
                    <small>Leave as 0.00 for free workshops.</small>
                  </label>
                </div>
              </article>

              <article className="admin-form-card">
                <h2>Course Materials</h2>
                <p className="admin-card-description">
                  Upload syllabus, reading lists, or prerequisite documents.
                </p>

                <label className="admin-upload-dropzone">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                  <div className="admin-upload-icon">PDF</div>
                  <strong>
                    {isUploading
                      ? 'Uploading document...'
                      : 'Click to upload or drag and drop'}
                  </strong>
                  <span>PDF up to 10MB</span>
                </label>

                {uploadError ? (
                  <p className="helper-text">{uploadError}</p>
                ) : null}

                {documents.length === 0 ? (
                  <p className="helper-text">No documents uploaded yet.</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="admin-upload-file">
                      <div>
                        <strong>{doc.fileName}</strong>
                        <span>{formatUploadedAt(doc.uploadedAt)}</span>
                      </div>
                      <button type="button" disabled>
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </article>
            </section>

            <aside className="admin-schedule-side-column">
              <article className="admin-side-card admin-transcript-card">
                <div className="admin-side-title">
                  <img src={imgTranscript} alt="" aria-hidden="true" />
                  <h2>AI Summary</h2>
                  <span className="admin-transcript-status">
                    <img src={imgTranscriptStatus} alt="" aria-hidden="true" />
                    {summary ? getSummaryStatusLabel(summary.status) : 'Pending'}
                  </span>
                </div>

                <p className="admin-transcript-copy">
                  {summary?.summaryText
                    ? summary.summaryText
                    : latestDocument
                      ? 'Summary is being prepared. Check back soon.'
                      : 'Upload a PDF to start AI summarization.'}
                </p>

                {summaryError ? (
                  <p className="helper-text">{summaryError}</p>
                ) : null}

                <button
                  type="button"
                  className="admin-outline-button"
                  onClick={refreshSummary}
                  disabled={!latestDocument}
                >
                  Refresh Summary
                </button>
              </article>

              <article className="admin-side-card admin-registration-card">
                <h2>Registration Status</h2>

                <div className="admin-registration-stats">
                  <div>
                    <strong>{workshop.registeredCount}</strong>
                    <span>Registered</span>
                  </div>
                  <div>
                    <strong>{workshop.capacity}</strong>
                    <span>Capacity</span>
                  </div>
                </div>

                <div className="admin-registration-bar">
                  <span style={{ width: `${registrationProgress}%` }} />
                </div>

                <div className="admin-registration-pill">
                  <span />
                  {registrationLabel}
                </div>
              </article>

              <article className="admin-side-card admin-attendees-card">
                <div className="admin-attendees-header">
                  <h2>Attendees</h2>
                  <a href="#">View All</a>
                </div>

                <div className="admin-attendees-list">
                  <div className="admin-attendee-row">
                    <div className="admin-attendee-initials">--</div>
                    <div>
                      <strong>No attendee roster yet</strong>
                      <span>Roster export is not configured.</span>
                    </div>
                  </div>
                </div>

                <button type="button" className="admin-export-button" disabled>
                  <img src={imgExport} alt="" aria-hidden="true" />
                  <span>Export Roster</span>
                </button>
              </article>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSchedule;
