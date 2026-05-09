import { useEffect, useMemo, useState } from "react";
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
import {
  deleteMockRegistration,
  formatMockRequestAlert,
  getMockRegistrationQr,
  getMockRegistrations,
  type MockRegistration,
} from "../lib/mockApi.ts";

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
  const [registrations, setRegistrations] = useState<MockRegistration[]>([]);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<
    string | null
  >(null);
  const [selectedQrCode, setSelectedQrCode] = useState(imgQrCodeForCheckIn);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegistrations = async () => {
    setIsLoading(true);
    setError(null);

    // Replace this mock registration fetch with the real GET /registrations/me request later.
    const result = await getMockRegistrations({
      page: 1,
      pageSize: 20,
    });

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setRegistrations(result.data);
    setSelectedRegistrationId((current) => current ?? result.data[0]?.id ?? null);
  };

  useEffect(() => {
    void loadRegistrations();
  }, []);

  const selectedRegistration = useMemo(
    () =>
      registrations.find((registration) => registration.id === selectedRegistrationId) ??
      registrations[0] ??
      null,
    [registrations, selectedRegistrationId],
  );

  useEffect(() => {
    if (selectedRegistration?.qrCode) {
      setSelectedQrCode(selectedRegistration.qrCode);
    }
  }, [selectedRegistration]);

  const handleShowQr = async (registrationId: string) => {
    setError(null);
    // Replace this mock QR fetch with the real GET /registrations/:id/qr request later.
    const result = await getMockRegistrationQr(registrationId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSelectedRegistrationId(registrationId);
    setSelectedQrCode(result.data.qrCode);
    // Remove this debug alert when the page is connected to the real API flow.
    window.alert(formatMockRequestAlert(result.request));
  };

  const handleCancelRegistration = async () => {
    if (!selectedRegistration) {
      return;
    }

    setError(null);
    // Replace this mock delete with the real cancel-registration endpoint later.
    const result = await deleteMockRegistration(selectedRegistration.id);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // Remove this debug alert when the page is connected to the real API flow.
    window.alert(formatMockRequestAlert(result.request));
    void loadRegistrations();
  };

  const getCardClassName = (registration: MockRegistration) =>
    `schedule-card${
      selectedRegistrationId === registration.id ? " is-selected" : ""
    } ${
      registration.status === "confirmed"
        ? "registered"
        : registration.status === "checked-in"
          ? "checked"
          : registration.status === "pending"
            ? "pending"
            : "pending"
    }`;

  const getStatusLabel = (registration: MockRegistration) => {
    if (registration.status === "checked-in") {
      return "Checked-in";
    }

    if (registration.status === "pending") {
      return "Pending Payment";
    }

    if (registration.status === "cancelled") {
      return "Cancelled";
    }

    return "Registered";
  };

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
        {error ? <p className="helper-text">{error}</p> : null}
        {isLoading ? <p className="helper-text">Loading registrations...</p> : null}

        <div className="schedule-grid">
          <section className="schedule-list" aria-label="Registrations">
            {registrations.map((registration) => {
              const isChecked = registration.status === "checked-in";
              const isPending = registration.status === "pending";
              const cardImage =
                registration.coverImage ||
                (registration.status === "pending"
                  ? imgDesignWorkshop
                  : registration.status === "checked-in"
                    ? imgCodingBootcamp
                    : imgBusinessStrategyWorkshop);

              return (
                <article
                  key={registration.id}
                  className={getCardClassName(registration)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedRegistrationId === registration.id}
                  onClick={() => setSelectedRegistrationId(registration.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedRegistrationId(registration.id);
                    }
                  }}
                >
                  <div className={`schedule-card-media${isChecked ? " muted" : ""}`}>
                    <img src={cardImage} alt={`${registration.workshopTitle} workshop`} />
                  </div>
                  <div className="schedule-card-body">
                    <div className="schedule-card-head">
                      <div>
                        <span
                          className={`schedule-tag ${
                            registration.status === "checked-in"
                              ? "checked"
                              : registration.status === "pending"
                                ? "pending"
                                : "registered"
                          }`}
                        >
                          {registration.status === "pending" ? (
                            <AlertCircle className="icon icon-xs" aria-hidden="true" />
                          ) : (
                            <BadgeCheck className="icon icon-xs" aria-hidden="true" />
                          )}
                          {getStatusLabel(registration)}
                        </span>
                        <h3 className={isChecked ? "muted" : undefined}>
                          {registration.workshopTitle}
                        </h3>
                        <p>
                          {registration.speaker} • {registration.location}
                        </p>
                      </div>
                      {isPending ? (
                        <button
                          type="button"
                          className="schedule-pay-now"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedRegistrationId(registration.id);
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
                            void handleShowQr(registration.id);
                          }}
                        >
                          <QrCode className="icon icon-sm" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <div className="schedule-meta">
                      <div>
                        <Calendar className="icon icon-xs" aria-hidden="true" />
                        {registration.dateLabel}
                      </div>
                      <div>
                        {isPending ? (
                          <DollarSign className="icon icon-xs" aria-hidden="true" />
                        ) : (
                          <Clock className="icon icon-xs" aria-hidden="true" />
                        )}
                        {isPending ? registration.priceLabel : registration.timeLabel}
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
                  <MoreHorizontal className="icon icon-sm" aria-hidden="true" />
                </button>
              </div>
              <span className="schedule-panel-code">
                {selectedRegistration?.registrationCode ?? "REG-000-X"}
              </span>
              <h2>{selectedRegistration?.workshopTitle ?? "No registration selected"}</h2>
            </div>

            <div className="schedule-panel-body">
              <div className="schedule-qr">
                <div className="schedule-qr-box">
                  <img src={selectedQrCode} alt="QR code for check-in" />
                </div>
                <span>Scan at entrance</span>
              </div>

              <div className="schedule-detail-grid">
                <div className="schedule-detail-card">
                  <span>DATE</span>
                  <div>
                    <Calendar className="icon icon-xs" aria-hidden="true" />
                    {selectedRegistration?.dateLabel ?? "N/A"}
                  </div>
                </div>
                <div className="schedule-detail-card">
                  <span>TIME</span>
                  <div>
                    <Clock className="icon icon-xs" aria-hidden="true" />
                    {selectedRegistration?.timeLabel ?? "N/A"}
                  </div>
                </div>
                <div className="schedule-detail-card full">
                  <span>LOCATION</span>
                  <div>
                    <MapPin className="icon icon-xs" aria-hidden="true" />
                    {selectedRegistration?.location ?? "N/A"}
                  </div>
                </div>
              </div>

              <div className="schedule-instructor">
                <img
                  src={selectedRegistration?.instructorImage ?? imgInstructor}
                  alt={selectedRegistration?.instructorName ?? "Instructor"}
                />
                <div>
                  <span>INSTRUCTOR</span>
                  <strong>{selectedRegistration?.instructorName ?? "N/A"}</strong>
                </div>
              </div>

              <button
                type="button"
                className="schedule-cancel"
                onClick={() => void handleCancelRegistration()}
                disabled={!selectedRegistration}
              >
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
