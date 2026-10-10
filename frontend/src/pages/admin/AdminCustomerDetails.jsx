import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./AdminCustomerDetails.css";

function AdminCustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadCustomer();
  }, [id, navigate]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/admin/customers/${id}/details`);
      setCustomer(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Unable to load customer details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="customer-details-page">
        <div className="customer-details-loading">
          Loading customer details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-details-page">
        <div className="customer-details-error">
          <h2>Unable to load customer</h2>
          <p>{error}</p>

          <button onClick={() => navigate("/admin/customers")}>
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const vehicles = customer.vehicles || [];
  const bookings = customer.bookings || [];
  const payments = customer.payments || [];
  const invoices = customer.invoices || [];
  const reviews = customer.reviews || [];

  return (
    <div className="customer-details-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">A</div>
          <div>
            <h2>AutoGlow</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="admin-nav-item active"
            onClick={() => navigate("/admin/customers")}
          >
            <span>👥</span>
            Customers
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/vehicles")}
          >
            <span>🚗</span>
            Vehicles
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/bookings")}
          >
            <span>📅</span>
            Bookings
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/services")}
          >
            <span>🧽</span>
            Services
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/packages")}
          >
            <span>📦</span>
            Packages
          </button>

          <div className="admin-nav-section">MANAGEMENT</div>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/workers")}
          >
            <span>👨‍🔧</span>
            Workers
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/payments")}
          >
            <span>💳</span>
            Payments
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/invoices")}
          >
            <span>🧾</span>
            Invoices
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/coupons")}
          >
            <span>🎟️</span>
            Coupons
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/reviews")}
          >
            <span>⭐</span>
            Reviews
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/reports")}
          >
            <span>📊</span>
            Reports
          </button>

          <div className="admin-nav-section">SYSTEM</div>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/ai-inspection")}
          >
            <span>🤖</span>
            AI Inspection
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate("/admin/settings")}
          >
            <span>⚙️</span>
            Settings
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-logout" onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="customer-details-main">
        <header className="customer-details-topbar">
          <div>
            <button
              className="customer-back-btn"
              onClick={() => navigate("/admin/customers")}
            >
              ← Back to Customers
            </button>

            <div className="customer-page-title">Customer Details</div>
          </div>

          <div className="customer-admin-badge">ADMIN</div>
        </header>

        <div className="customer-details-content">
          {/* Profile */}
          <section className="customer-profile-card">
            <div className="customer-large-avatar">
              {customer.name ? customer.name.charAt(0).toUpperCase() : "C"}
            </div>

            <div className="customer-profile-info">
              <span className="customer-profile-label">CUSTOMER PROFILE</span>

              <h1>{customer.name}</h1>

              <p>{customer.email}</p>

              <div className="customer-profile-meta">
                <span>Customer ID: #{customer.id}</span>

                <span className="customer-role-badge">{customer.role}</span>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="customer-summary-grid">
            <div className="customer-summary-card">
              <span>🚗</span>
              <div>
                <strong>{vehicles.length}</strong>
                <small>Vehicles</small>
              </div>
            </div>

            <div className="customer-summary-card">
              <span>📅</span>
              <div>
                <strong>{bookings.length}</strong>
                <small>Bookings</small>
              </div>
            </div>

            <div className="customer-summary-card">
              <span>💳</span>
              <div>
                <strong>{payments.length}</strong>
                <small>Payments</small>
              </div>
            </div>

            <div className="customer-summary-card">
              <span>⭐</span>
              <div>
                <strong>{reviews.length}</strong>
                <small>Reviews</small>
              </div>
            </div>
          </section>

          {/* Vehicles */}
          <section className="customer-details-panel">
            <div className="customer-panel-header">
              <div>
                <span>VEHICLE INFORMATION</span>
                <h2>Customer Vehicles</h2>
              </div>

              <strong>{vehicles.length}</strong>
            </div>

            {vehicles.length === 0 ? (
              <div className="customer-empty">No vehicles registered.</div>
            ) : (
              <div className="customer-vehicle-grid">
                {vehicles.map((vehicle) => (
                  <div className="customer-vehicle-card" key={vehicle.id}>
                    <div className="vehicle-icon">🚗</div>

                    <div>
                      <h3>
                        {vehicle.make || "Vehicle"} {vehicle.model || ""}
                      </h3>

                      <p>{vehicle.vehicleType || "Vehicle"}</p>

                      <strong>{vehicle.vehicleNumber || "N/A"}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bookings */}
          <section className="customer-details-panel">
            <div className="customer-panel-header">
              <div>
                <span>SERVICE ACTIVITY</span>
                <h2>Booking History</h2>
              </div>

              <strong>{bookings.length}</strong>
            </div>

            {bookings.length === 0 ? (
              <div className="customer-empty">
                No booking history available.
              </div>
            ) : (
              <div className="customer-table-wrapper">
                <table className="customer-details-table">
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <strong>#{booking.id}</strong>
                        </td>

                        <td>
                          {booking.serviceName ||
                            booking.packageName ||
                            "Service"}
                        </td>

                        <td>{booking.bookingDate || "-"}</td>

                        <td>{booking.bookingTime || "-"}</td>

                        <td>
                          <span
                            className={`customer-status ${booking.status?.toLowerCase()}`}
                          >
                            {booking.status}
                          </span>
                        </td>

                        <td>₹{booking.totalAmount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Payments */}
          <section className="customer-details-panel">
            <div className="customer-panel-header">
              <div>
                <span>FINANCIAL ACTIVITY</span>
                <h2>Payments</h2>
              </div>

              <strong>{payments.length}</strong>
            </div>

            {payments.length === 0 ? (
              <div className="customer-empty">No payments available.</div>
            ) : (
              <div className="customer-table-wrapper">
                <table className="customer-details-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Transaction ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>#{payment.id}</td>

                        <td>₹{payment.amount || 0}</td>

                        <td>{payment.paymentMethod || "-"}</td>

                        <td>{payment.transactionId || "-"}</td>

                        <td>
                          <span className="customer-status success">
                            {payment.status || "SUCCESS"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Invoices */}
          <section className="customer-details-panel">
            <div className="customer-panel-header">
              <div>
                <span>DOCUMENTS</span>
                <h2>Invoices</h2>
              </div>

              <strong>{invoices.length}</strong>
            </div>

            {invoices.length === 0 ? (
              <div className="customer-empty">No invoices available.</div>
            ) : (
              <div className="customer-table-wrapper">
                <table className="customer-details-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Booking</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Method</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <strong>{invoice.invoiceNumber}</strong>
                        </td>

                        <td>#{invoice.bookingId}</td>

                        <td>₹{invoice.totalAmount || 0}</td>

                        <td>{invoice.paymentStatus || "-"}</td>

                        <td>{invoice.paymentMethod || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Reviews */}
          <section className="customer-details-panel">
            <div className="customer-panel-header">
              <div>
                <span>CUSTOMER FEEDBACK</span>
                <h2>Reviews & Ratings</h2>
              </div>

              <strong>{reviews.length}</strong>
            </div>

            {reviews.length === 0 ? (
              <div className="customer-empty">No reviews submitted.</div>
            ) : (
              <div className="customer-review-list">
                {reviews.map((review) => (
                  <div className="customer-review-card" key={review.id}>
                    <div className="review-rating">
                      {"★".repeat(review.rating || 0)}
                      {"☆".repeat(5 - (review.rating || 0))}
                    </div>

                    <p>{review.comment || "No comment provided."}</p>

                    <small>
                      Booking #{review.bookingId || "-"}
                      {" • "}
                      {review.createdAt || ""}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminCustomerDetails;
