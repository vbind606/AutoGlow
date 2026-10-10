import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminPayments.css";

function AdminPayments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalPayments: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });

  // =========================================================
  // AUTH + INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    fetchPayments();
    fetchStats();
  }, [navigate]);

  // =========================================================
  // FETCH PAYMENTS
  // =========================================================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/payments");

      setPayments(response.data || []);
    } catch (err) {
      console.error("Error loading payments:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load payments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH STATS
  // =========================================================

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/payments/stats");

      setStats({
        totalPayments: response.data?.totalPayments || 0,
        successfulPayments: response.data?.successfulPayments || 0,
        pendingPayments: response.data?.pendingPayments || 0,
        totalRevenue: response.data?.totalRevenue || 0,
      });
    } catch (err) {
      console.error("Error loading payment stats:", err);

      // Fallback stats from already loaded payment list
      calculateLocalStats();
    }
  };

  // =========================================================
  // LOCAL STATS FALLBACK
  // =========================================================

  const calculateLocalStats = () => {
    const successful = payments.filter(
      (payment) => (payment.paymentStatus || "").toUpperCase() === "SUCCESS",
    ).length;

    const pending = payments.filter(
      (payment) => (payment.paymentStatus || "").toUpperCase() === "PENDING",
    ).length;

    const revenue = payments
      .filter(
        (payment) => (payment.paymentStatus || "").toUpperCase() === "SUCCESS",
      )
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);

    setStats({
      totalPayments: payments.length,
      successfulPayments: successful,
      pendingPayments: pending,
      totalRevenue: revenue,
    });
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshAll = async () => {
    await Promise.all([fetchPayments(), fetchStats()]);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");

    navigate("/login");
  };

  // =========================================================
  // FILTER PAYMENTS
  // =========================================================

  const filteredPayments = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        String(payment.paymentId || "")
          .toLowerCase()
          .includes(searchText) ||
        String(payment.bookingId || "")
          .toLowerCase()
          .includes(searchText) ||
        (payment.customerName || "").toLowerCase().includes(searchText) ||
        (payment.customerEmail || "").toLowerCase().includes(searchText) ||
        (payment.vehicleName || "").toLowerCase().includes(searchText) ||
        (payment.registrationNumber || "").toLowerCase().includes(searchText) ||
        (payment.serviceName || "").toLowerCase().includes(searchText) ||
        (payment.packageName || "").toLowerCase().includes(searchText) ||
        (payment.transactionId || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        (payment.paymentStatus || "").toUpperCase() === statusFilter;

      const matchesMethod =
        methodFilter === "ALL" ||
        (payment.paymentMethod || "").toUpperCase() === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "-";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =========================================================
  // FORMAT BOOKING DATE
  // =========================================================

  const formatBookingDate = (date) => {
    if (!date) {
      return "-";
    }

    const d = new Date(date + "T00:00:00");

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getPaymentStatusClass = (status) => {
    switch ((status || "").toUpperCase()) {
      case "SUCCESS":
        return "payment-status-success";

      case "PENDING":
        return "payment-status-pending";

      case "FAILED":
        return "payment-status-failed";

      case "REFUNDED":
        return "payment-status-refunded";

      default:
        return "payment-status-default";
    }
  };

  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // =========================================================
  // PAYMENT METHOD
  // =========================================================

  const formatPaymentMethod = (method) => {
    if (!method) {
      return "-";
    }

    switch (method.toUpperCase()) {
      case "UPI":
        return "UPI";

      case "CARD":
        return "Card";

      case "CASH":
        return "Cash";

      default:
        return method;
    }
  };

  // =========================================================
  // METHOD ICON
  // =========================================================

  const getMethodIcon = (method) => {
    switch ((method || "").toUpperCase()) {
      case "UPI":
        return "⌁";

      case "CARD":
        return "▣";

      case "CASH":
        return "₹";

      default:
        return "•";
    }
  };

  return (
    <div className="admin-payments-page">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

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

          <button onClick={() => navigate("/admin/bookings")}>
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

          <button className="active">
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
          MAIN
      ====================================================== */}

      <main className="admin-main">
        {/* Header */}

        <header className="admin-page-header">
          <div>
            <p className="admin-breadcrumb">Admin / Payments</p>

            <h1>Payment Management</h1>

            <p className="admin-subtitle">
              View and monitor all customer payments
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={refreshAll}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </header>

        {/* =================================================
            STATS
        ================================================== */}

        <section className="payment-stats">
          <div className="payment-stat-card">
            <div className="payment-stat-icon">₹</div>

            <div>
              <span>Total Payments</span>
              <strong>{stats.totalPayments}</strong>
            </div>
          </div>

          <div className="payment-stat-card">
            <div className="payment-stat-icon success-icon">✓</div>

            <div>
              <span>Successful</span>
              <strong>{stats.successfulPayments}</strong>
            </div>
          </div>

          <div className="payment-stat-card">
            <div className="payment-stat-icon pending-icon">◷</div>

            <div>
              <span>Pending</span>
              <strong>{stats.pendingPayments}</strong>
            </div>
          </div>

          <div className="payment-stat-card">
            <div className="payment-stat-icon revenue-icon">₹</div>

            <div>
              <span>Total Revenue</span>
              <strong>
                ₹{Number(stats.totalRevenue || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </section>

        {/* =================================================
            TOOLBAR
        ================================================== */}

        <section className="payment-toolbar">
          <div className="payment-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search payment, booking, customer, vehicle or transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="payment-filter">
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>

              <option value="SUCCESS">Success</option>

              <option value="PENDING">Pending</option>

              <option value="FAILED">Failed</option>

              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="payment-filter">
            <label>Method</label>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="ALL">All Methods</option>

              <option value="UPI">UPI</option>

              <option value="CARD">Card</option>

              <option value="CASH">Cash</option>
            </select>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="payment-error">
            <div>
              <strong>Error:</strong> {error}
            </div>

            <button onClick={refreshAll}>Try Again</button>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div className="payment-loading">
            <div className="loading-spinner"></div>

            <p>Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="payment-empty">
            <div className="empty-icon">₹</div>

            <h3>No Payments Found</h3>

            <p>
              {payments.length === 0
                ? "There are no payments in the system yet."
                : "No payment matches your search or selected filters."}
            </p>
          </div>
        ) : (
          <section className="payment-table-card">
            <div className="table-header">
              <div>
                <h2>All Payments</h2>

                <span>
                  Showing {filteredPayments.length} of {payments.length}{" "}
                  payments
                </span>
              </div>
            </div>

            <div className="payment-table-wrapper">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Payment</th>

                    <th>Customer</th>

                    <th>Booking</th>

                    <th>Vehicle / Service</th>

                    <th>Amount</th>

                    <th>Method</th>

                    <th>Date</th>

                    <th>Status</th>

                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.paymentId}>
                      {/* Payment */}

                      <td>
                        <div className="payment-id-cell">
                          <strong>#{payment.paymentId}</strong>

                          <span>TXN: {payment.transactionId || "-"}</span>
                        </div>
                      </td>

                      {/* Customer */}

                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {(payment.customerName || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{payment.customerName || "Unknown"}</strong>

                            <span>{payment.customerEmail || "-"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Booking */}

                      <td>
                        <div className="booking-cell">
                          <strong>#{payment.bookingId}</strong>

                          <span>{formatBookingDate(payment.bookingDate)}</span>
                        </div>
                      </td>

                      {/* Vehicle */}

                      <td>
                        <div className="vehicle-service-cell">
                          <strong>{payment.vehicleName || "-"}</strong>

                          <span>{payment.registrationNumber || "-"}</span>

                          <small>
                            {payment.serviceName || "-"}

                            {payment.packageName &&
                            payment.packageName !== "No Package"
                              ? ` • ${payment.packageName}`
                              : ""}
                          </small>
                        </div>
                      </td>

                      {/* Amount */}

                      <td>
                        <strong className="payment-amount">
                          ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
                        </strong>
                      </td>

                      {/* Method */}

                      <td>
                        <div className="method-cell">
                          <div className="method-icon">
                            {getMethodIcon(payment.paymentMethod)}
                          </div>

                          <span>
                            {formatPaymentMethod(payment.paymentMethod)}
                          </span>
                        </div>
                      </td>

                      {/* Date */}

                      <td>
                        <div className="date-cell">
                          <strong>
                            {formatDateTime(
                              payment.paymentDate || payment.createdAt,
                            )}
                          </strong>
                        </div>
                      </td>

                      {/* Status */}

                      <td>
                        <span
                          className={`payment-status ${getPaymentStatusClass(
                            payment.paymentStatus,
                          )}`}
                        >
                          {formatStatus(payment.paymentStatus)}
                        </span>
                      </td>

                      {/* Action */}

                      <td>
                        <button
                          className="view-payment-btn"
                          onClick={() =>
                            navigate(`/admin/payments/${payment.paymentId}`)
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

export default AdminPayments;
