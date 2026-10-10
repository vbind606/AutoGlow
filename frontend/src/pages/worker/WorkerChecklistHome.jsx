import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./WorkerChecklistHome.css";

const WorkerChecklistHome = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [checklists, setChecklists] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChecklistData();
  }, []);

  const loadChecklistData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/worker/jobs");

      const jobData = Array.isArray(response.data)
        ? response.data
        : response.data?.content || response.data?.jobs || [];

      setJobs(jobData);

      const checklistMap = {};

      await Promise.all(
        jobData.map(async (job) => {
          const bookingId =
            job.bookingId ??
            job.id ??
            job.booking?.id;

          if (!bookingId) return;

          try {
            const checklistResponse = await api.get(
              `/worker/checklists/${bookingId}/latest`
            );

            checklistMap[bookingId] = checklistResponse.data || null;
          } catch (err) {
            checklistMap[bookingId] = null;
          }
        })
      );

      setChecklists(checklistMap);
    } catch (err) {
      console.error("Failed to load checklist data:", err);
      setError("Unable to load your service jobs.");
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

  const getChecklistStatus = (bookingId) => {
    const checklist = checklists[bookingId];

    if (!checklist) {
      return {
        text: "Not Started",
        className: "checklist-not-started",
      };
    }

    if (checklist.status === "COMPLETED") {
      return {
        text: "Completed",
        className: "checklist-completed",
      };
    }

    return {
      text: "In Progress",
      className: "checklist-progress",
    };
  };

  const completedCount = jobs.filter((job) => {
    const bookingId = getBookingId(job);
    return checklists[bookingId]?.status === "COMPLETED";
  }).length;

  if (loading) {
    return (
      <div className="checklist-home-page">
        <div className="checklist-home-loading">
          <div className="checklist-spinner"></div>
          <h3>Loading Service Checklists...</h3>
          <p>Please wait while we load your assigned jobs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checklist-home-page">

      {/* HEADER */}
      <div className="checklist-home-header">
        <div>
          <span className="checklist-eyebrow">
            WORKER CENTER
          </span>

          <h1>Service Checklist</h1>

          <p>
            Select a service booking to manage and complete its checklist.
          </p>
        </div>

        <button
          className="checklist-refresh-btn"
          onClick={loadChecklistData}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="checklist-summary-grid">

        <div className="checklist-summary-card">
          <div className="checklist-summary-icon">
            ▣
          </div>

          <div>
            <span>Total Jobs</span>
            <strong>{jobs.length}</strong>
          </div>
        </div>

        <div className="checklist-summary-card">
          <div className="checklist-summary-icon progress">
            ◷
          </div>

          <div>
            <span>In Progress</span>
            <strong>
              {jobs.length - completedCount}
            </strong>
          </div>
        </div>

        <div className="checklist-summary-card">
          <div className="checklist-summary-icon completed">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="checklist-error">
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* JOB SECTION */}
      <section className="checklist-jobs-section">

        <div className="checklist-section-header">
          <div>
            <h2>Assigned Service Jobs</h2>
            <p>
              Choose a booking to open its service checklist.
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="checklist-empty">
            <div className="checklist-empty-icon">
              ✓
            </div>

            <h3>No Service Jobs Found</h3>

            <p>
              You currently don't have any assigned service jobs.
            </p>
          </div>
        ) : (
          <div className="checklist-job-grid">

            {jobs.map((job, index) => {

              const bookingId = getBookingId(job);
              const status = getChecklistStatus(bookingId);

              return (
                <div
                  className="checklist-job-card"
                  key={bookingId || index}
                >

                  <div className="checklist-job-top">

                    <div className="checklist-vehicle-icon">
                      🚗
                    </div>

                    <div className="checklist-job-title">
                      <h3>{getVehicleNumber(job)}</h3>
                      <span>{getCustomerName(job)}</span>
                    </div>

                    <span
                      className={`checklist-status ${status.className}`}
                    >
                      {status.text}
                    </span>

                  </div>

                  <div className="checklist-job-info">

                    <div>
                      <span>Booking</span>
                      <strong>
                        #{bookingId || "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>Service</span>
                      <strong>
                        {getServiceName(job)}
                      </strong>
                    </div>

                  </div>

                  <button
                    className="open-checklist-btn"
                    onClick={() =>
                      navigate(`/worker/checklist/${bookingId}`)
                    }
                    disabled={!bookingId}
                  >
                    {status.text === "Completed"
                      ? "View Checklist →"
                      : "Open Checklist →"}
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

export default WorkerChecklistHome;
