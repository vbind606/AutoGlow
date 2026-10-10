import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./AdminReports.css";

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/reports");

      setReports(response.data);
    } catch (err) {
      console.error("Reports fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load admin reports. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const bookingStatusData = useMemo(() => {
    if (!reports?.bookingStatusReports) {
      return [];
    }

    return reports.bookingStatusReports.filter(
      (item) => Number(item.count) > 0,
    );
  }, [reports]);

  const maxMonthlyRevenue = useMemo(() => {
    if (!reports?.monthlyReports?.length) {
      return 1;
    }

    return Math.max(
      ...reports.monthlyReports.map((item) => Number(item.revenue) || 0),
      1,
    );
  }, [reports]);

  if (loading) {
    return (
      <div className="admin-reports-page">
        <div className="reports-loading">
          <div className="reports-spinner"></div>
          <h3>Loading Reports...</h3>
          <p>Preparing your business analytics.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-reports-page">
        <div className="reports-error">
          <div className="error-icon">!</div>

          <h2>Reports Unavailable</h2>

          <p>{error}</p>

          <button onClick={fetchReports} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reports) {
    return null;
  }

  const paymentSuccessRate =
    reports.totalPayments > 0
      ? ((reports.successfulPayments / reports.totalPayments) * 100).toFixed(1)
      : "0.0";

  const completionRate =
    reports.totalBookings > 0
      ? ((reports.completedBookings / reports.totalBookings) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="admin-reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <span className="reports-eyebrow">ANALYTICS CENTER</span>

          <h1>Reports & Analytics</h1>

          <p>
            Monitor AutoGlow's bookings, revenue, customers and payment
            performance.
          </p>
        </div>

        <button className="refresh-reports-btn" onClick={fetchReports}>
          <span>↻</span>
          Refresh
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="reports-kpi-grid">
        <div className="report-kpi-card">
          <div className="kpi-icon customers-icon">👥</div>

          <div className="kpi-content">
            <span>Total Customers</span>
            <strong>{reports.totalCustomers}</strong>
            <small>Registered customers</small>
          </div>
        </div>

        <div className="report-kpi-card">
          <div className="kpi-icon vehicles-icon">🚗</div>

          <div className="kpi-content">
            <span>Total Vehicles</span>
            <strong>{reports.totalVehicles}</strong>
            <small>Cars & bikes</small>
          </div>
        </div>

        <div className="report-kpi-card">
          <div className="kpi-icon bookings-icon">📅</div>

          <div className="kpi-content">
            <span>Total Bookings</span>
            <strong>{reports.totalBookings}</strong>
            <small>{completionRate}% completion rate</small>
          </div>
        </div>

        <div className="report-kpi-card revenue-card">
          <div className="kpi-icon revenue-icon">₹</div>

          <div className="kpi-content">
            <span>Total Revenue</span>
            <strong>{formatCurrency(reports.totalRevenue)}</strong>
            <small>Business revenue</small>
          </div>
        </div>
      </div>

      {/* Booking + Revenue Overview */}
      <div className="reports-two-column">
        {/* Booking Overview */}
        <section className="report-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">BOOKINGS</span>
              <h2>Booking Overview</h2>
            </div>
          </div>

          <div className="booking-summary-grid">
            <div className="summary-item completed">
              <span>Completed</span>
              <strong>{reports.completedBookings}</strong>
            </div>

            <div className="summary-item pending">
              <span>Pending</span>
              <strong>{reports.pendingBookings}</strong>
            </div>

            <div className="summary-item cancelled">
              <span>Cancelled</span>
              <strong>{reports.cancelledBookings}</strong>
            </div>
          </div>

          <div className="status-list">
            {reports.bookingStatusReports?.map((item) => (
              <div className="status-row" key={item.status}>
                <div className="status-name">
                  <span className="status-dot"></span>
                  {item.status}
                </div>

                <div className="status-bar-container">
                  <div
                    className="status-bar"
                    style={{
                      width: `${Math.min(Number(item.percentage) || 0, 100)}%`,
                    }}
                  ></div>
                </div>

                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Overview */}
        <section className="report-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">PAYMENTS</span>
              <h2>Payment Overview</h2>
            </div>
          </div>

          <div className="payment-total">
            <span>Paid Revenue</span>
            <strong>{formatCurrency(reports.paidRevenue)}</strong>
          </div>

          <div className="payment-stat-list">
            <div className="payment-stat">
              <span>Total Payments</span>
              <strong>{reports.totalPayments}</strong>
            </div>

            <div className="payment-stat success">
              <span>Successful</span>
              <strong>{reports.successfulPayments}</strong>
            </div>

            <div className="payment-stat warning">
              <span>Pending</span>
              <strong>{reports.pendingPayments}</strong>
            </div>

            <div className="payment-stat danger">
              <span>Failed</span>
              <strong>{reports.failedPayments}</strong>
            </div>
          </div>

          <div className="payment-rate">
            <div className="rate-header">
              <span>Payment Success Rate</span>
              <strong>{paymentSuccessRate}%</strong>
            </div>

            <div className="rate-track">
              <div
                className="rate-fill"
                style={{
                  width: `${Math.min(Number(paymentSuccessRate), 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </section>
      </div>

      {/* Revenue Chart */}
      <section className="report-panel monthly-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">FINANCIAL PERFORMANCE</span>
            <h2>Monthly Revenue</h2>
          </div>

          <div className="chart-total">
            {formatCurrency(reports.totalRevenue)}
          </div>
        </div>

        <div className="monthly-chart">
          {reports.monthlyReports?.map((item) => {
            const revenue = Number(item.revenue) || 0;

            const height =
              revenue > 0
                ? Math.max((revenue / maxMonthlyRevenue) * 100, 5)
                : 3;

            return (
              <div className="month-column" key={item.month}>
                <div className="month-value">
                  {revenue > 0 ? formatCurrency(revenue) : "₹0"}
                </div>

                <div className="bar-area">
                  <div
                    className="revenue-bar"
                    style={{
                      height: `${height}%`,
                    }}
                    title={`${item.month}: ${formatCurrency(revenue)}`}
                  ></div>
                </div>

                <span>{item.month}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Service Performance */}
      <section className="report-panel service-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">SERVICES</span>
            <h2>Service Performance</h2>
          </div>
        </div>

        {reports.serviceReports?.length > 0 ? (
          <div className="service-table-wrapper">
            <table className="service-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Average Revenue</th>
                </tr>
              </thead>

              <tbody>
                {reports.serviceReports.map((service, index) => (
                  <tr key={`${service.serviceName}-${index}`}>
                    <td>
                      <div className="service-name-cell">
                        <span className="service-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <strong>{service.serviceName}</strong>
                      </div>
                    </td>

                    <td>{service.bookingCount}</td>

                    <td>
                      <strong>{formatCurrency(service.revenue)}</strong>
                    </td>

                    <td>{formatCurrency(service.averageRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-service-state">
            <div>📊</div>
            <h3>No Service Data</h3>
            <p>
              Service performance data will appear here once bookings are
              available.
            </p>
          </div>
        )}
      </section>

      {/* Bottom Revenue Cards */}
      <div className="revenue-summary-grid">
        <div className="revenue-summary-card">
          <span>Total Revenue</span>
          <strong>{formatCurrency(reports.totalRevenue)}</strong>
        </div>

        <div className="revenue-summary-card">
          <span>Paid Revenue</span>
          <strong>{formatCurrency(reports.paidRevenue)}</strong>
        </div>

        <div className="revenue-summary-card">
          <span>Pending Revenue</span>
          <strong>{formatCurrency(reports.pendingRevenue)}</strong>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
