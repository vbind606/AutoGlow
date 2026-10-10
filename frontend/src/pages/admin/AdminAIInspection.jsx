import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import "./AdminAIInspection.css";

const API_BASE = "http://localhost:8080";

const emptyForm = {
  vehicleNumber: "",
  vehicleType: "CAR",
  image: null,
};

const severityClass = (severity) => {
  const value = String(severity || "LOW").toLowerCase();

  if (value === "critical") return "critical";
  if (value === "high") return "high";
  if (value === "medium") return "medium";
  return "low";
};

const statusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "completed") return "completed";
  if (value === "processing") return "processing";
  if (value === "failed") return "failed";
  return "pending";
};

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE}${imageUrl}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const scoreLabel = (score) => {
  if (score === null || score === undefined) return "N/A";

  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Attention";
  return "Critical";
};

export default function AdminAIInspection() {
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState("");

  const [inspections, setInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("new");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInspections();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/ai-inspections");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.content || [];

      setInspections(data);
    } catch (err) {
      console.error("AI inspections fetch error:", err);
      setError(
        err.response?.data?.message || "Unable to load AI inspection history.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSuccess("");

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imagePreview = URL.createObjectURL(file);

    setPreview(imagePreview);

    setForm((previous) => ({
      ...previous,
      image: file,
    }));
  };

  const removeSelectedImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");

    setForm((previous) => ({
      ...previous,
      image: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    removeSelectedImage();
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const handleStartInspection = async (event) => {
    event.preventDefault();

    if (!form.vehicleNumber.trim()) {
      setError("Vehicle number is required.");
      return;
    }

    if (!form.image) {
      setError("Please upload a vehicle image.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("vehicleNumber", form.vehicleNumber.trim());
      formData.append("vehicleType", form.vehicleType);
      formData.append("image", form.image);

      const response = await api.post("/admin/ai-inspections", formData);

      const createdInspection = response.data?.data || response.data;

      setSuccess("Inspection created successfully.");

      await fetchInspections();

      if (createdInspection?.id) {
        await processInspection(createdInspection.id, true);
      } else {
        setActiveTab("history");
      }
    } catch (err) {
      console.error("AI inspection creation error:", err);

      setError(
        err.response?.data?.message || "Unable to create AI inspection.",
      );
    } finally {
      setUploading(false);
    }
  };

  const processInspection = async (inspectionId, autoOpen = false) => {
    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/admin/ai-inspections/${inspectionId}/process`,
      );

      const processedInspection = response.data?.data || response.data;

      if (processedInspection?.id) {
        setSelectedInspection(processedInspection);
      } else {
        await fetchInspectionById(inspectionId);
      }

      await fetchInspections();

      setSuccess("AI inspection completed successfully.");

      if (autoOpen) {
        setActiveTab("history");
      }
    } catch (err) {
      console.error("AI inspection processing error:", err);

      setError(
        err.response?.data?.message || "AI inspection processing failed.",
      );

      await fetchInspections();
    } finally {
      setProcessing(false);
    }
  };

  const fetchInspectionById = async (inspectionId) => {
    try {
      setError("");

      const response = await api.get(`/admin/ai-inspections/${inspectionId}`);

      const inspection = response.data?.data || response.data;

      setSelectedInspection(inspection);
      setActiveTab("result");

      return inspection;
    } catch (err) {
      console.error("Inspection details error:", err);

      setError(
        err.response?.data?.message || "Unable to load inspection details.",
      );

      return null;
    }
  };

  const handleViewInspection = async (inspection) => {
    await fetchInspectionById(inspection.id);
  };

  const handleReviewFinding = async (findingId) => {
    try {
      setError("");
      setSuccess("");

      await api.post(`/admin/ai-inspections/findings/${findingId}/review`);

      if (selectedInspection?.id) {
        await fetchInspectionById(selectedInspection.id);
      }

      await fetchInspections();

      setSuccess("Finding marked as reviewed.");
    } catch (err) {
      console.error("Finding review error:", err);

      setError(
        err.response?.data?.message || "Unable to mark finding as reviewed.",
      );
    }
  };

  const handleDeleteInspection = async () => {
    if (!selectedInspection?.id) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/admin/ai-inspections/${selectedInspection.id}`);

      setSuccess("Inspection deleted successfully.");

      setShowDeleteModal(false);
      setSelectedInspection(null);
      setActiveTab("history");

      await fetchInspections();
    } catch (err) {
      console.error("Inspection delete error:", err);

      setError(err.response?.data?.message || "Unable to delete inspection.");
    }
  };

  const filteredInspections = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inspections.filter((inspection) => {
      const matchesSearch =
        !query ||
        String(inspection.vehicleNumber || "")
          .toLowerCase()
          .includes(query) ||
        String(inspection.vehicleType || "")
          .toLowerCase()
          .includes(query) ||
        String(inspection.status || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(inspection.status || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inspections, search, statusFilter]);

  const stats = useMemo(() => {
    const completed = inspections.filter(
      (item) => String(item.status || "").toUpperCase() === "COMPLETED",
    ).length;

    const processingCount = inspections.filter(
      (item) => String(item.status || "").toUpperCase() === "PROCESSING",
    ).length;

    const failed = inspections.filter(
      (item) => String(item.status || "").toUpperCase() === "FAILED",
    ).length;

    const scores = inspections
      .map((item) => Number(item.overallScore))
      .filter((score) => !Number.isNaN(score));

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length,
          )
        : 0;

    return {
      total: inspections.length,
      completed,
      processing: processingCount,
      failed,
      averageScore,
    };
  }, [inspections]);

  const renderScoreRing = (score) => {
    const safeScore =
      score === null || score === undefined
        ? 0
        : Math.max(0, Math.min(100, Number(score)));

    return (
      <div
        className="ai-score-ring"
        style={{
          "--score": `${safeScore * 3.6}deg`,
        }}
      >
        <div className="ai-score-inner">
          <strong>{score ?? "—"}</strong>
          <span>/100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="ai-inspection-page">
      <div className="ai-page-glow ai-glow-one" />
      <div className="ai-page-glow ai-glow-two" />

      <div className="ai-inspection-container">
        <header className="ai-inspection-header">
          <div>
            <div className="ai-eyebrow">
              <span className="ai-eyebrow-dot" />
              AUTO VEHICLE INTELLIGENCE
            </div>

            <h1>
              AI Vehicle
              <span> Inspection</span>
            </h1>

            <p>
              Upload a vehicle image and generate an intelligent inspection
              report with damage findings, severity, confidence and
              recommendations.
            </p>
          </div>

          <div className="ai-header-badge">
            <span className="ai-pulse" />
            AI INSPECTION ENGINE
          </div>
        </header>

        {error && (
          <div className="ai-alert ai-alert-error">
            <span>!</span>
            <div>{error}</div>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {success && (
          <div className="ai-alert ai-alert-success">
            <span>✓</span>
            <div>{success}</div>
            <button onClick={() => setSuccess("")}>×</button>
          </div>
        )}

        <section className="ai-stat-grid">
          <div className="ai-stat-card">
            <div className="ai-stat-icon">◎</div>
            <div>
              <span>Total Inspections</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="ai-stat-card">
            <div className="ai-stat-icon">✓</div>
            <div>
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>
          </div>

          <div className="ai-stat-card">
            <div className="ai-stat-icon">◌</div>
            <div>
              <span>Processing</span>
              <strong>{stats.processing}</strong>
            </div>
          </div>

          <div className="ai-stat-card">
            <div className="ai-stat-icon">★</div>
            <div>
              <span>Average Score</span>
              <strong>
                {stats.averageScore > 0 ? `${stats.averageScore}/100` : "—"}
              </strong>
            </div>
          </div>
        </section>

        <div className="ai-tab-bar">
          <button
            className={activeTab === "new" ? "active" : ""}
            onClick={() => setActiveTab("new")}
          >
            <span>＋</span>
            New Inspection
          </button>

          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            <span>◫</span>
            Inspection History
          </button>

          {selectedInspection && (
            <button
              className={activeTab === "result" ? "active" : ""}
              onClick={() => setActiveTab("result")}
            >
              <span>✦</span>
              Inspection Result
            </button>
          )}
        </div>

        {activeTab === "new" && (
          <section className="ai-main-card">
            <div className="ai-card-heading">
              <div>
                <span className="ai-section-kicker">NEW ANALYSIS</span>
                <h2>Start Vehicle Inspection</h2>
                <p>
                  Provide vehicle information and upload a clear vehicle image.
                </p>
              </div>

              <div className="ai-step-indicator">
                <span className="active">01</span>
                <i />
                <span>02</span>
                <i />
                <span>03</span>
              </div>
            </div>

            <form
              className="ai-inspection-form"
              onSubmit={handleStartInspection}
            >
              <div className="ai-form-left">
                <div className="ai-form-group">
                  <label>
                    Vehicle Number
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="vehicleNumber"
                    value={form.vehicleNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. UP16 AB 1234"
                    maxLength={30}
                  />
                </div>

                <div className="ai-form-group">
                  <label>
                    Vehicle Type
                    <span>*</span>
                  </label>

                  <select
                    name="vehicleType"
                    value={form.vehicleType}
                    onChange={handleInputChange}
                  >
                    <option value="CAR">Car</option>
                    <option value="BIKE">Bike</option>
                    <option value="SUV">SUV</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="HATCHBACK">Hatchback</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="ai-info-box">
                  <div className="ai-info-icon">i</div>
                  <div>
                    <strong>Inspection tip</strong>
                    <p>
                      Use a clear, well-lit photo where the vehicle surface and
                      visible damage can be clearly identified.
                    </p>
                  </div>
                </div>

                <div className="ai-supported-box">
                  <span>✓</span>
                  <div>
                    <strong>Supported formats</strong>
                    <small>JPG, JPEG, PNG, WEBP · Max 5MB</small>
                  </div>
                </div>
              </div>

              <div className="ai-upload-section">
                <label className="ai-upload-label">
                  Vehicle Image
                  <span>*</span>
                </label>

                {!preview ? (
                  <button
                    type="button"
                    className="ai-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="ai-upload-icon">↑</div>

                    <strong>Upload Vehicle Image</strong>

                    <span>Drag & drop your image here</span>

                    <small>or click to browse</small>

                    <div className="ai-upload-button">Choose Image</div>
                  </button>
                ) : (
                  <div className="ai-preview-box">
                    <img src={preview} alt="Vehicle preview" />

                    <div className="ai-preview-overlay">
                      <span>READY FOR INSPECTION</span>
                    </div>

                    <button
                      type="button"
                      className="ai-remove-image"
                      onClick={removeSelectedImage}
                    >
                      ×
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  hidden
                />

                <div className="ai-upload-status">
                  <span className={form.image ? "done" : ""}>
                    {form.image ? "✓" : "○"}
                  </span>
                  {form.image ? form.image.name : "No image selected"}
                </div>
              </div>

              <div className="ai-form-footer">
                <button
                  type="button"
                  className="ai-secondary-btn"
                  onClick={resetForm}
                  disabled={uploading || processing}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="ai-primary-btn"
                  disabled={uploading || processing}
                >
                  {uploading || processing ? (
                    <>
                      <span className="ai-spinner" />
                      {processing ? "Analyzing Vehicle..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <span>✦</span>
                      Start AI Inspection
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === "history" && (
          <section className="ai-main-card">
            <div className="ai-card-heading history-heading">
              <div>
                <span className="ai-section-kicker">ANALYSIS HISTORY</span>
                <h2>Vehicle Inspections</h2>
                <p>Review previous AI vehicle inspection reports.</p>
              </div>

              <button
                className="ai-refresh-btn"
                onClick={fetchInspections}
                disabled={loading}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="ai-filters">
              <div className="ai-search-box">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search vehicle number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PROCESSING">Processing</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {loading ? (
              <div className="ai-loading-state">
                <span className="ai-big-spinner" />
                <strong>Loading inspections...</strong>
              </div>
            ) : filteredInspections.length === 0 ? (
              <div className="ai-empty-state">
                <div>◎</div>
                <h3>No inspections found</h3>
                <p>Start a new vehicle inspection to generate an AI report.</p>

                <button
                  className="ai-primary-btn"
                  onClick={() => setActiveTab("new")}
                >
                  + New Inspection
                </button>
              </div>
            ) : (
              <div className="ai-table-wrap">
                <table className="ai-inspection-table">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Type</th>
                      <th>Score</th>
                      <th>Findings</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInspections.map((inspection) => (
                      <tr key={inspection.id}>
                        <td>
                          <div className="ai-vehicle-cell">
                            <div className="ai-mini-car">🚘</div>
                            <div>
                              <strong>{inspection.vehicleNumber || "-"}</strong>
                              <small>ID #{inspection.id}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="ai-type-pill">
                            {inspection.vehicleType || "-"}
                          </span>
                        </td>

                        <td>
                          <div className="ai-table-score">
                            <strong>{inspection.overallScore ?? "—"}</strong>
                            {inspection.overallScore !== null &&
                              inspection.overallScore !== undefined && (
                                <span>/100</span>
                              )}
                          </div>
                        </td>

                        <td>
                          <span className="ai-finding-count">
                            {inspection.findingCount ?? 0}
                          </span>

                          {Number(inspection.highSeverityCount || 0) > 0 && (
                            <span className="ai-high-count">
                              {inspection.highSeverityCount} high
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            className={`ai-status ${statusClass(
                              inspection.status,
                            )}`}
                          >
                            <i />
                            {inspection.status || "PENDING"}
                          </span>
                        </td>

                        <td className="ai-date-cell">
                          {formatDate(inspection.createdAt)}
                        </td>

                        <td>
                          <button
                            className="ai-view-btn"
                            onClick={() => handleViewInspection(inspection)}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "result" && selectedInspection && (
          <section className="ai-result-section">
            <div className="ai-result-topbar">
              <div>
                <button
                  className="ai-back-btn"
                  onClick={() => setActiveTab("history")}
                >
                  ← Back to History
                </button>

                <span className="ai-section-kicker">INSPECTION REPORT</span>

                <h2>{selectedInspection.vehicleNumber}</h2>

                <p>
                  {selectedInspection.vehicleType || "Vehicle"} · Inspection #
                  {selectedInspection.id} ·{" "}
                  {formatDate(selectedInspection.createdAt)}
                </p>
              </div>

              <div className="ai-result-actions">
                <span
                  className={`ai-status ${statusClass(
                    selectedInspection.status,
                  )}`}
                >
                  <i />
                  {selectedInspection.status}
                </span>

                {String(selectedInspection.status || "").toUpperCase() ===
                  "PENDING" && (
                  <button
                    className="ai-primary-btn"
                    onClick={() => processInspection(selectedInspection.id)}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <span className="ai-spinner" />
                        Processing...
                      </>
                    ) : (
                      <>✦ Run AI</>
                    )}
                  </button>
                )}

                <button
                  className="ai-danger-outline"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="ai-result-grid">
              <div className="ai-result-image-card">
                {selectedInspection.imageUrl ? (
                  <img
                    src={getImageUrl(selectedInspection.imageUrl)}
                    alt="Inspected vehicle"
                  />
                ) : (
                  <div className="ai-no-image">No image available</div>
                )}

                <div className="ai-image-caption">
                  <span>VEHICLE IMAGE</span>
                  <strong>{selectedInspection.vehicleNumber}</strong>
                </div>
              </div>

              <div className="ai-score-card">
                <span className="ai-section-kicker">OVERALL CONDITION</span>

                <div className="ai-score-display">
                  {renderScoreRing(selectedInspection.overallScore)}

                  <div>
                    <strong>
                      {scoreLabel(selectedInspection.overallScore)}
                    </strong>

                    <p>
                      Based on detected visual conditions and inspection
                      findings.
                    </p>
                  </div>
                </div>

                <div className="ai-score-stats">
                  <div>
                    <span>Total Findings</span>
                    <strong>
                      {selectedInspection.findingCount ??
                        selectedInspection.findings?.length ??
                        0}
                    </strong>
                  </div>

                  <div>
                    <span>High Severity</span>
                    <strong className="danger-text">
                      {selectedInspection.highSeverityCount ?? 0}
                    </strong>
                  </div>

                  <div>
                    <span>Confidence</span>
                    <strong>
                      {selectedInspection.averageConfidence != null
                        ? `${Math.round(selectedInspection.averageConfidence)}%`
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="ai-summary-grid">
              <div className="ai-report-card">
                <div className="ai-report-heading">
                  <span>✦</span>
                  <div>
                    <span className="ai-section-kicker">AI SUMMARY</span>
                    <h3>Inspection Summary</h3>
                  </div>
                </div>

                <p>{selectedInspection.summary || "No summary available."}</p>
              </div>

              <div className="ai-report-card">
                <div className="ai-report-heading">
                  <span>↗</span>
                  <div>
                    <span className="ai-section-kicker">RECOMMENDATIONS</span>
                    <h3>Recommended Actions</h3>
                  </div>
                </div>

                <p>
                  {selectedInspection.recommendations ||
                    "No recommendations available."}
                </p>
              </div>
            </div>

            {selectedInspection.errorMessage && (
              <div className="ai-failed-card">
                <strong>Inspection Error</strong>
                <p>{selectedInspection.errorMessage}</p>
              </div>
            )}

            <div className="ai-findings-card">
              <div className="ai-card-heading">
                <div>
                  <span className="ai-section-kicker">DETECTED ISSUES</span>

                  <h2>
                    Inspection Findings
                    <span className="ai-heading-count">
                      {selectedInspection.findings?.length || 0}
                    </span>
                  </h2>

                  <p>Detailed issues identified during vehicle inspection.</p>
                </div>
              </div>

              {!selectedInspection.findings ||
              selectedInspection.findings.length === 0 ? (
                <div className="ai-no-findings">
                  <div>✓</div>
                  <h3>No visible issues detected</h3>
                  <p>The inspection did not return any specific findings.</p>
                </div>
              ) : (
                <div className="ai-findings-list">
                  {selectedInspection.findings.map((finding, index) => (
                    <div className="ai-finding-card" key={finding.id || index}>
                      <div
                        className={`ai-severity-line ${severityClass(
                          finding.severity,
                        )}`}
                      />

                      <div className="ai-finding-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="ai-finding-content">
                        <div className="ai-finding-top">
                          <div>
                            <div className="ai-finding-tags">
                              <span
                                className={`ai-severity-badge ${severityClass(
                                  finding.severity,
                                )}`}
                              >
                                {finding.severity || "LOW"}
                              </span>

                              {finding.area && (
                                <span className="ai-area-badge">
                                  {finding.area}
                                </span>
                              )}
                            </div>

                            <h3>
                              {finding.title ||
                                finding.issueType ||
                                "Vehicle Issue"}
                            </h3>
                          </div>

                          <div className="ai-confidence">
                            <span>Confidence</span>
                            <strong>
                              {finding.confidence != null
                                ? `${Math.round(finding.confidence)}%`
                                : "—"}
                            </strong>
                          </div>
                        </div>

                        <p className="ai-finding-description">
                          {finding.description || "No description available."}
                        </p>

                        <div className="ai-finding-bottom">
                          <div className="ai-action-info">
                            <span>Recommended Action</span>
                            <strong>
                              {finding.recommendedAction ||
                                "Manual inspection recommended"}
                            </strong>
                          </div>

                          <div className="ai-cost-info">
                            <span>Estimated Cost</span>
                            <strong>
                              {finding.estimatedCost != null
                                ? `₹${Number(
                                    finding.estimatedCost,
                                  ).toLocaleString("en-IN")}`
                                : "—"}
                            </strong>
                          </div>

                          <button
                            className={
                              finding.reviewed
                                ? "ai-reviewed-btn"
                                : "ai-review-btn"
                            }
                            disabled={Boolean(finding.reviewed)}
                            onClick={() => handleReviewFinding(finding.id)}
                          >
                            {finding.reviewed ? "✓ Reviewed" : "Mark Reviewed"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {showDeleteModal && (
        <div className="ai-modal-backdrop">
          <div className="ai-delete-modal">
            <div className="ai-modal-icon">!</div>

            <h3>Delete Inspection?</h3>

            <p>
              This will permanently delete the inspection and all associated
              findings. This action cannot be undone.
            </p>

            <div className="ai-modal-actions">
              <button
                className="ai-secondary-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="ai-danger-btn"
                onClick={handleDeleteInspection}
              >
                Delete Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
