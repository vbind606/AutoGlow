import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./WorkerIssues.css";

const INITIAL_FORM = {
  category: "",
  severity: "",
  vehicleArea: "",
  description: "",
  estimatedCost: "",
  recommendedAction: "",
};

const CATEGORY_OPTIONS = [
  {
    value: "BODY_DAMAGE",
    label: "Body Damage",
    icon: "🚘",
  },
  {
    value: "SCRATCH",
    label: "Scratch / Paint",
    icon: "✦",
  },
  {
    value: "DENT",
    label: "Dent",
    icon: "◈",
  },
  {
    value: "GLASS",
    label: "Glass / Mirror",
    icon: "▣",
  },
  {
    value: "TYRE_WHEEL",
    label: "Tyre / Wheel",
    icon: "◉",
  },
  {
    value: "INTERIOR",
    label: "Interior",
    icon: "▤",
  },
  {
    value: "MECHANICAL",
    label: "Mechanical",
    icon: "⚙",
  },
  {
    value: "ELECTRICAL",
    label: "Electrical",
    icon: "⚡",
  },
  {
    value: "OTHER",
    label: "Other",
    icon: "•••",
  },
];

const SEVERITY_OPTIONS = [
  {
    value: "LOW",
    label: "Low",
    description: "Minor issue",
    colorClass: "low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Needs attention",
    colorClass: "medium",
  },
  {
    value: "HIGH",
    label: "High",
    description: "Important issue",
    colorClass: "high",
  },
  {
    value: "CRITICAL",
    label: "Critical",
    description: "Immediate attention",
    colorClass: "critical",
  },
];

const VEHICLE_AREAS = [
  "Front Bumper",
  "Rear Bumper",
  "Bonnet",
  "Roof",
  "Left Front Door",
  "Right Front Door",
  "Left Rear Door",
  "Right Rear Door",
  "Left Fender",
  "Right Fender",
  "Left Mirror",
  "Right Mirror",
  "Windshield",
  "Rear Glass",
  "Wheels / Tyres",
  "Interior",
  "Dashboard",
  "Seats",
  "Boot",
  "Engine Area",
  "Other",
];

function WorkerIssues() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [booking, setBooking] = useState(null);
  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
    decision
    report
    history
  */
  const [screen, setScreen] = useState("decision");

  const [hasIssue, setHasIssue] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  /* =====================================================
     LOAD BOOKING
  ===================================================== */

  const loadBooking = async () => {
    try {
      const response = await api.get("/worker/jobs");

      const jobs = Array.isArray(response.data)
        ? response.data
        : response.data?.jobs || [];

      const currentBooking = jobs.find(
        (job) => String(job.bookingId) === String(bookingId),
      );

      if (currentBooking) {
        setBooking(currentBooking);
      }
    } catch (err) {
      console.error("Failed to load booking:", err);
    }
  };

  /* =====================================================
     LOAD ISSUES
  ===================================================== */

  const loadIssues = async () => {
    try {
      const response = await api.get(`/worker/issues/${bookingId}`);

      const data = response.data;

      if (Array.isArray(data)) {
        setIssues(data);
      } else if (Array.isArray(data?.issues)) {
        setIssues(data.issues);
      } else {
        setIssues([]);
      }
    } catch (err) {
      /*
        404 means no issue history yet.
      */

      if (err.response?.status === 404) {
        setIssues([]);
        return;
      }

      console.error("Failed to load issues:", err);

      setError(err.response?.data?.message || "Unable to load issue history.");
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        await Promise.all([loadBooking(), loadIssues()]);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadData();
    }
  }, [bookingId]);

  /* =====================================================
     UPDATE FORM
  ===================================================== */

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =====================================================
     NO ISSUE
  ===================================================== */

  const handleNoIssue = () => {
    setHasIssue(false);
    setError("");

    /*
      Directly continue to checklist.
    */

    navigate(`/worker/checklist/${bookingId}`);
  };

  /* =====================================================
     YES ISSUE
  ===================================================== */

  const handleHasIssue = () => {
    setHasIssue(true);
    setScreen("report");
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     PHOTO SELECT
  ===================================================== */

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    /*
      5 MB maximum.
    */

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be less than 5 MB.");
      return;
    }

    setPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    setError("");
  };

  /* =====================================================
     REMOVE PHOTO
  ===================================================== */

  const removePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(null);
    setPhotoPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    if (!form.category) {
      return "Please select an issue category.";
    }

    if (!form.severity) {
      return "Please select issue severity.";
    }

    if (!form.vehicleArea) {
      return "Please select the vehicle area.";
    }

    if (!form.description.trim()) {
      return "Please describe the issue.";
    }

    if (form.description.trim().length < 10) {
      return "Please provide a little more detail about the issue.";
    }

    if (!form.recommendedAction.trim()) {
      return "Please add the recommended action.";
    }

    if (form.estimatedCost !== "" && Number(form.estimatedCost) < 0) {
      return "Estimated cost cannot be negative.";
    }

    return "";
  };

  /* =====================================================
     SAVE ISSUE REPORT
  ===================================================== */

  const handleSaveReport = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("category", form.category);
      formData.append("severity", form.severity);
      formData.append("vehicleArea", form.vehicleArea);
      formData.append("description", form.description.trim());

      if (form.estimatedCost !== "") {
        formData.append("estimatedCost", form.estimatedCost);
      }

      formData.append("recommendedAction", form.recommendedAction.trim());

      if (photo) {
        formData.append("photo", photo);
      }

      const response = await api.post(`/worker/issues/${bookingId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Issue saved:", response.data);

      setSuccess("Issue report saved successfully.");

      /*
        Reload issue history.
      */

      await loadIssues();

      /*
        Reset report form.
      */

      setForm(INITIAL_FORM);
      removePhoto();

      /*
        Move to history.
      */

      setScreen("history");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Save issue error:", err);

      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null);

      setError(
        backendMessage || "Unable to save issue report. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE ISSUE
  ===================================================== */

  const handleDeleteIssue = async (issueId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this issue report?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/worker/issues/${bookingId}/${issueId}`);

      await loadIssues();

      setSuccess("Issue report removed successfully.");
    } catch (err) {
      console.error("Delete issue error:", err);

      setError(err.response?.data?.message || "Unable to remove issue report.");
    }
  };

  /* =====================================================
     CONTINUE TO CHECKLIST
  ===================================================== */

  const handleContinue = () => {
    navigate(`/worker/checklist/${bookingId}`);
  };

  /* =====================================================
     BACK TO SERVICE PROGRESS
  ===================================================== */

  const handleBackToProgress = () => {
    navigate(`/worker/service-progress/${bookingId}`);
  };

  /* =====================================================
     BACK FROM REPORT
  ===================================================== */

  const handleBackFromReport = () => {
    setScreen("decision");
    setHasIssue(null);
    setError("");
  };

  /* =====================================================
     ISSUE CATEGORY LABEL
  ===================================================== */

  const getCategoryLabel = (value) => {
    const category = CATEGORY_OPTIONS.find((item) => item.value === value);

    return category?.label || value || "Unknown";
  };

  /* =====================================================
     SEVERITY LABEL
  ===================================================== */

  const getSeverityData = (value) => {
    return (
      SEVERITY_OPTIONS.find((item) => item.value === value) || {
        label: value || "Unknown",
        colorClass: "medium",
      }
    );
  };

  /* =====================================================
     TOTAL ESTIMATED COST
  ===================================================== */

  const totalEstimatedCost = useMemo(() => {
    return issues.reduce((total, issue) => {
      return total + Number(issue.estimatedCost || 0);
    }, 0);
  }, [issues]);

  /* =====================================================
     VEHICLE DATA
  ===================================================== */

  const vehicleNumber = booking?.vehicleNumber || "Vehicle";

  const customerName = booking?.customerName || "Customer";

  const serviceName =
    booking?.serviceName || booking?.packageName || "Vehicle Service";

  const vehicleBrand = booking?.vehicleBrand || "";

  const vehicleModel = booking?.vehicleModel || "";

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) {
      return "";
    }

    // Already complete URL
    if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
      return photoPath;
    }

    // Remove leading slash if present
    const cleanPath = photoPath.startsWith("/")
      ? photoPath.substring(1)
      : photoPath;

    return `http://localhost:8080/${cleanPath}`;
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="wi-loading-page">
        <div className="wi-loading-card">
          <div className="wi-loader"></div>

          <h3>Loading Issues & Reports</h3>

          <p>Preparing your vehicle issue workspace...</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="worker-issues-page">
      {/* =================================================
          TOP HEADER
      ================================================= */}

      <header className="wi-header">
        <div className="wi-header-inner">
          <button
            type="button"
            className="wi-back-button"
            onClick={handleBackToProgress}
          >
            <span>←</span>
            Service Progress
          </button>

          <div className="wi-brand">
            <div className="wi-brand-mark">A</div>

            <div className="wi-brand-text">
              <strong>AutoGlow</strong>

              <span>Worker Portal</span>
            </div>
          </div>

          <div className="wi-live-badge">
            <span></span>
            Active Job
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <main className="wi-container">
        {/* =================================================
            PAGE INTRO
        ================================================= */}

        <section className="wi-page-intro">
          <div>
            <div className="wi-eyebrow">SERVICE QUALITY</div>

            <h1>
              Issues & <span>Reports</span>
            </h1>

            <p>
              Record any vehicle issue found during the service process before
              continuing to the final checklist.
            </p>
          </div>

          <div className="wi-booking-box">
            <span>BOOKING</span>

            <strong>#{bookingId}</strong>
          </div>
        </section>

        {/* =================================================
            VEHICLE SUMMARY
        ================================================= */}

        <section className="wi-vehicle-card">
          <div className="wi-vehicle-icon">🚘</div>

          <div className="wi-vehicle-info">
            <span>VEHICLE</span>

            <h2>{vehicleNumber}</h2>

            <p>
              {vehicleBrand} {vehicleModel}
            </p>
          </div>

          <div className="wi-divider"></div>

          <div className="wi-summary-item">
            <span>CUSTOMER</span>

            <strong>{customerName}</strong>
          </div>

          <div className="wi-summary-item">
            <span>SERVICE</span>

            <strong>{serviceName}</strong>
          </div>

          <div className="wi-issue-count">
            <strong>{issues.length}</strong>

            <span>Reports</span>
          </div>
        </section>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="wi-alert wi-error">
            <div className="wi-alert-icon">!</div>

            <div>
              <strong>Action required</strong>

              <span>{error}</span>
            </div>

            <button type="button" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="wi-alert wi-success">
            <div className="wi-alert-icon">✓</div>

            <div>
              <strong>Successfully saved</strong>

              <span>{success}</span>
            </div>

            <button type="button" onClick={() => setSuccess("")}>
              ×
            </button>
          </div>
        )}

        {/* =================================================
            DECISION SCREEN
        ================================================= */}

        {screen === "decision" && (
          <section className="wi-decision-card">
            <div className="wi-decision-icon">⚠</div>

            <span className="wi-section-label">INSPECTION DECISION</span>

            <h2>Did you find any issue?</h2>

            <p>
              Review the vehicle carefully and choose whether an issue needs to
              be reported.
            </p>

            <div className="wi-decision-options">
              {/* NO ISSUE */}

              <button
                type="button"
                className="wi-decision-option wi-no-issue"
                onClick={handleNoIssue}
              >
                <div className="wi-option-icon">✓</div>

                <div className="wi-option-content">
                  <strong>No Issue Found</strong>

                  <span>
                    Vehicle looks good and no additional issue needs to be
                    reported.
                  </span>
                </div>

                <div className="wi-option-arrow">→</div>
              </button>

              {/* ISSUE FOUND */}

              <button
                type="button"
                className="wi-decision-option wi-has-issue"
                onClick={handleHasIssue}
              >
                <div className="wi-option-icon">⚠</div>

                <div className="wi-option-content">
                  <strong>Yes, Report an Issue</strong>

                  <span>
                    I found a damage, defect or other problem with the vehicle.
                  </span>
                </div>

                <div className="wi-option-arrow">→</div>
              </button>
            </div>

            <div className="wi-decision-note">
              <span>i</span>

              <p>
                If you find even a minor pre-existing damage, reporting it helps
                protect both the customer and AutoGlow.
              </p>
            </div>
          </section>
        )}

        {/* =================================================
            REPORT FORM
        ================================================= */}

        {screen === "report" && (
          <section className="wi-report-card">
            {/* REPORT HEADER */}

            <div className="wi-report-header">
              <div className="wi-report-heading">
                <div className="wi-report-icon">⚠</div>

                <div>
                  <span>ISSUE REPORT</span>

                  <h2>Report Vehicle Issue</h2>

                  <p>
                    Add accurate information so the issue can be reviewed and
                    tracked.
                  </p>
                </div>
              </div>

              <div className="wi-report-status">New Report</div>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <div className="wi-form">
              {/* CATEGORY */}

              <div className="wi-form-section">
                <div className="wi-form-section-title">
                  <span>01</span>

                  <div>
                    <h3>Issue Category</h3>

                    <p>Select the type of problem you found.</p>
                  </div>
                </div>

                <div className="wi-category-grid">
                  {CATEGORY_OPTIONS.map((category) => (
                    <button
                      type="button"
                      key={category.value}
                      className={[
                        "wi-category-option",
                        form.category === category.value ? "selected" : "",
                      ].join(" ")}
                      onClick={() => updateForm("category", category.value)}
                    >
                      <span className="wi-category-icon">{category.icon}</span>

                      <span>{category.label}</span>

                      {form.category === category.value && <b>✓</b>}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEVERITY */}

              <div className="wi-form-section">
                <div className="wi-form-section-title">
                  <span>02</span>

                  <div>
                    <h3>Issue Severity</h3>

                    <p>How serious is this issue?</p>
                  </div>
                </div>

                <div className="wi-severity-grid">
                  {SEVERITY_OPTIONS.map((severity) => (
                    <button
                      type="button"
                      key={severity.value}
                      className={[
                        "wi-severity-option",
                        severity.colorClass,
                        form.severity === severity.value ? "selected" : "",
                      ].join(" ")}
                      onClick={() => updateForm("severity", severity.value)}
                    >
                      <span className="wi-severity-dot"></span>

                      <span className="wi-severity-copy">
                        <strong>{severity.label}</strong>

                        <small>{severity.description}</small>
                      </span>

                      {form.severity === severity.value && <b>✓</b>}
                    </button>
                  ))}
                </div>
              </div>

              {/* VEHICLE AREA */}

              <div className="wi-form-section">
                <div className="wi-form-section-title">
                  <span>03</span>

                  <div>
                    <h3>Vehicle Area</h3>

                    <p>Where is the issue located?</p>
                  </div>
                </div>

                <div className="wi-select-wrap">
                  <select
                    value={form.vehicleArea}
                    onChange={(e) => updateForm("vehicleArea", e.target.value)}
                  >
                    <option value="">Select vehicle area</option>

                    {VEHICLE_AREAS.map((area) => (
                      <option value={area} key={area}>
                        {area}
                      </option>
                    ))}
                  </select>

                  <span>⌄</span>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="wi-form-section">
                <div className="wi-form-section-title">
                  <span>04</span>

                  <div>
                    <h3>Issue Description</h3>

                    <p>Describe exactly what you observed.</p>
                  </div>
                </div>

                <textarea
                  className="wi-textarea"
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Example: Small scratch noticed on the left rear door near the handle..."
                  rows="6"
                />

                <div className="wi-character-count">
                  {form.description.length} characters
                </div>
              </div>

              {/* PHOTO */}

              <div className="wi-form-section">
                <div className="wi-form-section-title">
                  <span>05</span>

                  <div>
                    <h3>Issue Photo</h3>

                    <p>Add a clear photo as visual evidence.</p>
                  </div>

                  <small className="wi-optional">OPTIONAL</small>
                </div>

                {!photoPreview ? (
                  <button
                    type="button"
                    className="wi-upload-zone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="wi-upload-icon">↑</div>

                    <strong>Upload Issue Photo</strong>

                    <span>JPG, PNG or WebP · Maximum 5 MB</span>

                    <b>Choose Photo</b>
                  </button>
                ) : (
                  <div className="wi-photo-preview-card">
                    <div className="wi-photo-image-wrap">
                      <img src={photoPreview} alt="Issue preview" />
                    </div>

                    <div className="wi-photo-details">
                      <strong>{photo?.name}</strong>

                      <span>{(photo?.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>

                    <button
                      type="button"
                      className="wi-remove-photo"
                      onClick={removePhoto}
                    >
                      Remove
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  hidden
                />
              </div>

              {/* COST */}

              <div className="wi-two-column">
                <div className="wi-form-section">
                  <div className="wi-form-section-title compact">
                    <span>06</span>

                    <div>
                      <h3>Estimated Cost</h3>

                      <p>Approximate repair cost.</p>
                    </div>
                  </div>

                  <div className="wi-cost-input">
                    <span>₹</span>

                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={form.estimatedCost}
                      onChange={(e) =>
                        updateForm("estimatedCost", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* RECOMMENDED ACTION */}

                <div className="wi-form-section">
                  <div className="wi-form-section-title compact">
                    <span>07</span>

                    <div>
                      <h3>Recommended Action</h3>

                      <p>What should happen next?</p>
                    </div>
                  </div>

                  <input
                    className="wi-input"
                    type="text"
                    value={form.recommendedAction}
                    onChange={(e) =>
                      updateForm("recommendedAction", e.target.value)
                    }
                    placeholder="Example: Inform customer before delivery"
                  />
                </div>
              </div>
            </div>

            {/* FORM FOOTER */}

            <div className="wi-report-footer">
              <button
                type="button"
                className="wi-secondary-button"
                onClick={handleBackFromReport}
                disabled={saving}
              >
                ← Back
              </button>

              <button
                type="button"
                className="wi-save-button"
                onClick={handleSaveReport}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="wi-button-spinner"></span>
                    Saving Report...
                  </>
                ) : (
                  <>
                    Save Issue Report
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            ISSUES HISTORY
        ================================================= */}

        {screen === "history" && (
          <section className="wi-history-section">
            {/* HISTORY HEADER */}

            <div className="wi-history-header">
              <div>
                <span className="wi-section-label">ISSUE HISTORY</span>

                <h2>Reported Issues</h2>

                <p>
                  Review all issues recorded for this vehicle during the current
                  service.
                </p>
              </div>

              <div className="wi-history-stats">
                <div>
                  <strong>{issues.length}</strong>

                  <span>Total Issues</span>
                </div>

                <div>
                  <strong>₹{totalEstimatedCost.toLocaleString("en-IN")}</strong>

                  <span>Estimated Cost</span>
                </div>
              </div>
            </div>

            {/* NO ISSUES */}

            {issues.length === 0 ? (
              <div className="wi-empty-history">
                <div className="wi-empty-icon">✓</div>

                <h3>No Issues Reported</h3>

                <p>
                  There are currently no issue reports attached to this vehicle.
                </p>
              </div>
            ) : (
              <div className="wi-history-list">
                {issues.map((issue, index) => {
                  console.log("ISSUE DATA:", issue);
                  const severity = getSeverityData(issue.severity);

                  return (
                    <article
                      className="wi-history-card"
                      key={issue.id || issue.issueId || index}
                    >
                      <div className="wi-history-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="wi-history-main">
                        <div className="wi-history-top">
                          <div>
                            <span className="wi-history-category">
                              {getCategoryLabel(issue.category)}
                            </span>

                            <h3>{issue.vehicleArea || "Vehicle Area"}</h3>
                          </div>

                          <span
                            className={[
                              "wi-severity-badge",
                              severity.colorClass,
                            ].join(" ")}
                          >
                            {severity.label}
                          </span>
                        </div>

                        <p className="wi-history-description">
                          {issue.description}
                        </p>

                        <div className="wi-history-meta">
                          {issue.estimatedCost !== undefined &&
                            issue.estimatedCost !== null && (
                              <span>
                                <b>₹</b>
                                {Number(issue.estimatedCost).toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                            )}

                          {issue.recommendedAction && (
                            <span>
                              <b>→</b>
                              {issue.recommendedAction}
                            </span>
                          )}

                          {issue.createdAt && (
                            <span>
                              {new Date(issue.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="wi-history-actions">
                        {issue.photoPath && (
                          <a
                            href={
                              issue.photoPath
                                ? getPhotoUrl(issue.photoPath)
                                : "#"
                            }
                            target={issue.photoPath ? "_blank" : undefined}
                            rel={issue.photoPath ? "noreferrer" : undefined}
                            className="wi-view-photo"
                            onClick={(e) => {
                              if (!issue.photoPath) {
                                e.preventDefault();
                                alert(
                                  "No issue photo is available for this report.",
                                );
                              }
                            }}
                          >
                            View Photo
                          </a>
                        )}

                        {(issue.id || issue.issueId) && (
                          <button
                            type="button"
                            className="wi-delete-button"
                            onClick={() =>
                              handleDeleteIssue(issue.id || issue.issueId)
                            }
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* HISTORY FOOTER */}

            <div className="wi-history-footer">
              <div className="wi-history-note">
                <span>✓</span>

                <div>
                  <strong>Issue reporting completed</strong>

                  <small>
                    Continue to the service checklist when you're ready.
                  </small>
                </div>
              </div>

              <div className="wi-history-buttons">
                <button
                  type="button"
                  className="wi-secondary-button"
                  onClick={() => {
                    setScreen("report");
                    setSuccess("");
                    setError("");
                  }}
                >
                  + Report Another
                </button>

                <button
                  type="button"
                  className="wi-continue-button"
                  onClick={handleContinue}
                >
                  Continue to Checklist
                  <span>→</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default WorkerIssues;
