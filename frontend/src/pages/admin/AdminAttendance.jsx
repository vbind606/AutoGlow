import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./AdminAttendance.css";

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/attendance");

      const data = Array.isArray(response.data) ? response.data : [];

      setAttendance(data);
    } catch (err) {
      console.error("Admin attendance error:", err);
      console.error("Response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load attendance records.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "--";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "--";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (dateTime) => {
    if (!dateTime) return "--";

    const parsedDate = new Date(dateTime);

    if (Number.isNaN(parsedDate.getTime())) {
      return "--";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =========================================================
  // FORMAT WORKING HOURS
  // =========================================================

  const formatWorkingHours = (minutes) => {
    if (
      minutes === null ||
      minutes === undefined ||
      Number.isNaN(Number(minutes)) ||
      Number(minutes) < 0
    ) {
      return "--";
    }

    const totalMinutes = Number(minutes);

    if (totalMinutes === 0) {
      return "0m";
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
  };

  // =========================================================
  // FILTER ATTENDANCE
  // =========================================================

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const workerName = String(record.workerName || "").toLowerCase();

      const workerEmail = String(record.workerEmail || "").toLowerCase();

      const workerId = String(record.workerId || "").toLowerCase();

      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        workerName.includes(searchValue) ||
        workerEmail.includes(searchValue) ||
        workerId.includes(searchValue);

      const matchesDate =
        !dateFilter || String(record.attendanceDate) === dateFilter;

      return matchesSearch && matchesDate;
    });
  }, [attendance, search, dateFilter]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalRecords = filteredAttendance.length;

  const presentCount = filteredAttendance.filter(
    (record) => String(record.status || "").toUpperCase() === "PRESENT",
  ).length;

  const absentCount = filteredAttendance.filter(
    (record) => String(record.status || "").toUpperCase() === "ABSENT",
  ).length;

  const halfDayCount = filteredAttendance.filter(
    (record) => String(record.status || "").toUpperCase() === "HALF_DAY",
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-attendance-page">
        <div className="admin-attendance-loading">
          <div className="admin-attendance-spinner"></div>
          <h3>Loading Attendance...</h3>
          <p>Please wait while attendance records are loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-attendance-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="admin-attendance-header">
        <div>
          <span className="admin-attendance-eyebrow">ADMIN PANEL</span>

          <h1>Worker Attendance</h1>

          <p>
            Monitor worker attendance, working hours, check-in and check-out
            records.
          </p>
        </div>

        <button className="attendance-refresh-btn" onClick={loadAttendance}>
          ↻ Refresh
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-attendance-alert">
          <strong>Unable to load attendance</strong>
          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="admin-attendance-summary">
        <div className="admin-attendance-summary-card">
          <div className="summary-card-icon">📋</div>

          <div>
            <span>Total Records</span>
            <strong>{totalRecords}</strong>
          </div>
        </div>

        <div className="admin-attendance-summary-card present">
          <div className="summary-card-icon">✓</div>

          <div>
            <span>Present</span>
            <strong>{presentCount}</strong>
          </div>
        </div>

        <div className="admin-attendance-summary-card absent">
          <div className="summary-card-icon">✕</div>

          <div>
            <span>Absent</span>
            <strong>{absentCount}</strong>
          </div>
        </div>

        <div className="admin-attendance-summary-card half-day">
          <div className="summary-card-icon">◐</div>

          <div>
            <span>Half Day</span>
            <strong>{halfDayCount}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="admin-attendance-filter-card">
        <div className="attendance-filter-field">
          <label>Search Worker</label>

          <div className="attendance-search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by name, email or worker ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="attendance-filter-field">
          <label>Attendance Date</label>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {(search || dateFilter) && (
          <button
            className="clear-filter-btn"
            onClick={() => {
              setSearch("");
              setDateFilter("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="admin-attendance-table-card">
        <div className="admin-attendance-table-header">
          <div>
            <h2>Attendance Records</h2>

            <p>
              {filteredAttendance.length} record
              {filteredAttendance.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {filteredAttendance.length === 0 ? (
          <div className="admin-attendance-empty">
            <div className="empty-attendance-icon">📅</div>

            <h3>No Attendance Records</h3>

            <p>No attendance records match your current filters.</p>
          </div>
        ) : (
          <div className="admin-attendance-table-wrapper">
            <table className="admin-attendance-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.map((record) => {
                  const status = String(record.status || "").toUpperCase();

                  return (
                    <tr key={record.id}>
                      {/* WORKER */}

                      <td>
                        <div className="worker-info">
                          <div className="worker-avatar">
                            {String(record.workerName || "W")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {record.workerName || "Unknown Worker"}
                            </strong>

                            <span>ID: {record.workerId || "--"}</span>
                          </div>
                        </div>
                      </td>

                      {/* DATE */}

                      <td>
                        <span className="attendance-date-value">
                          {formatDate(record.attendanceDate)}
                        </span>
                      </td>

                      {/* CHECK IN */}

                      <td>
                        <span className="time-value check-in-time">
                          {formatTime(record.checkIn)}
                        </span>
                      </td>

                      {/* CHECK OUT */}

                      <td>
                        <span className="time-value check-out-time">
                          {formatTime(record.checkOut)}
                        </span>
                      </td>

                      {/* WORKING HOURS */}

                      <td>
                        <span className="working-hours-value">
                          {formatWorkingHours(record.workingMinutes)}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`attendance-status-badge ${status.toLowerCase()}`}
                        >
                          {record.status || "NOT MARKED"}
                        </span>
                      </td>

                      {/* REMARKS */}

                      <td>
                        <span className="attendance-remarks">
                          {record.remarks || "--"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
