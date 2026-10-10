import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./WorkerDashboard.css";

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  // =========================================================
  // GET LOCAL TODAY DATE
  // =========================================================

  const getTodayString = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // NORMALIZE DATE
  // =========================================================

  const normalizeDate = (value) => {
    if (!value) return "";

    const stringValue = String(value);

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
      return stringValue;
    }

    // ISO datetime
    if (stringValue.includes("T")) {
      return stringValue.substring(0, 10);
    }

    const parsed = new Date(stringValue);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // FETCH DASHBOARD + JOBS
  // =========================================================

  const fetchDashboard = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      // -------------------------------------------------------
      // GET DASHBOARD
      // -------------------------------------------------------

      const dashboardPromise = api.get("/worker/dashboard");

      // -------------------------------------------------------
      // GET ACTUAL WORKER JOBS
      // -------------------------------------------------------

      const jobsPromise = api.get("/worker/jobs");

      const [dashboardResponse, jobsResponse] = await Promise.allSettled([
        dashboardPromise,
        jobsPromise,
      ]);

      // =======================================================
      // DASHBOARD RESPONSE
      // =======================================================

      if (dashboardResponse.status === "fulfilled") {
        setDashboard(dashboardResponse.value.data);
      } else {
        console.error("Worker dashboard API error:", dashboardResponse.reason);
      }

      // =======================================================
      // JOB RESPONSE
      // =======================================================

      if (jobsResponse.status === "fulfilled") {
        const jobData = Array.isArray(jobsResponse.value.data)
          ? jobsResponse.value.data
          : [];

        setJobs(jobData);
      } else {
        console.error("Worker jobs API error:", jobsResponse.reason);
      }

      // =======================================================
      // BOTH FAILED
      // =======================================================

      if (
        dashboardResponse.status === "rejected" &&
        jobsResponse.status === "rejected"
      ) {
        const dashboardError = dashboardResponse.reason;

        if (dashboardError?.response?.status === 401) {
          setError("Your session has expired. Please login again.");
        } else if (dashboardError?.response?.status === 403) {
          setError("You are not authorized to access worker dashboard.");
        } else {
          setError(
            dashboardError?.response?.data?.message ||
              "Unable to load worker dashboard.",
          );
        }
      }
    } catch (err) {
      console.error("Worker dashboard error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to load worker dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  // =========================================================
  // AUTO REFRESH
  // New assigned jobs will appear automatically
  // =========================================================

  useEffect(() => {
    const refreshTimer = setInterval(() => {
      fetchDashboard(false);
    }, 15000);

    return () => clearInterval(refreshTimer);
  }, [fetchDashboard]);

  // =========================================================
  // LIVE CLOCK
  // =========================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =========================================================
  // DATE
  // =========================================================

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // =========================================================
  // TIME
  // =========================================================

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // =========================================================
  // ACTUAL TODAY JOBS
  // =========================================================

  const todayJobs = useMemo(() => {
    const today = getTodayString();

    const actualTodayJobs = jobs.filter((job) => {
      const bookingDate = normalizeDate(job?.bookingDate);

      return bookingDate === today;
    });

    // ---------------------------------------------------------
    // If backend already gives todayJobs and worker jobs
    // doesn't contain date, use backend result as fallback.
    // ---------------------------------------------------------

    if (actualTodayJobs.length > 0) {
      return actualTodayJobs;
    }

    if (jobs.length === 0 && Array.isArray(dashboard?.todayJobs)) {
      return dashboard.todayJobs;
    }

    return actualTodayJobs;
  }, [jobs, dashboard]);

  // =========================================================
  // UPCOMING JOBS
  // =========================================================

  const upcomingJobs = useMemo(() => {
    const today = getTodayString();

    return jobs
      .filter((job) => {
        const bookingDate = normalizeDate(job?.bookingDate);

        if (!bookingDate) {
          return false;
        }

        return bookingDate > today;
      })
      .sort((a, b) => {
        const dateA = `${normalizeDate(a?.bookingDate)} ${
          a?.bookingTime || ""
        }`;

        const dateB = `${normalizeDate(b?.bookingDate)} ${
          b?.bookingTime || ""
        }`;

        return dateA.localeCompare(dateB);
      });
  }, [jobs]);

  // =========================================================
  // RECENT JOBS
  // =========================================================

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => {
        const dateA = `${normalizeDate(a?.bookingDate)} ${
          a?.bookingTime || ""
        }`;

        const dateB = `${normalizeDate(b?.bookingDate)} ${
          b?.bookingTime || ""
        }`;

        return dateB.localeCompare(dateA);
      })
      .slice(0, 6);
  }, [jobs]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const calculatedStats = useMemo(() => {
    const totalAssigned = jobs.length;

    const pendingStatuses = ["ASSIGNED", "RECEIVED"];

    const inProgressStatuses = [
      "INSPECTION",
      "WASHING",
      "DRYING",
      "QUALITY_CHECK",
    ];

    const completedStatuses = ["COMPLETED", "DELIVERED"];

    const cancelledStatuses = ["CANCELLED"];

    const pendingJobs = jobs.filter((job) =>
      pendingStatuses.includes(job?.status),
    ).length;

    const inProgressJobs = jobs.filter((job) =>
      inProgressStatuses.includes(job?.status),
    ).length;

    const completedJobs = jobs.filter((job) =>
      completedStatuses.includes(job?.status),
    ).length;

    const cancelledJobs = jobs.filter((job) =>
      cancelledStatuses.includes(job?.status),
    ).length;

    return {
      totalAssigned,
      pendingJobs,
      inProgressJobs,
      completedJobs,
      cancelledJobs,
    };
  }, [jobs]);

  // =========================================================
  // FINAL STATS
  // =========================================================

  const totalAssigned =
    calculatedStats.totalAssigned || Number(dashboard?.totalAssigned || 0);

  const pendingJobs =
    calculatedStats.pendingJobs || Number(dashboard?.pendingJobs || 0);

  const inProgressJobs =
    calculatedStats.inProgressJobs || Number(dashboard?.inProgressJobs || 0);

  const completedJobs =
    calculatedStats.completedJobs || Number(dashboard?.completedJobs || 0);

  const cancelledJobs =
    calculatedStats.cancelledJobs || Number(dashboard?.cancelledJobs || 0);

  // =========================================================
  // PERFORMANCE
  // =========================================================

  const performance = useMemo(() => {
    if (totalAssigned === 0) {
      return 0;
    }

    return Math.min(100, Math.round((completedJobs / totalAssigned) * 100));
  }, [totalAssigned, completedJobs]);

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    if (!status) return "status-default";

    switch (String(status).toUpperCase()) {
      case "ASSIGNED":
        return "status-assigned";

      case "RECEIVED":
        return "status-received";

      case "INSPECTION":
        return "status-inspection";

      case "WASHING":
        return "status-washing";

      case "DRYING":
        return "status-drying";

      case "QUALITY_CHECK":
        return "status-quality";

      case "COMPLETED":
        return "status-completed";

      case "DELIVERED":
        return "status-delivered";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "status-default";
    }
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return String(status)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // =========================================================
  // DATE FORMATTER
  // =========================================================

  const formatBookingDate = (date) => {
    if (!date) return "—";

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

  // =========================================================
  // TIME FORMATTER
  // =========================================================

  const formatBookingTime = (time) => {
    if (!time) return "—";

    const timeString = String(time);

    const parts = timeString.split(":");

    if (parts.length < 2) {
      return timeString;
    }

    let hour = Number(parts[0]);
    const minute = parts[1];

    if (Number.isNaN(hour)) {
      return timeString;
    }

    const suffix = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {
      hour = 12;
    }

    return `${hour}:${minute} ${suffix}`;
  };

  // =========================================================
  // VEHICLE NAME
  // =========================================================

  const getVehicleName = (job) => {
    const brand = job?.vehicleBrand || "";
    const model = job?.vehicleModel || "";

    const vehicleName = `${brand} ${model}`.trim();

    return vehicleName || job?.vehicleType || "Vehicle";
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");
    localStorage.removeItem("autoglow_email");

    navigate("/login");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="worker-dashboard-loading">
        <div className="dashboard-loader"></div>

        <h3>Loading Worker Dashboard</h3>

        <p>Fetching your jobs, performance and service information...</p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="worker-dashboard-error">
        <div className="dashboard-error-icon">!</div>

        <h2>Unable to Load Dashboard</h2>

        <p>{error}</p>

        <div className="dashboard-error-actions">
          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            className="dashboard-retry-btn"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="dashboard-login-btn"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="worker-dashboard-page">
      {/* =====================================================
          WELCOME
      ===================================================== */}

      <section className="dashboard-welcome-section">
        <div className="dashboard-welcome-content">
          <div className="dashboard-welcome-badge">
            <span className="welcome-dot"></span>
            Worker Workspace
          </div>

          <h1>
            Welcome back, <span>{dashboard?.workerName || "Worker"}</span>
          </h1>

          <p>
            Manage your assigned vehicles, service tasks and daily workflow from
            one place.
          </p>

          <div className="dashboard-date-time">
            <div>
              <span className="date-icon">▣</span>
              {formattedDate}
            </div>

            <div>
              <span className="time-icon">◷</span>
              {formattedTime}
            </div>
          </div>
        </div>

        <div className="dashboard-worker-card">
          <div className="dashboard-worker-avatar">
            {(dashboard?.workerName || "W")
              .split(" ")
              .map((word) => word.charAt(0))
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>

          <div className="dashboard-worker-info">
            <strong>{dashboard?.workerName || "Worker"}</strong>

            <span>
              {dashboard?.specialization || "Vehicle Service Specialist"}
            </span>

            <small
              className={dashboard?.active ? "worker-online" : "worker-offline"}
            >
              <span></span>

              {dashboard?.active ? "Active Worker" : "Inactive Worker"}
            </small>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="stat-icon stat-icon-blue">
            <span>▣</span>
          </div>

          <div className="stat-content">
            <span>Total Assigned</span>

            <strong>{totalAssigned}</strong>

            <small>All assigned jobs</small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon stat-icon-orange">
            <span>◷</span>
          </div>

          <div className="stat-content">
            <span>Pending Jobs</span>

            <strong>{pendingJobs}</strong>

            <small>Waiting for service</small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon stat-icon-purple">
            <span>⚙</span>
          </div>

          <div className="stat-content">
            <span>In Progress</span>

            <strong>{inProgressJobs}</strong>

            <small>Currently servicing</small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon stat-icon-green">
            <span>✓</span>
          </div>

          <div className="stat-content">
            <span>Completed</span>

            <strong>{completedJobs}</strong>

            <small>Successfully completed</small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon stat-icon-red">
            <span>×</span>
          </div>

          <div className="stat-content">
            <span>Cancelled</span>

            <strong>{cancelledJobs}</strong>

            <small>Cancelled bookings</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <section className="dashboard-main-grid">
        {/* ===================================================
            TODAY JOBS
        =================================================== */}

        <div className="dashboard-panel today-jobs-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">DAILY WORKFLOW</span>

              <h2>Today's Jobs</h2>

              <p>Vehicles scheduled for today</p>
            </div>

            <Link to="/worker/jobs" className="panel-view-all">
              View All →
            </Link>
          </div>

          {/* IMPORTANT:
              Today jobs are now coming from /worker/jobs
          */}

          {todayJobs.length === 0 ? (
            <div className="dashboard-empty-state">
              <div className="empty-state-icon">✓</div>

              <h3>No jobs scheduled today</h3>

              <p>
                You don't have any vehicle service jobs scheduled for today.
              </p>

              {/* DEBUG / HELPFUL ACTION */}

              {jobs.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/worker/jobs")}
                  className="dashboard-retry-btn"
                  style={{
                    marginTop: "16px",
                  }}
                >
                  View My Jobs ({jobs.length})
                </button>
              )}
            </div>
          ) : (
            <div className="jobs-table-wrapper">
              <table className="worker-jobs-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {todayJobs.map((job) => (
                    <tr key={job.bookingId}>
                      <td>
                        <div className="table-vehicle">
                          <div className="vehicle-mini-icon">🚗</div>

                          <div>
                            <strong>{job.vehicleNumber || "N/A"}</strong>

                            <span>{getVehicleName(job)}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="table-customer">
                          <strong>{job.customerName || "Customer"}</strong>

                          <span>{job.customerEmail || "—"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="table-service">
                          <strong>
                            {job.serviceName || "Vehicle Service"}
                          </strong>

                          {job.packageName && <span>{job.packageName}</span>}
                        </div>
                      </td>

                      <td>
                        <strong className="job-time">
                          {formatBookingTime(job.bookingTime)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`job-status ${getStatusClass(job.status)}`}
                        >
                          {formatStatus(job.status)}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/worker/job-details/${job.bookingId}`}
                          className="job-details-btn"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===================================================
            PERFORMANCE
        =================================================== */}

        <div className="dashboard-panel performance-panel">
          <div className="panel-header performance-header">
            <div>
              <span className="panel-label">PERFORMANCE</span>

              <h2>Work Overview</h2>
            </div>

            <span className="performance-icon">★</span>
          </div>

          <div className="performance-circle-wrapper">
            <div
              className="performance-circle"
              style={{
                "--performance": `${performance * 3.6}deg`,
              }}
            >
              <div className="performance-circle-inner">
                <strong>{performance}%</strong>

                <span>Completion</span>
              </div>
            </div>
          </div>

          <div className="performance-summary">
            <div>
              <span>Assigned</span>
              <strong>{totalAssigned}</strong>
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedJobs}</strong>
            </div>

            <div>
              <span>In Progress</span>
              <strong>{inProgressJobs}</strong>
            </div>
          </div>

          <div className="performance-message">
            {performance >= 80 ? (
              <>
                <strong>Excellent performance</strong>

                <p>You're maintaining a strong service completion rate.</p>
              </>
            ) : performance >= 50 ? (
              <>
                <strong>Good progress</strong>

                <p>Keep completing your assigned jobs consistently.</p>
              </>
            ) : (
              <>
                <strong>Keep going</strong>

                <p>Complete your active jobs to improve your performance.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          UPCOMING JOBS
      ===================================================== */}

      <section className="dashboard-panel upcoming-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">SCHEDULE</span>

            <h2>Upcoming Jobs</h2>

            <p>Your upcoming assigned services</p>
          </div>

          <Link to="/worker/jobs" className="panel-view-all">
            View All →
          </Link>
        </div>

        {upcomingJobs.length === 0 ? (
          <div className="dashboard-empty-state compact-empty">
            <div className="empty-state-icon">✓</div>

            <h3>No upcoming jobs</h3>

            <p>There are no upcoming assigned services.</p>
          </div>
        ) : (
          <div className="upcoming-jobs-grid">
            {upcomingJobs.slice(0, 6).map((job) => (
              <div className="upcoming-job-card" key={job.bookingId}>
                <div className="upcoming-job-top">
                  <div className="upcoming-date-box">
                    <span>
                      {job.bookingDate
                        ? new Date(
                            `${job.bookingDate}T00:00:00`,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                          })
                        : "--"}
                    </span>

                    <small>
                      {job.bookingDate
                        ? new Date(
                            `${job.bookingDate}T00:00:00`,
                          ).toLocaleDateString("en-IN", {
                            month: "short",
                          })
                        : ""}
                    </small>
                  </div>

                  <span className={`job-status ${getStatusClass(job.status)}`}>
                    {formatStatus(job.status)}
                  </span>
                </div>

                <div className="upcoming-job-content">
                  <h3>{job.vehicleNumber || "Vehicle"}</h3>

                  <p>{getVehicleName(job)}</p>

                  <div className="upcoming-job-service">
                    <span>Service</span>

                    <strong>{job.serviceName || "Vehicle Service"}</strong>
                  </div>
                </div>

                <div className="upcoming-job-footer">
                  <span>◷ {formatBookingTime(job.bookingTime)}</span>

                  <Link to={`/worker/job-details/${job.bookingId}`}>
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
    QUICK ACTIONS
===================================================== */}

      <section className="dashboard-quick-section">
        <div className="quick-section-heading">
          <div>
            <span className="panel-label">WORKSPACE</span>

            <h2>Quick Actions</h2>

            <p>Quickly access your daily service tools.</p>
          </div>
        </div>

        <div className="quick-actions-grid">
          {/* MY JOBS */}
          <Link to="/worker/jobs" className="quick-action-card">
            <div className="quick-action-icon blue">▣</div>

            <div>
              <strong>My Jobs</strong>

              <span>View all assigned jobs</span>
            </div>

            <b>→</b>
          </Link>

          {/* TODAY'S SCHEDULE */}
          <Link to="/worker/jobs" className="quick-action-card">
            <div className="quick-action-icon orange">◷</div>

            <div>
              <strong>Today's Schedule</strong>

              <span>Check today's services</span>
            </div>

            <b>→</b>
          </Link>

          {/* AI VEHICLE INSPECTION */}
          <Link
            to="/worker/ai-inspection"
            className="quick-action-card ai-inspection-quick-card"
          >
            <div className="quick-action-icon ai">✦</div>

            <div>
              <strong>AI Vehicle Inspection</strong>

              <span>Start AI-powered vehicle inspection</span>
            </div>

            <b>→</b>
          </Link>

          {/* MY PROFILE */}
          <Link to="/worker/profile" className="quick-action-card">
            <div className="quick-action-icon purple">●</div>

            <div>
              <strong>My Profile</strong>

              <span>View worker information</span>
            </div>

            <b>→</b>
          </Link>

          {/* NOTIFICATIONS */}
          <Link to="/worker/notifications" className="quick-action-card">
            <div className="quick-action-icon green">♢</div>

            <div>
              <strong>Notifications</strong>

              <span>Check latest updates</span>
            </div>

            <b>→</b>
          </Link>
        </div>
      </section>

      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <section className="dashboard-panel recent-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">ACTIVITY</span>

            <h2>Recent Service Activity</h2>

            <p>Latest jobs associated with your account</p>
          </div>
        </div>

        {recentJobs.length === 0 ? (
          <div className="dashboard-empty-state compact-empty">
            <div className="empty-state-icon">i</div>

            <h3>No recent activity</h3>

            <p>Your recent service activity will appear here.</p>
          </div>
        ) : (
          <div className="recent-jobs-list">
            {recentJobs.map((job) => (
              <div className="recent-job-item" key={job.bookingId}>
                <div className="recent-job-icon">🚗</div>

                <div className="recent-job-info">
                  <strong>{job.vehicleNumber || "Vehicle"}</strong>

                  <span>
                    {job.customerName || "Customer"}
                    {" • "}
                    {job.serviceName || "Vehicle Service"}
                  </span>
                </div>

                <div className="recent-job-date">
                  <span>{formatBookingDate(job.bookingDate)}</span>

                  <small>{formatBookingTime(job.bookingTime)}</small>
                </div>

                <span className={`job-status ${getStatusClass(job.status)}`}>
                  {formatStatus(job.status)}
                </span>

                <Link
                  to={`/worker/job-details/${job.bookingId}`}
                  className="recent-view-btn"
                >
                  →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          AI BANNER
      ===================================================== */}

      <section className="dashboard-ai-banner">
        <div className="ai-banner-glow"></div>

        <div className="ai-banner-icon">✦</div>

        <div className="ai-banner-content">
          <span>AUTOGLOW AI</span>

          <h2>Smarter vehicle servicing with AI</h2>

          <p>
            AI-powered inspection and service assistance will help workers
            identify vehicle issues faster and maintain service quality.
          </p>
        </div>

        <div className="ai-banner-status">
          <span className="ai-status-dot"></span>

          <span>AI System Ready</span>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="worker-dashboard-footer">
        <div>
          <strong>AutoGlow</strong>

          <span>AI Powered Car & Bike Care Management System</span>
        </div>

        <span>Worker Workspace • Secure Service Operations</span>
      </footer>

      {/* =====================================================
          REFRESH INDICATOR
      ===================================================== */}

      {refreshing && (
        <div
          style={{
            position: "fixed",
            right: "20px",
            bottom: "20px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "10px 14px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            fontSize: "12px",
            color: "#64748b",
            zIndex: 9999,
          }}
        >
          Updating jobs...
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
