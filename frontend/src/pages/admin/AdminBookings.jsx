import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminBookings.css";

function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/bookings");

      setBookings(response.data || []);
    } catch (err) {
      console.error("Error loading bookings:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load bookings. Please try again.",
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

  const filteredBookings = bookings.filter((booking) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      String(booking.id || "").includes(searchText) ||
      (booking.customerName || "").toLowerCase().includes(searchText) ||
      (booking.customerEmail || "").toLowerCase().includes(searchText) ||
      (booking.vehicleName || "").toLowerCase().includes(searchText) ||
      (booking.registrationNumber || "").toLowerCase().includes(searchText) ||
      (booking.serviceName || "").toLowerCase().includes(searchText) ||
      (booking.packageName || "").toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" ||
      (booking.status || "").toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.status === "CONFIRMED" || booking.status === "ASSIGNED",
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "COMPLETED" || booking.status === "DELIVERED",
  ).length;

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";

      case "CONFIRMED":
        return "status-confirmed";

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

  const formatStatus = (status) => {
    if (!status) return "UNKNOWN";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

  return (
    <div className="admin-bookings-page">
      {/* Sidebar */}
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

          <button className="active">
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

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-page-header">
          <div>
            <p className="admin-breadcrumb">Admin / Bookings</p>

            <h1>Booking Management</h1>

            <p className="admin-subtitle">
              View and manage all customer service bookings
            </p>
          </div>

          <button className="refresh-btn" onClick={fetchBookings}>
            ↻ Refresh
          </button>
        </header>

        {/* Stats */}
        <section className="booking-stats">
          <div className="booking-stat-card">
            <div className="stat-icon">▤</div>

            <div>
              <span>Total Bookings</span>
              <strong>{totalBookings}</strong>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="stat-icon pending-icon">◷</div>

            <div>
              <span>Pending</span>
              <strong>{pendingBookings}</strong>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="stat-icon confirmed-icon">✓</div>

            <div>
              <span>Confirmed / Assigned</span>
              <strong>{confirmedBookings}</strong>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="stat-icon completed-icon">★</div>

            <div>
              <span>Completed</span>
              <strong>{completedBookings}</strong>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="booking-toolbar">
          <div className="booking-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by customer, vehicle, service or booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="booking-filter">
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="RECEIVED">Received</option>
              <option value="INSPECTION">Inspection</option>
              <option value="WASHING">Washing</option>
              <option value="DRYING">Drying</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="COMPLETED">Completed</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="booking-error">
            <strong>Error:</strong> {error}
            <button onClick={fetchBookings}>Try Again</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="booking-loading">
            <div className="loading-spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="booking-empty">
            <div className="empty-icon">▤</div>

            <h3>No Bookings Found</h3>

            <p>
              {bookings.length === 0
                ? "There are no bookings in the system yet."
                : "No booking matches your search or selected status."}
            </p>
          </div>
        ) : (
          <section className="booking-table-card">
            <div className="table-header">
              <div>
                <h2>All Bookings</h2>

                <span>
                  Showing {filteredBookings.length} of {bookings.length}{" "}
                  bookings
                </span>
              </div>
            </div>

            <div className="booking-table-wrapper">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Pickup / Drop</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <span className="booking-id">#{booking.id}</span>
                      </td>

                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {(booking.customerName || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{booking.customerName || "Unknown"}</strong>

                            <span>{booking.customerEmail || "-"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="vehicle-cell">
                          <strong>{booking.vehicleName || "-"}</strong>

                          <span>{booking.registrationNumber || "-"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="service-cell">
                          <strong>{booking.serviceName || "-"}</strong>

                          <span>{booking.packageName || "No Package"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="datetime-cell">
                          <strong>{formatDate(booking.bookingDate)}</strong>

                          <span>{formatTime(booking.bookingTime)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="pickup-cell">
                          {booking.pickupRequired && (
                            <span className="pickup-badge">Pickup</span>
                          )}

                          {booking.dropRequired && (
                            <span className="drop-badge">Drop</span>
                          )}

                          {!booking.pickupRequired && !booking.dropRequired && (
                            <span className="none-badge">Self Visit</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <strong className="amount">
                          ₹
                          {Number(booking.totalAmount || 0).toLocaleString(
                            "en-IN",
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`booking-status ${getStatusClass(
                            booking.status,
                          )}`}
                        >
                          {formatStatus(booking.status)}
                        </span>
                      </td>

                      <td>
                        <button
                          className="view-booking-btn"
                          onClick={() =>
                            navigate(`/admin/bookings/${booking.id}`)
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminBookings;
