import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./ServiceProgressHome.css";

function ServiceProgressHome() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // =========================================================
  // FETCH WORKER JOBS
  // =========================================================

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/worker/jobs");

      const data = response.data;

      const jobList = Array.isArray(data)
        ? data
        : data?.jobs || [];

      setJobs(jobList);

    } catch (err) {
      console.error("Service Progress Jobs Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load service jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD
  // =========================================================

  useEffect(() => {
    fetchJobs();
  }, []);

  // =========================================================
  // FILTER JOBS
  // =========================================================

  const filteredJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return jobs;
    }

    return jobs.filter((job) => {
      const bookingId = String(job.bookingId || "").toLowerCase();

      const vehicleNumber = String(
        job.vehicleNumber || ""
      ).toLowerCase();

      const customerName = String(
        job.customerName || ""
      ).toLowerCase();

      const serviceName = String(
        job.serviceName || job.packageName || ""
      ).toLowerCase();

      return (
        bookingId.includes(keyword) ||
        vehicleNumber.includes(keyword) ||
        customerName.includes(keyword) ||
        serviceName.includes(keyword)
      );
    });
  }, [jobs, search]);

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusClass = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "COMPLETED") {
      return "completed";
    }

    if (value === "DELIVERED") {
      return "delivered";
    }

    if (value === "QUALITY_CHECK") {
      return "quality";
    }

    if (value === "DRYING") {
      return "drying";
    }

    if (value === "WASHING") {
      return "washing";
    }

    if (value === "IN_PROGRESS") {
      return "progress";
    }

    return "default";
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    if (!status) {
      return "PENDING";
    }

    return String(status)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // =========================================================
  // PROGRESS PERCENTAGE
  // =========================================================

  const getProgress = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "DELIVERED") {
      return 100;
    }

    if (value === "COMPLETED") {
      return 75;
    }

    if (value === "QUALITY_CHECK") {
      return 65;
    }

    if (value === "DRYING") {
      return 50;
    }

    if (value === "WASHING") {
      return 35;
    }

    if (value === "IN_PROGRESS") {
      return 25;
    }

    return 10;
  };

  // =========================================================
  // OPEN SERVICE PROGRESS
  // =========================================================

  const openProgress = (bookingId) => {
    if (!bookingId) {
      setError("Booking ID is missing.");
      return;
    }

    navigate(`/worker/service-progress/${bookingId}`);
  };

  // =========================================================
  // BACK TO JOBS
  // =========================================================

  const goToJobs = () => {
    navigate("/worker/jobs");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="sph-page">

        <div className="sph-loading">

          <div className="sph-loader"></div>

          <h3>Loading service progress...</h3>

          <p>
            Fetching your active vehicle services.
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="sph-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sph-header">

        <div className="sph-header-left">

          <div className="sph-eyebrow">
            AUTOGLOW WORKSPACE
          </div>

          <h1>
            Service <span>Progress</span>
          </h1>

          <p>
            Track and continue the service workflow for your assigned
            vehicles.
          </p>

        </div>

        <div className="sph-header-actions">

          <button
            type="button"
            className="sph-refresh-btn"
            onClick={fetchJobs}
          >
            ↻
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="sph-jobs-btn"
            onClick={goToJobs}
          >
            My Jobs
            <span>→</span>
          </button>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="sph-alert">

          <div className="sph-alert-icon">
            !
          </div>

          <div>
            <strong>
              Unable to load service progress
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>
      )}


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="sph-stats">

        <div className="sph-stat-card">

          <div className="sph-stat-icon blue">
            ◉
          </div>

          <div>
            <span>ACTIVE JOBS</span>
            <strong>{jobs.length}</strong>
          </div>

        </div>


        <div className="sph-stat-card">

          <div className="sph-stat-icon orange">
            ◒
          </div>

          <div>
            <span>IN PROGRESS</span>

            <strong>
              {
                jobs.filter((job) =>
                  [
                    "WASHING",
                    "DRYING",
                    "QUALITY_CHECK",
                    "IN_PROGRESS",
                  ].includes(
                    String(job.status || "").toUpperCase()
                  )
                ).length
              }
            </strong>

          </div>

        </div>


        <div className="sph-stat-card">

          <div className="sph-stat-icon green">
            ✓
          </div>

          <div>
            <span>COMPLETED</span>

            <strong>
              {
                jobs.filter((job) =>
                  ["COMPLETED", "DELIVERED"].includes(
                    String(job.status || "").toUpperCase()
                  )
                ).length
              }
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          JOB WORKSPACE
      ===================================================== */}

      <section className="sph-workspace">

        <div className="sph-workspace-header">

          <div>

            <span className="sph-section-label">
              SERVICE WORKSPACE
            </span>

            <h2>
              Continue Vehicle Service
            </h2>

            <p>
              Select a vehicle to continue its service progress.
            </p>

          </div>

          <div className="sph-job-count">
            {filteredJobs.length} Jobs
          </div>

        </div>


        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="sph-search-row">

          <div className="sph-search-box">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search vehicle, customer, booking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

        </div>


        {/* ===================================================
            NO JOBS
        =================================================== */}

        {filteredJobs.length === 0 ? (

          <div className="sph-empty">

            <div className="sph-empty-icon">
              🚘
            </div>

            <h3>
              No service jobs found
            </h3>

            <p>
              There are currently no matching vehicle services assigned
              to you.
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            )}

          </div>

        ) : (

          <div className="sph-job-grid">

            {filteredJobs.map((job, index) => {

              const bookingId = job.bookingId;

              const status = String(
                job.status || "PENDING"
              ).toUpperCase();

              const progress = getProgress(status);

              const statusClass =
                getStatusClass(status);

              const vehicleNumber =
                job.vehicleNumber || "Vehicle";

              const customerName =
                job.customerName || "Customer";

              const serviceName =
                job.serviceName ||
                job.packageName ||
                "Vehicle Service";

              const vehicleBrand =
                job.vehicleBrand || "";

              const vehicleModel =
                job.vehicleModel || "";

              return (
                <article
                  className="sph-job-card"
                  key={
                    bookingId ||
                    job.id ||
                    index
                  }
                >

                  {/* ==============================
                      CARD TOP
                  ============================== */}

                  <div className="sph-card-top">

                    <div className="sph-vehicle-avatar">
                      🚘
                    </div>

                    <div className="sph-booking-info">

                      <span>
                        BOOKING
                      </span>

                      <strong>
                        #{bookingId || "—"}
                      </strong>

                    </div>

                    <div
                      className={`sph-status ${statusClass}`}
                    >
                      <span></span>
                      {getStatusLabel(status)}
                    </div>

                  </div>


                  {/* ==============================
                      VEHICLE
                  ============================== */}

                  <div className="sph-vehicle-info">

                    <h3>
                      {vehicleNumber}
                    </h3>

                    <p>
                      {vehicleBrand}
                      {vehicleModel
                        ? ` ${vehicleModel}`
                        : ""}
                    </p>

                  </div>


                  {/* ==============================
                      DETAILS
                  ============================== */}

                  <div className="sph-details">

                    <div className="sph-detail">

                      <span>
                        CUSTOMER
                      </span>

                      <strong>
                        {customerName}
                      </strong>

                    </div>


                    <div className="sph-detail">

                      <span>
                        SERVICE
                      </span>

                      <strong>
                        {serviceName}
                      </strong>

                    </div>

                  </div>


                  {/* ==============================
                      PROGRESS
                  ============================== */}

                  <div className="sph-progress">

                    <div className="sph-progress-heading">

                      <span>
                        SERVICE PROGRESS
                      </span>

                      <strong>
                        {progress}%
                      </strong>

                    </div>

                    <div className="sph-progress-track">

                      <div
                        className="sph-progress-fill"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* ==============================
                      ACTION
                  ============================== */}

                  <div className="sph-card-footer">

                    <div className="sph-card-stage">

                      <span className="sph-stage-dot"></span>

                      <span>
                        {status === "WASHING"
                          ? "Washing in progress"
                          : status === "DRYING"
                            ? "Drying stage"
                            : status === "QUALITY_CHECK"
                              ? "Quality inspection"
                              : status === "COMPLETED"
                                ? "Ready for delivery"
                                : status === "DELIVERED"
                                  ? "Service delivered"
                                  : "Service assigned"}
                      </span>

                    </div>

                    <button
                      type="button"
                      className="sph-continue-btn"
                      onClick={() =>
                        openProgress(bookingId)
                      }
                    >
                      Continue
                      <span>→</span>
                    </button>

                  </div>

                </article>
              );
            })}

          </div>

        )}

      </section>

    </div>
  );
}

export default ServiceProgressHome;