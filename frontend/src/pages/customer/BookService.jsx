import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./BookService.css";

function BookService() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    vehicleId: "",
    serviceId: "",
    packageId: "",
    bookingDate: "",
    bookingTime: "",
    pickupRequired: false,
    dropRequired: false,
    pickupAddress: "",
    dropAddress: "",
    notes: "",
  });

  // -----------------------------------------
  // AUTH CHECK
  // Only check TOKEN.
  // Do NOT check autoglow_role here.
  // -----------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    loadBookingData();
  }, [navigate]);

  // -----------------------------------------
  // LOAD VEHICLES + SERVICES + PACKAGES
  // -----------------------------------------
  const loadBookingData = async () => {
    try {
      setLoading(true);
      setPageError("");

      const [vehicleResponse, serviceResponse, packageResponse] =
        await Promise.all([
          api.get("/customer/vehicles"),
          api.get("/services"),
          api.get("/packages"),
        ]);

      setVehicles(vehicleResponse.data || []);
      setServices(serviceResponse.data || []);
      setPackages(packageResponse.data || []);
    } catch (error) {
      console.error("BookService load error:", error);

      const status = error.response?.status;

      if (status === 401 || status === 403) {
        setPageError(
          "Your login session is no longer valid. Please login again.",
        );
        return;
      }

      setPageError(
        error.response?.data?.message ||
          "Unable to load booking information. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // LOGOUT / UNAUTHORIZED
  // -----------------------------------------
  const handleUnauthorized = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");

    navigate("/login", { replace: true });
  };

  // -----------------------------------------
  // INPUT CHANGE
  // -----------------------------------------
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSubmitError("");
    setSuccess("");
  };

  // -----------------------------------------
  // SELECT VEHICLE
  // -----------------------------------------
  const handleVehicleSelect = (id) => {
    setForm((previous) => ({
      ...previous,
      vehicleId: String(id),
    }));

    setSubmitError("");
  };

  // -----------------------------------------
  // SELECT SERVICE
  // -----------------------------------------
  const handleServiceSelect = (id) => {
    setForm((previous) => ({
      ...previous,
      serviceId: String(id),
    }));

    setSubmitError("");
  };

  // -----------------------------------------
  // SELECT PACKAGE
  // -----------------------------------------
  const handlePackageSelect = (id) => {
    setForm((previous) => ({
      ...previous,
      packageId: id ? String(id) : "",
    }));

    setSubmitError("");
  };

  // -----------------------------------------
  // SELECTED VEHICLE
  // -----------------------------------------
  const selectedVehicle = useMemo(() => {
    return vehicles.find(
      (vehicle) => String(vehicle.id) === String(form.vehicleId),
    );
  }, [vehicles, form.vehicleId]);

  // -----------------------------------------
  // SELECTED SERVICE
  // -----------------------------------------
  const selectedService = useMemo(() => {
    return services.find(
      (service) => String(service.id) === String(form.serviceId),
    );
  }, [services, form.serviceId]);

  // -----------------------------------------
  // SELECTED PACKAGE
  // -----------------------------------------
  const selectedPackage = useMemo(() => {
    return packages.find((pkg) => String(pkg.id) === String(form.packageId));
  }, [packages, form.packageId]);

  // -----------------------------------------
  // TOTAL
  // -----------------------------------------
  const totalAmount = useMemo(() => {
    const servicePrice = Number(selectedService?.price || 0);

    const packagePrice = Number(selectedPackage?.price || 0);

    return servicePrice + packagePrice;
  }, [selectedService, selectedPackage]);

  // -----------------------------------------
  // ICON
  // -----------------------------------------
  const getVehicleIcon = (vehicleType) => {
    if (vehicleType && vehicleType.toLowerCase().includes("bike")) {
      return "🏍️";
    }

    return "🚗";
  };

  // -----------------------------------------
  // PRICE FORMAT
  // -----------------------------------------
  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN");
  };

  // -----------------------------------------
  // VALIDATION
  // -----------------------------------------
  const validateForm = () => {
    if (!form.vehicleId) {
      return "Please select a vehicle.";
    }

    if (!form.serviceId && !form.packageId) {
      return "Please select a service or package.";
    }

    if (!form.bookingDate) {
      return "Please select a booking date.";
    }

    if (!form.bookingTime) {
      return "Please select a booking time.";
    }

    if (form.pickupRequired && !form.pickupAddress.trim()) {
      return "Please enter pickup address.";
    }

    if (form.dropRequired && !form.dropAddress.trim()) {
      return "Please enter drop address.";
    }

    return "";
  };

  // -----------------------------------------
  // SUBMIT BOOKING
  // -----------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      setSubmitError("Your session has expired. Please login again.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        vehicleId: Number(form.vehicleId),

        serviceId: form.serviceId ? Number(form.serviceId) : null,

        packageId: form.packageId ? Number(form.packageId) : null,

        bookingDate: form.bookingDate,

        bookingTime: form.bookingTime,

        pickupRequired: Boolean(form.pickupRequired),

        dropRequired: Boolean(form.dropRequired),

        pickupAddress: form.pickupRequired ? form.pickupAddress.trim() : null,

        dropAddress: form.dropRequired ? form.dropAddress.trim() : null,

        notes: form.notes.trim() || null,
      };

      console.log("AutoGlow Booking Payload:", payload);

      const response = await api.post("/customer/bookings", payload);

      console.log("AutoGlow Booking Response:", response.data);

      setSuccess("Booking created successfully!");

      setTimeout(() => {
        navigate("/customer/bookings");
      }, 1000);
    } catch (error) {
      console.error("AutoGlow Booking Error:", error);

      const status = error.response?.status;

      if (status === 401 || status === 403) {
        setSubmitError(
          "Your session is not authorized for this booking. Please login again.",
        );

        setTimeout(() => {
          handleUnauthorized();
        }, 1200);

        return;
      }

      if (status === 400) {
        const backendMessage =
          error.response?.data?.message || error.response?.data;

        setSubmitError(
          backendMessage || "Invalid booking details. Please check the form.",
        );

        return;
      }

      setSubmitError(
        error.response?.data?.message ||
          "Unable to create booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------------------
  // LOADING SCREEN
  // -----------------------------------------
  if (loading) {
    return (
      <div className="book-service-page">
        <div className="booking-loading">
          <div className="booking-loader"></div>

          <h3>Preparing your booking</h3>

          <p>Loading your vehicles and services...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // PAGE
  // -----------------------------------------
  return (
    <div className="book-service-page">
      <div className="booking-container">
        {/* HEADER */}
        <header className="booking-header">
          <div className="booking-header-content">
            <span className="booking-eyebrow">AUTOGLOW • SERVICE BOOKING</span>

            <h1>
              Book Your
              <span> Vehicle Care</span>
            </h1>

            <p>
              Select your vehicle, choose a professional service and schedule a
              convenient time.
            </p>
          </div>

          <div className="booking-premium-badge">
            <span>✦</span>
            Premium Vehicle Care
          </div>
        </header>

        {/* ERROR */}
        {pageError && (
          <div className="booking-alert error-alert">
            <div className="alert-icon">!</div>

            <div>
              <strong>Unable to load booking information</strong>

              <p>{pageError}</p>
            </div>

            <button type="button" onClick={loadBookingData}>
              Retry
            </button>
          </div>
        )}

        {/* SUBMIT ERROR */}
        {submitError && (
          <div className="booking-alert error-alert">
            <div className="alert-icon">!</div>

            <div>
              <strong>Booking could not be completed</strong>

              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="booking-alert success-alert">
            <div className="alert-icon">✓</div>

            <div>
              <strong>Booking Confirmed</strong>

              <p>{success}</p>
            </div>
          </div>
        )}

        {/* NO VEHICLES */}
        {!pageError && vehicles.length === 0 ? (
          <div className="empty-booking-state">
            <div className="empty-booking-icon">🚗</div>

            <span className="empty-label">VEHICLE REQUIRED</span>

            <h2>Add your vehicle first</h2>

            <p>
              You need at least one vehicle in your AutoGlow account before
              booking a service.
            </p>

            <button
              type="button"
              className="primary-booking-btn"
              onClick={() => navigate("/customer/vehicles")}
            >
              Add Vehicle
              <span>→</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="booking-layout">
              {/* LEFT */}
              <main className="booking-main">
                {/* VEHICLE */}
                <section className="booking-card">
                  <div className="card-heading">
                    <div className="heading-number">01</div>

                    <div>
                      <span>YOUR VEHICLE</span>

                      <h2>Select Vehicle</h2>
                    </div>
                  </div>

                  <div className="vehicle-selection-grid">
                    {vehicles.map((vehicle) => {
                      const selected =
                        String(form.vehicleId) === String(vehicle.id);

                      return (
                        <button
                          type="button"
                          key={vehicle.id}
                          className={`vehicle-option ${
                            selected ? "selected" : ""
                          }`}
                          onClick={() => handleVehicleSelect(vehicle.id)}
                        >
                          <div className="vehicle-option-icon">
                            {getVehicleIcon(vehicle.vehicleType)}
                          </div>

                          <div className="vehicle-option-info">
                            <strong>
                              {vehicle.brand} {vehicle.model}
                            </strong>

                            <span>{vehicle.registrationNumber}</span>

                            <small>
                              {vehicle.vehicleType || "Vehicle"}

                              {vehicle.color ? ` • ${vehicle.color}` : ""}

                              {vehicle.year ? ` • ${vehicle.year}` : ""}
                            </small>
                          </div>

                          <div className="vehicle-check">
                            {selected ? "✓" : ""}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* SERVICE */}
                <section className="booking-card">
                  <div className="card-heading">
                    <div className="heading-number">02</div>

                    <div>
                      <span>VEHICLE CARE</span>

                      <h2>Choose Service</h2>
                    </div>
                  </div>

                  {services.length === 0 ? (
                    <div className="no-options">
                      No services are currently available.
                    </div>
                  ) : (
                    <div className="service-selection-grid">
                      {services.map((service) => {
                        const selected =
                          String(form.serviceId) === String(service.id);

                        return (
                          <button
                            type="button"
                            key={service.id}
                            className={`service-option ${
                              selected ? "selected" : ""
                            }`}
                            onClick={() => handleServiceSelect(service.id)}
                          >
                            <div className="service-option-top">
                              <div className="service-icon">✦</div>

                              <div
                                className={
                                  selected ? "selected-mark" : "service-radio"
                                }
                              >
                                {selected ? "✓" : ""}
                              </div>
                            </div>

                            <h3>{service.name}</h3>

                            <p>
                              {service.description ||
                                "Professional AutoGlow vehicle care service."}
                            </p>

                            <div className="service-option-bottom">
                              <strong>₹{formatPrice(service.price)}</strong>

                              <span>
                                {service.durationMinutes
                                  ? `${service.durationMinutes} min`
                                  : "Flexible"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* PACKAGE */}
                <section className="booking-card">
                  <div className="card-heading">
                    <div className="heading-number">03</div>

                    <div>
                      <span>OPTIONAL UPGRADE</span>

                      <h2>Premium Package</h2>
                    </div>
                  </div>

                  <div className="package-selection-grid">
                    {/* NO PACKAGE */}
                    <button
                      type="button"
                      className={`package-option no-package ${
                        !form.packageId ? "selected" : ""
                      }`}
                      onClick={() => handlePackageSelect("")}
                    >
                      <div className="package-option-icon">—</div>

                      <div className="package-option-info">
                        <strong>No Premium Package</strong>

                        <p>Continue with the selected service only.</p>
                      </div>

                      <div className="package-check">
                        {!form.packageId ? "✓" : ""}
                      </div>
                    </button>

                    {packages.map((pkg) => {
                      const selected =
                        String(form.packageId) === String(pkg.id);

                      return (
                        <button
                          type="button"
                          key={pkg.id}
                          className={`package-option ${
                            selected ? "selected" : ""
                          }`}
                          onClick={() => handlePackageSelect(pkg.id)}
                        >
                          <div className="package-option-icon">✦</div>

                          <div className="package-option-info">
                            <strong>{pkg.name}</strong>

                            <p>
                              {pkg.description ||
                                "Complete premium vehicle care package."}
                            </p>

                            <span>
                              ₹{formatPrice(pkg.price)}
                              {pkg.durationMinutes
                                ? ` • ${pkg.durationMinutes} min`
                                : ""}
                            </span>
                          </div>

                          <div className="package-check">
                            {selected ? "✓" : ""}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* DATE TIME */}
                <section className="booking-card">
                  <div className="card-heading">
                    <div className="heading-number">04</div>

                    <div>
                      <span>SCHEDULE</span>

                      <h2>Choose Date & Time</h2>
                    </div>
                  </div>

                  <div className="date-time-grid">
                    <div className="input-group">
                      <label>Booking Date</label>

                      <input
                        type="date"
                        name="bookingDate"
                        value={form.bookingDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="input-group">
                      <label>Preferred Time</label>

                      <input
                        type="time"
                        name="bookingTime"
                        value={form.bookingTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </section>

                {/* PICKUP DROP */}
                <section className="booking-card">
                  <div className="card-heading">
                    <div className="heading-number">05</div>

                    <div>
                      <span>CONVENIENCE</span>

                      <h2>Pickup & Drop</h2>
                    </div>
                  </div>

                  <div className="pickup-drop-grid">
                    <button
                      type="button"
                      className={`transport-option ${
                        form.pickupRequired ? "active" : ""
                      }`}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          pickupRequired: !previous.pickupRequired,
                        }))
                      }
                    >
                      <div className="transport-icon">🚚</div>

                      <div className="transport-content">
                        <strong>Pickup Required</strong>

                        <small>We'll collect your vehicle.</small>
                      </div>

                      <div className="transport-check">
                        {form.pickupRequired ? "✓" : ""}
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`transport-option ${
                        form.dropRequired ? "active" : ""
                      }`}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          dropRequired: !previous.dropRequired,
                        }))
                      }
                    >
                      <div className="transport-icon">🏠</div>

                      <div className="transport-content">
                        <strong>Drop Required</strong>

                        <small>We'll deliver your vehicle.</small>
                      </div>

                      <div className="transport-check">
                        {form.dropRequired ? "✓" : ""}
                      </div>
                    </button>
                  </div>

                  {(form.pickupRequired || form.dropRequired) && (
                    <div className="address-grid">
                      {form.pickupRequired && (
                        <div className="input-group">
                          <label>Pickup Address</label>

                          <textarea
                            name="pickupAddress"
                            value={form.pickupAddress}
                            onChange={handleChange}
                            placeholder="Enter complete pickup address..."
                            rows="4"
                          />
                        </div>
                      )}

                      {form.dropRequired && (
                        <div className="input-group">
                          <label>Drop Address</label>

                          <textarea
                            name="dropAddress"
                            value={form.dropAddress}
                            onChange={handleChange}
                            placeholder="Enter complete delivery address..."
                            rows="4"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* NOTES */}
                <section className="booking-card">
                  <div className="card-heading">
                    <div className="heading-number">06</div>

                    <div>
                      <span>OPTIONAL</span>

                      <h2>Special Instructions</h2>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Additional Notes</label>

                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Tell us anything important about your vehicle or service..."
                      rows="5"
                    />
                  </div>
                </section>
              </main>

              {/* RIGHT SUMMARY */}
              <aside className="booking-summary">
                <div className="summary-card">
                  <div className="summary-card-top">
                    <span>BOOKING SUMMARY</span>

                    <div className="summary-star">✦</div>
                  </div>

                  <div className="summary-brand">
                    <div className="summary-brand-icon">A</div>

                    <div>
                      <strong>AutoGlow</strong>

                      <small>Intelligent Vehicle Care</small>
                    </div>
                  </div>

                  <div className="summary-divider"></div>

                  {/* VEHICLE */}
                  <div className="summary-section">
                    <span className="summary-label">VEHICLE</span>

                    {selectedVehicle ? (
                      <div className="summary-vehicle">
                        <div className="summary-vehicle-icon">
                          {getVehicleIcon(selectedVehicle.vehicleType)}
                        </div>

                        <div>
                          <strong>
                            {selectedVehicle.brand} {selectedVehicle.model}
                          </strong>

                          <small>{selectedVehicle.registrationNumber}</small>
                        </div>
                      </div>
                    ) : (
                      <p className="summary-empty">Select a vehicle</p>
                    )}
                  </div>

                  {/* SERVICE */}
                  <div className="summary-section">
                    <span className="summary-label">SERVICE</span>

                    <div className="summary-line">
                      <span>{selectedService?.name || "Not selected"}</span>

                      <strong>₹{formatPrice(selectedService?.price)}</strong>
                    </div>
                  </div>

                  {/* PACKAGE */}
                  {selectedPackage && (
                    <div className="summary-section">
                      <span className="summary-label">PACKAGE</span>

                      <div className="summary-line">
                        <span>{selectedPackage.name}</span>

                        <strong>₹{formatPrice(selectedPackage.price)}</strong>
                      </div>
                    </div>
                  )}

                  {/* DATE TIME */}
                  <div className="summary-section">
                    <span className="summary-label">SCHEDULE</span>

                    <div className="summary-schedule">
                      <div>
                        <small>Date</small>

                        <strong>{form.bookingDate || "Not selected"}</strong>
                      </div>

                      <div>
                        <small>Time</small>

                        <strong>{form.bookingTime || "Not selected"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="summary-divider"></div>

                  {/* TOTAL */}
                  <div className="summary-total">
                    <span>Estimated Total</span>

                    <strong>₹{formatPrice(totalAmount)}</strong>
                  </div>

                  {/* BUTTON */}
                  <button
                    type="submit"
                    className="confirm-booking-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="button-spinner"></span>
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <p className="secure-note">
                    🔒 Secure booking • Professional service
                  </p>
                </div>

                {/* AI */}
                <div className="ai-trust-card">
                  <div className="ai-trust-icon">✦</div>

                  <div>
                    <strong>AI-Powered Vehicle Care</strong>

                    <p>
                      Your vehicle can receive an AI inspection after service
                      intake.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookService;
