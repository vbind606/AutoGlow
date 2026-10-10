import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = localStorage.getItem("autoglow_role");
  const token = localStorage.getItem("autoglow_token");

  useEffect(() => {
    // ==============================
    // ADMIN AUTHENTICATION
    // ==============================
    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard");

        setDashboard(response.data);
      } catch (err) {
        console.error("Admin Dashboard Error:", err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("autoglow_token");
          localStorage.removeItem("autoglow_role");

          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message || "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate, role, token]);

  // ==============================
  // FORMAT CURRENCY
  // ==============================
  const formatCurrency = (amount) => {
    const value = Number(amount || 0);

    return `₹${value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  // ==============================
  // FORMAT DATE
  // ==============================
  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  // ==============================
  // BOOKING STATUS
  // ==============================
  const getStatusClass = (status) => {
    if (!status) return "status-default";

    switch (status.toUpperCase()) {
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

  return (
    <div className="admin-dashboard">
      {/* =========================================
          DASHBOARD CONTENT ONLY
          Sidebar + Header are handled by AdminLayout
      ========================================== */}

      <main className="admin-main">
        {/* =========================================
            WELCOME SECTION
        ========================================== */}

        <section className="admin-welcome">
          <div className="admin-welcome-content">
            <span className="admin-welcome-label">WELCOME BACK</span>

            <h1>AutoGlow Administration 👋</h1>

            <p>
              {loading
                ? "Preparing your dashboard..."
                : error
                  ? error
                  : "Here's what's happening with your AutoGlow business today."}
            </p>
          </div>

          <div className="admin-welcome-icon">A</div>
        </section>

        {/* =========================================
            MAIN STATISTICS
        ========================================== */}

        <section className="admin-stats">
          {/* CUSTOMERS */}

          <div className="admin-stat-card">
            <div className="admin-stat-icon customers">♙</div>

            <div className="admin-stat-content">
              <span>Total Customers</span>

              <h3>{loading ? "..." : (dashboard?.totalCustomers ?? 0)}</h3>

              <small>Registered customers</small>
            </div>
          </div>

          {/* BOOKINGS */}

          <div className="admin-stat-card">
            <div className="admin-stat-icon bookings">▣</div>

            <div className="admin-stat-content">
              <span>Total Bookings</span>

              <h3>{loading ? "..." : (dashboard?.totalBookings ?? 0)}</h3>

              <small>All service bookings</small>
            </div>
          </div>

          {/* REVENUE */}

          <div className="admin-stat-card">
            <div className="admin-stat-icon revenue">₹</div>

            <div className="admin-stat-content">
              <span>Total Revenue</span>

              <h3>
                {loading ? "..." : formatCurrency(dashboard?.totalRevenue)}
              </h3>

              <small>Successful payments</small>
            </div>
          </div>

          {/* WORKERS */}

          <div className="admin-stat-card">
            <div className="admin-stat-icon workers">♟</div>

            <div className="admin-stat-content">
              <span>Total Workers</span>

              <h3>{loading ? "..." : (dashboard?.activeWorkers ?? 0)}</h3>

              <small>Registered workers</small>
            </div>
          </div>
        </section>

        {/* =========================================
            SECONDARY STATISTICS
        ========================================== */}

        <section className="admin-secondary-stats">
          <div className="admin-mini-stat">
            <span>Pending Bookings</span>

            <strong>
              {loading ? "..." : (dashboard?.pendingBookings ?? 0)}
            </strong>
          </div>

          <div className="admin-mini-stat">
            <span>Completed Bookings</span>

            <strong>
              {loading ? "..." : (dashboard?.completedBookings ?? 0)}
            </strong>
          </div>

          <div className="admin-mini-stat">
            <span>Total Vehicles</span>

            <strong>{loading ? "..." : (dashboard?.totalVehicles ?? 0)}</strong>
          </div>
        </section>

        {/* =========================================
            CONTENT GRID
        ========================================== */}

        <section className="admin-content-grid">
          {/* ======================================
              RECENT BOOKINGS
          ======================================= */}

          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span>BOOKING MANAGEMENT</span>

                <h2>Recent Bookings</h2>
              </div>

              <button onClick={() => navigate("/admin/bookings")}>
                View All →
              </button>
            </div>

            {/* LOADING */}

            {loading && (
              <div className="admin-empty">
                <div className="admin-empty-icon">⏳</div>

                <h3>Loading bookings...</h3>

                <p>Please wait while we fetch recent bookings.</p>
              </div>
            )}

            {/* BOOKINGS */}

            {!loading && dashboard?.recentBookings?.length > 0 && (
              <div className="admin-bookings-list">
                {dashboard.recentBookings.map((booking) => (
                  <div className="admin-booking-row" key={booking.id}>
                    <div className="admin-booking-icon">🚗</div>

                    <div className="admin-booking-info">
                      <strong>Booking #{booking.id}</strong>

                      <span>{booking.customerName}</span>

                      <small>{booking.vehicleName}</small>
                    </div>

                    <div className="admin-booking-date">
                      <span>{formatDate(booking.bookingDate)}</span>

                      <small>{booking.bookingTime || "-"}</small>
                    </div>

                    <div className="admin-booking-status">
                      <span
                        className={`booking-status ${getStatusClass(
                          booking.status,
                        )}`}
                      >
                        {booking.status?.replaceAll("_", " ") || "UNKNOWN"}
                      </span>
                    </div>

                    <div className="admin-booking-amount">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EMPTY */}

            {!loading && !dashboard?.recentBookings?.length && (
              <div className="admin-empty">
                <div className="admin-empty-icon">▣</div>

                <h3>No bookings yet</h3>

                <p>Customer bookings will appear here.</p>
              </div>
            )}
          </div>

          {/* ======================================
              QUICK ACTIONS
          ======================================= */}

          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span>SHORTCUTS</span>

                <h2>Quick Actions</h2>
              </div>
            </div>

            <div className="admin-quick-actions">
              <button onClick={() => navigate("/admin/customers")}>
                <span>♙</span>
                <div>
                  <strong>Manage Customers</strong>

                  <small>View registered customers</small>
                </div>
                →
              </button>

              <button onClick={() => navigate("/admin/bookings")}>
                <span>▣</span>
                <div>
                  <strong>Manage Bookings</strong>

                  <small>View & update bookings</small>
                </div>
                →
              </button>

              <button onClick={() => navigate("/admin/services")}>
                <span>✦</span>
                <div>
                  <strong>Manage Services</strong>

                  <small>Update car & bike services</small>
                </div>
                →
              </button>

              <button onClick={() => navigate("/admin/workers")}>
                <span>♟</span>
                <div>
                  <strong>Manage Workers</strong>

                  <small>Assign and manage workers</small>
                </div>
                →
              </button>

              <button onClick={() => navigate("/admin/reports")}>
                <span>◫</span>
                <div>
                  <strong>View Reports</strong>

                  <small>Business performance analytics</small>
                </div>
                →
              </button>
            </div>
          </div>
        </section>

        {/* =========================================
            AI INSIGHTS
        ========================================== */}

        <section className="admin-ai-banner">
          <div className="admin-ai-icon">✧</div>

          <div className="admin-ai-content">
            <span>AI POWERED INSIGHTS</span>

            <h2>Smart Vehicle Care Analytics</h2>

            <p>
              AI inspection data, service trends and customer behaviour insights
              will appear here.
            </p>
          </div>

          <button onClick={() => navigate("/admin/ai-inspection")}>
            Explore AI →
          </button>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
