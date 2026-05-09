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
} from "lucide-react";
import WorkshopHeader from "../components/WorkshopHeader.tsx";

const imgStudentProfile =
  "https://www.figma.com/api/mcp/asset/646bd94c-8822-432f-be1f-38d08a09df59";
const imgBusinessStrategyWorkshop =
  "https://www.figma.com/api/mcp/asset/9b0e9b49-856f-47e4-9ac5-2de62892ba6e";
const imgCodingBootcamp =
  "https://www.figma.com/api/mcp/asset/64a58b45-b300-48f9-995e-2293793f2b53";
const imgDesignWorkshop =
  "https://www.figma.com/api/mcp/asset/0847573c-09b5-4b5f-99f0-8cc62fb92523";
const imgQrCodeForCheckIn =
  "https://www.figma.com/api/mcp/asset/5c679e98-021a-4ac3-a67b-e57df7f69bfb";
const imgInstructor =
  "https://www.figma.com/api/mcp/asset/2b82168d-29d3-4c5e-9069-76b377aabbc7";

const WorkshopSchedule = () => {
  return (
    <div className="schedule-page">
      <WorkshopHeader
        activeTab="schedule"
        profileImage={imgStudentProfile}
        profileLink="/profile"
      />

      <main className="schedule-main">
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

        <div className="schedule-grid">
          <section className="schedule-list" aria-label="Registrations">
            <article className="schedule-card registered">
              <div className="schedule-card-media">
                <img
                  src={imgBusinessStrategyWorkshop}
                  alt="Advanced Corporate Strategy workshop"
                />
              </div>
              <div className="schedule-card-body">
                <div className="schedule-card-head">
                  <div>
                    <span className="schedule-tag registered">
                      <BadgeCheck className="icon icon-xs" aria-hidden="true" />
                      Registered
                    </span>
                    <h3>Advanced Corporate Strategy</h3>
                    <p>Prof. Eleanor Vance • Business Hall A</p>
                  </div>
                  <button
                    type="button"
                    className="schedule-icon-button"
                    aria-label="Show QR code"
                  >
                    <QrCode className="icon icon-sm" aria-hidden="true" />
                  </button>
                </div>
                <div className="schedule-meta">
                  <div>
                    <Calendar className="icon icon-xs" aria-hidden="true" />
                    Oct 24, 2023
                  </div>
                  <div>
                    <Clock className="icon icon-xs" aria-hidden="true" />
                    14:00 - 16:00
                  </div>
                </div>
              </div>
            </article>

            <article className="schedule-card checked">
              <div className="schedule-card-media muted">
                <img
                  src={imgCodingBootcamp}
                  alt="Introduction to Python workshop"
                />
              </div>
              <div className="schedule-card-body">
                <div className="schedule-card-head">
                  <div>
                    <span className="schedule-tag checked">
                      <BadgeCheck className="icon icon-xs" aria-hidden="true" />
                      Checked-in
                    </span>
                    <h3 className="muted">Introduction to Python</h3>
                    <p>Dr. Alan Turing • Lab 4B</p>
                  </div>
                </div>
                <div className="schedule-meta">
                  <div>
                    <Calendar className="icon icon-xs" aria-hidden="true" />
                    Oct 22, 2023
                  </div>
                  <div>
                    <Clock className="icon icon-xs" aria-hidden="true" />
                    09:00 - 12:00
                  </div>
                </div>
              </div>
            </article>

            <article className="schedule-card pending">
              <div className="schedule-card-media">
                <img src={imgDesignWorkshop} alt="UX/UI Principles workshop" />
              </div>
              <div className="schedule-card-body">
                <div className="schedule-card-head">
                  <div>
                    <span className="schedule-tag pending">
                      <AlertCircle className="icon icon-xs" aria-hidden="true" />
                      Pending Payment
                    </span>
                    <h3>UX/UI Principles</h3>
                    <p>Sarah Jenkins • Studio 2</p>
                  </div>
                  <button type="button" className="schedule-pay-now">
                    Pay Now
                  </button>
                </div>
                <div className="schedule-meta">
                  <div>
                    <Calendar className="icon icon-xs" aria-hidden="true" />
                    Nov 05, 2023
                  </div>
                  <div>
                    <DollarSign className="icon icon-xs" aria-hidden="true" />
                    $45.00
                  </div>
                </div>
              </div>
            </article>
          </section>

          <aside className="schedule-panel" aria-label="Registration details">
            <div className="schedule-panel-header">
              <div className="schedule-panel-actions">
                <button type="button" className="schedule-icon-button">
                  <MoreHorizontal className="icon icon-sm" aria-hidden="true" />
                </button>
              </div>
              <span className="schedule-panel-code">REG-492-X</span>
              <h2>Advanced Corporate Strategy</h2>
            </div>

            <div className="schedule-panel-body">
              <div className="schedule-qr">
                <div className="schedule-qr-box">
                  <img src={imgQrCodeForCheckIn} alt="QR code for check-in" />
                </div>
                <span>Scan at entrance</span>
              </div>

              <div className="schedule-detail-grid">
                <div className="schedule-detail-card">
                  <span>DATE</span>
                  <div>
                    <Calendar className="icon icon-xs" aria-hidden="true" />
                    Oct 24, 2023
                  </div>
                </div>
                <div className="schedule-detail-card">
                  <span>TIME</span>
                  <div>
                    <Clock className="icon icon-xs" aria-hidden="true" />
                    14:00 - 16:00
                  </div>
                </div>
                <div className="schedule-detail-card full">
                  <span>LOCATION</span>
                  <div>
                    <MapPin className="icon icon-xs" aria-hidden="true" />
                    Business Hall A, Main Campus
                  </div>
                </div>
              </div>

              <div className="schedule-instructor">
                <img src={imgInstructor} alt="Prof. Eleanor Vance" />
                <div>
                  <span>INSTRUCTOR</span>
                  <strong>Prof. Eleanor Vance</strong>
                </div>
              </div>

              <button type="button" className="schedule-cancel">
                <XCircle className="icon icon-sm" aria-hidden="true" />
                Cancel Registration
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default WorkshopSchedule;
