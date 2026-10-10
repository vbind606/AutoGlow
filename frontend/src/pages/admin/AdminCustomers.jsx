import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminCustomers.css";

function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const role = localStorage.getItem("autoglow_role");
  const token = localStorage.getItem("autoglow_token");

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadCustomers();
  }, [navigate, role, token]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/customers");

      setCustomers(response.data || []);
    } catch (err) {
      console.error("Admin Customers Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      setError(err.response?.data?.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");

    navigate("/login");
  };

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.name, customer.email, String(customer.id)]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value)),
    );
  }, [customers, search]);

  const getInitials = (name) => {
    if (!name) {
      return "C";
    }

    return name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const goTo = (path) => {
    navigate(path);
  };

  // =========================================================
  // VIEW CUSTOMER DETAILS
  // =========================================================

  const handleViewCustomer = (customerId) => {
    navigate(`/admin/customers/${customerId}/details`);
  };

  return (
    <div className="admin-dashboard">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">A</div>

          <div>
            <h2>AutoGlow</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-nav">
          {/* MAIN MENU */}

          <div className="admin-nav-section">
            <p>MAIN MENU</p>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/dashboard")}
            >
              <span>▦</span>
              Dashboard
            </button>

            <button
              type="button"
              className="admin-nav-item active"
              onClick={() => goTo("/admin/customers")}
            >
              <span>♙</span>
              Customers
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/vehicles")}
            >
              <span>🚗</span>
              Vehicles
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/bookings")}
            >
              <span>▣</span>
              Bookings
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/services")}
            >
              <span>✦</span>
              Services
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/packages")}
            >
              <span>▤</span>
              Packages
            </button>
          </div>

          {/* MANAGEMENT */}

          <div className="admin-nav-section">
            <p>MANAGEMENT</p>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/workers")}
            >
              <span>♟</span>
              Workers
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/payments")}
            >
              <span>₹</span>
              Payments
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/invoices")}
            >
              <span>▤</span>
              Invoices
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/coupons")}
            >
              <span>％</span>
              Coupons
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/reviews")}
            >
              <span>★</span>
              Reviews
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/gallery")}
            >
              <span>▧</span>
              Gallery
            </button>
          </div>

          {/* ANALYTICS */}

          <div className="admin-nav-section">
            <p>ANALYTICS</p>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/reports")}
            >
              <span>◫</span>
              Reports
            </button>

            <button
              type="button"
              className="admin-nav-item"
              onClick={() => goTo("/admin/ai-inspection")}
            >
              <span>✧</span>
              AI Inspection
            </button>
          </div>
        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="admin-sidebar-bottom">
          <button
            type="button"
            className="admin-nav-item"
            onClick={() => goTo("/admin/settings")}
          >
            <span>⚙</span>
            Settings
          </button>

          <button type="button" className="admin-logout" onClick={logout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="admin-main">
        {/* TOP BAR */}

        <header className="admin-topbar">
          <div>
            <p className="admin-page-label">CUSTOMER MANAGEMENT</p>

            <h1>Customers</h1>
          </div>

          <div className="admin-topbar-right">
            <button
              type="button"
              className="admin-notification"
              title="Notifications"
            >
              ♢<span></span>
            </button>

            <div className="admin-user">
              <div className="admin-user-avatar">A</div>

              <div>
                <strong>Administrator</strong>
                <small>Super Admin</small>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================
            PAGE INTRO
        ===================================================== */}

        <section className="customers-intro">
          <div>
            <span>REGISTERED USERS</span>

            <h2>Customer Directory</h2>

            <p>Manage and view all customers registered with AutoGlow.</p>
          </div>

          <div className="customers-total">
            <span>Total Customers</span>

            <strong>{loading ? "..." : customers.length}</strong>
          </div>
        </section>

        {/* =====================================================
            CUSTOMER PANEL
        ===================================================== */}

        <section className="customers-panel">
          <div className="customers-toolbar">
            <div>
              <span className="customers-section-label">CUSTOMER LIST</span>

              <h2>All Customers</h2>
            </div>

            <div className="customers-toolbar-right">
              {/* SEARCH */}

              <div className="customers-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* REFRESH */}

              <button
                type="button"
                className="customers-refresh"
                onClick={loadCustomers}
                title="Refresh"
              >
                ↻
              </button>
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="customers-state">
              <div className="customers-state-icon">⏳</div>

              <h3>Loading customers...</h3>

              <p>Fetching customer information.</p>
            </div>
          ) : error ? (
            /* =================================================
               ERROR
            ================================================= */

            <div className="customers-state error">
              <div className="customers-state-icon">!</div>

              <h3>Unable to load customers</h3>

              <p>{error}</p>

              <button type="button" onClick={loadCustomers}>
                Try Again
              </button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================= */

            <div className="customers-state">
              <div className="customers-state-icon">♙</div>

              <h3>{search ? "No customers found" : "No customers yet"}</h3>

              <p>
                {search
                  ? "Try a different search term."
                  : "Registered customers will appear here."}
              </p>
            </div>
          ) : (
            /* =================================================
               CUSTOMER TABLE
            ================================================= */

            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>EMAIL</th>
                    <th>CUSTOMER ID</th>
                    <th>ROLE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      {/* CUSTOMER */}

                      <td>
                        <div className="customer-profile">
                          <div className="customer-avatar">
                            {getInitials(customer.name)}
                          </div>

                          <div>
                            <strong>
                              {customer.name || "Unnamed Customer"}
                            </strong>

                            <small>AutoGlow Customer</small>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td>
                        <span className="customer-email">
                          {customer.email || "-"}
                        </span>
                      </td>

                      {/* CUSTOMER ID */}

                      <td>
                        <span className="customer-id">#{customer.id}</span>
                      </td>

                      {/* ROLE */}

                      <td>
                        <span className="customer-role">
                          {customer.role || "CUSTOMER"}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <button
                          type="button"
                          className="customer-view-btn"
                          onClick={() => handleViewCustomer(customer.id)}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =====================================================
            FOOTER INFO
        ===================================================== */}

        {!loading && !error && customers.length > 0 && (
          <div className="customers-footer">
            <span>
              Showing <strong>{filteredCustomers.length}</strong> of{" "}
              <strong>{customers.length}</strong> customers
            </span>

            <span>AutoGlow Customer Management</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminCustomers;
