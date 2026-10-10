import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("autoglow_token");
  const role = localStorage.getItem("autoglow_role");

  const logout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");
    navigate("/login");
  };

  const goToDashboard = () => {
    if (role === "CUSTOMER") {
      navigate("/customer/dashboard");
    } else if (role === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (role === "WORKER") {
      navigate("/worker/dashboard");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="brand">
          <div className="brand-icon">A</div>

          <div className="brand-text">
            <span>Auto</span>Glow
          </div>
        </Link>

        {/* Navigation */}
        <nav className="nav-menu">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/packages">Packages</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {!token ? (
            <>
              <Link to="/login" className="login-link">
                Login
              </Link>

              <Link to="/signup" className="nav-book-btn">
                <span>Book a Service</span>
                <span className="book-arrow">→</span>
              </Link>
            </>
          ) : (
            <>
              <button onClick={goToDashboard} className="dashboard-btn">
                Dashboard
              </button>

              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
