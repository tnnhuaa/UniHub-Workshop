import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  MoreHorizontal,
  QrCode,
  XCircle,
} from 'lucide-react';
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
  const session = useStudentSession();
  const [registrations, setRegistrations] = useState<
    ScheduleRegistrationViewModel[]
  >([]);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<
    string | null
  >(null);
  const [selectedQrCode, setSelectedQrCode] = useState(getQrImageSource(null));
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
        return;
      }

      if (selectedRegistration.status !== 'confirmed') {
        setSelectedQrCode(getQrImageSource(null));
        return;
      }

      const qrResult = await fetchRegistrationQr(selectedRegistration.id);
      if (!qrResult.ok) {
        setError(qrResult.error);
        setSelectedQrCode(getQrImageSource(selectedRegistration.qrCode));
        return;
      }

      setSelectedQrCode(getQrImageSource(qrResult.data.qrCode));
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

  const selectedQrCaption =
    selectedRegistration?.status === 'confirmed'
      ? 'Scan at entrance'
      : 'QR code becomes available after confirmation';

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
                            {registration.speaker} � {registration.location}
                          </p>
                        </div>
                        {isPending ? (
                          <button
                            type="button"
                            className="schedule-pay-now"
                            disabled
                          >
                            Awaiting Payment
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
                <div className="schedule-panel-actions">
                  <button type="button" className="schedule-icon-button">
                    <MoreHorizontal
                      className="icon icon-sm"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <span className="schedule-panel-code">
                  {selectedRegistration?.registrationCode ?? 'REG-000-X'}
                </span>
                <h2>
                  {selectedRegistration?.workshopTitle ??
                    'No registration selected'}
                </h2>
              </div>

              <div className="schedule-panel-body">
                <div className="schedule-qr">
                  <div className="schedule-qr-box">
                    <img src={selectedQrCode} alt="QR code for check-in" />
                  </div>
                  <span>{selectedQrCaption}</span>
                </div>

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

                <button
                  type="button"
                  className="schedule-cancel"
                  disabled
                  title="Cancellation is not available in the current backend contract"
                >
                  <XCircle className="icon icon-sm" aria-hidden="true" />
                  Cancel Registration
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkshopSchedule;
