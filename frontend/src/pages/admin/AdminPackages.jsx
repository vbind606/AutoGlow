import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminPackages.css";

function AdminPackages() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [editingId, setEditingId] = useState(null);

  // =========================================================
  // PACKAGE NAME OPTIONS
  // =========================================================

  const packageNameOptions = [
    "Basic Care Package",
    "Premium Care Package",
    "Complete Care Package",
    "Interior Care Package",
    "Exterior Care Package",
    "Detailing Package",
    "Ceramic Protection Package",
    "Luxury Care Package",
    "Bike Basic Package",
    "Bike Premium Package",
    "Bike Detailing Package",
    "Full Vehicle Care Package",
  ];

  // =========================================================
  // VEHICLE TYPE OPTIONS
  // =========================================================

  const vehicleTypeOptions = [
    {
      value: "ALL",
      label: "✦ All Vehicles",
    },
    {
      value: "CAR",
      label: "🚗 Car",
    },
    {
      value: "BIKE",
      label: "🏍 Bike",
    },
    {
      value: "SUV",
      label: "🚙 SUV",
    },
  ];

  // =========================================================
  // FORM
  // =========================================================

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "",
    vehicleType: "ALL",
    serviceId: "",
    active: true,
  });

  // =========================================================
  // AUTH CHECK + INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    console.log("Admin Packages Auth:", {
      tokenExists: !!token,
      role: role,
    });

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (role !== "ADMIN") {
      navigate("/login", { replace: true });
      return;
    }

    loadPackages();
    loadServices();
  }, [navigate]);

  // =========================================================
  // LOAD PACKAGES
  // =========================================================

  const loadPackages = async () => {
    try {
      setLoading(true);

      const response = await api.get("/packages/admin/all");

      setPackages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Admin Packages Load Error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login", { replace: true });
        return;
      }

      showMessage(
        error.response?.data?.message || "Packages load nahi ho paaye.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD SERVICES
  // =========================================================

  const loadServices = async () => {
    try {
      setServicesLoading(true);

      const response = await api.get("/services/admin/all");

      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Admin Services Load Error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login", { replace: true });
        return;
      }

      showMessage(
        error.response?.data?.message || "Services load nahi ho paaye.",
        "error",
      );
    } finally {
      setServicesLoading(false);
    }
  };

  // =========================================================
  // MESSAGE
  // =========================================================

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3500);
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      durationMinutes: "",
      vehicleType: "ALL",
      serviceId: "",
      active: true,
    });

    setEditingId(null);
  };

  // =========================================================
  // CREATE / UPDATE PACKAGE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      showMessage("Package name select karo.", "error");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      showMessage("Valid price enter karo.", "error");
      return;
    }

    if (!form.vehicleType) {
      showMessage("Vehicle type select karo.", "error");
      return;
    }

    if (!form.serviceId) {
      showMessage("Service name select karo.", "error");
      return;
    }

    try {
      const packageData = {
        name: form.name,
        description: form.description.trim(),
        price: Number(form.price),

        durationMinutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : null,

        vehicleType: form.vehicleType,

        serviceId: form.serviceId ? Number(form.serviceId) : null,

        active: Boolean(form.active),
      };

      console.log("Package Data:", packageData);

      // =====================================================
      // UPDATE
      // =====================================================

      if (editingId) {
        await api.put(`/packages/admin/${editingId}`, packageData);

        showMessage("Package successfully updated.");
      }

      // =====================================================
      // CREATE
      // =====================================================
      else {
        await api.post("/packages/admin", packageData);

        showMessage("Package successfully created.");
      }

      resetForm();

      await loadPackages();
    } catch (error) {
      console.error("Package Save Error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login", { replace: true });
        return;
      }

      showMessage(
        error.response?.data?.message || "Package save nahi ho paaya.",
        "error",
      );
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (pkg) => {
    setEditingId(pkg.id);

    setForm({
      name: pkg.name || "",
      description: pkg.description || "",
      price: pkg.price ?? "",
      durationMinutes: pkg.durationMinutes ?? "",
      vehicleType: pkg.vehicleType || "ALL",
      serviceId: pkg.serviceId ?? "",
      active: pkg.active ?? true,
    });

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
      "Kya aap ye package permanently delete karna chahte ho?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/packages/admin/${id}`);

      showMessage("Package deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await loadPackages();
    } catch (error) {
      console.error("Package Delete Error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login", { replace: true });
        return;
      }

      showMessage(
        error.response?.data?.message || "Package delete nahi ho paaya.",
        "error",
      );
    }
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleToggle = async (id) => {
    try {
      await api.patch(`/packages/admin/${id}/toggle`);

      showMessage("Package status updated.");

      await loadPackages();
    } catch (error) {
      console.error("Package Toggle Error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login", { replace: true });
        return;
      }

      showMessage(
        error.response?.data?.message || "Package status update nahi ho paaya.",
        "error",
      );
    }
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalPackages = packages.length;

  const activePackages = packages.filter((pkg) => pkg.active).length;

  const inactivePackages = totalPackages - activePackages;

  const totalPackageValue = packages.reduce(
    (sum, pkg) => sum + Number(pkg.price || 0),
    0,
  );

  // =========================================================
  // SERVICE NAME HELPER
  // =========================================================

  const getServiceName = (pkg) => {
    if (pkg.serviceName) {
      return pkg.serviceName;
    }

    const service = services.find(
      (item) => Number(item.id) === Number(pkg.serviceId),
    );

    return service?.name || "No Service";
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="admin-packages-page">
      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <header className="packages-topbar">
        <div className="brand-area">
          <div className="brand-logo">AG</div>

          <div>
            <h2>AutoGlow</h2>
            <span>ADMIN CONTROL CENTER</span>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className="dashboard-top-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>

            <div className="admin-profile-text">
              <strong>Administrator</strong>

              <span>Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="packages-page-header">
        <div className="header-left">
          <button
            className="back-dashboard-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span>←</span>
            Dashboard
          </button>

          <div className="breadcrumb">
            <span>Admin</span>

            <b>/</b>

            <span>Service Management</span>

            <b>/</b>

            <strong>Packages</strong>
          </div>

          <div className="page-heading">
            <div className="heading-icon">✦</div>

            <div>
              <p className="eyebrow">SERVICE MANAGEMENT</p>

              <h1>Service Packages</h1>

              <p>
                Create, customize and manage premium AutoGlow service packages.
              </p>
            </div>
          </div>
        </div>

        <div className="header-decoration">
          <div className="glow-circle glow-one"></div>

          <div className="glow-circle glow-two"></div>

          <div className="header-car-icon">🚘</div>
        </div>
      </section>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <div
          className={`package-message ${
            messageType === "error" ? "message-error" : "message-success"
          }`}
        >
          <span className="message-icon">
            {messageType === "error" ? "!" : "✓"}
          </span>

          <span>{message}</span>

          <button
            onClick={() => {
              setMessage("");
              setMessageType("");
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="package-stat-grid">
        <div className="package-stat-card">
          <div className="stat-icon blue">📦</div>

          <div className="stat-content">
            <span>Total Packages</span>

            <strong>{totalPackages}</strong>

            <small>All service packages</small>
          </div>
        </div>

        <div className="package-stat-card">
          <div className="stat-icon green">✓</div>

          <div className="stat-content">
            <span>Active Packages</span>

            <strong>{activePackages}</strong>

            <small>Currently available</small>
          </div>
        </div>

        <div className="package-stat-card">
          <div className="stat-icon orange">◐</div>

          <div className="stat-content">
            <span>Inactive Packages</span>

            <strong>{inactivePackages}</strong>

            <small>Temporarily disabled</small>
          </div>
        </div>

        <div className="package-stat-card">
          <div className="stat-icon purple">₹</div>

          <div className="stat-content">
            <span>Package Value</span>

            <strong>₹{totalPackageValue.toLocaleString("en-IN")}</strong>

            <small>Combined package pricing</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          CREATE / EDIT FORM
      ===================================================== */}

      <section className="package-form-card">
        <div className="section-header">
          <div className="section-title-area">
            <div className="section-icon">{editingId ? "✎" : "+"}</div>

            <div>
              <span className="section-label">PACKAGE CONFIGURATION</span>

              <h2>
                {editingId ? "Edit Service Package" : "Create New Package"}
              </h2>

              <p>
                {editingId
                  ? "Update the selected package details."
                  : "Add a new premium package to AutoGlow services."}
              </p>
            </div>
          </div>

          {editingId && (
            <div className="editing-badge">
              <span>●</span>
              Editing Package #{editingId}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="package-form">
          <div className="form-grid">
            {/* =================================================
                PACKAGE NAME DROPDOWN
            ================================================= */}

            <div className="form-field">
              <label>
                Package Name
                <span>*</span>
              </label>

              <div className="select-wrapper">
                <select name="name" value={form.name} onChange={handleChange}>
                  <option value="">Select Package</option>

                  {packageNameOptions.map((packageName) => (
                    <option key={packageName} value={packageName}>
                      {packageName}
                    </option>
                  ))}
                </select>

                <span className="select-arrow">▼</span>
              </div>

              <small className="field-note">
                Select a predefined AutoGlow package.
              </small>
            </div>

            {/* =================================================
                PRICE
            ================================================= */}

            <div className="form-field">
              <label>
                Package Price
                <span>*</span>
              </label>

              <div className="input-wrapper">
                <span className="currency-icon">₹</span>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="1499"
                  min="1"
                />
              </div>
            </div>

            {/* =================================================
                DURATION
            ================================================= */}

            <div className="form-field">
              <label>Service Duration</label>

              <div className="input-wrapper">
                <span className="input-icon">◷</span>

                <input
                  type="number"
                  name="durationMinutes"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  placeholder="120"
                  min="0"
                />

                <span className="input-suffix">min</span>
              </div>
            </div>

            {/* =================================================
                VEHICLE TYPE DROPDOWN
            ================================================= */}

            <div className="form-field">
              <label>
                Vehicle Type
                <span>*</span>
              </label>

              <div className="select-wrapper">
                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                >
                  {vehicleTypeOptions.map((vehicle) => (
                    <option key={vehicle.value} value={vehicle.value}>
                      {vehicle.label}
                    </option>
                  ))}
                </select>

                <span className="select-arrow">▼</span>
              </div>

              <small className="field-note">
                Choose which vehicle category this package supports.
              </small>
            </div>

            {/* =================================================
                SERVICE NAME DROPDOWN
            ================================================= */}

            <div className="form-field">
              <label>
                Service Name
                <span>*</span>
              </label>

              <div className="select-wrapper">
                <select
                  name="serviceId"
                  value={form.serviceId}
                  onChange={handleChange}
                  disabled={servicesLoading}
                >
                  <option value="">
                    {servicesLoading ? "Loading services..." : "Select Service"}
                  </option>

                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>

                <span className="select-arrow">▼</span>
              </div>

              <small className="field-note">
                Package ko existing service se connect karo.
              </small>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="form-field full-width">
              <label>Package Description</label>

              <div className="textarea-wrapper">
                <span className="textarea-icon">≡</span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Package ke andar kya kya milega..."
                  rows="4"
                  maxLength="1000"
                />
              </div>

              <div className="field-helper">
                <span>
                  {form.description.length}
                  /1000
                </span>

                <span>Clearly describe package benefits</span>
              </div>
            </div>
          </div>

          {/* =================================================
              ACTIVE CONTROL
          ================================================= */}

          <div className="form-bottom">
            <label className="premium-switch">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />

              <span className="switch-slider"></span>

              <span className="switch-content">
                <strong>Package Active</strong>

                <small>Customers can book this package</small>
              </span>
            </label>

            <div className="form-actions">
              {editingId && (
                <button
                  type="button"
                  className="cancel-package-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

              <button type="submit" className="save-package-btn">
                <span>{editingId ? "✓" : "+"}</span>

                {editingId ? "Update Package" : "Create Package"}

                <b>→</b>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* =====================================================
          PACKAGE LIST
      ===================================================== */}

      <section className="packages-list-card">
        <div className="list-header">
          <div>
            <span className="section-label">PACKAGE CATALOG</span>

            <h2>All Service Packages</h2>

            <p>Manage pricing, availability and package configurations.</p>
          </div>

          <button
            className="refresh-btn"
            onClick={loadPackages}
            disabled={loading}
          >
            <span className={loading ? "refresh-spin" : ""}>↻</span>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="loading-spinner"></div>

            <h3>Loading Packages</h3>

            <p>Fetching latest package data...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="empty-box">
            <div className="empty-icon">📦</div>

            <h3>No Packages Found</h3>

            <p>Create your first AutoGlow service package above.</p>

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              + Create Package
            </button>
          </div>
        ) : (
          <div className="packages-table-wrapper">
            <table className="packages-table">
              <thead>
                <tr>
                  <th>PACKAGE</th>

                  <th>SERVICE</th>

                  <th>VEHICLE</th>

                  <th>PRICE</th>

                  <th>DURATION</th>

                  <th>STATUS</th>

                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id}>
                    {/* PACKAGE */}

                    <td>
                      <div className="package-info">
                        <div className="package-mini-icon">✦</div>

                        <div>
                          <div className="package-name">{pkg.name}</div>

                          <div className="package-description">
                            {pkg.description || "No description available"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SERVICE */}

                    <td>
                      <span className="service-badge">
                        {getServiceName(pkg)}
                      </span>
                    </td>

                    {/* VEHICLE */}

                    <td>
                      <span
                        className={`vehicle-badge ${String(
                          pkg.vehicleType || "ALL",
                        ).toLowerCase()}`}
                      >
                        {pkg.vehicleType === "CAR"
                          ? "🚗 CAR"
                          : pkg.vehicleType === "BIKE"
                            ? "🏍 BIKE"
                            : pkg.vehicleType === "SUV"
                              ? "🚙 SUV"
                              : "✦ ALL"}
                      </span>
                    </td>

                    {/* PRICE */}

                    <td>
                      <div className="price-cell">
                        <span>₹</span>

                        {Number(pkg.price || 0).toLocaleString("en-IN")}
                      </div>
                    </td>

                    {/* DURATION */}

                    <td>
                      <div className="duration-cell">
                        <span>◷</span>

                        {pkg.durationMinutes
                          ? `${pkg.durationMinutes} min`
                          : "Not specified"}
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <button
                        className={`status-badge ${
                          pkg.active ? "active" : "inactive"
                        }`}
                        onClick={() => handleToggle(pkg.id)}
                      >
                        <span>{pkg.active ? "✓" : "×"}</span>

                        {pkg.active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(pkg)}
                          title="Edit Package"
                        >
                          ✎<span>Edit</span>
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(pkg.id)}
                          title="Delete Package"
                        >
                          ×<span>Delete</span>
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

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="packages-footer">
        <div>
          <strong>AutoGlow</strong>

          <span>AI Powered Car & Bike Care Management System</span>
        </div>

        <span>Service Package Management</span>
      </footer>
    </div>
  );
}

export default AdminPackages;
