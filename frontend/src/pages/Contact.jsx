import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Contact.css";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 3500);
  };

  return (
    <div className="contact-page">
      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-container">
          <span className="contact-badge">✦ GET IN TOUCH</span>

          <h1>
            Let's Talk About
            <br />
            <span>Your Vehicle.</span>
          </h1>

          <p>
            Have a question about our services, packages or your booking? Our
            team is here to help.
          </p>
        </div>
      </section>

      {/* CONTACT AREA */}
      <section className="contact-main">
        <div className="contact-container contact-grid">
          {/* INFO */}
          <div className="contact-info">
            <span className="contact-label">CONTACT AUTOGLOW</span>

            <h2>
              We're here when
              <br />
              <strong>you need us.</strong>
            </h2>

            <p>
              Whether you need help choosing a service or want an update about
              your vehicle, feel free to reach out.
            </p>

            <div className="contact-info-list">
              <div className="contact-info-card">
                <div>✉</div>
                <section>
                  <small>EMAIL</small>
                  <strong>support@autoglow.com</strong>
                  <span>We usually respond within 24 hours.</span>
                </section>
              </div>

              <div className="contact-info-card">
                <div>☎</div>
                <section>
                  <small>PHONE</small>
                  <strong>+91 98765 43210</strong>
                  <span>Mon - Sat, 9:00 AM - 7:00 PM</span>
                </section>
              </div>

              <div className="contact-info-card">
                <div>⌖</div>
                <section>
                  <small>LOCATION</small>
                  <strong>AutoGlow Service Center</strong>
                  <span>Your City, India</span>
                </section>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="contact-form-box">
            {submitted ? (
              <div className="contact-success">
                <div>✓</div>

                <h3>Message Received!</h3>

                <p>
                  Thank you for contacting AutoGlow. Our team will get back to
                  you soon.
                </p>
              </div>
            ) : (
              <>
                <div className="form-heading">
                  <span>SEND A MESSAGE</span>
                  <h3>How can we help?</h3>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Your Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Subject</label>

                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select subject</option>
                        <option value="booking">Booking Help</option>
                        <option value="service">Service Information</option>
                        <option value="payment">Payment Issue</option>
                        <option value="general">General Question</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Your Message</label>

                    <textarea
                      name="message"
                      rows="6"
                      placeholder="Tell us how we can help..."
                      value={form.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button type="submit">
                    Send Message
                    <span>→</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* HOURS */}
      <section className="contact-hours">
        <div className="contact-container">
          <div className="contact-hours-box">
            <div>
              <span>WORKING HOURS</span>
              <h2>We're Ready To Care.</h2>
            </div>

            <div className="hours-list">
              <div>
                <span>Monday - Saturday</span>
                <strong>09:00 AM — 07:00 PM</strong>
              </div>

              <div>
                <span>Sunday</span>
                <strong>10:00 AM — 04:00 PM</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="contact-faq">
        <div className="contact-container">
          <div className="contact-faq-heading">
            <span>QUICK ANSWERS</span>
            <h2>
              Frequently Asked
              <br />
              <strong>Questions</strong>
            </h2>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I book a service?</h3>
              <p>
                Create an account, add your vehicle and select the service,
                package and preferred booking time.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I track my vehicle?</h3>
              <p>
                Yes. AutoGlow provides booking and service status tracking
                throughout the service workflow.
              </p>
            </div>

            <div className="faq-item">
              <h3>What is AI Inspection?</h3>
              <p>
                It is an intelligent inspection feature designed to analyze
                visible vehicle condition from uploaded images.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I contact AutoGlow about a booking?</h3>
              <p>
                Absolutely. Send us your booking-related question through the
                contact form and our team can assist you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="contact-cta">
        <div className="contact-container contact-cta-box">
          <div>
            <span>NEED A SERVICE?</span>

            <h2>
              Your Vehicle Is
              <br />
              Ready To Glow.
            </h2>
          </div>

          <Link to="/customer/book">Book A Service →</Link>
        </div>
      </section>
    </div>
  );
}

export default Contact;
