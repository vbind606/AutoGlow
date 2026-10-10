import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./ServiceProgress.css";

/* =========================================================
   INITIAL FORM
========================================================= */

const initialForm = {
  // DRYING
  dryingMethod: "",
  bodyCompletelyDry: false,
  glassDry: false,
  wheelsDry: false,
  noWaterSpots: false,
  dryingCompleted: false,
  dryingNotes: "",

  // QUALITY CHECK
  exteriorChecked: false,
  interiorChecked: false,
  glassChecked: false,
  wheelsChecked: false,
  paintChecked: false,
  noVisibleDefects: false,
  qualityCheckCompleted: false,
  qualityNotes: "",

  // COMPLETION
  serviceCompleted: false,
  vehicleReady: false,
  completionNotes: "",

  // DELIVERY
  vehicleHandedOver: false,
  customerReceived: false,
  deliveryNotes: "",
};

/* =========================================================
   STAGES
========================================================= */

const stages = [
  {
    key: "DRYING",
    number: "01",
    title: "Drying",
    subtitle: "Complete vehicle drying",
    icon: "💨",
  },
  {
    key: "QUALITY_CHECK",
    number: "02",
    title: "Quality Check",
    subtitle: "Inspect final quality",
    icon: "✓",
  },
  {
    key: "COMPLETED",
    number: "03",
    title: "Completion",
    subtitle: "Mark service ready",
    icon: "★",
  },
  {
    key: "DELIVERED",
    number: "04",
    title: "Delivery",
    subtitle: "Hand over vehicle",
    icon: "↗",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function ServiceProgress() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [progress, setProgress] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [activeStage, setActiveStage] = useState("DRYING");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     FETCH BOOKING + SERVICE PROGRESS
  ======================================================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      /* -----------------------------------------------
         GET WORKER JOBS
      ------------------------------------------------ */

      const jobsResponse = await api.get("/worker/jobs");

      const jobs = Array.isArray(jobsResponse.data)
        ? jobsResponse.data
        : jobsResponse.data?.jobs || [];

      const currentBooking = jobs.find(
        (item) => String(item.bookingId) === String(bookingId),
      );

      if (!currentBooking) {
        throw new Error("Booking not found");
      }

      setBooking(currentBooking);

      /* -----------------------------------------------
         GET SERVICE PROGRESS
      ------------------------------------------------ */

      let progressData = {};

      try {
        const progressResponse = await api.get(
          `/worker/service-progress/${bookingId}`,
        );

        progressData = progressResponse.data || {};
      } catch (progressError) {
        /*
          Agar progress record abhi exist nahi karta,
          page ko crash nahi karna.
        */

        if (progressError.response?.status !== 404) {
          throw progressError;
        }

        progressData = {};
      }

      setProgress(progressData);

      /* -----------------------------------------------
         LOAD FORM DATA
      ------------------------------------------------ */

      setForm({
        // DRYING
        dryingMethod: progressData.dryingMethod || "",
        bodyCompletelyDry: Boolean(progressData.bodyCompletelyDry),
        glassDry: Boolean(progressData.glassDry),
        wheelsDry: Boolean(progressData.wheelsDry),
        noWaterSpots: Boolean(progressData.noWaterSpots),
        dryingCompleted: Boolean(progressData.dryingCompleted),
        dryingNotes: progressData.dryingNotes || "",

        // QUALITY
        exteriorChecked: Boolean(progressData.exteriorChecked),
        interiorChecked: Boolean(progressData.interiorChecked),
        glassChecked: Boolean(progressData.glassChecked),
        wheelsChecked: Boolean(progressData.wheelsChecked),
        paintChecked: Boolean(progressData.paintChecked),
        noVisibleDefects: Boolean(progressData.noVisibleDefects),
        qualityCheckCompleted: Boolean(progressData.qualityCheckCompleted),
        qualityNotes: progressData.qualityNotes || "",

        // COMPLETION
        serviceCompleted: Boolean(progressData.serviceCompleted),
        vehicleReady: Boolean(progressData.vehicleReady),
        completionNotes: progressData.completionNotes || "",

        // DELIVERY
        vehicleHandedOver: Boolean(progressData.vehicleHandedOver),
        customerReceived: Boolean(progressData.customerReceived),
        deliveryNotes: progressData.deliveryNotes || "",
      });

      /* -----------------------------------------------
         DETERMINE ACTIVE STAGE
      ------------------------------------------------ */

      const currentStatus = progressData.currentStatus || currentBooking.status;

      if (currentStatus === "WASHING") {
        setActiveStage("DRYING");
      } else if (currentStatus === "DRYING") {
        setActiveStage("DRYING");
      } else if (currentStatus === "QUALITY_CHECK") {
        setActiveStage("QUALITY_CHECK");
      } else if (currentStatus === "COMPLETED") {
        setActiveStage("DELIVERED");
      } else if (currentStatus === "DELIVERED") {
        setActiveStage("DELIVERED");
      } else {
        setActiveStage("DRYING");
      }
    } catch (err) {
      console.error("Service Progress Load Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load service progress.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     USE EFFECT
  ======================================================= */

  useEffect(() => {
    if (bookingId) {
      fetchData();
    }
  }, [bookingId]);

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =======================================================
     CURRENT STATUS
  ======================================================= */

  const status = progress?.currentStatus || booking?.status || "WASHING";

  /* =======================================================
     COMPLETED STAGES
  ======================================================= */

  const completedStages = useMemo(() => {
    const completed = [];

    if (["QUALITY_CHECK", "COMPLETED", "DELIVERED"].includes(status)) {
      completed.push("DRYING");
    }

    if (["COMPLETED", "DELIVERED"].includes(status)) {
      completed.push("QUALITY_CHECK");
    }

    if (["DELIVERED"].includes(status)) {
      completed.push("COMPLETED");
    }

    if (status === "DELIVERED") {
      completed.push("DELIVERED");
    }

    return completed;
  }, [status]);

  /* =======================================================
     STAGE COMPLETED
  ======================================================= */

  const isStageCompleted = (stage) => {
    if (stage === "DRYING") {
      return ["QUALITY_CHECK", "COMPLETED", "DELIVERED"].includes(status);
    }

    if (stage === "QUALITY_CHECK") {
      return ["COMPLETED", "DELIVERED"].includes(status);
    }

    if (stage === "COMPLETED") {
      return status === "DELIVERED";
    }

    if (stage === "DELIVERED") {
      return status === "DELIVERED";
    }

    return false;
  };

  /* =======================================================
     STAGE CAN OPEN?
  ======================================================= */

  const canOpenStage = (stage) => {
    if (stage === "DRYING") {
      return true;
    }

    if (stage === "QUALITY_CHECK") {
      return isStageCompleted("DRYING");
    }

    if (stage === "COMPLETED") {
      return isStageCompleted("QUALITY_CHECK");
    }

    if (stage === "DELIVERED") {
      return isStageCompleted("COMPLETED");
    }

    return false;
  };

  /* =======================================================
     STAGE CLICK
  ======================================================= */

  const handleStageClick = (stage) => {
    if (!canOpenStage(stage)) {
      return;
    }

    setActiveStage(stage);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     🔥 ISSUES & REPORTS
  ======================================================= */

  const handleIssuesAndReports = () => {
    if (!bookingId) {
      setError("Booking ID is missing.");
      return;
    }

    navigate(`/worker/issues/${bookingId}`);
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateStage = () => {
    /* -----------------------------------------------
       DRYING VALIDATION
    ------------------------------------------------ */

    if (activeStage === "DRYING") {
      if (!form.dryingMethod) {
        return "Please select a drying method.";
      }

      if (
        !form.bodyCompletelyDry ||
        !form.glassDry ||
        !form.wheelsDry ||
        !form.noWaterSpots
      ) {
        return "Please complete all drying checks.";
      }
    }

    /* -----------------------------------------------
       QUALITY CHECK VALIDATION
    ------------------------------------------------ */

    if (activeStage === "QUALITY_CHECK") {
      if (
        !form.exteriorChecked ||
        !form.interiorChecked ||
        !form.glassChecked ||
        !form.wheelsChecked ||
        !form.paintChecked ||
        !form.noVisibleDefects
      ) {
        return "Please complete all quality checks.";
      }
    }

    /* -----------------------------------------------
       COMPLETION VALIDATION
    ------------------------------------------------ */

    if (activeStage === "COMPLETED") {
      if (!form.serviceCompleted || !form.vehicleReady) {
        return "Please confirm service completion.";
      }
    }

    /* -----------------------------------------------
       DELIVERY VALIDATION
    ------------------------------------------------ */

    if (activeStage === "DELIVERED") {
      if (!form.vehicleHandedOver || !form.customerReceived) {
        return "Please confirm vehicle handover.";
      }
    }

    return "";
  };

  /* =======================================================
     SAVE CURRENT STAGE
  ======================================================= */

  const saveCurrentStage = async () => {
    const validationError = validateStage();

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

      const requestData = {
        ...form,

        dryingCompleted: activeStage === "DRYING" ? true : form.dryingCompleted,

        qualityCheckCompleted:
          activeStage === "QUALITY_CHECK" ? true : form.qualityCheckCompleted,
      };

      console.log("Saving service progress:", requestData);

      const response = await api.put(
        `/worker/service-progress/${bookingId}`,
        requestData,
      );

      const data = response.data || {};

      console.log("Service progress saved:", data);

      setProgress(data);

      /* -----------------------------------------------
         UPDATE LOCAL FORM
      ------------------------------------------------ */

      setForm((previous) => ({
        ...previous,

        dryingCompleted:
          activeStage === "DRYING" ? true : previous.dryingCompleted,

        qualityCheckCompleted:
          activeStage === "QUALITY_CHECK"
            ? true
            : previous.qualityCheckCompleted,
      }));

      /* -----------------------------------------------
         NEXT STAGE
      ------------------------------------------------ */

      if (activeStage === "DRYING") {
        setActiveStage("QUALITY_CHECK");
      } else if (activeStage === "QUALITY_CHECK") {
        setActiveStage("COMPLETED");
      } else if (activeStage === "COMPLETED") {
        setActiveStage("DELIVERED");
      } else if (activeStage === "DELIVERED") {
        alert("Vehicle delivered successfully!");

        navigate("/worker/jobs");
        return;
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Service Progress Save Error:", err);

      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null);

      setError(
        backendMessage || "Unable to save this stage. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DISPLAY DATA
  ======================================================= */

  const vehicleNumber = booking?.vehicleNumber || "Vehicle";

  const customerName = booking?.customerName || "Customer";

  const serviceName =
    booking?.serviceName || booking?.packageName || "Vehicle Service";

  const vehicleBrand = booking?.vehicleBrand || "";

  const vehicleModel = booking?.vehicleModel || "";

  const currentStageObject = stages.find((item) => item.key === activeStage);

  const currentStageIndex = stages.findIndex(
    (item) => item.key === activeStage,
  );

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="sp-loading-page">
        <div className="sp-loader"></div>

        <p>Loading service workspace...</p>
      </div>
    );
  }

  /* =======================================================
     ERROR PAGE
  ======================================================= */

  if (error && !booking) {
    return (
      <div className="sp-error-page">
        <div className="sp-error-card">
          <div className="sp-error-icon">!</div>

          <h2>Unable to load booking</h2>

          <p>{error}</p>

          <button onClick={() => navigate("/worker/jobs")}>Back to Jobs</button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="service-progress-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sp-header">
        <div className="sp-header-inner">
          <button
            className="sp-back-btn"
            onClick={() => navigate("/worker/jobs")}
          >
            <span>←</span>
            Back to Jobs
          </button>

          <div className="sp-brand">
            <div className="sp-brand-mark">A</div>

            <div>
              <strong>AutoGlow</strong>
              <span>Service Workspace</span>
            </div>
          </div>

          <div className="sp-live-status">
            <span className="sp-live-dot"></span>
            Live Job
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="sp-container">
        {/* =================================================
            INTRO
        ================================================= */}

        <section className="sp-intro">
          <div>
            <span className="sp-eyebrow">SERVICE WORKFLOW</span>

            <h1>
              Complete Service
              <span>Progress</span>
            </h1>

            <p>
              Finish every remaining stage of this vehicle service from one
              workspace.
            </p>
          </div>

          <div className="sp-booking-pill">
            <span>BOOKING</span>
            <strong>#{bookingId}</strong>
          </div>
        </section>

        {/* =================================================
            VEHICLE SUMMARY
        ================================================= */}

        <section className="sp-vehicle-card">
          <div className="sp-vehicle-icon">🚘</div>

          <div className="sp-vehicle-main">
            <span>VEHICLE</span>

            <h2>{vehicleNumber}</h2>

            <p>
              {vehicleBrand}
              {vehicleModel ? ` ${vehicleModel}` : ""}
            </p>
          </div>

          <div className="sp-summary-divider"></div>

          <div className="sp-summary-item">
            <span>CUSTOMER</span>
            <strong>{customerName}</strong>
          </div>

          <div className="sp-summary-item">
            <span>SERVICE</span>
            <strong>{serviceName}</strong>
          </div>

          <div className="sp-status-pill">
            <span></span>

            {String(status).replaceAll("_", " ")}
          </div>
        </section>

        {/* =================================================
            ERROR ALERT
        ================================================= */}

        {error && (
          <div className="sp-alert">
            <div>!</div>

            <span>{error}</span>

            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* =================================================
            WORKFLOW
        ================================================= */}

        <section className="sp-workflow-card">
          <div className="sp-workflow-top">
            <div>
              <span className="sp-section-label">WORKFLOW</span>

              <h2>Service completion journey</h2>
            </div>

            <div className="sp-progress-count">
              <strong>{Math.min(completedStages.length + 1, 4)}</strong>

              <span>/ 4 active</span>
            </div>
          </div>

          <div className="sp-stepper">
            {stages.map((stage, index) => {
              const completed = isStageCompleted(stage.key);

              const active = activeStage === stage.key;

              const unlocked = canOpenStage(stage.key);

              return (
                <React.Fragment key={stage.key}>
                  <button
                    type="button"
                    className={[
                      "sp-step",
                      active ? "active" : "",
                      completed ? "completed" : "",
                      !unlocked ? "locked" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleStageClick(stage.key)}
                    disabled={!unlocked}
                  >
                    <div className="sp-step-circle">
                      {completed ? "✓" : stage.icon}
                    </div>

                    <div className="sp-step-content">
                      <span>STEP {stage.number}</span>

                      <strong>{stage.title}</strong>

                      <small>{stage.subtitle}</small>
                    </div>
                  </button>

                  {index < stages.length - 1 && (
                    <div
                      className={["sp-step-line", completed ? "filled" : ""]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* =================================================
            ACTIVE FORM
        ================================================= */}

        <section className="sp-form-card">
          {/* =================================================
              FORM HEADER
          ================================================= */}

          <div className="sp-form-header">
            <div className="sp-form-title-wrap">
              <div className="sp-form-stage-icon">
                {currentStageObject?.icon}
              </div>

              <div>
                <span>STEP {currentStageIndex + 1} OF 4</span>

                <h2>{currentStageObject?.title}</h2>
              </div>
            </div>

            <div className="sp-form-status">
              {isStageCompleted(activeStage) ? "Completed" : "In Progress"}
            </div>
          </div>

          {/* =================================================
              DRYING
          ================================================= */}

          {activeStage === "DRYING" && (
            <div className="sp-form-body">
              <div className="sp-section-heading">
                <span>01</span>

                <div>
                  <h3>Drying & Surface Finish</h3>

                  <p>
                    Make sure the vehicle is completely dry before quality
                    inspection.
                  </p>
                </div>
              </div>

              <div className="sp-form-section">
                <label className="sp-input-label">
                  Drying Method
                  <span>*</span>
                </label>

                <div className="sp-select-wrap">
                  <select
                    value={form.dryingMethod}
                    onChange={(e) =>
                      updateField("dryingMethod", e.target.value)
                    }
                  >
                    <option value="">Select drying method</option>

                    <option value="MICROFIBER">Premium Microfiber</option>

                    <option value="AIR_DRYING">Natural Air Drying</option>

                    <option value="BLOWER">High Pressure Blower</option>

                    <option value="VACUUM_DRYING">Vacuum Drying</option>
                  </select>

                  <span>⌄</span>
                </div>
              </div>

              <div className="sp-check-section">
                <div className="sp-section-heading compact">
                  <span>02</span>

                  <div>
                    <h3>Drying Inspection</h3>

                    <p>Confirm every surface is ready.</p>
                  </div>
                </div>

                <div className="sp-check-grid">
                  {[
                    [
                      "bodyCompletelyDry",
                      "Body completely dry",
                      "Exterior surfaces are moisture-free",
                    ],
                    [
                      "glassDry",
                      "Glass & mirrors dry",
                      "No moisture remains on glass",
                    ],
                    [
                      "wheelsDry",
                      "Wheels completely dry",
                      "Wheels and rims are dry",
                    ],
                    [
                      "noWaterSpots",
                      "No water spots",
                      "No visible water marks",
                    ],
                  ].map(([field, title, subtitle]) => (
                    <label
                      key={field}
                      className={["sp-check-card", form[field] ? "checked" : ""]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={form[field]}
                        onChange={(e) => updateField(field, e.target.checked)}
                      />

                      <span className="sp-checkbox">
                        {form[field] ? "✓" : ""}
                      </span>

                      <span className="sp-check-copy">
                        <strong>{title}</strong>

                        <small>{subtitle}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sp-form-section">
                <label className="sp-input-label">Drying Notes</label>

                <textarea
                  value={form.dryingNotes}
                  onChange={(e) => updateField("dryingNotes", e.target.value)}
                  placeholder="Add any observations about the drying process..."
                  rows="4"
                />
              </div>
            </div>
          )}

          {/* =================================================
              QUALITY CHECK
          ================================================= */}

          {activeStage === "QUALITY_CHECK" && (
            <div className="sp-form-body">
              <div className="sp-section-heading">
                <span>01</span>

                <div>
                  <h3>Final Quality Inspection</h3>

                  <p>
                    Carefully inspect the vehicle before marking the service
                    complete.
                  </p>
                </div>
              </div>

              <div className="sp-check-section">
                <div className="sp-check-grid">
                  {[
                    [
                      "exteriorChecked",
                      "Exterior inspected",
                      "Body, panels and finish",
                    ],
                    [
                      "interiorChecked",
                      "Interior inspected",
                      "Seats, dashboard and floor",
                    ],
                    [
                      "glassChecked",
                      "Glass inspected",
                      "Windows, mirrors and windshield",
                    ],
                    [
                      "wheelsChecked",
                      "Wheels inspected",
                      "Tyres, rims and wheel area",
                    ],
                    [
                      "paintChecked",
                      "Paint finish checked",
                      "Paint looks clean and uniform",
                    ],
                    [
                      "noVisibleDefects",
                      "No visible defects",
                      "Vehicle meets AutoGlow quality",
                    ],
                  ].map(([field, title, subtitle]) => (
                    <label
                      key={field}
                      className={["sp-check-card", form[field] ? "checked" : ""]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={form[field]}
                        onChange={(e) => updateField(field, e.target.checked)}
                      />

                      <span className="sp-checkbox">
                        {form[field] ? "✓" : ""}
                      </span>

                      <span className="sp-check-copy">
                        <strong>{title}</strong>

                        <small>{subtitle}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sp-quality-banner">
                <div className="sp-quality-icon">✓</div>

                <div>
                  <strong>AutoGlow Quality Standard</strong>

                  <p>
                    All visible areas should be clean, dry and free from
                    service-related defects.
                  </p>
                </div>
              </div>

              <div className="sp-form-section">
                <label className="sp-input-label">Quality Notes</label>

                <textarea
                  value={form.qualityNotes}
                  onChange={(e) => updateField("qualityNotes", e.target.value)}
                  placeholder="Add final inspection observations..."
                  rows="4"
                />
              </div>
            </div>
          )}

          {/* =================================================
              COMPLETED
          ================================================= */}

          {activeStage === "COMPLETED" && (
            <div className="sp-form-body">
              <div className="sp-completion-hero">
                <div className="sp-completion-symbol">✓</div>

                <div>
                  <span>READY FOR COMPLETION</span>

                  <h3>Service is almost complete</h3>

                  <p>
                    Confirm the final service state before moving the vehicle to
                    delivery.
                  </p>
                </div>
              </div>

              <div className="sp-confirm-grid">
                <label
                  className={[
                    "sp-confirm-card",
                    form.serviceCompleted ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={form.serviceCompleted}
                    onChange={(e) =>
                      updateField("serviceCompleted", e.target.checked)
                    }
                  />

                  <span className="sp-confirm-icon">✓</span>

                  <span>
                    <strong>Service Completed</strong>

                    <small>
                      All requested services have been successfully completed.
                    </small>
                  </span>
                </label>

                <label
                  className={[
                    "sp-confirm-card",
                    form.vehicleReady ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={form.vehicleReady}
                    onChange={(e) =>
                      updateField("vehicleReady", e.target.checked)
                    }
                  />

                  <span className="sp-confirm-icon">🚘</span>

                  <span>
                    <strong>Vehicle Ready</strong>

                    <small>Vehicle is ready for customer handover.</small>
                  </span>
                </label>
              </div>

              <div className="sp-form-section">
                <label className="sp-input-label">Completion Notes</label>

                <textarea
                  value={form.completionNotes}
                  onChange={(e) =>
                    updateField("completionNotes", e.target.value)
                  }
                  placeholder="Add final service remarks..."
                  rows="5"
                />
              </div>
            </div>
          )}

          {/* =================================================
              DELIVERY
          ================================================= */}

          {activeStage === "DELIVERED" && (
            <div className="sp-form-body">
              <div className="sp-delivery-hero">
                <div className="sp-delivery-icon">↗</div>

                <div>
                  <span>FINAL STEP</span>

                  <h3>Vehicle Delivery</h3>

                  <p>
                    Confirm that the vehicle has been handed back to the
                    customer.
                  </p>
                </div>
              </div>

              <div className="sp-confirm-grid">
                <label
                  className={[
                    "sp-confirm-card",
                    form.vehicleHandedOver ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={form.vehicleHandedOver}
                    onChange={(e) =>
                      updateField("vehicleHandedOver", e.target.checked)
                    }
                  />

                  <span className="sp-confirm-icon">🚘</span>

                  <span>
                    <strong>Vehicle Handed Over</strong>

                    <small>
                      Vehicle has been physically handed over to the customer.
                    </small>
                  </span>
                </label>

                <label
                  className={[
                    "sp-confirm-card",
                    form.customerReceived ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={form.customerReceived}
                    onChange={(e) =>
                      updateField("customerReceived", e.target.checked)
                    }
                  />

                  <span className="sp-confirm-icon">✓</span>

                  <span>
                    <strong>Customer Received</strong>

                    <small>
                      Customer has received the vehicle successfully.
                    </small>
                  </span>
                </label>
              </div>

              <div className="sp-form-section">
                <label className="sp-input-label">Delivery Notes</label>

                <textarea
                  value={form.deliveryNotes}
                  onChange={(e) => updateField("deliveryNotes", e.target.value)}
                  placeholder="Add delivery or handover remarks..."
                  rows="5"
                />
              </div>
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="sp-form-footer">
            <div className="sp-footer-info">
              <span className="sp-save-icon">✓</span>

              <div>
                <strong>Changes are securely saved</strong>

                <small>Your progress is stored in AutoGlow.</small>
              </div>
            </div>

            <div className="sp-footer-actions">
              {/* SAVE & EXIT */}

              <button
                type="button"
                className="sp-secondary-btn"
                onClick={() => navigate("/worker/jobs")}
                disabled={saving}
              >
                Save & Exit
              </button>

              {/* =================================================
                  🔥 ISSUES & REPORTS BUTTON
              ================================================= */}

              {activeStage !== "DELIVERED" && (
                <button
                  type="button"
                  className="sp-issues-btn"
                  onClick={handleIssuesAndReports}
                  disabled={saving}
                >
                  <span className="sp-issues-icon">⚠</span>
                  Issues & Reports
                </button>
              )}

              {/* SAVE & CONTINUE */}

              <button
                type="button"
                className="sp-primary-btn"
                onClick={saveCurrentStage}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : activeStage === "DELIVERED"
                    ? "Confirm Delivery"
                    : "Save & Continue"}

                {!saving && <span>→</span>}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ServiceProgress;
