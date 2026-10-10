import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./BookingDetails.css";

const statusSteps = [
  {
    key: "PENDING",
    label: "Booking Placed",
    icon: "📋",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    icon: "✓",
  },
  {
    key: "ASSIGNED",
    label: "Worker Assigned",
    icon: "👨‍🔧",
  },
  {
    key: "RECEIVED",
    label: "Vehicle Received",
    icon: "🚘",
  },
  {
    key: "INSPECTION",
    label: "AI Inspection",
    icon: "🤖",
  },
  {
    key: "WASHING",
    label: "Washing",
    icon: "🧽",
  },
  {
    key: "DRYING",
    label: "Drying",
    icon: "💨",
  },
  {
    key: "QUALITY_CHECK",
    label: "Quality Check",
    icon: "🔍",
  },
  {
    key: "COMPLETED",
    label: "Service Completed",
    icon: "✨",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: "🏁",
  },
];

const getStatusIndex = (status) => {
  return statusSteps.findIndex((step) => step.key === status);
};

const formatStatus = (status) => {
  if (!status) {
    return "Pending";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

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
  if (!time) {
    return "Not available";
  }

  const [hours, minutes] = time.split(":");

  if (hours === undefined || minutes === undefined) {
    return time;
  }

  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const getStatusClass = (status) => {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
      return "success";

    case "CANCELLED":
      return "cancelled";

    case "WASHING":
    case "DRYING":
    case "INSPECTION":
    case "QUALITY_CHECK":
      return "progress";

    default:
      return "pending";
  }
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);

  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // =========================================================
  // LOAD BOOKING + PAYMENT
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadBooking();
    loadPayment();
  }, [id, navigate]);

  // =========================================================
  // LOAD BOOKING
  // =========================================================

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/customer/bookings/${id}`);

      setBooking(response.data);
    } catch (err) {
      console.error("Booking details error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Your session is no longer valid. Please login again.");
        return;
      }

      if (err.response?.status === 404) {
        setError("Booking not found.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load booking details. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PAYMENT
  // =========================================================

  const loadPayment = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError("");

      const response = await api.get(`/customer/payments/booking/${id}`);

      setPayment(response.data);
    } catch (err) {
      console.log("Payment status:", err.response?.status);

      // Payment does not exist yet.
      // This is NOT a page error.
      if (err.response?.status === 404) {
        setPayment(null);
        return;
      }

      // Don't redirect to login from payment check.
      // Booking page should remain visible.
      if (err.response?.status === 401 || err.response?.status === 403) {
        setPaymentError("Payment status could not be verified.");
        return;
      }

      setPaymentError("Payment status is currently unavailable.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="booking-details-page">
        <div className="booking-loading">
          <div className="loading-spinner"></div>

          <h3>Loading booking details...</h3>

          <p>Please wait while we fetch your service information.</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !booking) {
    return (
      <div className="booking-details-page">
        <div className="booking-error-card">
          <div className="error-icon">!</div>

          <h2>Booking Not Available</h2>

          <p>{error || "We couldn't find this booking."}</p>

          <button
            className="primary-button"
            onClick={() => navigate("/customer/bookings")}
          >
            ← Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // BOOKING DATA
  // =========================================================

  const currentStatus = booking.status || "PENDING";

  const currentStatusIndex = getStatusIndex(currentStatus);

  const statusClass = getStatusClass(currentStatus);

  const vehicle = booking.vehicle || {};

  const service = booking.service || {};

  const servicePackage = booking.servicePackage || booking.package || null;

  const isCancelled = currentStatus === "CANCELLED";

  const isPaid =
    payment && String(payment.status || "").toUpperCase() === "SUCCESS";

  const bookingAmount = Number(booking.totalAmount || 0);

  return (
    <div className="booking-details-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="booking-details-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate("/customer/bookings")}
          >
            <span>←</span>
          </button>

          <div>
            <span className="header-eyebrow">BOOKING DETAILS</span>

            <h1>Booking #{String(booking.id).padStart(5, "0")}</h1>
          </div>
        </div>

        <div className="header-actions">
          <Link to="/customer/bookings" className="header-link">
            My Bookings
          </Link>

          <Link to="/customer/dashboard" className="dashboard-button">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="booking-details-container">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="booking-hero-card">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="live-dot"></span>
              AutoGlow Service
            </div>

            <h2>
              {isCancelled
                ? "Your booking has been cancelled."
                : "Your vehicle is in our care."}
            </h2>

            <p>
              Track your service progress and view all booking information from
              one premium dashboard.
            </p>

            <div className="hero-meta">
              <div>
                <span>Booking ID</span>

                <strong>#{String(booking.id).padStart(5, "0")}</strong>
              </div>

              <div>
                <span>Booked For</span>

                <strong>{formatDate(booking.bookingDate)}</strong>
              </div>

              <div>
                <span>Service Time</span>

                <strong>{formatTime(booking.bookingTime)}</strong>
              </div>
            </div>
          </div>

          <div className="hero-status">
            <div className={`status-pill ${statusClass}`}>
              <span className="status-dot"></span>

              {formatStatus(currentStatus)}
            </div>

            <div className="vehicle-visual">
              <div className="vehicle-glow"></div>

              <span>🚘</span>
            </div>
          </div>
        </section>

        {/* =================================================
            PAYMENT ACTION
        ================================================= */}

        {!isCancelled && (
          <section className="payment-action-card">
            <div className="payment-action-left">
              <div className="payment-action-icon">{isPaid ? "✓" : "₹"}</div>

              <div className="payment-action-content">
                <span className="payment-action-label">
                  {isPaid ? "PAYMENT COMPLETED" : "PAYMENT REQUIRED"}
                </span>

                <h2>
                  {isPaid
                    ? "Your booking has been paid successfully."
                    : "Complete your payment to confirm your service."}
                </h2>

                <p>
                  {isPaid
                    ? `Transaction ID: ${
                        payment?.transactionId || "AutoGlow Payment"
                      }`
                    : "Secure your booking by completing the payment for your selected service."}
                </p>
              </div>
            </div>

            <div className="payment-action-right">
              <div className="payment-action-amount">
                <span>AMOUNT</span>

                <strong>{formatCurrency(bookingAmount)}</strong>
              </div>

              {paymentLoading ? (
                <div className="payment-checking">Checking payment...</div>
              ) : isPaid ? (
                <div className="paid-badge">
                  <span>✓</span>
                  Paid
                </div>
              ) : (
                <Link
                  to={`/customer/payments/${booking.id}`}
                  className="make-payment-button"
                >
                  <span>Make Payment</span>
                  <span className="payment-arrow">→</span>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* PAYMENT ERROR */}

        {paymentError && !isPaid && (
          <div className="payment-status-warning">
            <span>!</span>
            {paymentError}
          </div>
        )}

        {/* =================================================
            SERVICE JOURNEY
        ================================================= */}

        <section className="details-section">
          <div className="section-heading">
            <div>
              <span className="section-label">LIVE PROGRESS</span>

              <h2>Service Journey</h2>
            </div>

            <span className={`current-status ${statusClass}`}>
              {formatStatus(currentStatus)}
            </span>
          </div>

          <div className="timeline-card">
            {currentStatus === "CANCELLED" ? (
              <div className="cancelled-message">
                <div className="timeline-icon cancelled-icon">×</div>

                <div>
                  <h3>Booking Cancelled</h3>

                  <p>
                    This booking has been cancelled. If you need assistance,
                    please contact AutoGlow support.
                  </p>
                </div>
              </div>
            ) : (
              <div className="timeline">
                {statusSteps.map((step, index) => {
                  const completed =
                    currentStatusIndex >= 0 && index < currentStatusIndex;

                  const active = index === currentStatusIndex;

                  return (
                    <div
                      className={`timeline-step ${
                        completed ? "completed" : ""
                      } ${active ? "active" : ""}`}
                      key={step.key}
                    >
                      <div className="timeline-marker">
                        {completed ? "✓" : step.icon}
                      </div>

                      <div className="timeline-info">
                        <span className="timeline-number">
                          Step {String(index + 1).padStart(2, "0")}
                        </span>

                        <h4>{step.label}</h4>

                        {active && (
                          <p>Your booking is currently at this stage.</p>
                        )}
                      </div>

                      {index !== statusSteps.length - 1 && (
                        <div
                          className={`timeline-line ${
                            completed ? "filled" : ""
                          }`}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            VEHICLE + SERVICE
        ================================================= */}

        <div className="booking-main-grid">
          {/* VEHICLE */}

          <section className="info-card">
            <div className="card-heading">
              <div className="card-icon blue">🚘</div>

              <div>
                <span>VEHICLE</span>

                <h3>Vehicle Information</h3>
              </div>
            </div>

            <div className="vehicle-card-content">
              <div className="large-vehicle-icon">🚗</div>

              <div className="vehicle-main">
                <h3>
                  {vehicle.brand || "Vehicle"} {vehicle.model || ""}
                </h3>

                <p>{vehicle.vehicleType || "Vehicle"}</p>
              </div>

              <div className="vehicle-number">
                <span>Registration</span>

                <strong>{vehicle.registrationNumber || "Not available"}</strong>
              </div>
            </div>

            <div className="vehicle-specs">
              <div>
                <span>Year</span>

                <strong>{vehicle.year || "—"}</strong>
              </div>

              <div>
                <span>Color</span>

                <strong>{vehicle.color || "—"}</strong>
              </div>

              <div>
                <span>Type</span>

                <strong>{vehicle.vehicleType || "—"}</strong>
              </div>
            </div>
          </section>

          {/* SERVICE */}

          <section className="info-card">
            <div className="card-heading">
              <div className="card-icon purple">✨</div>

              <div>
                <span>SERVICE</span>

                <h3>Service Details</h3>
              </div>
            </div>

            <div className="service-detail">
              <div className="service-title-row">
                <div>
                  <h3>{service.name || "AutoGlow Service"}</h3>

                  <p>
                    {service.description ||
                      "Professional vehicle care service by AutoGlow."}
                  </p>
                </div>

                <strong className="service-price">
                  {formatCurrency(service.price)}
                </strong>
              </div>

              <div className="service-info-grid">
                <div>
                  <span>Duration</span>

                  <strong>
                    {service.durationMinutes
                      ? `${service.durationMinutes} min`
                      : "Standard"}
                  </strong>
                </div>

                <div>
                  <span>Vehicle Type</span>

                  <strong>{service.vehicleType || "All Vehicles"}</strong>
                </div>
              </div>
            </div>

            {servicePackage && (
              <div className="package-box">
                <div className="package-icon">★</div>

                <div className="package-content">
                  <span>SELECTED PACKAGE</span>

                  <h4>{servicePackage.name}</h4>

                  {servicePackage.description && (
                    <p>{servicePackage.description}</p>
                  )}
                </div>

                <strong>{formatCurrency(servicePackage.price)}</strong>
              </div>
            )}
          </section>
        </div>

        {/* =================================================
            PICKUP & DROP
        ================================================= */}

        <section className="details-section">
          <div className="section-heading">
            <div>
              <span className="section-label">LOGISTICS</span>

              <h2>Pickup & Drop</h2>
            </div>
          </div>

          <div className="logistics-grid">
            {/* PICKUP */}

            <div
              className={`logistics-card ${
                booking.pickupRequired ? "enabled" : ""
              }`}
            >
              <div className="logistics-icon">📍</div>

              <div className="logistics-content">
                <div className="logistics-title">
                  <h3>Pickup Service</h3>

                  <span
                    className={
                      booking.pickupRequired
                        ? "enabled-badge"
                        : "disabled-badge"
                    }
                  >
                    {booking.pickupRequired ? "Included" : "Not Required"}
                  </span>
                </div>

                <p>
                  {booking.pickupRequired
                    ? booking.pickupAddress || "Address not provided"
                    : "You will bring the vehicle to our service center."}
                </p>
              </div>
            </div>

            {/* DROP */}

            <div
              className={`logistics-card ${
                booking.dropRequired ? "enabled" : ""
              }`}
            >
              <div className="logistics-icon">🏁</div>

              <div className="logistics-content">
                <div className="logistics-title">
                  <h3>Drop Service</h3>

                  <span
                    className={
                      booking.dropRequired ? "enabled-badge" : "disabled-badge"
                    }
                  >
                    {booking.dropRequired ? "Included" : "Not Required"}
                  </span>
                </div>

                <p>
                  {booking.dropRequired
                    ? booking.dropAddress || "Address not provided"
                    : "You will collect the vehicle from our service center."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            PAYMENT SUMMARY
        ================================================= */}

        <section className="payment-summary-card">
          <div className="payment-left">
            <span className="section-label">PAYMENT SUMMARY</span>

            <h2>Booking Charges</h2>

            <p>Transparent pricing with no hidden charges.</p>
          </div>

          <div className="payment-breakdown">
            <div className="payment-row">
              <span>Selected Service</span>

              <strong>{formatCurrency(service.price)}</strong>
            </div>

            {servicePackage && (
              <div className="payment-row">
                <span>Package</span>

                <strong>{formatCurrency(servicePackage.price)}</strong>
              </div>
            )}

            <div className="payment-divider"></div>

            <div className="payment-total">
              <span>Booking Total</span>

              <strong>{formatCurrency(booking.totalAmount)}</strong>
            </div>

            <div className="payment-status">
              <span className={`payment-check ${isPaid ? "paid" : ""}`}>
                {isPaid ? "✓" : "₹"}
              </span>

              {isPaid ? "Payment successfully completed" : "Payment pending"}
            </div>
          </div>
        </section>

        {/* =================================================
            NOTES
        ================================================= */}

        {booking.notes && (
          <section className="notes-card">
            <div className="notes-icon">📝</div>

            <div>
              <span>ADDITIONAL NOTES</span>

              <h3>Customer Instructions</h3>

              <p>{booking.notes}</p>
            </div>
          </section>
        )}

        {/* =================================================
            BOTTOM ACTIONS
        ================================================= */}

        <section className="booking-actions">
          <div>
            <span className="section-label">NEED HELP?</span>

            <h3>We're here to help with your vehicle.</h3>
          </div>

          <div className="action-buttons">
            <Link to="/customer/bookings" className="secondary-action">
              ← All Bookings
            </Link>

            {!isCancelled && (
              <Link
                to={`/customer/bookings/${booking.id}/tracking`}
                className="primary-action"
              >
                Track Service →
              </Link>
            )}

            {/* INVOICE */}
            {!isCancelled && (
              <Link
                to={`/customer/invoices/${booking.id}`}
                className="invoice-action"
              >
                🧾 View Invoice
              </Link>
            )}
            {!isCancelled && !isPaid && (
              <Link
                to={`/customer/payments/${booking.id}`}
                className="payment-primary-action"
              >
                ₹ Make Payment
              </Link>
            )}

            <Link to="/customer/book" className="primary-action">
              Book Another Service →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BookingDetails;
