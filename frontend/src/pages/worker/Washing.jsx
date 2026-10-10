import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./Washing.css";

const Washing = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [washing, setWashing] = useState({
    washType: "",
    exteriorWash: false,
    interiorCleaning: false,
    foamWash: false,
    pressureWash: false,
    wheelCleaning: false,
    glassCleaning: false,
    vacuumCleaning: false,
    polishApplied: false,
    washingNotes: "",
  });

  useEffect(() => {
    loadData();
  }, [bookingId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const jobsResponse = await api.get("/worker/jobs");

      const jobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];

      const foundJob = jobs.find(
        (job) => String(job.bookingId) === String(bookingId),
      );

      if (!foundJob) {
        alert("Booking nahi mili.");
        navigate("/worker/jobs");
        return;
      }

      setBooking(foundJob);

      // Existing washing record
      try {
        const washingResponse = await api.get(`/worker/washings/${bookingId}`);

        if (washingResponse.data) {
          setWashing({
            washType: washingResponse.data.washType || "",
            exteriorWash: washingResponse.data.exteriorWash || false,
            interiorCleaning: washingResponse.data.interiorCleaning || false,
            foamWash: washingResponse.data.foamWash || false,
            pressureWash: washingResponse.data.pressureWash || false,
            wheelCleaning: washingResponse.data.wheelCleaning || false,
            glassCleaning: washingResponse.data.glassCleaning || false,
            vacuumCleaning: washingResponse.data.vacuumCleaning || false,
            polishApplied: washingResponse.data.polishApplied || false,
            washingNotes: washingResponse.data.washingNotes || "",
          });
        }
      } catch (error) {
        // Record nahi mila to blank form normal hai
        if (error.response?.status !== 404) {
          console.error("Washing record error:", error);
        }
      }
    } catch (error) {
      console.error("Washing page error:", error);

      alert(
        error.response?.data?.message || "Booking details load nahi ho paayi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setWashing((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveWashing = async (event) => {
    event.preventDefault();

    if (!washing.washType) {
      alert("Please select wash type.");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/worker/washings/${bookingId}`, washing);

      alert(`Booking #${bookingId} washing started successfully.`);

      navigate("/worker/jobs");
    } catch (error) {
      console.error("Washing save error:", error);

      alert(
        error.response?.data?.message || "Washing details save nahi ho paayi.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="washing-loading">
        <div className="washing-spinner"></div>
        <p>Loading washing details...</p>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="washing-page">
      <div className="washing-header">
        <div>
          <span className="washing-eyebrow">AUTOGLOW WORKER PANEL</span>

          <h1>Vehicle Washing</h1>

          <p>Start and record the washing process for this vehicle.</p>
        </div>

        <button
          className="washing-back-btn"
          onClick={() => navigate("/worker/jobs")}
        >
          ← Back to My Jobs
        </button>
      </div>

      <div className="washing-container">
        {/* Vehicle Information */}
        <section className="washing-card vehicle-card">
          <div className="section-heading">
            <div className="section-icon">🚗</div>

            <div>
              <h2>Vehicle Information</h2>
              <p>Assigned booking details</p>
            </div>

            <span className="status-pill">{booking.status}</span>
          </div>

          <div className="vehicle-grid">
            <div className="vehicle-info">
              <span>Booking ID</span>
              <strong>#{booking.bookingId}</strong>
            </div>

            <div className="vehicle-info">
              <span>Customer</span>
              <strong>{booking.customerName || "—"}</strong>
            </div>

            <div className="vehicle-info">
              <span>Vehicle</span>
              <strong>{booking.vehicleNumber || "—"}</strong>
            </div>

            <div className="vehicle-info">
              <span>Vehicle Type</span>
              <strong>{booking.vehicleType || "—"}</strong>
            </div>

            <div className="vehicle-info">
              <span>Brand / Model</span>
              <strong>
                {booking.vehicleBrand || ""} {booking.vehicleModel || ""}
              </strong>
            </div>

            <div className="vehicle-info">
              <span>Service</span>
              <strong>
                {booking.serviceName || booking.packageName || "Vehicle Wash"}
              </strong>
            </div>
          </div>
        </section>

        {/* Washing Form */}
        <form className="washing-card" onSubmit={saveWashing}>
          <div className="section-heading">
            <div className="section-icon">🧼</div>

            <div>
              <h2>Washing Process</h2>
              <p>Select the washing service and complete the checklist.</p>
            </div>
          </div>

          {/* Wash Type */}
          <div className="form-group">
            <label>
              Wash Type <span>*</span>
            </label>

            <select
              name="washType"
              value={washing.washType}
              onChange={handleChange}
            >
              <option value="">Select wash type</option>
              <option value="BASIC_WASH">Basic Wash</option>
              <option value="PREMIUM_WASH">Premium Wash</option>
              <option value="DEEP_CLEANING">Deep Cleaning</option>
              <option value="FULL_DETAILING">Full Detailing</option>
            </select>
          </div>

          {/* Checklist */}
          <div className="checklist-section">
            <div className="checklist-title">
              <h3>Washing Checklist</h3>
              <span>Complete applicable tasks</span>
            </div>

            <div className="checklist-grid">
              <label className="check-item">
                <input
                  type="checkbox"
                  name="exteriorWash"
                  checked={washing.exteriorWash}
                  onChange={handleChange}
                />
                <span className="custom-check"></span>
                <div>
                  <strong>Exterior Wash</strong>
                  <small>Complete exterior cleaning</small>
                </div>
              </label>

              <label className="check-item">
                <input
                  type="checkbox"
                  name="interiorCleaning"
                  checked={washing.interiorCleaning}
                  onChange={handleChange}
                />
                <span className="custom-check"></span>
                <div>
                  <strong>Interior Cleaning</strong>
                  <small>Dashboard and interior surfaces</small>
                </div>
              </label>

              <label className="check-item">
                <input
                  type="checkbox"
                  name="foamWash"
                  checked={washing.foamWash}
                  onChange={handleChange}
                />
                <span className="custom-check"></span>
                <div>
                  <strong>Foam Wash</strong>
                  <small>Apply foam cleaning</small>
                </div>
              </label>

              <label className="check-item">
                <input
                  type="checkbox"
                  name="pressureWash"
                  checked={washing.pressureWash}
                  onChange={handleChange}
                />
                <span className="custom-check"></span>
                <div>
                  <strong>Pressure Wash</strong>
                  <small>High pressure exterior cleaning</small>
                </div>
              </label>

              <label className="check-item">
                <input
                  type="checkbox"
                  name="wheelCleaning"
                  checked={washing.wheelCleaning}
                  onChange={handleChange}
                />
                <span className="custom-check"></span>
                <div>
                  <strong>Wheel Cleaning</strong>
                  <small>Wheels and tyre cleaning</small>
                </div>
              </label>

              <label className="check-item">
                <input
                  type="checkbox"
                  name="glassCleaning"
                  checked={washing.glassCleaning}
                  onChange={handleChange}
                />
                <span className="custom-check"></span>
                <div>
                  <strong>Glass Cleaning</strong>
                  <small>Windows and mirrors</small>
                </div>
              </label>

              <label className="check-item">
                <input
                  type="checkbox"
                  name="vacuumCleaning"
                  checked={washing.vacuumCleaning}
                  onChange={handleChange}
                />
                <span className="custom-check"></span>
                <div>
                  <strong>Vacuum Cleaning</strong>
                  <small>Seats and floor vacuum</small>
                </div>
              </label>

              <label className="check-item">
                <input
                  type="checkbox"
                  name="polishApplied"
                  checked={washing.polishApplied}
                  onChange={handleChange}
                />
                <span className="custom-check"></span>
                <div>
                  <strong>Polish Applied</strong>
                  <small>Final polish treatment</small>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Washing Notes</label>

            <textarea
              name="washingNotes"
              value={washing.washingNotes}
              onChange={handleChange}
              placeholder="Enter any washing-related observations..."
              rows="5"
            />
          </div>

          {/* Bottom Action */}
          <div className="washing-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/worker/jobs")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-washing-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "✓ Save & Start Washing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Washing;
