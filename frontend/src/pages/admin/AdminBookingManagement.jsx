import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./AdminBookingManagement.css";

function AdminBookingManagement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [workers, setWorkers] = useState([]);

  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingWorker, setSavingWorker] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const statusOptions = [
    "PENDING",
    "CONFIRMED",
    "ASSIGNED",
    "RECEIVED",
    "INSPECTION",
    "WASHING",
    "DRYING",
    "QUALITY_CHECK",
    "COMPLETED",
    "DELIVERED",
    "CANCELLED",
  ];

  // ==========================================
  // ADMIN AUTH CHECK
  // ==========================================

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
    }
  }, [navigate]);

  // ==========================================
  // LOAD BOOKING + WORKERS
  // ==========================================

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const bookingResponse = await api.get(`/admin/bookings/${id}`);

      const workerResponse = await api.get("/admin/workers");

      const bookingData = bookingResponse.data;
      const workerData = workerResponse.data;

      setBooking(bookingData);
      setWorkers(workerData);

      setSelectedStatus(bookingData.status || "PENDING");

      // If response contains workerId
      if (bookingData.workerId) {
        setSelectedWorker(String(bookingData.workerId));
      }
    } catch (err) {
      console.error("Admin booking management error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load booking information.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ASSIGN WORKER
  // ==========================================

  const handleAssignWorker = async () => {
    if (!selectedWorker) {
      setError("Please select a worker.");
      setSuccess("");
      return;
    }

    try {
      setSavingWorker(true);
      setError("");
      setSuccess("");

      const response = await api.put(`/admin/bookings/${id}/assign-worker`, {
        workerId: Number(selectedWorker),
      });

      setBooking(response.data);

      setSelectedStatus(response.data.status || "ASSIGNED");

      setSuccess("Worker assigned successfully.");
    } catch (err) {
      console.error("Worker assignment error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to assign worker.",
      );
    } finally {
      setSavingWorker(false);
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      setError("Please select a booking status.");
      setSuccess("");
      return;
    }

    try {
      setSavingStatus(true);
      setError("");
      setSuccess("");

      const response = await api.put(`/admin/bookings/${id}/status`, {
        status: selectedStatus,
      });

      setBooking(response.data);

      setSuccess("Booking status updated successfully.");
    } catch (err) {
      console.error("Booking status update error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to update booking status.",
      );
    } finally {
      setSavingStatus(false);
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    if (!status) {
      return "status-default";
    }

    return `status-${status.toLowerCase().replaceAll("_", "-")}`;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-management-layout">
        <aside className="admin-management-sidebar">
          <div className="admin-logo">
            <div className="admin-logo-icon">AG</div>

            <div>
              <h2>AutoGlow</h2>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          <div className="management-loading">Loading...</div>
        </aside>

        <main className="admin-management-main">
          <div className="management-page-loading">
            Loading booking details...
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // ERROR / NO BOOKING
  // ==========================================

  if (!booking) {
    return (
      <div className="admin-management-layout">
        <aside className="admin-management-sidebar">
          <div className="admin-logo">
            <div className="admin-logo-icon">AG</div>

            <div>
              <h2>AutoGlow</h2>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          <nav className="admin-management-nav">
            <button onClick={() => navigate("/admin/dashboard")}>
              Dashboard
            </button>

            <button onClick={() => navigate("/admin/bookings")}>
              Bookings
            </button>
          </nav>
        </aside>

        <main className="admin-management-main">
          <div className="management-error-card">
            <h2>Booking Not Found</h2>

            <p>{error || "Unable to find this booking."}</p>

            <button
              className="back-btn"
              onClick={() => navigate("/admin/bookings")}
            >
              Back to Bookings
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="admin-management-layout">
      {/* =====================================
                SIDEBAR
            ===================================== */}

      <aside className="admin-management-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">AG</div>

          <div>
            <h2>AutoGlow</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-management-nav">
          <button onClick={() => navigate("/admin/dashboard")}>
            <span>▣</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/admin/customers")}>
            <span>👥</span>
            Customers
          </button>

          <button onClick={() => navigate("/admin/vehicles")}>
            <span>🚗</span>
            Vehicles
          </button>

          <button
            className="active"
            onClick={() => navigate("/admin/bookings")}
          >
            <span>📅</span>
            Bookings
          </button>

          <button onClick={() => navigate("/admin/services")}>
            <span>🧽</span>
            Services
          </button>

          <button onClick={() => navigate("/admin/packages")}>
            <span>📦</span>
            Packages
          </button>

          <button onClick={() => navigate("/admin/workers")}>
            <span>🧑‍🔧</span>
            Workers
          </button>

          <button onClick={() => navigate("/admin/payments")}>
            <span>💳</span>
            Payments
          </button>

          <button onClick={() => navigate("/admin/invoices")}>
            <span>🧾</span>
            Invoices
          </button>

          <button onClick={() => navigate("/admin/coupons")}>
            <span>🎟</span>
            Coupons
          </button>

          <button onClick={() => navigate("/admin/reviews")}>
            <span>⭐</span>
            Reviews
          </button>

          <button onClick={() => navigate("/admin/gallery")}>
            <span>🖼</span>
            Gallery
          </button>

          <button onClick={() => navigate("/admin/reports")}>
            <span>📊</span>
            Reports
          </button>

          <button onClick={() => navigate("/admin/ai-inspection")}>
            <span>🤖</span>
            AI Inspection
          </button>

          <button onClick={() => navigate("/admin/settings")}>
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <button
          className="admin-logout"
          onClick={() => {
            localStorage.removeItem("autoglow_token");

            localStorage.removeItem("autoglow_role");

            navigate("/login");
          }}
        >
          <span>↪</span>
          Logout
        </button>
      </aside>

      {/* =====================================
                MAIN CONTENT
            ===================================== */}

      <main className="admin-management-main">
        {/* HEADER */}

        <div className="management-topbar">
          <div>
            <button
              className="back-link"
              onClick={() => navigate(`/admin/bookings/${id}`)}
            >
              ← Back to Booking
            </button>

            <h1>Manage Booking</h1>

            <p>Assign worker and manage booking status</p>
          </div>

          <div className="management-admin-badge">
            <span>●</span>
            Administrator
          </div>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="management-alert success-alert">✓ {success}</div>
        )}

        {/* ERROR */}

        {error && <div className="management-alert error-alert">⚠ {error}</div>}

        {/* BOOKING HERO */}

        <section className="management-hero">
          <div>
            <span className="hero-label">BOOKING REFERENCE</span>

            <h2>#{booking.id}</h2>

            <p>
              {booking.customerName || "Customer"}
              {" • "}
              {booking.vehicleName || "Vehicle"}
            </p>
          </div>

          <div className="hero-right">
            <span className="hero-label">CURRENT STATUS</span>

            <span
              className={`management-status-badge ${getStatusClass(
                booking.status,
              )}`}
            >
              {booking.status?.replaceAll("_", " ") || "UNKNOWN"}
            </span>
          </div>
        </section>

        {/* =====================================
                    BOOKING INFORMATION
                ===================================== */}

        <section className="management-grid">
          {/* CUSTOMER */}

          <div className="management-card">
            <div className="card-heading">
              <span className="card-icon">👤</span>

              <div>
                <h3>Customer</h3>

                <p>Customer information</p>
              </div>
            </div>

            <div className="info-list">
              <div>
                <span>Name</span>
                <strong>{booking.customerName || "-"}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{booking.customerEmail || "-"}</strong>
              </div>

              <div>
                <span>Customer ID</span>
                <strong>#{booking.customerId || "-"}</strong>
              </div>
            </div>
          </div>

          {/* VEHICLE */}

          <div className="management-card">
            <div className="card-heading">
              <span className="card-icon">🚗</span>

              <div>
                <h3>Vehicle</h3>

                <p>Vehicle information</p>
              </div>
            </div>

            <div className="info-list">
              <div>
                <span>Vehicle</span>
                <strong>{booking.vehicleName || "-"}</strong>
              </div>

              <div>
                <span>Registration</span>
                <strong>{booking.registrationNumber || "-"}</strong>
              </div>

              <div>
                <span>Vehicle ID</span>
                <strong>#{booking.vehicleId || "-"}</strong>
              </div>
            </div>
          </div>

          {/* SERVICE */}

          <div className="management-card">
            <div className="card-heading">
              <span className="card-icon">🧽</span>

              <div>
                <h3>Service</h3>

                <p>Selected service</p>
              </div>
            </div>

            <div className="info-list">
              <div>
                <span>Service</span>
                <strong>{booking.serviceName || "No Service"}</strong>
              </div>

              <div>
                <span>Package</span>
                <strong>{booking.packageName || "No Package"}</strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong className="amount-value">
                  ₹{booking.totalAmount ?? 0}
                </strong>
              </div>
            </div>
          </div>

          {/* SCHEDULE */}

          <div className="management-card">
            <div className="card-heading">
              <span className="card-icon">📅</span>

              <div>
                <h3>Schedule</h3>

                <p>Booking date and time</p>
              </div>
            </div>

            <div className="info-list">
              <div>
                <span>Date</span>
                <strong>{booking.bookingDate || "-"}</strong>
              </div>

              <div>
                <span>Time</span>
                <strong>{booking.bookingTime || "-"}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
                    MANAGEMENT CONTROLS
                ===================================== */}

        <section className="management-controls">
          <div className="section-title">
            <div>
              <span className="section-kicker">OPERATIONS</span>

              <h2>Booking Management</h2>

              <p>Control worker assignment and service progress.</p>
            </div>
          </div>

          <div className="control-grid">
            {/* =================================
                            WORKER ASSIGNMENT
                        ================================= */}

            <div className="control-card">
              <div className="control-header">
                <div className="control-icon worker-icon">🧑‍🔧</div>

                <div>
                  <h3>Assign Worker</h3>

                  <p>Select an active worker for this job.</p>
                </div>
              </div>

              <label>Worker</label>

              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
              >
                <option value="">Select Worker</option>

                {workers
                  .filter((worker) => worker.active)
                  .map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                      {worker.specialization
                        ? ` — ${worker.specialization}`
                        : ""}
                    </option>
                  ))}
              </select>

              {workers.length === 0 && (
                <p className="empty-worker-message">No workers found.</p>
              )}

              <button
                className="primary-management-btn"
                onClick={handleAssignWorker}
                disabled={savingWorker}
              >
                {savingWorker ? "Assigning..." : "Assign Worker"}
              </button>
            </div>

            {/* =================================
                            STATUS MANAGEMENT
                        ================================= */}

            <div className="control-card">
              <div className="control-header">
                <div className="control-icon status-icon">🔄</div>

                <div>
                  <h3>Update Status</h3>

                  <p>Change the current booking progress.</p>
                </div>
              </div>

              <label>Booking Status</label>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <div className="selected-status-preview">
                <span>New Status</span>

                <strong
                  className={`management-status-badge ${getStatusClass(
                    selectedStatus,
                  )}`}
                >
                  {selectedStatus.replaceAll("_", " ")}
                </strong>
              </div>

              <button
                className="primary-management-btn"
                onClick={handleUpdateStatus}
                disabled={savingStatus}
              >
                {savingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </section>

        {/* =====================================
                    PICKUP / DROP
                ===================================== */}

        <section className="management-card full-width-card">
          <div className="card-heading">
            <span className="card-icon">🚚</span>

            <div>
              <h3>Pickup & Drop</h3>

              <p>Vehicle collection and delivery information</p>
            </div>
          </div>

          <div className="pickup-grid">
            <div className="pickup-box">
              <span>Pickup Required</span>

              <strong>{booking.pickupRequired ? "Yes" : "No"}</strong>

              {booking.pickupRequired && booking.pickupAddress && (
                <p>{booking.pickupAddress}</p>
              )}
            </div>

            <div className="pickup-box">
              <span>Drop Required</span>

              <strong>{booking.dropRequired ? "Yes" : "No"}</strong>

              {booking.dropRequired && booking.dropAddress && (
                <p>{booking.dropAddress}</p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================
                    NOTES
                ===================================== */}

        {booking.notes && (
          <section className="management-card full-width-card">
            <div className="card-heading">
              <span className="card-icon">📝</span>

              <div>
                <h3>Customer Notes</h3>

                <p>Additional booking instructions</p>
              </div>
            </div>

            <div className="notes-box">{booking.notes}</div>
          </section>
        )}

        {/* =====================================
                    FOOTER ACTIONS
                ===================================== */}

        <div className="management-footer-actions">
          <button
            className="secondary-management-btn"
            onClick={() => navigate(`/admin/bookings/${id}`)}
          >
            ← Booking Details
          </button>

          <button
            className="secondary-management-btn"
            onClick={() => navigate("/admin/bookings")}
          >
            All Bookings
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdminBookingManagement;
