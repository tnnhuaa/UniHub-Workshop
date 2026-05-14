import { useEffect, useState } from 'react';
import { Calendar, Check, Clock, MapPin, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import WorkshopHeader from '../components/WorkshopHeader.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import useStudentSession from '../hooks/useStudentSession.ts';
import { mapWorkshopToDetailViewModel } from '../lib/unihubAdapters.ts';
import { fetchMyRegistrations, fetchWorkshop } from '../lib/unihubApi.ts';
import type { WorkshopDetailViewModel } from '../lib/unihubAdapters.ts';

const imgStudentProfile = '/figma-mcp/22492359-f12d-464a-b95a-fb292c891cc8.jpg';
const imgSpeakerProfile = '/figma-mcp/d068b264-bedc-481e-99ad-9b6f92676680.jpg';
const imgMapLocation = '/figma-mcp/2bdc588e-4301-40b3-8b99-53cbc5b02add.png';

const defaultWorkshopId = '1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01';
const DETAIL_REFRESH_MS = 15_000;

const WorkshopDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const workshopId = id ?? defaultWorkshopId;
  const session = useStudentSession();
  const [workshop, setWorkshop] = useState<WorkshopDetailViewModel | null>(
    null,
  );
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seatsFilled = workshop ? workshop.occupiedSeats : 0;
  const capacityUsagePercent =
    workshop && workshop.capacity > 0
      ? Math.round((seatsFilled / workshop.capacity) * 100)
      : 0;
  const registrationDisabled =
    workshop?.status === 'cancelled' ||
    (workshop?.isSoldOut && !hasPendingPayment);
  const registrationLabel =
    workshop?.status === 'cancelled'
      ? 'Unavailable'
      : hasPendingPayment
        ? 'Complete Payment'
        : workshop?.isSoldOut
          ? 'Sold Out'
          : workshop?.price && workshop.price > 0
            ? 'Reserve Seat'
            : 'Register Now';
  const showPaidHoldNote =
    (workshop?.price ?? 0) > 0 &&
    workshop?.status !== 'cancelled' &&
    !workshop?.isSoldOut;
  const showSoldOutHoldNote =
    (workshop?.activeHoldCount ?? 0) > 0 && Boolean(workshop?.isSoldOut);

  useEffect(() => {
    const loadWorkshop = async (options?: { background?: boolean }) => {
      if (!options?.background) {
        setIsLoading(true);
        setError(null);
      }

      const result = await fetchWorkshop(workshopId);
      if (!options?.background) {
        setIsLoading(false);
      }

      if (!result.ok) {
        if (!options?.background) {
          setError(result.error);
        }
        return;
      }

      setWorkshop(mapWorkshopToDetailViewModel(result.data));
    };

    void loadWorkshop();
    const intervalId = window.setInterval(() => {
      void loadWorkshop({ background: true });
    }, DETAIL_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [workshopId]);

  useEffect(() => {
    const loadPendingRegistration = async () => {
      if (!session.isAuthenticated) {
        setHasPendingPayment(false);
        return;
      }

      const result = await fetchMyRegistrations({ page: 1, pageSize: 100 });
      if (!result.ok) {
        return;
      }

      const now = Date.now();
      const hasActiveHold = result.data.some(
        (registration) =>
          registration.workshopId === workshopId &&
          registration.status === 'pending' &&
          registration.paymentStatus === 'pending' &&
          Boolean(registration.heldUntil) &&
          new Date(registration.heldUntil as string).getTime() > now,
      );

      setHasPendingPayment(hasActiveHold);
    };

    void loadPendingRegistration();
  }, [session.isAuthenticated, workshopId]);

  if (isLoading) {
    return (
      <div className="workshop-detail-page">
        <WorkshopHeader
          activeTab="workshops"
          profileImage={session.student?.avatar ?? imgStudentProfile}
          profileLink={session.isAuthenticated ? '/profile' : undefined}
        />
        <main className="workshop-detail-main">
          <LoadingSpinner label="Loading workshop details..." />
        </main>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="workshop-detail-page">
        <WorkshopHeader
          activeTab="workshops"
          profileImage={session.student?.avatar ?? imgStudentProfile}
          profileLink={session.isAuthenticated ? '/profile' : undefined}
        />
        <main className="workshop-detail-main">
          <p className="helper-text">{error ?? 'Workshop not found.'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="workshop-detail-page">
      <WorkshopHeader
        activeTab="workshops"
        profileImage={session.student?.avatar ?? imgStudentProfile}
        profileLink={session.isAuthenticated ? '/profile' : undefined}
      />

      <main className="workshop-detail-main">
        <div className="detail-grid">
          <section className="detail-left">
            <Link className="detail-back" to="/workshops">
              &larr; Back to Workshops
            </Link>
            <div className="detail-hero">
              <div className="detail-hero-tags">
                <span className="detail-pill">
                  {workshop.status === 'cancelled'
                    ? 'Cancelled'
                    : workshop.isSoldOut
                      ? 'Sold Out'
                      : 'Open'}
                </span>
                <span className="detail-tag">{workshop.category}</span>
              </div>
              <h1>{workshop.title}</h1>
              <p>{workshop.description}</p>
            </div>

            <section className="detail-summary">
              <div className="summary-icon">
                <Sparkles className="icon" aria-hidden="true" />
              </div>
              <div>
                <h2>AI Summary</h2>
                <p>{workshop.summary}</p>
              </div>
            </section>

            <section className="detail-speaker">
              <div className="speaker-avatar">
                <img
                  src={workshop.speakerAvatar ?? imgSpeakerProfile}
                  alt={workshop.speaker}
                />
              </div>
              <div>
                <h3>{workshop.speaker}</h3>
                <p>{workshop.speakerTitle}</p>
              </div>
            </section>

            <section className="detail-about">
              <h2>About this Workshop</h2>
              <p>{workshop.about}</p>
              <ul>
                {workshop.takeaways.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </section>

          <aside className="detail-right">
            <section className="detail-card action-card">
              <div className="action-top">
                <div>
                  <h3>
                    {workshop.price === 0
                      ? 'Free'
                      : `$${workshop.price.toFixed(2)}`}
                  </h3>
                  <span>
                    {workshop.price === 0 ? 'For Students' : 'Paid Workshop'}
                  </span>
                </div>
                <div className="action-seats">
                  <span>
                    {seatsFilled} / {workshop.capacity} Seats
                  </span>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${capacityUsagePercent}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="action-meta">
                <div>
                  <Calendar className="icon icon-md" aria-hidden="true" />
                  {new Date(workshop.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </div>
                <div>
                  <Clock className="icon icon-md" aria-hidden="true" />
                  {new Date(workshop.startTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(workshop.endTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                <div>
                  <MapPin className="icon icon-md" aria-hidden="true" />
                  {workshop.room}
                </div>
              </div>
              <button
                type="button"
                className={`detail-register${
                  registrationDisabled ? ' is-disabled' : ''
                }`}
                onClick={() => {
                  if (!registrationDisabled) {
                    navigate(`/workshops/${workshopId}/register`);
                  }
                }}
                disabled={registrationDisabled}
              >
                <Check className="icon icon-md" aria-hidden="true" />
                {registrationLabel}
              </button>
              {showPaidHoldNote ? (
                <p className="helper-text detail-register-note">
                  {hasPendingPayment
                    ? 'Your seat is still on hold. Complete payment before the 10-minute reservation expires.'
                    : 'Entering registration will reserve 1 seat for 10 minutes while you complete payment.'}
                  {workshop.activeHoldCount > 0
                    ? ` ${workshop.activeHoldCount} seat${workshop.activeHoldCount > 1 ? 's are' : ' is'} currently on hold across this workshop.`
                    : ''}
                </p>
              ) : null}
              {showSoldOutHoldNote ? (
                <p className="helper-text detail-register-note">
                  All remaining seats are temporarily on 10-minute hold. This
                  page refreshes automatically when a hold expires or payment
                  fails.
                </p>
              ) : null}
            </section>

            <section className="detail-card map-card">
              <span className="map-label">Location</span>
              <div className="map-preview">
                <img src={workshop.floorMapImage ?? imgMapLocation} alt="" />
                <div className="map-pin">
                  <MapPin className="icon" aria-hidden="true" />
                </div>
              </div>
              <p>{workshop.locationLabel}</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default WorkshopDetail;
