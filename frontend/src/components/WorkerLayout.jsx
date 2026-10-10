import React, { useState } from "react";

import WorkerSidebar from "./WorkerSidebar";
import WorkerHeader from "./WorkerHeader";

import "./WorkerLayout.css";

const WorkerLayout = ({ children }) => {

  // =========================================================
  // SIDEBAR STATE
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =========================================================
  // TOGGLE SIDEBAR
  // =========================================================

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // =========================================================
  // CLOSE SIDEBAR
  // =========================================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // =========================================================
  // LAYOUT
  // =========================================================

  return (
    <div
      className={`worker-layout ${
        sidebarOpen
          ? "sidebar-open"
          : "sidebar-closed"
      }`}
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <WorkerSidebar
        sidebarOpen={sidebarOpen}
        onClose={closeSidebar}
      />


      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="worker-layout-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <WorkerHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />


        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="worker-layout-content">
          {children}
        </main>

      </div>

    </div>
  );
};

export default WorkerLayout;