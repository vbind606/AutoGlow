import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Services.css";

function Services() {
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [servicesResponse, packagesResponse] = await Promise.all([
        api.get("/services"),
        api.get("/packages"),
      ]);

      setServices(servicesResponse.data || []);
      setPackages(packagesResponse.data || []);
    } catch (error) {
      console.error("Services / Packages loading error:", error);

      setError("Unable to load services and packages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="services-page">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="services-hero">
        <div className="services-hero-overlay">
          <div className="services-hero-content">
            <span className="services-badge">✨ Professional Vehicle Care</span>

            <h1>
              Premium Car & Bike
              <span> Care Services</span>
            </h1>

            <p>
              Give your vehicle the care it deserves with AutoGlow's
              professional cleaning, detailing and maintenance services.
            </p>

            <div className="hero-actions">
              <Link to="/customer/book" className="hero-book-button">
                Book a Service
                <span>→</span>
              </Link>

              <a href="#services" className="hero-explore-button">
                Explore Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="services-intro">
        <div className="section-heading">
          <span>WHAT WE OFFER</span>

          <h2>
            Complete Care for
            <br />
            <strong>Your Vehicle</strong>
          </h2>

          <p>
            From quick exterior cleaning to premium detailing, AutoGlow provides
            professional vehicle care designed to keep your car or bike looking
            its best.
          </p>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div id="services">
        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="services-loading">
            <div className="loading-spinner"></div>

            <h3>Loading AutoGlow Services</h3>

            <p>Please wait while we fetch the latest services.</p>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="services-error">
            <div className="error-icon">⚠️</div>

            <h3>Unable to Load Services</h3>

            <p>{error}</p>

            <button type="button" onClick={loadData} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            SERVICES SECTION
        ================================================= */}

        {!loading && !error && (
          <section className="services-section">
            <div className="services-container">
              <div className="services-section-header">
                <div>
                  <span>OUR SERVICES</span>

                  <h2>Choose the Right Care</h2>
                </div>

                <p>Professional services for cars, bikes and other vehicles.</p>
              </div>

              {/* ================================
                  EMPTY SERVICES
              ================================= */}

              {services.length === 0 ? (
                <div className="no-services">
                  <div className="empty-icon">🚗</div>

                  <h3>No Services Available</h3>

                  <p>
                    Our services will appear here once they are added by
                    AutoGlow.
                  </p>
                </div>
              ) : (
                /* ================================
                   SERVICES GRID
                ================================= */

                <div className="services-grid">
                  {services.map((service) => (
                    <div className="service-card" key={service.id}>
                      {/* CARD TOP */}

                      <div className="service-card-top">
                        <div className="service-icon">
                          {getServiceIcon(service.name)}
                        </div>

                        <span className="service-status">AVAILABLE</span>
                      </div>

                      <div className="service-card-content">
                        {/* TITLE */}

                        <div className="service-title-row">
                          <h3>{service.name}</h3>

                          {service.vehicleType && (
                            <span className="service-vehicle-badge">
                              {service.vehicleType}
                            </span>
                          )}
                        </div>

                        {/* DESCRIPTION */}

                        <p className="service-description">
                          {service.description ||
                            "Professional vehicle care service by AutoGlow."}
                        </p>

                        {/* PRICE + DURATION */}

                        <div className="service-info">
                          <div>
                            <small>PRICE</small>

                            <strong>
                              ₹
                              {Number(service.price || 0).toLocaleString(
                                "en-IN",
                              )}
                            </strong>
                          </div>

                          <div>
                            <small>DURATION</small>

                            <strong>
                              {service.durationMinutes
                                ? `${service.durationMinutes} min`
                                : "Flexible"}
                            </strong>
                          </div>
                        </div>

                        {/* VEHICLE */}

                        <div className="vehicle-type">
                          <span>🚘</span>
                          Suitable for{" "}
                          <strong>
                            {service.vehicleType || "All Vehicles"}
                          </strong>
                        </div>

                        {/* BUTTON */}

                        <Link to="/customer/book" className="service-book-btn">
                          <span>Book Service</span>

                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            PACKAGES SECTION
        ================================================= */}

        {!loading && !error && (
          <section className="packages-section">
            <div className="services-container">
              <div className="packages-section-header">
                <div>
                  <span>BEST VALUE</span>

                  <h2>
                    Premium Service
                    <strong> Packages</strong>
                  </h2>
                </div>

                <p>
                  Get more value with our specially designed vehicle care
                  packages.
                </p>
              </div>

              {/* ================================
                  EMPTY PACKAGES
              ================================= */}

              {packages.length === 0 ? (
                <div className="no-packages">
                  <div className="empty-icon">✨</div>

                  <h3>No Packages Available</h3>

                  <p>Premium packages will appear here once they are added.</p>
                </div>
              ) : (
                /* ================================
                   PACKAGES GRID
                ================================= */

                <div className="packages-grid">
                  {packages.map((pkg, index) => (
                    <div
                      className={`package-card ${
                        index === 1 ? "featured-package" : ""
                      }`}
                      key={pkg.id}
                    >
                      {/* POPULAR */}

                      {index === 1 && (
                        <div className="popular-package">MOST POPULAR</div>
                      )}

                      {/* HEADER */}

                      <div className="package-header">
                        <div className="package-icon">✨</div>

                        <span className="package-vehicle">
                          {pkg.vehicleType || "ALL"}
                        </span>
                      </div>

                      {/* PACKAGE NUMBER */}

                      <span className="package-number">
                        PACKAGE 0{index + 1}
                      </span>

                      {/* NAME */}

                      <h3>{pkg.name}</h3>

                      {/* DESCRIPTION */}

                      <p className="package-description">
                        {pkg.description ||
                          "Complete professional vehicle care package by AutoGlow."}
                      </p>

                      {/* PRICE */}

                      <div className="package-price">
                        <small>PACKAGE PRICE</small>

                        <strong>
                          ₹{Number(pkg.price || 0).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      {/* INFO */}

                      <div className="package-info">
                        <div>
                          <span>DURATION</span>

                          <strong>
                            {pkg.durationMinutes
                              ? `${pkg.durationMinutes} min`
                              : "Flexible"}
                          </strong>
                        </div>

                        <div>
                          <span>VEHICLE</span>

                          <strong>{pkg.vehicleType || "All Vehicles"}</strong>
                        </div>
                      </div>

                      {/* VEHICLE INFO */}

                      <div className="package-vehicle-info">
                        🚘 Suitable for{" "}
                        <strong>{pkg.vehicleType || "All Vehicles"}</strong>
                      </div>

                      {/* BUTTON */}

                      <Link to="/customer/book" className="package-book-btn">
                        <span>Choose Package</span>

                        <span>→</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            WHY AUTOGLOW
        ================================================= */}

        {!loading && !error && (
          <section className="why-autoglow">
            <div className="services-container">
              <div className="section-heading">
                <span>WHY AUTOGLOW</span>

                <h2>
                  More Than Just a
                  <br />
                  <strong>Vehicle Wash</strong>
                </h2>

                <p>
                  We combine professional care, technology and convenience to
                  give your vehicle a better experience.
                </p>
              </div>

              <div className="why-grid">
                <div className="why-card">
                  <div className="why-icon">🧼</div>

                  <h3>Professional Care</h3>

                  <p>
                    Trained workers and professional cleaning techniques for
                    your vehicle.
                  </p>
                </div>

                <div className="why-card">
                  <div className="why-icon">🤖</div>

                  <h3>AI Powered Inspection</h3>

                  <p>
                    AI-assisted vehicle inspection helps identify visible damage
                    and condition.
                  </p>
                </div>

                <div className="why-card">
                  <div className="why-icon">📱</div>

                  <h3>Easy Booking</h3>

                  <p>
                    Select your vehicle, service and preferred time from one
                    simple platform.
                  </p>
                </div>

                <div className="why-card">
                  <div className="why-icon">🔔</div>

                  <h3>Service Tracking</h3>

                  <p>
                    Track your vehicle service progress from booking to
                    completion.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            CTA
        ================================================= */}

        {!loading && !error && (
          <section className="services-cta">
            <div className="services-cta-content">
              <span>READY TO GLOW?</span>

              <h2>
                Give Your Vehicle the
                <br />
                <strong>AutoGlow Treatment.</strong>
              </h2>

              <p>
                Book your service today and experience professional vehicle
                care.
              </p>

              <Link to="/customer/book" className="cta-button">
                Book Your Service
                <span>→</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SERVICE ICON HELPER
========================================================= */

function getServiceIcon(serviceName = "") {
  const name = serviceName.toLowerCase();

  if (name.includes("bike") || name.includes("motorcycle")) {
    return "🏍️";
  }

  if (name.includes("wash") || name.includes("clean")) {
    return "🚿";
  }

  if (name.includes("detail") || name.includes("detailing")) {
    return "✨";
  }

  if (name.includes("polish") || name.includes("paint")) {
    return "💎";
  }

  if (name.includes("interior")) {
    return "🧽";
  }

  if (name.includes("repair") || name.includes("maintenance")) {
    return "🔧";
  }

  if (name.includes("ceramic") || name.includes("coating")) {
    return "🛡️";
  }

  return "🚗";
}

export default Services;
