import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar({ sidebarOpen, onClose }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      section: "MAIN MENU",
      items: [
        {
          label: "Dashboard",
          icon: "▦",
          path: "/admin/dashboard",
        },
        {
          label: "Customers",
          icon: "♙",
          path: "/admin/customers",
        },
        {
          label: "Vehicles",
          icon: "🚗",
          path: "/admin/vehicles",
        },
        {
          label: "Bookings",
          icon: "▣",
          path: "/admin/bookings",
        },
        {
          label: "Services",
          icon: "✦",
          path: "/admin/services",
        },
        {
          label: "Packages",
          icon: "▤",
          path: "/admin/packages",
        },
      ],
    },

    {
      section: "MANAGEMENT",
      items: [
        {
          label: "Workers",
          icon: "♟",
          path: "/admin/workers",
        },
        {
          label: "Attendance",
          icon: "◷",
          path: "/admin/attendance",
        },
        {
          label: "Payments",
          icon: "₹",
          path: "/admin/payments",
        },
        {
          label: "Invoices",
          icon: "▤",
          path: "/admin/invoices",
        },
        {
          label: "Coupons",
          icon: "％",
          path: "/admin/coupons",
        },
        {
          label: "Reviews",
          icon: "★",
          path: "/admin/reviews",
        },
        {
          label: "Gallery",
          icon: "▧",
          path: "/admin/gallery",
        },
      ],
    },

    {
      section: "ANALYTICS",
      items: [
        {
          label: "Reports",
          icon: "◫",
          path: "/admin/reports",
        },
        {
          label: "AI Inspection",
          icon: "✧",
          path: "/admin/ai-inspection",
        },
      ],
    },
  ];

  // =========================================
  // MENU CLICK
  // =========================================

  const handleMenuClick = () => {
    // Mobile par page open hone ke baad sidebar close
    if (window.innerWidth <= 900) {
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");
    localStorage.removeItem("autoglow_email");
    localStorage.removeItem("autoglow_user_id");
    localStorage.removeItem("autoglow_name");
    localStorage.removeItem("userId");
    localStorage.removeItem("workerId");

    navigate("/login");
  };

  return (
    <>
      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={onClose} />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {/* =========================================
            BRAND
        ========================================= */}

        <div className="admin-brand">
          <div className="admin-brand-left">
            <div className="admin-brand-icon">A</div>

            <div className="admin-brand-text">
              <h2>AutoGlow</h2>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          {/* CLOSE SIDEBAR */}

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* =========================================
            NAVIGATION
        ========================================= */}

        <nav className="admin-nav">
          {menuItems.map((section) => (
            <div className="admin-nav-section" key={section.section}>
              <p>{section.section}</p>

              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin/dashboard"}
                  className={({ isActive }) =>
                    `admin-nav-item ${isActive ? "active" : ""}`
                  }
                  onClick={handleMenuClick}
                >
                  <span className="admin-nav-icon">{item.icon}</span>

                  <span className="admin-nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* =========================================
            BOTTOM
        ========================================= */}

        <div className="admin-sidebar-bottom">
          {/* SETTINGS */}

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
            onClick={handleMenuClick}
          >
            <span className="admin-nav-icon">⚙</span>

            <span className="admin-nav-label">Settings</span>
          </NavLink>

          {/* LOGOUT */}

          <button type="button" className="admin-logout" onClick={handleLogout}>
            <span className="admin-nav-icon">↪</span>

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
