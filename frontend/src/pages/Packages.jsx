import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Packages.css";

function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/packages");
      setPackages(response.data || []);
    } catch (err) {
      console.error("Packages loading error:", err);
      setError("Unable to load packages right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="packages-page">
      {/* HERO */}
      <section className="packages-hero">
        <div className="packages-hero-overlay"></div>

        <div className="packages-container packages-hero-content">
          <span className="packages-badge">✦ PREMIUM VEHICLE CARE</span>

          <h1>
            Complete Care.
            <br />
            <span>One Premium Package.</span>
          </h1>

          <p>
            Carefully designed vehicle care packages combining professional
            detailing, advanced cleaning and intelligent inspection.
          </p>

          <div className="packages-hero-actions">
            <Link to="/customer/book" className="packages-primary-btn">
              Choose Your Package →
            </Link>

            <Link to="/services" className="packages-secondary-btn">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="packages-intro">
        <div className="packages-container">
          <div className="packages-section-heading">
            <span>OUR PACKAGES</span>

            <h2>
              Premium Care,
              <br />
              <strong>Designed Around Your Vehicle</strong>
            </h2>

            <p>
              Whether your vehicle needs a quick refresh or a complete detailing
              treatment, AutoGlow packages are designed to deliver consistent,
              professional results.
            </p>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="packages-list-section">
        <div className="packages-container">
          {loading ? (
            <div className="packages-state">
              <div className="packages-loader"></div>
              <p>Loading premium packages...</p>
            </div>
          ) : error ? (
            <div className="packages-state packages-error">
              <div className="state-icon">!</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>

              <button onClick={loadPackages}>Try Again</button>
            </div>
          ) : packages.length === 0 ? (
            <div className="packages-state">
              <div className="state-icon">✦</div>
              <h3>No packages available</h3>
              <p>Please check again later.</p>
            </div>
          ) : (
            <div className="packages-grid-premium">
              {packages.map((pkg, index) => (
                <div
                  className={`premium-package-card ${
                    index === 1 ? "popular-package" : ""
                  }`}
                  key={pkg.id}
                >
                  {index === 1 && (
                    <div className="popular-ribbon">MOST POPULAR</div>
                  )}

                  <div className="premium-package-top">
                    <div className="package-icon">
                      {pkg.vehicleType?.toLowerCase() === "bike" ? "🏍️" : "🚘"}
                    </div>

                    <span className="package-type">
                      {pkg.vehicleType || "ALL VEHICLES"}
                    </span>
                  </div>

                  <h3>{pkg.name}</h3>

                  <p className="premium-package-description">
                    {pkg.description ||
                      "Complete professional vehicle care package by AutoGlow."}
                  </p>

                  <div className="premium-price">
                    <small>STARTING FROM</small>

                    <div>
                      <span>₹</span>
                      {Number(pkg.price).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="premium-package-meta">
                    <div>
                      <span>⏱</span>
                      <div>
                        <small>DURATION</small>
                        <strong>
                          {pkg.durationMinutes
                            ? `${pkg.durationMinutes} min`
                            : "Flexible"}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <span>✦</span>
                      <div>
                        <small>CARE LEVEL</small>
                        <strong>Premium</strong>
                      </div>
                    </div>
                  </div>

                  <div className="package-includes">
                    <h4>Package Highlights</h4>

                    <div>✓ Professional exterior cleaning</div>
                    <div>✓ Interior care & detailing</div>
                    <div>✓ Vehicle condition inspection</div>
                    <div>✓ Professional finishing</div>
                  </div>

                  <Link to="/customer/book" className="premium-package-btn">
                    Choose This Package
                    <span>→</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY PACKAGES */}
      <section className="packages-benefits">
        <div className="packages-container">
          <div className="packages-section-heading center-heading">
            <span>WHY A PACKAGE?</span>

            <h2>
              More Care.
              <br />
              <strong>More Value.</strong>
            </h2>

            <p>
              AutoGlow packages combine multiple professional treatments into
              one convenient vehicle care experience.
            </p>
          </div>

          <div className="package-benefits-grid">
            <div className="package-benefit">
              <div>01</div>
              <h3>Complete Treatment</h3>
              <p>
                Multiple vehicle care services combined into one complete
                treatment.
              </p>
            </div>

            <div className="package-benefit">
              <div>02</div>
              <h3>Better Value</h3>
              <p>
                Get more professional care without booking every service
                separately.
              </p>
            </div>

            <div className="package-benefit">
              <div>03</div>
              <h3>AI Inspection</h3>
              <p>
                Intelligent vehicle inspection helps identify visible condition
                issues.
              </p>
            </div>

            <div className="package-benefit">
              <div>04</div>
              <h3>Professional Finish</h3>
              <p>
                Every package is completed with a consistent professional
                finishing process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="packages-final-cta">
        <div className="packages-container">
          <div className="packages-cta-box">
            <div>
              <span>READY TO GLOW?</span>

              <h2>
                Give Your Vehicle
                <br />
                The Premium Treatment.
              </h2>

              <p>Select a package and let AutoGlow take care of the rest.</p>
            </div>

            <Link to="/customer/book" className="packages-cta-button">
              Book Your Package →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Packages;
