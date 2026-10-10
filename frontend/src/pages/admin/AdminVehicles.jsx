import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminVehicles.css";

function AdminVehicles() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadVehicles();
  }, [navigate]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/vehicles");

      setVehicles(response.data);
    } catch (err) {
      console.error("Failed to load vehicles:", err);

      if (err.response?.status === 403) {
        setError("You are not authorized to access admin vehicles.");
      } else {
        setError("Failed to load vehicles. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");
    navigate("/login");
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/admin/customers/${customerId}/details`);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchText = search.toLowerCase();

    return (
      String(vehicle.id || "")
        .toLowerCase()
        .includes(searchText) ||
      String(vehicle.customerName || "")
        .toLowerCase()
        .includes(searchText) ||
      String(vehicle.customerEmail || "")
        .toLowerCase()
        .includes(searchText) ||
      String(vehicle.vehicleType || "")
        .toLowerCase()
        .includes(searchText) ||
      String(vehicle.brand || "")
        .toLowerCase()
        .includes(searchText) ||
      String(vehicle.model || "")
        .toLowerCase()
        .includes(searchText) ||
      String(vehicle.registrationNumber || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div className="admin-vehicles-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="admin-vehicles-sidebar">
        <div className="admin-vehicles-brand">
          <div className="admin-vehicles-logo">AG</div>

          <div>
            <h2>AutoGlow</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-vehicles-nav">
          <button onClick={() => navigate("/admin/dashboard")}>
            <span>▣</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/admin/customers")}>
            <span>♙</span>
            Customers
          </button>

          <button className="active">
            <span>🚗</span>
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
            <span>▦</span>
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
            <span>%</span>
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
            <span>◔</span>
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

        <button className="admin-vehicles-logout" onClick={handleLogout}>
          ⇥ Logout
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="admin-vehicles-main">
        <header className="admin-vehicles-header">
          <div>
            <p className="admin-vehicles-eyebrow">ADMINISTRATION</p>

            <h1>Vehicles</h1>

            <p>Manage and monitor all customer vehicles.</p>
          </div>

          <button className="admin-vehicles-refresh" onClick={loadVehicles}>
            ↻ Refresh
          </button>
        </header>

        {/* ================= STATS ================= */}
        <section className="admin-vehicles-stats">
          <div className="admin-vehicle-stat-card">
            <span className="stat-icon">🚗</span>

            <div>
              <p>Total Vehicles</p>
              <h2>{vehicles.length}</h2>
            </div>
          </div>

          <div className="admin-vehicle-stat-card">
            <span className="stat-icon">👤</span>

            <div>
              <p>Registered Customers</p>
              <h2>
                {new Set(vehicles.map((vehicle) => vehicle.customerId)).size}
              </h2>
            </div>
          </div>

          <div className="admin-vehicle-stat-card">
            <span className="stat-icon">🚘</span>

            <div>
              <p>Cars</p>
              <h2>
                {
                  vehicles.filter(
                    (vehicle) => vehicle.vehicleType?.toLowerCase() === "car",
                  ).length
                }
              </h2>
            </div>
          </div>

          <div className="admin-vehicle-stat-card">
            <span className="stat-icon">🏍️</span>

            <div>
              <p>Bikes</p>
              <h2>
                {
                  vehicles.filter(
                    (vehicle) => vehicle.vehicleType?.toLowerCase() === "bike",
                  ).length
                }
              </h2>
            </div>
          </div>
        </section>

        {/* ================= TABLE CARD ================= */}
        <section className="admin-vehicles-card">
          <div className="admin-vehicles-card-header">
            <div>
              <h2>All Vehicles</h2>

              <p>
                {filteredVehicles.length} vehicle
                {filteredVehicles.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="admin-vehicles-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search vehicle, customer, registration..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="admin-vehicles-state">
              <div className="admin-vehicles-loader"></div>
              <p>Loading vehicles...</p>
            </div>
          )}

          {!loading && error && (
            <div className="admin-vehicles-state error-state">
              <div className="error-icon">!</div>

              <h3>Unable to load vehicles</h3>

              <p>{error}</p>

              <button onClick={loadVehicles}>Try Again</button>
            </div>
          )}

          {!loading && !error && filteredVehicles.length === 0 && (
            <div className="admin-vehicles-state">
              <div className="empty-icon">🚗</div>

              <h3>{search ? "No vehicles found" : "No vehicles available"}</h3>

              <p>
                {search
                  ? "Try a different search term."
                  : "Customer vehicles will appear here."}
              </p>
            </div>
          )}

          {!loading && !error && filteredVehicles.length > 0 && (
            <div className="admin-vehicles-table-wrapper">
              <table className="admin-vehicles-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Registration</th>
                    <th>Year</th>
                    <th>Color</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>
                        <span className="vehicle-id">#{vehicle.id}</span>
                      </td>

                      <td>
                        <div className="vehicle-customer">
                          <div className="customer-avatar">
                            {vehicle.customerName?.charAt(0)?.toUpperCase() ||
                              "C"}
                          </div>

                          <div>
                            <strong>{vehicle.customerName || "Unknown"}</strong>

                            <span>{vehicle.customerEmail || "-"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="vehicle-info">
                          <div className="vehicle-icon">
                            {vehicle.vehicleType?.toLowerCase() === "bike"
                              ? "🏍️"
                              : "🚗"}
                          </div>

                          <div>
                            <strong>
                              {vehicle.brand} {vehicle.model}
                            </strong>

                            <span>{vehicle.vehicleType || "-"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="registration-number">
                          {vehicle.registrationNumber || "-"}
                        </span>
                      </td>

                      <td>{vehicle.year || "-"}</td>

                      <td>
                        <span className="vehicle-color">
                          <span className="color-dot"></span>
                          {vehicle.color || "-"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="vehicle-view-btn"
                          onClick={() => handleViewCustomer(vehicle.customerId)}
                        >
                          View Customer →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminVehicles;
