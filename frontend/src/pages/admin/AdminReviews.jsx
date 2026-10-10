import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./AdminReviews.css";

const StarRating = ({ rating = 0, large = false }) => {
  return (
    <div className={`review-stars ${large ? "large" : ""}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "filled" : ""}>
          ★
        </span>
      ))}
    </div>
  );
};

const Icon = ({ type, size = 18 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }

  if (type === "refresh") {
    return (
      <svg {...common}>
        <path d="M20 11a8.1 8.1 0 0 0-15.5-3" />
        <path d="M4 4v4h4" />
        <path d="M4 13a8.1 8.1 0 0 0 15.5 3" />
        <path d="M20 20v-4h-4" />
      </svg>
    );
  }

  if (type === "eye") {
    return (
      <svg {...common}>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  if (type === "trash") {
    return (
      <svg {...common}>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="m9 7 .7-2h4.6l.7 2" />
        <path d="M6 7l.7 13h10.6L18 7" />
      </svg>
    );
  }

  if (type === "star") {
    return (
      <svg {...common} fill="currentColor">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </svg>
    );
  }

  if (type === "message") {
    return (
      <svg {...common}>
        <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2.4V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v8Z" />
      </svg>
    );
  }

  if (type === "user") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </svg>
    );
  }

  return null;
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);

  if (!parts.length || !parts[0]) {
    return "C";
  }

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getServiceLabel = (review) => {
  if (review?.serviceName) {
    return review.serviceName;
  }

  if (review?.packageName) {
    return review.packageName;
  }

  return "Service";
};

const normalizeReviews = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.reviews)) {
    return data.reviews;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const [selectedReview, setSelectedReview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/admin/reviews");

      setReviews(normalizeReviews(response?.data));
    } catch (err) {
      console.error("Failed to load reviews:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Unable to load reviews.";

      setError(
        typeof message === "string" ? message : "Unable to load reviews.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;

    const ratings = reviews
      .map((review) => Number(review.rating || 0))
      .filter((rating) => rating >= 1 && rating <= 5);

    const average =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    const fiveStar = ratings.filter((rating) => rating === 5).length;

    const lowRating = ratings.filter((rating) => rating <= 2).length;

    return {
      total,
      average,
      fiveStar,
      lowRating,
    };
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    const counts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      const rating = Number(review.rating);

      if (counts[rating] !== undefined) {
        counts[rating]++;
      }
    });

    return counts;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const ratingMatch =
        ratingFilter === "ALL" ||
        Number(review.rating) === Number(ratingFilter);

      if (!ratingMatch) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        review.customerName,
        review.vehicleName,
        review.vehicleNumber,
        review.serviceName,
        review.packageName,
        review.comment,
        review.bookingId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [reviews, search, ratingFilter]);

  const handleDelete = async (review) => {
    const customer = review?.customerName || "this customer";

    const confirmed = window.confirm(
      `Delete the review from ${customer}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(review.id);

      await api.delete(`/admin/reviews/${review.id}`);

      setReviews((current) => current.filter((item) => item.id !== review.id));

      if (selectedReview?.id === review.id) {
        setSelectedReview(null);
      }
    } catch (err) {
      console.error("Delete review failed:", err);

      alert(err?.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-reviews-page">
      {/* Header */}
      <section className="reviews-page-header">
        <div>
          <div className="reviews-eyebrow">CUSTOMER EXPERIENCE</div>

          <h1>Reviews & Ratings</h1>

          <p>
            Monitor customer feedback and keep track of your service quality.
          </p>
        </div>

        <button
          className={`reviews-refresh-btn ${refreshing ? "is-loading" : ""}`}
          onClick={() => fetchReviews(true)}
          disabled={refreshing}
        >
          <Icon type="refresh" size={17} />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      {/* Error */}
      {error && (
        <div className="reviews-error">
          <div>
            <strong>Unable to load reviews</strong>
            <span>{error}</span>
          </div>

          <button onClick={() => fetchReviews()}>Retry</button>
        </div>
      )}

      {/* Stats */}
      <section className="reviews-stat-grid">
        <div className="review-stat-card">
          <div className="review-stat-icon">
            <Icon type="message" size={21} />
          </div>

          <div>
            <span>Total Reviews</span>
            <strong>{stats.total}</strong>
            <small>Customer feedback</small>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon rating-icon">
            <Icon type="star" size={20} />
          </div>

          <div>
            <span>Average Rating</span>

            <strong>
              {stats.average.toFixed(1)}
              <small className="rating-out-of">/ 5</small>
            </strong>

            <StarRating rating={Math.round(stats.average)} />
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon">
            <span className="five-star-symbol">5★</span>
          </div>

          <div>
            <span>5 Star Reviews</span>
            <strong>{stats.fiveStar}</strong>
            <small>Excellent experiences</small>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon low-rating-icon">
            <span>!</span>
          </div>

          <div>
            <span>Low Ratings</span>
            <strong>{stats.lowRating}</strong>
            <small>1–2 star reviews</small>
          </div>
        </div>
      </section>

      {/* Rating Overview */}
      {!loading && reviews.length > 0 && (
        <section className="rating-overview-card">
          <div className="rating-overview-heading">
            <div>
              <span className="section-kicker">RATING OVERVIEW</span>

              <h2>Customer satisfaction</h2>
            </div>

            <div className="rating-big">
              <strong>{stats.average.toFixed(1)}</strong>

              <StarRating rating={Math.round(stats.average)} large />

              <span>Based on {stats.total} reviews</span>
            </div>
          </div>

          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingCounts[rating];

              const percentage =
                stats.total > 0 ? (count / stats.total) * 100 : 0;

              return (
                <button
                  key={rating}
                  className={`rating-bar-row ${
                    ratingFilter === String(rating) ? "selected" : ""
                  }`}
                  onClick={() =>
                    setRatingFilter(
                      ratingFilter === String(rating) ? "ALL" : String(rating),
                    )
                  }
                >
                  <span>{rating}</span>
                  <span className="bar-star">★</span>

                  <div className="rating-progress">
                    <span
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <strong>{count}</strong>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Toolbar */}
      <section className="reviews-content-card">
        <div className="reviews-toolbar">
          <div>
            <span className="section-kicker">CUSTOMER FEEDBACK</span>

            <h2>
              All Reviews
              <span>{filteredReviews.length}</span>
            </h2>
          </div>

          <div className="reviews-toolbar-controls">
            <div className="review-search">
              <Icon type="search" size={18} />

              <input
                type="text"
                placeholder="Search customer, vehicle, service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button className="search-clear" onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </div>

            <select
              className="rating-filter"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="ALL">All Ratings</option>
              <option value="5">★ 5 Stars</option>
              <option value="4">★ 4 Stars</option>
              <option value="3">★ 3 Stars</option>
              <option value="2">★ 2 Stars</option>
              <option value="1">★ 1 Star</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="reviews-loading">
            <div className="premium-loader" />

            <h3>Loading reviews...</h3>

            <p>Fetching the latest customer feedback.</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          /* Empty */
          <div className="reviews-empty">
            <div className="empty-review-icon">
              <Icon type="message" size={28} />
            </div>

            <h3>
              {reviews.length === 0 ? "No reviews yet" : "No matching reviews"}
            </h3>

            <p>
              {reviews.length === 0
                ? "Customer reviews will appear here once they start submitting feedback."
                : "Try changing your search or rating filter."}
            </p>

            {(search || ratingFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setRatingFilter("ALL");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Table */
          <div className="reviews-table-wrap">
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>VEHICLE</th>
                  <th>SERVICE</th>
                  <th>RATING</th>
                  <th>REVIEW</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => {
                  const customer = review.customerName || "Customer";

                  return (
                    <tr key={review.id}>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {getInitials(customer)}
                          </div>

                          <div>
                            <strong>{customer}</strong>

                            <span>Booking #{review.bookingId || "—"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="vehicle-cell">
                          <strong>{review.vehicleName || "Vehicle"}</strong>

                          <span>
                            {review.vehicleNumber || "Registration unavailable"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="service-cell">
                          <strong>{getServiceLabel(review)}</strong>

                          {review.packageName && <span>Package</span>}
                        </div>
                      </td>

                      <td>
                        <div className="table-rating">
                          <StarRating rating={Number(review.rating || 0)} />

                          <span>{review.rating || 0}.0</span>
                        </div>
                      </td>

                      <td>
                        <div className="comment-preview">
                          {review.comment ? (
                            <>
                              <span>{review.comment}</span>

                              {review.comment.length > 80 && (
                                <button
                                  onClick={() => setSelectedReview(review)}
                                >
                                  Read more
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="no-comment">
                              No written comment
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="date-cell">
                          <strong>{formatDate(review.createdAt)}</strong>

                          <span>
                            {formatDateTime(review.createdAt).split(", ")[1] ||
                              ""}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="review-actions">
                          <button
                            className="review-action view"
                            title="View review"
                            onClick={() => setSelectedReview(review)}
                          >
                            <Icon type="eye" size={17} />
                          </button>

                          <button
                            className="review-action delete"
                            title="Delete review"
                            disabled={deletingId === review.id}
                            onClick={() => handleDelete(review)}
                          >
                            <Icon type="trash" size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredReviews.length > 0 && (
          <div className="reviews-table-footer">
            <span>
              Showing <strong>{filteredReviews.length}</strong> of{" "}
              <strong>{reviews.length}</strong> reviews
            </span>

            <span>AutoGlow Customer Experience</span>
          </div>
        )}
      </section>

      {/* Review Modal */}
      {selectedReview && (
        <div
          className="review-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedReview(null);
            }
          }}
        >
          <div className="review-modal">
            <div className="review-modal-header">
              <div>
                <span className="section-kicker">REVIEW DETAILS</span>

                <h2>Customer feedback</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedReview(null)}
              >
                ×
              </button>
            </div>

            <div className="review-modal-body">
              <div className="modal-customer">
                <div className="modal-avatar">
                  {getInitials(selectedReview.customerName)}
                </div>

                <div>
                  <strong>{selectedReview.customerName || "Customer"}</strong>

                  <span>Booking #{selectedReview.bookingId || "—"}</span>
                </div>
              </div>

              <div className="modal-rating">
                <StarRating rating={Number(selectedReview.rating || 0)} large />

                <strong>{selectedReview.rating || 0}/5</strong>
              </div>

              <div className="modal-review-box">
                <span className="quote-mark">“</span>

                <p>
                  {selectedReview.comment ||
                    "The customer did not leave a written comment."}
                </p>
              </div>

              <div className="modal-details-grid">
                <div>
                  <span>Vehicle</span>
                  <strong>{selectedReview.vehicleName || "Vehicle"}</strong>
                  <small>
                    {selectedReview.vehicleNumber || "Registration unavailable"}
                  </small>
                </div>

                <div>
                  <span>Service</span>
                  <strong>{getServiceLabel(selectedReview)}</strong>

                  {selectedReview.packageName && (
                    <small>{selectedReview.packageName}</small>
                  )}
                </div>

                <div>
                  <span>Submitted</span>
                  <strong>{formatDate(selectedReview.createdAt)}</strong>
                  <small>
                    {formatDateTime(selectedReview.createdAt).split(", ")[1] ||
                      ""}
                  </small>
                </div>
              </div>
            </div>

            <div className="review-modal-footer">
              <button
                className="modal-secondary-btn"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </button>

              <button
                className="modal-delete-btn"
                onClick={() => handleDelete(selectedReview)}
              >
                <Icon type="trash" size={16} />
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
