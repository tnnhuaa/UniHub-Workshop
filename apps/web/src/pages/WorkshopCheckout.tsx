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

const imgWorkshopHeader =
  "https://www.figma.com/api/mcp/asset/1b8cc43f-4e00-42b2-9a62-ff2bb6e5389a";

const WorkshopCheckout = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const workshopId = id ?? "featured";

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
                    <input type="text" defaultValue="Jane" />
                  </label>
                  <label className="checkout-field">
                    <span>Last Name</span>
                    <input type="text" defaultValue="Doe" />
                  </label>
                  <label className="checkout-field full">
                    <span>Email Address</span>
                    <input
                      type="email"
                      defaultValue="jane.doe@university.edu"
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
                    <input type="text" placeholder="e.g. Jane Doe" />
                  </label>
                  <label className="checkout-field">
                    <span>Card Number</span>
                    <div className="checkout-input icon-left">
                      <CreditCard className="icon icon-sm" aria-hidden="true" />
                      <input type="text" placeholder="0000 0000 0000 0000" />
                    </div>
                  </label>
                  <div className="checkout-form-grid">
                    <label className="checkout-field">
                      <span>Expiry Date</span>
                      <input type="text" placeholder="MM/YY" />
                    </label>
                    <label className="checkout-field">
                      <span>CVC</span>
                      <div className="checkout-input icon-right">
                        <input type="text" placeholder="123" />
                        <ShieldCheck className="icon icon-sm" aria-hidden="true" />
                      </div>
                    </label>
                  </div>
                </div>
              </section>
            </div>

            <aside className="checkout-summary">
              <div className="checkout-summary-image">
                <img src={imgWorkshopHeader} alt="Workshop preview" />
              </div>
              <div className="checkout-summary-content">
                <div className="checkout-tags">
                  <span className="checkout-tag">In-Person</span>
                  <span className="checkout-tag secondary">Professional Dev</span>
                </div>
                <h3>
                  Advanced React & State
                  <span>Architecture</span>
                </h3>
                <div className="checkout-date">
                  <Calendar className="icon icon-xs" aria-hidden="true" />
                  Oct 24 • 10:00 AM - 3:00 PM
                </div>
                <div className="checkout-divider" />
                <div className="checkout-pricing">
                  <div className="checkout-price-row">
                    <span>Registration Fee</span>
                    <span>$149.00</span>
                  </div>
                  <div className="checkout-price-row">
                    <span>Materials Fee</span>
                    <span>$25.00</span>
                  </div>
                  <div className="checkout-price-row">
                    <span>Tax</span>
                    <span>$14.79</span>
                  </div>
                </div>
                <div className="checkout-divider dashed" />
                <div className="checkout-total">
                  <span>Total</span>
                  <strong>$188.79</strong>
                </div>
                <button type="button" className="checkout-pay">
                  <Lock className="icon icon-sm" aria-hidden="true" />
                  Pay & Register
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
