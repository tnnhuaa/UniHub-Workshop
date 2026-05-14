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
import type {
  PaymentActionResponseDto,
  RegistrationCheckoutResponseDto,
} from '../lib/unihubApi.ts';
import SessionGate from '../components/SessionGate.tsx';
import useStudentSession from '../hooks/useStudentSession.ts';
import type {
  WorkshopDetailViewModel,
  UserProfileViewModel,
} from '../lib/unihubAdapters.ts';

const defaultWorkshopId = '1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01';

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};

const WorkshopCheckout = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const workshopId = id ?? defaultWorkshopId;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
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
  const [paymentActionResult, setPaymentActionResult] =
    useState<PaymentActionResponseDto | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null,
  );
  const [paymentActionError, setPaymentActionError] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      return;
    }

    const profile = session.student;
    const nameParts = splitFullName(profile.fullName);

    setStudent(profile);
    setFirstName(nameParts.firstName);
    setLastName(nameParts.lastName);
    setEmail(profile.email);
  }, [session.status, session.student]);

  const handlePay = async () => {
    if (!workshop || !student) {
      return;
    }

    setError(null);
    setPaymentActionError(null);
    setPaymentActionResult(null);
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
      return;
    }

    setRegistrationResult(result.data);
    setSubmissionMessage(
      result.data.paymentRequired
        ? `Your workshop registration is pending payment. Complete payment to receive the final confirmation in the app and by email.`
        : `Your workshop registration is confirmed. A confirmation is now available in the app and has been queued for email delivery.`,
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

    setPaymentActionResult(result.data);
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
      setSubmissionMessage(
        'Your workshop registration is confirmed. The app inbox has been updated and the email confirmation has been queued.',
      );
      return;
    }

    setPaymentState('failed');
    setSubmissionMessage(
      `Payment failed for registration ${result.data.registration.id}. Your reservation was released and you can try another workshop.`,
    );
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

  const registrationFee = workshop.price;
  const isPaidWorkshop = registrationFee > 0;
  const paymentId = registrationResult?.payment?.paymentId ?? null;
  const paymentActionsDisabled =
    isPaymentSubmitting || paymentState === 'paid' || paymentState === 'failed';

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
                <h2>
                  {isPaidWorkshop ? 'Reservation Held' : 'Ready to Register'}
                </h2>
                <p>
                  {isPaidWorkshop
                    ? 'Your spot is temporarily locked while the backend prepares the payment record.'
                    : 'This workshop is free. Submit once to confirm your registration.'}
                </p>
              </div>
            </div>
            <div className="reservation-timer">
              <span>{isPaidWorkshop ? '09:45' : 'FREE'}</span>
            </div>
          </section>

          {submissionMessage ? (
            <section className="checkout-card">
              <div className="checkout-card-header">
                <Lock className="icon icon-sm" aria-hidden="true" />
                <h2>Registration Status</h2>
              </div>
              <p
                className="helper-text"
                style={{ textAlign: 'left', marginTop: 0 }}
              >
                {submissionMessage}
              </p>
              {registrationResult?.paymentRequired &&
              registrationResult.payment ? (
                <div className="checkout-pricing">
                  <div className="checkout-price-row">
                    <span>Payment ID</span>
                    <span>
                      {registrationResult.payment.paymentId ?? 'Pending'}
                    </span>
                  </div>
                  {paymentActionResult?.payment ? (
                    <div className="checkout-price-row">
                      <span>Payment status</span>
                      <span>{paymentActionResult.payment.status}</span>
                    </div>
                  ) : null}
                  <div className="checkout-price-row">
                    <span>Success endpoint</span>
                    <span>
                      {registrationResult.payment.mockActions
                        ?.successEndpoint ?? 'N/A'}
                    </span>
                  </div>
                  <div className="checkout-price-row">
                    <span>Failure endpoint</span>
                    <span>
                      {registrationResult.payment.mockActions
                        ?.failureEndpoint ?? 'N/A'}
                    </span>
                  </div>
                </div>
              ) : null}
              {registrationResult?.paymentRequired && paymentId ? (
                <div className="checkout-form-stack">
                  <button
                    type="button"
                    className="checkout-pay"
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={paymentActionsDisabled}
                  >
                    {isPaymentSubmitting && paymentState === 'processing'
                      ? 'Processing...'
                      : 'Simulate Payment'}
                  </button>
                  {paymentState === 'paid' ? (
                    <button
                      type="button"
                      className="checkout-pay"
                      onClick={() => navigate('/schedule')}
                    >
                      Open My Schedule
                    </button>
                  ) : null}
                  {paymentState === 'failed' ? (
                    <button
                      type="button"
                      className="checkout-pay"
                      onClick={() => navigate('/workshops')}
                    >
                      Browse Workshops
                    </button>
                  ) : null}
                  {paymentActionError ? (
                    <p
                      className="helper-text"
                      style={{ textAlign: 'left', marginTop: 0 }}
                    >
                      {paymentActionError}
                    </p>
                  ) : null}
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
                  disabled={isSubmitting || Boolean(submissionMessage)}
                >
                  <Lock className="icon icon-sm" aria-hidden="true" />
                  {isSubmitting
                    ? 'Processing...'
                    : isPaidWorkshop
                      ? 'Pay & Register'
                      : 'Register Now'}
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
    </div>
  );
};

export default WorkshopCheckout;
