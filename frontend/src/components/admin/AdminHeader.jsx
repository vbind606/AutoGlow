import "./AdminHeader.css";

function AdminHeader({ sidebarOpen, toggleSidebar }) {

  return (
    <header className="admin-header">

      {/* ================= LEFT ================= */}

      <div className="admin-header-left">

        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label={
            sidebarOpen
              ? "Close sidebar"
              : "Open sidebar"
          }
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>


        <div className="admin-header-title">
          <h2>Admin Dashboard</h2>
          <p>Manage your AutoGlow system</p>
        </div>

      </div>


      {/* ================= RIGHT ================= */}

      <div className="admin-header-right">

        <button className="admin-notification-btn">
          🔔
        </button>

        <div className="admin-profile">

          <div className="admin-profile-avatar">
            A
          </div>

          <div className="admin-profile-info">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>

        </div>

      </div>

    </header>
  );
}

export default AdminHeader;