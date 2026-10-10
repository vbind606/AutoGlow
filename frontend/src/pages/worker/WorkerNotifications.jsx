import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WorkerNotifications.css";

const API_BASE_URL = "http://localhost:8080/api/notifications";

const WorkerNotifications = () => {
    const navigate = useNavigate();

    // =========================================================
    // STATE
    // =========================================================

    const [notifications, setNotifications] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // GET JWT TOKEN
    // =========================================================

    const getToken = () => {
        return localStorage.getItem("autoglow_token");
    };

    // =========================================================
    // COMMON HEADERS
    // =========================================================

    const getHeaders = () => {
        const token = getToken();

        return {
            "Content-Type": "application/json",
            ...(token
                ? {
                      Authorization: `Bearer ${token}`,
                  }
                : {}),
        };
    };

    // =========================================================
    // LOAD NOTIFICATIONS
    // =========================================================

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError(
                    "Your session has expired. Please login again."
                );
                setLoading(false);
                return;
            }

            const response = await fetch(
                API_BASE_URL,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );

            if (response.status === 401 || response.status === 403) {
                setError(
                    "Your session has expired. Please login again."
                );
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Failed to load notifications."
                );
            }

            const data = await response.json();

            const formattedNotifications = Array.isArray(data)
                ? data.map((notification) => ({
                      id: notification.id,
                      type:
                          notification.type ||
                          "system",
                      icon: getNotificationIcon(
                          notification.type
                      ),
                      title:
                          notification.title ||
                          "Notification",
                      message:
                          notification.message ||
                          "",
                      referenceId:
                          notification.referenceId,
                      createdAt:
                          notification.createdAt,
                      unread:
                          notification.read === false,
                  }))
                : [];

            setNotifications(
                formattedNotifications
            );
        } catch (err) {
            console.error(
                "Notification loading error:",
                err
            );

            setError(
                err.message ||
                    "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD ON PAGE OPEN
    // =========================================================

    useEffect(() => {
        loadNotifications();
    }, []);

    // =========================================================
    // NOTIFICATION ICON
    // =========================================================

    const getNotificationIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "job":
            case "booking":
                return "📋";

            case "issue":
                return "⚠️";

            case "service":
            case "progress":
                return "🔧";

            case "completed":
                return "✓";

            case "attendance":
                return "◷";

            case "ai":
            case "inspection":
            case "system":
                return "✦";

            default:
                return "🔔";
        }
    };

    // =========================================================
    // TYPE CLASS
    // =========================================================

    const getTypeClass = (type) => {
        switch (type?.toLowerCase()) {
            case "job":
            case "booking":
                return "notification-type-job";

            case "issue":
                return "notification-type-issue";

            case "service":
            case "progress":
                return "notification-type-service";

            case "completed":
                return "notification-type-completed";

            case "attendance":
                return "notification-type-attendance";

            case "ai":
            case "inspection":
            case "system":
                return "notification-type-system";

            default:
                return "notification-type-system";
        }
    };

    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatNotificationTime = (createdAt) => {
        if (!createdAt) {
            return "";
        }

        const notificationDate =
            new Date(createdAt);

        if (
            Number.isNaN(
                notificationDate.getTime()
            )
        ) {
            return createdAt;
        }

        const now = new Date();

        const difference =
            now.getTime() -
            notificationDate.getTime();

        const seconds = Math.floor(
            difference / 1000
        );

        if (seconds < 60) {
            return "Just now";
        }

        const minutes = Math.floor(
            seconds / 60
        );

        if (minutes < 60) {
            return `${minutes} ${
                minutes === 1
                    ? "minute"
                    : "minutes"
            } ago`;
        }

        const hours = Math.floor(
            minutes / 60
        );

        if (hours < 24) {
            return `${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            } ago`;
        }

        const days = Math.floor(
            hours / 24
        );

        if (days < 7) {
            return `${days} ${
                days === 1
                    ? "day"
                    : "days"
            } ago`;
        }

        return notificationDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =========================================================
    // FILTERED NOTIFICATIONS
    // =========================================================

    const filteredNotifications =
        activeFilter === "all"
            ? notifications
            : activeFilter === "unread"
            ? notifications.filter(
                  (notification) =>
                      notification.unread
              )
            : notifications.filter(
                  (notification) =>
                      notification.type?.toLowerCase() ===
                          activeFilter ||
                      (
                          activeFilter === "job" &&
                          notification.type?.toLowerCase() ===
                              "booking"
                      ) ||
                      (
                          activeFilter === "service" &&
                          notification.type?.toLowerCase() ===
                              "progress"
                      )
              );

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    const unreadCount =
        notifications.filter(
            (notification) =>
                notification.unread
        ).length;

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    const markAsRead = async (id) => {
        try {
            setActionLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/${id}/read`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                }
            );

            if (response.status === 401 || response.status === 403) {
                setError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to mark notification as read."
                );
            }

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id
                        ? {
                              ...notification,
                              unread: false,
                          }
                        : notification
                )
            );
        } catch (err) {
            console.error(
                "Mark notification read error:",
                err
            );

            setError(
                err.message ||
                    "Unable to update notification."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    const markAllAsRead = async () => {
        try {
            setActionLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/read-all`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                }
            );

            if (response.status === 401 || response.status === 403) {
                setError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to mark all notifications as read."
                );
            }

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    unread: false,
                }))
            );
        } catch (err) {
            console.error(
                "Mark all notifications error:",
                err
            );

            setError(
                err.message ||
                    "Unable to update notifications."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // DELETE ONE NOTIFICATION
    // =========================================================

    const deleteNotification = async (id) => {
        try {
            setActionLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/${id}`,
                {
                    method: "DELETE",
                    headers: getHeaders(),
                }
            );

            if (response.status === 401 || response.status === 403) {
                setError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to delete notification."
                );
            }

            setNotifications((prev) =>
                prev.filter(
                    (notification) =>
                        notification.id !== id
                )
            );
        } catch (err) {
            console.error(
                "Delete notification error:",
                err
            );

            setError(
                err.message ||
                    "Unable to delete notification."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // CLEAR ALL
    // =========================================================

    const clearAllNotifications = async () => {
        if (
            !window.confirm(
                "Are you sure you want to clear all notifications?"
            )
        ) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            /*
             * Current backend does not have a
             * DELETE /api/notifications/clear-all
             * endpoint.
             *
             * Therefore we delete notifications
             * one by one using the existing DELETE API.
             */

            const notificationIds =
                notifications.map(
                    (notification) =>
                        notification.id
                );

            for (const id of notificationIds) {
                const response = await fetch(
                    `${API_BASE_URL}/${id}`,
                    {
                        method: "DELETE",
                        headers: getHeaders(),
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to clear all notifications."
                    );
                }
            }

            setNotifications([]);
        } catch (err) {
            console.error(
                "Clear all notifications error:",
                err
            );

            setError(
                err.message ||
                    "Unable to clear all notifications."
            );

            // Reload actual DB state
            await loadNotifications();
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="worker-notifications-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="worker-notifications-header">

                <div>

                    <span className="notifications-small-title">
                        WORKER PORTAL
                    </span>

                    <div className="notifications-title-row">

                        <h1>
                            Notifications
                        </h1>

                        {unreadCount > 0 && (
                            <span className="notifications-count-badge">
                                {unreadCount} New
                            </span>
                        )}

                    </div>

                    <p>
                        Stay updated with your jobs,
                        services and AutoGlow activities.
                    </p>

                </div>

                <button
                    className="notifications-dashboard-btn"
                    onClick={() =>
                        navigate(
                            "/worker/dashboard"
                        )
                    }
                >
                    ← Dashboard
                </button>

            </div>

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
                <div className="notification-error">
                    <span>⚠️</span>

                    <div>
                        <strong>
                            Notification Error
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                    <button
                        onClick={loadNotifications}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* =================================================
                NOTIFICATION SUMMARY
            ================================================= */}

            <div className="notification-summary">

                <div className="summary-card">

                    <div className="summary-icon blue">
                        🔔
                    </div>

                    <div>

                        <span>
                            Total Notifications
                        </span>

                        <strong>
                            {notifications.length}
                        </strong>

                    </div>

                </div>

                <div className="summary-card">

                    <div className="summary-icon orange">
                        ●
                    </div>

                    <div>

                        <span>
                            Unread
                        </span>

                        <strong>
                            {unreadCount}
                        </strong>

                    </div>

                </div>

                <div className="summary-card">

                    <div className="summary-icon green">
                        ✓
                    </div>

                    <div>

                        <span>
                            Read
                        </span>

                        <strong>
                            {notifications.length -
                                unreadCount}
                        </strong>

                    </div>

                </div>

            </div>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="notifications-toolbar">

                <div className="notification-filters">

                    <button
                        className={
                            activeFilter === "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveFilter("all")
                        }
                    >
                        All
                    </button>

                    <button
                        className={
                            activeFilter === "unread"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveFilter("unread")
                        }
                    >
                        Unread
                    </button>

                    <button
                        className={
                            activeFilter === "job"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveFilter("job")
                        }
                    >
                        Jobs
                    </button>

                    <button
                        className={
                            activeFilter === "issue"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveFilter("issue")
                        }
                    >
                        Issues
                    </button>

                    <button
                        className={
                            activeFilter === "service"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveFilter("service")
                        }
                    >
                        Services
                    </button>

                </div>

                <div className="notification-actions">

                    {unreadCount > 0 && (
                        <button
                            className="mark-all-btn"
                            onClick={markAllAsRead}
                            disabled={
                                actionLoading
                            }
                        >
                            ✓ Mark all as read
                        </button>
                    )}

                    {notifications.length > 0 && (
                        <button
                            className="clear-all-btn"
                            onClick={
                                clearAllNotifications
                            }
                            disabled={
                                actionLoading
                            }
                        >
                            Clear all
                        </button>
                    )}

                    <button
                        className="refresh-notifications-btn"
                        onClick={
                            loadNotifications
                        }
                        disabled={
                            loading ||
                            actionLoading
                        }
                        title="Refresh notifications"
                    >
                        ↻
                    </button>

                </div>

            </div>

            {/* =================================================
                NOTIFICATIONS LIST
            ================================================= */}

            <div className="notifications-list">

                {/* LOADING */}

                {loading ? (

                    <div className="notifications-loading">

                        <div className="notification-loader"></div>

                        <h3>
                            Loading notifications...
                        </h3>

                        <p>
                            Fetching your latest
                            AutoGlow updates.
                        </p>

                    </div>

                ) : filteredNotifications.length === 0 ? (

                    /* EMPTY */

                    <div className="notifications-empty">

                        <div className="empty-notification-icon">
                            🔔
                        </div>

                        <h2>
                            No notifications
                        </h2>

                        <p>
                            You're all caught up.
                            New updates will appear
                            here.
                        </p>

                        {activeFilter !== "all" && (
                            <button
                                onClick={() =>
                                    setActiveFilter(
                                        "all"
                                    )
                                }
                            >
                                View All Notifications
                            </button>
                        )}

                    </div>

                ) : (

                    /* LIST */

                    filteredNotifications.map(
                        (notification) => (

                            <div
                                key={
                                    notification.id
                                }
                                className={`notification-card ${
                                    notification.unread
                                        ? "unread"
                                        : ""
                                }`}
                            >

                                {/* UNREAD INDICATOR */}

                                {notification.unread && (
                                    <span className="unread-indicator"></span>
                                )}

                                {/* ICON */}

                                <div
                                    className={`notification-main-icon ${getTypeClass(
                                        notification.type
                                    )}`}
                                >
                                    {
                                        notification.icon
                                    }
                                </div>

                                {/* CONTENT */}

                                <div className="notification-content">

                                    <div className="notification-content-top">

                                        <div>

                                            <h3>
                                                {
                                                    notification.title
                                                }
                                            </h3>

                                            <span className="notification-time">
                                                {formatNotificationTime(
                                                    notification.createdAt
                                                )}
                                            </span>

                                        </div>

                                        {notification.unread && (
                                            <span className="new-label">
                                                NEW
                                            </span>
                                        )}

                                    </div>

                                    <p>
                                        {
                                            notification.message
                                        }
                                    </p>

                                    {/* REFERENCE */}

                                    {notification.referenceId && (
                                        <div className="notification-vehicle">

                                            <span>
                                                🔗
                                            </span>

                                            <strong>
                                                Reference:
                                            </strong>

                                            <span>
                                                #
                                                {
                                                    notification.referenceId
                                                }
                                            </span>

                                        </div>
                                    )}

                                    {/* ACTIONS */}

                                    <div className="notification-card-actions">

                                        {notification.unread && (
                                            <button
                                                onClick={() =>
                                                    markAsRead(
                                                        notification.id
                                                    )
                                                }
                                                disabled={
                                                    actionLoading
                                                }
                                            >
                                                ✓ Mark as read
                                            </button>
                                        )}

                                        <button
                                            className="delete-notification-btn"
                                            onClick={() =>
                                                deleteNotification(
                                                    notification.id
                                                )
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    )

                )}

            </div>

        </div>
    );
};

export default WorkerNotifications;