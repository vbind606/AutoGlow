import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./WorkerAIInspectionHome.css";

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

const WorkerAIInspectionHome = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/worker/jobs");

      const data = response.data;

      const normalizedJobs = Array.isArray(data)
        ? data
        : Array.isArray(data?.jobs)
          ? data.jobs
          : [];

      setJobs(normalizedJobs);
    } catch (err) {
      console.error("AI inspection jobs loading error:", err);

      setError(
        err.response?.data?.message || "AI inspection jobs load nahi ho paayi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return jobs;
    }

    return jobs.filter((job) => {
      const bookingId = String(job.bookingId || "").toLowerCase();
      const vehicleNumber = String(
        job.vehicleNumber || job.vehicle?.vehicleNumber || "",
      ).toLowerCase();
      const customerName = String(
        job.customerName || job.customer?.name || "",
      ).toLowerCase();
      const vehicleModel = String(
        job.vehicleModel || job.vehicle?.model || "",
      ).toLowerCase();

      return (
        bookingId.includes(keyword) ||
        vehicleNumber.includes(keyword) ||
        customerName.includes(keyword) ||
        vehicleModel.includes(keyword)
      );
    });
  }, [jobs, search]);

  const getVehicleNumber = (job) => {
    return (
      job.vehicleNumber ||
      job.vehicle?.vehicleNumber ||
      job.registrationNumber ||
      "Vehicle"
    );
  };

  const getCustomerName = (job) => {
    return job.customerName || job.customer?.name || "Customer";
  };

  const getVehicleModel = (job) => {
    return (
      job.vehicleModel ||
      job.vehicle?.model ||
      job.vehicleName ||
      "Vehicle Service"
    );
  };

  const getStatus = (job) => {
    return String(job.status || "ASSIGNED").toUpperCase();
  };

  const canStartInspection = (job) => {
    const status = getStatus(job);

    return !["COMPLETED", "DELIVERED", "CANCELLED"].includes(status);
  };

  const startInspection = (job) => {
    if (!job.bookingId) {
      alert("Booking ID nahi mila.");
      return;
    }

    navigate(`/worker/ai-inspection/${job.bookingId}`);
  };

  const totalJobs = jobs.length;

  const activeJobs = jobs.filter((job) =>
    ["ASSIGNED", "RECEIVED", "INSPECTION"].includes(getStatus(job)),
  ).length;

  const completedJobs = jobs.filter((job) =>
    ["COMPLETED", "DELIVERED"].includes(getStatus(job)),
  ).length;

  return (
    <div className="worker-ai-home">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="ai-home-hero">
        <div className="ai-hero-glow"></div>

        <div className="ai-hero-content">
          <div className="ai-hero-badge">
            <span className="ai-pulse"></span>
            AUTOGLOW AI
          </div>

          <h1>
            AI Vehicle
            <span> Inspection</span>
          </h1>

          <p>
            Select a vehicle and start an AI-assisted inspection to identify
            visible vehicle issues faster.
          </p>
        </div>

        <div className="ai-hero-symbol">✦</div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="ai-stats-grid">
        <div className="ai-stat-card">
          <div className="ai-stat-icon blue">◫</div>

          <div>
            <span>Total Jobs</span>
            <strong>{totalJobs}</strong>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-icon purple">✦</div>

          <div>
            <span>Active Jobs</span>
            <strong>{activeJobs}</strong>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-icon green">✓</div>

          <div>
            <span>Completed</span>
            <strong>{completedJobs}</strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <section className="ai-jobs-section">
        <div className="ai-section-header">
          <div>
            <span className="ai-section-label">INSPECTION CENTER</span>

            <h2>Select Vehicle</h2>

            <p>Choose an assigned vehicle to begin AI inspection.</p>
          </div>

          <button
            className="ai-refresh-btn"
            onClick={loadJobs}
            disabled={loading}
          >
            ↻<span>Refresh</span>
          </button>
        </div>

        <div className="ai-search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search booking, vehicle or customer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="ai-clear-search"
            >
              ×
            </button>
          )}
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="ai-state-card">
            <div className="ai-loader"></div>

            <h3>Loading inspection jobs...</h3>

            <p>Please wait while we fetch your assigned vehicles.</p>
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <div className="ai-state-card error">
            <div className="ai-state-icon">!</div>

            <h3>Unable to load jobs</h3>

            <p>{error}</p>

            <button className="ai-primary-btn" onClick={loadJobs}>
              Try Again
            </button>
          </div>
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="ai-state-card">
            <div className="ai-state-icon">◫</div>

            <h3>{search ? "No matching jobs" : "No inspection jobs found"}</h3>

            <p>
              {search
                ? "Try another booking ID, vehicle number or customer name."
                : "There are currently no worker jobs available for inspection."}
            </p>
          </div>
        )}

        {/* =====================================================
            JOB GRID
        ===================================================== */}

        {!loading && !error && filteredJobs.length > 0 && (
          <div className="ai-job-grid">
            {filteredJobs.map((job) => {
              const status = getStatus(job);
              const statusLabel = STATUS_LABELS[status] || status;

              const vehicleNumber = getVehicleNumber(job);

              const customerName = getCustomerName(job);

              const vehicleModel = getVehicleModel(job);

              const available = canStartInspection(job);

              return (
                <article className="ai-job-card" key={job.bookingId}>
                  {/* CARD TOP */}

                  <div className="ai-job-card-top">
                    <div className="ai-vehicle-avatar">🚗</div>

                    <div className="ai-booking-info">
                      <span>BOOKING</span>

                      <strong>#{job.bookingId}</strong>
                    </div>

                    <span
                      className={`ai-status status-${status.toLowerCase()}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* VEHICLE */}

                  <div className="ai-vehicle-info">
                    <h3>{vehicleNumber}</h3>

                    <p>{vehicleModel}</p>
                  </div>

                  {/* CUSTOMER */}

                  <div className="ai-customer-row">
                    <div className="ai-customer-icon">◉</div>

                    <div>
                      <span>Customer</span>

                      <strong>{customerName}</strong>
                    </div>
                  </div>

                  {/* AI READY */}

                  <div className="ai-ready-box">
                    <div className="ai-ready-icon">✦</div>

                    <div>
                      <strong>AI Inspection Ready</strong>

                      <span>Upload vehicle images for analysis</span>
                    </div>
                  </div>

                  {/* ACTION */}

                  <button
                    className="ai-start-btn"
                    disabled={!available}
                    onClick={() => startInspection(job)}
                  >
                    <span>✦</span>

                    {available
                      ? "Start AI Inspection"
                      : "Inspection Unavailable"}

                    {available && <b>→</b>}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          AI INFORMATION
      ===================================================== */}

      <section className="ai-info-banner">
        <div className="ai-info-symbol">✦</div>

        <div className="ai-info-content">
          <span>AUTOGLOW AI ASSISTANT</span>

          <h3>Faster inspection. Better service quality.</h3>

          <p>
            AI inspection helps workers review vehicle images, identify visible
            issues and prepare better service recommendations.
          </p>
        </div>

        <div className="ai-info-status">
          <span></span>
          AI System Ready
        </div>
      </section>
    </div>
  );
};

export default WorkerAIInspectionHome;
