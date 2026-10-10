import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./JobDetails.css";

const STAGES = [
  { key: "ASSIGNED", label: "Assigned", icon: "📋" },
  { key: "RECEIVED", label: "Received", icon: "🚗" },
  { key: "INSPECTION", label: "Inspection", icon: "🔍" },
  { key: "WASHING", label: "Washing", icon: "💦" },
  { key: "DRYING", label: "Drying", icon: "🌬️" },
  { key: "QUALITY_CHECK", label: "Quality Check", icon: "✓" },
  { key: "COMPLETED", label: "Completed", icon: "🏁" },
  { key: "DELIVERED", label: "Delivered", icon: "🤝" },
];

function normalizeStatus(status) {
  if (!status) return "ASSIGNED";

  return String(status).trim().toUpperCase().replace(/\s+/g, "_");
}

function formatStatus(status) {
  if (!status) return "Assigned";

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function getValue(object, ...keys) {
  for (const key of keys) {
    if (
      object &&
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return null;
}

export default function JobDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobDetails();
  }, [bookingId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const jobsResponse = await api.get("/worker/jobs");

      const jobs = Array.isArray(jobsResponse.data)
        ? jobsResponse.data
        : jobsResponse.data?.content || [];

      const currentBooking = jobs.find(
        (job) =>
          String(getValue(job, "bookingId", "id", "bookingID")) ===
          String(bookingId),
      );

      if (!currentBooking) {
        setError("Job details not found.");
        setBooking(null);
        setProgress(null);
        return;
      }

      setBooking(currentBooking);

      try {
        const progressResponse = await api.get(
          `/worker/service-progress/${bookingId}`,
        );

        setProgress(progressResponse.data || null);
      } catch (progressError) {
        if (progressError?.response?.status === 404) {
          setProgress(null);
        } else {
          console.error("Progress loading error:", progressError);
          setProgress(null);
        }
      }
    } catch (err) {
      console.error("Job details error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to load job details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = useMemo(() => {
    return normalizeStatus(
      getValue(
        booking,
        "status",
        "bookingStatus",
        "serviceStatus",
        "currentStatus",
      ),
    );
  }, [booking]);

  const currentStageIndex = useMemo(() => {
    const index = STAGES.findIndex((stage) => stage.key === currentStatus);

    return index >= 0 ? index : 0;
  }, [currentStatus]);

  const customerName =
    getValue(booking, "customerName", "customer", "name") || "Customer";

  const customerPhone =
    getValue(booking, "customerPhone", "phone", "mobile", "customerMobile") ||
    "—";

  const customerEmail = getValue(booking, "customerEmail", "email") || "—";

  const vehicleNumber =
    getValue(
      booking,
      "vehicleNumber",
      "registrationNumber",
      "vehicleNo",
      "numberPlate",
    ) || "—";

  const vehicleType = getValue(booking, "vehicleType", "type") || "Vehicle";

  const vehicleModel =
    getValue(booking, "vehicleModel", "model", "vehicleName") || "—";

  const serviceName =
    getValue(booking, "serviceName", "service", "packageName", "package") ||
    "Vehicle Service";

  const serviceDescription =
    getValue(booking, "serviceDescription", "description") ||
    "Professional vehicle care service";

  const amount = getValue(
    booking,
    "amount",
    "totalAmount",
    "price",
    "serviceAmount",
  );

  const bookingDate = getValue(
    booking,
    "bookingDate",
    "date",
    "scheduledDate",
    "appointmentDate",
  );

  const bookingTime = getValue(
    booking,
    "bookingTime",
    "time",
    "scheduledTime",
    "appointmentTime",
  );

  const pickupAddress =
    getValue(booking, "pickupAddress", "pickupLocation", "pickup") || "—";

  const deliveryAddress =
    getValue(
      booking,
      "deliveryAddress",
      "dropAddress",
      "dropLocation",
      "deliveryLocation",
    ) || "—";

  const customerNotes = getValue(
    booking,
    "customerNotes",
    "notes",
    "specialInstructions",
    "instructions",
  );

  const workerName =
    getValue(booking, "workerName", "assignedWorkerName") || "Assigned Worker";

  const dryingMethod = getValue(progress, "dryingMethod") || "—";

  const dryingStartedAt = getValue(progress, "dryingStartedAt");

  const dryingCompletedAt = getValue(progress, "dryingCompletedAt");

  const dryingNotes = getValue(progress, "dryingNotes");

  const qualityNotes = getValue(progress, "qualityNotes");

  const qualityCheckAt = getValue(progress, "qualityCheckAt");

  const completionNotes = getValue(progress, "completionNotes");

  const completedAt = getValue(progress, "completedAt");

  const deliveryNotes = getValue(progress, "deliveryNotes");

  const deliveredAt = getValue(progress, "deliveredAt");

  const inspectionItems = [
    {
      label: "Exterior",
      value: getValue(progress, "exteriorChecked"),
    },
    {
      label: "Interior",
      value: getValue(progress, "interiorChecked"),
    },
    {
      label: "Glass",
      value: getValue(progress, "glassChecked"),
    },
    {
      label: "Wheels",
      value: getValue(progress, "wheelsChecked"),
    },
    {
      label: "Paint",
      value: getValue(progress, "paintChecked"),
    },
    {
      label: "No Visible Defects",
      value: getValue(progress, "noVisibleDefects"),
    },
  ];

  const dryingItems = [
    {
      label: "Body Completely Dry",
      value: getValue(progress, "bodyCompletelyDry"),
    },
    {
      label: "Glass Dry",
      value: getValue(progress, "glassDry"),
    },
    {
      label: "Wheels Dry",
      value: getValue(progress, "wheelsDry"),
    },
    {
      label: "No Water Spots",
      value: getValue(progress, "noWaterSpots"),
    },
  ];

  const qualityItems = [
    {
      label: "Exterior Checked",
      value: getValue(progress, "exteriorChecked"),
    },
    {
      label: "Interior Checked",
      value: getValue(progress, "interiorChecked"),
    },
    {
      label: "Glass Checked",
      value: getValue(progress, "glassChecked"),
    },
    {
      label: "Wheels Checked",
      value: getValue(progress, "wheelsChecked"),
    },
    {
      label: "Paint Checked",
      value: getValue(progress, "paintChecked"),
    },
    {
      label: "No Visible Defects",
      value: getValue(progress, "noVisibleDefects"),
    },
  ];

  const isTrue = (value) =>
    value === true || value === "true" || value === 1 || value === "1";

  if (loading) {
    return (
      <div className="jd-page">
        <aside className="jd-sidebar">
          <div className="jd-sidebar-logo">
            <div className="jd-logo-icon">A</div>

            <div>
              <h2>AUTOGLOW</h2>
              <span>WORKER PANEL</span>
            </div>
          </div>
        </aside>

        <main className="jd-main">
          <header className="jd-header">
            <div className="jd-header-title">Job Details</div>
          </header>

          <div className="jd-loading-screen">
            <div className="jd-loading-spinner"></div>
            <p>Loading job details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="jd-page">
        <aside className="jd-sidebar">
          <div className="jd-sidebar-logo">
            <div className="jd-logo-icon">A</div>

            <div>
              <h2>AUTOGLOW</h2>
              <span>WORKER PANEL</span>
            </div>
          </div>

          <div className="jd-sidebar-bottom">
            <button
              className="jd-sidebar-back"
              onClick={() => navigate("/worker/jobs")}
            >
              ← Back to Jobs
            </button>
          </div>
        </aside>

        <main className="jd-main">
          <header className="jd-header">
            <div className="jd-header-title">Job Details</div>
          </header>

          <div className="jd-empty-job">
            <div className="jd-empty-icon">⚠️</div>

            <h2>Job Not Found</h2>

            <p>{error || "The requested job could not be found."}</p>

            <button
              className="jd-primary-btn"
              onClick={() => navigate("/worker/jobs")}
            >
              Back to My Jobs
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="jd-page">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="jd-sidebar">
        <div className="jd-sidebar-logo">
          <div className="jd-logo-icon">A</div>

          <div>
            <h2>AUTOGLOW</h2>
            <span>WORKER PANEL</span>
          </div>
        </div>

        <div className="jd-sidebar-menu">
          <button onClick={() => navigate("/worker/dashboard")}>
            <span>⌂</span>
            <label>Dashboard</label>
          </button>

          <button onClick={() => navigate("/worker/jobs")}>
            <span>▣</span>
            <label>My Jobs</label>
          </button>

          <button
            className="jd-active"
            onClick={() => navigate(`/worker/job-details/${bookingId}`)}
          >
            <span>▤</span>
            <label>Job Details</label>
          </button>

          <button onClick={() => navigate("/worker/inspection")}>
            <span>⌕</span>
            <label>Inspection</label>
          </button>

          <button onClick={() => navigate("/worker/status")}>
            <span>◷</span>
            <label>Attendance</label>
          </button>
        </div>

        <div className="jd-sidebar-bottom">
          <div className="jd-mini-profile">
            <div className="jd-mini-avatar">
              {workerName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{workerName}</strong>
              <span>Service Worker</span>
            </div>
          </div>

          <button
            className="jd-sidebar-back"
            onClick={() => navigate("/worker/jobs")}
          >
            ← Back to Jobs
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="jd-main">
        {/* HEADER */}

        <header className="jd-header">
          <div className="jd-header-title">Worker Panel / Job Details</div>

          <div className="jd-header-right">
            <button
              className="jd-notification-btn"
              type="button"
              title="Notifications"
            >
              🔔
            </button>

            <div className="jd-header-user">
              <div className="jd-header-avatar">
                {workerName.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{workerName}</strong>
                <span>Active Worker</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="jd-content">
          {/* BACK */}

          <button
            className="jd-back-link"
            onClick={() => navigate("/worker/jobs")}
          >
            ← Back to My Jobs
          </button>

          {/* HEADING */}

          <div className="jd-job-heading">
            <span className="jd-page-label">JOB DETAILS</span>

            <div className="jd-booking-title">
              <h1>Job #{bookingId}</h1>

              <div
                className={`jd-job-status ${
                  currentStatus === "COMPLETED"
                    ? "jd-status-completed"
                    : currentStatus === "DELIVERED"
                      ? "jd-status-delivered"
                      : "jd-status-default"
                }`}
              >
                <span className="jd-status-dot"></span>
                {formatStatus(currentStatus)}
              </div>
            </div>

            <p>
              Complete overview of customer, vehicle, service progress and
              delivery information.
            </p>
          </div>

          {/* =====================================================
              INFO GRID
          ===================================================== */}

          <div className="jd-info-grid">
            {/* CUSTOMER */}

            <section className="jd-info-card">
              <div className="jd-card-heading">
                <div className="jd-card-icon jd-blue">👤</div>

                <h3>CUSTOMER INFORMATION</h3>
              </div>

              <div className="jd-customer-name">{customerName}</div>

              <div className="jd-info-line">
                <span>📞</span>
                {customerPhone}
              </div>

              <div className="jd-info-line">
                <span>✉</span>
                {customerEmail}
              </div>
            </section>

            {/* VEHICLE */}

            <section className="jd-info-card">
              <div className="jd-card-heading">
                <div className="jd-card-icon jd-purple">🚗</div>

                <h3>VEHICLE INFORMATION</h3>
              </div>

              <div className="jd-vehicle-number">{vehicleNumber}</div>

              <div className="jd-vehicle-details">
                <span>
                  Type: <strong>{vehicleType}</strong>
                </span>

                <span>
                  Model: <strong>{vehicleModel}</strong>
                </span>
              </div>
            </section>

            {/* SERVICE */}

            <section className="jd-info-card">
              <div className="jd-card-heading">
                <div className="jd-card-icon jd-green">🛠️</div>

                <h3>SERVICE INFORMATION</h3>
              </div>

              <div className="jd-service-name">{serviceName}</div>

              <div className="jd-service-detail">
                Service:
                <strong>{serviceDescription}</strong>
              </div>

              {amount !== null && (
                <div className="jd-amount">
                  ₹{Number(amount).toLocaleString("en-IN")}
                </div>
              )}
            </section>

            {/* BOOKING */}

            <section className="jd-info-card">
              <div className="jd-card-heading">
                <div className="jd-card-icon jd-orange">📅</div>

                <h3>BOOKING INFORMATION</h3>
              </div>

              <div className="jd-booking-detail">
                📅
                <strong>{formatDate(bookingDate)}</strong>
              </div>

              <div className="jd-booking-detail">
                ⏰<strong>{bookingTime || "—"}</strong>
              </div>

              <div className="jd-booking-status">
                Status:
                <strong>{formatStatus(currentStatus)}</strong>
              </div>
            </section>
          </div>

          {/* =====================================================
              SERVICE PROGRESS
          ===================================================== */}

          <section className="jd-section-block">
            <span className="jd-section-label">SERVICE PROGRESS</span>

            <div className="jd-section-header">
              <h2>Vehicle Service Journey</h2>
            </div>

            <div className="jd-timeline">
              {STAGES.map((stage, index) => {
                const completed = index < currentStageIndex;

                const current = index === currentStageIndex;

                return (
                  <div
                    className={`jd-timeline-item ${
                      completed ? "jd-completed" : ""
                    } ${current ? "jd-current" : ""}`}
                    key={stage.key}
                  >
                    <div className="jd-timeline-marker">
                      {completed ? "✓" : stage.icon}
                    </div>

                    <div className="jd-timeline-content">
                      <strong>{stage.label}</strong>

                      {current && <span>Current Stage</span>}
                    </div>

                    {index < STAGES.length - 1 && (
                      <div
                        className={`jd-timeline-line ${
                          index < currentStageIndex ? "jd-filled" : ""
                        }`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* =====================================================
              INSPECTION
          ===================================================== */}

          <section className="jd-detail-card">
            <div className="jd-detail-card-header">
              <div>
                <span className="jd-section-label">VEHICLE INSPECTION</span>

                <h2>Inspection Checklist</h2>
              </div>

              {progress && (
                <span className="jd-verified-badge">✓ INSPECTION DATA</span>
              )}
            </div>

            <div className="jd-check-grid">
              {inspectionItems.map((item) => (
                <div className="jd-check-item" key={item.label}>
                  <span>{item.label}</span>

                  <strong
                    className={
                      isTrue(item.value) ? "jd-good" : "jd-not-checked"
                    }
                  >
                    {isTrue(item.value) ? "✓ Checked" : "— Not Checked"}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          {/* =====================================================
              WASHING / DRYING
          ===================================================== */}

          <section className="jd-detail-card">
            <div className="jd-detail-card-header">
              <div>
                <span className="jd-section-label">WASHING & DRYING</span>

                <h2>Vehicle Cleaning Details</h2>
              </div>
            </div>

            <div className="jd-washing-info">
              <div>
                <span>Drying Method</span>
                <strong>{dryingMethod}</strong>
              </div>

              <div>
                <span>Drying Started</span>
                <strong>{formatDateTime(dryingStartedAt)}</strong>
              </div>

              <div>
                <span>Drying Completed</span>
                <strong>{formatDateTime(dryingCompletedAt)}</strong>
              </div>
            </div>

            <div className="jd-wash-checks">
              {dryingItems.map((item) => (
                <div className="jd-wash-check" key={item.label}>
                  <span>{isTrue(item.value) ? "✓" : "○"}</span>

                  {item.label}
                </div>
              ))}
            </div>

            {dryingNotes && (
              <div className="jd-notes-box">
                <span>Drying Notes</span>

                <p>{dryingNotes}</p>
              </div>
            )}
          </section>

          {/* =====================================================
              QUALITY CHECK
          ===================================================== */}

          <section className="jd-detail-card">
            <div className="jd-detail-card-header">
              <div>
                <span className="jd-section-label">QUALITY ASSURANCE</span>

                <h2>Final Quality Check</h2>
              </div>

              {qualityCheckAt && (
                <span className="jd-verified-badge">✓ QUALITY CHECKED</span>
              )}
            </div>

            <div className="jd-quality-grid">
              {qualityItems.map((item) => (
                <div className="jd-quality-item" key={item.label}>
                  <span>{isTrue(item.value) ? "✓" : "○"}</span>

                  {item.label}
                </div>
              ))}
            </div>

            <div className="jd-quality-time">
              Quality Check Time:
              <strong>{formatDateTime(qualityCheckAt)}</strong>
            </div>

            {qualityNotes && (
              <div className="jd-notes-box">
                <span>Quality Notes</span>

                <p>{qualityNotes}</p>
              </div>
            )}
          </section>

          {/* =====================================================
              COMPLETION
          ===================================================== */}

          <section className="jd-detail-card">
            <div className="jd-detail-card-header">
              <div>
                <span className="jd-section-label">SERVICE COMPLETION</span>

                <h2>Completion Details</h2>
              </div>

              {completedAt && (
                <span className="jd-verified-badge">✓ SERVICE COMPLETED</span>
              )}
            </div>

            <div className="jd-completion-grid">
              <div className="jd-completion-item">
                <span>Completed At</span>
                <strong>{formatDateTime(completedAt)}</strong>
              </div>

              <div className="jd-completion-item">
                <span>Service Status</span>
                <strong>{formatStatus(currentStatus)}</strong>
              </div>
            </div>

            {completionNotes && (
              <div className="jd-notes-box">
                <span>Completion Notes</span>

                <p>{completionNotes}</p>
              </div>
            )}
          </section>

          {/* =====================================================
              DELIVERY
          ===================================================== */}

          <section className="jd-detail-card">
            <div className="jd-detail-card-header">
              <div>
                <span className="jd-section-label">PICKUP & DELIVERY</span>

                <h2>Vehicle Handover Details</h2>
              </div>

              {deliveredAt && (
                <span className="jd-verified-badge">✓ DELIVERED</span>
              )}
            </div>

            <div className="jd-delivery-grid">
              <div className="jd-delivery-item">
                <span>Pickup</span>

                <strong>{pickupAddress}</strong>
              </div>

              <div className="jd-delivery-item">
                <span>Delivery</span>

                <strong>{deliveryAddress}</strong>
              </div>

              <div className="jd-delivery-item">
                <span>Delivered At</span>

                <strong>{formatDateTime(deliveredAt)}</strong>
              </div>
            </div>

            {deliveryNotes && (
              <div className="jd-notes-box">
                <span>Delivery Notes</span>

                <p>{deliveryNotes}</p>
              </div>
            )}
          </section>

          {/* =====================================================
              CUSTOMER NOTES
          ===================================================== */}

          {customerNotes && (
            <section className="jd-customer-notes">
              <div className="jd-notes-icon">📝</div>

              <div>
                <span>CUSTOMER NOTES</span>

                <p>{customerNotes}</p>
              </div>
            </section>
          )}

          {/* =====================================================
              ACTIONS
          ===================================================== */}

          <div className="jd-bottom-actions">
            <button
              className="jd-secondary-btn"
              onClick={() => navigate("/worker/jobs")}
            >
              ← Back to Jobs
            </button>

            <button
              className="jd-history-btn"
              onClick={() => navigate(`/worker/service-progress/${bookingId}`)}
            >
              View Service Progress
            </button>
          </div>

          {/* FOOTER */}

          <footer className="jd-footer">
            <div>
              <strong>AUTOGLOW</strong>
              <span>AI Powered Car & Bike Care Management System</span>
            </div>

            <span>Job #{bookingId}</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
