import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./ServiceHistory.css";

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "Time unavailable";

  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatStatus = (status) => {
  if (!status) return "Pending";

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusClass = (status) => {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
      return "history-status completed";

    case "CANCELLED":
      return "history-status cancelled";

    case "PENDING":
      return "history-status pending";

    default:
      return "history-status active";
  }
};

const ServiceHistory = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadHistory();
  }, [navigate]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customer/bookings/history");

      setHistory(response.data || []);
    } catch (err) {
      console.error("Service history error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message || "Unable to load your service history.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">
          <div className="history-spinner"></div>

          <h3>Loading Service History...</h3>

          <p>Please wait while we fetch your previous services.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <div className="history-error">
          <div className="history-error-icon">!</div>

          <h2>Unable to Load History</h2>

          <p>{error}</p>

          <div className="history-error-actions">
            <button className="history-primary-btn" onClick={loadHistory}>
              Try Again
            </button>

            <Link to="/customer/dashboard" className="history-secondary-btn">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = history.filter(
    (item) => item.status === "COMPLETED" || item.status === "DELIVERED",
  ).length;

  const activeCount = history.filter(
    (item) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes(item.status),
  ).length;

  const totalSpent = history
    .filter(
      (item) => item.status === "COMPLETED" || item.status === "DELIVERED",
    )
    .reduce((total, item) => total + Number(item.totalAmount || 0), 0);

  return (
    <div className="history-page">
      {/* HEADER */}

      <div className="history-header">
        <div className="history-heading">
          <Link to="/customer/dashboard" className="history-back-link">
            ← Back to Dashboard
          </Link>

          <span className="history-eyebrow">AUTOGLOW SERVICE RECORDS</span>

          <h1>Service History</h1>

          <p>
            View your complete vehicle service history, bookings and service
            records.
          </p>
        </div>

        <Link to="/customer/book" className="history-book-btn">
          + Book New Service
        </Link>
      </div>

      {/* STATS */}

      <div className="history-stats">
        <div className="history-stat-card">
          <div className="history-stat-icon blue">📋</div>

          <div>
            <span>Total Services</span>
            <strong>{history.length}</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon green">✓</div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon orange">⏳</div>

          <div>
            <span>Active Services</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon purple">₹</div>

          <div>
            <span>Total Spent</span>
            <strong>{formatCurrency(totalSpent)}</strong>
          </div>
        </div>
      </div>

      {/* HISTORY */}

      <div className="history-main-card">
        <div className="history-card-header">
          <div>
            <span className="history-section-label">SERVICE RECORDS</span>

            <h2>Your Vehicle Service History</h2>
          </div>

          <span className="history-count">{history.length} Records</span>
        </div>

        {history.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">🚘</div>

            <h3>No Service History Yet</h3>

            <p>You haven't completed any vehicle service bookings yet.</p>

            <Link to="/customer/book" className="history-primary-btn">
              Book Your First Service
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => {
              const vehicle = item.vehicle || {};
              const service = item.service || {};
              const servicePackage =
                item.servicePackage || item.package || null;

              return (
                <div className="history-item" key={item.id}>
                  {/* DATE */}

                  <div className="history-date">
                    <div className="history-date-icon">📅</div>

                    <div>
                      <strong>{formatDate(item.bookingDate)}</strong>

                      <span>{formatTime(item.bookingTime)}</span>
                    </div>
                  </div>

                  {/* VEHICLE */}

                  <div className="history-vehicle">
                    <div className="vehicle-icon">🚘</div>

                    <div>
                      <span>VEHICLE</span>

                      <strong>
                        {vehicle.brand || "Vehicle"} {vehicle.model || ""}
                      </strong>

                      <small>
                        {vehicle.registrationNumber ||
                          "Registration unavailable"}
                      </small>
                    </div>
                  </div>

                  {/* SERVICE */}

                  <div className="history-service">
                    <span>SERVICE</span>

                    <strong>{service.name || "Vehicle Service"}</strong>

                    {servicePackage && (
                      <small>Package: {servicePackage.name}</small>
                    )}
                  </div>

                  {/* AMOUNT */}

                  <div className="history-amount">
                    <span>AMOUNT</span>

                    <strong>{formatCurrency(item.totalAmount)}</strong>
                  </div>

                  {/* STATUS */}

                  <div className="history-status-wrapper">
                    <span className={getStatusClass(item.status)}>
                      <i></i>
                      {formatStatus(item.status)}
                    </span>
                  </div>

                  {/* ACTION */}

                  <div className="history-action">
                    <Link to={`/customer/bookings/${item.id}`}>View</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTOM CTA */}

      <div className="history-bottom-banner">
        <div>
          <span>KEEP YOUR VEHICLE IN TOP CONDITION</span>

          <h2>Ready for your next service?</h2>

          <p>Book a professional AutoGlow service for your vehicle today.</p>
        </div>

        <Link to="/customer/book" className="history-banner-btn">
          Book Service →
        </Link>
      </div>
    </div>
  );
};

export default ServiceHistory;
