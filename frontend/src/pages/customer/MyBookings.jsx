import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./MyBookings.css";

const statusConfig = {
  PENDING: {
    label: "Pending",
    className: "pending",
    icon: "⏳",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "confirmed",
    icon: "✓",
  },
  ASSIGNED: {
    label: "Worker Assigned",
    className: "assigned",
    icon: "👤",
  },
  RECEIVED: {
    label: "Vehicle Received",
    className: "received",
    icon: "🚘",
  },
  INSPECTION: {
    label: "AI Inspection",
    className: "inspection",
    icon: "🤖",
  },
  WASHING: {
    label: "Washing",
    className: "washing",
    icon: "💦",
  },
  DRYING: {
    label: "Drying",
    className: "drying",
    icon: "✨",
  },
  QUALITY_CHECK: {
    label: "Quality Check",
    className: "quality",
    icon: "🔍",
  },
  COMPLETED: {
    label: "Completed",
    className: "completed",
    icon: "✓",
  },
  DELIVERED: {
    label: "Delivered",
    className: "delivered",
    icon: "🏁",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "cancelled",
    icon: "×",
  },
};

const activeStatuses = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "RECEIVED",
  "INSPECTION",
  "WASHING",
  "DRYING",
  "QUALITY_CHECK",
];

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // =========================
  // REVIEW STATES
  // =========================
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // =========================
  // AUTH + INITIAL LOAD
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadBookings();
    loadReviews();
  }, [navigate]);

  // =========================
  // LOAD BOOKINGS
  // =========================
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customer/bookings");

      const data = Array.isArray(response.data) ? response.data : [];

      // Latest booking first
      const sortedBookings = [...data].sort((a, b) => {
        const dateA = new Date(
          `${a.bookingDate || "1970-01-01"}T${a.bookingTime || "00:00:00"}`,
        );

        const dateB = new Date(
          `${b.bookingDate || "1970-01-01"}T${b.bookingTime || "00:00:00"}`,
        );

        return dateB - dateA;
      });

      setBookings(sortedBookings);
    } catch (err) {
      console.error("Failed to load bookings:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your bookings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD CUSTOMER REVIEWS
  // =========================
  const loadReviews = async () => {
    try {
      setReviewsLoading(true);

      const response = await api.get("/customer/reviews");

      const data = Array.isArray(response.data) ? response.data : [];

      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");
        navigate("/login");
        return;
      }

      // Reviews fail hone par bookings page ko break nahi karna.
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // =========================
  // CHECK IF BOOKING REVIEWED
  // =========================
  const hasReview = (bookingId) => {
    return reviews.some(
      (review) => Number(review.bookingId) === Number(bookingId),
    );
  };

  // =========================
  // OPEN REVIEW MODAL
  // =========================
  const openReviewModal = (booking) => {
    // Safety check
    if (!booking || booking.status !== "DELIVERED") {
      return;
    }

    // Already reviewed
    if (hasReview(booking.id)) {
      return;
    }

    setSelectedBooking(booking);
    setReviewRating(0);
    setHoverRating(0);
    setReviewComment("");
    setReviewError("");
    setReviewModalOpen(true);
  };

  // =========================
  // CLOSE REVIEW MODAL
  // =========================
  const closeReviewModal = () => {
    if (reviewSubmitting) return;

    setReviewModalOpen(false);
    setSelectedBooking(null);
    setReviewRating(0);
    setHoverRating(0);
    setReviewComment("");
    setReviewError("");
  };

  // =========================
  // SUBMIT REVIEW
  // =========================
  const submitReview = async (e) => {
    e.preventDefault();

    if (!selectedBooking) {
      setReviewError("Booking information is missing.");
      return;
    }

    if (selectedBooking.status !== "DELIVERED") {
      setReviewError(
        "Review is available only after your vehicle has been delivered.",
      );
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please select a rating between 1 and 5 stars.");
      return;
    }

    const trimmedComment = reviewComment.trim();

    if (trimmedComment.length > 1000) {
      setReviewError("Comment cannot be longer than 1000 characters.");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");

      const payload = {
        bookingId: selectedBooking.id,
        rating: reviewRating,
        comment: trimmedComment,
      };

      const response = await api.post("/customer/reviews", payload);

      const savedReview = response.data;

      // Immediately update local reviews
      setReviews((prevReviews) => [
        savedReview,
        ...prevReviews.filter(
          (review) => Number(review.bookingId) !== Number(selectedBooking.id),
        ),
      ]);

      closeReviewModal();
    } catch (err) {
      console.error("Failed to submit review:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");
        navigate("/login");
        return;
      }

      setReviewError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to submit your review. Please try again.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // FORMAT TIME
  // =========================
  const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":");

    if (hours === undefined || minutes === undefined) {
      return time;
    }

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =========================
  // STATUS
  // =========================
  const getStatus = (status) => {
    return (
      statusConfig[status] || {
        label: status || "Unknown",
        className: "unknown",
        icon: "•",
      }
    );
  };

  // =========================
  // VEHICLE
  // =========================
  const getVehicleName = (booking) => {
    const vehicle = booking?.vehicle;

    if (!vehicle) return "Vehicle";

    const parts = [
      vehicle.brand,
      vehicle.model,
      vehicle.registrationNumber,
    ].filter(Boolean);

    return parts.length ? parts.join(" ") : "Vehicle";
  };

  const getVehicleType = (booking) => {
    return booking?.vehicle?.vehicleType || "Vehicle";
  };

  // =========================
  // SERVICE
  // =========================
  const getServiceName = (booking) => {
    return booking?.service?.name || "AutoGlow Service";
  };

  const getPackageName = (booking) => {
    return booking?.servicePackage?.name || null;
  };

  // =========================
  // FILTERED BOOKINGS
  // =========================
  const filteredBookings = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      if (!matchesStatus) return false;

      if (!searchValue) return true;

      const searchableText = [
        booking.id,
        getVehicleName(booking),
        getVehicleType(booking),
        getServiceName(booking),
        getPackageName(booking),
        booking.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchValue);
    });
  }, [bookings, search, statusFilter]);

  // =========================
  // STATS
  // =========================
  const activeBookingsCount = bookings.filter((booking) =>
    activeStatuses.includes(booking.status),
  ).length;

  const completedBookingsCount = bookings.filter(
    (booking) =>
      booking.status === "COMPLETED" || booking.status === "DELIVERED",
  ).length;

  const totalSpent = bookings.reduce((total, booking) => {
    const amount = Number(booking.totalAmount || 0);
    return total + (Number.isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div className="my-bookings-page">
      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside className="bookings-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">A</div>

          <div>
            <h2>AutoGlow</h2>
            <span>Vehicle Care</span>
          </div>
        </div>

        <div className="sidebar-section-title">MAIN MENU</div>

        <nav className="sidebar-nav">
          <Link to="/customer/dashboard">
            <span className="nav-icon">⌂</span>
            Dashboard
          </Link>

          <Link to="/customer/vehicles">
            <span className="nav-icon">🚘</span>
            My Vehicles
          </Link>

          <Link to="/customer/book">
            <span className="nav-icon">＋</span>
            Book a Service
          </Link>

          <Link to="/customer/bookings" className="active">
            <span className="nav-icon">▣</span>
            My Bookings
          </Link>

          <Link to="/customer/service-history">
            <span className="nav-icon">◷</span>
            Service History
          </Link>
        </nav>

        <div className="sidebar-section-title">AI & SERVICES</div>

        <nav className="sidebar-nav">
          <Link to="/customer/ai-inspection">
            <span className="nav-icon">✦</span>
            AI Inspection
          </Link>

          <Link to="/customer/ai-recommendation">
            <span className="nav-icon">◇</span>
            AI Recommendations
          </Link>

          <Link to="/customer/ai-chatbot">
            <span className="nav-icon">◌</span>
            AI Assistant
          </Link>
        </nav>

        <div className="sidebar-section-title">ACCOUNT</div>

        <nav className="sidebar-nav">
          <Link to="/customer/profile">
            <span className="nav-icon">○</span>
            Profile
          </Link>

          <Link to="/customer/notifications">
            <span className="nav-icon">♢</span>
            Notifications
          </Link>

          <Link to="/customer/settings">
            <span className="nav-icon">⚙</span>
            Settings
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="premium-box">
            <div className="premium-icon">✦</div>

            <div>
              <strong>AutoGlow AI</strong>
              <span>Smarter vehicle care</span>
            </div>
          </div>

          <button
            className="sidebar-logout"
            onClick={() => {
              localStorage.removeItem("autoglow_token");
              localStorage.removeItem("autoglow_role");
              navigate("/login");
            }}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="bookings-main">
        {/* TOPBAR */}
        <header className="bookings-topbar">
          <div>
            <div className="breadcrumb">
              Customer Portal <span>/</span> My Bookings
            </div>

            <h1>My Bookings</h1>
            <p>Manage and track all your AutoGlow service bookings.</p>
          </div>

          <div className="topbar-actions">
            <button
              className="notification-btn"
              onClick={() => navigate("/customer/notifications")}
              aria-label="Notifications"
            >
              ♢<span className="notification-dot"></span>
            </button>

            <div
              className="topbar-profile"
              onClick={() => navigate("/customer/profile")}
            >
              <div className="profile-avatar">C</div>

              <div>
                <strong>Customer</strong>
                <span>AutoGlow Member</span>
              </div>

              <span className="profile-arrow">⌄</span>
            </div>
          </div>
        </header>

        {/* =========================================================
            CONTENT
        ========================================================= */}
        <section className="bookings-content">
          {/* HERO */}
          <div className="bookings-hero">
            <div className="hero-copy">
              <div className="hero-label">
                <span>✦</span>
                SERVICE MANAGEMENT
              </div>

              <h2>
                Your vehicle care,
                <br />
                <span>all in one place.</span>
              </h2>

              <p>
                View your upcoming services, monitor progress and access
                complete booking information from one premium dashboard.
              </p>

              <button
                className="hero-book-btn"
                onClick={() => navigate("/customer/book")}
              >
                <span>＋</span>
                Book New Service
              </button>
            </div>

            <div className="hero-visual">
              <div className="hero-glow"></div>

              <div className="hero-car-icon">🚘</div>

              <div className="floating-card floating-card-one">
                <span className="floating-check">✓</span>

                <div>
                  <strong>Premium Care</strong>
                  <small>Professional service</small>
                </div>
              </div>

              <div className="floating-card floating-card-two">
                <span>✦</span>

                <div>
                  <strong>AI Powered</strong>
                  <small>Smart inspection</small>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="booking-stats">
            <div className="booking-stat-card">
              <div className="stat-card-icon blue">▣</div>

              <div>
                <span>Total Bookings</span>
                <strong>{bookings.length}</strong>
                <small>All your bookings</small>
              </div>
            </div>

            <div className="booking-stat-card">
              <div className="stat-card-icon orange">◷</div>

              <div>
                <span>Active Services</span>
                <strong>{activeBookingsCount}</strong>
                <small>Currently in progress</small>
              </div>
            </div>

            <div className="booking-stat-card">
              <div className="stat-card-icon green">✓</div>

              <div>
                <span>Completed</span>
                <strong>{completedBookingsCount}</strong>
                <small>Successfully completed</small>
              </div>
            </div>

            <div className="booking-stat-card">
              <div className="stat-card-icon purple">₹</div>

              <div>
                <span>Total Spent</span>

                <strong>
                  ₹
                  {totalSpent.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </strong>

                <small>Across all bookings</small>
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="booking-list-header">
            <div>
              <h3>All Bookings</h3>

              <p>
                {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="booking-tools">
              <div className="search-box">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button
                    className="clear-search"
                    onClick={() => setSearch("")}
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ASSIGNED">Worker Assigned</option>
                <option value="RECEIVED">Vehicle Received</option>
                <option value="INSPECTION">AI Inspection</option>
                <option value="WASHING">Washing</option>
                <option value="DRYING">Drying</option>
                <option value="QUALITY_CHECK">Quality Check</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                className="refresh-btn"
                onClick={() => {
                  loadBookings();
                  loadReviews();
                }}
                title="Refresh bookings"
              >
                ↻
              </button>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="bookings-state">
              <div className="loader-circle"></div>

              <h3>Loading your bookings</h3>

              <p>Please wait while we fetch your latest service information.</p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="bookings-state error-state">
              <div className="state-icon error">!</div>

              <h3>Unable to load bookings</h3>

              <p>{error}</p>

              <button className="retry-btn" onClick={loadBookings}>
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && filteredBookings.length === 0 && (
            <div className="bookings-state empty-state">
              <div className="empty-car">🚘</div>

              {bookings.length === 0 ? (
                <>
                  <h3>No bookings yet</h3>

                  <p>
                    Your vehicle deserves the best care. Book your first
                    AutoGlow service today.
                  </p>

                  <button
                    className="empty-action"
                    onClick={() => navigate("/customer/book")}
                  >
                    <span>＋</span>
                    Book Your First Service
                  </button>
                </>
              ) : (
                <>
                  <h3>No matching bookings</h3>

                  <p>
                    We couldn't find a booking matching your current search or
                    filter.
                  </p>

                  <button
                    className="empty-action secondary"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          )}

          {/* =========================================================
              BOOKING LIST
          ========================================================= */}
          {!loading && !error && filteredBookings.length > 0 && (
            <div className="bookings-list">
              {filteredBookings.map((booking) => {
                const status = getStatus(booking.status);
                const packageName = getPackageName(booking);
                const bookingHasReview = hasReview(booking.id);

                return (
                  <article className="booking-card" key={booking.id}>
                    <div className="booking-card-top">
                      <div className="booking-number">
                        <span className="booking-icon">▣</span>

                        <div>
                          <span>BOOKING ID</span>

                          <strong>
                            AG-{String(booking.id).padStart(5, "0")}
                          </strong>
                        </div>
                      </div>

                      <div className={`booking-status ${status.className}`}>
                        <span>{status.icon}</span>
                        {status.label}
                      </div>
                    </div>

                    <div className="booking-card-body">
                      {/* VEHICLE */}
                      <div className="booking-info vehicle-info">
                        <div className="info-icon vehicle">🚘</div>

                        <div>
                          <span>VEHICLE</span>

                          <strong>{getVehicleName(booking)}</strong>

                          <small>
                            {getVehicleType(booking)}

                            {booking?.vehicle?.color
                              ? ` • ${booking.vehicle.color}`
                              : ""}
                          </small>
                        </div>
                      </div>

                      {/* SERVICE */}
                      <div className="booking-info">
                        <div className="info-icon service">✦</div>

                        <div>
                          <span>SERVICE</span>

                          <strong>{getServiceName(booking)}</strong>

                          <small>{packageName || "Standard Service"}</small>
                        </div>
                      </div>

                      {/* DATE */}
                      <div className="booking-info">
                        <div className="info-icon date">▣</div>

                        <div>
                          <span>SCHEDULED DATE</span>

                          <strong>{formatDate(booking.bookingDate)}</strong>

                          <small>{formatTime(booking.bookingTime)}</small>
                        </div>
                      </div>

                      {/* AMOUNT */}
                      <div className="booking-info amount-info">
                        <div className="info-icon amount">₹</div>

                        <div>
                          <span>TOTAL AMOUNT</span>

                          <strong>
                            ₹
                            {Number(booking.totalAmount || 0).toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 0,
                              },
                            )}
                          </strong>

                          <small>Service booking</small>
                        </div>
                      </div>
                    </div>

                    <div className="booking-card-footer">
                      <div className="booking-options">
                        {booking.pickupRequired && (
                          <span className="option-pill">
                            <span>↗</span>
                            Pickup
                          </span>
                        )}

                        {booking.dropRequired && (
                          <span className="option-pill">
                            <span>↘</span>
                            Drop
                          </span>
                        )}

                        {booking.status === "INSPECTION" && (
                          <span className="option-pill ai-pill">
                            <span>✦</span>
                            AI Inspection
                          </span>
                        )}

                        {/* ================================
                            REVIEW BUTTON
                        ================================= */}
                        {booking.status === "DELIVERED" &&
                          !reviewsLoading &&
                          (bookingHasReview ? (
                            <span className="reviewed-pill">
                              <span>★</span>
                              Reviewed
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="give-review-btn"
                              onClick={() => openReviewModal(booking)}
                            >
                              <span>★</span>
                              Give Review
                            </button>
                          ))}
                      </div>

                      <button
                        className="details-btn"
                        onClick={() =>
                          navigate(`/customer/bookings/${booking.id}`)
                        }
                      >
                        View Details
                        <span>→</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* BOTTOM CTA */}
          {!loading && bookings.length > 0 && (
            <div className="bottom-booking-cta">
              <div className="cta-symbol">✦</div>

              <div>
                <h3>Need another service?</h3>

                <p>
                  Keep your vehicle looking and performing its best with
                  AutoGlow.
                </p>
              </div>

              <button onClick={() => navigate("/customer/book")}>
                Book New Service
                <span>→</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* =========================================================
          REVIEW MODAL
      ========================================================= */}
      {reviewModalOpen && selectedBooking && (
        <div
          className="review-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeReviewModal();
            }
          }}
        >
          <div className="review-modal">
            {/* HEADER */}
            <div className="review-modal-header">
              <div>
                <div className="review-modal-eyebrow">
                  <span>✦</span>
                  AUTOGLOW EXPERIENCE
                </div>

                <h2>How was your service?</h2>

                <p>
                  Share your experience and help us make AutoGlow even better.
                </p>
              </div>

              <button
                type="button"
                className="review-modal-close"
                onClick={closeReviewModal}
                disabled={reviewSubmitting}
                aria-label="Close review"
              >
                ×
              </button>
            </div>

            {/* BOOKING SUMMARY */}
            <div className="review-booking-summary">
              <div className="review-summary-icon">🚘</div>

              <div className="review-summary-content">
                <span>BOOKING</span>

                <strong>
                  AG-{String(selectedBooking.id).padStart(5, "0")}
                </strong>

                <small>{getVehicleName(selectedBooking)}</small>
              </div>

              <div className="review-summary-service">
                <span>SERVICE</span>

                <strong>{getServiceName(selectedBooking)}</strong>

                <small>
                  {getPackageName(selectedBooking) || "Standard Service"}
                </small>
              </div>
            </div>

            <form onSubmit={submitReview}>
              {/* RATING */}
              <div className="review-rating-section">
                <label>Your rating</label>

                <div
                  className="review-stars"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`review-star ${
                        (hoverRating || reviewRating) >= star ? "active" : ""
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setReviewRating(star)}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="rating-caption">
                  {reviewRating === 0 && "Select your rating"}

                  {reviewRating === 1 && "Poor"}

                  {reviewRating === 2 && "Needs improvement"}

                  {reviewRating === 3 && "Good"}

                  {reviewRating === 4 && "Very good"}

                  {reviewRating === 5 && "Excellent!"}
                </div>
              </div>

              {/* COMMENT */}
              <div className="review-comment-section">
                <div className="review-comment-header">
                  <label htmlFor="review-comment">Your experience</label>

                  <span>{reviewComment.length}/1000</span>
                </div>

                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => {
                    if (e.target.value.length <= 1000) {
                      setReviewComment(e.target.value);
                    }
                  }}
                  placeholder="Tell us about your service experience..."
                  rows={5}
                  maxLength={1000}
                  disabled={reviewSubmitting}
                />
              </div>

              {/* ERROR */}
              {reviewError && (
                <div className="review-form-error">
                  <span>!</span>
                  {reviewError}
                </div>
              )}

              {/* ACTIONS */}
              <div className="review-modal-actions">
                <button
                  type="button"
                  className="review-cancel-btn"
                  onClick={closeReviewModal}
                  disabled={reviewSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="review-submit-btn"
                  disabled={reviewSubmitting || reviewRating === 0}
                >
                  {reviewSubmitting ? (
                    <>
                      <span className="review-submit-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Review
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
