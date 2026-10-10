import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./Invoice.css";

function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadInvoice();
  }, [id, navigate]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/customer/invoices/${id}`);

      setInvoice(response.data);
    } catch (err) {
      console.error("Invoice error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load invoice.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const parts = String(time).split(":");

    if (parts.length < 2) return time;

    let hour = Number(parts[0]);
    const minute = parts[1];

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minute} ${period}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const copyText = async (text, type) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(String(text));

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const getPaymentClass = (status) => {
    const value = String(status || "PENDING")
      .trim()
      .toLowerCase();

    if (
      value === "paid" ||
      value === "success" ||
      value === "successful" ||
      value === "completed"
    ) {
      return "paid";
    }

    if (value === "failed" || value === "cancelled" || value === "canceled") {
      return "failed";
    }

    return "pending";
  };

  const getPaymentLabel = (status) => {
    const value = String(status || "PENDING")
      .trim()
      .toUpperCase();

    if (
      value === "SUCCESS" ||
      value === "SUCCESSFUL" ||
      value === "COMPLETED" ||
      value === "PAID"
    ) {
      return "PAID";
    }

    if (value === "CANCELLED" || value === "CANCELED") {
      return "CANCELLED";
    }

    if (value === "FAILED") {
      return "FAILED";
    }

    return "PENDING";
  };

  const getBookingStatusClass = (status) => {
    const value = String(status || "PENDING")
      .trim()
      .toLowerCase();

    if (value === "completed" || value === "delivered") {
      return "completed";
    }

    if (value === "cancelled" || value === "canceled") {
      return "cancelled";
    }

    if (
      value === "washing" ||
      value === "drying" ||
      value === "inspection" ||
      value === "quality_check" ||
      value === "received" ||
      value === "assigned"
    ) {
      return "active";
    }

    return "pending";
  };

  const formatBookingStatus = (status) => {
    return String(status || "PENDING")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div className="invoice-loading">
        <div className="invoice-spinner"></div>

        <h3>Preparing your invoice...</h3>

        <p>Fetching your AutoGlow billing details.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-page">
        <div className="invoice-error">
          <div className="invoice-error-icon">!</div>

          <h2>Invoice unavailable</h2>

          <p>{error}</p>

          <div className="invoice-error-actions">
            <button onClick={loadInvoice} className="invoice-primary-btn">
              ↻ Try Again
            </button>

            <Link
              to={`/customer/bookings/${id}`}
              className="invoice-secondary-btn"
            >
              ← Back to Booking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  /*
   * Backend InvoiceResponse is FLAT.
   *
   * Example:
   * invoice.bookingId
   * invoice.customerName
   * invoice.vehicleMake
   * invoice.serviceName
   * invoice.packageName
   * invoice.bookingStatus
   *
   * So we do not use invoice.booking.vehicle etc.
   */

  const paymentClass = getPaymentClass(invoice.paymentStatus);
  const paymentLabel = getPaymentLabel(invoice.paymentStatus);

  const bookingStatusClass = getBookingStatusClass(invoice.bookingStatus);

  const bookingStatus = formatBookingStatus(invoice.bookingStatus);

  const totalAmount = Number(invoice.totalAmount || 0);

  const itemCount =
    (invoice.serviceName ? 1 : 0) +
    (invoice.packageName ? 1 : 0) +
    (invoice.pickupRequired || invoice.dropRequired ? 1 : 0);

  return (
    <div className="invoice-page">
      {/* ================= TOP BAR ================= */}

      <div className="invoice-topbar no-print">
        <Link to={`/customer/bookings/${id}`} className="invoice-back">
          <span>←</span>
          Back to Booking
        </Link>

        <div className="invoice-top-actions">
          <button
            className="invoice-refresh-btn"
            onClick={loadInvoice}
            title="Refresh invoice"
          >
            ↻
          </button>

          <button className="invoice-print-btn" onClick={handlePrint}>
            🖨 Print Invoice
          </button>
        </div>
      </div>

      {/* ================= INVOICE ================= */}

      <main className="invoice-container">
        {/* ================= HEADER ================= */}

        <section className="invoice-header">
          <div className="invoice-brand">
            <div className="invoice-logo">AG</div>

            <div>
              <h1>AutoGlow</h1>

              <p>Premium Vehicle Care</p>

              <span className="invoice-company-line">
                AI Powered Car & Bike Care Management
              </span>
            </div>
          </div>

          <div className="invoice-heading">
            <div className="invoice-title-row">
              <span>INVOICE</span>

              <div className={`invoice-status-badge ${paymentClass}`}>
                <i></i>
                {paymentLabel}
              </div>
            </div>

            <div className="invoice-number-row">
              <h2>{invoice.invoiceNumber || "AG-INVOICE"}</h2>

              <button
                className="copy-btn no-print"
                onClick={() => copyText(invoice.invoiceNumber, "invoice")}
                title="Copy invoice number"
              >
                {copied === "invoice" ? "✓" : "⧉"}
              </button>
            </div>

            <p>Generated on {formatDateTime(invoice.generatedAt)}</p>
          </div>
        </section>

        {/* ================= QUICK INFO ================= */}

        <section className="invoice-quick-info">
          <div className="quick-info-item">
            <div className="quick-icon">#</div>

            <div>
              <span>Booking ID</span>

              <strong>#{invoice.bookingId || id}</strong>
            </div>
          </div>

          <div className="quick-info-item">
            <div className="quick-icon">✓</div>

            <div>
              <span>Booking Status</span>

              <strong className={`booking-mini-status ${bookingStatusClass}`}>
                {bookingStatus}
              </strong>
            </div>
          </div>

          <div className="quick-info-item">
            <div className="quick-icon">₹</div>

            <div>
              <span>Total Payable</span>

              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </div>
        </section>

        {/* ================= CUSTOMER + VEHICLE ================= */}

        <section className="invoice-info-grid">
          <div className="invoice-info-card">
            <div className="invoice-card-heading">
              <div className="invoice-small-icon">👤</div>

              <span className="invoice-section-title">BILLED TO</span>
            </div>

            <h3>{invoice.customerName || "Customer"}</h3>

            <p>{invoice.customerEmail || "-"}</p>
          </div>

          <div className="invoice-info-card">
            <div className="invoice-card-heading">
              <div className="invoice-small-icon">🚗</div>

              <span className="invoice-section-title">VEHICLE</span>
            </div>

            <h3>
              {invoice.vehicleMake && invoice.vehicleModel
                ? `${invoice.vehicleMake} ${invoice.vehicleModel}`
                : invoice.vehicleModel || invoice.vehicleMake || "Vehicle"}
            </h3>

            <p>{invoice.vehicleNumber || "Registration not available"}</p>
          </div>
        </section>

        {/* ================= BOOKING DETAILS ================= */}

        <section className="invoice-booking-card">
          <div className="invoice-section-heading">
            <div>
              <span className="invoice-eyebrow">SERVICE DETAILS</span>

              <h3>Booking Information</h3>
            </div>

            <div className="booking-reference">
              AG-{invoice.bookingId || id}
            </div>
          </div>

          <div className="invoice-booking-info">
            <div>
              <span>Service Date</span>

              <strong>{formatDate(invoice.bookingDate)}</strong>
            </div>

            <div>
              <span>Service Time</span>

              <strong>{formatTime(invoice.bookingTime)}</strong>
            </div>

            <div>
              <span>Pickup</span>

              <strong className={invoice.pickupRequired ? "yes" : "no"}>
                {invoice.pickupRequired ? "✓ Required" : "Not Required"}
              </strong>
            </div>

            <div>
              <span>Drop</span>

              <strong className={invoice.dropRequired ? "yes" : "no"}>
                {invoice.dropRequired ? "✓ Required" : "Not Required"}
              </strong>
            </div>
          </div>
        </section>

        {/* ================= ITEMS ================= */}

        <section className="invoice-items-card">
          <div className="invoice-items-heading">
            <div>
              <span className="invoice-eyebrow">BILLING BREAKDOWN</span>

              <h3>Services & Charges</h3>
            </div>

            <span className="item-count">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="invoice-table-header">
            <span>Description</span>

            <span>Amount</span>
          </div>

          {/* SERVICE */}

          {invoice.serviceName && (
            <div className="invoice-table-row">
              <div className="invoice-item-description">
                <div className="item-icon">✦</div>

                <div>
                  <strong>{invoice.serviceName}</strong>

                  <small>Professional vehicle care service</small>
                </div>
              </div>

              <strong>{formatCurrency(invoice.serviceAmount)}</strong>
            </div>
          )}

          {/* PACKAGE */}

          {invoice.packageName && (
            <div className="invoice-table-row">
              <div className="invoice-item-description">
                <div className="item-icon package">★</div>

                <div>
                  <strong>{invoice.packageName}</strong>

                  <small>Selected premium service package</small>
                </div>
              </div>

              <strong>{formatCurrency(invoice.packageAmount)}</strong>
            </div>
          )}

          {/* PICKUP / DROP */}

          {(invoice.pickupRequired || invoice.dropRequired) && (
            <div className="invoice-table-row">
              <div className="invoice-item-description">
                <div className="item-icon pickup">↗</div>

                <div>
                  <strong>Pickup / Drop Service</strong>

                  <small>Vehicle pickup and delivery</small>
                </div>
              </div>

              <strong>{formatCurrency(invoice.pickupDropAmount)}</strong>
            </div>
          )}

          {/* EMPTY SERVICE FALLBACK */}

          {!invoice.serviceName &&
            !invoice.packageName &&
            !invoice.pickupRequired &&
            !invoice.dropRequired && (
              <div className="invoice-empty-items">
                No service items available.
              </div>
            )}
        </section>

        {/* ================= ADDRESSES ================= */}

        {(invoice.pickupRequired || invoice.dropRequired) && (
          <section className="invoice-address-grid">
            {invoice.pickupRequired && (
              <div className="invoice-address-card">
                <div className="address-icon">↗</div>

                <div>
                  <span>PICKUP ADDRESS</span>

                  <p>
                    {invoice.pickupAddress || "Pickup address not provided"}
                  </p>
                </div>
              </div>
            )}

            {invoice.dropRequired && (
              <div className="invoice-address-card">
                <div className="address-icon">↘</div>

                <div>
                  <span>DROP ADDRESS</span>

                  <p>{invoice.dropAddress || "Drop address not provided"}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================= SUMMARY ================= */}

        <section className="invoice-summary-wrapper">
          <div className="invoice-summary">
            <div className="invoice-summary-line">
              <span>Service Amount</span>

              <strong>{formatCurrency(invoice.serviceAmount)}</strong>
            </div>

            <div className="invoice-summary-line">
              <span>Package Amount</span>

              <strong>{formatCurrency(invoice.packageAmount)}</strong>
            </div>

            <div className="invoice-summary-line">
              <span>Pickup / Drop</span>

              <strong>{formatCurrency(invoice.pickupDropAmount)}</strong>
            </div>

            <div className="invoice-summary-line discount">
              <span>Discount</span>

              <strong>- {formatCurrency(invoice.discountAmount)}</strong>
            </div>

            <div className="invoice-divider"></div>

            <div className="invoice-total">
              <div>
                <span>Total Amount</span>

                <small>Inclusive of selected services</small>
              </div>

              <strong>{formatCurrency(invoice.totalAmount)}</strong>
            </div>
          </div>
        </section>

        {/* ================= PAYMENT ================= */}

        <section className="invoice-payment-card">
          <div className="payment-left">
            <div className="payment-icon">₹</div>

            <div>
              <span className="invoice-section-title">PAYMENT INFORMATION</span>

              <h3>{paymentLabel}</h3>

              <p>
                {paymentClass === "paid"
                  ? "Payment has been successfully received."
                  : paymentClass === "failed"
                    ? "Payment could not be completed."
                    : "Payment is currently pending."}
              </p>
            </div>
          </div>

          <div className="invoice-transaction">
            <span>Transaction ID</span>

            <div className="transaction-value">
              <strong>{invoice.transactionId || "Payment pending"}</strong>

              {invoice.transactionId && (
                <button
                  className="copy-btn no-print"
                  onClick={() => copyText(invoice.transactionId, "transaction")}
                  title="Copy transaction ID"
                >
                  {copied === "transaction" ? "✓" : "⧉"}
                </button>
              )}
            </div>

            {invoice.paymentMethod && (
              <div className="payment-method">
                Payment Method: <strong>{invoice.paymentMethod}</strong>
              </div>
            )}
          </div>
        </section>

        {/* ================= NOTES ================= */}

        {invoice.notes && (
          <section className="invoice-notes">
            <div className="notes-icon">i</div>

            <div>
              <span className="invoice-section-title">BOOKING NOTES</span>

              <p>{invoice.notes}</p>
            </div>
          </section>
        )}

        {/* ================= TRUST AREA ================= */}

        <section className="invoice-trust">
          <div className="trust-item">
            <span>✓</span>

            <div>
              <strong>Verified Invoice</strong>

              <small>Generated by AutoGlow system</small>
            </div>
          </div>

          <div className="trust-item">
            <span>🔒</span>

            <div>
              <strong>Secure Billing</strong>

              <small>Your billing information is protected</small>
            </div>
          </div>

          <div className="trust-item">
            <span>✦</span>

            <div>
              <strong>Premium Care</strong>

              <small>Quality vehicle service guaranteed</small>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}

        <footer className="invoice-footer">
          <div>
            <div className="footer-brand">
              <div className="footer-logo">AG</div>

              <div>
                <h3>Thank you for choosing AutoGlow.</h3>

                <p>Your vehicle deserves premium care.</p>
              </div>
            </div>

            <div className="footer-meta">
              <span>AutoGlow • Premium Vehicle Care</span>

              <span>Invoice #{invoice.invoiceNumber}</span>
            </div>
          </div>

          <div className="invoice-footer-actions no-print">
            <button onClick={handlePrint} className="invoice-primary-btn">
              🖨 Print Invoice
            </button>

            <Link
              to={`/customer/bookings/${id}`}
              className="invoice-secondary-btn"
            >
              View Booking
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Invoice;
