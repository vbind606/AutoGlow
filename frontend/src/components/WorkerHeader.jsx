import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  CircleHelp,
  X,
  Menu,
} from "lucide-react";

import api from "../services/api";
import "./WorkerHeader.css";

const WorkerHeader = ({
  sidebarOpen = true,
  toggleSidebar = () => {},
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const profileRef = useRef(null);

  // =========================================================
  // GET LOGGED-IN WORKER EMAIL
  // =========================================================

  const getWorkerEmail = () => {
    const savedEmail =
      localStorage.getItem("autoglow_email");

    if (savedEmail) {
      return savedEmail;
    }

    const token =
      localStorage.getItem("autoglow_token");

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
        "Unable to decode token",
        error
      );

      return null;
    }
  };

  // =========================================================
  // FETCH WORKER PROFILE
  // =========================================================

  const fetchWorker = async () => {
    try {
      setLoading(true);

      const email = getWorkerEmail();

      if (!email) {
        setLoading(false);
        return;
      }

      const response = await api.get(
        `/worker/profile?email=${encodeURIComponent(
          email
        )}`
      );

      setWorker(response.data);

    } catch (error) {
      console.error(
        "Worker profile loading failed:",
        error
      );

      if (error.response?.status === 401) {
        handleLogout();
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorker();
  }, []);

  // =========================================================
  // CLOSE PROFILE DROPDOWN OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // PAGE INFORMATION
  // =========================================================

  const getPageInfo = () => {
    const path = location.pathname;

    if (path === "/worker/dashboard") {
      return {
        title: "Worker Dashboard",
        subtitle:
          "Overview of your daily service activities",
        icon: "⌂",
      };
    }

    if (path === "/worker/jobs") {
      return {
        title: "My Jobs",
        subtitle:
          "Manage and track your assigned services",
        icon: "▣",
      };
    }

    if (path.includes("/worker/job-details")) {
      return {
        title: "Job Details",
        subtitle:
          "Complete service and customer information",
        icon: "◈",
      };
    }

    if (path.includes("/worker/inspection")) {
      return {
        title: "AI Vehicle Inspection",
        subtitle:
          "Inspect vehicle condition and identify issues",
        icon: "◉",
      };
    }

    if (path.includes("/worker/washing")) {
      return {
        title: "Vehicle Washing",
        subtitle:
          "Manage vehicle washing service",
        icon: "✦",
      };
    }

    if (path.includes("/worker/service-progress")) {
      return {
        title: "Service Progress",
        subtitle:
          "Track drying, quality check and delivery",
        icon: "↗",
      };
    }

    if (path.includes("/worker/profile")) {
      return {
        title: "My Profile",
        subtitle:
          "Manage your worker profile",
        icon: "●",
      };
    }

    if (path.includes("/worker/notifications")) {
      return {
        title: "Notifications",
        subtitle:
          "Stay updated with your service activities",
        icon: "♢",
      };
    }

    if (path.includes("/worker/settings")) {
      return {
        title: "Settings",
        subtitle:
          "Manage your portal preferences",
        icon: "⚙",
      };
    }

    return {
      title: "Worker Portal",
      subtitle:
        "AutoGlow service management",
      icon: "⌂",
    };
  };

  const pageInfo = getPageInfo();

  // =========================================================
  // WORKER INITIALS
  // =========================================================

  const getInitials = () => {
    if (!worker?.name) {
      return "W";
    }

    return worker.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate("/worker/jobs");
      return;
    }

    navigate(
      `/worker/jobs?search=${encodeURIComponent(
        value
      )}`
    );
  };

  const clearSearch = () => {
    setSearch("");
  };

  // =========================================================
  // PROFILE
  // =========================================================

  const openProfile = () => {
    setProfileOpen(false);
    navigate("/worker/profile");

    if (window.innerWidth <= 900) {
      toggleSidebar(false);
    }
  };

  const openSettings = () => {
    setProfileOpen(false);
    navigate("/worker/settings");

    if (window.innerWidth <= 900) {
      toggleSidebar(false);
    }
  };

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const openNotifications = () => {
    setProfileOpen(false);
    navigate("/worker/notifications");

    if (window.innerWidth <= 900) {
      toggleSidebar(false);
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
  // UI
  // =========================================================

  return (
    <header className="worker-header">

      <div className="worker-header-inner">

        {/* ===================================================
            LEFT SECTION
        =================================================== */}

        <div className="worker-header-left">

          {/* SIDEBAR TOGGLE */}

          <button
            type="button"
            className="worker-sidebar-toggle"
            onClick={() =>
              toggleSidebar()
            }
            aria-label={
              sidebarOpen
                ? "Close sidebar"
                : "Open sidebar"
            }
          >

            {sidebarOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}

          </button>


          {/* BREADCRUMB */}

          <div className="worker-breadcrumb">

            <span className="breadcrumb-brand">
              AutoGlow
            </span>

            <span className="breadcrumb-separator">
              /
            </span>

            <span className="breadcrumb-portal">
              Worker Portal
            </span>

          </div>


          {/* PAGE HEADING */}

          <div className="worker-page-heading">

            <div className="worker-page-icon">
              {pageInfo.icon}
            </div>

            <div>

              <h1>
                {pageInfo.title}
              </h1>

              <p>
                {pageInfo.subtitle}
              </p>

            </div>

          </div>

        </div>


        {/* ===================================================
            CENTER SEARCH
        =================================================== */}

        <form
          className="worker-header-search"
          onSubmit={handleSearch}
        >

          <Search size={19} />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search jobs, vehicles, customers..."
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={clearSearch}
            >
              <X size={16} />
            </button>
          )}

          <button
            type="submit"
            className="search-button"
          >
            Search
          </button>

        </form>


        {/* ===================================================
            RIGHT SECTION
        =================================================== */}

        <div className="worker-header-right">

          {/* STATUS */}

          <div className="worker-status">

            <span
              className={`status-dot ${
                worker?.active
                  ? "status-online"
                  : "status-offline"
              }`}
            />

            <div className="status-text">

              <strong>
                {worker?.active
                  ? "Online"
                  : "Offline"}
              </strong>

              <span>
                {worker?.active
                  ? "Available for work"
                  : "Currently unavailable"}
              </span>

            </div>

          </div>


          {/* NOTIFICATION */}

          <button
            type="button"
            className="header-icon-button"
            onClick={openNotifications}
            title="Notifications"
          >

            <Bell size={20} />

            {notificationCount > 0 && (
              <span className="notification-badge">
                {notificationCount > 9
                  ? "9+"
                  : notificationCount}
              </span>
            )}

          </button>


          {/* PROFILE */}

          <div
            className="worker-profile-wrapper"
            ref={profileRef}
          >

            <button
              type="button"
              className={`worker-profile-button ${
                profileOpen
                  ? "profile-active"
                  : ""
              }`}
              onClick={() =>
                setProfileOpen(
                  (prev) => !prev
                )
              }
            >

              <div className="worker-avatar">

                {loading
                  ? "..."
                  : getInitials()}

              </div>

              <div className="worker-profile-info">

                <strong>
                  {loading
                    ? "Loading..."
                    : worker?.name ||
                      "Worker"}
                </strong>

                <span>
                  {worker?.specialization ||
                    "AutoGlow Worker"}
                </span>

              </div>

              <ChevronDown
                size={17}
                className={`profile-chevron ${
                  profileOpen
                    ? "rotate"
                    : ""
                }`}
              />

            </button>


            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

            {profileOpen && (

              <div className="worker-profile-dropdown">

                {/* DROPDOWN HEADER */}

                <div className="dropdown-worker-info">

                  <div className="dropdown-avatar">
                    {getInitials()}
                  </div>

                  <div>

                    <strong>
                      {worker?.name ||
                        "Worker"}
                    </strong>

                    <span>
                      {worker?.email || ""}
                    </span>

                  </div>

                </div>


                <div className="dropdown-divider" />


                {/* PROFILE */}

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={openProfile}
                >

                  <span className="dropdown-item-icon">
                    <User size={17} />
                  </span>

                  <span>

                    <strong>
                      Edit Profile
                    </strong>

                    <small>
                      Update your personal details
                    </small>

                  </span>

                </button>


                {/* SETTINGS */}

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={openSettings}
                >

                  <span className="dropdown-item-icon">
                    <Settings size={17} />
                  </span>

                  <span>

                    <strong>
                      Settings
                    </strong>

                    <small>
                      Manage portal preferences
                    </small>

                  </span>

                </button>


                {/* HELP */}

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                >

                  <span className="dropdown-item-icon">
                    <CircleHelp size={17} />
                  </span>

                  <span>

                    <strong>
                      Help & Support
                    </strong>

                    <small>
                      Get assistance from AutoGlow
                    </small>

                  </span>

                </button>


                <div className="dropdown-divider" />


                {/* WORKER STATUS */}

                <div className="dropdown-status">

                  <ShieldCheck size={16} />

                  <span>
                    Worker account
                  </span>

                  <strong
                    className={
                      worker?.active
                        ? "active-text"
                        : "inactive-text"
                    }
                  >
                    {worker?.active
                      ? "Active"
                      : "Inactive"}
                  </strong>

                </div>


                {/* LOGOUT */}

                <button
                  type="button"
                  className="dropdown-logout"
                  onClick={handleLogout}
                >

                  <LogOut size={17} />

                  <span>
                    Logout
                  </span>

                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </header>
  );
};

export default WorkerHeader;