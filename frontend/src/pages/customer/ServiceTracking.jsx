import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./ServiceTracking.css";

const statusSteps = [
  {
    key: "PENDING",
    label: "Booking Placed",
    icon: "📋",
    description: "Your service booking has been placed.",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    icon: "✓",
    description: "Your booking has been confirmed.",
  },
  {
    key: "ASSIGNED",
    label: "Worker Assigned",
    icon: "👨‍🔧",
    description: "A service professional has been assigned.",
  },
  {
    key: "RECEIVED",
    label: "Vehicle Received",
    icon: "🚘",
    description: "Your vehicle has reached the service center.",
  },
  {
    key: "INSPECTION",
    label: "AI Inspection",
    icon: "🤖",
    description: "AI-powered vehicle inspection is in progress.",
  },
  {
    key: "WASHING",
    label: "Washing",
    icon: "🧽",
    description: "Your vehicle is currently being washed.",
  },
  {
    key: "DRYING",
    label: "Drying",
    icon: "💨",
    description: "Your vehicle is being dried and finished.",
  },
  {
    key: "QUALITY_CHECK",
    label: "Quality Check",
    icon: "🔍",
    description: "Final quality inspection is in progress.",
  },
  {
    key: "COMPLETED",
    label: "Service Completed",
    icon: "✨",
    description: "Your vehicle service has been completed.",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: "🏁",
    description: "Your vehicle has been delivered.",
  },
];

const getStatusIndex = (status) => {
  return statusSteps.findIndex((step) => step.key === status);
};

const formatStatus = (status) => {
  if (!status) return "Pending";

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "Not available";

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
  if (!time) return "Not available";

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

const ServiceTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadTracking();
  }, [id, navigate]);

  const loadTracking = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/customer/bookings/${id}/tracking`);

      setBooking(response.data);
    } catch (err) {
      console.error("Tracking error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      if (err.response?.status === 404) {
        setError("Booking not found.");
      } else {
        setError(
          err.response?.data?.message || "Unable to load service tracking.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="tracking-loading">
          <div className="tracking-spinner"></div>
          <h3>Loading Service Tracking...</h3>
          <p>Please wait while we fetch your booking status.</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="tracking-page">
        <div className="tracking-error">
          <div className="error-icon">!</div>

          <h2>Unable to Load Tracking</h2>

          <p>{error || "Booking information unavailable."}</p>

          <div className="error-actions">
            <button onClick={loadTracking} className="primary-btn">
              Try Again
            </button>

            <Link to="/customer/bookings" className="secondary-btn">
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = booking.status || "PENDING";

  const currentIndex = getStatusIndex(currentStatus);

  const vehicle = booking.vehicle || {};
  const service = booking.service || {};
  const servicePackage = booking.servicePackage || booking.package || null;

  const currentStep =
    statusSteps.find((step) => step.key === currentStatus) || statusSteps[0];

  return (
    <div className="tracking-page">
      {/* Header */}

      <div className="tracking-header">
        <div>
          <Link to={`/customer/bookings/${booking.id}`} className="back-link">
            ← Back to Booking Details
          </Link>

          <h1>Service Tracking</h1>

          <p>Track your vehicle service in real time.</p>
        </div>

        <div className="booking-number">
          <span>Booking ID</span>
          <strong>#{booking.id}</strong>
        </div>
      </div>

      {/* Current Status */}

      <div className="current-status-card">
        <div className="current-status-icon">{currentStep.icon}</div>

        <div className="current-status-content">
          <span className="current-label">CURRENT STATUS</span>

          <h2>{currentStep.label}</h2>

          <p>{currentStep.description}</p>
        </div>

        <div className="status-badge">{formatStatus(currentStatus)}</div>
      </div>

      {/* Progress */}

      <div className="tracking-card">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">SERVICE PROGRESS</span>

            <h2>Your Vehicle Journey</h2>
          </div>

          <span className="progress-count">
            {currentIndex >= 0
              ? `${currentIndex + 1}/${statusSteps.length}`
              : "1/10"}
          </span>
        </div>

        <div className="timeline">
          {statusSteps.map((step, index) => {
            const isCompleted = currentIndex >= index;

            const isCurrent = currentIndex === index;

            return (
              <div
                key={step.key}
                className={`timeline-item ${
                  isCompleted ? "completed" : ""
                } ${isCurrent ? "current" : ""}`}
              >
                <div className="timeline-marker">
                  {isCompleted ? "✓" : step.icon}
                </div>

                <div className="timeline-content">
                  <div className="timeline-title-row">
                    <h3>{step.label}</h3>

                    {isCurrent && <span className="now-badge">NOW</span>}
                  </div>

                  <p>{step.description}</p>
                </div>

                {index < statusSteps.length - 1 && (
                  <div
                    className={`timeline-line ${
                      currentIndex > index ? "active" : ""
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Information */}

      <div className="tracking-grid">
        {/* Vehicle */}

        <div className="info-card">
          <div className="info-card-header">
            <span className="info-icon">🚘</span>

            <div>
              <span>VEHICLE</span>
              <h3>Your Vehicle</h3>
            </div>
          </div>

          <div className="vehicle-info">
            <strong>
              {vehicle.brand || "Vehicle"} {vehicle.model || ""}
            </strong>

            <div className="vehicle-meta">
              <span>
                {vehicle.registrationNumber || "Registration unavailable"}
              </span>

              {vehicle.color && <span>{vehicle.color}</span>}
            </div>
          </div>
        </div>

        {/* Service */}

        <div className="info-card">
          <div className="info-card-header">
            <span className="info-icon">🧽</span>

            <div>
              <span>SERVICE</span>
              <h3>{service.name || "Selected Service"}</h3>
            </div>
          </div>

          <p className="info-description">
            {service.description || "Professional vehicle care service."}
          </p>

          <div className="info-price">{formatCurrency(service.price)}</div>
        </div>

        {/* Package */}

        {servicePackage && (
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-icon">⭐</span>

              <div>
                <span>PACKAGE</span>
                <h3>{servicePackage.name}</h3>
              </div>
            </div>

            <p className="info-description">
              {servicePackage.description || "Premium service package."}
            </p>

            <div className="info-price">
              {formatCurrency(servicePackage.price)}
            </div>
          </div>
        )}

        {/* Schedule */}

        <div className="info-card">
          <div className="info-card-header">
            <span className="info-icon">📅</span>

            <div>
              <span>SCHEDULE</span>
              <h3>Service Appointment</h3>
            </div>
          </div>

          <div className="schedule-details">
            <div>
              <span>Date</span>
              <strong>{formatDate(booking.bookingDate)}</strong>
            </div>

            <div>
              <span>Time</span>
              <strong>{formatTime(booking.bookingTime)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Pickup / Drop */}

      {(booking.pickupRequired || booking.dropRequired) && (
        <div className="tracking-card">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">VEHICLE LOGISTICS</span>

              <h2>Pickup & Drop</h2>
            </div>
          </div>

          <div className="logistics-grid">
            {booking.pickupRequired && (
              <div className="logistics-item">
                <span>📍</span>

                <div>
                  <small>Pickup Address</small>

                  <strong>
                    {booking.pickupAddress || "Address not provided"}
                  </strong>
                </div>
              </div>
            )}

            {booking.dropRequired && (
              <div className="logistics-item">
                <span>🏠</span>

                <div>
                  <small>Drop Address</small>

                  <strong>
                    {booking.dropAddress || "Address not provided"}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment */}

      <div className="payment-card">
        <div>
          <span>Total Service Amount</span>

          <strong>{formatCurrency(booking.totalAmount)}</strong>
        </div>

        <div className="payment-status">
          <span>Payment Status</span>
          <strong>Pending</strong>
        </div>
      </div>

      {/* Actions */}

      <div className="tracking-actions">
        <Link to={`/customer/bookings/${booking.id}`} className="secondary-btn">
          View Booking Details
        </Link>

        <Link to="/customer/bookings" className="primary-btn">
          All My Bookings
        </Link>
      </div>
    </div>
  );
};

export default ServiceTracking;
