import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Offers.css";

function Offers() {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadCoupons();
  }, [navigate]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customer/coupons");

      setCoupons(response.data || []);
    } catch (err) {
      console.error("Coupons error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load offers.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCoupon = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(code);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "No expiry";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDiscountText = (coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}% OFF`;
    }

    return `₹${Number(coupon.discountValue || 0).toLocaleString("en-IN")} OFF`;
  };

  const getMinimumText = (coupon) => {
    if (!coupon.minOrderAmount) {
      return "No minimum order";
    }

    return `On orders above ₹${Number(coupon.minOrderAmount).toLocaleString(
      "en-IN",
    )}`;
  };

  if (loading) {
    return (
      <div className="offers-loading">
        <div className="offers-spinner"></div>

        <h2>Finding the best offers...</h2>

        <p>Loading exclusive AutoGlow deals for you.</p>
      </div>
    );
  }

  return (
    <div className="offers-page">
      {/* TOP BAR */}

      <header className="offers-topbar">
        <Link to="/customer/dashboard" className="offers-back">
          ← Dashboard
        </Link>

        <div className="offers-top-title">
          <span>AutoGlow</span>
          <strong>Offers & Coupons</strong>
        </div>

        <button className="offers-refresh" onClick={loadCoupons}>
          ↻ Refresh
        </button>
      </header>

      <main className="offers-container">
        {/* HERO */}

        <section className="offers-hero">
          <div className="offers-hero-content">
            <span className="offers-eyebrow">EXCLUSIVE SAVINGS</span>

            <h1>
              Premium care,
              <br />
              better prices.
            </h1>

            <p>
              Save more on your next car or bike service with AutoGlow exclusive
              offers.
            </p>

            <div className="offers-hero-pills">
              <span>✓ Verified Offers</span>
              <span>⚡ Instant Savings</span>
              <span>✦ Premium Care</span>
            </div>
          </div>

          <div className="offers-hero-art">
            <div className="hero-glow-circle">%</div>

            <div className="hero-floating-card">
              <strong>20%</strong>
              <span>OFF</span>
            </div>
          </div>
        </section>

        {/* COUPONS */}

        <section className="offers-section">
          <div className="offers-section-header">
            <div>
              <span className="offers-eyebrow">AVAILABLE NOW</span>

              <h2>Special Offers</h2>

              <p>Apply these coupons while booking your next service.</p>
            </div>

            <div className="offers-count">{coupons.length} Offers</div>
          </div>

          {error && (
            <div className="offers-error">
              <strong>Unable to load offers</strong>
              <p>{error}</p>

              <button onClick={loadCoupons}>Try Again</button>
            </div>
          )}

          {!error && coupons.length === 0 && (
            <div className="offers-empty">
              <div>🎁</div>

              <h3>No offers available right now</h3>

              <p>New AutoGlow offers will appear here soon.</p>
            </div>
          )}

          {!error && coupons.length > 0 && (
            <div className="coupon-grid">
              {coupons.map((coupon) => (
                <article className="coupon-card" key={coupon.id}>
                  <div className="coupon-top">
                    <div className="coupon-discount">
                      <span>{getDiscountText(coupon)}</span>

                      <small>AutoGlow Offer</small>
                    </div>

                    <div className="coupon-icon">%</div>
                  </div>

                  <div className="coupon-content">
                    <h3>{coupon.code}</h3>

                    <p className="coupon-description">
                      {coupon.description ||
                        "Exclusive AutoGlow service discount."}
                    </p>

                    <div className="coupon-details">
                      <div>
                        <span>Minimum Order</span>

                        <strong>{getMinimumText(coupon)}</strong>
                      </div>

                      {coupon.maxDiscount && (
                        <div>
                          <span>Maximum Savings</span>

                          <strong>
                            ₹
                            {Number(coupon.maxDiscount).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      )}
                    </div>

                    <div className="coupon-divider"></div>

                    <div className="coupon-footer">
                      <div>
                        <span>Valid until</span>

                        <strong>{formatDate(coupon.validUntil)}</strong>
                      </div>

                      <button
                        className={
                          copied === coupon.code
                            ? "coupon-copy copied"
                            : "coupon-copy"
                        }
                        onClick={() => copyCoupon(coupon.code)}
                      >
                        {copied === coupon.code ? "✓ Copied" : "Copy Code"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* HOW TO USE */}

        <section className="how-to-use">
          <div className="offers-eyebrow">HOW IT WORKS</div>

          <h2>Use your offer in 3 simple steps</h2>

          <div className="steps-grid">
            <div className="offer-step">
              <div>01</div>

              <h3>Choose an offer</h3>

              <p>Select the coupon that suits your service requirement.</p>
            </div>

            <div className="offer-step">
              <div>02</div>

              <h3>Copy the code</h3>

              <p>Copy the coupon code and continue to your booking.</p>
            </div>

            <div className="offer-step">
              <div>03</div>

              <h3>Apply at checkout</h3>

              <p>Apply your coupon during booking and enjoy your savings.</p>
            </div>
          </div>
        </section>

        {/* CTA */}

        <section className="offers-cta">
          <div>
            <span className="offers-eyebrow">READY TO SAVE?</span>

            <h2>Book your next service today.</h2>

            <p>Premium vehicle care with smarter pricing.</p>
          </div>

          <Link to="/customer/book" className="offers-book-btn">
            Book a Service →
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Offers;
