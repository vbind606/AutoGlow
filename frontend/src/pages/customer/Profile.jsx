import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/customer/profile");

      setProfile({
        name: response.data.name || "",
        email: response.data.email || "",
        role: response.data.role || "CUSTOMER",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!profile.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!profile.email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/customer/profile", {
        name: profile.name,
        email: profile.email,
      });

      setProfile({
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <span className="profile-label">ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Manage your AutoGlow account information.</p>
        </div>

        <div className="profile-avatar">
          {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
        </div>
      </div>

      <div className="profile-card">
        <div className="card-title">
          <h2>Personal Information</h2>
          <p>Update your basic account details.</p>
        </div>

        {message && <div className="profile-success">✓ {message}</div>}

        {error && <div className="profile-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="profile-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="profile-field">
              <label>Account Role</label>
              <input type="text" value={profile.role} disabled />
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
