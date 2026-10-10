import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminCoupons.css";

function AdminCoupons() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [discountFilter, setDiscountFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    active: true,
  });

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

    loadCoupons();
  }, [navigate]);

  // =========================================================
  // LOAD COUPONS
  // =========================================================

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/coupons");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.coupons || response.data?.data || [];

      setCoupons(data);
    } catch (err) {
      console.error("Admin coupons loading error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load coupons. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORM RESET
  // =========================================================

  const resetForm = () => {
    setForm({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderAmount: "",
      maxDiscount: "",
      validFrom: "",
      validUntil: "",
      usageLimit: "",
      active: true,
    });
  };

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingCoupon(null);
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType === "FIXED" ? "FIXED" : "PERCENTAGE",

      discountValue: coupon.discountValue ?? "",

      minOrderAmount: coupon.minOrderAmount ?? "",

      maxDiscount: coupon.maxDiscount ?? "",

      validFrom: convertDateTimeForInput(coupon.validFrom),

      validUntil: convertDateTimeForInput(coupon.validUntil),

      usageLimit: coupon.usageLimit ?? "",

      active: coupon.active !== false,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCoupon(null);
    resetForm();
  };

  // =========================================================
  // DATE CONVERTER
  // =========================================================

  const convertDateTimeForInput = (value) => {
    if (!value) return "";

    try {
      return value.substring(0, 16);
    } catch {
      return "";
    }
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // CLIENT SIDE VALIDATION
  // =========================================================

  const validateForm = () => {
    const code = form.code.trim();

    if (!code) {
      return "Coupon code is required.";
    }

    if (code.length > 50) {
      return "Coupon code cannot exceed 50 characters.";
    }

    if (!form.discountValue) {
      return "Discount value is required.";
    }

    const discountValue = Number(form.discountValue);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return "Discount value must be greater than 0.";
    }

    if (form.discountType === "PERCENTAGE" && discountValue > 100) {
      return "Percentage discount cannot exceed 100%.";
    }

    if (form.minOrderAmount !== "" && Number(form.minOrderAmount) < 0) {
      return "Minimum order amount cannot be negative.";
    }

    if (form.maxDiscount !== "" && Number(form.maxDiscount) < 0) {
      return "Maximum discount cannot be negative.";
    }

    if (form.usageLimit !== "" && Number(form.usageLimit) < 1) {
      return "Usage limit must be at least 1.";
    }

    if (
      form.validFrom &&
      form.validUntil &&
      new Date(form.validUntil) < new Date(form.validFrom)
    ) {
      return "Valid until must be after valid from.";
    }

    if (editingCoupon) {
      const usedCount = Number(editingCoupon.usedCount || 0);

      if (form.usageLimit !== "" && Number(form.usageLimit) < usedCount) {
        return `Usage limit cannot be less than current usage (${usedCount}).`;
      }
    }

    return "";
  };

  // =========================================================
  // SAVE COUPON
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),

      description: form.description.trim() || null,

      discountType: form.discountType,

      discountValue: Number(form.discountValue),

      minOrderAmount:
        form.minOrderAmount === "" ? null : Number(form.minOrderAmount),

      maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),

      validFrom: form.validFrom ? form.validFrom + ":00" : null,

      validUntil: form.validUntil ? form.validUntil + ":00" : null,

      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),

      active: form.active,
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, payload);

        setSuccess("Coupon updated successfully.");
      } else {
        await api.post("/admin/coupons", payload);

        setSuccess("Coupon created successfully.");
      }

      await loadCoupons();

      setTimeout(() => {
        setShowModal(false);
        setEditingCoupon(null);
        resetForm();
      }, 500);
    } catch (err) {
      console.error("Coupon save error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to save coupon.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE COUPON
  // =========================================================

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete coupon "${coupon.code}"?`,
    );

    if (!confirmed) return;

    try {
      setActionId(coupon.id);
      setError("");
      setSuccess("");

      await api.delete(`/admin/coupons/${coupon.id}`);

      setCoupons((previous) =>
        previous.filter((item) => item.id !== coupon.id),
      );

      setSuccess(`Coupon ${coupon.code} deleted successfully.`);
    } catch (err) {
      console.error("Coupon delete error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to delete coupon.",
      );
    } finally {
      setActionId(null);
    }
  };

  // =========================================================
  // TOGGLE ACTIVE
  // =========================================================

  const handleToggle = async (coupon) => {
    try {
      setActionId(coupon.id);
      setError("");
      setSuccess("");

      const response = await api.patch(`/admin/coupons/${coupon.id}/toggle`);

      const updatedCoupon = response.data;

      setCoupons((previous) =>
        previous.map((item) => (item.id === coupon.id ? updatedCoupon : item)),
      );

      setSuccess(
        `${coupon.code} is now ${
          updatedCoupon.active ? "Active" : "Inactive"
        }.`,
      );
    } catch (err) {
      console.error("Coupon toggle error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to change coupon status.",
      );
    } finally {
      setActionId(null);
    }
  };

  // =========================================================
  // FILTERED COUPONS
  // =========================================================

  const filteredCoupons = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        !searchText ||
        String(coupon.code || "")
          .toLowerCase()
          .includes(searchText) ||
        String(coupon.description || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && coupon.active === true) ||
        (statusFilter === "INACTIVE" && coupon.active === false);

      const matchesDiscount =
        discountFilter === "ALL" ||
        String(coupon.discountType || "").toUpperCase() === discountFilter;

      return matchesSearch && matchesStatus && matchesDiscount;
    });
  }, [coupons, search, statusFilter, discountFilter]);

  // =========================================================
  // STATS
  // =========================================================

  const totalCoupons = coupons.length;

  const activeCoupons = coupons.filter(
    (coupon) => coupon.active === true,
  ).length;

  const inactiveCoupons = coupons.filter(
    (coupon) => coupon.active === false,
  ).length;

  const percentageCoupons = coupons.filter(
    (coupon) =>
      String(coupon.discountType || "").toUpperCase() === "PERCENTAGE",
  ).length;

  // =========================================================
  // FORMAT DISCOUNT
  // =========================================================

  const formatDiscount = (coupon) => {
    const value = Number(coupon.discountValue || 0);

    const type = String(coupon.discountType || "").toUpperCase();

    if (type === "PERCENTAGE") {
      return `${value}% OFF`;
    }

    return `₹${value.toLocaleString("en-IN")} OFF`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) return "No expiry";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  // =========================================================
  // CHECK EXPIRY
  // =========================================================

  const isExpired = (coupon) => {
    if (!coupon.validUntil) return false;

    const expiry = new Date(coupon.validUntil);

    return expiry < new Date();
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const goTo = (path) => {
    navigate(path);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");
    navigate("/login");
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="admin-coupons-page">
        <aside className="coupon-sidebar">
          <div className="coupon-brand">
            <div className="coupon-brand-mark">AG</div>

            <div>
              <h2>AutoGlow</h2>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          <div className="coupon-sidebar-loading">Loading...</div>
        </aside>

        <main className="coupon-main">
          <div className="coupon-loading-card">
            <div className="coupon-spinner"></div>

            <h2>Loading Coupons</h2>

            <p>Fetching your promotional campaigns...</p>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="admin-coupons-page">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="coupon-sidebar">
        <div>
          {/* BRAND */}

          <div className="coupon-brand">
            <div className="coupon-brand-mark">AG</div>

            <div>
              <h2>AutoGlow</h2>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          {/* NAVIGATION */}

          <nav className="coupon-nav">
            <button onClick={() => goTo("/admin/dashboard")}>
              <span>▣</span>
              Dashboard
            </button>

            <button onClick={() => goTo("/admin/customers")}>
              <span>♙</span>
              Customers
            </button>

            <button onClick={() => goTo("/admin/vehicles")}>
              <span>▰</span>
              Vehicles
            </button>

            <button onClick={() => goTo("/admin/bookings")}>
              <span>▤</span>
              Bookings
            </button>

            <button onClick={() => goTo("/admin/services")}>
              <span>⚙</span>
              Services
            </button>

            <button onClick={() => goTo("/admin/packages")}>
              <span>◈</span>
              Packages
            </button>

            <button onClick={() => goTo("/admin/workers")}>
              <span>♟</span>
              Workers
            </button>

            <button onClick={() => goTo("/admin/payments")}>
              <span>₹</span>
              Payments
            </button>

            <button onClick={() => goTo("/admin/invoices")}>
              <span>▧</span>
              Invoices
            </button>

            <button className="active" onClick={() => goTo("/admin/coupons")}>
              <span>％</span>
              Coupons
            </button>

            <button onClick={() => goTo("/admin/reviews")}>
              <span>★</span>
              Reviews
            </button>

            <button onClick={() => goTo("/admin/gallery")}>
              <span>▧</span>
              Gallery
            </button>

            <button onClick={() => goTo("/admin/reports")}>
              <span>◫</span>
              Reports
            </button>

            <button onClick={() => goTo("/admin/ai-inspection")}>
              <span>✦</span>
              AI Inspection
            </button>

            <button onClick={() => goTo("/admin/settings")}>
              <span>⚙</span>
              Settings
            </button>
          </nav>
        </div>

        {/* LOGOUT */}

        <button className="coupon-logout" onClick={logout}>
          <span>↪</span>
          Logout
        </button>
      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="coupon-main">
        {/* HEADER */}

        <header className="coupon-header">
          <div>
            <div className="coupon-breadcrumb">Admin / Coupons</div>

            <h1>
              Coupons
              <span> & Promotions</span>
            </h1>

            <p>Create, manage and monitor your promotional offers.</p>
          </div>

          <button className="coupon-create-btn" onClick={openCreateModal}>
            <span>＋</span>
            Create Coupon
          </button>
        </header>

        {/* =================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="coupon-alert coupon-alert-error">
            <span>!</span>

            <div>
              <strong>Action failed</strong>
              <p>{error}</p>
            </div>

            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {success && (
          <div className="coupon-alert coupon-alert-success">
            <span>✓</span>

            <div>
              <strong>Success</strong>
              <p>{success}</p>
            </div>

            <button onClick={() => setSuccess("")}>×</button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================== */}

        <section className="coupon-stats-grid">
          <div className="coupon-stat-card">
            <div className="coupon-stat-icon purple">%</div>

            <div>
              <span>Total Coupons</span>
              <strong>{totalCoupons}</strong>
            </div>
          </div>

          <div className="coupon-stat-card">
            <div className="coupon-stat-icon green">✓</div>

            <div>
              <span>Active</span>
              <strong>{activeCoupons}</strong>
            </div>
          </div>

          <div className="coupon-stat-card">
            <div className="coupon-stat-icon orange">◌</div>

            <div>
              <span>Inactive</span>
              <strong>{inactiveCoupons}</strong>
            </div>
          </div>

          <div className="coupon-stat-card">
            <div className="coupon-stat-icon blue">%</div>

            <div>
              <span>Percentage Offers</span>
              <strong>{percentageCoupons}</strong>
            </div>
          </div>
        </section>

        {/* =================================================
            TOOLBAR
        ================================================== */}

        <section className="coupon-toolbar">
          <div className="coupon-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search coupon code or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && <button onClick={() => setSearch("")}>×</button>}
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All Status</option>

            <option value="ACTIVE">Active</option>

            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={discountFilter}
            onChange={(event) => setDiscountFilter(event.target.value)}
          >
            <option value="ALL">All Discounts</option>

            <option value="PERCENTAGE">Percentage</option>

            <option value="FIXED">Fixed Amount</option>
          </select>

          <button
            className="coupon-refresh-btn"
            onClick={loadCoupons}
            title="Refresh"
          >
            ↻
          </button>
        </section>

        {/* =================================================
            TABLE CARD
        ================================================== */}

        <section className="coupon-table-card">
          <div className="coupon-table-heading">
            <div>
              <h2>All Coupons</h2>

              <span>
                Showing {filteredCoupons.length} of {coupons.length} coupons
              </span>
            </div>

            <div className="coupon-result-badge">
              {filteredCoupons.length} Results
            </div>
          </div>

          {filteredCoupons.length === 0 ? (
            <div className="coupon-empty">
              <div className="coupon-empty-icon">%</div>

              <h3>No coupons found</h3>

              <p>
                {coupons.length === 0
                  ? "Create your first promotional coupon to get started."
                  : "Try changing your search or filters."}
              </p>

              {coupons.length === 0 && (
                <button onClick={openCreateModal}>Create First Coupon</button>
              )}
            </div>
          ) : (
            <div className="coupon-table-wrapper">
              <table className="coupon-table">
                <thead>
                  <tr>
                    <th>COUPON</th>
                    <th>DISCOUNT</th>
                    <th>MIN ORDER</th>
                    <th>VALIDITY</th>
                    <th>USAGE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCoupons.map((coupon) => {
                    const expired = isExpired(coupon);

                    const usedCount = Number(coupon.usedCount || 0);

                    const usageLimit = coupon.usageLimit;

                    return (
                      <tr key={coupon.id}>
                        {/* COUPON */}

                        <td>
                          <div className="coupon-code-cell">
                            <div className="coupon-ticket">%</div>

                            <div>
                              <strong>{coupon.code}</strong>

                              <span>
                                {coupon.description || "No description"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* DISCOUNT */}

                        <td>
                          <div className="coupon-discount">
                            {formatDiscount(coupon)}

                            <small>
                              {coupon.discountType === "PERCENTAGE"
                                ? "Percentage offer"
                                : "Flat discount"}
                            </small>
                          </div>
                        </td>

                        {/* MIN ORDER */}

                        <td>
                          {coupon.minOrderAmount != null ? (
                            <span className="coupon-money">
                              ₹
                              {Number(coupon.minOrderAmount).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          ) : (
                            <span className="coupon-muted">No minimum</span>
                          )}
                        </td>

                        {/* VALIDITY */}

                        <td>
                          <div className="coupon-validity">
                            <span>{formatDate(coupon.validFrom)}</span>

                            <small>to {formatDate(coupon.validUntil)}</small>

                            {expired && <em>Expired</em>}
                          </div>
                        </td>

                        {/* USAGE */}

                        <td>
                          <div className="coupon-usage">
                            <strong>
                              {usedCount}
                              {usageLimit ? ` / ${usageLimit}` : ""}
                            </strong>

                            {usageLimit && (
                              <div className="coupon-progress">
                                <span
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (usedCount / usageLimit) * 100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td>
                          <button
                            className={`coupon-status ${
                              coupon.active ? "active" : "inactive"
                            }`}
                            onClick={() => handleToggle(coupon)}
                            disabled={actionId === coupon.id}
                          >
                            <span />

                            {coupon.active ? "Active" : "Inactive"}
                          </button>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="coupon-actions">
                            <button
                              className="coupon-action edit"
                              onClick={() => openEditModal(coupon)}
                              title="Edit coupon"
                            >
                              ✎
                            </button>

                            <button
                              className="coupon-action delete"
                              onClick={() => handleDelete(coupon)}
                              disabled={actionId === coupon.id}
                              title="Delete coupon"
                            >
                              {actionId === coupon.id ? "..." : "⌫"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="coupon-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="coupon-modal">
            {/* MODAL HEADER */}

            <div className="coupon-modal-header">
              <div>
                <div className="coupon-modal-icon">%</div>

                <div>
                  <span>
                    {editingCoupon ? "UPDATE CAMPAIGN" : "NEW CAMPAIGN"}
                  </span>

                  <h2>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</h2>
                </div>
              </div>

              <button onClick={closeModal} disabled={saving}>
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <form className="coupon-form" onSubmit={handleSubmit}>
              {/* CODE + TYPE */}

              <div className="coupon-form-grid">
                <div className="coupon-field">
                  <label>
                    Coupon Code
                    <span>*</span>
                  </label>

                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. GLOW20"
                    maxLength={50}
                    autoComplete="off"
                  />

                  <small>Code will be stored in uppercase.</small>
                </div>

                <div className="coupon-field">
                  <label>
                    Discount Type
                    <span>*</span>
                  </label>

                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>

                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              {/* DISCOUNT + MIN ORDER */}

              <div className="coupon-form-grid">
                <div className="coupon-field">
                  <label>
                    Discount Value
                    <span>*</span>
                  </label>

                  <div className="coupon-input-prefix">
                    <span>
                      {form.discountType === "PERCENTAGE" ? "%" : "₹"}
                    </span>

                    <input
                      name="discountValue"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.discountValue}
                      onChange={handleChange}
                      placeholder={
                        form.discountType === "PERCENTAGE" ? "20" : "500"
                      }
                    />
                  </div>
                </div>

                <div className="coupon-field">
                  <label>Minimum Order Amount</label>

                  <div className="coupon-input-prefix">
                    <span>₹</span>

                    <input
                      name="minOrderAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minOrderAmount}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {/* MAX DISCOUNT + USAGE LIMIT */}

              <div className="coupon-form-grid">
                <div className="coupon-field">
                  <label>Maximum Discount</label>

                  <div className="coupon-input-prefix">
                    <span>₹</span>

                    <input
                      name="maxDiscount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.maxDiscount}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="coupon-field">
                  <label>Usage Limit</label>

                  <input
                    name="usageLimit"
                    type="number"
                    min="1"
                    step="1"
                    value={form.usageLimit}
                    onChange={handleChange}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              {/* DATES */}

              <div className="coupon-form-grid">
                <div className="coupon-field">
                  <label>Valid From</label>

                  <input
                    name="validFrom"
                    type="datetime-local"
                    value={form.validFrom}
                    onChange={handleChange}
                  />
                </div>

                <div className="coupon-field">
                  <label>Valid Until</label>

                  <input
                    name="validUntil"
                    type="datetime-local"
                    value={form.validUntil}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="coupon-field">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this promotional offer..."
                  rows={3}
                  maxLength={500}
                />

                <small>{form.description.length}/500</small>
              </div>

              {/* ACTIVE */}

              <label className="coupon-toggle-row">
                <div>
                  <strong>Coupon Status</strong>

                  <span>
                    Make this coupon available to customers immediately.
                  </span>
                </div>

                <div className={`coupon-switch ${form.active ? "on" : ""}`}>
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                  />

                  <span />
                </div>
              </label>

              {/* MODAL ERROR */}

              {error && (
                <div className="coupon-form-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              {/* ACTIONS */}

              <div className="coupon-modal-actions">
                <button
                  type="button"
                  className="coupon-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coupon-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="mini-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingCoupon ? "✓ Update Coupon" : "＋ Create Coupon"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;
