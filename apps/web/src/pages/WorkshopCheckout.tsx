import { useEffect, useState } from "react";
import {
  Calendar,
  CreditCard,
  Lock,
  ShieldCheck,
  Timer,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createMockRegistration,
  formatMockRequestAlert,
  getMockStudentProfile,
  getMockWorkshopDetail,
  type MockWorkshopDetail,
} from "../lib/mockApi.ts";

const imgWorkshopHeader =
  "https://www.figma.com/api/mcp/asset/1b8cc43f-4e00-42b2-9a62-ff2bb6e5389a";

const defaultWorkshopId = "11111111-1111-4111-8111-111111111111";

const WorkshopCheckout = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const workshopId = id ?? defaultWorkshopId;
  const [workshop, setWorkshop] = useState<MockWorkshopDetail | null>(null);
  const [mssv, setMssv] = useState("STU-84920");
  const [firstName, setFirstName] = useState("Jane");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("jane.doe@university.edu");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCheckoutData = async () => {
      setIsLoading(true);
      setError(null);

      // Replace these mock reads with real workshop/profile requests later.
      const [workshopResult, studentResult] = await Promise.all([
        getMockWorkshopDetail(workshopId),
        getMockStudentProfile("STU-84920"),
      ]);

      setIsLoading(false);

      if (!workshopResult.ok) {
        setError(workshopResult.error);
        return;
      }

      if (!studentResult.ok) {
        setError(studentResult.error);
        return;
      }

      setWorkshop(workshopResult.data);
      setMssv(studentResult.data.mssv);

      const [first, ...rest] = studentResult.data.fullName.split(" ");
      setFirstName(first ?? "");
      setLastName(rest.join(" "));
      setEmail(studentResult.data.email);
      setCardholderName(studentResult.data.fullName);
    };

    void loadCheckoutData();
  }, [workshopId]);

  const handlePay = async () => {
    if (!workshop) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Replace this mock registration submit with the real POST /registrations flow later.
    const result = await createMockRegistration({
      mssv,
      workshopId: workshop.id,
      attendee: {
        firstName,
        lastName,
        email,
      },
      payment: {
        cardholderName,
        cardNumber,
        expiryDate,
        cvc,
      },
      idempotencyKey: `checkout-${workshop.id}`,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // Remove this debug alert when the page is connected to the real API flow.
    window.alert(formatMockRequestAlert(result.request));
  };

  if (isLoading) {
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
          <p className="helper-text">{error ?? "Workshop not found."}</p>
        </main>
      </div>
    );
  }

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
          <span>Secure Checkout</span>
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
                <h2>Reservation Held</h2>
                <p>
                  Your spot is temporarily locked. Please complete your payment.
                </p>
              </div>
            </div>
            <div className="reservation-timer">
              <span>09:45</span>
            </div>
          </section>

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
                    <input
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Last Name</span>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </label>
                  <label className="checkout-field full">
                    <span>Email Address</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="checkout-card payment-card">
                <div className="checkout-card-accent" aria-hidden="true" />
                <div className="checkout-card-header">
                  <CreditCard className="icon icon-sm" aria-hidden="true" />
                  <h2>Payment Method</h2>
                </div>
                <div className="checkout-form-stack">
                  <label className="checkout-field">
                    <span>Name on Card</span>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={cardholderName}
                      onChange={(event) => setCardholderName(event.target.value)}
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
                        onChange={(event) => setCardNumber(event.target.value)}
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
                        onChange={(event) => setExpiryDate(event.target.value)}
                      />
                    </label>
                    <label className="checkout-field">
                      <span>CVC</span>
                      <div className="checkout-input icon-right">
                        <input
                          type="text"
                          placeholder="123"
                          value={cvc}
                          onChange={(event) => setCvc(event.target.value)}
                        />
                        <ShieldCheck className="icon icon-sm" aria-hidden="true" />
                      </div>
                    </label>
                  </div>
                </div>
              </section>
            </div>

            <aside className="checkout-summary">
              <div className="checkout-summary-image">
                <img src={workshop.coverImage ?? imgWorkshopHeader} alt="Workshop preview" />
              </div>
              <div className="checkout-summary-content">
                <div className="checkout-tags">
                  <span className="checkout-tag">In-Person</span>
                  <span className="checkout-tag secondary">{workshop.category}</span>
                </div>
                <h3>
                  {workshop.title}
                </h3>
                <div className="checkout-date">
                  <Calendar className="icon icon-xs" aria-hidden="true" />
                  {new Date(workshop.startTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })}{" "}
                  •{" "}
                  {new Date(workshop.startTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(workshop.endTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <div className="checkout-divider" />
                <div className="checkout-pricing">
                  <div className="checkout-price-row">
                    <span>Registration Fee</span>
                    <span>${workshop.price.toFixed(2)}</span>
                  </div>
                  <div className="checkout-price-row">
                    <span>Materials Fee</span>
                    <span>$25.00</span>
                  </div>
                  <div className="checkout-price-row">
                    <span>Tax</span>
                    <span>${(workshop.price * 0.0993).toFixed(2)}</span>
                  </div>
                </div>
                <div className="checkout-divider dashed" />
                <div className="checkout-total">
                  <span>Total</span>
                  <strong>${(workshop.price + 25 + workshop.price * 0.0993).toFixed(2)}</strong>
                </div>
                <button
                  type="button"
                  className="checkout-pay"
                  onClick={() => void handlePay()}
                  disabled={isSubmitting}
                >
                  <Lock className="icon icon-sm" aria-hidden="true" />
                  {isSubmitting ? "Processing..." : "Pay & Register"}
                </button>
                <p className="checkout-note">
                  By paying, you agree to the UniHub cancellation policy.
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
