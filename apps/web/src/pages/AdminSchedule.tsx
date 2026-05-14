import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.tsx';
import {
  createWorkshop,
  fetchDocumentSummary,
  fetchWorkshop,
  fetchWorkshopDocuments,
  updateWorkshop,
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

type WorkshopDraftForm = {
  title: string;
  description: string;
  speaker: string;
  room: string;
  capacity: string;
  price: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: WorkshopApiDto['status'];
  floorMapUrl: string;
};

const emptyWorkshopForm = (): WorkshopDraftForm => ({
  title: '',
  description: '',
  speaker: '',
  room: '',
  capacity: '50',
  price: '0',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  status: 'draft',
  floorMapUrl: '',
});

const toDateValue = (value: string) => value.slice(0, 10);
const toTimeValue = (value: string) => value.slice(11, 16);
const combineDateTime = (date: string, time: string) =>
  `${date}T${time.length === 5 ? `${time}:00` : time}`;

const normalizeOptionalString = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

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
  const navigate = useNavigate();
  const { id } = useParams();
  const isCreateMode = id === 'new';
  const workshopId = !id || isCreateMode ? null : id;

  const [workshop, setWorkshop] = useState<WorkshopApiDto | null>(null);
  const [form, setForm] = useState<WorkshopDraftForm>(emptyWorkshopForm());
  const [initialForm, setInitialForm] = useState<WorkshopDraftForm>(emptyWorkshopForm());
  const [documents, setDocuments] = useState<WorkshopDocumentApiDto[]>([]);
  const [summary, setSummary] = useState<DocumentSummaryApiDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const latestDocument = documents[0] ?? null;

  const registrationProgress = useMemo(() => {
    if (!workshop || workshop.capacity === 0) {
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
    let active = true;

    const load = async () => {
      if (isCreateMode) {
        setWorkshop(null);
        setForm(emptyWorkshopForm());
        setInitialForm(emptyWorkshopForm());
        setDocuments([]);
        setSummary(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      if (!workshopId) {
        setError('Workshop ID is required.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSummaryError(null);
      setUploadError(null);

      const workshopResult = await fetchWorkshop(workshopId);
      if (!active) {
        return;
      }

      if (!workshopResult.ok) {
        setError(workshopResult.error);
        setIsLoading(false);
        return;
      }

      const workshopData = workshopResult.data;
      const nextForm: WorkshopDraftForm = {
        title: workshopData.title,
        description: workshopData.description ?? '',
        speaker: workshopData.speaker ?? '',
        room: workshopData.room ?? '',
        capacity: String(workshopData.capacity),
        price: String(Number(workshopData.price)),
        startDate: toDateValue(workshopData.startTime),
        startTime: toTimeValue(workshopData.startTime),
        endDate: toDateValue(workshopData.endTime),
        endTime: toTimeValue(workshopData.endTime),
        status: workshopData.status,
        floorMapUrl: workshopData.floorMapUrl ?? '',
      };

      setWorkshop(workshopData);
      setForm(nextForm);
      setInitialForm(nextForm);
      localStorage.setItem('admin:lastWorkshopId', workshopData.id);

      const documentsResult = await fetchWorkshopDocuments(workshopData.id);
      if (!active) {
        return;
      }

      if (!documentsResult.ok) {
        setError(documentsResult.error);
        setDocuments([]);
        setSummary(null);
        setIsLoading(false);
        return;
      }

      setDocuments(documentsResult.data);

      const firstDocument = documentsResult.data[0];
      if (firstDocument) {
        const summaryResult = await fetchDocumentSummary(
          workshopData.id,
          firstDocument.id,
        );

        if (!active) {
          return;
        }

        if (summaryResult.ok) {
          setSummary(summaryResult.data);
        } else {
          setSummaryError(summaryResult.error);
          setSummary(null);
        }
      } else {
        setSummary(null);
      }

      setIsLoading(false);
    };

    void load();

    return () => {
      active = false;
    };
  }, [isCreateMode, workshopId]);

  const handleFieldChange = <K extends keyof WorkshopDraftForm>(
    key: K,
    value: WorkshopDraftForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaveError(null);

    if (!form.title.trim()) {
      setSaveError('Workshop title is required.');
      return;
    }

    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      setSaveError('Start and end date/time are required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: normalizeOptionalString(form.description),
      speaker: normalizeOptionalString(form.speaker),
      room: normalizeOptionalString(form.room),
      capacity: Number(form.capacity),
      price: Number(form.price),
      startTime: combineDateTime(form.startDate, form.startTime),
      endTime: combineDateTime(form.endDate, form.endTime),
      floorMapUrl: normalizeOptionalString(form.floorMapUrl),
      status: form.status,
    };

    if (!Number.isFinite(payload.capacity) || payload.capacity <= 0) {
      setSaveError('Capacity must be a positive number.');
      return;
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setSaveError('Price must be zero or greater.');
      return;
    }

    if (
      new Date(payload.endTime).getTime() <= new Date(payload.startTime).getTime()
    ) {
      setSaveError('End time must be after start time.');
      return;
    }

    setIsSaving(true);

    const result = isCreateMode
      ? await createWorkshop(payload)
      : await updateWorkshop(workshopId ?? '', payload);

    setIsSaving(false);

    if (!result.ok) {
      setSaveError(result.error);
      return;
    }

    setWorkshop(result.data);

    const nextForm: WorkshopDraftForm = {
      title: result.data.title,
      description: result.data.description ?? '',
      speaker: result.data.speaker ?? '',
      room: result.data.room ?? '',
      capacity: String(result.data.capacity),
      price: String(Number(result.data.price)),
      startDate: toDateValue(result.data.startTime),
      startTime: toTimeValue(result.data.startTime),
      endDate: toDateValue(result.data.endTime),
      endTime: toTimeValue(result.data.endTime),
      status: result.data.status,
      floorMapUrl: result.data.floorMapUrl ?? '',
    };

    setForm(nextForm);
    setInitialForm(nextForm);
    localStorage.setItem('admin:lastWorkshopId', result.data.id);

    if (isCreateMode) {
      // After creating a workshop, return to dashboard per UX request.
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    // For edits, also return to dashboard after successful save.
    navigate('/admin/dashboard', { replace: true });
  };

  const handleDiscard = () => {
    if (isCreateMode) {
      navigate('/admin/dashboard');
      return;
    }

    setForm(initialForm);
    setSaveError(null);
    setUploadError(null);
    setSummaryError(null);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !workshopId || isCreateMode) {
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

        const firstDocument = docsResult.data[0];
        if (firstDocument) {
          const summaryResult = await fetchDocumentSummary(
            workshopId,
            firstDocument.id,
          );

          if (summaryResult.ok) {
            setSummary(summaryResult.data);
          }
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const refreshSummary = async () => {
    if (!latestDocument || !workshopId || isCreateMode) {
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

  if (error && !isCreateMode) {
    return (
      <div className="admin-page">
        <AdminSidebar />
        <main className="admin-main admin-schedule-main">
          <p className="helper-text">{error}</p>
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
              <button type="button" className="admin-back-link" onClick={handleDiscard}>
                <img src={imgBack} alt="" aria-hidden="true" />
                <span>{isCreateMode ? 'Back to Dashboard' : 'Back to List'}</span>
              </button>
              <h1>{isCreateMode ? 'Create Workshop' : 'Edit Workshop'}</h1>
            </div>

            <div className="admin-schedule-header-actions">
              <button type="button" className="admin-muted-button" onClick={handleDiscard}>
                Discard Changes
              </button>
              <button
                type="button"
                className="admin-primary-button"
                onClick={() => void handleSave()}
                disabled={isSaving}
              >
                <img src={imgSave} alt="" aria-hidden="true" />
                <span>{isSaving ? 'Saving...' : 'Save Workshop'}</span>
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
                      value={form.title}
                      onChange={(event) => handleFieldChange('title', event.target.value)}
                      placeholder="Enter workshop title"
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>Description</span>
                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={(event) => handleFieldChange('description', event.target.value)}
                      placeholder="Describe the workshop"
                    />
                  </label>

                  <div className="admin-form-grid two">
                    <label className="admin-form-field">
                      <span>Primary Speaker</span>
                      <div className="admin-input-with-icon">
                        <img src={imgSpeaker} alt="" aria-hidden="true" />
                        <input
                          type="text"
                          value={form.speaker}
                          onChange={(event) => handleFieldChange('speaker', event.target.value)}
                          placeholder="Speaker name"
                        />
                      </div>
                    </label>

                    <label className="admin-form-field">
                      <span>Room Location</span>
                      <div className="admin-input-with-icon">
                        <img src={imgLocation} alt="" aria-hidden="true" />
                        <input
                          type="text"
                          value={form.room}
                          onChange={(event) => handleFieldChange('room', event.target.value)}
                          placeholder="Room or venue"
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
                        type="date"
                        value={form.startDate}
                        onChange={(event) => handleFieldChange('startDate', event.target.value)}
                      />
                    </div>
                  </label>

                  <div className="admin-form-field">
                    <span>Time</span>
                    <div className="admin-time-row">
                      <input
                        type="time"
                        value={form.startTime}
                        onChange={(event) => handleFieldChange('startTime', event.target.value)}
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={form.endTime}
                        onChange={(event) => handleFieldChange('endTime', event.target.value)}
                      />
                    </div>
                  </div>

                  <label className="admin-form-field">
                    <span>Max Capacity</span>
                    <div className="admin-input-with-icon">
                      <img src={imgCapacity} alt="" aria-hidden="true" />
                      <input
                        type="number"
                        min={1}
                        value={form.capacity}
                        onChange={(event) => handleFieldChange('capacity', event.target.value)}
                      />
                    </div>
                  </label>

                  <label className="admin-form-field">
                    <span>Registration Price ($)</span>
                    <div className="admin-input-with-icon">
                      <img src={imgPrice} alt="" aria-hidden="true" />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.price}
                        onChange={(event) => handleFieldChange('price', event.target.value)}
                      />
                    </div>
                    <small>Leave as 0.00 for free workshops.</small>
                  </label>

                  <label className="admin-form-field">
                    <span>Status</span>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        handleFieldChange('status', event.target.value as WorkshopApiDto['status'])
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>

                  <label className="admin-form-field">
                    <span>Floor Map URL</span>
                    <input
                      type="url"
                      value={form.floorMapUrl}
                      onChange={(event) => handleFieldChange('floorMapUrl', event.target.value)}
                      placeholder="https://..."
                    />
                  </label>
                </div>

                {saveError ? <p className="helper-text">{saveError}</p> : null}
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
                  {isCreateMode
                    ? 'Create the workshop first to enable document upload and AI summaries.'
                    : summary?.summaryText
                      ? summary.summaryText
                      : latestDocument
                        ? 'Summary is being prepared. Check back soon.'
                        : 'Upload a PDF to start AI summarization.'}
                </p>

                {summaryError ? <p className="helper-text">{summaryError}</p> : null}

                <button
                  type="button"
                  className="admin-outline-button"
                  onClick={refreshSummary}
                  disabled={!latestDocument || isCreateMode}
                >
                  Refresh Summary
                </button>
              </article>

              <article className="admin-side-card admin-registration-card">
                <h2>Registration Status</h2>

                {workshop ? (
                  <>
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
                  </>
                ) : (
                  <p className="helper-text">Save the workshop to view registration status.</p>
                )}
              </article>

              <article className="admin-side-card admin-attendees-card">
                <div className="admin-attendees-header">
                  <h2>Attendees</h2>
                  <a href="#">View All</a>
                </div>

                {isCreateMode ? (
                  <p className="helper-text">Attendees will appear after the workshop is created.</p>
                ) : (
                  <div className="admin-attendees-list">
                    <div className="admin-attendee-row">
                      <div className="admin-attendee-initials">--</div>
                      <div>
                        <strong>No attendee roster yet</strong>
                        <span>Roster export is not configured.</span>
                      </div>
                    </div>
                  </div>
                )}

                <button type="button" className="admin-export-button" disabled={isCreateMode}>
                  <img src={imgExport} alt="" aria-hidden="true" />
                  <span>Export Roster</span>
                </button>
              </article>

              {!isCreateMode ? (
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
                      {isUploading ? 'Uploading document...' : 'Click to upload or drag and drop'}
                    </strong>
                    <span>PDF up to 10MB</span>
                  </label>

                  {uploadError ? <p className="helper-text">{uploadError}</p> : null}

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
              ) : null}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSchedule;