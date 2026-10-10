import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./WorkerInspection.css";

const STATUS_LABELS = {
  RECEIVED: "Vehicle Received",
  INSPECTION: "Inspection",
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Inspection Completed",
  FAILED: "Inspection Failed",
};

const SEVERITY_CLASS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

function WorkerInspection() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [inspectionData, setInspectionData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =========================================================
     LOAD INSPECTION
  ========================================================= */

  useEffect(() => {
    loadInspection();

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const loadInspection = async () => {
    if (!bookingId) {
      setError("Booking ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/worker/ai-inspections/${bookingId}`);

      setInspectionData(response.data);
    } catch (err) {
      console.error("Inspection loading error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null);

      setError(backendMessage || "Unable to load vehicle inspection.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     IMAGE SELECT
  ========================================================= */

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image size must be less than or equal to 5 MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewUrl(url);
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeSelectedImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     UPLOAD IMAGE
  ========================================================= */

  const uploadInspectionImage = async () => {
    if (!selectedImage) {
      setError("Please select a vehicle image first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const formData = new FormData();

      formData.append("image", selectedImage);

      const response = await api.post(
        `/worker/ai-inspections/${bookingId}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setInspectionData(response.data);

      removeSelectedImage();

      setMessage("Vehicle image uploaded successfully.");
    } catch (err) {
      console.error("Inspection upload error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null);

      setError(backendMessage || "Unable to upload inspection image.");
    } finally {
      setUploading(false);
    }
  };

  /* =========================================================
     PROCESS AI INSPECTION
  ========================================================= */

  const processInspection = async () => {
    if (!inspectionData?.inspection?.id) {
      setError(
        "Inspection is not available. Please upload a vehicle image first.",
      );
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setMessage("");

      const response = await api.post(
        `/worker/ai-inspections/${bookingId}/process`,
      );

      setInspectionData(response.data);

      setMessage("Vehicle inspection processing completed.");
    } catch (err) {
      console.error("Inspection processing error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null);

      setError(backendMessage || "Unable to process vehicle inspection.");
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return STATUS_LABELS[status] || status.replaceAll("_", " ");
  };

  const getSeverityClass = (severity) => {
    return SEVERITY_CLASS[severity] || "low";
  };

  const formatConfidence = (confidence) => {
    if (confidence === null || confidence === undefined) {
      return "—";
    }

    return `${Math.round(confidence)}%`;
  };

  const formatCost = (cost) => {
    if (cost === null || cost === undefined) {
      return "Not estimated";
    }

    return `₹${Number(cost).toLocaleString("en-IN")}`;
  };

  /* =========================================================
     DATA
  ========================================================= */

  const inspection = inspectionData?.inspection;

  const findings = inspection?.findings || [];

  const hasInspection = Boolean(inspection);

  const currentStatus = inspection?.status || inspectionData?.status;

  const isProcessing = inspection?.status === "PROCESSING" || processing;

  const isCompleted = inspection?.status === "COMPLETED";

  const isFailed = inspection?.status === "FAILED";

  const overallScore = inspection?.overallScore ?? 0;

  const findingCount = inspection?.findingCount ?? findings.length;

  const highSeverityCount = inspection?.highSeverityCount ?? 0;

  const confidence = inspection?.averageConfidence;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="worker-inspection-page">
        <div className="inspection-loading">
          <div className="loading-spinner"></div>

          <h3>Loading AI Inspection</h3>

          <p>Preparing vehicle inspection workspace...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="worker-inspection-page">
      {/* =====================================================
          TOP PAGE HEADER
      ===================================================== */}

      <header className="inspection-topbar">
        <div className="inspection-breadcrumb">
          <strong>AutoGlow</strong>
          <span>/</span>
          <span>Worker Portal</span>
          <span>/</span>
          <span>AI Vehicle Inspection</span>
        </div>

        <div className="inspection-heading-row">
          <div className="inspection-heading">
            <div className="heading-dot"></div>

            <div>
              <h1>AI Vehicle Inspection</h1>

              <p>
                Capture the vehicle condition and review AI inspection findings.
              </p>
            </div>
          </div>

          <div className="inspection-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search jobs, vehicles, customers..."
            />

            <button type="button">Search</button>
          </div>

          <div className="worker-online">
            <span className="online-dot"></span>

            <div>
              <strong>Online</strong>
              <small>Available for work</small>
            </div>
          </div>

          <button className="notification-button" type="button">
            ♧
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="inspection-main">
        {/* ===================================================
            HERO
        =================================================== */}

        <section className="inspection-hero">
          <div className="hero-overlay"></div>

          <div className="hero-content">
            <button
              className="hero-back-button"
              onClick={() => navigate("/worker/jobs")}
              disabled={uploading || processing}
              type="button"
            >
              <span>←</span>
              Back to Jobs
            </button>

            <div className="hero-label">
              <span>✦</span>
              AI VEHICLE INSPECTION
            </div>

            <h2>Vehicle Inspection</h2>

            <p>
              Capture the vehicle condition and review AI inspection findings.
            </p>
          </div>

          <div className="hero-booking">
            <span>BOOKING</span>

            <strong>#{bookingId}</strong>

            <div className="booking-icon">▣</div>
          </div>
        </section>

        {/* ===================================================
            ALERTS
        =================================================== */}

        {error && (
          <div className="inspection-alert error-alert">
            <div className="alert-symbol">!</div>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button type="button" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {message && (
          <div className="inspection-alert success-alert">
            <div className="alert-symbol">✓</div>

            <div>
              <strong>Success</strong>
              <p>{message}</p>
            </div>

            <button type="button" onClick={() => setMessage("")}>
              ×
            </button>
          </div>
        )}

        {/* ===================================================
            VEHICLE SUMMARY
        =================================================== */}

        <section className="vehicle-summary-card">
          <div className="vehicle-summary-left">
            <div className="vehicle-photo">
              {inspectionData?.vehicleImageUrl ? (
                <img src={inspectionData.vehicleImageUrl} alt="Vehicle" />
              ) : (
                <span>🚗</span>
              )}
            </div>

            <div className="vehicle-main-info">
              <h2>{inspectionData?.vehicleNumber || "Vehicle Number"}</h2>

              <div className="vehicle-meta">
                <span>◉ {inspectionData?.vehicleBrand || "Vehicle Brand"}</span>

                <span>•</span>

                <span>▣ {inspectionData?.vehicleModel || "Vehicle Model"}</span>

                <span>•</span>

                <span>◈ {inspectionData?.vehicleType || "Car"}</span>
              </div>
            </div>
          </div>

          <div className="vehicle-summary-divider"></div>

          <div className="vehicle-status-block">
            <span className="summary-label">CURRENT STATUS</span>

            <div className="status-pill">
              <span></span>

              {getStatusLabel(currentStatus)}
            </div>
          </div>

          <div className="summary-metric">
            <div className="metric-icon score-icon">◉</div>

            <div>
              <strong>{overallScore}</strong>
              <span>Overall Score</span>
            </div>
          </div>

          <div className="summary-metric">
            <div className="metric-icon finding-icon">▤</div>

            <div>
              <strong>{findingCount}</strong>
              <span>Findings</span>
            </div>
          </div>

          <div className="summary-metric">
            <div className="metric-icon confidence-icon">◎</div>

            <div>
              <strong>{formatConfidence(confidence)}</strong>

              <span>Confidence</span>
            </div>
          </div>
        </section>

        {/* ===================================================
            MAIN TWO COLUMN GRID
        =================================================== */}

        <div className="inspection-grid">
          {/* =================================================
              STEP 01
          ================================================= */}

          <section className="inspection-card upload-card">
            <div className="inspection-card-header">
              <div className="card-title-area">
                <div className="card-icon-box camera-icon">◉</div>

                <div>
                  <span className="step-label">STEP 01</span>

                  <h2>Vehicle Image</h2>

                  <p>Upload a clear exterior image of the vehicle.</p>
                </div>
              </div>

              <div className="card-status-dot"></div>
            </div>

            <div className="card-divider"></div>

            {/* UPLOAD */}

            {!previewUrl ? (
              <div
                className="premium-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-cloud">↑</div>

                <h3>Drag & drop or click to upload</h3>

                <p>Upload a clear vehicle exterior image</p>

                <span>JPG, PNG or WEBP&nbsp; • &nbsp;Max 5 MB</span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  hidden
                />
              </div>
            ) : (
              <div className="premium-image-preview">
                <img src={previewUrl} alt="Vehicle inspection preview" />

                <div className="preview-overlay">
                  <span>Image Selected</span>
                </div>

                <button
                  className="preview-remove"
                  onClick={removeSelectedImage}
                  disabled={uploading}
                  type="button"
                >
                  ×
                </button>
              </div>
            )}

            {/* FILE */}

            {selectedImage && (
              <div className="uploaded-file-row">
                <div className="uploaded-thumb">
                  <img src={previewUrl} alt="Selected vehicle" />
                </div>

                <div className="uploaded-file-info">
                  <strong>{selectedImage.name}</strong>

                  <span>
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </span>

                  <small>✓ Ready for inspection</small>
                </div>

                <button
                  type="button"
                  onClick={removeSelectedImage}
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            )}

            {/* BUTTONS */}

            <div className="upload-actions">
              <button
                className="outline-action-button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || processing}
              >
                <span>♧</span>
                Choose Image
              </button>

              <button
                className="gradient-action-button"
                type="button"
                onClick={uploadInspectionImage}
                disabled={!selectedImage || uploading || processing}
              >
                <span>{uploading ? "◌" : "↑"}</span>

                {uploading ? "Uploading..." : "Upload for Inspection"}
              </button>
            </div>
          </section>

          {/* =================================================
              STEP 02
          ================================================= */}

          <section className="inspection-card result-card">
            <div className="inspection-card-header">
              <div className="card-title-area">
                <div className="card-icon-box ai-icon">✦</div>

                <div>
                  <span className="step-label">STEP 02</span>

                  <h2>Inspection Result</h2>

                  <p>Review the vehicle inspection analysis.</p>
                </div>
              </div>

              <div className="ai-powered-badge">
                <span>✦</span>

                <div>
                  <strong>AI Analysis</strong>
                  <small>Powered by Computer Vision</small>
                </div>
              </div>
            </div>

            <div className="card-divider"></div>

            {!hasInspection ? (
              <div className="empty-inspection">
                <div className="empty-ai-icon">✦</div>

                <h3>Inspection Not Started</h3>

                <p>Upload a vehicle image to create an inspection.</p>
              </div>
            ) : (
              <>
                {/* SCORE */}

                <div className="score-result-box">
                  <div
                    className="score-ring"
                    style={{
                      "--score": `${overallScore}%`,
                    }}
                  >
                    <div className="score-ring-inner">
                      <strong>{overallScore}</strong>

                      <span>/100</span>
                    </div>
                  </div>

                  <div className="score-result-info">
                    <span>OVERALL SCORE</span>

                    <h3>
                      {isCompleted
                        ? "Inspection Ready"
                        : getStatusLabel(inspection?.status)}
                    </h3>

                    <p>
                      {inspection?.summary ||
                        "Vehicle inspection analysis is ready."}
                    </p>
                  </div>
                </div>

                {/* SMALL STATS */}

                <div className="result-stats-grid">
                  <div className="result-stat">
                    <div className="result-stat-icon finding">◉</div>

                    <div>
                      <strong>{findingCount}</strong>

                      <span>Findings</span>
                    </div>
                  </div>

                  <div className="result-stat">
                    <div className="result-stat-icon warning">⚠</div>

                    <div>
                      <strong>{highSeverityCount}</strong>

                      <span>High Severity</span>
                    </div>
                  </div>

                  <div className="result-stat">
                    <div className="result-stat-icon confidence">◎</div>

                    <div>
                      <strong>{formatConfidence(confidence)}</strong>

                      <span>Confidence</span>
                    </div>
                  </div>
                </div>

                {/* SUMMARY */}

                <div className="inspection-summary-box">
                  <div className="summary-icon">▣</div>

                  <div>
                    <span>INSPECTION SUMMARY</span>

                    <p>
                      {inspection?.summary ||
                        "No inspection summary available."}
                    </p>
                  </div>
                </div>

                {/* AI PENDING */}

                {inspection?.analysisStatus === "PENDING_AI_MODEL" && (
                  <div className="ai-pending-box">
                    <div className="pending-icon">✦</div>

                    <div>
                      <strong>AI Vision Model Pending</strong>

                      <p>
                        Vehicle image uploaded successfully. The computer-vision
                        model is not connected yet, so manual inspection is
                        recommended.
                      </p>
                    </div>
                  </div>
                )}

                {/* PROCESS */}

                {!isCompleted && inspection?.id && (
                  <button
                    className="run-ai-button"
                    type="button"
                    onClick={processInspection}
                    disabled={isProcessing || isFailed}
                  >
                    <span>{isProcessing ? "◌" : "▶"}</span>

                    {isProcessing
                      ? "Processing Inspection..."
                      : isFailed
                        ? "Inspection Failed"
                        : "Run AI Inspection"}
                  </button>
                )}
              </>
            )}
          </section>
        </div>

        {/* ===================================================
            FINDINGS
        =================================================== */}

        {hasInspection && (
          <section className="inspection-card findings-card">
            <div className="inspection-card-header">
              <div className="card-title-area">
                <div className="card-icon-box findings-icon">⚠</div>

                <div>
                  <span className="step-label">INSPECTION DETAILS</span>

                  <h2>Vehicle Findings</h2>

                  <p>Detected issues and recommended actions.</p>
                </div>
              </div>

              <div className="finding-count-badge">{findings.length}</div>
            </div>

            <div className="card-divider"></div>

            {findings.length === 0 ? (
              <div className="no-findings">
                <div className="no-findings-icon">✓</div>

                <h3>No Findings Available</h3>

                <p>
                  No AI findings are currently available for this inspection.
                </p>
              </div>
            ) : (
              <div className="findings-list">
                {findings.map((finding, index) => {
                  const severity = finding?.severity || "LOW";

                  return (
                    <article
                      className="finding-item"
                      key={finding?.id || index}
                    >
                      <div className="finding-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="finding-content">
                        <div className="finding-heading">
                          <div>
                            <h3>{finding?.title || "Vehicle Issue"}</h3>

                            <span>{finding?.area || "Vehicle"}</span>
                          </div>

                          <span
                            className={`severity-badge ${getSeverityClass(
                              severity,
                            )}`}
                          >
                            {severity}
                          </span>
                        </div>

                        <p>
                          {finding?.description || "No description available."}
                        </p>

                        <div className="finding-bottom">
                          <span>
                            Confidence{" "}
                            <strong>
                              {formatConfidence(finding?.confidence)}
                            </strong>
                          </span>

                          <span>
                            Est. Cost{" "}
                            <strong>
                              {formatCost(finding?.estimatedCost)}
                            </strong>
                          </span>
                        </div>

                        {finding?.recommendedAction && (
                          <div className="recommended-action">
                            <span>RECOMMENDED ACTION</span>

                            <p>{finding.recommendedAction}</p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ===================================================
            RECOMMENDATION
        =================================================== */}

        {hasInspection && inspection?.recommendations && (
          <section className="recommendation-card">
            <div className="recommendation-icon">✦</div>

            <div>
              <span>INSPECTION RECOMMENDATION</span>

              <h3>AI Service Recommendation</h3>

              <p>{inspection.recommendations}</p>
            </div>
          </section>
        )}

        {/* ===================================================
            FOOTER ACTIONS
        =================================================== */}

        <div className="inspection-footer-actions">
          <button
            className="footer-back-button"
            onClick={() => navigate("/worker/jobs")}
            disabled={uploading || processing}
            type="button"
          >
            ← Back to My Jobs
          </button>

          {isCompleted && (
            <button
              className="footer-continue-button"
              onClick={() => navigate(`/worker/washing/${bookingId}`)}
              type="button"
            >
              Continue to Washing
              <span>→</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default WorkerInspection;
