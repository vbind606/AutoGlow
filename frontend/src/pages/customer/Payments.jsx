import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../services/api";
import "./Payments.css";

function Payments() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD BOOKING + PAYMENT
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadPaymentData();
  }, [id, navigate]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------------------
      // LOAD BOOKING
      // -----------------------------------------------------

      const bookingResponse = await api.get(`/customer/bookings/${id}`);

      setBooking(bookingResponse.data);

      // -----------------------------------------------------
      // LOAD EXISTING PAYMENT
      // -----------------------------------------------------

      try {
        const paymentResponse = await api.get(
          `/customer/payments/booking/${id}`,
        );

        if (paymentResponse.data) {
          setPayment(paymentResponse.data);
        }
      } catch (paymentError) {
        // 404 / empty payment is okay
        console.log(
          "No existing payment found.",
          paymentError.response?.status,
        );
      }
    } catch (err) {
      console.error("Payment page error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError("You are not authorized to access this booking.");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load payment details.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SELECT PAYMENT METHOD
  // =========================================================

  const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setError("");
    setSuccess("");
  };

  // =========================================================
  // VALIDATE PAYMENT
  // =========================================================

  const validatePayment = () => {
    if (paymentMethod === "UPI") {
      if (!upiId.trim()) {
        setError("Please enter your UPI ID.");
        return false;
      }

      if (!upiId.includes("@")) {
        setError("Please enter a valid UPI ID.");
        return false;
      }
    }

    if (paymentMethod === "CARD") {
      const cleanCardNumber = cardNumber.replace(/\s/g, "");

      if (!cleanCardNumber) {
        setError("Please enter your card number.");
        return false;
      }

      if (cleanCardNumber.length !== 16) {
        setError("Please enter a valid 16-digit card number.");
        return false;
      }

      if (!cardName.trim()) {
        setError("Please enter the name on card.");
        return false;
      }

      if (!expiry.trim()) {
        setError("Please enter card expiry date.");
        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        setError("Please enter expiry in MM/YY format.");
        return false;
      }

      if (!cvv.trim()) {
        setError("Please enter CVV.");
        return false;
      }

      if (cvv.length !== 3) {
        setError("Please enter a valid 3-digit CVV.");
        return false;
      }
    }

    return true;
  };

  // =========================================================
  // OPEN CHECKOUT
  // =========================================================

  const openCheckout = () => {
    setError("");
    setSuccess("");

    if (!booking) {
      setError("Booking information is not available.");
      return;
    }

    if (amount <= 0) {
      setError("Invalid booking amount.");
      return;
    }

    setCheckoutOpen(true);
  };

  // =========================================================
  // CLOSE CHECKOUT
  // =========================================================

  const closeCheckout = () => {
    if (paying) {
      return;
    }

    setCheckoutOpen(false);
    setError("");
  };

  // =========================================================
  // PAYMENT
  // =========================================================

  const handlePayment = async () => {
    setError("");
    setSuccess("");

    if (!validatePayment()) {
      return;
    }

    try {
      setPaying(true);

      /*
       * Dummy checkout processing.
       *
       * Backend expects:
       *
       * POST /api/customer/payments/{bookingId}
       *
       * Query parameter:
       *
       * paymentMethod=UPI
       */

      const response = await api.post(`/customer/payments/${id}`, null, {
        params: {
          paymentMethod: paymentMethod,
        },
      });

      setPayment(response.data);

      // -----------------------------------------------------
      // SHOW SUCCESS STATE
      // -----------------------------------------------------

      setPaymentSuccess(true);

      setSuccess("Payment successful! Your transaction has been completed.");
    } catch (err) {
      console.error("Payment error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        setCheckoutOpen(false);
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError("You are not authorized to make this payment.");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Payment failed. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  // =========================================================
  // CARD NUMBER FORMAT
  // =========================================================

  const handleCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 16);

    value = value.replace(/(.{4})/g, "$1 ").trim();

    setCardNumber(value);
  };

  // =========================================================
  // EXPIRY FORMAT
  // =========================================================

  const handleExpiry = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);

    if (value.length >= 3) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }

    setExpiry(value);
  };

  // =========================================================
  // RESET CHECKOUT
  // =========================================================

  const resetCheckout = () => {
    setCheckoutOpen(false);
    setPaymentSuccess(false);
    setPaying(false);
    setError("");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          <div className="payment-spinner"></div>

          <h3>Loading payment details...</h3>

          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR WITHOUT BOOKING
  // =========================================================

  if (error && !booking) {
    return (
      <div className="payment-page">
        <div className="payment-error">
          <div className="payment-error-icon">!</div>

          <h2>Unable to Load Payment</h2>

          <p>{error}</p>

          <div className="payment-error-actions">
            <button
              onClick={() => navigate(-1)}
              className="payment-secondary-btn"
            >
              Go Back
            </button>

            <button onClick={loadPaymentData} className="payment-primary-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // DATA
  // =========================================================

  const amount = Number(booking?.totalAmount || 0);

  const serviceAmount = Number(booking?.service?.price || 0);

  const packageAmount = Number(booking?.servicePackage?.price || 0);

  const isPaid = payment && payment.status?.toUpperCase() === "SUCCESS";

  return (
    <div className="payment-page">
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <div className="payment-topbar">
        <Link to={`/customer/bookings/${id}`} className="payment-back">
          ← Back to Booking
        </Link>

        <div className="payment-secure">🔒 Secure Payment</div>
      </div>

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="payment-container">
        {/* HEADER */}

        <div className="payment-header">
          <div>
            <span className="payment-eyebrow">AUTOGLOW PAYMENTS</span>

            <h1>Complete Your Payment</h1>

            <p>
              Choose your preferred payment method and complete your service
              payment.
            </p>
          </div>

          {isPaid && <div className="payment-success-badge">✓ PAID</div>}
        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================== */}

        {success && (
          <div className="payment-success-message">
            <span>✓</span>

            <div>
              <strong>Payment Successful</strong>

              <p>{success}</p>
            </div>
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div className="payment-error-message">
            <span>!</span>

            {error}
          </div>
        )}

        <div className="payment-layout">
          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <div className="payment-main">
            {/* BOOKING SUMMARY */}

            <div className="payment-card">
              <div className="payment-card-heading">
                <div>
                  <span className="payment-section-label">BOOKING</span>

                  <h2>Service Summary</h2>
                </div>

                <span className="payment-booking-id">#{booking?.id}</span>
              </div>

              <div className="payment-details-grid">
                <div className="payment-detail">
                  <span>Vehicle</span>

                  <strong>
                    {booking?.vehicle?.brand || "Vehicle"}{" "}
                    {booking?.vehicle?.model || ""}
                  </strong>
                </div>

                <div className="payment-detail">
                  <span>Service</span>

                  <strong>
                    {booking?.service?.name || "Car / Bike Service"}
                  </strong>
                </div>

                <div className="payment-detail">
                  <span>Date</span>

                  <strong>{booking?.bookingDate || "-"}</strong>
                </div>

                <div className="payment-detail">
                  <span>Time</span>

                  <strong>{booking?.bookingTime || "-"}</strong>
                </div>
              </div>
            </div>

            {/* =================================================
                PAYMENT METHODS
            ================================================== */}

            {!isPaid && (
              <div className="payment-card">
                <div className="payment-card-heading">
                  <div>
                    <span className="payment-section-label">
                      PAYMENT METHOD
                    </span>

                    <h2>Choose Payment Method</h2>
                  </div>
                </div>

                {/* PAYMENT METHODS */}

                <div className="payment-methods">
                  {/* UPI */}

                  <button
                    type="button"
                    className={`payment-method ${
                      paymentMethod === "UPI" ? "selected" : ""
                    }`}
                    onClick={() => selectPaymentMethod("UPI")}
                  >
                    <div className="payment-method-icon">UPI</div>

                    <div>
                      <strong>UPI</strong>

                      <span>Google Pay, PhonePe, Paytm</span>
                    </div>

                    <div className="payment-radio">
                      {paymentMethod === "UPI" ? "✓" : ""}
                    </div>
                  </button>

                  {/* CARD */}

                  <button
                    type="button"
                    className={`payment-method ${
                      paymentMethod === "CARD" ? "selected" : ""
                    }`}
                    onClick={() => selectPaymentMethod("CARD")}
                  >
                    <div className="payment-method-icon">💳</div>

                    <div>
                      <strong>Credit / Debit Card</strong>

                      <span>Visa, Mastercard, RuPay</span>
                    </div>

                    <div className="payment-radio">
                      {paymentMethod === "CARD" ? "✓" : ""}
                    </div>
                  </button>

                  {/* CASH */}

                  <button
                    type="button"
                    className={`payment-method ${
                      paymentMethod === "CASH" ? "selected" : ""
                    }`}
                    onClick={() => selectPaymentMethod("CASH")}
                  >
                    <div className="payment-method-icon">₹</div>

                    <div>
                      <strong>Cash</strong>

                      <span>Pay at service center</span>
                    </div>

                    <div className="payment-radio">
                      {paymentMethod === "CASH" ? "✓" : ""}
                    </div>
                  </button>
                </div>

                {/* =================================================
                    SELECTED METHOD PREVIEW
                ================================================== */}

                <div className="payment-selected-preview">
                  <div>
                    <span>Selected payment method</span>

                    <strong>
                      {paymentMethod === "UPI" && "UPI Payment"}

                      {paymentMethod === "CARD" && "Credit / Debit Card"}

                      {paymentMethod === "CASH" && "Cash Payment"}
                    </strong>
                  </div>

                  <span className="payment-preview-amount">
                    ₹{amount.toFixed(2)}
                  </span>
                </div>

                {/* DEMO NOTICE */}

                <div className="payment-demo-note">
                  <strong>🧪 Demo Payment System</strong>

                  <p>
                    This is a dummy payment gateway for the AutoGlow project. No
                    real money, card or UPI transaction will be processed.
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                PAID PAYMENT DETAILS
            ================================================== */}

            {isPaid && (
              <div className="payment-card payment-completed-card">
                <div className="payment-completed-icon">✓</div>

                <div className="payment-completed-content">
                  <span className="payment-section-label">
                    PAYMENT COMPLETED
                  </span>

                  <h2>Your payment is successful</h2>

                  <p>
                    Thank you for choosing AutoGlow. Your service booking
                    payment has been recorded successfully.
                  </p>

                  <div className="payment-completed-grid">
                    <div>
                      <span>Transaction ID</span>

                      <strong>{payment.transactionId || "-"}</strong>
                    </div>

                    <div>
                      <span>Payment Method</span>

                      <strong>{payment.paymentMethod || "-"}</strong>
                    </div>

                    <div>
                      <span>Amount Paid</span>

                      <strong>
                        ₹{Number(payment.amount || amount).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Status</span>

                      <strong>SUCCESS</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}

          <div className="payment-sidebar">
            <div className="payment-summary-card">
              <span className="payment-section-label">PAYMENT SUMMARY</span>

              <h2>Order Total</h2>

              <div className="payment-summary-line">
                <span>Service</span>

                <strong>₹{serviceAmount.toFixed(2)}</strong>
              </div>

              <div className="payment-summary-line">
                <span>Package</span>

                <strong>₹{packageAmount.toFixed(2)}</strong>
              </div>

              <div className="payment-divider"></div>

              <div className="payment-total">
                <span>Total Amount</span>

                <strong>₹{amount.toFixed(2)}</strong>
              </div>

              {isPaid ? (
                <div className="payment-paid-box">
                  <strong>✓ Payment Completed</strong>

                  <span>Transaction ID</span>

                  <code>{payment.transactionId}</code>

                  <span>Method</span>

                  <strong>{payment.paymentMethod}</strong>
                </div>
              ) : (
                <button
                  type="button"
                  className="payment-pay-btn"
                  onClick={openCheckout}
                  disabled={paying}
                >
                  Pay ₹{amount.toFixed(2)}
                </button>
              )}

              <div className="payment-security">
                🔒
                <span>Your payment information is securely processed.</span>
              </div>
            </div>

            <Link
              to={`/customer/bookings/${id}`}
              className="payment-view-booking"
            >
              View Booking Details →
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          RAZORPAY-STYLE DUMMY CHECKOUT MODAL
      ====================================================== */}

      {checkoutOpen && (
        <div
          className="payment-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !paying) {
              closeCheckout();
            }
          }}
        >
          <div className="payment-modal">
            {/* =================================================
                SUCCESS SCREEN
            ================================================== */}

            {paymentSuccess ? (
              <div className="payment-success-screen">
                <div className="payment-success-circle">✓</div>

                <span className="payment-modal-eyebrow">AUTOGLOW PAYMENTS</span>

                <h2>Payment Successful</h2>

                <p>Your payment has been completed successfully.</p>

                <div className="payment-success-amount">
                  ₹{amount.toFixed(2)}
                </div>

                <div className="payment-success-details">
                  <div>
                    <span>Transaction ID</span>

                    <strong>{payment?.transactionId || "-"}</strong>
                  </div>

                  <div>
                    <span>Payment Method</span>

                    <strong>{payment?.paymentMethod || paymentMethod}</strong>
                  </div>

                  <div>
                    <span>Booking</span>

                    <strong>#{booking?.id}</strong>
                  </div>
                </div>

                <div className="payment-success-actions">
                  <button
                    type="button"
                    className="payment-success-invoice-btn"
                    onClick={() => {
                      setCheckoutOpen(false);
                      navigate(`/customer/invoices/${id}`);
                    }}
                  >
                    View Invoice
                  </button>

                  <button
                    type="button"
                    className="payment-success-booking-btn"
                    onClick={() => {
                      setCheckoutOpen(false);
                      navigate(`/customer/bookings/${id}`);
                    }}
                  >
                    Back to Booking
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* =================================================
                    MODAL HEADER
                ================================================== */}

                <div className="payment-modal-header">
                  <div className="payment-modal-brand">
                    <div className="payment-modal-logo">AG</div>

                    <div>
                      <strong>AutoGlow</strong>

                      <span>Secure Checkout</span>
                    </div>
                  </div>

                  {!paying && (
                    <button
                      type="button"
                      className="payment-modal-close"
                      onClick={closeCheckout}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* =================================================
                    MODAL AMOUNT
                ================================================== */}

                <div className="payment-modal-amount">
                  <span>Total Payable</span>

                  <strong>₹{amount.toFixed(2)}</strong>

                  <small>Booking #{booking?.id}</small>
                </div>

                {/* =================================================
                    MODAL METHODS
                ================================================== */}

                <div className="payment-modal-methods">
                  <button
                    type="button"
                    className={paymentMethod === "UPI" ? "active" : ""}
                    onClick={() => selectPaymentMethod("UPI")}
                    disabled={paying}
                  >
                    <span className="modal-method-icon">U</span>

                    <span>UPI</span>
                  </button>

                  <button
                    type="button"
                    className={paymentMethod === "CARD" ? "active" : ""}
                    onClick={() => selectPaymentMethod("CARD")}
                    disabled={paying}
                  >
                    <span className="modal-method-icon">💳</span>

                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    className={paymentMethod === "CASH" ? "active" : ""}
                    onClick={() => selectPaymentMethod("CASH")}
                    disabled={paying}
                  >
                    <span className="modal-method-icon">₹</span>

                    <span>Cash</span>
                  </button>
                </div>

                {/* =================================================
                    MODAL FORM
                ================================================== */}

                <div className="payment-modal-body">
                  {/* UPI */}

                  {paymentMethod === "UPI" && (
                    <div className="payment-modal-form">
                      <div className="modal-form-heading">
                        <div className="modal-form-icon">U</div>

                        <div>
                          <h3>Pay using UPI</h3>

                          <p>Enter your UPI ID to continue.</p>
                        </div>
                      </div>

                      <label>UPI ID</label>

                      <input
                        type="text"
                        placeholder="autoglow@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        disabled={paying}
                      />

                      <div className="modal-demo-hint">Demo: autoglow@upi</div>
                    </div>
                  )}

                  {/* CARD */}

                  {paymentMethod === "CARD" && (
                    <div className="payment-modal-form">
                      <div className="modal-form-heading">
                        <div className="modal-form-icon">💳</div>

                        <div>
                          <h3>Pay using Card</h3>

                          <p>Enter dummy card details.</p>
                        </div>
                      </div>

                      <label>Card Number</label>

                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumber}
                        disabled={paying}
                      />

                      <label>Name on Card</label>

                      <input
                        type="text"
                        placeholder="AutoGlow Customer"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        disabled={paying}
                      />

                      <div className="modal-card-row">
                        <div>
                          <label>Expiry</label>

                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={handleExpiry}
                            disabled={paying}
                          />
                        </div>

                        <div>
                          <label>CVV</label>

                          <input
                            type="password"
                            placeholder="123"
                            maxLength="3"
                            value={cvv}
                            onChange={(e) =>
                              setCvv(e.target.value.replace(/\D/g, ""))
                            }
                            disabled={paying}
                          />
                        </div>
                      </div>

                      <div className="modal-demo-hint">
                        Demo Card: 1234 5678 9012 3456
                      </div>
                    </div>
                  )}

                  {/* CASH */}

                  {paymentMethod === "CASH" && (
                    <div className="payment-modal-cash">
                      <div className="modal-cash-icon">₹</div>

                      <h3>Cash Payment</h3>

                      <p>
                        This demo will record the cash payment as successfully
                        completed.
                      </p>

                      <div className="modal-cash-amount">
                        ₹{amount.toFixed(2)}
                      </div>

                      <small>No real money will be transferred.</small>
                    </div>
                  )}

                  {/* =================================================
                      MODAL ERROR
                  ================================================== */}

                  {error && (
                    <div className="payment-modal-error">
                      <span>!</span>

                      {error}
                    </div>
                  )}
                </div>

                {/* =================================================
                    MODAL FOOTER
                ================================================== */}

                <div className="payment-modal-footer">
                  <div className="modal-secure-text">
                    🔒
                    <span>100% Demo & Secure</span>
                  </div>

                  <button
                    type="button"
                    className="payment-modal-pay-btn"
                    onClick={handlePayment}
                    disabled={paying}
                  >
                    {paying ? (
                      <span className="modal-processing">
                        <span className="modal-spinner"></span>
                        Processing...
                      </span>
                    ) : (
                      `Pay ₹${amount.toFixed(2)}`
                    )}
                  </button>
                </div>

                <div className="payment-modal-demo-footer">
                  🧪 AutoGlow Dummy Gateway — No real payment will be processed.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;
