import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminServices.css";

function AdminServices() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "",
    vehicleType: "CAR",
    active: true,
  });

  // =========================================================
  // SERVICE NAME OPTIONS
  // =========================================================

  const serviceNameOptions = [
    {
      value: "Basic Car Wash",
      label: "Basic Car Wash",
      icon: "🚗",
    },
    {
      value: "Premium Car Wash",
      label: "Premium Car Wash",
      icon: "✨",
    },
    {
      value: "Exterior Car Wash",
      label: "Exterior Car Wash",
      icon: "🚿",
    },
    {
      value: "Interior Cleaning",
      label: "Interior Cleaning",
      icon: "🧽",
    },
    {
      value: "Car Detailing",
      label: "Car Detailing",
      icon: "💎",
    },
    {
      value: "Car Polish",
      label: "Car Polish",
      icon: "✨",
    },
    {
      value: "Ceramic Coating",
      label: "Ceramic Coating",
      icon: "🛡️",
    },
    {
      value: "Bike Wash",
      label: "Bike Wash",
      icon: "🏍️",
    },
    {
      value: "Premium Bike Wash",
      label: "Premium Bike Wash",
      icon: "⭐",
    },
    {
      value: "Bike Detailing",
      label: "Bike Detailing",
      icon: "🏍️",
    },
    {
      value: "Bike Polish",
      label: "Bike Polish",
      icon: "✨",
    },
    {
      value: "Engine Cleaning",
      label: "Engine Cleaning",
      icon: "🔧",
    },
    {
      value: "Full Vehicle Detailing",
      label: "Full Vehicle Detailing",
      icon: "🚘",
    },
    {
      value: "AC Cleaning",
      label: "AC Cleaning",
      icon: "❄️",
    },
    {
      value: "Tyre & Wheel Care",
      label: "Tyre & Wheel Care",
      icon: "🛞",
    },
  ];

  // =========================================================
  // AUTH CHECK
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadServices();
  }, [navigate]);

  // =========================================================
  // LOAD SERVICES
  // =========================================================

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/services/admin/all");

      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Services loading error:", err);

      handleAuthError(err);

      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setError("Unable to load services. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // AUTH ERROR
  // =========================================================

  const handleAuthError = (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("autoglow_token");

      localStorage.removeItem("autoglow_role");

      navigate("/login");

      return true;
    }

    return false;
  };

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      durationMinutes: "",
      vehicleType: "CAR",
      active: true,
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddForm = () => {
    setError("");
    setMessage("");

    setEditingId(null);

    setFormData({
      name: "",
      description: "",
      price: "",
      durationMinutes: "",
      vehicleType: "CAR",
      active: true,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!formData.name) {
      setError("Please select a service name.");

      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Please enter a valid service price.");

      return;
    }

    if (!formData.durationMinutes || Number(formData.durationMinutes) <= 0) {
      setError("Please enter a valid service duration.");

      return;
    }

    try {
      setSaving(true);

      const serviceData = {
        name: formData.name,

        description: formData.description.trim(),

        price: Number(formData.price),

        durationMinutes: Number(formData.durationMinutes),

        vehicleType: formData.vehicleType,

        active: formData.active,
      };

      // -----------------------------------------
      // UPDATE
      // -----------------------------------------

      if (editingId) {
        await api.put(`/services/admin/${editingId}`, serviceData);

        setMessage("Service updated successfully.");
      }

      // -----------------------------------------
      // CREATE
      // -----------------------------------------
      else {
        await api.post("/services/admin", serviceData);

        setMessage("Service created successfully.");
      }

      resetForm();

      await loadServices();
    } catch (err) {
      console.error("Service save error:", err);

      if (handleAuthError(err)) {
        return;
      }

      setError(err.response?.data?.message || "Unable to save service.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (service) => {
    setError("");
    setMessage("");

    setEditingId(service.id);

    setFormData({
      name: service.name || "",

      description: service.description || "",

      price: service.price ?? "",

      durationMinutes: service.durationMinutes ?? "",

      vehicleType: service.vehicleType || "CAR",

      active: service.active ?? true,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/services/admin/${id}`);

      setMessage("Service deleted successfully.");

      await loadServices();
    } catch (err) {
      console.error("Service delete error:", err);

      if (handleAuthError(err)) {
        return;
      }

      setError(err.response?.data?.message || "Unable to delete service.");
    }
  };

  // =========================================================
  // TOGGLE ACTIVE / INACTIVE
  // =========================================================

  const handleToggle = async (id, currentStatus) => {
    try {
      setError("");
      setMessage("");

      await api.patch(`/services/admin/${id}/toggle`);

      setMessage(
        currentStatus
          ? "Service deactivated successfully."
          : "Service activated successfully.",
      );

      await loadServices();
    } catch (err) {
      console.error("Service toggle error:", err);

      if (handleAuthError(err)) {
        return;
      }

      setError(
        err.response?.data?.message || "Unable to update service status.",
      );
    }
  };

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN");
  };

  // =========================================================
  // GET ICON
  // =========================================================

  const getServiceIcon = (serviceName) => {
    const found = serviceNameOptions.find((item) => item.value === serviceName);

    return found?.icon || "🚗";
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalServices = services.length;

  const activeServices = services.filter((service) => service.active).length;

  const inactiveServices = services.filter((service) => !service.active).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-services-page">
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <section className="admin-services-hero">
        <div className="admin-services-heading">
          <div className="admin-services-eyebrow">
            <span className="eyebrow-dot"></span>
            SERVICE MANAGEMENT
            <span className="eyebrow-line"></span>
          </div>

          <h1>AutoGlow Services</h1>

          <p>
            Manage vehicle care services, pricing, duration and availability
            from one centralized workspace.
          </p>
        </div>

        <button className="add-service-btn" onClick={openAddForm}>
          <span className="add-btn-icon">+</span>

          <span>Add New Service</span>
        </button>
      </section>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <section className="service-stat-grid">
        <div className="service-stat-card">
          <div className="service-stat-icon total">✦</div>

          <div className="service-stat-content">
            <span>TOTAL SERVICES</span>

            <strong>{totalServices}</strong>

            <small>All registered services</small>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-icon active">✓</div>

          <div className="service-stat-content">
            <span>ACTIVE SERVICES</span>

            <strong>{activeServices}</strong>

            <small>Currently available</small>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-icon inactive">◌</div>

          <div className="service-stat-content">
            <span>INACTIVE SERVICES</span>

            <strong>{inactiveServices}</strong>

            <small>Temporarily unavailable</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (
        <div className="admin-service-alert error">
          <span className="alert-icon">!</span>

          <span>{error}</span>

          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {message && (
        <div className="admin-service-alert success">
          <span className="alert-icon">✓</span>

          <span>{message}</span>

          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {/* =====================================================
          ADD / EDIT FORM
      ===================================================== */}

      {showForm && (
        <section className="service-form-card">
          <div className="service-form-top">
            <div className="form-title-area">
              <div className="form-title-icon">{editingId ? "✎" : "+"}</div>

              <div>
                <span>SERVICE CONFIGURATION</span>

                <h2>{editingId ? "Edit Service" : "Create New Service"}</h2>

                <p>
                  Configure the service details shown to AutoGlow customers.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="close-form-btn"
              onClick={resetForm}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* SERVICE NAME */}

              <div className="admin-form-group full">
                <label>
                  Service Name
                  <span>*</span>
                </label>

                <div className="select-with-icon">
                  <span className="input-leading-icon">✦</span>

                  <select
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  >
                    <option value="">Select a service</option>

                    {serviceNameOptions.map((service) => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="admin-form-group full">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe what this service includes..."
                  maxLength="1000"
                />

                <div className="field-helper">
                  Keep the description clear and customer-friendly.
                </div>
              </div>

              {/* PRICE */}

              <div className="admin-form-group">
                <label>
                  Price
                  <span>*</span>
                </label>

                <div className="input-prefix">
                  <span>₹</span>

                  <input
                    type="number"
                    name="price"
                    min="1"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="499"
                  />
                </div>
              </div>

              {/* DURATION */}

              <div className="admin-form-group">
                <label>
                  Duration
                  <span>*</span>
                </label>

                <div className="input-suffix">
                  <input
                    type="number"
                    name="durationMinutes"
                    min="1"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    placeholder="60"
                  />

                  <span>min</span>
                </div>
              </div>

              {/* VEHICLE TYPE */}

              <div className="admin-form-group">
                <label>
                  Vehicle Type
                  <span>*</span>
                </label>

                <div className="select-with-icon">
                  <span className="input-leading-icon">🚘</span>

                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                  >
                    <option value="CAR">Car</option>

                    <option value="BIKE">Bike</option>

                    <option value="SUV">SUV</option>

                    <option value="ALL">All Vehicles</option>
                  </select>
                </div>
              </div>

              {/* STATUS */}

              <div className="admin-form-group">
                <label>Service Status</label>

                <div
                  className={
                    formData.active
                      ? "premium-status-toggle active"
                      : "premium-status-toggle"
                  }
                >
                  <div>
                    <strong>{formData.active ? "Active" : "Inactive"}</strong>

                    <small>
                      {formData.active
                        ? "Visible to customers"
                        : "Hidden from customers"}
                    </small>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                    />

                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* FORM ACTIONS */}

            <div className="service-form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-service-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>{editingId ? "✓" : "+"}</span>

                    {editingId ? "Update Service" : "Create Service"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* =====================================================
          SERVICES LIST
      ===================================================== */}

      <section className="services-list-card">
        <div className="services-list-header">
          <div>
            <div className="list-eyebrow">SERVICE CATALOG</div>

            <h2>All Services</h2>

            <p>View and manage every service available in AutoGlow.</p>
          </div>

          <button
            className="refresh-services-btn"
            onClick={loadServices}
            disabled={loading}
          >
            <span
              className={loading ? "refresh-icon spinning" : "refresh-icon"}
            >
              ↻
            </span>

            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (
          <div className="admin-services-loading">
            <div className="premium-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <h3>Loading services</h3>

            <p>Fetching the latest service catalog...</p>
          </div>
        ) : services.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <div className="no-services-admin">
            <div className="empty-service-icon">🧽</div>

            <h3>No services found</h3>

            <p>Your AutoGlow service catalog is currently empty.</p>

            <button onClick={openAddForm}>+ Add Your First Service</button>
          </div>
        ) : (
          /* =================================================
             TABLE
          ================================================= */

          <div className="services-table-wrapper">
            <table className="services-table">
              <thead>
                <tr>
                  <th>SERVICE</th>

                  <th>VEHICLE</th>

                  <th>PRICE</th>

                  <th>DURATION</th>

                  <th>STATUS</th>

                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    {/* SERVICE */}

                    <td>
                      <div className="service-name-cell">
                        <div className="service-icon-box">
                          {getServiceIcon(service.name)}
                        </div>

                        <div className="service-name-content">
                          <strong>{service.name}</strong>

                          <small>
                            {service.description || "No description available"}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* VEHICLE */}

                    <td>
                      <span
                        className={`vehicle-badge ${String(
                          service.vehicleType || "ALL",
                        ).toLowerCase()}`}
                      >
                        <span>
                          {service.vehicleType === "BIKE"
                            ? "🏍️"
                            : service.vehicleType === "SUV"
                              ? "🚙"
                              : service.vehicleType === "ALL"
                                ? "🚘"
                                : "🚗"}
                        </span>

                        {service.vehicleType || "ALL"}
                      </span>
                    </td>

                    {/* PRICE */}

                    <td>
                      <div className="price-cell">
                        <span className="price-currency">₹</span>

                        <strong>{formatPrice(service.price)}</strong>
                      </div>
                    </td>

                    {/* DURATION */}

                    <td>
                      <div className="duration-cell">
                        <span>◷</span>

                        {service.durationMinutes
                          ? `${service.durationMinutes} min`
                          : "-"}
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <button
                        type="button"
                        className={
                          service.active
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                        onClick={() => handleToggle(service.id, service.active)}
                      >
                        <span className="status-dot"></span>

                        {service.active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="service-actions">
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => handleEdit(service)}
                        >
                          <span>✎</span>
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDelete(service.id)}
                        >
                          <span>♲</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminServices;
