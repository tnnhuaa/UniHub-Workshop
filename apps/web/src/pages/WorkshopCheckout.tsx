import { useEffect, useState } from 'react';
import { Calendar, Lock, Timer, UserRound, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mapWorkshopToDetailViewModel } from '../lib/unihubAdapters.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import {
  createRegistration,
  fetchWorkshop,
  mockPaymentFailure,
  mockPaymentSuccess,
} from '../lib/unihubApi.ts';
import type { RegistrationCheckoutResponseDto } from '../lib/unihubApi.ts';
import SessionGate from '../components/SessionGate.tsx';
import useStudentSession from '../hooks/useStudentSession.ts';
import type {
  WorkshopDetailViewModel,
  UserProfileViewModel,
} from '../lib/unihubAdapters.ts';

const defaultWorkshopId = '1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01';
const HOLD_DURATION_MS = 10 * 60 * 1000;

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};

const formatHoldCountdown = (remainingMs: number | null) => {
  if (remainingMs === null) {
    return '10:00';
  }

  const clamped = Math.max(remainingMs, 0);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
};

const WorkshopCheckout = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const workshopId = id ?? defaultWorkshopId;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentResultModalState, setPaymentResultModalState] = useState<
    'paid' | 'failed' | null
  >(null);
  const [paymentState, setPaymentState] = useState<
    'idle' | 'processing' | 'paid' | 'failed'
  >('idle');
  const session = useStudentSession();
  const [workshop, setWorkshop] = useState<WorkshopDetailViewModel | null>(
    null,
  );
  const [student, setStudent] = useState<UserProfileViewModel | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [registrationResult, setRegistrationResult] =
    useState<RegistrationCheckoutResponseDto | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null,
  );
  const [paymentActionError, setPaymentActionError] = useState<string | null>(
    null,
  );
  const [reservationErrorCode, setReservationErrorCode] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationAttempt, setReservationAttempt] = useState(0);
  const [holdTimeLeftMs, setHoldTimeLeftMs] = useState<number | null>(null);
  const [autoReservationConsumed, setAutoReservationConsumed] = useState(false);
  const registrationFee = workshop?.price ?? 0;
  const isPaidWorkshop = registrationFee > 0;

  useEffect(() => {
    const loadCheckoutData = async () => {
      setIsLoading(true);
      setError(null);

      const workshopResult = await fetchWorkshop(workshopId);
      setIsLoading(false);

      if (!workshopResult.ok) {
        setError(workshopResult.error);
        return;
      }

      setWorkshop(mapWorkshopToDetailViewModel(workshopResult.data));
    };

    void loadCheckoutData();
  }, [workshopId]);

  useEffect(() => {
    if (session.status !== 'authenticated' || !session.student) {
      setStudent(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setAutoReservationConsumed(false);
      return;
    }

    const profile = session.student;
    const nameParts = splitFullName(profile.fullName);

    setStudent(profile);
    setFirstName(nameParts.firstName);
    setLastName(nameParts.lastName);
    setEmail(profile.email);
  }, [session.status, session.student]);

  useEffect(() => {
    setRegistrationResult(null);
    setPaymentActionError(null);
    setPaymentResultModalState(null);
    setSubmissionMessage(null);
    setError(null);
    setReservationErrorCode(null);
    setPaymentState('idle');
    setHoldTimeLeftMs(null);
    setAutoReservationConsumed(false);
  }, [workshopId]);

  const reservePaidSeat = async (attempt: number) => {
    if (!workshop || !student) {
      return;
    }

    setError(null);
    setReservationErrorCode(null);
    setPaymentActionError(null);
    setSubmissionMessage(null);
    setIsSubmitting(true);
    setPaymentState('idle');

    const result = await createRegistration(
      {
        mssv: student.mssv,
        workshopId: workshop.id,
      },
      `seat-hold-${workshop.id}-${student.mssv}-${attempt}`,
    );

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      setReservationErrorCode(result.code ?? null);
      if (
        result.code === 'WORKSHOP_FULL' ||
        result.code === 'WORKSHOP_NOT_AVAILABLE'
      ) {
        navigate(`/workshops/${workshop.id}`, { replace: true });
      }
      return;
    }

    setRegistrationResult(result.data);
    setSubmissionMessage(
      `Your seat is reserved for 10 minutes under registration ${result.data.registration.id}. Complete payment before the countdown ends to secure the spot.`,
    );
  };

  useEffect(() => {
    if (
      session.status !== 'authenticated' ||
      !student ||
      !workshop ||
      workshop.price <= 0 ||
      registrationResult ||
      isSubmitting ||
      autoReservationConsumed
    ) {
      return;
    }

    setAutoReservationConsumed(true);
    void reservePaidSeat(reservationAttempt);
  }, [
    autoReservationConsumed,
    isSubmitting,
    reservationAttempt,
    registrationResult,
    session.status,
    student,
    workshop,
  ]);

  useEffect(() => {
    if (!registrationResult?.registration.heldUntil) {
      setHoldTimeLeftMs(null);
      return;
    }

    const updateRemaining = () => {
      const remaining =
        new Date(
          registrationResult.registration.heldUntil as string,
        ).getTime() - Date.now();
      setHoldTimeLeftMs(Math.max(remaining, 0));
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [registrationResult?.registration.heldUntil]);

  useEffect(() => {
    if (
      !isPaidWorkshop ||
      !registrationResult ||
      registrationResult.registration.status !== 'pending' ||
      holdTimeLeftMs === null ||
      holdTimeLeftMs > 0
    ) {
      return;
    }

    setIsPaymentModalOpen(false);
    setPaymentResultModalState(null);
    setPaymentState('failed');
    setSubmissionMessage(
      `Reservation ${registrationResult.registration.id} expired after 10 minutes. We are reserving a new seat hold for you now if one is still available.`,
    );
    setRegistrationResult(null);
    setPaymentActionError(null);
    setHoldTimeLeftMs(HOLD_DURATION_MS);
    setAutoReservationConsumed(false);
    setReservationAttempt(Date.now());
  }, [holdTimeLeftMs, isPaidWorkshop, registrationResult]);

  const handlePay = async () => {
    if (!workshop || !student) {
      return;
    }

    if (isPaidWorkshop) {
      if (registrationResult?.payment?.paymentId) {
        setIsPaymentModalOpen(true);
        return;
      }

      void reservePaidSeat(Date.now());
      return;
    }

    setError(null);
    setReservationErrorCode(null);
    setPaymentActionError(null);
    setSubmissionMessage(null);
    setIsSubmitting(true);
    setPaymentState('idle');

    const result = await createRegistration(
      {
        mssv: student.mssv,
        workshopId: workshop.id,
      },
      `checkout-${workshop.id}-${student.mssv}`,
    );

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      setReservationErrorCode(result.code ?? null);
      return;
    }

    setRegistrationResult(result.data);
    setSubmissionMessage(
      result.data.paymentRequired
        ? `Payment was created for registration ${result.data.registration.id}. The backend returned mock payment endpoints for the next step.`
        : `Registration confirmed for ${student.fullName}. Your seat is secured, the in-app notification is stored, and the QR code is now available from My Schedule.`,
    );
    if (result.data.paymentRequired) {
      setIsPaymentModalOpen(true);
    }
  };

  const handleMockPaymentAction = async (action: 'success' | 'failure') => {
    const paymentId = registrationResult?.payment?.paymentId;
    if (!paymentId) {
      return;
    }

    setPaymentActionError(null);
    setIsPaymentSubmitting(true);
    setPaymentState('processing');
    setPaymentResultModalState(null);

    const result =
      action === 'success'
        ? await mockPaymentSuccess({ paymentId })
        : await mockPaymentFailure({ paymentId });

    setIsPaymentSubmitting(false);

    if (!result.ok) {
      setPaymentActionError(result.error);
      setPaymentState('idle');
      return;
    }

    setIsPaymentModalOpen(false);
    setRegistrationResult((current) =>
      current
        ? {
            ...current,
            registration: result.data.registration,
          }
        : current,
    );

    if (action === 'success') {
      setPaymentState('paid');
      setPaymentResultModalState('paid');
      setSubmissionMessage(
        `Payment confirmed for registration ${result.data.registration.id}. Your seat is secured, the hold has ended, and the QR code will appear in My Schedule.`,
      );
      return;
    }

    setPaymentState('failed');
    setPaymentResultModalState('failed');
    setSubmissionMessage(
      `Payment failed for registration ${result.data.registration.id}. Your reservation was released and you can try another workshop.`,
    );
  };

  const handleRetryReservation = () => {
    setError(null);
    setReservationErrorCode(null);
    setRegistrationResult(null);
    setPaymentActionError(null);
    setSubmissionMessage(null);
    setPaymentState('idle');
    setHoldTimeLeftMs(HOLD_DURATION_MS);
    setAutoReservationConsumed(false);
    setReservationAttempt(Date.now());
  };

  if (isLoading || session.isLoading) {
    return (
      <div className="checkout-page">
        <main className="checkout-main">
          <LoadingSpinner label="Loading checkout..." />
        </main>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="checkout-page">
        <main className="checkout-main">
          <p className="helper-text">{error ?? 'Workshop not found.'}</p>
        </main>
      </div>
    );
  }

  if (session.status === 'error') {
    return (
      <div className="checkout-page">
        <main className="checkout-main">
          <p className="helper-text">
            {session.error ?? 'Unable to load your account.'}
          </p>
        </main>
      </div>
    );
  }

  if (session.status === 'unauthenticated') {
    return (
      <div className="checkout-page">
        <header className="checkout-topbar">
          <div className="checkout-topbar-left">
            <button
              type="button"
              className="checkout-close"
              aria-label="Back to workshop details"
              onClick={() => navigate(`/workshops/${workshopId}`)}
            >
              <X className="icon icon-sm" aria-hidden="true" />
            </button>
            <h1>Complete Registration</h1>
          </div>
          <div className="checkout-topbar-right">
            <Lock className="icon icon-xs" aria-hidden="true" />
            <span>Sign in required</span>
          </div>
        </header>

        <main className="checkout-main">
          <div className="checkout-container">
            <SessionGate
              title={`Sign in to register for ${workshop.title}`}
              description="Log in with your UniHub account to complete this registration and access payment, QR code, and attendance details."
              primaryActionLabel="Log in"
              primaryActionTo="/sign-in"
            />
          </div>
        </main>
      </div>
    );
  }

  const holdExpired =
    isPaidWorkshop &&
    registrationResult?.registration.status === 'pending' &&
    holdTimeLeftMs !== null &&
    holdTimeLeftMs <= 0;
  const hasActiveHold =
    isPaidWorkshop &&
    registrationResult?.registration.status === 'pending' &&
    !holdExpired;
  const showWorkshopFullState =
    isPaidWorkshop &&
    !registrationResult &&
    reservationErrorCode === 'WORKSHOP_FULL';
  const showUnavailableState =
    isPaidWorkshop &&
    !registrationResult &&
    reservationErrorCode === 'WORKSHOP_NOT_AVAILABLE';
  const reservationBannerTitle = !isPaidWorkshop
    ? 'Ready to Register'
    : hasActiveHold
      ? 'Reservation Held'
      : showWorkshopFullState
        ? 'Workshop Full'
        : showUnavailableState
          ? 'Registration Closed'
          : isSubmitting
            ? 'Checking Availability'
            : holdExpired
              ? 'Reservation Expired'
              : 'Reserve Your Seat';
  const reservationBannerDescription = !isPaidWorkshop
    ? 'This workshop is free. Submit once to confirm your registration.'
    : hasActiveHold
      ? 'Your spot is locked for 10 minutes while you complete the payment flow.'
      : showWorkshopFullState
        ? 'Another student is already holding the last available seat. Try again if the hold expires or payment fails.'
        : showUnavailableState
          ? 'This workshop is no longer accepting registrations.'
          : isSubmitting
            ? 'We are asking the backend to lock an available seat before payment starts.'
            : holdExpired
              ? 'This temporary hold has expired. Reserve again to continue with payment.'
              : 'Reserve a seat first, then complete payment within 10 minutes.';
  const reservationTimerLabel = !isPaidWorkshop
    ? 'FREE'
    : hasActiveHold
      ? formatHoldCountdown(holdTimeLeftMs)
      : showWorkshopFullState
        ? 'FULL'
        : showUnavailableState
          ? 'CLOSED'
          : isSubmitting
            ? '...'
            : '10:00';
  const paymentActionsDisabled =
    isPaymentSubmitting ||
    paymentState === 'paid' ||
    paymentState === 'failed' ||
    holdExpired;
  const showRegistrationStatusCard =
    showWorkshopFullState || (!isPaidWorkshop && Boolean(submissionMessage));
  const paymentResultTitle =
    paymentResultModalState === 'paid'
      ? 'Payment confirmed'
      : 'Payment failed';
  const paymentResultDescription =
    paymentResultModalState === 'paid'
      ? 'Your seat is secured and the QR code is now available from My Schedule.'
      : 'The payment did not complete. You can reserve again or browse other workshops.';
  const hasPendingPaymentSession =
    isPaidWorkshop &&
    registrationResult?.registration.status === 'pending' &&
    Boolean(registrationResult?.payment?.paymentId) &&
    !holdExpired;
  const primaryCtaDisabled =
    isSubmitting ||
    showWorkshopFullState ||
    showUnavailableState ||
    (!isPaidWorkshop && Boolean(submissionMessage));
  const primaryCtaLabel = isSubmitting
    ? 'Processing...'
    : isPaidWorkshop
      ? showWorkshopFullState
        ? 'Workshop Full'
        : showUnavailableState
          ? 'Registration Closed'
          : hasPendingPaymentSession
            ? 'Complete Payment'
            : 'Reserve Seat'
      : 'Register Now';

  return (
    <div className="checkout-page">
      <header className="checkout-topbar">
        <div className="checkout-topbar-left">
          <button
            type="button"
            className="checkout-close"
            aria-label="Back to workshop details"
            onClick={() => navigate(`/workshops/${workshopId}`)}
          >
            <X className="icon icon-sm" aria-hidden="true" />
          </button>
          <h1>Complete Registration</h1>
        </div>
        <div className="checkout-topbar-right">
          <Lock className="icon icon-xs" aria-hidden="true" />
          <span>
            {isPaidWorkshop ? 'Secure Checkout' : 'Instant Registration'}
          </span>
        </div>
      </header>

      <main className="checkout-main">
        <div className="checkout-container">
          {error ? <p className="helper-text">{error}</p> : null}
          <section className="reservation-banner">
            <div className="reservation-info">
              <div className="reservation-icon">
                <Timer className="icon icon-sm" aria-hidden="true" />
              </div>
              <div>
                <h2>{reservationBannerTitle}</h2>
                <p>{reservationBannerDescription}</p>
              </div>
            </div>
            <div className="reservation-timer">
              <span>{reservationTimerLabel}</span>
            </div>
          </section>

          {showRegistrationStatusCard ? (
            <section className="checkout-card">
              <div className="checkout-card-header">
                <Lock className="icon icon-sm" aria-hidden="true" />
                <h2>Registration Status</h2>
              </div>
              {submissionMessage ? (
                <p
                  className="helper-text"
                  style={{ textAlign: 'left', marginTop: 0 }}
                >
                  {submissionMessage}
                </p>
              ) : null}
              {showWorkshopFullState ? (
                <div className="checkout-form-stack">
                  <button
                    type="button"
                    className="checkout-pay"
                    onClick={handleRetryReservation}
                    disabled={isSubmitting}
                  >
                    Check Again
                  </button>
                  <button
                    type="button"
                    className="checkout-pay"
                    onClick={() => navigate('/workshops')}
                  >
                    Browse Workshops
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="checkout-grid">
            <div className="checkout-column">
              <section className="checkout-card">
                <div className="checkout-card-header">
                  <UserRound className="icon icon-sm" aria-hidden="true" />
                  <h2>Attendee Details</h2>
                </div>
                <div className="checkout-form-grid">
                  <label className="checkout-field">
                    <span>First Name</span>
                    <input type="text" value={firstName} readOnly />
                  </label>
                  <label className="checkout-field">
                    <span>Last Name</span>
                    <input type="text" value={lastName} readOnly />
                  </label>
                  <label className="checkout-field full">
                    <span>Email Address</span>
                    <input type="email" value={email} readOnly />
                  </label>
                </div>
              </section>
            </div>

            <aside className="checkout-summary">
              <div className="checkout-summary-image">
                <img src={workshop.coverImage} alt="Workshop preview" />
              </div>
              <div className="checkout-summary-content">
                <div className="checkout-tags">
                  <span className="checkout-tag">In-Person</span>
                  <span className="checkout-tag secondary">
                    {workshop.category}
                  </span>
                </div>
                <h3>{workshop.title}</h3>
                <p
                  className="checkout-note"
                  style={{ textAlign: 'left', marginTop: 0 }}
                >
                  {workshop.summary}
                </p>
                <div className="checkout-date">
                  <Calendar className="icon icon-xs" aria-hidden="true" />
                  {new Date(workshop.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                  })}{' '}
                  •{' '}
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
                <div className="checkout-divider" />
                <div className="checkout-pricing">
                  <div className="checkout-price-row">
                    <span>Registration Fee</span>
                    <span>${registrationFee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="checkout-divider dashed" />
                <div className="checkout-total">
                  <span>Total</span>
                  <strong>${registrationFee.toFixed(2)}</strong>
                </div>
                <button
                  type="button"
                  className="checkout-pay"
                  onClick={() => void handlePay()}
                  disabled={primaryCtaDisabled}
                >
                  <Lock className="icon icon-sm" aria-hidden="true" />
                  {primaryCtaLabel}
                </button>
                <p className="checkout-note">
                  {isPaidWorkshop
                    ? 'By paying, you agree to the UniHub cancellation policy.'
                    : 'No payment is required for this workshop.'}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      {isPaymentModalOpen ? (
        <div className="checkout-modal-overlay" role="dialog" aria-modal>
          <div className="checkout-modal">
            <h3>Confirm mock payment</h3>
            <p>Choose the outcome to finalize this registration.</p>
            <div className="checkout-modal-actions">
              <button
                type="button"
                className="checkout-pay"
                onClick={() => void handleMockPaymentAction('success')}
                disabled={paymentActionsDisabled}
              >
                Success
              </button>
              <button
                type="button"
                className="checkout-pay"
                onClick={() => void handleMockPaymentAction('failure')}
                disabled={paymentActionsDisabled}
              >
                Failure
              </button>
            </div>
            <button
              type="button"
              className="checkout-modal-close"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={paymentActionsDisabled}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {paymentResultModalState ? (
        <div className="checkout-modal-overlay" role="dialog" aria-modal>
          <div className="checkout-modal">
            <h3>{paymentResultTitle}</h3>
            <p>{paymentResultDescription}</p>
            {paymentActionError ? (
              <p className="helper-text" style={{ textAlign: 'left', margin: 0 }}>
                {paymentActionError}
              </p>
            ) : null}
            <div className="checkout-modal-actions">
              {paymentResultModalState === 'paid' ? (
                <>
                  <button
                    type="button"
                    className="checkout-pay success"
                    onClick={() => navigate('/schedule')}
                  >
                    Open My Schedule
                  </button>
                  <button
                    type="button"
                    className="checkout-pay secondary"
                    onClick={() => setPaymentResultModalState(null)}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="checkout-pay"
                    onClick={handleRetryReservation}
                  >
                    Retry Reservation
                  </button>
                  <button
                    type="button"
                    className="checkout-pay secondary"
                    onClick={() => navigate('/workshops')}
                  >
                    Browse Workshops
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WorkshopCheckout;
