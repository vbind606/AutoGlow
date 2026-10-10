import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./WorkerJobs.css";

// ============================================================
// STATUS LABELS
// ============================================================

const STATUS_LABELS = {
  ASSIGNED: "Assigned",
  RECEIVED: "Received",
  INSPECTION: "Inspection",
  WASHING: "Washing",
  DRYING: "Drying",
  QUALITY_CHECK: "Quality Check",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// ============================================================
// WORKER NEXT STATUS
// ============================================================

const WORKER_NEXT_STATUSES = {
  ASSIGNED: "RECEIVED",
};

// ============================================================
// ACTION LABELS
// ============================================================

const ACTION_LABELS = {
  ASSIGNED: "Mark Received",
  RECEIVED: "Start Inspection",
  INSPECTION: "Start Washing",
  WASHING: "Continue Service",
  DRYING: "Continue Service",
  QUALITY_CHECK: "Continue Service",
  COMPLETED: "Deliver Vehicle",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// ============================================================
// QUICK FILTERS
// ============================================================

const QUICK_FILTERS = [
  {
    label: "All Jobs",
    value: "ALL",
  },
  {
    label: "New",
    value: "ASSIGNED",
  },
  {
    label: "Inspection",
    value: "INSPECTION",
  },
  {
    label: "Washing",
    value: "WASHING",
  },
  {
    label: "Drying",
    value: "DRYING",
  },
  {
    label: "Quality Check",
    value: "QUALITY_CHECK",
  },
  {
    label: "Completed",
    value: "COMPLETED",
  },
];

// ============================================================
// WORKFLOW PROGRESS
// ============================================================

const WORKFLOW_PROGRESS = {
  ASSIGNED: 12.5,
  RECEIVED: 25,
  INSPECTION: 37.5,
  WASHING: 50,
  DRYING: 62.5,
  QUALITY_CHECK: 75,
  COMPLETED: 87.5,
  DELIVERED: 100,
};

// ============================================================
// HELPERS
// ============================================================

const formatStatus = (status) => {
  if (!status) {
    return "Unknown";
  }

  return (
    STATUS_LABELS[status] ||
    String(status)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

// ============================================================

const formatTime = (time) => {
  if (!time) {
    return "—";
  }

  const parts = String(time).split(":");

  if (parts.length < 2) {
    return time;
  }

  const hour = Number(parts[0]);
  const minute = parts[1];

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
};

// ============================================================

const getVehicleName = (job) => {
  const parts = [job?.vehicleBrand, job?.vehicleModel].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return job?.vehicleType || "Vehicle";
};

// ============================================================

const getServiceName = (job) => {
  return job?.serviceName || job?.packageName || "Vehicle Service";
};

// ============================================================
// COMPONENT
// ============================================================

const WorkerJobs = () => {
  const navigate = useNavigate();

  // ==========================================================
  // STATES
  // ==========================================================

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [sortBy, setSortBy] = useState("DATE_ASC");

  const [selectedJob, setSelectedJob] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================================
  // LOAD JOBS
  // ==========================================================

  const loadJobs = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/worker/jobs");

      const data = Array.isArray(response.data) ? response.data : [];

      setJobs(data);
    } catch (err) {
      console.error("Failed to load worker jobs:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Unable to load worker jobs.";

      setError(String(backendMessage));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadJobs(true);
  }, [loadJobs]);

  // ==========================================================
  // AUTO CLEAR SUCCESS MESSAGE
  // ==========================================================

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => {
      setMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [message]);

  // ==========================================================
  // UPDATE STATUS
  // ==========================================================

  const updateStatus = useCallback(async (job, nextStatus) => {
    if (!job?.bookingId) {
      setError("Booking ID is missing.");
      return false;
    }

    if (!nextStatus) {
      setError("Next status is missing.");
      return false;
    }

    try {
      setUpdatingId(job.bookingId);

      setError("");
      setMessage("");

      await api.patch(`/worker/jobs/${job.bookingId}/status`, {
        status: nextStatus,
      });

      // Update job list locally
      setJobs((previousJobs) =>
        previousJobs.map((item) =>
          item.bookingId === job.bookingId
            ? {
                ...item,
                status: nextStatus,
              }
            : item,
        ),
      );

      // Update selected job if modal is open
      setSelectedJob((previousJob) =>
        previousJob?.bookingId === job.bookingId
          ? {
              ...previousJob,
              status: nextStatus,
            }
          : previousJob,
      );

      setMessage(
        `Booking #${job.bookingId} updated to ${formatStatus(nextStatus)}.`,
      );

      return true;
    } catch (err) {
      console.error("Status update failed:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Unable to update job status.";

      setError(String(backendMessage));

      return false;
    } finally {
      setUpdatingId(null);
    }
  }, []);

  // ==========================================================
  // MAIN WORKFLOW ACTION
  // ==========================================================

  const handleNextAction = async (job) => {
    if (!job) {
      return;
    }

    const bookingId = job.bookingId;

    if (!bookingId) {
      setError("Booking ID missing.");
      return;
    }

    const currentStatus = job.status;

    // ========================================================
    // ASSIGNED
    // ========================================================

    if (currentStatus === "ASSIGNED") {
      await updateStatus(job, "RECEIVED");

      return;
    }

    // ========================================================
    // RECEIVED -> INSPECTION
    // ========================================================

    if (currentStatus === "RECEIVED") {
      navigate(`/worker/inspection/${bookingId}`);

      return;
    }

    // ========================================================
    // INSPECTION -> WASHING
    // ========================================================

    if (currentStatus === "INSPECTION") {
      navigate(`/worker/washing/${bookingId}`);

      return;
    }

    // ========================================================
    // WASHING -> SERVICE PROGRESS
    // ========================================================

    if (currentStatus === "WASHING") {
      navigate(`/worker/service-progress/${bookingId}`);

      return;
    }

    // ========================================================
    // DRYING -> SERVICE PROGRESS
    // ========================================================

    if (currentStatus === "DRYING") {
      navigate(`/worker/service-progress/${bookingId}`);

      return;
    }

    // ========================================================
    // QUALITY CHECK -> SERVICE PROGRESS
    // ========================================================

    if (currentStatus === "QUALITY_CHECK") {
      navigate(`/worker/service-progress/${bookingId}`);

      return;
    }

    // ========================================================
    // COMPLETED -> DELIVERY / SERVICE PROGRESS
    // ========================================================

    if (currentStatus === "COMPLETED") {
      navigate(`/worker/service-progress/${bookingId}`);

      return;
    }

    // ========================================================
    // DELIVERED
    // ========================================================

    if (currentStatus === "DELIVERED") {
      setMessage(`Booking #${bookingId} has already been delivered.`);

      return;
    }

    // ========================================================
    // CANCELLED
    // ========================================================

    if (currentStatus === "CANCELLED") {
      setMessage(`Booking #${bookingId} is cancelled.`);

      return;
    }

    // ========================================================
    // FALLBACK
    // ========================================================

    const nextStatus = WORKER_NEXT_STATUSES[currentStatus];

    if (nextStatus) {
      await updateStatus(job, nextStatus);
    } else {
      setError(
        `No workflow action available for ${formatStatus(currentStatus)}.`,
      );
    }
  };

  // ==========================================================
  // VIEW FULL DETAILS
  // ==========================================================

  const handleViewDetails = (job) => {
    if (!job?.bookingId) {
      setError("Booking ID missing.");
      return;
    }

    navigate(`/worker/job-details/${job.bookingId}`);
  };

  // ==========================================================
  // OPEN MODAL
  // ==========================================================

  const openJobModal = (job) => {
    if (!job?.bookingId) {
      setError("Booking ID missing.");
      return;
    }

    setSelectedJob(job);
    setShowModal(true);
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeJobModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  // ==========================================================
  // FILTER + SEARCH + SORT
  // ==========================================================

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = jobs.filter((job) => {
      // ======================================================
      // STATUS FILTER
      // ======================================================

      const statusMatches =
        statusFilter === "ALL" || job.status === statusFilter;

      if (!statusMatches) {
        return false;
      }

      // ======================================================
      // SEARCH
      // ======================================================

      if (!query) {
        return true;
      }

      const searchableText = [
        job.bookingId,
        job.customerName,
        job.customerEmail,
        job.customerPhone,
        job.vehicleNumber,
        job.vehicleType,
        job.vehicleBrand,
        job.vehicleModel,
        job.serviceName,
        job.packageName,
        job.status,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });

    // ========================================================
    // SORT
    // ========================================================

    result = [...result].sort((a, b) => {
      if (sortBy === "DATE_ASC") {
        const dateA = `${a.bookingDate || ""} ${a.bookingTime || ""}`;

        const dateB = `${b.bookingDate || ""} ${b.bookingTime || ""}`;

        return dateA.localeCompare(dateB);
      }

      if (sortBy === "DATE_DESC") {
        const dateA = `${a.bookingDate || ""} ${a.bookingTime || ""}`;

        const dateB = `${b.bookingDate || ""} ${b.bookingTime || ""}`;

        return dateB.localeCompare(dateA);
      }

      if (sortBy === "AMOUNT_HIGH") {
        return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      }

      if (sortBy === "AMOUNT_LOW") {
        return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
      }

      if (sortBy === "BOOKING_HIGH") {
        return Number(b.bookingId || 0) - Number(a.bookingId || 0);
      }

      if (sortBy === "BOOKING_LOW") {
        return Number(a.bookingId || 0) - Number(b.bookingId || 0);
      }

      return 0;
    });

    return result;
  }, [jobs, search, statusFilter, sortBy]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = useMemo(() => {
    const count = (status) =>
      jobs.filter((job) => job.status === status).length;

    return {
      total: jobs.length,
      assigned: count("ASSIGNED"),
      received: count("RECEIVED"),
      inspection: count("INSPECTION"),
      washing: count("WASHING"),
      drying: count("DRYING"),
      qualityCheck: count("QUALITY_CHECK"),
      completed: count("COMPLETED"),
      delivered: count("DELIVERED"),
      cancelled: count("CANCELLED"),
    };
  }, [jobs]);

  // ==========================================================
  // STATUS COUNT
  // ==========================================================

  const getStatusCount = (status) => {
    if (status === "ALL") {
      return jobs.length;
    }

    return jobs.filter((job) => job.status === status).length;
  };

  // ==========================================================
  // RENDER ACTION BUTTON
  // ==========================================================

  const renderActionButton = (job) => {
    const status = job?.status;

    const isUpdating = updatingId === job?.bookingId;

    const label = ACTION_LABELS[status] || "Open Job";

    // ========================================================
    // DELIVERED
    // ========================================================

    if (status === "DELIVERED") {
      return (
        <button
          type="button"
          className="wj-btn wj-btn-success"
          onClick={() => handleNextAction(job)}
        >
          ✓ Delivered
        </button>
      );
    }

    // ========================================================
    // CANCELLED
    // ========================================================

    if (status === "CANCELLED") {
      return (
        <button type="button" className="wj-btn wj-btn-disabled" disabled>
          Cancelled
        </button>
      );
    }

    // ========================================================
    // NORMAL ACTION
    // ========================================================

    return (
      <button
        type="button"
        className="wj-btn wj-btn-primary"
        disabled={isUpdating}
        onClick={() => handleNextAction(job)}
      >
        {isUpdating ? "Updating..." : label}
      </button>
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="worker-jobs-page">
        <div className="wj-loading">
          <div className="wj-spinner"></div>

          <h3>Loading Jobs...</h3>

          <p>Please wait while we fetch your assigned vehicle jobs.</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="worker-jobs-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="wj-page-header">
        <div className="wj-header-content">
          <div>
            <div className="wj-eyebrow">WORKER WORKSPACE</div>

            <h1>My Vehicle Jobs</h1>

            <p>Manage your assigned vehicles through every service stage.</p>
          </div>

          <button
            type="button"
            className="wj-refresh-btn"
            disabled={refreshing}
            onClick={() => loadJobs(false)}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* ====================================================
          ERROR MESSAGE
      ==================================================== */}

      {error && (
        <div className="wj-alert wj-alert-error">
          <span>⚠</span>

          <div>
            <strong>Error</strong>

            <p>{error}</p>
          </div>

          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {/* ====================================================
          SUCCESS MESSAGE
      ==================================================== */}

      {message && (
        <div className="wj-alert wj-alert-success">
          <span>✓</span>

          <div>
            <strong>Success</strong>

            <p>{message}</p>
          </div>

          <button type="button" onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}

      {/* ====================================================
          STAT CARDS
      ==================================================== */}

      <div className="wj-stats-grid">
        <div className="wj-stat-card">
          <div className="wj-stat-icon">🚗</div>

          <div>
            <span>Total Jobs</span>

            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="wj-stat-card">
          <div className="wj-stat-icon">📥</div>

          <div>
            <span>New Jobs</span>

            <strong>{stats.assigned}</strong>
          </div>
        </div>

        <div className="wj-stat-card">
          <div className="wj-stat-icon">🔍</div>

          <div>
            <span>Inspection</span>

            <strong>{stats.inspection}</strong>
          </div>
        </div>

        <div className="wj-stat-card">
          <div className="wj-stat-icon">🧼</div>

          <div>
            <span>Washing</span>

            <strong>{stats.washing}</strong>
          </div>
        </div>

        <div className="wj-stat-card">
          <div className="wj-stat-icon">💨</div>

          <div>
            <span>Drying</span>

            <strong>{stats.drying}</strong>
          </div>
        </div>

        <div className="wj-stat-card">
          <div className="wj-stat-icon">✓</div>

          <div>
            <span>Completed</span>

            <strong>{stats.completed}</strong>
          </div>
        </div>
      </div>

      {/* ====================================================
          WORKFLOW BAR
      ==================================================== */}

      <div className="wj-workflow-card">
        <div className="wj-workflow-header">
          <div>
            <h2>Service Workflow</h2>

            <p>Complete each stage to move the vehicle forward.</p>
          </div>
        </div>

        <div className="wj-workflow">
          <div className="wj-workflow-step">
            <span>1</span>
            <small>Assigned</small>
          </div>

          <div className="wj-workflow-line"></div>

          <div className="wj-workflow-step">
            <span>2</span>
            <small>Received</small>
          </div>

          <div className="wj-workflow-line"></div>

          <div className="wj-workflow-step">
            <span>3</span>
            <small>Inspection</small>
          </div>

          <div className="wj-workflow-line"></div>

          <div className="wj-workflow-step">
            <span>4</span>
            <small>Washing</small>
          </div>

          <div className="wj-workflow-line"></div>

          <div className="wj-workflow-step">
            <span>5</span>
            <small>Drying</small>
          </div>

          <div className="wj-workflow-line"></div>

          <div className="wj-workflow-step">
            <span>6</span>
            <small>Quality</small>
          </div>

          <div className="wj-workflow-line"></div>

          <div className="wj-workflow-step">
            <span>7</span>
            <small>Completed</small>
          </div>

          <div className="wj-workflow-line"></div>

          <div className="wj-workflow-step">
            <span>8</span>
            <small>Delivered</small>
          </div>
        </div>
      </div>

      {/* ====================================================
          CONTROLS
      ==================================================== */}

      <div className="wj-controls-card">
        {/* SEARCH */}

        <div className="wj-search-box">
          <span className="wj-search-icon">🔎</span>

          <input
            type="text"
            placeholder="Search booking, customer, vehicle..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              className="wj-clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        {/* SORT */}

        <div className="wj-sort-box">
          <label>Sort</label>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="DATE_ASC">Date: Earliest</option>

            <option value="DATE_DESC">Date: Latest</option>

            <option value="AMOUNT_HIGH">Amount: High to Low</option>

            <option value="AMOUNT_LOW">Amount: Low to High</option>

            <option value="BOOKING_HIGH">Booking ID: High</option>

            <option value="BOOKING_LOW">Booking ID: Low</option>
          </select>
        </div>
      </div>

      {/* ====================================================
          QUICK FILTERS
      ==================================================== */}

      <div className="wj-filter-section">
        <div className="wj-filter-title">Job Status</div>

        <div className="wj-filter-buttons">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={
                statusFilter === filter.value
                  ? "wj-filter-btn active"
                  : "wj-filter-btn"
              }
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}

              <span>{getStatusCount(filter.value)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ====================================================
          RESULTS HEADER
      ==================================================== */}

      <div className="wj-results-header">
        <div>
          <h2>Assigned Jobs</h2>

          <p>
            Showing <strong>{filteredJobs.length}</strong> of{" "}
            <strong>{jobs.length}</strong> jobs
          </p>
        </div>

        {(search || statusFilter !== "ALL") && (
          <button
            type="button"
            className="wj-reset-btn"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ====================================================
          EMPTY STATE
      ==================================================== */}

      {filteredJobs.length === 0 ? (
        <div className="wj-empty-state">
          <div className="wj-empty-icon">🚘</div>

          <h3>No Jobs Found</h3>

          <p>
            {search || statusFilter !== "ALL"
              ? "No jobs match your current search or filter."
              : "You don't have any assigned jobs right now."}
          </p>

          {(search || statusFilter !== "ALL") && (
            <button
              type="button"
              className="wj-btn wj-btn-primary"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* ==================================================
           JOB GRID
        ================================================== */

        <div className="wj-jobs-grid">
          {filteredJobs.map((job) => {
            const status = job.status;

            return (
              <div className="wj-job-card" key={job.bookingId}>
                {/* ======================================
                      CARD TOP
                  ====================================== */}

                <div className="wj-card-top">
                  <div>
                    <span className="wj-booking-label">BOOKING</span>

                    <h3>#{job.bookingId}</h3>
                  </div>

                  <span
                    className={`wj-status-badge status-${String(
                      status || "",
                    ).toLowerCase()}`}
                  >
                    {formatStatus(status)}
                  </span>
                </div>

                {/* ======================================
                      VEHICLE
                  ====================================== */}

                <div className="wj-vehicle-section">
                  <div className="wj-vehicle-icon">🚗</div>

                  <div>
                    <h4>{getVehicleName(job)}</h4>

                    <p>{job.vehicleNumber || "Registration not available"}</p>
                  </div>
                </div>

                {/* ======================================
                      SERVICE
                  ====================================== */}

                <div className="wj-info-row">
                  <div className="wj-info-item">
                    <span>SERVICE</span>

                    <strong>{getServiceName(job)}</strong>
                  </div>

                  <div className="wj-info-item">
                    <span>AMOUNT</span>

                    <strong>
                      ₹{Number(job.totalAmount || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {/* ======================================
                      CUSTOMER
                  ====================================== */}

                <div className="wj-customer-section">
                  <div className="wj-customer-avatar">
                    {String(job.customerName || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <span>CUSTOMER</span>

                    <strong>{job.customerName || "Customer"}</strong>

                    <small>
                      {job.customerEmail ||
                        job.customerPhone ||
                        "Contact unavailable"}
                    </small>
                  </div>
                </div>

                {/* ======================================
                      BOOKING DATE
                  ====================================== */}

                <div className="wj-booking-info">
                  <div>
                    <span>📅 Date</span>

                    <strong>{formatDate(job.bookingDate)}</strong>
                  </div>

                  <div>
                    <span>🕐 Time</span>

                    <strong>{formatTime(job.bookingTime)}</strong>
                  </div>
                </div>

                {/* ======================================
                      PICKUP / DROP
                  ====================================== */}

                {(job.pickupRequired || job.dropRequired) && (
                  <div className="wj-logistics">
                    {job.pickupRequired && <span>🚙 Pickup Required</span>}

                    {job.dropRequired && <span>🏠 Drop Required</span>}
                  </div>
                )}

                {/* ======================================
                      NOTES
                  ====================================== */}

                {job.notes && (
                  <div className="wj-notes">
                    <span>Notes</span>

                    <p>{job.notes}</p>
                  </div>
                )}

                {/* ======================================
                      CARD ACTIONS
                  ====================================== */}

                <div className="wj-card-actions">
                  <button
                    type="button"
                    className="wj-btn wj-btn-secondary"
                    onClick={() => openJobModal(job)}
                  >
                    View Details
                  </button>

                  {renderActionButton(job)}
                </div>

                {/* ======================================
                      PROGRESS
                  ====================================== */}

                <div className="wj-progress">
                  <div className="wj-progress-label">
                    <span>Workflow Progress</span>

                    <strong>
                      {status === "ASSIGNED"
                        ? "1 / 8"
                        : status === "RECEIVED"
                          ? "2 / 8"
                          : status === "INSPECTION"
                            ? "3 / 8"
                            : status === "WASHING"
                              ? "4 / 8"
                              : status === "DRYING"
                                ? "5 / 8"
                                : status === "QUALITY_CHECK"
                                  ? "6 / 8"
                                  : status === "COMPLETED"
                                    ? "7 / 8"
                                    : status === "DELIVERED"
                                      ? "8 / 8"
                                      : "—"}
                    </strong>
                  </div>

                  <div className="wj-progress-track">
                    <div
                      className="wj-progress-fill"
                      style={{
                        width: `${WORKFLOW_PROGRESS[status] || 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================
          JOB DETAILS MODAL
      ==================================================== */}

      {showModal && selectedJob && (
        <div className="wj-modal-overlay" onClick={closeJobModal}>
          <div
            className="wj-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* ==========================================
                  MODAL HEADER
              ========================================== */}

            <div className="wj-modal-header">
              <div>
                <span>BOOKING DETAILS</span>

                <h2>#{selectedJob.bookingId}</h2>
              </div>

              <button
                type="button"
                className="wj-modal-close"
                onClick={closeJobModal}
              >
                ×
              </button>
            </div>

            {/* ==========================================
                  MODAL BODY
              ========================================== */}

            <div className="wj-modal-body">
              {/* VEHICLE */}

              <div className="wj-modal-section">
                <h3>Vehicle Information</h3>

                <div className="wj-modal-grid">
                  <div>
                    <span>Vehicle</span>

                    <strong>{getVehicleName(selectedJob)}</strong>
                  </div>

                  <div>
                    <span>Registration</span>

                    <strong>{selectedJob.vehicleNumber || "—"}</strong>
                  </div>

                  <div>
                    <span>Type</span>

                    <strong>{selectedJob.vehicleType || "—"}</strong>
                  </div>
                </div>
              </div>

              {/* CUSTOMER */}

              <div className="wj-modal-section">
                <h3>Customer Information</h3>

                <div className="wj-modal-grid">
                  <div>
                    <span>Name</span>

                    <strong>{selectedJob.customerName || "—"}</strong>
                  </div>

                  <div>
                    <span>Email</span>

                    <strong>{selectedJob.customerEmail || "—"}</strong>
                  </div>

                  <div>
                    <span>Phone</span>

                    <strong>{selectedJob.customerPhone || "—"}</strong>
                  </div>
                </div>
              </div>

              {/* SERVICE */}

              <div className="wj-modal-section">
                <h3>Service Information</h3>

                <div className="wj-modal-grid">
                  <div>
                    <span>Service</span>

                    <strong>{selectedJob.serviceName || "—"}</strong>
                  </div>

                  <div>
                    <span>Package</span>

                    <strong>{selectedJob.packageName || "—"}</strong>
                  </div>

                  <div>
                    <span>Amount</span>

                    <strong>
                      ₹
                      {Number(selectedJob.totalAmount || 0).toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SCHEDULE */}

              <div className="wj-modal-section">
                <h3>Schedule</h3>

                <div className="wj-modal-grid">
                  <div>
                    <span>Date</span>

                    <strong>{formatDate(selectedJob.bookingDate)}</strong>
                  </div>

                  <div>
                    <span>Time</span>

                    <strong>{formatTime(selectedJob.bookingTime)}</strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <strong>{formatStatus(selectedJob.status)}</strong>
                  </div>
                </div>
              </div>

              {/* PICKUP / DROP */}

              {(selectedJob.pickupRequired || selectedJob.dropRequired) && (
                <div className="wj-modal-section">
                  <h3>Logistics</h3>

                  <div className="wj-modal-grid">
                    <div>
                      <span>Pickup</span>

                      <strong>
                        {selectedJob.pickupRequired
                          ? "Required"
                          : "Not Required"}
                      </strong>
                    </div>

                    <div>
                      <span>Drop</span>

                      <strong>
                        {selectedJob.dropRequired ? "Required" : "Not Required"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTES */}

              {selectedJob.notes && (
                <div className="wj-modal-notes">
                  <h3>Customer Notes</h3>

                  <p>{selectedJob.notes}</p>
                </div>
              )}
            </div>

            {/* ==========================================
                  MODAL FOOTER
              ========================================== */}

            <div className="wj-modal-footer">
              <button
                type="button"
                className="wj-btn wj-btn-secondary"
                onClick={closeJobModal}
              >
                Close
              </button>

              <button
                type="button"
                className="wj-btn wj-btn-secondary"
                onClick={() => {
                  const job = selectedJob;

                  closeJobModal();

                  handleViewDetails(job);
                }}
              >
                Full Details
              </button>

              {selectedJob.status !== "CANCELLED" &&
                selectedJob.status !== "DELIVERED" && (
                  <button
                    type="button"
                    className="wj-btn wj-btn-primary"
                    disabled={updatingId === selectedJob.bookingId}
                    onClick={() => {
                      const job = selectedJob;

                      closeJobModal();

                      handleNextAction(job);
                    }}
                  >
                    {updatingId === selectedJob.bookingId
                      ? "Updating..."
                      : ACTION_LABELS[selectedJob.status] || "Continue"}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerJobs;
