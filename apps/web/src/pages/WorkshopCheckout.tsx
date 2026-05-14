import { useEffect, useState } from 'react';
import {
  Calendar,
  CreditCard,
  Lock,
  ShieldCheck,
  Timer,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import SessionGate from '../components/SessionGate.tsx';
import useStudentSession from '../hooks/useStudentSession.ts';
import { mapWorkshopToDetailViewModel } from '../lib/unihubAdapters.ts';
import { createRegistration, fetchWorkshop } from '../lib/unihubApi.ts';
import type { RegistrationCheckoutResponseDto } from '../lib/unihubApi.ts';
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
  const session = useStudentSession();
  const [workshop, setWorkshop] = useState<WorkshopDetailViewModel | null>(
    null,
  );
  const [student, setStudent] = useState<UserProfileViewModel | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber] = useState('');
  const [expiryDate] = useState('');
  const [cvc] = useState('');
  const [registrationResult, setRegistrationResult] =
    useState<RegistrationCheckoutResponseDto | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setCardholderName('');
      return;
    }

    const profile = session.student;
    const nameParts = splitFullName(profile.fullName);

    setStudent(profile);
    setFirstName(nameParts.firstName);
    setLastName(nameParts.lastName);
    setEmail(profile.email);
    setCardholderName(profile.fullName);
  }, [session.status, session.student]);

  const handlePay = async () => {
    if (!workshop || !student) {
      return;
    }

    setError(null);
    setSubmissionMessage(null);
    setIsSubmitting(true);

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
        ? `Payment was created for registration ${result.data.registration.id}. The backend returned mock payment endpoints for the next step.`
        : `Registration confirmed for ${student.fullName}. The QR code is now available from your schedule.`,
    );
  };

  if (isLoading || session.isLoading) {
    return (
      <div className="checkout-page">
        <main className="checkout-main">
          <p className="helper-text">Loading checkout...</p>
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

              <section className="checkout-card payment-card">
                <div className="checkout-card-accent" aria-hidden="true" />
                <div className="checkout-card-header">
                  <CreditCard className="icon icon-sm" aria-hidden="true" />
                  <h2>
                    {isPaidWorkshop ? 'Payment Method' : 'Payment Not Required'}
                  </h2>
                </div>
                <div className="checkout-form-stack">
                  <label className="checkout-field">
                    <span>Name on Card</span>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={cardholderName}
                      readOnly
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Card Number</span>
                    <div className="checkout-input icon-left">
                      <CreditCard className="icon icon-sm" aria-hidden="true" />
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        readOnly
                      />
                    </div>
                  </label>
                  <div className="checkout-form-grid">
                    <label className="checkout-field">
                      <span>Expiry Date</span>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        readOnly
                      />
                    </label>
                    <label className="checkout-field">
                      <span>CVC</span>
                      <div className="checkout-input icon-right">
                        <input
                          type="text"
                          placeholder="123"
                          value={cvc}
                          readOnly
                        />
                        <ShieldCheck
                          className="icon icon-sm"
                          aria-hidden="true"
                        />
                      </div>
                    </label>
                  </div>
                  {!isPaidWorkshop ? (
                    <p className="checkout-note" style={{ textAlign: 'left' }}>
                      This workshop is free, so the backend confirms the
                      registration immediately.
                    </p>
                  ) : null}
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
    </div>
  );
};

export default WorkshopCheckout;
