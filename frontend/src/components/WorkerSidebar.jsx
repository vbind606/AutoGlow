import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./WorkerSidebar.css";

const WorkerSidebar = ({
  sidebarOpen = true,
  onClose = () => {},
}) => {
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // GET LOGGED-IN WORKER EMAIL
  // =========================================================

  const getWorkerEmail = () => {
    const savedEmail = localStorage.getItem("autoglow_email");

    if (savedEmail) {
      return savedEmail;
    }

    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return (
        payload.email ||
        payload.sub ||
        payload.username ||
        null
      );
    } catch (error) {
      console.error(
        "Unable to read worker token:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // LOAD WORKER PROFILE
  // =========================================================

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        const email = getWorkerEmail();

        if (!email) {
          console.warn("Worker email not found");
          setLoading(false);
          return;
        }

        const response = await api.get(
          `/worker/profile?email=${encodeURIComponent(email)}`
        );

        setWorker(response.data);
      } catch (error) {
        console.error(
          "Failed to load worker profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerProfile();
  }, []);

  // =========================================================
  // MOBILE MENU NAVIGATION
  // =========================================================

  const handleMenuClick = () => {
    // Mobile par page navigate hone ke baad sidebar close
    if (window.innerWidth <= 900) {
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  // =========================================================
  // PROFILE CLICK
  // =========================================================

  const handleProfileClick = () => {
    navigate("/worker/profile");

    if (window.innerWidth <= 900) {
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

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

  // =========================================================
  // WORKER SIDEBAR MENU
  // =========================================================

  const menuItems = [
    // ---------------------------------------------------------
    // MAIN
    // ---------------------------------------------------------

    {
      path: "/worker/dashboard",
      icon: "▦",
      label: "Dashboard",
    },

    {
      path: "/worker/jobs",
      icon: "▣",
      label: "My Jobs",
    },

    // ---------------------------------------------------------
    // SERVICE MANAGEMENT
    // ---------------------------------------------------------

    {
      path: "/worker/checklist",
      icon: "✓",
      label: "Service Checklist",
    },

    {
      path: "/worker/ai-inspection",
      icon: "✦",
      label: "AI Inspection",
    },

    {
      path: "/worker/washing",
      icon: "◉",
      label: "Vehicle Washing",
    },

    {
      path: "/worker/service-progress",
      icon: "◒",
      label: "Service Progress",
    },

    // ---------------------------------------------------------
    // ISSUES
    // ---------------------------------------------------------

    {
      path: "/worker/issues",
      icon: "⚠",
      label: "Issues & Reports",
    },

    // ---------------------------------------------------------
    // WORKER MANAGEMENT
    // ---------------------------------------------------------

    {
      path: "/worker/attendance",
      icon: "◷",
      label: "Attendance",
    },

    {
      path: "/worker/service-history",
      icon: "◴",
      label: "Service History",
    },

    {
      path: "/worker/performance",
      icon: "↗",
      label: "Performance",
    },

    {
      path: "/worker/ai-recommendation",
      icon: "✧",
      label: "AI Recommendations",
    },

    // ---------------------------------------------------------
    // NOTIFICATIONS
    // ---------------------------------------------------------

    {
      path: "/worker/notifications",
      icon: "🔔",
      label: "Notifications",
    },

    // ---------------------------------------------------------
    // ACCOUNT
    // ---------------------------------------------------------

    {
      path: "/worker/profile",
      icon: "♙",
      label: "Profile",
    },

    {
      path: "/worker/settings",
      icon: "⚙",
      label: "Settings",
    },
  ];

  // =========================================================
  // WORKER DISPLAY DATA
  // =========================================================

  const workerName =
    worker?.name ||
    localStorage.getItem("autoglow_name") ||
    "Worker";

  const workerSpecialization =
    worker?.specialization ||
    "AutoGlow Worker";

  // =========================================================
  // GET INITIALS
  // =========================================================

  const getInitials = (name) => {
    if (!name) return "W";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };

  const workerInitials =
    getInitials(workerName);

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="worker-sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`worker-sidebar ${
          sidebarOpen ? "open" : "closed"
        }`}
      >

        {/* ===================================================
            LOGO / HEADER
        =================================================== */}

        <div className="worker-sidebar-logo">

          <div className="worker-sidebar-brand">

            <div className="autoglow-logo-icon">
              A
            </div>

            <div className="autoglow-logo-text">

              <span>
                AutoGlow
              </span>

              <small>
                Worker Portal
              </small>

            </div>

          </div>


          {/* CLOSE BUTTON */}

          <button
            type="button"
            className="worker-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>

        </div>


        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="worker-sidebar-menu">

          {menuItems.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              end={
                item.path === "/worker/dashboard"
              }
              className={({ isActive }) =>
                `worker-nav-item ${
                  isActive ? "active" : ""
                }`
              }
              onClick={handleMenuClick}
            >

              <span className="worker-nav-icon">
                {item.icon}
              </span>

              <span className="worker-nav-label">
                {item.label}
              </span>

            </NavLink>

          ))}

        </nav>


        {/* ===================================================
            WORKER PROFILE
        =================================================== */}

        <div className="worker-sidebar-bottom">

          <div
            className="worker-mini-profile"
            onClick={handleProfileClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleProfileClick();
              }
            }}
          >

            {/* AVATAR */}

            <div className="worker-avatar">

              {loading
                ? "..."
                : workerInitials}

            </div>


            {/* WORKER INFORMATION */}

            <div className="worker-mini-info">

              <strong>
                {loading
                  ? "Loading..."
                  : workerName}
              </strong>

              <span>
                {loading
                  ? "Please wait..."
                  : workerSpecialization}
              </span>

            </div>

          </div>


          {/* LOGOUT */}

          <button
            className="worker-logout-btn"
            onClick={handleLogout}
            title="Logout"
            type="button"
          >
            ⇥
          </button>

        </div>

      </aside>
    </>
  );
};

export default WorkerSidebar;