import { useState } from "react";
import api from "../../services/api";
import "./Settings.css";

function Settings() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  const changePassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!passwords.currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (!passwords.newPassword) {
      setError("Enter a new password.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/customer/profile/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setMessage(response.data || "Password changed successfully.");

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to change password.",
      );
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("autoglow_token");
    localStorage.removeItem("autoglow_role");

    window.location.href = "/login";
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <span>ACCOUNT SETTINGS</span>
        <h1>Settings</h1>
        <p>Manage your account security and preferences.</p>
      </div>

      <div className="settings-container">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🔐</div>

            <div>
              <h2>Change Password</h2>
              <p>Keep your AutoGlow account secure.</p>
            </div>
          </div>

          {message && <div className="settings-success">✓ {message}</div>}

          {error && <div className="settings-error">{error}</div>}

          <form onSubmit={changePassword}>
            <div className="settings-field">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
            </div>

            <div className="settings-field">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="settings-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
            </div>

            <button className="password-button" type="submit" disabled={saving}>
              {saving ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        <div className="settings-card danger-card">
          <div className="settings-card-header">
            <div className="settings-icon">🚪</div>

            <div>
              <h2>Account</h2>
              <p>Sign out from your AutoGlow account.</p>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
