import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error("Notification loading error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const getIcon = (type) => {
    switch (type) {
      case "BOOKING":
        return "📅";

      case "PAYMENT":
        return "💳";

      case "SERVICE":
        return "🚗";

      case "ASSIGNMENT":
        return "👨‍🔧";

      case "REVIEW":
        return "⭐";

      default:
        return "🔔";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div>
          <p className="notifications-label">AUTO GLOW</p>

          <h1>Notifications</h1>

          <p className="notifications-subtitle">
            Stay updated with your bookings, services and payments.
          </p>
        </div>

        <div className="notification-header-actions">
          <div className="notification-count">
            <span>{unreadCount}</span>
            <small>Unread</small>
          </div>

          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              ✓ Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && <div className="notification-error">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="notification-loading">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="notification-empty">
          <div className="empty-icon">🔔</div>

          <h2>No notifications yet</h2>

          <p>
            When there is an update about your booking, payment or service, it
            will appear here.
          </p>
        </div>
      ) : (
        /* Notification List */
        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.read ? "read" : "unread"
              }`}
            >
              <div className="notification-icon">
                {getIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-top">
                  <div>
                    <h3>{notification.title}</h3>

                    {!notification.read && (
                      <span className="new-badge">NEW</span>
                    )}
                  </div>

                  <span className="notification-type">
                    {notification.type || "SYSTEM"}
                  </span>
                </div>

                <p className="notification-message">{notification.message}</p>

                <div className="notification-bottom">
                  <span className="notification-date">
                    🕒 {formatDate(notification.createdAt)}
                  </span>

                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        className="read-btn"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
