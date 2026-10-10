import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminSettings.css";

const defaultSettings = {
  id: null,

  businessName: "AutoGlow",
  businessEmail: "",
  businessPhone: "",
  businessAddress: "",
  currency: "INR",
  timezone: "Asia/Kolkata",

  allowOnlineBooking: true,
  autoConfirmBooking: false,
  allowPickupDrop: true,
  advanceBookingDays: 30,
  cancellationHours: 4,

  emailNotifications: true,
  bookingNotifications: true,
  paymentNotifications: true,
  reviewNotifications: true,
  systemNotifications: true,

  twoFactorAuth: false,
  loginAlerts: true,
  sessionTimeout: 30,
};

const tabs = [
  {
    id: "general",
    label: "General",
    icon: "⚙️",
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: "🗓️",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "🔔",
  },
  {
    id: "security",
    label: "Security",
    icon: "🔐",
  },
  {
    id: "system",
    label: "System",
    icon: "🖥️",
  },
];

function AdminSettings() {
  const [settings, setSettings] = useState(defaultSettings);

  const [activeTab, setActiveTab] = useState("general");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     LOAD SETTINGS
     ===================================================== */

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/settings");

      if (response.data) {
        setSettings({
          ...defaultSettings,
          ...response.data,
        });
      }
    } catch (err) {
      console.error("Failed to load admin settings:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load admin settings. Please check your backend connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INPUT CHANGE
     ===================================================== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccess("");
    setError("");
  };

  /* =====================================================
     SAVE SETTINGS
     ===================================================== */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...settings,

        advanceBookingDays: Number(settings.advanceBookingDays),
        cancellationHours: Number(settings.cancellationHours),
        sessionTimeout: Number(settings.sessionTimeout),
      };

      const response = await api.put("/admin/settings", payload);

      if (response.data) {
        setSettings({
          ...defaultSettings,
          ...response.data,
        });
      }

      setSuccess("Settings have been saved successfully.");
    } catch (err) {
      console.error("Failed to save settings:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save settings. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     RESET SETTINGS
     ===================================================== */

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all admin settings to default values?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setResetting(true);
      setError("");
      setSuccess("");

      const response = await api.post("/admin/settings/reset");

      if (response.data) {
        setSettings({
          ...defaultSettings,
          ...response.data,
        });
      } else {
        setSettings(defaultSettings);
      }

      setSuccess("Settings have been reset to their default values.");
    } catch (err) {
      console.error("Failed to reset settings:", err);

      setError(
        err.response?.data?.message ||
          "Unable to reset settings. Please try again.",
      );
    } finally {
      setResetting(false);
    }
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="admin-settings-page">
        <div className="settings-loading">
          <div className="settings-spinner"></div>

          <h3>Loading Admin Settings</h3>

          <p>Fetching your AutoGlow configuration from the server...</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     TAB CONTENT
     ===================================================== */

  const renderGeneralTab = () => (
    <section className="settings-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">BUSINESS PROFILE</span>

          <h2>General Settings</h2>

          <p>
            Manage your AutoGlow business information and regional preferences.
          </p>
        </div>

        <div className="section-heading-icon">⚙️</div>
      </div>

      <div className="settings-grid">
        <div className="settings-field">
          <label>Business Name</label>

          <input
            type="text"
            name="businessName"
            value={settings.businessName}
            onChange={handleChange}
            placeholder="AutoGlow"
          />
        </div>

        <div className="settings-field">
          <label>Business Email</label>

          <input
            type="email"
            name="businessEmail"
            value={settings.businessEmail}
            onChange={handleChange}
            placeholder="admin@autoglow.com"
          />
        </div>

        <div className="settings-field">
          <label>Business Phone</label>

          <input
            type="tel"
            name="businessPhone"
            value={settings.businessPhone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="settings-field">
          <label>Currency</label>

          <select
            name="currency"
            value={settings.currency}
            onChange={handleChange}
          >
            <option value="INR">INR — Indian Rupee</option>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
        </div>

        <div className="settings-field full-width">
          <label>Business Address</label>

          <textarea
            name="businessAddress"
            value={settings.businessAddress}
            onChange={handleChange}
            placeholder="Enter your AutoGlow service center address..."
          />
        </div>

        <div className="settings-field">
          <label>Timezone</label>

          <select
            name="timezone"
            value={settings.timezone}
            onChange={handleChange}
          >
            <option value="Asia/Kolkata">Asia/Kolkata — IST</option>

            <option value="Asia/Dubai">Asia/Dubai — GST</option>

            <option value="Europe/London">Europe/London</option>

            <option value="America/New_York">America/New_York</option>
          </select>
        </div>
      </div>
    </section>
  );

  const renderBookingsTab = () => (
    <section className="settings-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">BOOKING CONFIGURATION</span>

          <h2>Booking Settings</h2>

          <p>Control how customers can create and manage service bookings.</p>
        </div>

        <div className="section-heading-icon">🗓️</div>
      </div>

      <div className="settings-options">
        <label className="setting-option">
          <div className="option-content">
            <strong>Allow Online Booking</strong>

            <span>
              Allow customers to book vehicle services directly from the
              website.
            </span>
          </div>

          <input
            type="checkbox"
            name="allowOnlineBooking"
            checked={settings.allowOnlineBooking}
            onChange={handleChange}
          />
        </label>

        <label className="setting-option">
          <div className="option-content">
            <strong>Auto Confirm Booking</strong>

            <span>
              Automatically confirm new bookings without manual admin approval.
            </span>
          </div>

          <input
            type="checkbox"
            name="autoConfirmBooking"
            checked={settings.autoConfirmBooking}
            onChange={handleChange}
          />
        </label>

        <label className="setting-option">
          <div className="option-content">
            <strong>Pickup &amp; Drop Service</strong>

            <span>Allow customers to request vehicle pickup and delivery.</span>
          </div>

          <input
            type="checkbox"
            name="allowPickupDrop"
            checked={settings.allowPickupDrop}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="booking-fields">
        <div className="settings-grid">
          <div className="settings-field">
            <label>Advance Booking Days</label>

            <input
              type="number"
              min="1"
              max="365"
              name="advanceBookingDays"
              value={settings.advanceBookingDays}
              onChange={handleChange}
            />

            <small>
              Maximum number of days a customer can book in advance.
            </small>
          </div>

          <div className="settings-field">
            <label>Cancellation Window</label>

            <input
              type="number"
              min="0"
              max="168"
              name="cancellationHours"
              value={settings.cancellationHours}
              onChange={handleChange}
            />

            <small>
              Customers can cancel before this many hours of the booking.
            </small>
          </div>
        </div>
      </div>
    </section>
  );

  const renderNotificationsTab = () => (
    <section className="settings-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">COMMUNICATION CENTER</span>

          <h2>Notification Settings</h2>

          <p>Choose which AutoGlow events should trigger notifications.</p>
        </div>

        <div className="section-heading-icon">🔔</div>
      </div>

      <div className="settings-options">
        <label className="setting-option">
          <div className="option-content">
            <strong>Email Notifications</strong>

            <span>Enable system-generated email notifications.</span>
          </div>

          <input
            type="checkbox"
            name="emailNotifications"
            checked={settings.emailNotifications}
            onChange={handleChange}
          />
        </label>

        <label className="setting-option">
          <div className="option-content">
            <strong>Booking Notifications</strong>

            <span>Notify administrators about new and updated bookings.</span>
          </div>

          <input
            type="checkbox"
            name="bookingNotifications"
            checked={settings.bookingNotifications}
            onChange={handleChange}
          />
        </label>

        <label className="setting-option">
          <div className="option-content">
            <strong>Payment Notifications</strong>

            <span>
              Receive notifications for successful, pending and failed payments.
            </span>
          </div>

          <input
            type="checkbox"
            name="paymentNotifications"
            checked={settings.paymentNotifications}
            onChange={handleChange}
          />
        </label>

        <label className="setting-option">
          <div className="option-content">
            <strong>Review Notifications</strong>

            <span>
              Notify administrators whenever a customer submits a review.
            </span>
          </div>

          <input
            type="checkbox"
            name="reviewNotifications"
            checked={settings.reviewNotifications}
            onChange={handleChange}
          />
        </label>

        <label className="setting-option">
          <div className="option-content">
            <strong>System Notifications</strong>

            <span>Receive important system and administration alerts.</span>
          </div>

          <input
            type="checkbox"
            name="systemNotifications"
            checked={settings.systemNotifications}
            onChange={handleChange}
          />
        </label>
      </div>
    </section>
  );

  const renderSecurityTab = () => (
    <section className="settings-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">ACCESS &amp; SECURITY</span>

          <h2>Security Settings</h2>

          <p>Configure administrator authentication and session security.</p>
        </div>

        <div className="section-heading-icon">🔐</div>
      </div>

      <div className="settings-options">
        <label className="setting-option">
          <div className="option-content">
            <strong>Two-Factor Authentication</strong>

            <span>
              Add an additional authentication layer to admin accounts.
            </span>
          </div>

          <input
            type="checkbox"
            name="twoFactorAuth"
            checked={settings.twoFactorAuth}
            onChange={handleChange}
          />
        </label>

        <label className="setting-option">
          <div className="option-content">
            <strong>Admin Login Alerts</strong>

            <span>Notify administrators when a new login is detected.</span>
          </div>

          <input
            type="checkbox"
            name="loginAlerts"
            checked={settings.loginAlerts}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="security-fields">
        <div className="settings-grid">
          <div className="settings-field">
            <label>Session Timeout</label>

            <input
              type="number"
              min="1"
              max="1440"
              name="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={handleChange}
            />

            <small>Session timeout in minutes.</small>
          </div>
        </div>
      </div>

      <div className="security-notice">
        <div className="security-notice-icon">🛡️</div>

        <div>
          <strong>Administrator Protection</strong>

          <p>
            AutoGlow admin APIs are protected using role-based authorization.
            Only authenticated administrators can access these settings.
          </p>
        </div>
      </div>
    </section>
  );

  const renderSystemTab = () => (
    <section className="settings-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">SYSTEM INFORMATION</span>

          <h2>System Settings</h2>

          <p>Basic information about the AutoGlow administration system.</p>
        </div>

        <div className="section-heading-icon">🖥️</div>
      </div>

      <div className="system-info-grid">
        <div className="system-info-card">
          <div className="system-info-icon">🚗</div>

          <div>
            <small>APPLICATION</small>

            <strong>AutoGlow</strong>

            <p>AI Powered Car &amp; Bike Care Management System</p>
          </div>
        </div>

        <div className="system-info-card">
          <div className="system-info-icon">🗄️</div>

          <div>
            <small>DATABASE</small>

            <strong>PostgreSQL</strong>

            <p>Persistent application data storage</p>
          </div>
        </div>

        <div className="system-info-card">
          <div className="system-info-icon">⚡</div>

          <div>
            <small>BACKEND</small>

            <strong>Spring Boot</strong>

            <p>REST API and business logic</p>
          </div>
        </div>

        <div className="system-info-card">
          <div className="system-info-icon">⚛️</div>

          <div>
            <small>FRONTEND</small>

            <strong>React</strong>

            <p>Admin dashboard interface</p>
          </div>
        </div>
      </div>

      <div className="system-persistence">
        <div className="system-persistence-icon">ℹ️</div>

        <div>
          <strong>Settings Persistence</strong>

          <p>
            Your configurable settings are stored in the PostgreSQL{" "}
            <code>admin_settings</code> table.
          </p>
        </div>
      </div>
    </section>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "bookings":
        return renderBookingsTab();

      case "notifications":
        return renderNotificationsTab();

      case "security":
        return renderSecurityTab();

      case "system":
        return renderSystemTab();

      case "general":
      default:
        return renderGeneralTab();
    }
  };

  /* =====================================================
     MAIN UI
     ===================================================== */

  return (
    <div className="admin-settings-page">
      {/* =================================================
          PAGE HEADER
         ================================================= */}

      <div className="settings-header">
        <div>
          <span className="settings-badge">ADMIN CONTROL CENTER</span>

          <h1>Admin Settings</h1>

          <p>
            Configure AutoGlow business, booking, notification and security
            preferences.
          </p>
        </div>

        <div className="settings-header-status">
          <span className="status-dot"></span>

          <span>Settings Connected</span>
        </div>
      </div>

      {/* =================================================
          ALERTS
         ================================================= */}

      {success && (
        <div className="settings-alert settings-alert-success">
          <span className="alert-icon">✓</span>

          <div>
            <strong>Success</strong>

            <p>{success}</p>
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Close success message"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="settings-alert settings-alert-error">
          <span className="alert-icon">!</span>

          <div>
            <strong>Something went wrong</strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          MAIN SETTINGS LAYOUT
         ================================================= */}

      <div className="settings-layout">
        {/* =================================================
            SIDEBAR
           ================================================= */}

        <aside className="settings-sidebar">
          <div className="sidebar-title">
            <span>SETTINGS</span>

            <strong>Configuration</strong>
          </div>

          <nav>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`settings-tab ${
                  activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSuccess("");
                  setError("");
                }}
              >
                <span className="tab-icon">{tab.icon}</span>

                <span>{tab.label}</span>

                {activeTab === tab.id && <span className="tab-arrow">›</span>}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-footer-icon">🔒</div>

            <div>
              <strong>Admin Only</strong>

              <p>These settings are protected by admin authorization.</p>
            </div>
          </div>
        </aside>

        {/* =================================================
            CONTENT
           ================================================= */}

        <main className="settings-content">{renderActiveTab()}</main>
      </div>

      {/* =================================================
          ACTION BAR
         ================================================= */}

      <div className="settings-action-bar">
        <div className="action-info">
          <span className="action-dot"></span>

          <span>Changes will be saved to PostgreSQL.</span>
        </div>

        <div className="action-buttons">
          <button
            type="button"
            className="reset-button"
            onClick={handleReset}
            disabled={saving || resetting}
          >
            {resetting ? (
              <>
                <span className="button-spinner"></span>
                Resetting...
              </>
            ) : (
              <>↻ Reset</>
            )}
          </button>

          <button
            type="button"
            className="save-button"
            onClick={handleSave}
            disabled={saving || resetting}
          >
            {saving ? (
              <>
                <span className="button-spinner"></span>
                Saving...
              </>
            ) : (
              <>✓ Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
