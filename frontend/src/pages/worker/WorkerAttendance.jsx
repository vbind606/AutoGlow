import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./WorkerAttendance.css";

const WorkerAttendance = () => {
  const [workerId, setWorkerId] = useState(null);

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // GET VALID WORKER ID
  // =========================================================

  const getValidWorkerId = () => {
    const possibleIds = [
      localStorage.getItem("workerId"),
      localStorage.getItem("autoglow_user_id"),
      localStorage.getItem("userId"),
    ];

    console.log("====================================");
    console.log("WORKER ID CHECK");
    console.log("workerId:", possibleIds[0]);
    console.log("autoglow_user_id:", possibleIds[1]);
    console.log("userId:", possibleIds[2]);
    console.log("====================================");

    for (const id of possibleIds) {
      if (
        id !== null &&
        id !== undefined &&
        String(id).trim() !== "" &&
        String(id) !== "null" &&
        String(id) !== "undefined" &&
        /^\d+$/.test(String(id).trim())
      ) {
        return String(id).trim();
      }
    }

    return null;
  };

  // =========================================================
  // PAGE LOAD
  // =========================================================

  useEffect(() => {
    const id = getValidWorkerId();

    console.log("Final Worker ID:", id);

    if (id) {
      setWorkerId(id);
    } else {
      setError("Valid Worker ID not found. Please logout and login again.");
      setLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD DATA WHEN WORKER ID IS READY
  // =========================================================

  useEffect(() => {
    if (!workerId) {
      return;
    }

    loadAttendanceData();
  }, [workerId]);

  // =========================================================
  // LOAD ATTENDANCE DATA
  // =========================================================

  const loadAttendanceData = async () => {
    const currentWorkerId = getValidWorkerId();

    if (!currentWorkerId) {
      setError("Valid Worker ID not found. Please logout and login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Loading attendance for Worker ID:", currentWorkerId);

      const [todayResponse, monthResponse, historyResponse] = await Promise.all(
        [
          api.get(`/worker/attendance/today/${currentWorkerId}`),

          api.get(`/worker/attendance/month/${currentWorkerId}`),

          api.get(`/worker/attendance/worker/${currentWorkerId}`),
        ],
      );

      // =====================================================
      // TODAY
      // =====================================================

      const todayData = todayResponse.data;

      console.log("Today's Attendance:", todayData);

      if (todayData?.exists === false) {
        setTodayAttendance(null);
      } else {
        setTodayAttendance(todayData);
      }

      // =====================================================
      // MONTH
      // =====================================================

      const monthData = monthResponse.data;

      setMonthlyAttendance(Array.isArray(monthData) ? monthData : []);

      // =====================================================
      // HISTORY
      // =====================================================

      const historyData = historyResponse.data;

      setRecentAttendance(
        Array.isArray(historyData) ? historyData.slice(0, 7) : [],
      );
    } catch (err) {
      console.error("Attendance loading error:", err);

      console.error("Attendance response:", err.response?.data);

      setError(
        err.response?.data?.message || "Failed to load attendance data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CHECK IN
  // =========================================================

  const handleCheckIn = async () => {
    const currentWorkerId = getValidWorkerId();

    console.log("Check-In Worker ID:", currentWorkerId);

    if (!currentWorkerId) {
      setError("Valid Worker ID not found. Please logout and login again.");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const url = `/worker/attendance/check-in/${currentWorkerId}`;

      console.log("Sending Check-In Request:", url);

      const response = await api.post(url);

      console.log("Check-In Response:", response.data);

      // Immediately update today's attendance
      if (response.data) {
        setTodayAttendance(response.data);
      }

      setMessage("Check-in successful.");

      // Reload complete data
      await loadAttendanceData();
    } catch (err) {
      console.error("Check-in error:", err);

      console.error("Check-in response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to check in.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // CHECK OUT
  // =========================================================

  const handleCheckOut = async () => {
    const currentWorkerId = getValidWorkerId();

    console.log("Check-Out Worker ID:", currentWorkerId);

    if (!currentWorkerId) {
      setError("Valid Worker ID not found. Please logout and login again.");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const url = `/worker/attendance/check-out/${currentWorkerId}`;

      console.log("Sending Check-Out Request:", url);

      const response = await api.post(url);

      console.log("====================================");

      console.log("CHECK-OUT RESPONSE");

      console.log("Full Response:", response);

      console.log("Response Data:", response.data);

      console.log("Check In:", response.data?.checkIn);

      console.log("Check Out:", response.data?.checkOut);

      console.log("Working Minutes:", response.data?.workingMinutes);

      console.log("Remarks:", response.data?.remarks);

      console.log("====================================");

      // =====================================================
      // IMPORTANT
      // Immediately update UI with checkout response
      // =====================================================

      if (response.data) {
        setTodayAttendance(response.data);
      }

      setMessage("Check-out successful.");

      // Reload data from database
      await loadAttendanceData();
    } catch (err) {
      console.error("Check-out error:", err);

      console.error("Check-out response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to check out.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "--";
    }

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
    if (!dateTime) {
      return "--";
    }

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
  // MONTHLY STATS
  // =========================================================

  const presentCount = monthlyAttendance.filter(
    (item) => String(item.status || "").toUpperCase() === "PRESENT",
  ).length;

  const absentCount = monthlyAttendance.filter(
    (item) => String(item.status || "").toUpperCase() === "ABSENT",
  ).length;

  const halfDayCount = monthlyAttendance.filter(
    (item) => String(item.status || "").toUpperCase() === "HALF_DAY",
  ).length;

  const totalDays = monthlyAttendance.length;

  const attendancePercentage =
    totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  // =========================================================
  // TODAY STATUS
  // =========================================================

  const isCheckedIn =
    Boolean(todayAttendance?.checkIn) && !todayAttendance?.checkOut;

  const isCheckedOut = Boolean(todayAttendance?.checkOut);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="worker-attendance-page">
        <div className="attendance-loading">
          <div className="attendance-spinner"></div>

          <p>Loading attendance...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="worker-attendance-page">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="attendance-page-header">
        <div>
          <h1>Worker Attendance</h1>

          <p>Track your daily attendance and working hours.</p>
        </div>

        <div className="attendance-date">
          <span>Today</span>

          <strong>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {message && <div className="attendance-alert success">{message}</div>}

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && <div className="attendance-alert error">{error}</div>}

      {/* =====================================================
          TODAY ATTENDANCE
      ====================================================== */}

      <div className="today-attendance-card">
        <div className="today-attendance-info">
          <div className="attendance-icon">✓</div>

          <div>
            <span className="small-label">Today's Attendance</span>

            <h2>{todayAttendance?.status || "NOT MARKED"}</h2>

            <p>
              {todayAttendance?.checkIn
                ? todayAttendance?.checkOut
                  ? `Checked in at ${formatTime(
                      todayAttendance.checkIn,
                    )} • Checked out at ${formatTime(todayAttendance.checkOut)}`
                  : `Checked in at ${formatTime(todayAttendance.checkIn)}`
                : "You have not checked in yet."}
            </p>
          </div>
        </div>

        <div className="attendance-actions">
          {/* CHECK IN */}

          {!todayAttendance && (
            <button
              className="attendance-btn check-in-btn"
              onClick={handleCheckIn}
              disabled={actionLoading || !workerId}
            >
              {actionLoading ? "Processing..." : "Check In"}
            </button>
          )}

          {/* CHECK OUT */}

          {isCheckedIn && (
            <button
              className="attendance-btn check-out-btn"
              onClick={handleCheckOut}
              disabled={actionLoading || !workerId}
            >
              {actionLoading ? "Processing..." : "Check Out"}
            </button>
          )}

          {/* COMPLETED */}

          {isCheckedOut && (
            <div className="completed-badge">✓ Attendance Completed</div>
          )}
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <div className="attendance-stats">
        <div className="attendance-stat-card">
          <span>Check In</span>

          <strong>{formatTime(todayAttendance?.checkIn)}</strong>
        </div>

        <div className="attendance-stat-card">
          <span>Check Out</span>

          <strong>{formatTime(todayAttendance?.checkOut)}</strong>
        </div>

        <div className="attendance-stat-card">
          <span>Working Hours</span>

          <strong>{formatWorkingHours(todayAttendance?.workingMinutes)}</strong>
        </div>

        <div className="attendance-stat-card">
          <span>Attendance</span>

          <strong>{todayAttendance?.status || "Not Marked"}</strong>
        </div>
      </div>

      {/* =====================================================
          MONTHLY SUMMARY
      ====================================================== */}

      <div className="attendance-section-card">
        <div className="section-card-header">
          <div>
            <h2>Monthly Summary</h2>

            <p>Attendance summary for the current month.</p>
          </div>
        </div>

        <div className="monthly-summary-grid">
          <div className="summary-box">
            <span>Total Days</span>

            <strong>{totalDays}</strong>
          </div>

          <div className="summary-box">
            <span>Present</span>

            <strong>{presentCount}</strong>
          </div>

          <div className="summary-box">
            <span>Absent</span>

            <strong>{absentCount}</strong>
          </div>

          <div className="summary-box">
            <span>Half Day</span>

            <strong>{halfDayCount}</strong>
          </div>

          <div className="summary-box">
            <span>Attendance Rate</span>

            <strong>{attendancePercentage}%</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          RECENT ATTENDANCE
      ====================================================== */}

      <div className="attendance-section-card">
        <div className="section-card-header">
          <div>
            <h2>Recent Attendance</h2>

            <p>Your latest attendance records.</p>
          </div>
        </div>

        {recentAttendance.length === 0 ? (
          <div className="empty-attendance">
            <div className="empty-icon">📅</div>

            <h3>No Attendance Records</h3>

            <p>Your attendance records will appear here.</p>
          </div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                </tr>
              </thead>

              <tbody>
                {recentAttendance.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.attendanceDate)}</td>

                    <td>
                      <span
                        className={`attendance-status ${String(
                          record.status || "",
                        ).toLowerCase()}`}
                      >
                        {record.status || "--"}
                      </span>
                    </td>

                    <td>{formatTime(record.checkIn)}</td>

                    <td>{formatTime(record.checkOut)}</td>

                    <td>{formatWorkingHours(record.workingMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerAttendance;
