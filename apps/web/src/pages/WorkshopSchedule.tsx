import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  Calendar,
  Clock,
  Download,
  DollarSign,
  MapPin,
  QrCode,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import WorkshopHeader from '../components/WorkshopHeader.tsx';
import SessionGate from '../components/SessionGate.tsx';
import useStudentSession from '../hooks/useStudentSession.ts';
import {
  getQrImageSource,
  mapRegistrationToScheduleViewModel,
} from '../lib/unihubAdapters.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import {
  fetchMyRegistrations,
  fetchRegistrationQr,
  fetchWorkshop,
} from '../lib/unihubApi.ts';
import type { ScheduleRegistrationViewModel } from '../lib/unihubAdapters.ts';

const imgStudentProfile = '/figma-mcp/646bd94c-8822-432f-be1f-38d08a09df59.jpg';

const WorkshopSchedule = () => {
  const navigate = useNavigate();
  const session = useStudentSession();
  const [registrations, setRegistrations] = useState<
    ScheduleRegistrationViewModel[]
  >([]);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<
    string | null
  >(null);
  const [selectedQrCode, setSelectedQrCode] = useState(getQrImageSource(null));
  const [selectedQrText, setSelectedQrText] = useState<string | null>(null);
  const [qrLoadState, setQrLoadState] = useState<
    'idle' | 'loading' | 'loaded' | 'failed'
  >('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegistrations = async () => {
    if (session.isLoading) {
      return;
    }

    if (!session.isAuthenticated) {
      setRegistrations([]);
      setSelectedRegistrationId(null);
      setSelectedQrCode(getQrImageSource(null));
      setSelectedQrText(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const registrationResult = await fetchMyRegistrations({
      page: 1,
      pageSize: 20,
    });

    if (!registrationResult.ok) {
      setIsLoading(false);
      setError(registrationResult.error);
      return;
    }

    if (registrationResult.data.length === 0) {
      setRegistrations([]);
      setSelectedRegistrationId(null);
      setSelectedQrCode(getQrImageSource(null));
      setSelectedQrText(null);
      setIsLoading(false);
      return;
    }

    const workshopResults = await Promise.all(
      registrationResult.data.map((registration) =>
        fetchWorkshop(registration.workshopId),
      ),
    );

    const firstFailure = workshopResults.find((result) => !result.ok);
    if (firstFailure && !firstFailure.ok) {
      setIsLoading(false);
      setError(firstFailure.error);
      return;
    }

    const hydratedRegistrations = registrationResult.data.map(
      (registration, index) =>
        mapRegistrationToScheduleViewModel(
          registration,
          (
            workshopResults[index] as Extract<
              (typeof workshopResults)[number],
              { ok: true }
            >
          ).data,
        ),
    );

    setRegistrations(hydratedRegistrations);
    setSelectedRegistrationId(
      (current) => current ?? hydratedRegistrations[0]?.id ?? null,
    );
    setIsLoading(false);
  };

  useEffect(() => {
    void loadRegistrations();
  }, [session.isAuthenticated, session.isLoading]);

  const selectedRegistration = useMemo(
    () =>
      registrations.find(
        (registration) => registration.id === selectedRegistrationId,
      ) ??
      registrations[0] ??
      null,
    [registrations, selectedRegistrationId],
  );

  useEffect(() => {
    const loadQrCode = async () => {
      if (!selectedRegistration) {
        setSelectedQrCode(getQrImageSource(null));
        setSelectedQrText(null);
        setQrLoadState('idle');
        return;
      }

      if (selectedRegistration.status !== 'confirmed') {
        setSelectedQrCode(getQrImageSource(null));
        setSelectedQrText(selectedRegistration.qrCode ?? null);
        setQrLoadState('loaded');
        return;
      }

      setQrLoadState('loading');
      const qrResult = await fetchRegistrationQr(selectedRegistration.id);
      if (!qrResult.ok) {
        setError(qrResult.error);
        setSelectedQrCode(getQrImageSource(selectedRegistration.qrCode));
        setSelectedQrText(selectedRegistration.qrCode ?? null);
        setQrLoadState('failed');
        return;
      }

      setSelectedQrCode(getQrImageSource(qrResult.data.qrCode));
      setSelectedQrText(qrResult.data.qrCode);
      setQrLoadState('loaded');
    };

    void loadQrCode();
  }, [selectedRegistration]);

  const getCardClassName = (registration: ScheduleRegistrationViewModel) =>
    `schedule-card${selectedRegistrationId === registration.id ? ' is-selected' : ''} ${
      registration.status === 'confirmed'
        ? 'registered'
        : registration.status === 'pending'
          ? 'pending'
          : 'pending'
    }`;

  const getStatusLabel = (registration: ScheduleRegistrationViewModel) => {
    if (
      registration.status === 'confirmed' &&
      registration.paymentStatus === 'paid'
    ) {
      return 'Confirmed';
    }

    if (registration.status === 'confirmed') {
      return 'Registered';
    }

    if (registration.status === 'pending') {
      return 'Pending Payment';
    }

    if (registration.status === 'cancelled') {
      return 'Cancelled';
    }

    return 'Expired';
  };

  const selectedQrTextLabel = selectedQrText ?? 'N/A';

  const wrapCanvasText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ) => {
    const words = text.split(/\s+/);
    let line = '';
    let currentY = y;
    words.forEach((word) => {
      const nextLine = line ? `${line} ${word}` : word;
      if (context.measureText(nextLine).width > maxWidth && line) {
        context.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
        return;
      }
      line = nextLine;
    });
    if (line) {
      context.fillText(line, x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  };

  const handleDownloadTicket = async () => {
    if (!selectedRegistration) {
      return;
    }

    const qrText =
      selectedQrText ??
      selectedRegistration.qrCode ??
      selectedRegistration.registrationCode;
    const qrSource =
      selectedRegistration.status === 'confirmed'
        ? selectedQrCode
        : getQrImageSource(qrText);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 700;
    const context = canvas.getContext('2d');

    if (!context) {
      setError('Unable to generate ticket image.');
      return;
    }

    context.fillStyle = '#f6fbf3';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#00663a';
    context.fillRect(0, 0, canvas.width, 180);
    context.fillStyle = '#ffffff';
    context.font = '700 54px Sora, sans-serif';
    context.fillText('UniHub Workshop Ticket', 72, 112);

    context.fillStyle = '#181d19';
    context.font = '700 46px Sora, sans-serif';
    const endY = wrapCanvasText(
      context,
      selectedRegistration.workshopTitle,
      72,
      280,
      680,
      56,
    );

    context.font = '500 32px Sora, sans-serif';
    context.fillStyle = '#3f4941';
    context.fillText(
      `Registration: ${selectedRegistration.registrationCode}`,
      72,
      endY + 24,
    );
    context.fillText(
      `Status: ${getStatusLabel(selectedRegistration)}`,
      72,
      endY + 78,
    );
    context.fillText(`Date: ${selectedRegistration.dateLabel}`, 72, endY + 132);
    context.fillText(`Time: ${selectedRegistration.timeLabel}`, 72, endY + 186);
    context.fillText(
      `Location: ${selectedRegistration.location}`,
      72,
      endY + 240,
    );
    context.fillText(
      `Speaker: ${selectedRegistration.speaker}`,
      72,
      endY + 294,
    );

    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous';

    await new Promise<void>((resolve) => {
      qrImage.onload = () => resolve();
      qrImage.onerror = () => resolve();
      qrImage.src = qrSource;
    });

    const qrX = 760;
    const qrY = 300;
    const qrSize = 260;
    context.fillStyle = '#ffffff';
    context.fillRect(qrX - 20, qrY - 20, qrSize + 32, qrSize + 32);
    if (qrImage.complete && qrImage.naturalWidth > 0) {
      context.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    }

    context.fillStyle = '#181d19';
    context.font = '700 26px Sora, sans-serif';
    context.fillText('QR Code Text', 72, 860);
    context.font = '600 24px "Courier New", monospace';
    wrapCanvasText(context, qrText, 72, 904, 936, 36);

    context.strokeStyle = '#becabe';
    context.lineWidth = 3;
    context.strokeRect(56, 56, canvas.width - 112, canvas.height - 112);

    try {
      const downloadLink = document.createElement('a');
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = `ticket-${selectedRegistration.registrationCode.toLowerCase()}.png`;
      downloadLink.click();
    } catch {
      setError(
        'Ticket export was blocked by image security constraints. Please try again.',
      );
    }
  };

  const isDownloadDisabled = !selectedRegistration || qrLoadState === 'loading';

  if (isLoading) {
    return (
      <div className="schedule-page">
        <WorkshopHeader
          activeTab="schedule"
          profileImage={imgStudentProfile}
          profileLink="/profile"
        />
        <main className="schedule-main">
          <LoadingSpinner label="Loading registrations..." />
        </main>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <WorkshopHeader
        activeTab="schedule"
        profileImage={session.student?.avatar ?? imgStudentProfile}
        profileLink={session.isAuthenticated ? '/profile' : undefined}
      />

      <main className="schedule-main">
        {session.isUnauthenticated ? (
          <SessionGate
            title="Sign in to view your schedule"
            description="Your registrations, QR codes, and check-in details are available after you log in to UniHub."
            primaryActionLabel="Log in"
            primaryActionTo="/sign-in"
          />
        ) : null}

        {session.isUnauthenticated ? null : (
          <div className="schedule-header">
            <div>
              <h1>My Registrations</h1>
              <p>Manage your upcoming workshops and view check-in details.</p>
            </div>
            <div className="schedule-status">
              <span className="schedule-pill">
                <span className="pill-dot registered" aria-hidden="true" />
                Registered
              </span>
              <span className="schedule-pill">
                <span className="pill-dot pending" aria-hidden="true" />
                Pending
              </span>
            </div>
          </div>
        )}
        {session.error ? <p className="helper-text">{session.error}</p> : null}
        {error ? <p className="helper-text">{error}</p> : null}
        {isLoading && session.isAuthenticated ? (
          <p className="helper-text">Loading registrations...</p>
        ) : null}

        {session.isUnauthenticated ? null : (
          <div className="schedule-grid">
            <section className="schedule-list" aria-label="Registrations">
              {registrations.map((registration) => {
                const isPending = registration.status === 'pending';

                return (
                  <article
                    key={registration.id}
                    className={getCardClassName(registration)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedRegistrationId === registration.id}
                    onClick={() => setSelectedRegistrationId(registration.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedRegistrationId(registration.id);
                      }
                    }}
                  >
                    <div
                      className={`schedule-card-media${isPending ? ' muted' : ''}`}
                    >
                      <img
                        src={registration.coverImage}
                        alt={`${registration.workshopTitle} workshop`}
                      />
                    </div>
                    <div className="schedule-card-body">
                      <div className="schedule-card-head">
                        <div>
                          <span
                            className={`schedule-tag ${
                              registration.status === 'confirmed'
                                ? 'registered'
                                : registration.status === 'pending'
                                  ? 'pending'
                                  : 'registered'
                            }`}
                          >
                            {registration.status === 'pending' ? (
                              <AlertCircle
                                className="icon icon-xs"
                                aria-hidden="true"
                              />
                            ) : (
                              <BadgeCheck
                                className="icon icon-xs"
                                aria-hidden="true"
                              />
                            )}
                            {getStatusLabel(registration)}
                          </span>
                          <h3 className={isPending ? 'muted' : undefined}>
                            {registration.workshopTitle}
                          </h3>
                          <p>
                            {registration.speaker} - {registration.location}
                          </p>
                        </div>
                        {isPending ? (
                          <button
                            type="button"
                            className="schedule-pay-now"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/checkout/${registration.workshopId}`);
                            }}
                          >
                            Pay Now
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="schedule-icon-button"
                            aria-label="Show QR code"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedRegistrationId(registration.id);
                            }}
                          >
                            <QrCode
                              className="icon icon-sm"
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </div>
                      <div className="schedule-meta">
                        <div>
                          <Calendar
                            className="icon icon-xs"
                            aria-hidden="true"
                          />
                          {registration.dateLabel}
                        </div>
                        <div>
                          {isPending ? (
                            <DollarSign
                              className="icon icon-xs"
                              aria-hidden="true"
                            />
                          ) : (
                            <Clock
                              className="icon icon-xs"
                              aria-hidden="true"
                            />
                          )}
                          {isPending
                            ? registration.priceLabel
                            : registration.timeLabel}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="schedule-panel" aria-label="Registration details">
              <div className="schedule-panel-header">
                <span className="schedule-panel-code">
                  {selectedRegistration?.registrationCode ?? 'REG-000-X'}
                </span>
                <h2>
                  {selectedRegistration?.workshopTitle ??
                    'No registration selected'}
                </h2>
              </div>

              <div className="schedule-panel-body">
                {selectedRegistration?.status === 'confirmed' ? (
                  <div className="schedule-qr">
                    <div className="schedule-qr-box">
                      {qrLoadState === 'loading' ? (
                        <div className="schedule-qr-loader" aria-live="polite">
                          <ClipLoader size={36} color="var(--schedule-brand)" />
                          <span>Loading QR...</span>
                        </div>
                      ) : (
                        <img src={selectedQrCode} alt="QR code for check-in" />
                      )}
                    </div>
                    <span>Scan at entrance</span>
                    <code className="schedule-qr-text">
                      QR text: {selectedQrTextLabel}
                    </code>
                  </div>
                ) : null}

                <div className="schedule-detail-grid">
                  <div className="schedule-detail-card">
                    <span>DATE</span>
                    <div>
                      <Calendar className="icon icon-xs" aria-hidden="true" />
                      {selectedRegistration?.dateLabel ?? 'N/A'}
                    </div>
                  </div>
                  <div className="schedule-detail-card">
                    <span>TIME</span>
                    <div>
                      <Clock className="icon icon-xs" aria-hidden="true" />
                      {selectedRegistration?.timeLabel ?? 'N/A'}
                    </div>
                  </div>
                  <div className="schedule-detail-card full">
                    <span>LOCATION</span>
                    <div>
                      <MapPin className="icon icon-xs" aria-hidden="true" />
                      {selectedRegistration?.location ?? 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="schedule-status-card">
                  <span>STATUS</span>
                  <strong>
                    {selectedRegistration
                      ? getStatusLabel(selectedRegistration)
                      : 'N/A'}
                  </strong>
                </div>

                <div className="schedule-instructor">
                  <img
                    src={
                      selectedRegistration?.instructorImage ?? imgStudentProfile
                    }
                    alt={selectedRegistration?.instructorName ?? 'Instructor'}
                  />
                  <div>
                    <span>INSTRUCTOR</span>
                    <strong>
                      {selectedRegistration?.instructorName ?? 'N/A'}
                    </strong>
                  </div>
                </div>

                <div className="schedule-ticket-actions">
                  {selectedRegistration?.status === 'pending' ? (
                    <button
                      type="button"
                      className="schedule-pay-now"
                      onClick={() =>
                        navigate(`/checkout/${selectedRegistration.workshopId}`)
                      }
                    >
                      Pay This Event
                    </button>
                  ) : null}
                  {selectedRegistration?.status === 'confirmed' ? (
                    <button
                      type="button"
                      className="schedule-primary-action"
                      onClick={() => void handleDownloadTicket()}
                      disabled={isDownloadDisabled}
                    >
                      <Download className="icon icon-sm" aria-hidden="true" />
                      Download Ticket
                    </button>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkshopSchedule;
