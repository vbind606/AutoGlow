import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WorkerSettings.css";

const WorkerSettings = () => {
    const navigate = useNavigate();

    // =========================================================
    // WORKER INFORMATION
    // =========================================================

    const [workerName, setWorkerName] = useState("Worker");
    const [workerEmail, setWorkerEmail] = useState("");
    const [workerId, setWorkerId] = useState("");

    // =========================================================
    // NOTIFICATIONS
    // =========================================================

    const [notifications, setNotifications] = useState({
        newJobs: true,
        serviceUpdates: true,
        issueAlerts: true,
        attendanceReminders: true,
    });

    // =========================================================
    // WORK AVAILABILITY
    // =========================================================

    const [availability, setAvailability] = useState(true);

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // =========================================================
    // LOAD WORKER INFORMATION
    // =========================================================

    useEffect(() => {
        const name =
            localStorage.getItem("autoglow_name") || "Worker";

        const email =
            localStorage.getItem("autoglow_email") || "";

        const id =
            localStorage.getItem("autoglow_user_id") ||
            localStorage.getItem("workerId") ||
            localStorage.getItem("userId") ||
            "";

        setWorkerName(name);
        setWorkerEmail(email);
        setWorkerId(id);
    }, []);

    // =========================================================
    // NOTIFICATION TOGGLE
    // =========================================================

    const toggleNotification = (key) => {
        setNotifications((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // =========================================================
    // AVAILABILITY
    // =========================================================

    const handleAvailability = () => {
        setAvailability((prev) => !prev);
    };

    // =========================================================
    // OPEN CHANGE PASSWORD MODAL
    // =========================================================

    const openPasswordModal = () => {
        setPasswordMessage("");
        setPasswordError("");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setShowPasswordModal(true);
    };

    // =========================================================
    // CLOSE CHANGE PASSWORD MODAL
    // =========================================================

    const closePasswordModal = () => {
        if (passwordLoading) {
            return;
        }

        setShowPasswordModal(false);

        setPasswordMessage("");
        setPasswordError("");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    const handleChangePassword = async (e) => {
        e.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        // -----------------------------------------------------
        // CHECK WORKER ID
        // -----------------------------------------------------

        if (!workerId) {
            setPasswordError(
                "Worker ID not found. Please login again."
            );
            return;
        }

        // -----------------------------------------------------
        // CHECK EMPTY FIELDS
        // -----------------------------------------------------

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            setPasswordError(
                "Please fill all password fields."
            );
            return;
        }

        // -----------------------------------------------------
        // PASSWORD LENGTH
        // -----------------------------------------------------

        if (newPassword.length < 6) {
            setPasswordError(
                "New password must be at least 6 characters."
            );
            return;
        }

        // -----------------------------------------------------
        // CONFIRM PASSWORD
        // -----------------------------------------------------

        if (newPassword !== confirmPassword) {
            setPasswordError(
                "New password and confirm password do not match."
            );
            return;
        }

        // -----------------------------------------------------
        // SAME PASSWORD CHECK
        // -----------------------------------------------------

        if (currentPassword === newPassword) {
            setPasswordError(
                "New password must be different from current password."
            );
            return;
        }

        try {
            setPasswordLoading(true);

            const token =
                localStorage.getItem("autoglow_token");

            // -------------------------------------------------
            // BACKEND API
            // -------------------------------------------------

            const response = await fetch(
                `http://localhost:8080/api/worker/change-password/${workerId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",

                        ...(token
                            ? {
                                  Authorization:
                                      `Bearer ${token}`,
                              }
                            : {}),
                    },

                    body: JSON.stringify({
                        currentPassword:
                            currentPassword,

                        newPassword:
                            newPassword,
                    }),
                }
            );

            const data = await response.text();

            console.log(
                "Change Password Response:",
                response.status,
                data
            );

            // -------------------------------------------------
            // BACKEND ERROR
            // -------------------------------------------------

            if (!response.ok) {
                throw new Error(
                    data ||
                        "Password update failed."
                );
            }

            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            setPasswordMessage(
                "Password updated successfully!"
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Close modal after success
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordMessage("");
            }, 1500);

        } catch (error) {
            console.error(
                "Change password error:",
                error
            );

            setPasswordError(
                error.message ||
                    "Unable to update password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_user_id");
        localStorage.removeItem("autoglow_role");
        localStorage.removeItem("autoglow_email");
        localStorage.removeItem("autoglow_name");
        localStorage.removeItem("userId");
        localStorage.removeItem("workerId");

        navigate("/login");
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="worker-settings-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="worker-settings-header">

                <div>

                    <span className="settings-small-title">
                        WORKER ACCOUNT
                    </span>

                    <h1>Settings</h1>

                    <p>
                        Manage your account, notifications and
                        work preferences.
                    </p>

                </div>

                <button
                    className="settings-dashboard-btn"
                    onClick={() =>
                        navigate("/worker/dashboard")
                    }
                >
                    ← Dashboard
                </button>

            </div>


            {/* =================================================
                SETTINGS CONTAINER
            ================================================= */}

            <div className="worker-settings-container">


                {/* =================================================
                    ACCOUNT INFORMATION
                ================================================= */}

                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-icon blue">
                            👤
                        </div>

                        <div>

                            <h2>
                                Account Information
                            </h2>

                            <p>
                                Your registered AutoGlow
                                worker account
                            </p>

                        </div>

                    </div>


                    <div className="settings-account-grid">

                        <div className="settings-info-item">

                            <span>
                                Full Name
                            </span>

                            <strong>
                                {workerName}
                            </strong>

                        </div>


                        <div className="settings-info-item">

                            <span>
                                Email Address
                            </span>

                            <strong>
                                {workerEmail ||
                                    "Not available"}
                            </strong>

                        </div>


                        <div className="settings-info-item">

                            <span>
                                Worker ID
                            </span>

                            <strong>
                                {workerId
                                    ? `#${workerId}`
                                    : "Not available"}
                            </strong>

                        </div>


                        <div className="settings-info-item">

                            <span>
                                Account Role
                            </span>

                            <strong className="role-text">
                                WORKER
                            </strong>

                        </div>

                    </div>


                    <div className="settings-card-footer">

                        <button
                            className="secondary-settings-btn"
                            onClick={() =>
                                navigate(
                                    "/worker/profile"
                                )
                            }
                        >
                            View Profile
                        </button>

                    </div>

                </section>


                {/* =================================================
                    WORK AVAILABILITY
                ================================================= */}

                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-icon green">
                            ●
                        </div>

                        <div>

                            <h2>
                                Work Availability
                            </h2>

                            <p>
                                Control whether you are
                                available for new service
                                assignments.
                            </p>

                        </div>

                    </div>


                    <div className="availability-box">

                        <div className="availability-content">

                            <div
                                className={`availability-status ${
                                    availability
                                        ? "available"
                                        : "offline"
                                }`}
                            >

                                <span></span>

                                {availability
                                    ? "Available for Work"
                                    : "Currently Offline"}

                            </div>


                            <p>

                                {availability
                                    ? "You can receive new service assignments."
                                    : "You will not receive new service assignments."}

                            </p>

                        </div>


                        <button
                            className={`settings-toggle ${
                                availability
                                    ? "active"
                                    : ""
                            }`}
                            onClick={
                                handleAvailability
                            }
                            aria-label="Toggle work availability"
                        >
                            <span></span>
                        </button>

                    </div>

                </section>


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-icon purple">
                            🔔
                        </div>

                        <div>

                            <h2>
                                Notification Preferences
                            </h2>

                            <p>
                                Choose which notifications
                                you want to receive.
                            </p>

                        </div>

                    </div>


                    <div className="notification-list">


                        {/* NEW JOBS */}

                        <div className="notification-item">

                            <div className="notification-item-left">

                                <div className="notification-symbol">
                                    📋
                                </div>

                                <div>

                                    <h3>
                                        New Job Alerts
                                    </h3>

                                    <p>
                                        Get notified when a new
                                        job is assigned to you.
                                    </p>

                                </div>

                            </div>


                            <button
                                className={`settings-toggle ${
                                    notifications.newJobs
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    toggleNotification(
                                        "newJobs"
                                    )
                                }
                            >
                                <span></span>
                            </button>

                        </div>


                        {/* SERVICE UPDATES */}

                        <div className="notification-item">

                            <div className="notification-item-left">

                                <div className="notification-symbol">
                                    🔄
                                </div>

                                <div>

                                    <h3>
                                        Service Updates
                                    </h3>

                                    <p>
                                        Receive updates about
                                        assigned service jobs.
                                    </p>

                                </div>

                            </div>


                            <button
                                className={`settings-toggle ${
                                    notifications.serviceUpdates
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    toggleNotification(
                                        "serviceUpdates"
                                    )
                                }
                            >
                                <span></span>
                            </button>

                        </div>


                        {/* ISSUE ALERTS */}

                        <div className="notification-item">

                            <div className="notification-item-left">

                                <div className="notification-symbol">
                                    ⚠️
                                </div>

                                <div>

                                    <h3>
                                        Issue Alerts
                                    </h3>

                                    <p>
                                        Get alerts for reported
                                        vehicle issues.
                                    </p>

                                </div>

                            </div>


                            <button
                                className={`settings-toggle ${
                                    notifications.issueAlerts
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    toggleNotification(
                                        "issueAlerts"
                                    )
                                }
                            >
                                <span></span>
                            </button>

                        </div>


                        {/* ATTENDANCE */}

                        <div className="notification-item">

                            <div className="notification-item-left">

                                <div className="notification-symbol">
                                    🕒
                                </div>

                                <div>

                                    <h3>
                                        Attendance Reminders
                                    </h3>

                                    <p>
                                        Receive reminders about
                                        your attendance.
                                    </p>

                                </div>

                            </div>


                            <button
                                className={`settings-toggle ${
                                    notifications.attendanceReminders
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    toggleNotification(
                                        "attendanceReminders"
                                    )
                                }
                            >
                                <span></span>
                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SECURITY
                ================================================= */}

                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-icon orange">
                            🔐
                        </div>

                        <div>

                            <h2>
                                Security
                            </h2>

                            <p>
                                Manage your account security.
                            </p>

                        </div>

                    </div>


                    <div className="security-row">

                        <div className="security-left">

                            <div className="security-symbol">
                                🔑
                            </div>

                            <div>

                                <h3>
                                    Password
                                </h3>

                                <p>
                                    Keep your account protected
                                    with a secure password.
                                </p>

                            </div>

                        </div>


                        <button
                            className="secondary-settings-btn"
                            onClick={
                                openPasswordModal
                            }
                        >
                            Change Password
                        </button>

                    </div>

                </section>


                {/* =================================================
                    DANGER ZONE
                ================================================= */}

                <section className="settings-card danger-card">

                    <div className="settings-card-header">

                        <div className="settings-icon red">
                            ⚠
                        </div>

                        <div>

                            <h2>
                                Account Actions
                            </h2>

                            <p>
                                Sign out from your AutoGlow
                                worker account.
                            </p>

                        </div>

                    </div>


                    <div className="logout-row">

                        <div>

                            <h3>
                                Sign Out
                            </h3>

                            <p>
                                You will be redirected to the
                                AutoGlow login page.
                            </p>

                        </div>


                        <button
                            className="logout-settings-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </section>

            </div>


            {/* =====================================================
                CHANGE PASSWORD MODAL
            ===================================================== */}

            {showPasswordModal && (

                <div
                    className="password-modal-overlay"
                    onClick={() => {
                        if (!passwordLoading) {
                            closePasswordModal();
                        }
                    }}
                >

                    <div
                        className="password-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="password-modal-header">

                            <div>

                                <span className="password-modal-small-title">
                                    ACCOUNT SECURITY
                                </span>

                                <h2>
                                    Change Password
                                </h2>

                                <p>
                                    Update your AutoGlow
                                    account password.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="password-modal-close"
                                disabled={
                                    passwordLoading
                                }
                                onClick={
                                    closePasswordModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* PASSWORD FORM */}

                        <form
                            className="password-form"
                            onSubmit={
                                handleChangePassword
                            }
                        >

                            {/* CURRENT PASSWORD */}

                            <div className="password-field">

                                <label>
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        currentPassword
                                    }
                                    onChange={(e) =>
                                        setCurrentPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter current password"
                                    autoComplete="current-password"
                                />

                            </div>


                            {/* NEW PASSWORD */}

                            <div className="password-field">

                                <label>
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        newPassword
                                    }
                                    onChange={(e) =>
                                        setNewPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                />

                                <small>
                                    Minimum 6 characters
                                </small>

                            </div>


                            {/* CONFIRM PASSWORD */}

                            <div className="password-field">

                                <label>
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        confirmPassword
                                    }
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                />

                            </div>


                            {/* ERROR MESSAGE */}

                            {passwordError && (

                                <div className="password-message error">

                                    ⚠ {passwordError}

                                </div>

                            )}


                            {/* SUCCESS MESSAGE */}

                            {passwordMessage && (

                                <div className="password-message success">

                                    ✓ {passwordMessage}

                                </div>

                            )}


                            {/* MODAL ACTIONS */}

                            <div className="password-modal-actions">

                                <button
                                    type="button"
                                    className="password-cancel-btn"
                                    disabled={
                                        passwordLoading
                                    }
                                    onClick={
                                        closePasswordModal
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="password-update-btn"
                                    disabled={
                                        passwordLoading
                                    }
                                >

                                    {passwordLoading
                                        ? "Updating..."
                                        : "Update Password"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default WorkerSettings;