import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

import "./AdminLayout.css";

function AdminLayout() {

  // =========================================
  // SIDEBAR STATE
  // =========================================

  const [sidebarOpen, setSidebarOpen] = useState(true);


  // =========================================
  // TOGGLE SIDEBAR
  // Header button
  // =========================================

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };


  // =========================================
  // CLOSE SIDEBAR
  // Sidebar X button / overlay
  // =========================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };


  return (
    <div
      className={`admin-layout ${
        sidebarOpen
          ? "sidebar-open"
          : "sidebar-closed"
      }`}
    >

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <AdminSidebar
        sidebarOpen={sidebarOpen}
        onClose={closeSidebar}
      />


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <div className="admin-layout-content">

        <AdminHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        <main className="admin-page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;