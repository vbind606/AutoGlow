import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Reviews.css";

function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [bookingId, setBookingId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadReviews();
  }, [navigate]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customer/reviews");

      setReviews(response.data || []);
    } catch (err) {
      console.error("Reviews error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load reviews.",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!bookingId.trim()) {
      setError("Please enter your completed Booking ID.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await api.post("/customer/reviews", {
        bookingId: Number(bookingId),
        rating,
        comment,
      });

      setSuccess("Thank you! Your review has been submitted successfully.");

      setBookingId("");
      setRating(5);
      setComment("");

      await loadReviews();
    } catch (err) {
      console.error("Review submit error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to submit review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= value ? "star active" : "star"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="reviews-spinner"></div>

        <h2>Loading your reviews...</h2>

        <p>Preparing your AutoGlow feedback history.</p>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      {/* TOP BAR */}

      <header className="reviews-topbar">
        <Link to="/customer/dashboard" className="reviews-back">
          ← Dashboard
        </Link>

        <div className="reviews-title">
          <strong>Reviews & Ratings</strong>
          <span>Share your AutoGlow experience</span>
        </div>

        <button className="reviews-refresh" onClick={loadReviews}>
          ↻ Refresh
        </button>
      </header>

      <main className="reviews-container">
        {/* HERO */}

        <section className="reviews-hero">
          <div>
            <span className="reviews-eyebrow">YOUR EXPERIENCE MATTERS</span>

            <h1>
              Tell us how we
              <br />
              did.
            </h1>

            <p>
              Your feedback helps us improve every vehicle service and deliver
              better care.
            </p>
          </div>

          <div className="reviews-rating-box">
            <strong>{averageRating}</strong>

            {renderStars(Math.round(Number(averageRating)))}

            <span>
              Based on {reviews.length} review
              {reviews.length === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        {/* WRITE REVIEW */}

        <section className="write-review-card">
          <div className="section-heading">
            <div>
              <span className="reviews-eyebrow">SHARE FEEDBACK</span>

              <h2>Rate your completed service</h2>

              <p>Only delivered services can be reviewed.</p>
            </div>
          </div>

          {error && <div className="review-alert error">{error}</div>}

          {success && <div className="review-alert success">{success}</div>}

          <form onSubmit={submitReview}>
            <div className="review-form-grid">
              <div className="review-input-group">
                <label>Booking ID</label>

                <input
                  type="number"
                  placeholder="Example: 5"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                />

                <small>Enter the Booking ID of your delivered service.</small>
              </div>

              <div className="review-input-group">
                <label>Your Rating</label>

                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={
                        star <= rating ? "rating-star selected" : "rating-star"
                      }
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}

                  <span>{rating}/5</span>
                </div>
              </div>
            </div>

            <div className="review-input-group">
              <label>Your Review</label>

              <textarea
                rows="5"
                maxLength="1000"
                placeholder="Tell us about your vehicle service experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <small>{comment.length}/1000 characters</small>
            </div>

            <button
              type="submit"
              className="submit-review-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review →"}
            </button>
          </form>
        </section>

        {/* REVIEW HISTORY */}

        <section className="review-history">
          <div className="history-heading">
            <div>
              <span className="reviews-eyebrow">YOUR FEEDBACK</span>

              <h2>Review History</h2>
            </div>

            <span className="review-count">{reviews.length} Reviews</span>
          </div>

          {reviews.length === 0 ? (
            <div className="reviews-empty">
              <div className="empty-icon">★</div>

              <h3>No reviews yet</h3>

              <p>Complete a service and share your experience with AutoGlow.</p>
            </div>
          ) : (
            <div className="review-list">
              {reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="review-card-top">
                    <div className="review-avatar">
                      {(review.customerName || "C").charAt(0).toUpperCase()}
                    </div>

                    <div className="review-customer">
                      <h3>{review.customerName || "Customer"}</h3>

                      <span>Booking #{review.bookingId}</span>
                    </div>

                    <div className="review-date">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>

                  <div className="review-card-service">
                    <strong>{review.serviceName || "Vehicle Service"}</strong>

                    {review.packageName && <span>{review.packageName}</span>}

                    {review.vehicleName && (
                      <span>
                        🚗 {review.vehicleName}
                        {review.vehicleNumber
                          ? ` • ${review.vehicleNumber}`
                          : ""}
                      </span>
                    )}
                  </div>

                  {renderStars(review.rating)}

                  <p className="review-comment">
                    {review.comment || "No written comment provided."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}

        <section className="reviews-cta">
          <div>
            <span className="reviews-eyebrow">KEEP YOUR VEHICLE GLOWING</span>

            <h2>Ready for your next service?</h2>

            <p>Book premium vehicle care with AutoGlow.</p>
          </div>

          <Link to="/customer/book" className="review-book-btn">
            Book a Service →
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Reviews;
