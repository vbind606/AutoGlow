import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>

        <div className="about-container about-hero-content">
          <span className="about-badge">✦ ABOUT AUTOGLOW</span>

          <h1>
            Vehicle Care,
            <br />
            <span>Reimagined.</span>
          </h1>

          <p>
            AutoGlow combines professional vehicle care with intelligent
            technology to create a smarter, more transparent and convenient
            service experience.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="about-story">
        <div className="about-container about-story-grid">
          <div className="about-story-image">
            <div className="about-image-card">
              <span>AI POWERED</span>
              <strong>VEHICLE CARE</strong>
              <small>Professional • Intelligent • Transparent</small>
            </div>
          </div>

          <div className="about-story-content">
            <span className="about-label">WHO WE ARE</span>

            <h2>
              A better way to
              <br />
              <strong>care for your vehicle.</strong>
            </h2>

            <p>
              AutoGlow is a modern vehicle care management platform designed to
              make professional car and bike care simpler for customers, workers
              and administrators.
            </p>

            <p>
              From booking a service to tracking the vehicle and understanding
              its condition through AI-powered inspection, AutoGlow brings the
              complete experience together in one platform.
            </p>

            <div className="about-mini-stats">
              <div>
                <strong>01</strong>
                <span>Smart Booking</span>
              </div>

              <div>
                <strong>02</strong>
                <span>AI Inspection</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Live Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="about-mission">
        <div className="about-container">
          <div className="about-section-heading center">
            <span>OUR PURPOSE</span>

            <h2>
              Built Around
              <br />
              <strong>Better Vehicle Care</strong>
            </h2>
          </div>

          <div className="mission-grid">
            <div className="mission-card">
              <span>01</span>
              <h3>Our Mission</h3>
              <p>
                To make professional vehicle care accessible, transparent and
                convenient through technology.
              </p>
            </div>

            <div className="mission-card featured">
              <span>02</span>
              <h3>Our Vision</h3>
              <p>
                To create a smarter vehicle care ecosystem where customers
                always know what is happening with their vehicle.
              </p>
            </div>

            <div className="mission-card">
              <span>03</span>
              <h3>Our Promise</h3>
              <p>
                Quality service, transparent communication and a professional
                experience at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="about-features">
        <div className="about-container">
          <div className="about-section-heading">
            <span>WHY AUTOGLOW</span>

            <h2>
              Technology Meets
              <br />
              <strong>Professional Care</strong>
            </h2>
          </div>

          <div className="about-feature-grid">
            <div className="about-feature">
              <div className="feature-number">01</div>
              <h3>Intelligent Inspection</h3>
              <p>
                AI-assisted vehicle inspection helps identify visible scratches,
                dents, paint issues and other condition details.
              </p>
            </div>

            <div className="about-feature">
              <div className="feature-number">02</div>
              <h3>Complete Visibility</h3>
              <p>
                Customers can follow their booking and understand the current
                stage of their vehicle service.
              </p>
            </div>

            <div className="about-feature">
              <div className="feature-number">03</div>
              <h3>Professional Workflow</h3>
              <p>
                Every booking follows a structured workflow from receiving the
                vehicle to quality checking and delivery.
              </p>
            </div>

            <div className="about-feature">
              <div className="feature-number">04</div>
              <h3>Customer First</h3>
              <p>
                AutoGlow is designed around convenience, transparency and a
                better customer experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="about-process">
        <div className="about-container">
          <div className="about-section-heading center">
            <span>HOW IT WORKS</span>

            <h2>
              From Booking
              <br />
              <strong>To Beautifully Clean</strong>
            </h2>
          </div>

          <div className="about-process-grid">
            <div>
              <b>01</b>
              <h3>Book</h3>
              <p>Select your vehicle, service and preferred time.</p>
            </div>

            <div>
              <b>02</b>
              <h3>Inspect</h3>
              <p>Your vehicle condition can be recorded through inspection.</p>
            </div>

            <div>
              <b>03</b>
              <h3>Care</h3>
              <p>Our structured workflow takes care of the service.</p>
            </div>

            <div>
              <b>04</b>
              <h3>Collect</h3>
              <p>Track the service and collect your vehicle when ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-container">
          <div className="about-cta-box">
            <div>
              <span>YOUR VEHICLE DESERVES BETTER</span>

              <h2>
                Experience the
                <br />
                AutoGlow Difference.
              </h2>
            </div>

            <Link to="/signup">Get Started →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
