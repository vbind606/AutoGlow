import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./CustomerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("Customer");
  const [vehicleCount, setVehicleCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [activeServiceCount, setActiveServiceCount] = useState(0);
  const [inspectionCount, setInspectionCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "CUSTOMER") {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      /* ==========================================
         CUSTOMER DASHBOARD
      ========================================== */

      try {
        const response = await api.get("/customer/dashboard");

        if (response.data && typeof response.data === "object") {
          if (response.data.name) {
            setUserName(response.data.name);
          }
        }
      } catch (error) {
        console.log("Customer dashboard API not available yet.");
      }

      /* ==========================================
         VEHICLE COUNT
      ========================================== */

      try {
        const response = await api.get("/customer/vehicles/count");

        setVehicleCount(Number(response.data) || 0);
      } catch (error) {
        console.log("Vehicle count API error:", error);
      }

      /* ==========================================
         BOOKINGS
      ========================================== */

      try {
        const response = await api.get("/customer/bookings");

        const bookings = Array.isArray(response.data) ? response.data : [];

        setBookingCount(bookings.length);

        /* Active bookings */

        const activeStatuses = [
          "PENDING",
          "CONFIRMED",
          "ASSIGNED",
          "RECEIVED",
          "INSPECTION",
          "WASHING",
          "DRYING",
          "QUALITY_CHECK",
        ];

        const activeBookings = bookings.filter((booking) =>
          activeStatuses.includes(booking.status),
        );

        setActiveServiceCount(activeBookings.length);
      } catch (error) {
        console.log("Booking API not available yet.");
      }

      /* ==========================================
         AI INSPECTIONS
      ========================================== */

      try {
        const response = await api.get("/customer/inspections");

        const inspections = Array.isArray(response.data) ? response.data : [];

        setInspectionCount(inspections.length);
      } catch (error) {
        console.log("AI inspection API not available yet.");
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     LOGOUT
  ========================================== */

  const handleLogout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");

    navigate("/login");
  };

  /* ==========================================
     LOADING SCREEN
  ========================================== */

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>

        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">
        {/* LOGO */}

        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">A</div>

          <div className="dashboard-logo-text">
            <span>Auto</span>Glow
          </div>
        </div>

        <div className="sidebar-label">CUSTOMER MENU</div>

        {/* MAIN MENU */}

        <nav className="sidebar-nav">
          <Link to="/customer/dashboard" className="sidebar-link active">
            <span className="sidebar-icon">⌂</span>
            Dashboard
          </Link>

          <Link to="/customer/vehicles" className="sidebar-link">
            <span className="sidebar-icon">🚗</span>
            My Vehicles
          </Link>

          <Link to="/customer/book" className="sidebar-link">
            <span className="sidebar-icon">＋</span>
            Book Service
          </Link>

          <Link to="/customer/bookings" className="sidebar-link">
            <span className="sidebar-icon">▣</span>
            My Bookings
          </Link>

          <Link to="/customer/tracking" className="sidebar-link">
            <span className="sidebar-icon">◉</span>
            Service Tracking
          </Link>

          <Link to="/customer/history" className="sidebar-link">
            <span className="sidebar-icon">↺</span>
            Service History
          </Link>

          <Link to="/customer/inspection" className="sidebar-link">
            <span className="sidebar-icon">✦</span>
            AI Inspection
          </Link>

          {/* REVIEWS & RATINGS */}

          <Link to="/customer/reviews" className="sidebar-link">
            <span className="sidebar-icon">⭐</span>
            Reviews & Ratings
          </Link>
        </nav>

        {/* BOTTOM MENU */}

        <div className="sidebar-bottom">
          <Link to="/customer/profile" className="sidebar-link">
            <span className="sidebar-icon">◎</span>
            Profile
          </Link>

          <Link to="/customer/notifications" className="sidebar-link">
            <span className="sidebar-icon">♧</span>
            Notifications
          </Link>

          <Link to="/customer/settings" className="sidebar-link">
            <span className="sidebar-icon">⚙</span>
            Settings
          </Link>

          <button className="sidebar-logout" onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dashboard-main">
        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-breadcrumb">Customer / Dashboard</p>
          </div>

          <div className="dashboard-user-area">
            <Link to="/customer/notifications" className="notification-button">
              ♧<span className="notification-dot"></span>
            </Link>

            <Link to="/customer/profile" className="user-profile">
              <div className="user-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="user-info">
                <strong>{userName}</strong>

                <span>Customer</span>
              </div>

              <span className="user-arrow">⌄</span>
            </Link>
          </div>
        </header>

        {/* =================================================
            DASHBOARD CONTENT
        ================================================= */}

        <section className="dashboard-content">
          {/* =================================================
              WELCOME
          ================================================= */}

          <div className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">CUSTOMER DASHBOARD</span>

              <h1>Welcome back, {userName}.</h1>

              <p>
                Manage your vehicle care and keep every journey looking its
                best.
              </p>
            </div>

            <Link to="/customer/book" className="primary-dashboard-button">
              Book a Service
              <span>→</span>
            </Link>
          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="dashboard-stats">
            {/* VEHICLES */}

            <Link to="/customer/vehicles" className="stat-card">
              <div className="stat-icon blue">🚗</div>

              <div className="stat-details">
                <span>MY VEHICLES</span>

                <strong>{vehicleCount}</strong>

                <small>Vehicles registered</small>
              </div>
            </Link>

            {/* BOOKINGS */}

            <Link to="/customer/bookings" className="stat-card">
              <div className="stat-icon purple">▣</div>

              <div className="stat-details">
                <span>TOTAL BOOKINGS</span>

                <strong>{bookingCount}</strong>

                <small>Services booked</small>
              </div>
            </Link>

            {/* ACTIVE SERVICE */}

            <Link to="/customer/tracking" className="stat-card">
              <div className="stat-icon green">◉</div>

              <div className="stat-details">
                <span>ACTIVE SERVICE</span>

                <strong>{activeServiceCount}</strong>

                <small>Currently in progress</small>
              </div>
            </Link>

            {/* AI INSPECTION */}

            <Link to="/customer/inspection" className="stat-card">
              <div className="stat-icon orange">✦</div>

              <div className="stat-details">
                <span>AI INSPECTIONS</span>

                <strong>{inspectionCount}</strong>

                <small>Vehicle inspections</small>
              </div>
            </Link>
          </div>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="dashboard-grid">
            {/* =================================================
                UPCOMING SERVICE
            ================================================= */}

            <section className="dashboard-card upcoming-card">
              <div className="card-header">
                <div>
                  <span className="card-label">NEXT SERVICE</span>

                  <h2>Upcoming Service</h2>
                </div>

                <Link to="/customer/bookings">View all</Link>
              </div>

              <div className="empty-service">
                <div className="empty-service-icon">🚘</div>

                <h3>No upcoming service</h3>

                <p>
                  Your next vehicle service will appear here once you make a
                  booking.
                </p>

                <Link
                  to="/customer/book"
                  className="secondary-dashboard-button"
                >
                  Schedule Service
                  <span>→</span>
                </Link>
              </div>
            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section className="dashboard-card quick-card">
              <div className="card-header">
                <div>
                  <span className="card-label">SHORTCUTS</span>

                  <h2>Quick Actions</h2>
                </div>
              </div>

              <div className="quick-actions">
                {/* BOOK SERVICE */}

                <Link to="/customer/book" className="quick-action">
                  <div className="quick-action-icon">+</div>

                  <div>
                    <strong>Book Service</strong>

                    <span>Schedule vehicle care</span>
                  </div>

                  <b>→</b>
                </Link>

                {/* VEHICLES */}

                <Link to="/customer/vehicles" className="quick-action">
                  <div className="quick-action-icon">🚗</div>

                  <div>
                    <strong>Manage Vehicles</strong>

                    <span>Add or manage your vehicles</span>
                  </div>

                  <b>→</b>
                </Link>

                {/* AI INSPECTION */}

                <Link to="/customer/inspection" className="quick-action">
                  <div className="quick-action-icon ai">✦</div>

                  <div>
                    <strong>AI Inspection</strong>

                    <span>Check vehicle condition</span>
                  </div>

                  <b>→</b>
                </Link>

                {/* AI RECOMMENDATION */}

                <Link to="/customer/recommendation" className="quick-action">
                  <div className="quick-action-icon ai">✧</div>

                  <div>
                    <strong>AI Recommendation</strong>

                    <span>Get smart service suggestions</span>
                  </div>

                  <b>→</b>
                </Link>

                {/* REVIEWS & RATINGS */}

                <Link to="/customer/reviews" className="quick-action">
                  <div className="quick-action-icon">⭐</div>

                  <div>
                    <strong>Reviews & Ratings</strong>

                    <span>Rate your completed service</span>
                  </div>

                  <b>→</b>
                </Link>
              </div>
            </section>
          </div>

          {/* =================================================
              AI BANNER
          ================================================= */}

          <section className="ai-dashboard-banner">
            <div className="ai-banner-glow"></div>

            <div className="ai-banner-content">
              <span className="dashboard-eyebrow">AUTOGLOW INTELLIGENCE</span>

              <h2>Smarter care for your vehicle.</h2>

              <p>
                Use AutoGlow AI to inspect vehicle condition and get intelligent
                service recommendations based on your vehicle.
              </p>

              <div className="ai-banner-actions">
                <Link to="/customer/inspection" className="ai-banner-button">
                  AI Inspection
                  <span>→</span>
                </Link>

                <Link
                  to="/customer/recommendation"
                  className="ai-banner-button secondary"
                >
                  Recommendations
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="ai-banner-visual">
              <div className="ai-circle">
                <span>✦</span>
              </div>

              <div className="ai-orbit orbit-one"></div>

              <div className="ai-orbit orbit-two"></div>
            </div>
          </section>

          {/* =================================================
              CUSTOMER SERVICES
          ================================================= */}

          <section className="customer-feature-grid">
            {/* OFFERS */}

            <Link to="/customer/offers" className="feature-mini-card">
              <div className="feature-mini-icon">🎁</div>

              <div>
                <strong>Offers & Coupons</strong>

                <span>Save on your next service</span>
              </div>

              <b>→</b>
            </Link>

            {/* SERVICE HISTORY */}

            <Link to="/customer/history" className="feature-mini-card">
              <div className="feature-mini-icon">↺</div>

              <div>
                <strong>Service History</strong>

                <span>View your previous services</span>
              </div>

              <b>→</b>
            </Link>

            {/* PAYMENTS */}

            <Link to="/customer/payments" className="feature-mini-card">
              <div className="feature-mini-icon">₹</div>

              <div>
                <strong>Payments</strong>

                <span>Manage your payments</span>
              </div>

              <b>→</b>
            </Link>

            {/* AI ASSISTANT */}

            <Link to="/customer/chatbot" className="feature-mini-card">
              <div className="feature-mini-icon ai">✦</div>

              <div>
                <strong>AI Assistant</strong>

                <span>Get instant AutoGlow help</span>
              </div>

              <b>→</b>
            </Link>

            {/* REVIEWS & RATINGS */}

            <Link to="/customer/reviews" className="feature-mini-card">
              <div className="feature-mini-icon">⭐</div>

              <div>
                <strong>Reviews & Ratings</strong>

                <span>Share your service experience</span>
              </div>

              <b>→</b>
            </Link>
          </section>
        </section>
      </main>
    </div>
  );
}

export default CustomerDashboard;
