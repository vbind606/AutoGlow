import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      {/* ================= HERO ================= */}

      <section className="home-hero">
        <div className="home-hero-overlay"></div>

        <div className="home-hero-content">
          <div className="home-hero-badge">
            <span></span>
            AI-POWERED VEHICLE CARE
          </div>

          <h1>
            Your Vehicle.
            <br />
            <strong>Our Expertise.</strong>
          </h1>

          <p>
            Premium car and bike care, detailing and intelligent vehicle
            management — all in one place.
          </p>

          <div className="home-hero-actions">
            <Link to="/signup" className="home-primary-btn">
              Book a Service
              <span>→</span>
            </Link>

            <Link to="/services" className="home-secondary-btn">
              Explore Services
            </Link>
          </div>

          <div className="home-trust">
            <div>
              <strong>5K+</strong>
              <span>Vehicles Served</span>
            </div>

            <i></i>

            <div>
              <strong>4.9/5</strong>
              <span>Customer Rating</span>
            </div>

            <i></i>

            <div>
              <strong>24/7</strong>
              <span>Smart Support</span>
            </div>
          </div>
        </div>

        <div className="home-hero-card">
          <div className="hero-card-top">
            <span>AutoGlow Intelligence</span>
            <b>● LIVE</b>
          </div>

          <div className="hero-health-circle">
            <div>
              <strong>98%</strong>
              <span>Vehicle Health</span>
            </div>
          </div>

          <div className="hero-card-status">
            <span>AI Inspection</span>
            <strong>Completed ✓</strong>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}

      <section className="home-services">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <span className="home-section-label">WHAT WE DO</span>

              <h2>
                Complete Care for
                <br />
                <strong>Your Vehicle</strong>
              </h2>
            </div>

            <p>
              From everyday cleaning to premium detailing, AutoGlow keeps your
              vehicle looking and feeling its best.
            </p>
          </div>

          <div className="home-service-grid">
            <div className="home-service-card">
              <div className="service-card-top">
                <span>01</span>
                <div>✦</div>
              </div>

              <h3>Premium Wash</h3>

              <p>
                Deep exterior cleaning with professional products and modern
                techniques.
              </p>

              <Link to="/services">
                Explore Service <span>→</span>
              </Link>
            </div>

            <div className="home-service-card featured">
              <div className="service-card-top">
                <span>02</span>
                <div>◈</div>
              </div>

              <h3>Premium Detailing</h3>

              <p>
                Restore your vehicle's finish with our professional detailing
                experience.
              </p>

              <Link to="/services">
                Explore Service <span>→</span>
              </Link>
            </div>

            <div className="home-service-card">
              <div className="service-card-top">
                <span>03</span>
                <div>AI</div>
              </div>

              <h3>AI Inspection</h3>

              <p>
                Smart inspection identifies visible damage and recommends the
                right care.
              </p>

              <Link to="/services">
                Explore Service <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY AUTOGLOW ================= */}

      <section className="home-why">
        <div className="home-container home-why-grid">
          <div className="home-why-content">
            <span className="home-section-label">WHY AUTOGLOW</span>

            <h2>
              More Than a Wash.
              <br />
              <strong>A Better Way to Care.</strong>
            </h2>

            <p>
              AutoGlow combines professional vehicle care with smart technology
              to give you a simpler, more transparent and reliable experience.
            </p>

            <div className="home-feature-list">
              <div className="home-feature">
                <div className="feature-check">✓</div>

                <div>
                  <h4>Professional Care</h4>
                  <p>Trained professionals and premium quality products.</p>
                </div>
              </div>

              <div className="home-feature">
                <div className="feature-check">AI</div>

                <div>
                  <h4>Intelligent Technology</h4>
                  <p>
                    AI-powered inspection and smart service recommendations.
                  </p>
                </div>
              </div>

              <div className="home-feature">
                <div className="feature-check">↗</div>

                <div>
                  <h4>Real-Time Tracking</h4>
                  <p>
                    Know exactly where your vehicle is in the service process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="home-why-visual">
            <div className="home-intelligence-card">
              <div className="intelligence-header">
                <div>
                  <span>AutoGlow Intelligence</span>
                  <strong>Vehicle Analysis</strong>
                </div>

                <div className="intelligence-live">
                  <i></i>
                  LIVE
                </div>
              </div>

              <div className="intelligence-circle">
                <div>
                  <strong>98%</strong>
                  <span>Vehicle Health</span>
                </div>
              </div>

              <div className="intelligence-details">
                <div>
                  <span>Exterior Condition</span>
                  <strong>Excellent</strong>
                </div>

                <div>
                  <span>AI Inspection</span>
                  <strong>Completed ✓</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}

      <section className="home-process">
        <div className="home-container">
          <div className="home-process-heading">
            <span className="home-section-label">HOW IT WORKS</span>

            <h2>
              Simple. Smart. <strong>Seamless.</strong>
            </h2>

            <p>
              Get your vehicle professionally cared for in just a few simple
              steps.
            </p>
          </div>

          <div className="home-process-grid">
            <div className="process-item">
              <span>01</span>

              <div>
                <h3>Book Online</h3>
                <p>Choose your vehicle, service and preferred time.</p>
              </div>
            </div>

            <div className="process-line"></div>

            <div className="process-item">
              <span>02</span>

              <div>
                <h3>AI Inspection</h3>
                <p>
                  Our smart system analyzes the visible condition of your
                  vehicle.
                </p>
              </div>
            </div>

            <div className="process-line"></div>

            <div className="process-item">
              <span>03</span>

              <div>
                <h3>Professional Care</h3>
                <p>
                  Our trained team performs the selected service professionally.
                </p>
              </div>
            </div>

            <div className="process-line"></div>

            <div className="process-item">
              <span>04</span>

              <div>
                <h3>Track & Collect</h3>
                <p>
                  Track your service and get your vehicle back looking its best.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="home-cta">
        <div className="home-cta-container">
          <div>
            <span className="home-section-label">READY WHEN YOU ARE</span>

            <h2>
              Give Your Vehicle
              <br />
              the <strong>AutoGlow Treatment.</strong>
            </h2>

            <p>Professional care. Smart technology. Better results.</p>
          </div>

          <Link to="/signup" className="home-cta-btn">
            Get Started
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="home-footer">
        <div className="home-footer-container">
          <div className="home-footer-brand">
            <Link to="/" className="home-footer-logo">
              <div>A</div>

              <span>
                <b>Auto</b>Glow
              </span>
            </Link>

            <p>Smart vehicle care, professionally delivered.</p>
          </div>

          <div className="home-footer-links">
            <div>
              <h4>Explore</h4>
              <Link to="/">Home</Link>
              <Link to="/services">Services</Link>
              <Link to="/packages">Packages</Link>
            </div>

            <div>
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/login">Login</Link>
            </div>
          </div>
        </div>

        <div className="home-footer-bottom">
          <span>© 2026 AutoGlow. All rights reserved.</span>

          <span>AI Powered Vehicle Care</span>
        </div>
      </footer>
    </main>
  );
}

export default Home;
