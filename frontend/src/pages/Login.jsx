import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // ==============================
  // LOGIN ROLE
  // ==============================

  const [loginRole, setLoginRole] = useState("CUSTOMER");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==============================
  // HANDLE INPUT CHANGE
  // ==============================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==============================
  // LOGIN
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      // =========================================
      // SEND EMAIL + PASSWORD + ROLE TO BACKEND
      // =========================================

      const loginData = {
        email: form.email.trim(),
        password: form.password,
        role: loginRole,
      };

      console.log("Login Request:", loginData);

      const response = await api.post("/auth/login", loginData);

      const data = response.data;

      console.log("====================================");
      console.log("LOGIN RESPONSE");
      console.log(data);
      console.log("====================================");

      // =========================================
      // CHECK TOKEN
      // =========================================

      if (!data?.token) {
        setMessage(data?.message || "Login failed.");

        setLoading(false);
        return;
      }

      // =========================================
      // CHECK ROLE
      // =========================================

      if (data.role !== loginRole) {
        setMessage(
          `This account is not registered as ${loginRole.toLowerCase()}.`,
        );

        setLoading(false);
        return;
      }

      // =========================================
      // GET USER ID
      // =========================================

      const userId =
        data.id ?? data.userId ?? data.user?.id ?? data.user?.userId;

      console.log("Login User ID:", userId);
      console.log("Login Role:", data.role);

      // =========================================
      // VALIDATE USER ID
      // =========================================

      const validUserId =
        userId !== undefined &&
        userId !== null &&
        String(userId).trim() !== "" &&
        String(userId) !== "null" &&
        String(userId) !== "undefined";

      // =========================================
      // CLEAR OLD USER DATA
      // =========================================

      localStorage.removeItem("autoglow_user_id");
      localStorage.removeItem("userId");
      localStorage.removeItem("workerId");

      // =========================================
      // WORKER MUST HAVE VALID ID
      // =========================================

      if (data.role === "WORKER" && !validUserId) {
        console.error("Worker ID was not received from backend.", data);

        setMessage(
          "Worker ID was not received from server. Please check the login response.",
        );

        setLoading(false);
        return;
      }

      // =========================================
      // SAVE JWT TOKEN
      // =========================================

      localStorage.setItem("autoglow_token", data.token);

      // =========================================
      // SAVE USER ID
      // =========================================

      if (validUserId) {
        const idString = String(userId);

        localStorage.setItem("autoglow_user_id", idString);

        localStorage.setItem("userId", idString);

        // =========================================
        // SAVE WORKER ID
        // =========================================

        if (data.role === "WORKER") {
          localStorage.setItem("workerId", idString);

          console.log("Worker ID saved:", idString);
        }
      }

      // =========================================
      // SAVE ROLE
      // =========================================

      localStorage.setItem("autoglow_role", data.role);

      // =========================================
      // SAVE EMAIL
      // =========================================

      localStorage.setItem("autoglow_email", data.email || form.email);

      // =========================================
      // SAVE NAME
      // =========================================

      const userName = data.name || data.user?.name || "";

      if (userName) {
        localStorage.setItem("autoglow_name", userName);
      }

      // =========================================
      // FINAL DEBUG
      // =========================================

      console.log("====================================");
      console.log(
        "Saved autoglow_user_id:",
        localStorage.getItem("autoglow_user_id"),
      );

      console.log("Saved userId:", localStorage.getItem("userId"));

      console.log("Saved workerId:", localStorage.getItem("workerId"));

      console.log("Saved Role:", localStorage.getItem("autoglow_role"));

      console.log("Saved Name:", localStorage.getItem("autoglow_name"));

      console.log("Saved Email:", localStorage.getItem("autoglow_email"));

      console.log("====================================");

      // =========================================
      // ROLE BASED REDIRECT
      // =========================================

      if (data.role === "CUSTOMER") {
        navigate("/customer/dashboard");
      } else if (data.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (data.role === "WORKER") {
        navigate("/worker/dashboard");
      } else {
        setMessage("Invalid user role.");
      }
    } catch (error) {
      console.error("Login Error:", error);

      const errorMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : null) ||
        "Unable to login. Please check your credentials.";

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* ================= LEFT VISUAL ================= */}

      <div className="auth-visual">
        <div className="auth-visual-content">
          <Link to="/" className="brand auth-brand">
            <div className="brand-icon">A</div>

            <div className="brand-text">
              <span>Auto</span>Glow
            </div>
          </Link>

          <div className="auth-quote">
            <span>SMART VEHICLE CARE</span>

            <h1>
              Your vehicle.
              <br />
              <strong>Always in good hands.</strong>
            </h1>

            <p>
              Manage your vehicle services, bookings and intelligent inspections
              from one place.
            </p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT FORM ================= */}

      <div className="auth-form-area">
        <div className="auth-form-wrapper">
          {/* ================= MOBILE BRAND ================= */}

          <div className="mobile-auth-brand">
            <Link to="/" className="brand">
              <div className="brand-icon">A</div>

              <div className="brand-text">
                <span>Auto</span>Glow
              </div>
            </Link>
          </div>

          {/* ================= HEADING ================= */}

          <div className="auth-heading">
            <span className="section-label">WELCOME BACK</span>

            <h2>Sign in to AutoGlow</h2>

            <p>Access your vehicle care dashboard.</p>
          </div>

          {/* ================= LOGIN FORM ================= */}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* ================= LOGIN AS ================= */}

            <div className="input-group">
              <label>Login As</label>

              <select
                name="loginRole"
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
                className="login-role-select"
              >
                <option value="CUSTOMER">Customer</option>

                <option value="ADMIN">Admin</option>

                <option value="WORKER">Worker</option>
              </select>
            </div>

            {/* ================= EMAIL ================= */}

            <div className="input-group">
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

            {/* ================= PASSWORD ================= */}

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setMessage(
                      "Forgot password feature will be available soon.",
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* ================= MESSAGE ================= */}

            {message && <div className="auth-message">{message}</div>}

            {/* ================= SUBMIT ================= */}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* ================= DIVIDER ================= */}

          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* ================= SIGNUP ================= */}

          <p className="auth-switch">
            Don't have an account?
            <Link to="/signup">Create one</Link>
          </p>

          {/* ================= SECURITY ================= */}

          <p className="auth-security">
            🔒 Your account information is securely protected.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
