import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [signupRole, setSignupRole] = useState("CUSTOMER");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================
  // HANDLE SIGNUP
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // Password match check
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    // Password length check
    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: signupRole,
      });

      console.log("Registration Response:", response.data);

      // Registration successful
      if (response.data === "Registration successful") {
        navigate("/login");
      } else {
        setMessage(response.data || "Registration failed.");
      }
    } catch (error) {
      console.error("Signup Error:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to create account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      {/* =========================================
          LEFT VISUAL SECTION
          ========================================= */}

      <div className="signup-visual">
        <div className="signup-visual-content">
          {/* BRAND */}

          <Link to="/" className="signup-brand">
            <div className="signup-brand-icon">A</div>

            <div className="signup-brand-text">
              <span>Auto</span>Glow
            </div>
          </Link>

          {/* MAIN CONTENT */}

          <div className="signup-quote">
            <span className="signup-visual-label">SMART VEHICLE CARE</span>

            <h1>
              Start your journey
              <br />
              <strong>with AutoGlow.</strong>
            </h1>

            <p>
              Create your account and manage your vehicle care, bookings,
              service history and intelligent inspections from one place.
            </p>

            {/* FEATURES */}

            <div className="signup-features">
              <div className="signup-feature">
                <div className="feature-check">✓</div>

                <span>Easy vehicle management</span>
              </div>

              <div className="signup-feature">
                <div className="feature-check">✓</div>

                <span>Smart service bookings</span>
              </div>

              <div className="signup-feature">
                <div className="feature-check">✓</div>

                <span>AI-powered vehicle inspection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT FORM SECTION
          ========================================= */}

      <div className="signup-form-area">
        <div className="signup-form-wrapper">
          {/* MOBILE BRAND */}

          <div className="mobile-signup-brand">
            <Link to="/" className="signup-brand-mobile">
              <div className="signup-brand-icon">A</div>

              <div className="signup-brand-text">
                <span>Auto</span>Glow
              </div>
            </Link>
          </div>

          {/* HEADING */}

          <div className="signup-heading">
            <span className="signup-section-label">GET STARTED</span>

            <h2>Create your account</h2>

            <p>Join AutoGlow and take better care of your vehicle.</p>
          </div>

          {/* =========================================
              SIGNUP FORM
              ========================================= */}

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* ACCOUNT TYPE */}

            <div className="signup-input-group">
              <label htmlFor="signupRole">Account Type</label>

              <select
                id="signupRole"
                name="signupRole"
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value)}
                className="signup-role-select"
              >
                <option value="CUSTOMER">Customer</option>

                <option value="ADMIN">Admin</option>

                <option value="WORKER">Worker</option>
              </select>
            </div>

            {/* FULL NAME */}

            <div className="signup-input-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* EMAIL */}

            <div className="signup-input-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}

            <div className="signup-input-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="signup-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* MESSAGE */}

            {message && <div className="signup-message">{message}</div>}

            {/* SUBMIT BUTTON */}

            <button type="submit" className="signup-submit" disabled={loading}>
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  <span>Create Account</span>

                  <span className="signup-submit-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}

          <div className="signup-divider">
            <span>OR</span>
          </div>

          {/* LOGIN */}

          <p className="signup-switch">
            Already have an account?
            <Link to="/login">Sign in</Link>
          </p>

          {/* SECURITY */}

          <p className="signup-security">
            🔒 Your personal information is securely protected.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Signup;
