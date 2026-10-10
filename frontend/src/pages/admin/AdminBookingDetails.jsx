import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./AdminBookingDetails.css";

function AdminBookingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    fetchBooking();
  }, [id, navigate]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/admin/bookings/${id}`);

      setBooking(response.data);
    } catch (err) {
      console.error("Error loading booking:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load booking details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date + "T00:00:00");

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "details-status-pending";

      case "CONFIRMED":
        return "details-status-confirmed";

      case "ASSIGNED":
        return "details-status-assigned";

      case "RECEIVED":
        return "details-status-received";

      case "INSPECTION":
        return "details-status-inspection";

      case "WASHING":
        return "details-status-washing";

      case "DRYING":
        return "details-status-drying";

      case "QUALITY_CHECK":
        return "details-status-quality";

      case "COMPLETED":
        return "details-status-completed";

      case "DELIVERED":
        return "details-status-delivered";

      case "CANCELLED":
        return "details-status-cancelled";

      default:
        return "details-status-default";
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-booking-details-page">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <div className="admin-logo-icon">A</div>

            <div>
              <h2>AutoGlow</h2>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          <nav className="admin-nav">
            <button onClick={() => navigate("/admin/dashboard")}>
              <span>▣</span>
              Dashboard
            </button>

            <button onClick={() => navigate("/admin/customers")}>
              <span>♙</span>
              Customers
            </button>

            <button onClick={() => navigate("/admin/vehicles")}>
              <span>▰</span>
              Vehicles
            </button>

            <button
              className="active"
              onClick={() => navigate("/admin/bookings")}
            >
              <span>▤</span>
              Bookings
            </button>

            <button onClick={() => navigate("/admin/services")}>
              <span>⚙</span>
              Services
            </button>

            <button onClick={() => navigate("/admin/packages")}>
              <span>◈</span>
              Packages
            </button>

            <button onClick={() => navigate("/admin/workers")}>
              <span>♟</span>
              Workers
            </button>

            <button onClick={() => navigate("/admin/payments")}>
              <span>₹</span>
              Payments
            </button>

            <button onClick={() => navigate("/admin/invoices")}>
              <span>▧</span>
              Invoices
            </button>

            <button onClick={() => navigate("/admin/coupons")}>
              <span>％</span>
              Coupons
            </button>

            <button onClick={() => navigate("/admin/reviews")}>
              <span>★</span>
              Reviews
            </button>

            <button onClick={() => navigate("/admin/gallery")}>
              <span>▧</span>
              Gallery
            </button>

            <button onClick={() => navigate("/admin/reports")}>
              <span>◫</span>
              Reports
            </button>

            <button onClick={() => navigate("/admin/ai-inspection")}>
              <span>✦</span>
              AI Inspection
            </button>

            <button onClick={() => navigate("/admin/settings")}>
              <span>⚙</span>
              Settings
            </button>
          </nav>

          <button className="admin-logout" onClick={logout}>
            <span>↪</span>
            Logout
          </button>
        </aside>

        <main className="admin-booking-details-main">
          <div className="details-loading">
            <div className="details-spinner"></div>
            <p>Loading booking details...</p>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="admin-booking-details-page">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <div className="admin-logo-icon">A</div>

            <div>
              <h2>AutoGlow</h2>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          <nav className="admin-nav">
            <button onClick={() => navigate("/admin/dashboard")}>
              <span>▣</span>
              Dashboard
            </button>

            <button onClick={() => navigate("/admin/customers")}>
              <span>♙</span>
              Customers
            </button>

            <button onClick={() => navigate("/admin/vehicles")}>
              <span>▰</span>
              Vehicles
            </button>

            <button
              className="active"
              onClick={() => navigate("/admin/bookings")}
            >
              <span>▤</span>
              Bookings
            </button>
          </nav>

          <button className="admin-logout" onClick={logout}>
            <span>↪</span>
            Logout
          </button>
        </aside>

        <main className="admin-booking-details-main">
          <div className="details-error">
            <div className="details-error-icon">!</div>

            <h2>Unable to Load Booking</h2>

            <p>{error}</p>

            <div className="details-error-actions">
              <button onClick={fetchBooking}>Try Again</button>

              <button
                className="secondary-error-btn"
                onClick={() => navigate("/admin/bookings")}
              >
                Back to Bookings
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="admin-booking-details-page">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">A</div>

          <div>
            <h2>AutoGlow</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button onClick={() => navigate("/admin/dashboard")}>
            <span>▣</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/admin/customers")}>
            <span>♙</span>
            Customers
          </button>

          <button onClick={() => navigate("/admin/vehicles")}>
            <span>▰</span>
            Vehicles
          </button>

          <button
            className="active"
            onClick={() => navigate("/admin/bookings")}
          >
            <span>▤</span>
            Bookings
          </button>

          <button onClick={() => navigate("/admin/services")}>
            <span>⚙</span>
            Services
          </button>

          <button onClick={() => navigate("/admin/packages")}>
            <span>◈</span>
            Packages
          </button>

          <button onClick={() => navigate("/admin/workers")}>
            <span>♟</span>
            Workers
          </button>

          <button onClick={() => navigate("/admin/payments")}>
            <span>₹</span>
            Payments
          </button>

          <button onClick={() => navigate("/admin/invoices")}>
            <span>▧</span>
            Invoices
          </button>

          <button onClick={() => navigate("/admin/coupons")}>
            <span>％</span>
            Coupons
          </button>

          <button onClick={() => navigate("/admin/reviews")}>
            <span>★</span>
            Reviews
          </button>

          <button onClick={() => navigate("/admin/gallery")}>
            <span>▧</span>
            Gallery
          </button>

          <button onClick={() => navigate("/admin/reports")}>
            <span>◫</span>
            Reports
          </button>

          <button onClick={() => navigate("/admin/ai-inspection")}>
            <span>✦</span>
            AI Inspection
          </button>

          <button onClick={() => navigate("/admin/settings")}>
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <button className="admin-logout" onClick={logout}>
          <span>↪</span>
          Logout
        </button>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="admin-booking-details-main">
        {/* HEADER */}

        <header className="booking-details-header">
          <div>
            <p className="details-breadcrumb">
              Admin / Bookings / Booking #{booking.id}
            </p>

            <h1>Booking Details</h1>

            <p>Complete information about this customer service booking</p>
          </div>

          <button
            className="back-bookings-btn"
            onClick={() => navigate("/admin/bookings")}
          >
            ← Back to Bookings
          </button>
        </header>

        {/* =====================================================
            BOOKING HERO
        ===================================================== */}

        <section className="booking-hero-card">
          <div className="booking-hero-left">
            <div className="booking-big-icon">▤</div>

            <div>
              <span className="hero-label">BOOKING REFERENCE</span>

              <h2>#{booking.id}</h2>

              <p>
                Created service booking for{" "}
                <strong>{booking.customerName || "Customer"}</strong>
              </p>
            </div>
          </div>

          <div className="booking-hero-right">
            <span
              className={`details-status ${getStatusClass(booking.status)}`}
            >
              {formatStatus(booking.status)}
            </span>

            <strong className="hero-amount">
              ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </section>

        {/* =====================================================
            MAIN DETAILS GRID
        ===================================================== */}

        <section className="booking-details-grid">
          {/* CUSTOMER */}

          <div className="details-card">
            <div className="details-card-header">
              <div className="details-section-icon customer-icon">♙</div>

              <div>
                <h3>Customer Information</h3>
                <span>Customer account details</span>
              </div>
            </div>

            <div className="details-content">
              <div className="detail-row">
                <span>Name</span>

                <strong>{booking.customerName || "-"}</strong>
              </div>

              <div className="detail-row">
                <span>Email</span>

                <strong>{booking.customerEmail || "-"}</strong>
              </div>

              <div className="detail-row">
                <span>Customer ID</span>

                <strong>#{booking.customerId || "-"}</strong>
              </div>
            </div>

            {booking.customerId && (
              <button
                className="details-link-btn"
                onClick={() =>
                  navigate(`/admin/customers/${booking.customerId}/details`)
                }
              >
                View Customer Profile →
              </button>
            )}
          </div>

          {/* VEHICLE */}

          <div className="details-card">
            <div className="details-card-header">
              <div className="details-section-icon vehicle-icon">▰</div>

              <div>
                <h3>Vehicle Information</h3>

                <span>Vehicle selected for service</span>
              </div>
            </div>

            <div className="vehicle-highlight">
              <div className="vehicle-large-icon">🚘</div>

              <div>
                <strong>{booking.vehicleName || "Vehicle"}</strong>

                <span>
                  {booking.registrationNumber || "Registration unavailable"}
                </span>
              </div>
            </div>

            <div className="details-content">
              <div className="detail-row">
                <span>Vehicle ID</span>

                <strong>#{booking.vehicleId || "-"}</strong>
              </div>

              <div className="detail-row">
                <span>Registration</span>

                <strong>{booking.registrationNumber || "-"}</strong>
              </div>
            </div>
          </div>

          {/* SERVICE */}

          <div className="details-card">
            <div className="details-card-header">
              <div className="details-section-icon service-icon">⚙</div>

              <div>
                <h3>Service Details</h3>

                <span>Selected service & package</span>
              </div>
            </div>

            <div className="service-highlight">
              <div>
                <span>PRIMARY SERVICE</span>

                <strong>{booking.serviceName || "No Service"}</strong>
              </div>

              <div>
                <span>PACKAGE</span>

                <strong>{booking.packageName || "No Package"}</strong>
              </div>
            </div>
          </div>

          {/* SCHEDULE */}

          <div className="details-card">
            <div className="details-card-header">
              <div className="details-section-icon schedule-icon">◷</div>

              <div>
                <h3>Schedule</h3>

                <span>Booking date & appointment time</span>
              </div>
            </div>

            <div className="schedule-box">
              <div>
                <span>DATE</span>

                <strong>{formatDate(booking.bookingDate)}</strong>
              </div>

              <div>
                <span>TIME</span>

                <strong>{formatTime(booking.bookingTime)}</strong>
              </div>
            </div>
          </div>

          {/* PICKUP & DROP */}

          <div className="details-card full-width-card">
            <div className="details-card-header">
              <div className="details-section-icon pickup-icon">⇄</div>

              <div>
                <h3>Pickup & Drop Service</h3>

                <span>Vehicle collection and delivery information</span>
              </div>
            </div>

            <div className="pickup-details-grid">
              {/* PICKUP */}

              <div className="transport-box">
                <div className="transport-title">
                  <span>↗</span>

                  <strong>Pickup</strong>

                  {booking.pickupRequired ? (
                    <em className="enabled-badge">Required</em>
                  ) : (
                    <em className="disabled-badge">Not Required</em>
                  )}
                </div>

                <p>
                  {booking.pickupRequired
                    ? booking.pickupAddress || "Address not provided"
                    : "Customer will visit the service center."}
                </p>
              </div>

              {/* DROP */}

              <div className="transport-box">
                <div className="transport-title">
                  <span>↙</span>

                  <strong>Drop</strong>

                  {booking.dropRequired ? (
                    <em className="enabled-badge">Required</em>
                  ) : (
                    <em className="disabled-badge">Not Required</em>
                  )}
                </div>

                <p>
                  {booking.dropRequired
                    ? booking.dropAddress || "Address not provided"
                    : "Customer will collect the vehicle."}
                </p>
              </div>
            </div>
          </div>

          {/* AMOUNT */}

          <div className="details-card">
            <div className="details-card-header">
              <div className="details-section-icon payment-icon">₹</div>

              <div>
                <h3>Booking Amount</h3>

                <span>Service booking value</span>
              </div>
            </div>

            <div className="amount-summary">
              <div>
                <span>Booking Total</span>

                <strong>
                  ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="amount-status">
                <span>Payment information</span>

                <strong>View in Payments</strong>
              </div>
            </div>
          </div>

          {/* NOTES */}

          <div className="details-card">
            <div className="details-card-header">
              <div className="details-section-icon notes-icon">✎</div>

              <div>
                <h3>Booking Notes</h3>

                <span>Additional customer instructions</span>
              </div>
            </div>

            <div className="notes-box">
              {booking.notes ? (
                <p>{booking.notes}</p>
              ) : (
                <p className="no-notes">
                  No additional notes were added for this booking.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            BOOKING MANAGEMENT
        ===================================================== */}

        <section className="management-banner">
          <div className="management-icon">✦</div>

          <div>
            <h3>Booking Management</h3>

            <p>
              Admin controls for worker assignment, service status, AI
              inspection and delivery will be available here.
            </p>
          </div>

          {/* IMPORTANT:
              This button now opens
              /admin/bookings/{booking.id}/manage
          */}

          <button
            onClick={() => navigate(`/admin/bookings/${booking.id}/manage`)}
          >
            Manage Booking
          </button>
        </section>
      </main>
    </div>
  );
}

export default AdminBookingDetails;
