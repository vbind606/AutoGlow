import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./WorkerIssuesHome.css";

const WorkerIssuesHome = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [issues, setIssues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadIssuesData();
  }, []);

  const loadIssuesData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/worker/jobs");

      const jobData = Array.isArray(response.data)
        ? response.data
        : response.data?.content || response.data?.jobs || [];

      setJobs(jobData);

      const issueMap = {};

      await Promise.all(
        jobData.map(async (job) => {
          const bookingId =
            job.bookingId ??
            job.id ??
            job.booking?.id;

          if (!bookingId) return;

          try {
            const issueResponse = await api.get(
              `/worker/issues/${bookingId}`
            );

            issueMap[bookingId] = Array.isArray(issueResponse.data)
              ? issueResponse.data
              : issueResponse.data?.content || issueResponse.data?.issues || [];
          } catch (err) {
            issueMap[bookingId] = [];
          }
        })
      );

      setIssues(issueMap);
    } catch (err) {
      console.error("Failed to load worker issues:", err);
      setError("Unable to load your jobs and issues.");
    } finally {
      setLoading(false);
    }
  };

  const getBookingId = (job) => {
    return job.bookingId ?? job.id ?? job.booking?.id;
  };

  const getVehicleNumber = (job) => {
    return (
      job.vehicleNumber ||
      job.vehicle?.vehicleNumber ||
      job.vehicle?.registrationNumber ||
      "Vehicle"
    );
  };

  const getCustomerName = (job) => {
    return (
      job.customerName ||
      job.customer?.name ||
      job.userName ||
      "Customer"
    );
  };

  const getServiceName = (job) => {
    return (
      job.serviceName ||
      job.service?.name ||
      job.service?.serviceName ||
      "Service"
    );
  };

  const getIssueCount = (job) => {
    const bookingId = getBookingId(job);
    return issues[bookingId]?.length || 0;
  };

  const getSeverityClass = (severity) => {
    if (!severity) return "severity-normal";

    const value = severity.toLowerCase();

    if (value === "high" || value === "critical") {
      return "severity-high";
    }

    if (value === "medium") {
      return "severity-medium";
    }

    return "severity-low";
  };

  const totalIssues = Object.values(issues).reduce(
    (total, list) => total + list.length,
    0
  );

  if (loading) {
    return (
      <div className="issues-home-page">
        <div className="issues-home-loading">
          <div className="issues-spinner"></div>
          <h3>Loading Issues & Reports...</h3>
          <p>Please wait while we load your service records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="issues-home-page">

      {/* HEADER */}
      <div className="issues-home-header">
        <div>
          <span className="issues-eyebrow">WORKER CENTER</span>
          <h1>Issues & Reports</h1>
          <p>
            Review reported vehicle issues from your assigned service jobs.
          </p>
        </div>

        <button
          className="issues-refresh-btn"
          onClick={loadIssuesData}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="issues-summary-grid">

        <div className="issues-summary-card">
          <div className="summary-icon">▣</div>
          <div>
            <span>Total Jobs</span>
            <strong>{jobs.length}</strong>
          </div>
        </div>

        <div className="issues-summary-card">
          <div className="summary-icon warning">⚠</div>
          <div>
            <span>Total Issues</span>
            <strong>{totalIssues}</strong>
          </div>
        </div>

        <div className="issues-summary-card">
          <div className="summary-icon success">✓</div>
          <div>
            <span>Issue-Free Jobs</span>
            <strong>
              {
                jobs.filter((job) => getIssueCount(job) === 0).length
              }
            </strong>
          </div>
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="issues-error">
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* JOBS */}
      <section className="issues-jobs-section">

        <div className="issues-section-header">
          <div>
            <h2>Service Jobs</h2>
            <p>Select a booking to view its reported issues.</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="issues-empty">
            <div className="empty-icon">✓</div>
            <h3>No Service Jobs Found</h3>
            <p>
              You currently don't have any assigned service jobs.
            </p>
          </div>
        ) : (
          <div className="issues-job-grid">

            {jobs.map((job, index) => {
              const bookingId = getBookingId(job);
              const issueCount = getIssueCount(job);

              return (
                <div
                  className="issues-job-card"
                  key={bookingId || index}
                >

                  <div className="job-card-top">

                    <div className="vehicle-icon">
                      🚗
                    </div>

                    <div className="job-card-title">
                      <h3>{getVehicleNumber(job)}</h3>
                      <span>{getCustomerName(job)}</span>
                    </div>

                    <div
                      className={`issue-count ${
                        issueCount > 0 ? "has-issues" : "no-issues"
                      }`}
                    >
                      {issueCount > 0
                        ? `${issueCount} Issue${issueCount > 1 ? "s" : ""}`
                        : "No Issues"}
                    </div>

                  </div>

                  <div className="job-card-info">

                    <div>
                      <span>Booking</span>
                      <strong>#{bookingId || "N/A"}</strong>
                    </div>

                    <div>
                      <span>Service</span>
                      <strong>{getServiceName(job)}</strong>
                    </div>

                  </div>

                  {/* ISSUE PREVIEW */}
                  {issueCount > 0 && (
                    <div className="issue-preview">

                      {issues[bookingId]
                        .slice(0, 2)
                        .map((issue) => (
                          <div
                            className="issue-preview-row"
                            key={issue.id}
                          >
                            <div>
                              <strong>
                                {issue.category || "Vehicle Issue"}
                              </strong>

                              <span>
                                {issue.vehicleArea || "Vehicle Area"}
                              </span>
                            </div>

                            <span
                              className={`severity-badge ${getSeverityClass(
                                issue.severity
                              )}`}
                            >
                              {issue.severity || "Normal"}
                            </span>
                          </div>
                        ))}

                      {issueCount > 2 && (
                        <p className="more-issues">
                          +{issueCount - 2} more issue
                          {issueCount - 2 > 1 ? "s" : ""}
                        </p>
                      )}

                    </div>
                  )}

                  <button
                    className="view-issues-btn"
                    onClick={() =>
                      navigate(`/worker/issues/${bookingId}`)
                    }
                    disabled={!bookingId}
                  >
                    {issueCount > 0
                      ? "View Issues & Reports →"
                      : "Open Issue Report →"}
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </section>
    </div>
  );
};

export default WorkerIssuesHome;
