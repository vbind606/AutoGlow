import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminWorkers.css";

const SPECIALIZATIONS = [
  { value: "CAR_WASH", label: "Car Wash" },
  { value: "BIKE_WASH", label: "Bike Wash" },
  { value: "DETAILING", label: "Detailing" },
  { value: "POLISHING", label: "Polishing" },
  { value: "INTERIOR_CLEANING", label: "Interior Cleaning" },
  { value: "GENERAL", label: "General" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  password: "",
};

function AdminWorkers() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================
     AUTH + INITIAL LOAD
  ========================= */

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadWorkers();
  }, [navigate]);

  /* =========================
     LOAD WORKERS
  ========================= */

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/workers");

      setWorkers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Workers loading error:", err);

      setError(
        err.response?.data?.message ||
          "Workers load nahi ho paaye. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FORM HANDLING
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const startAddMode = () => {
    resetForm();
    setMessage("");
    setError("");
  };

  /* =========================
     VALIDATION
  ========================= */

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Worker name required hai.");
      return false;
    }

    if (!form.email.trim()) {
      setError("Worker email required hai.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
      setError("Please valid email address enter karo.");
      return false;
    }

    if (form.phone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

      if (!phoneRegex.test(form.phone.trim())) {
        setError("Please valid phone number enter karo.");
        return false;
      }
    }

    /*
     * Password is required only while ADDING a worker.
     * During EDIT, blank password means:
     * "Keep existing password unchanged."
     */

    if (!editingId && !form.password.trim()) {
      setError("Worker login password required hai.");
      return false;
    }

    if (!editingId && form.password.length < 6) {
      setError("Password minimum 6 characters ka hona chahiye.");
      return false;
    }

    return true;
  };

  /* =========================
     ADD / UPDATE WORKER
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        specialization: form.specialization,
      };

      /*
       * Password is sent when:
       * 1. Adding a new worker
       * 2. Editing worker and admin entered a new password
       */

      if (form.password.trim()) {
        payload.password = form.password;
      }

      if (editingId) {
        await api.put(`/admin/workers/${editingId}`, payload);

        setMessage("Worker successfully updated.");
      } else {
        await api.post("/admin/workers", payload);

        setMessage(
          "New worker successfully added. Worker can now login using the email and password.",
        );
      }

      resetForm();

      await loadWorkers();
    } catch (err) {
      console.error("Worker save error:", err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Worker save nahi ho paaya.";

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : "Worker save nahi ho paaya.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (worker) => {
    setMessage("");
    setError("");

    setEditingId(worker.id);

    /*
     * Existing password is NEVER loaded into frontend.
     * Admin can optionally enter a new password.
     */

    setForm({
      name: worker.name || "",
      email: worker.email || "",
      phone: worker.phone || "",
      specialization: worker.specialization || "",
      password: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (worker) => {
    const confirmDelete = window.confirm(
      `Delete worker "${worker.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(worker.id);
      setMessage("");
      setError("");

      await api.delete(`/admin/workers/${worker.id}`);

      if (editingId === worker.id) {
        resetForm();
      }

      setMessage("Worker deleted successfully.");

      await loadWorkers();
    } catch (err) {
      console.error("Worker delete error:", err);

      setError(err.response?.data?.message || "Worker delete nahi ho paaya.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================
     ACTIVE / INACTIVE
  ========================= */

  const handleToggle = async (worker) => {
    try {
      setTogglingId(worker.id);
      setMessage("");
      setError("");

      await api.patch(`/admin/workers/${worker.id}/toggle`);

      setMessage(
        worker.active
          ? `${worker.name} marked as inactive.`
          : `${worker.name} is now active.`,
      );

      await loadWorkers();
    } catch (err) {
      console.error("Worker toggle error:", err);

      setError(
        err.response?.data?.message || "Worker status update nahi ho paaya.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  /* =========================
     HELPERS
  ========================= */

  const getSpecializationLabel = (value) => {
    const item = SPECIALIZATIONS.find(
      (specialization) => specialization.value === value,
    );

    return item?.label || value || "General";
  };

  const getInitials = (name) => {
    if (!name) return "W";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  /* =========================
     STATS
  ========================= */

  const totalWorkers = workers.length;

  const activeWorkers = workers.filter((worker) => worker.active).length;

  const inactiveWorkers = workers.filter((worker) => !worker.active).length;

  /* =========================
     FILTERING
  ========================= */

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workers.filter((worker) => {
      const matchesSearch =
        !query ||
        worker.name?.toLowerCase().includes(query) ||
        worker.email?.toLowerCase().includes(query) ||
        worker.phone?.toLowerCase().includes(query) ||
        String(worker.id).includes(query);

      const matchesSpecialization =
        specializationFilter === "ALL" ||
        worker.specialization === specializationFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && worker.active) ||
        (statusFilter === "INACTIVE" && !worker.active);

      return matchesSearch && matchesSpecialization && matchesStatus;
    });
  }, [workers, search, specializationFilter, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setSpecializationFilter("ALL");
    setStatusFilter("ALL");
  };

  const hasFilters =
    search || specializationFilter !== "ALL" || statusFilter !== "ALL";

  /* =========================
     UI
  ========================= */

  return (
    <div className="admin-workers-page">
      {/* =================================
          HEADER
      ================================= */}

      <section className="workers-topbar">
        <div className="workers-title-area">
          <div className="workers-eyebrow">
            <span className="eyebrow-dot"></span>
            STAFF MANAGEMENT
          </div>

          <h1>Workers</h1>

          <p>
            Manage your AutoGlow service team, availability and specializations
            from one place.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="header-refresh-btn"
            onClick={loadWorkers}
            disabled={loading}
          >
            <span className={loading ? "spin" : ""}>↻</span>
            Refresh
          </button>

          <button className="header-add-btn" onClick={startAddMode}>
            <span>＋</span>
            Add Worker
          </button>
        </div>
      </section>

      {/* =================================
          ALERTS
      ================================= */}

      {message && (
        <div className="workers-alert success-alert">
          <span className="alert-icon">✓</span>

          <div>
            <strong>Success</strong>
            <p>{message}</p>
          </div>

          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {error && (
        <div className="workers-alert error-alert">
          <span className="alert-icon">!</span>

          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>

          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* =================================
          STATS
      ================================= */}

      <section className="worker-stats-grid">
        <div className="worker-stat-card total-card">
          <div className="stat-icon">👥</div>

          <div className="stat-content">
            <span>Total Workers</span>
            <strong>{totalWorkers}</strong>
            <small>Registered team members</small>
          </div>
        </div>

        <div className="worker-stat-card active-card">
          <div className="stat-icon">✓</div>

          <div className="stat-content">
            <span>Active Workers</span>
            <strong>{activeWorkers}</strong>
            <small>Currently available</small>
          </div>
        </div>

        <div className="worker-stat-card inactive-card">
          <div className="stat-icon">⏸</div>

          <div className="stat-content">
            <span>Inactive Workers</span>
            <strong>{inactiveWorkers}</strong>
            <small>Currently unavailable</small>
          </div>
        </div>

        <div className="worker-stat-card availability-card">
          <div className="stat-icon">◉</div>

          <div className="stat-content">
            <span>Availability</span>

            <strong>
              {totalWorkers
                ? Math.round((activeWorkers / totalWorkers) * 100)
                : 0}
              %
            </strong>

            <small>Team availability rate</small>
          </div>
        </div>
      </section>

      {/* =================================
          MAIN CONTENT
      ================================= */}

      <section className="workers-management-grid">
        {/* =================================
            FORM
        ================================= */}

        <div className="worker-form-card">
          <div className="form-card-header">
            <div className="form-header-icon">{editingId ? "✎" : "＋"}</div>

            <div>
              <span>{editingId ? "WORKER PROFILE" : "TEAM ONBOARDING"}</span>

              <h2>{editingId ? "Edit Worker" : "Add New Worker"}</h2>
            </div>
          </div>

          {editingId && (
            <div className="editing-banner">
              <span>✎</span>

              <div>
                <strong>Editing Worker #{editingId}</strong>

                <small>Update worker information below.</small>
              </div>

              <button onClick={resetForm}>Cancel</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* =================================
                PERSONAL INFORMATION
            ================================= */}

            <div className="form-section-title">
              <span>01</span>
              Personal Information
            </div>

            {/* NAME */}

            <div className="form-group">
              <label>
                Worker Name <b>*</b>
              </label>

              <div className="input-wrapper">
                <span>👤</span>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label>
                Email Address <b>*</b>
              </label>

              <div className="input-wrapper">
                <span>✉</span>

                <input
                  type="email"
                  name="email"
                  placeholder="worker@autoglow.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* PHONE */}

            <div className="form-group">
              <label>Phone Number</label>

              <div className="input-wrapper">
                <span>☎</span>

                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* =================================
                LOGIN INFORMATION
            ================================= */}

            <div className="form-section-title login-title">
              <span>02</span>
              Login Information
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <label>Login Password {!editingId && <b>*</b>}</label>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  type="password"
                  name="password"
                  placeholder={
                    editingId
                      ? "Enter new password (optional)"
                      : "Enter worker login password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              <small className="form-field-hint">
                {editingId
                  ? "Leave blank to keep the current password."
                  : "Worker will use this password with their email to login."}
              </small>
            </div>

            {/* =================================
                PROFESSIONAL DETAILS
            ================================= */}

            <div className="form-section-title specialization-title">
              <span>03</span>
              Professional Details
            </div>

            {/* SPECIALIZATION */}

            <div className="form-group">
              <label>Primary Specialization</label>

              <div className="input-wrapper select-wrapper">
                <span>⚙</span>

                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                >
                  <option value="">Select specialization</option>

                  {SPECIALIZATIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* INFO */}

            <div className="form-info-box">
              <span>ⓘ</span>

              <p>
                Assign a specialization to help identify the worker's primary
                service expertise.
              </p>
            </div>

            {/* LOGIN INFO */}

            {!editingId && (
              <div className="form-info-box login-info-box">
                <span>🔐</span>

                <p>
                  This email and password will be used by the worker to login to
                  the AutoGlow Worker Dashboard.
                </p>
              </div>
            )}

            {/* ACTIONS */}

            <div className="worker-form-actions">
              <button
                type="submit"
                className="worker-submit-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>{editingId ? "✓ Update Worker" : "＋ Add Worker"}</>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="worker-cancel-btn"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* =================================
            WORKERS LIST
        ================================= */}

        <div className="workers-list-card">
          <div className="workers-list-header">
            <div>
              <span className="list-eyebrow">TEAM DIRECTORY</span>

              <h2>All Workers</h2>

              <p>
                {filteredWorkers.length} of {workers.length} workers displayed
              </p>
            </div>

            <div className="team-mini-count">
              <strong>{activeWorkers}</strong>
              <span>active now</span>
            </div>
          </div>

          {/* =================================
              FILTER BAR
          ================================= */}

          <div className="worker-filter-bar">
            <div className="worker-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button onClick={() => setSearch("")} className="clear-search">
                  ×
                </button>
              )}
            </div>

            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            >
              <option value="ALL">All Specializations</option>

              {SPECIALIZATIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>

              <option value="ACTIVE">Active</option>

              <option value="INACTIVE">Inactive</option>
            </select>

            {hasFilters && (
              <button className="reset-filter-btn" onClick={clearFilters}>
                Reset
              </button>
            )}
          </div>

          {/* =================================
              TABLE
          ================================= */}

          {loading ? (
            <div className="workers-loading-state">
              {[1, 2, 3, 4].map((item) => (
                <div className="worker-skeleton-row" key={item}>
                  <div className="skeleton avatar-skeleton"></div>

                  <div className="skeleton text-skeleton"></div>

                  <div className="skeleton text-skeleton small"></div>

                  <div className="skeleton badge-skeleton"></div>

                  <div className="skeleton action-skeleton"></div>
                </div>
              ))}
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="workers-empty-state">
              <div className="empty-worker-icon">
                {workers.length === 0 ? "👨‍🔧" : "⌕"}
              </div>

              <h3>
                {workers.length === 0 ? "No Workers Added" : "No Workers Found"}
              </h3>

              <p>
                {workers.length === 0
                  ? "Start building your service team by adding your first worker."
                  : "Try changing your search or filter criteria."}
              </p>

              {workers.length === 0 ? (
                <button className="empty-add-btn" onClick={startAddMode}>
                  ＋ Add First Worker
                </button>
              ) : (
                <button className="empty-add-btn" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="workers-table-wrapper">
              <table className="workers-table">
                <thead>
                  <tr>
                    <th>WORKER</th>
                    <th>CONTACT</th>
                    <th>SPECIALIZATION</th>
                    <th>STATUS</th>
                    <th className="actions-header">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id}>
                      {/* WORKER */}

                      <td>
                        <div className="worker-name-cell">
                          <div className="worker-avatar">
                            {getInitials(worker.name)}
                          </div>

                          <div className="worker-primary-info">
                            <strong>{worker.name || "Unnamed Worker"}</strong>

                            <small>Worker #{worker.id}</small>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}

                      <td>
                        <div className="contact-cell">
                          <div className="contact-item">
                            <span>✉</span>

                            <strong>{worker.email || "No email"}</strong>
                          </div>

                          <div className="contact-item muted">
                            <span>☎</span>

                            <small>{worker.phone || "No phone"}</small>
                          </div>
                        </div>
                      </td>

                      {/* SPECIALIZATION */}

                      <td>
                        <span
                          className={`specialization-badge ${
                            worker.specialization
                              ?.toLowerCase()
                              .replace(/_/g, "-") || "general"
                          }`}
                        >
                          <span className="specialization-dot"></span>

                          {getSpecializationLabel(worker.specialization)}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <button
                          className={`worker-status ${
                            worker.active ? "status-active" : "status-inactive"
                          }`}
                          onClick={() => handleToggle(worker)}
                          disabled={togglingId === worker.id}
                          title="Click to change status"
                        >
                          <span className="status-dot"></span>

                          {togglingId === worker.id
                            ? "Updating..."
                            : worker.active
                              ? "Active"
                              : "Inactive"}
                        </button>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="worker-actions">
                          <button
                            className="table-action edit-action"
                            onClick={() => handleEdit(worker)}
                            title="Edit worker"
                          >
                            <span>✎</span>
                            Edit
                          </button>

                          <button
                            className="table-action delete-action"
                            onClick={() => handleDelete(worker)}
                            disabled={deletingId === worker.id}
                            title="Delete worker"
                          >
                            {deletingId === worker.id ? (
                              <span className="mini-spinner"></span>
                            ) : (
                              <span>⌫</span>
                            )}
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
        </div>
      </section>
    </div>
  );
}

export default AdminWorkers;
