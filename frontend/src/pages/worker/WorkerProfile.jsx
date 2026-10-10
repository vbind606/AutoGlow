import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./WorkerProfile.css";

const WorkerProfile = () => {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // =========================================================
    // LOAD WORKER PROFILE
    // =========================================================

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);

            // =================================================
            // GET LOGIN DATA
            // =================================================

            const workerId =
                localStorage.getItem("autoglow_user_id") ||
                localStorage.getItem("userId") ||
                localStorage.getItem("workerId");

            const savedName =
                localStorage.getItem("autoglow_name") || "";

            const savedEmail =
                localStorage.getItem("autoglow_email") || "";

            const savedRole =
                localStorage.getItem("autoglow_role") || "WORKER";

            const token =
                localStorage.getItem("autoglow_token");

            console.log("================================");
            console.log("WORKER PROFILE");
            console.log("Worker ID:", workerId);
            console.log("Name:", savedName);
            console.log("Email:", savedEmail);
            console.log("Role:", savedRole);
            console.log("Token:", !!token);
            console.log("================================");

            // =================================================
            // NO LOGIN INFORMATION
            // =================================================

            if (!workerId) {
                setProfile(null);
                setLoading(false);
                return;
            }

            // =================================================
            // LOCAL PROFILE
            // =================================================

            const localProfile = {
                id: workerId,
                name: savedName || "Worker",
                email: savedEmail || "No email available",
                role: savedRole || "WORKER",
            };

            // Show local data immediately
            setProfile(localProfile);

            // =================================================
            // TRY BACKEND
            // =================================================

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/worker/profile/${workerId}`,
                    {
                        headers: token
                            ? {
                                  Authorization: `Bearer ${token}`,
                              }
                            : {},
                    }
                );

                console.log(
                    "Backend Profile:",
                    response.data
                );

                if (response.data) {
                    setProfile({
                        id:
                            response.data.id ??
                            localProfile.id,

                        name:
                            response.data.name ??
                            localProfile.name,

                        email:
                            response.data.email ??
                            localProfile.email,

                        role:
                            response.data.role ??
                            localProfile.role,
                    });
                }
            } catch (apiError) {
                console.warn(
                    "Profile API unavailable. Using login data.",
                    apiError.response?.status
                );

                // Important:
                // Do not remove local profile.
                // Login data is already displayed.
            }
        } catch (error) {
            console.error(
                "Worker profile loading error:",
                error
            );

            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="worker-profile-page">
                <div className="worker-profile-loading">
                    <div className="profile-loader"></div>

                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    // =========================================================
    // PROFILE NOT AVAILABLE
    // =========================================================

    if (!profile) {
        return (
            <div className="worker-profile-page">
                <div className="worker-profile-error">
                    <div className="error-icon">!</div>

                    <h3>Profile Not Available</h3>

                    <p>
                        Worker login information was not found.
                        Please login again to continue.
                    </p>

                    <div className="profile-error-actions">
                        <button
                            type="button"
                            className="profile-back-btn primary"
                            onClick={() => navigate("/login")}
                        >
                            Go to Login
                        </button>

                        <button
                            type="button"
                            className="profile-back-btn secondary"
                            onClick={() => navigate("/worker/dashboard")}
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // PROFILE PAGE
    // =========================================================

    return (
        <div className="worker-profile-page">

            {/* =================================================
                PAGE INTRO
            ================================================= */}

            <div className="worker-profile-header">

                <div className="profile-heading-content">

                    <span className="profile-small-title">
                        WORKER ACCOUNT
                    </span>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        Manage and view your AutoGlow worker account.
                    </p>

                </div>

                <button
                    type="button"
                    className="profile-dashboard-btn"
                    onClick={() =>
                        navigate("/worker/dashboard")
                    }
                >
                    <span>←</span>
                    Dashboard
                </button>

            </div>


            {/* =================================================
                MAIN PROFILE CARD
            ================================================= */}

            <div className="worker-profile-card">

                {/* =================================================
                    PROFILE HERO
                ================================================= */}

                <div className="profile-card-top">

                    <div className="profile-hero-content">

                        {/* OLD STYLE MA AVATAR */}

                        <div className="worker-avatar">
                            MA
                        </div>

                        <div className="worker-basic-info">

                            <div className="worker-name-row">

                                <h2>
                                    {profile.name || "Worker"}
                                </h2>

                                <span className="verified-badge">
                                    ✓ Verified
                                </span>

                            </div>

                            <p className="worker-email">

                                <span className="email-icon">
                                    ✉
                                </span>

                                {profile.email ||
                                    "No email available"}

                            </p>

                            <div className="worker-meta">

                                <span className="worker-role-badge">
                                    {profile.role || "WORKER"}
                                </span>

                                <span className="worker-status">
                                    <span className="status-dot"></span>
                                    Active
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    PROFILE BODY
                ================================================= */}

                <div className="profile-card-body">

                    {/* =================================================
                        SECTION TITLE
                    ================================================= */}

                    <div className="profile-section-title">

                        <div className="section-icon">
                            <span>♙</span>
                        </div>

                        <div>
                            <h3>
                                Personal Information
                            </h3>

                            <p>
                                Your registered AutoGlow account details
                            </p>
                        </div>

                    </div>


                    {/* =================================================
                        INFORMATION GRID
                    ================================================= */}

                    <div className="profile-info-grid">

                        {/* Worker ID */}

                        <div className="profile-info-box">

                            <div className="info-icon">
                                #
                            </div>

                            <div className="info-content">

                                <span className="info-label">
                                    Worker ID
                                </span>

                                <strong>
                                    #{profile.id || "-"}
                                </strong>

                            </div>

                        </div>


                        {/* Full Name */}

                        <div className="profile-info-box">

                            <div className="info-icon">
                                A
                            </div>

                            <div className="info-content">

                                <span className="info-label">
                                    Full Name
                                </span>

                                <strong>
                                    {profile.name || "-"}
                                </strong>

                            </div>

                        </div>


                        {/* Email */}

                        <div className="profile-info-box">

                            <div className="info-icon">
                                @
                            </div>

                            <div className="info-content">

                                <span className="info-label">
                                    Email Address
                                </span>

                                <strong>
                                    {profile.email || "-"}
                                </strong>

                            </div>

                        </div>


                        {/* Role */}

                        <div className="profile-info-box">

                            <div className="info-icon">
                                ★
                            </div>

                            <div className="info-content">

                                <span className="info-label">
                                    Account Role
                                </span>

                                <strong>
                                    {profile.role || "WORKER"}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        ACCOUNT STATUS
                    ================================================= */}

                    <div className="profile-status-section">

                        <div className="status-left">

                            <div className="status-icon">
                                ✓
                            </div>

                            <div>

                                <h3>
                                    Account Active
                                </h3>

                                <p>
                                    Your AutoGlow worker account is active
                                    and available for assigned services.
                                </p>

                            </div>

                        </div>

                        <span className="active-badge">
                            ACTIVE
                        </span>

                    </div>


                    {/* =================================================
                        PROFILE FOOTER
                    ================================================= */}

                    <div className="profile-footer">

                        <div className="profile-footer-info">

                            <span className="footer-dot"></span>

                            <span>
                                AutoGlow Worker Portal
                            </span>

                        </div>

                        <span>
                            Account ID #{profile.id || "-"}
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default WorkerProfile;