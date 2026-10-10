import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./ServiceChecklist.css";

// =========================================================
// CHECKLIST ITEMS
// =========================================================

const checklistItems = [
  {
    key: "exteriorWash",
    label: "Exterior Wash",
    description: "Complete exterior body washing",
  },
  {
    key: "interiorCleaning",
    label: "Interior Cleaning",
    description: "Complete interior cleaning",
  },
  {
    key: "foamWash",
    label: "Foam Wash",
    description: "Foam wash treatment completed",
  },
  {
    key: "pressureWash",
    label: "Pressure Wash",
    description: "High-pressure cleaning completed",
  },
  {
    key: "tyreCleaning",
    label: "Tyre Cleaning",
    description: "Tyres cleaned properly",
  },
  {
    key: "wheelCleaning",
    label: "Wheel Cleaning",
    description: "Wheels and rims cleaned",
  },
  {
    key: "dashboardCleaning",
    label: "Dashboard Cleaning",
    description: "Dashboard and controls cleaned",
  },
  {
    key: "vacuumCleaning",
    label: "Vacuum Cleaning",
    description: "Complete vacuum cleaning completed",
  },
  {
    key: "glassCleaning",
    label: "Glass Cleaning",
    description: "All vehicle glasses cleaned",
  },
  {
    key: "engineCleaning",
    label: "Engine Cleaning",
    description: "Engine area cleaning completed",
  },
  {
    key: "polishing",
    label: "Polishing",
    description: "Vehicle polishing completed",
  },
  {
    key: "waxing",
    label: "Waxing",
    description: "Wax treatment completed",
  },
  {
    key: "finalInspection",
    label: "Final Inspection",
    description: "Final quality inspection completed",
  },
];

// =========================================================
// INITIAL CHECKLIST
// =========================================================

const createInitialChecklist = () => {
  const initial = {};

  checklistItems.forEach((item) => {
    initial[item.key] = false;
  });

  return initial;
};

// =========================================================
// PHOTO URL HELPER
// =========================================================

const getPhotoUrl = (photoPath) => {
  if (!photoPath) {
    return "";
  }

  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }

  const cleanPath = photoPath.startsWith("/")
    ? photoPath.substring(1)
    : photoPath;

  return `http://localhost:8080/${cleanPath}`;
};

// =========================================================
// COMPONENT
// =========================================================

const ServiceChecklist = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [checklist, setChecklist] = useState(createInitialChecklist());

  const [workerId, setWorkerId] = useState(null);

  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);

  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");

  const [existingChecklist, setExistingChecklist] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingBefore, setUploadingBefore] = useState(false);

  const [uploadingAfter, setUploadingAfter] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // LOAD WORKER ID
  // =========================================================

  useEffect(() => {
    const storedWorkerId =
      localStorage.getItem("autoglow_user_id") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("workerId");

    if (storedWorkerId) {
      setWorkerId(Number(storedWorkerId));
    }
  }, []);

  // =========================================================
  // LOAD EXISTING CHECKLIST
  // =========================================================

  useEffect(() => {
    if (bookingId) {
      loadChecklist();
    }
  }, [bookingId]);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/worker/checklists/${bookingId}/latest`);

      const data = response.data;

      setExistingChecklist(data);

      // -------------------------------------------------------
      // LOAD CHECKLIST VALUES
      // -------------------------------------------------------

      setChecklist({
        exteriorWash: data.exteriorWash ?? false,
        interiorCleaning: data.interiorCleaning ?? false,
        foamWash: data.foamWash ?? false,
        pressureWash: data.pressureWash ?? false,
        tyreCleaning: data.tyreCleaning ?? false,
        wheelCleaning: data.wheelCleaning ?? false,
        dashboardCleaning: data.dashboardCleaning ?? false,
        vacuumCleaning: data.vacuumCleaning ?? false,
        glassCleaning: data.glassCleaning ?? false,
        engineCleaning: data.engineCleaning ?? false,
        polishing: data.polishing ?? false,
        waxing: data.waxing ?? false,
        finalInspection: data.finalInspection ?? false,
      });

      // -------------------------------------------------------
      // LOAD BEFORE PHOTO
      // -------------------------------------------------------

      if (data.beforePhotoPath) {
        setBeforePreview(getPhotoUrl(data.beforePhotoPath));
      } else {
        setBeforePreview("");
      }

      // -------------------------------------------------------
      // LOAD AFTER PHOTO
      // -------------------------------------------------------

      if (data.afterPhotoPath) {
        setAfterPreview(getPhotoUrl(data.afterPhotoPath));
      } else {
        setAfterPreview("");
      }
    } catch (err) {
      // 404 means checklist does not exist yet.
      if (err.response?.status === 404) {
        setExistingChecklist(null);
        setChecklist(createInitialChecklist());
        setBeforePreview("");
        setAfterPreview("");
      } else {
        console.error("Failed to load checklist:", err);

        setError(
          err.response?.data || "Unable to load existing service checklist.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CHECKBOX CHANGE
  // =========================================================

  const handleCheckboxChange = (key) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setMessage("");
    setError("");
  };

  // =========================================================
  // SELECT BEFORE PHOTO
  // =========================================================

  const handleBeforePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Basic frontend validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Before photo size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setBeforePhoto(file);
    setBeforePreview(URL.createObjectURL(file));

    setMessage("");
    setError("");
  };

  // =========================================================
  // SELECT AFTER PHOTO
  // =========================================================

  const handleAfterPhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Basic frontend validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("After photo size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setAfterPhoto(file);
    setAfterPreview(URL.createObjectURL(file));

    setMessage("");
    setError("");
  };

  // =========================================================
  // SAVE CHECKLIST
  // =========================================================

  const saveChecklist = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const formData = new URLSearchParams();

      if (workerId) {
        formData.append("workerId", workerId);
      }

      Object.entries(checklist).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      formData.append("status", "IN_PROGRESS");

      const response = await api.post(
        `/worker/checklists/${bookingId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      setExistingChecklist(response.data);

      setMessage("Service checklist saved successfully.");

      return response.data;
    } catch (err) {
      console.error("Failed to save checklist:", err);

      setError(err.response?.data || "Failed to save service checklist.");

      return null;
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // UPLOAD BEFORE PHOTO
  // =========================================================

  const uploadBeforePhoto = async (checklistId) => {
    if (!beforePhoto) {
      return true;
    }

    try {
      setUploadingBefore(true);
      setError("");

      const formData = new FormData();

      formData.append("photo", beforePhoto);

      /*
       * IMPORTANT:
       * Do NOT manually set Content-Type here.
       * Axios/browser will automatically create:
       *
       * multipart/form-data; boundary=...
       */

      const response = await api.post(
        `/worker/checklists/${checklistId}/before-photo`,
        formData,
      );

      setExistingChecklist(response.data);

      if (response.data.beforePhotoPath) {
        setBeforePreview(getPhotoUrl(response.data.beforePhotoPath));
      }

      setBeforePhoto(null);

      return true;
    } catch (err) {
      console.error("BEFORE PHOTO UPLOAD ERROR:", err);

      console.error("STATUS:", err.response?.status);

      console.error("DATA:", err.response?.data);

      setError(
        err.response?.data ||
          `Failed to upload before photo${
            err.response?.status ? ` (${err.response.status})` : ""
          }`,
      );

      return false;
    } finally {
      setUploadingBefore(false);
    }
  };

  // =========================================================
  // UPLOAD AFTER PHOTO
  // =========================================================

  const uploadAfterPhoto = async (checklistId) => {
    if (!afterPhoto) {
      return true;
    }

    try {
      setUploadingAfter(true);
      setError("");

      const formData = new FormData();

      formData.append("photo", afterPhoto);

      /*
       * IMPORTANT:
       * Do NOT manually set Content-Type here.
       * Axios/browser will automatically create:
       *
       * multipart/form-data; boundary=...
       */

      const response = await api.post(
        `/worker/checklists/${checklistId}/after-photo`,
        formData,
      );

      setExistingChecklist(response.data);

      if (response.data.afterPhotoPath) {
        setAfterPreview(getPhotoUrl(response.data.afterPhotoPath));
      }

      setAfterPhoto(null);

      return true;
    } catch (err) {
      console.error("AFTER PHOTO UPLOAD ERROR:", err);

      console.error("STATUS:", err.response?.status);

      console.error("DATA:", err.response?.data);

      setError(
        err.response?.data ||
          `Failed to upload after photo${
            err.response?.status ? ` (${err.response.status})` : ""
          }`,
      );

      return false;
    } finally {
      setUploadingAfter(false);
    }
  };

  // =========================================================
  // SAVE EVERYTHING
  // =========================================================

  const handleSaveAll = async () => {
    setMessage("");
    setError("");

    const savedChecklist = await saveChecklist();

    if (!savedChecklist) {
      return;
    }

    const checklistId = savedChecklist.id;

    if (!checklistId) {
      setError("Checklist ID was not returned by server.");
      return;
    }

    const beforeUploaded = await uploadBeforePhoto(checklistId);

    if (!beforeUploaded) {
      return;
    }

    const afterUploaded = await uploadAfterPhoto(checklistId);

    if (!afterUploaded) {
      return;
    }

    setMessage("Checklist and photos saved successfully.");

    await loadChecklist();
  };

  // =========================================================
  // COMPLETE SERVICE
  // =========================================================

  const handleCompleteService = async () => {
    setMessage("");
    setError("");

    // -------------------------------------------------------
    // CHECK ALL TASKS
    // -------------------------------------------------------

    const allCompleted = checklistItems.every(
      (item) => checklist[item.key] === true,
    );

    if (!allCompleted) {
      setError(
        "Please complete all checklist items before finishing the service.",
      );
      return;
    }

    try {
      setSaving(true);

      // -----------------------------------------------------
      // SAVE CHECKLIST
      // -----------------------------------------------------

      const savedChecklist = await saveChecklist();

      if (!savedChecklist) {
        return;
      }

      const checklistId = savedChecklist.id;

      if (!checklistId) {
        setError("Checklist ID was not returned by server.");
        return;
      }

      // -----------------------------------------------------
      // UPLOAD BEFORE PHOTO
      // -----------------------------------------------------

      const beforeUploaded = await uploadBeforePhoto(checklistId);

      if (!beforeUploaded) {
        return;
      }

      // -----------------------------------------------------
      // UPLOAD AFTER PHOTO
      // -----------------------------------------------------

      const afterUploaded = await uploadAfterPhoto(checklistId);

      if (!afterUploaded) {
        return;
      }

      // -----------------------------------------------------
      // UPDATE STATUS
      // -----------------------------------------------------

      await api.patch(`/worker/checklists/${checklistId}/status`, null, {
        params: {
          status: "COMPLETED",
        },
      });

      setMessage("Service checklist completed successfully.");

      await loadChecklist();

      // -----------------------------------------------------
      // GO TO SERVICE PROGRESS
      // -----------------------------------------------------

      setTimeout(() => {
        navigate(`/worker/service-progress/${bookingId}`);
      }, 1000);
    } catch (err) {
      console.error("Failed to complete checklist:", err);

      setError(err.response?.data || "Failed to complete service checklist.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PROGRESS
  // =========================================================

  const completedCount = checklistItems.filter(
    (item) => checklist[item.key],
  ).length;

  const totalCount = checklistItems.length;

  const progress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="service-checklist-page">
        <div className="checklist-loading">
          <div className="loading-spinner"></div>

          <p>Loading service checklist...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="service-checklist-page">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="checklist-topbar">
        <div>
          <button
            className="back-button"
            onClick={() => navigate(`/worker/issues/${bookingId}`)}
          >
            ← Back
          </button>

          <h1>Service Checklist</h1>

          <p>
            Complete every service task and upload before & after service
            photos.
          </p>
        </div>

        <div className="booking-badge">
          <span>Booking ID</span>

          <strong>#{bookingId}</strong>
        </div>
      </div>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {message && <div className="success-alert">✓ {message}</div>}

      {error && <div className="error-alert">⚠ {error}</div>}

      {/* =====================================================
          PROGRESS CARD
      ====================================================== */}

      <div className="progress-card">
        <div className="progress-info">
          <div>
            <span className="progress-label">Service Completion</span>

            <h2>
              {completedCount} / {totalCount}
            </h2>
          </div>

          <div className="progress-percent">{progress}%</div>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          ></div>
        </div>

        <p>
          {progress === 100
            ? "All service tasks completed."
            : "Complete all tasks before marking the service as completed."}
        </p>
      </div>

      {/* =====================================================
          CHECKLIST
      ====================================================== */}

      <section className="checklist-section">
        <div className="section-heading">
          <div className="section-icon">✓</div>

          <div>
            <h2>Service Tasks</h2>

            <p>Mark each task after physically completing it.</p>
          </div>
        </div>

        <div className="checklist-grid">
          {checklistItems.map((item, index) => (
            <label
              key={item.key}
              className={`checklist-item ${
                checklist[item.key] ? "completed" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={() => handleCheckboxChange(item.key)}
              />

              <span className="custom-checkbox">
                {checklist[item.key] ? "✓" : ""}
              </span>

              <span className="task-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="task-content">
                <strong>{item.label}</strong>

                <small>{item.description}</small>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* =====================================================
          PHOTOS
      ====================================================== */}

      <section className="photos-section">
        <div className="section-heading">
          <div className="section-icon">📷</div>

          <div>
            <h2>Service Photos</h2>

            <p>Upload vehicle photos before and after service.</p>
          </div>
        </div>

        <div className="photo-grid">
          {/* =================================================
              BEFORE PHOTO
          ================================================== */}

          <div className="photo-card">
            <div className="photo-card-header">
              <div>
                <h3>Before Service</h3>

                <p>Vehicle condition before service</p>
              </div>

              <span className="photo-tag">BEFORE</span>
            </div>

            <div className="photo-preview">
              {beforePreview ? (
                <img src={beforePreview} alt="Before service" />
              ) : (
                <div className="empty-photo">
                  <span>📷</span>

                  <p>No photo selected</p>
                </div>
              )}
            </div>

            <label className="upload-button">
              {uploadingBefore ? "Uploading..." : "Choose Before Photo"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBeforePhotoChange}
                disabled={uploadingBefore || saving}
              />
            </label>
          </div>

          {/* =================================================
              AFTER PHOTO
          ================================================== */}

          <div className="photo-card">
            <div className="photo-card-header">
              <div>
                <h3>After Service</h3>

                <p>Vehicle condition after service</p>
              </div>

              <span className="photo-tag after">AFTER</span>
            </div>

            <div className="photo-preview">
              {afterPreview ? (
                <img src={afterPreview} alt="After service" />
              ) : (
                <div className="empty-photo">
                  <span>📷</span>

                  <p>No photo selected</p>
                </div>
              )}
            </div>

            <label className="upload-button">
              {uploadingAfter ? "Uploading..." : "Choose After Photo"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAfterPhotoChange}
                disabled={uploadingAfter || saving}
              />
            </label>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATUS
      ====================================================== */}

      <section className="status-card">
        <div className="status-left">
          <div className="status-icon">
            {existingChecklist?.status === "COMPLETED" ? "✓" : "⏳"}
          </div>

          <div>
            <span>Current Status</span>

            <strong>{existingChecklist?.status || "IN_PROGRESS"}</strong>
          </div>
        </div>

        <div className="status-note">
          {existingChecklist?.updatedAt
            ? `Last updated: ${new Date(
                existingChecklist.updatedAt,
              ).toLocaleString()}`
            : "Checklist has not been saved yet."}
        </div>
      </section>

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="checklist-actions">
        <button
          className="secondary-action"
          onClick={handleSaveAll}
          disabled={saving || uploadingBefore || uploadingAfter}
        >
          {saving ? "Saving..." : "💾 Save Checklist"}
        </button>

        <button
          className="primary-action"
          onClick={handleCompleteService}
          disabled={saving || uploadingBefore || uploadingAfter}
        >
          {saving ? "Processing..." : "✓ Complete Service"}
        </button>
      </div>
    </div>
  );
};

export default ServiceChecklist;