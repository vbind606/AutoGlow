import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./VehicleDetails.css";

function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "CUSTOMER") {
      navigate("/login");
      return;
    }

    loadVehicle();
  }, [id, navigate]);

  const loadVehicle = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/customer/vehicles/${id}`);

      setVehicle(response.data);
    } catch (error) {
      console.error("Failed to load vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = () => {
    const type = vehicle?.vehicleType?.toLowerCase();

    if (type === "bike" || type === "motorcycle") {
      return "🏍️";
    }

    return "🚗";
  };

  if (loading) {
    return (
      <div className="vehicle-details-loading">
        <div className="vehicle-details-spinner"></div>
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vehicle-not-found">
        <div className="not-found-icon">🚗</div>
        <h2>Vehicle not found</h2>
        <p>We could not find the vehicle you are looking for.</p>

        <Link to="/customer/vehicles" className="back-vehicles-button">
          Back to My Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="vehicle-details-page">
      {/* Sidebar */}
      <aside className="vehicle-details-sidebar">
        <div className="vehicle-details-logo">
          <div className="vehicle-details-logo-icon">A</div>

          <div>
            <strong>AutoGlow</strong>
            <span>Vehicle Care</span>
          </div>
        </div>

        <div className="vehicle-details-label">CUSTOMER</div>

        <nav className="vehicle-details-nav">
          <Link to="/customer/dashboard" className="vehicle-details-nav-link">
            <span>▦</span>
            Dashboard
          </Link>

          <Link
            to="/customer/vehicles"
            className="vehicle-details-nav-link active"
          >
            <span>🚗</span>
            My Vehicles
          </Link>

          <Link to="/customer/book" className="vehicle-details-nav-link">
            <span>＋</span>
            Book Service
          </Link>

          <Link to="/customer/bookings" className="vehicle-details-nav-link">
            <span>▤</span>
            My Bookings
          </Link>

          <Link
            to="/customer/service-tracking"
            className="vehicle-details-nav-link"
          >
            <span>◉</span>
            Service Tracking
          </Link>

          <Link to="/customer/history" className="vehicle-details-nav-link">
            <span>◷</span>
            Service History
          </Link>
        </nav>

        <div className="vehicle-details-sidebar-bottom">
          <Link to="/customer/profile" className="vehicle-details-bottom-link">
            <span>◯</span>
            Profile
          </Link>

          <Link
            to="/customer/notifications"
            className="vehicle-details-bottom-link"
          >
            <span>♢</span>
            Notifications
          </Link>

          <Link to="/customer/settings" className="vehicle-details-bottom-link">
            <span>⚙</span>
            Settings
          </Link>

          <button
            className="vehicle-details-logout"
            onClick={() => {
              localStorage.removeItem("autoglow_token");
              localStorage.removeItem("autoglow_role");
              navigate("/login");
            }}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="vehicle-details-main">
        {/* Topbar */}
        <header className="vehicle-details-topbar">
          <div className="vehicle-details-breadcrumb">
            My Vehicles
            <span>/</span>
            <strong>Vehicle Details</strong>
          </div>

          <div className="vehicle-details-user-area">
            <Link
              to="/customer/notifications"
              className="vehicle-details-notification"
            >
              ♢<span></span>
            </Link>

            <Link to="/customer/profile" className="vehicle-details-profile">
              <div className="vehicle-details-avatar">U</div>

              <div className="vehicle-details-user-info">
                <strong>Customer</strong>
                <small>Vehicle Owner</small>
              </div>

              <b>⌄</b>
            </Link>
          </div>
        </header>

        {/* Content */}
        <section className="vehicle-details-content">
          <Link to="/customer/vehicles" className="vehicle-back-link">
            ← Back to My Vehicles
          </Link>

          {/* Hero */}
          <div className="vehicle-hero">
            <div className="vehicle-hero-visual">
              <div className="vehicle-hero-circle">{getVehicleIcon()}</div>

              <div className="vehicle-hero-glow"></div>
            </div>

            <div className="vehicle-hero-info">
              <span className="vehicle-hero-label">
                {vehicle.vehicleType || "VEHICLE"}
              </span>

              <h1>
                {vehicle.brand || "My Vehicle"} {vehicle.model || ""}
              </h1>

              <div className="vehicle-registration">
                {vehicle.registrationNumber ||
                  "Registration number not available"}
              </div>

              <p>
                Your vehicle profile is managed by AutoGlow. View service
                information and keep your vehicle ready for its next
                professional care session.
              </p>

              <div className="vehicle-hero-actions">
                <Link
                  to={`/customer/book?vehicleId=${vehicle.id}`}
                  className="vehicle-primary-action"
                >
                  Book Service
                  <span>→</span>
                </Link>

                <Link
                  to={`/customer/inspection?vehicleId=${vehicle.id}`}
                  className="vehicle-secondary-action"
                >
                  AI Inspection
                </Link>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="vehicle-details-grid">
            {/* Vehicle Information */}
            <div className="vehicle-information-card">
              <div className="details-card-heading">
                <div>
                  <span>VEHICLE PROFILE</span>
                  <h2>Vehicle Information</h2>
                </div>

                <div className="details-card-icon">🚗</div>
              </div>

              <div className="vehicle-info-grid">
                <div className="vehicle-info-item">
                  <span>Brand</span>
                  <strong>{vehicle.brand || "—"}</strong>
                </div>

                <div className="vehicle-info-item">
                  <span>Model</span>
                  <strong>{vehicle.model || "—"}</strong>
                </div>

                <div className="vehicle-info-item">
                  <span>Vehicle Type</span>
                  <strong>{vehicle.vehicleType || "—"}</strong>
                </div>

                <div className="vehicle-info-item">
                  <span>Registration Number</span>
                  <strong>{vehicle.registrationNumber || "—"}</strong>
                </div>

                <div className="vehicle-info-item">
                  <span>Manufacturing Year</span>
                  <strong>{vehicle.year || "—"}</strong>
                </div>

                <div className="vehicle-info-item">
                  <span>Color</span>
                  <strong>{vehicle.color || "—"}</strong>
                </div>
              </div>
            </div>

            {/* Service Summary */}
            <div className="vehicle-service-card">
              <div className="details-card-heading">
                <div>
                  <span>SERVICE OVERVIEW</span>
                  <h2>Service Summary</h2>
                </div>

                <div className="details-card-icon purple">🛠</div>
              </div>

              <div className="service-summary-list">
                <div className="service-summary-row">
                  <div className="service-summary-icon">✓</div>

                  <div>
                    <strong>Vehicle Registered</strong>
                    <span>AutoGlow garage</span>
                  </div>
                </div>

                <div className="service-summary-row">
                  <div className="service-summary-icon blue">✦</div>

                  <div>
                    <strong>AI Inspection</strong>
                    <span>Ready for inspection</span>
                  </div>
                </div>

                <div className="service-summary-row">
                  <div className="service-summary-icon orange">◷</div>

                  <div>
                    <strong>Service History</strong>
                    <span>View previous services</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/customer/history?vehicleId=${vehicle.id}`}
                className="service-history-button"
              >
                View Service History
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* AI Banner */}
          <div className="vehicle-ai-banner">
            <div className="vehicle-ai-content">
              <span className="vehicle-ai-label">AUTOGLOW AI</span>

              <h2>Get an intelligent health check for your vehicle.</h2>

              <p>
                Upload vehicle images and let AutoGlow AI analyze visible
                scratches, dents, paint damage and other exterior issues.
              </p>

              <Link
                to={`/customer/inspection?vehicleId=${vehicle.id}`}
                className="vehicle-ai-button"
              >
                Start AI Inspection
                <span>→</span>
              </Link>
            </div>

            <div className="vehicle-ai-visual">
              <div className="ai-ring ring-one"></div>
              <div className="ai-ring ring-two"></div>
              <div className="ai-center">✦</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default VehicleDetails;
