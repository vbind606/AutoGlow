import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./MyVehicles.css";

function MyVehicles() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const emptyForm = {
    vehicleType: "CAR",
    brand: "",
    model: "",
    registrationNumber: "",
    year: "",
    color: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "CUSTOMER") {
      navigate("/login");
      return;
    }

    loadVehicles();
  }, [navigate]);

  const loadVehicles = async () => {
    try {
      const response = await api.get("/customer/vehicles");
      setVehicles(response.data || []);
    } catch (error) {
      console.error("Vehicle loading error:", error);
      setMessage("Unable to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ADD / UPDATE VEHICLE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const vehicleData = {
      vehicleType: form.vehicleType,
      brand: form.brand,
      model: form.model,
      registrationNumber: form.registrationNumber.toUpperCase(),
      year: form.year ? Number(form.year) : null,
      color: form.color,
    };

    try {
      if (editingId) {
        await api.put(`/customer/vehicles/${editingId}`, vehicleData);

        setMessage("Vehicle updated successfully.");
      } else {
        await api.post("/customer/vehicles", vehicleData);

        setMessage("Vehicle added successfully.");
      }

      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);

      await loadVehicles();
    } catch (error) {
      console.error("Vehicle save error:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to save vehicle.",
      );
    }
  };

  // EDIT VEHICLE
  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);

    setForm({
      vehicleType: vehicle.vehicleType || "CAR",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      registrationNumber: vehicle.registrationNumber || "",
      year: vehicle.year || "",
      color: vehicle.color || "",
    });

    setShowForm(true);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // CANCEL FORM
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  };

  // DELETE VEHICLE
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this vehicle?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/customer/vehicles/${id}`);

      setMessage("Vehicle removed successfully.");

      await loadVehicles();
    } catch (error) {
      console.error("Vehicle delete error:", error);

      setMessage("Unable to delete vehicle.");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");

    navigate("/login");
  };

  return (
    <div className="vehicles-page">
      {/* ================= SIDEBAR ================= */}

      <aside className="vehicles-sidebar">
        <div className="vehicles-logo">
          <div className="vehicles-logo-icon">A</div>

          <div className="vehicles-logo-text">
            <span>Auto</span>Glow
          </div>
        </div>

        <div className="vehicles-menu-label">CUSTOMER MENU</div>

        <nav className="vehicles-nav">
          <Link to="/customer/dashboard" className="vehicles-nav-link">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link to="/customer/vehicles" className="vehicles-nav-link active">
            <span>🚗</span>
            My Vehicles
          </Link>

          <Link to="/customer/book" className="vehicles-nav-link">
            <span>＋</span>
            Book Service
          </Link>

          <Link to="/customer/bookings" className="vehicles-nav-link">
            <span>▣</span>
            My Bookings
          </Link>

          <Link to="/customer/tracking" className="vehicles-nav-link">
            <span>◉</span>
            Service Tracking
          </Link>

          <Link to="/customer/history" className="vehicles-nav-link">
            <span>↺</span>
            Service History
          </Link>

          <Link to="/customer/inspection" className="vehicles-nav-link">
            <span>✦</span>
            AI Inspection
          </Link>
        </nav>

        <div className="vehicles-sidebar-bottom">
          <Link to="/customer/profile" className="vehicles-nav-link">
            <span>◎</span>
            Profile
          </Link>

          <Link to="/customer/settings" className="vehicles-nav-link">
            <span>⚙</span>
            Settings
          </Link>

          <button className="vehicles-logout" onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="vehicles-main">
        {/* TOPBAR */}

        <header className="vehicles-topbar">
          <div>
            <p>Customer / My Vehicles</p>
          </div>

          <div className="vehicles-user">
            <div className="vehicles-avatar">C</div>

            <div>
              <strong>Customer</strong>

              <span>Customer</span>
            </div>
          </div>
        </header>

        <section className="vehicles-content">
          {/* ================= PAGE HEADER ================= */}

          <div className="vehicles-heading">
            <div>
              <span className="vehicles-eyebrow">VEHICLE MANAGEMENT</span>

              <h1>My Vehicles</h1>

              <p>
                Add and manage the vehicles you want to service with AutoGlow.
              </p>
            </div>

            <button
              className="add-vehicle-button"
              onClick={() => {
                if (showForm) {
                  handleCancelForm();
                } else {
                  setEditingId(null);
                  setForm(emptyForm);
                  setShowForm(true);
                  setMessage("");
                }
              }}
            >
              <span>{showForm ? "×" : "+"}</span>

              {showForm ? "Close Form" : "Add Vehicle"}
            </button>
          </div>

          {/* ================= MESSAGE ================= */}

          {message && <div className="vehicles-message">{message}</div>}

          {/* ================= ADD / UPDATE FORM ================= */}

          {showForm && (
            <section className="vehicle-form-card">
              <div className="vehicle-form-header">
                <div>
                  <span>{editingId ? "UPDATE VEHICLE" : "NEW VEHICLE"}</span>

                  <h2>
                    {editingId ? "Update your vehicle" : "Add your vehicle"}
                  </h2>
                </div>

                <button type="button" onClick={handleCancelForm}>
                  ×
                </button>
              </div>

              <form className="vehicle-form" onSubmit={handleSubmit}>
                <div className="vehicle-field">
                  <label>Vehicle Type</label>

                  <select
                    name="vehicleType"
                    value={form.vehicleType}
                    onChange={handleChange}
                    required
                  >
                    <option value="CAR">Car</option>

                    <option value="BIKE">Bike</option>
                  </select>
                </div>

                <div className="vehicle-field">
                  <label>Brand</label>

                  <input
                    type="text"
                    name="brand"
                    placeholder="e.g. Toyota"
                    value={form.brand}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="vehicle-field">
                  <label>Model</label>

                  <input
                    type="text"
                    name="model"
                    placeholder="e.g. Fortuner"
                    value={form.model}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="vehicle-field">
                  <label>Registration Number</label>

                  <input
                    type="text"
                    name="registrationNumber"
                    placeholder="e.g. DL01AB1234"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="vehicle-field">
                  <label>Year</label>

                  <input
                    type="number"
                    name="year"
                    placeholder="e.g. 2024"
                    value={form.year}
                    onChange={handleChange}
                    min="1900"
                    max="2100"
                  />
                </div>

                <div className="vehicle-field">
                  <label>Color</label>

                  <input
                    type="text"
                    name="color"
                    placeholder="e.g. White"
                    value={form.color}
                    onChange={handleChange}
                  />
                </div>

                <div className="vehicle-form-actions">
                  <button
                    type="button"
                    className="cancel-vehicle-button"
                    onClick={handleCancelForm}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="save-vehicle-button">
                    {editingId ? "Update Vehicle" : "Save Vehicle"}

                    <span>→</span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ================= VEHICLES ================= */}

          {loading ? (
            <div className="vehicles-loading">
              <div className="vehicle-spinner"></div>

              <p>Loading your vehicles...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <section className="vehicles-empty">
              <div className="vehicles-empty-icon">🚗</div>

              <span>YOUR GARAGE</span>

              <h2>No vehicles added yet</h2>

              <p>
                Add your first vehicle to start booking intelligent vehicle care
                services with AutoGlow.
              </p>

              <button
                className="empty-add-button"
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Add Your First Vehicle
                <span>→</span>
              </button>
            </section>
          ) : (
            <div className="vehicles-grid">
              {vehicles.map((vehicle) => (
                <article className="vehicle-card" key={vehicle.id}>
                  {/* CARD TOP */}

                  <div className="vehicle-card-top">
                    <div className="vehicle-type-icon">
                      {vehicle.vehicleType === "BIKE" ? "🏍️" : "🚗"}
                    </div>

                    <span className="vehicle-type-badge">
                      {vehicle.vehicleType}
                    </span>
                  </div>

                  {/* CARD BODY */}

                  <div className="vehicle-card-body">
                    <span className="vehicle-brand">{vehicle.brand}</span>

                    <h2>{vehicle.model}</h2>

                    <div className="vehicle-number">
                      {vehicle.registrationNumber}
                    </div>

                    <div className="vehicle-details">
                      <div>
                        <span>YEAR</span>

                        <strong>{vehicle.year || "—"}</strong>
                      </div>

                      <div>
                        <span>COLOR</span>

                        <strong>{vehicle.color || "—"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* ================= CARD FOOTER ================= */}

                  <div className="vehicle-card-footer">
                    {/* VIEW DETAILS */}

                    <Link
                      to={`/customer/vehicles/${vehicle.id}`}
                      className="vehicle-details-button"
                    >
                      View Details
                    </Link>

                    {/* EDIT */}

                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="edit-vehicle-button"
                    >
                      Edit
                    </button>

                    {/* REMOVE */}

                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="delete-vehicle-button"
                    >
                      Remove
                    </button>

                    {/* SERVICE */}

                    <Link
                      to={`/customer/book?vehicleId=${vehicle.id}`}
                      className="vehicle-service-button"
                    >
                      Service →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyVehicles;
