import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./Inspection.css";

const Inspection = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [inspection, setInspection] = useState({
    exteriorCondition: "",
    interiorCondition: "",
    tyreCondition: "",
    engineCondition: "",
    damageFound: "",
    inspectionNotes: "",
  });

  useEffect(() => {
    loadBooking();
    loadExistingInspection();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);

      const response = await api.get("/worker/jobs");

      const jobs = Array.isArray(response.data) ? response.data : [];

      const foundJob = jobs.find(
        (job) => String(job.bookingId) === String(bookingId),
      );

      if (!foundJob) {
        alert("Booking nahi mili.");
        navigate("/worker/jobs");
        return;
      }

      setBooking(foundJob);
    } catch (error) {
      console.error("Booking loading error:", error);

      alert(
        error.response?.data?.message || "Booking details load nahi ho paayi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadExistingInspection = async () => {
    try {
      const response = await api.get(`/worker/inspections/${bookingId}`);

      if (response.data) {
        setInspection({
          exteriorCondition: response.data.exteriorCondition || "",

          interiorCondition: response.data.interiorCondition || "",

          tyreCondition: response.data.tyreCondition || "",

          engineCondition: response.data.engineCondition || "",

          damageFound: response.data.damageFound || "",

          inspectionNotes: response.data.inspectionNotes || "",
        });
      }
    } catch (error) {
      // 404 means inspection does not exist yet.
      if (error.response?.status !== 404) {
        console.error("Existing inspection error:", error);
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setInspection((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveInspection = async () => {
    if (!inspection.exteriorCondition) {
      alert("Please select exterior condition.");
      return;
    }

    if (!inspection.interiorCondition) {
      alert("Please select interior condition.");
      return;
    }

    if (!inspection.tyreCondition) {
      alert("Please select tyre condition.");
      return;
    }

    if (!inspection.engineCondition) {
      alert("Please select engine condition.");
      return;
    }

    if (!inspection.damageFound) {
      alert("Please select damage status.");
      return;
    }

    try {
      setSaving(true);

      await api.post(`/worker/inspections/${bookingId}`, inspection);

      alert(`Inspection saved successfully for Booking #${bookingId}`);

      navigate("/worker/jobs");
    } catch (error) {
      console.error("Save inspection error:", error);

      alert(error.response?.data?.message || "Inspection save nahi ho paayi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="inspection-loading">
        <div className="inspection-spinner"></div>
        <p>Loading inspection...</p>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="inspection-page">
      {/* HEADER */}

      <div className="inspection-header">
        <div>
          <span className="inspection-label">WORKER PORTAL / MY JOBS</span>

          <h1>Vehicle Inspection</h1>

          <p>
            Inspect the vehicle carefully and record the condition before
            washing.
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/worker/jobs")}
          disabled={saving}
        >
          ← Back to My Jobs
        </button>
      </div>

      <div className="inspection-grid">
        {/* BOOKING INFORMATION */}

        <div className="inspection-card booking-card">
          <div className="card-title">
            <span>🚗</span>

            <div>
              <h2>Booking #{booking.bookingId}</h2>

              <small>Vehicle Information</small>
            </div>
          </div>

          <div className="booking-details">
            <div className="detail-item">
              <span>Customer</span>
              <strong>{booking.customerName || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Email</span>
              <strong>{booking.customerEmail || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Vehicle</span>
              <strong>
                {booking.vehicleBrand || ""} {booking.vehicleModel || ""}
              </strong>
            </div>

            <div className="detail-item">
              <span>Registration</span>
              <strong>{booking.vehicleNumber || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Vehicle Type</span>
              <strong>{booking.vehicleType || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Service</span>
              <strong>
                {booking.serviceName || booking.packageName || "N/A"}
              </strong>
            </div>
          </div>

          <div className="inspection-status-box">
            <span>Current Job Status</span>

            <strong>{booking.status}</strong>
          </div>

          <div className="inspection-tip">
            <span>💡</span>

            <div>
              <strong>Inspection Tip</strong>

              <p>
                Check exterior, interior, tyres, engine condition and visible
                damages before starting the wash.
              </p>
            </div>
          </div>
        </div>

        {/* INSPECTION FORM */}

        <div className="inspection-card">
          <div className="card-title">
            <span>🔍</span>

            <div>
              <h2>Inspection Checklist</h2>

              <small>Record vehicle condition</small>
            </div>
          </div>

          <div className="inspection-form-grid">
            <div className="form-group">
              <label>Exterior Condition</label>

              <select
                name="exteriorCondition"
                value={inspection.exteriorCondition}
                onChange={handleChange}
              >
                <option value="">Select condition</option>

                <option value="EXCELLENT">Excellent</option>

                <option value="GOOD">Good</option>

                <option value="AVERAGE">Average</option>

                <option value="POOR">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Interior Condition</label>

              <select
                name="interiorCondition"
                value={inspection.interiorCondition}
                onChange={handleChange}
              >
                <option value="">Select condition</option>

                <option value="EXCELLENT">Excellent</option>

                <option value="GOOD">Good</option>

                <option value="AVERAGE">Average</option>

                <option value="POOR">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tyre Condition</label>

              <select
                name="tyreCondition"
                value={inspection.tyreCondition}
                onChange={handleChange}
              >
                <option value="">Select condition</option>

                <option value="GOOD">Good</option>

                <option value="AVERAGE">Average</option>

                <option value="POOR">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Engine Condition</label>

              <select
                name="engineCondition"
                value={inspection.engineCondition}
                onChange={handleChange}
              >
                <option value="">Select condition</option>

                <option value="GOOD">Good</option>

                <option value="AVERAGE">Average</option>

                <option value="POOR">Needs Attention</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Damage Found</label>

            <select
              name="damageFound"
              value={inspection.damageFound}
              onChange={handleChange}
            >
              <option value="">Select damage status</option>

              <option value="NO">No Damage</option>

              <option value="MINOR">Minor Damage</option>

              <option value="MAJOR">Major Damage</option>
            </select>
          </div>

          <div className="form-group">
            <label>Inspection Notes</label>

            <textarea
              name="inspectionNotes"
              value={inspection.inspectionNotes}
              onChange={handleChange}
              placeholder="Enter detailed inspection observations..."
              rows="6"
            />
          </div>

          <div className="inspection-actions">
            <button
              type="button"
              className="cancel-inspection-btn"
              onClick={() => navigate("/worker/jobs")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-inspection-btn"
              onClick={saveInspection}
              disabled={saving}
            >
              {saving ? "Saving Inspection..." : "✓ Save Inspection & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inspection;
