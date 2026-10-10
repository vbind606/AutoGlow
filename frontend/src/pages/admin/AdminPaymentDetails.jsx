import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import api from "../../services/api";
import "./AdminPaymentDetails.css";

const AdminPaymentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // =========================================================
  // AUTH + FETCH PAYMENT
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");
    const role = localStorage.getItem("autoglow_role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/admin/payments/${id}`);

      setPayment(response.data);
    } catch (err) {
      console.error("Payment details error:", err);

      setError(
        err?.response?.data?.message || "Unable to load payment details.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatDateTime = (value) => {
    if (!value) return "Not available";

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

  const formatDate = (value) => {
    if (!value) return "Not available";

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

  const formatStatus = (value) => {
    if (!value) return "Unknown";

    return String(value)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatMethod = (value) => {
    if (!value) return "Not available";

    return String(value)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "SUCCESS") return "status-success";
    if (value === "PENDING") return "status-pending";
    if (value === "FAILED") return "status-failed";

    if (value === "CANCELLED" || value === "CANCELED") {
      return "status-cancelled";
    }

    if (value === "REFUNDED") {
      return "status-refunded";
    }

    return "status-default";
  };

  // =========================================================
  // PDF HELPERS
  // =========================================================

  const getPdfStatusConfig = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "SUCCESS") {
      return {
        text: "SUCCESS",
        color: [22, 101, 52],
        background: [236, 253, 243],
        message: "Payment has been successfully received.",
      };
    }

    if (value === "PENDING") {
      return {
        text: "PENDING",
        color: [138, 90, 0],
        background: [255, 248, 231],
        message: "Payment is currently pending.",
      };
    }

    if (value === "FAILED") {
      return {
        text: "FAILED",
        color: [180, 35, 24],
        background: [255, 241, 242],
        message: "Payment transaction was unsuccessful.",
      };
    }

    if (value === "REFUNDED") {
      return {
        text: "REFUNDED",
        color: [91, 33, 182],
        background: [245, 243, 255],
        message: "Payment has been refunded.",
      };
    }

    return {
      text: formatStatus(status),
      color: [82, 98, 120],
      background: [244, 247, 251],
      message: "Payment transaction details are shown below.",
    };
  };

  const drawPdfField = (doc, label, value, x, y, width) => {
    const safeValue =
      value === undefined || value === null || value === ""
        ? "Not available"
        : String(value);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(105, 118, 138);

    doc.text(String(label).toUpperCase(), x, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(23, 32, 51);

    const wrapped = doc.splitTextToSize(safeValue, width);

    doc.text(wrapped, x, y + 5);

    return Math.max(12, wrapped.length * 4 + 8);
  };

  // =========================================================
  // DOWNLOAD PAYMENT RECEIPT PDF
  // =========================================================

  const handleDownloadReceipt = () => {
    if (!payment || downloading) return;

    try {
      setDownloading(true);
      setError("");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // =====================================================
      // COLORS
      // =====================================================

      const NAVY = [6, 23, 47];
      const BLUE = [10, 40, 80];
      const LIGHT_BLUE = [239, 245, 252];
      const TEXT = [23, 32, 51];
      const MUTED = [105, 118, 138];
      const BORDER = [222, 229, 238];
      const WHITE = [255, 255, 255];

      // =====================================================
      // PAGE
      // =====================================================

      const pageWidth = 210;
      const pageHeight = 297;

      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      let currentY = 15;

      // =====================================================
      // DATA
      // =====================================================

      const paymentId = payment.paymentId || id || "N/A";

      const bookingId = payment.bookingId || "N/A";

      const amount = Number(payment.amount || 0).toLocaleString("en-IN");

      const status = formatStatus(payment.paymentStatus);

      const paymentMethod = formatMethod(payment.paymentMethod);

      const transactionId = payment.transactionId || "Not available";

      const paymentDate = formatDateTime(
        payment.paidAt || payment.paymentDate || payment.createdAt,
      );

      const createdAt = formatDateTime(payment.createdAt);

      const paidAt = formatDateTime(payment.paidAt);

      const bookingDate = formatDate(payment.bookingDate);

      const customerName = payment.customerName || "Not available";

      const customerEmail = payment.customerEmail || "Not available";

      const vehicleName = payment.vehicleName || "Not available";

      const registrationNumber = payment.registrationNumber || "Not available";

      const serviceName = payment.serviceName || "Not available";

      const packageName = payment.packageName || "Not available";

      const bookingStatus = formatStatus(payment.bookingStatus);

      const statusConfig = getPdfStatusConfig(payment.paymentStatus);

      // =====================================================
      // PAGE SPACE CHECK
      // =====================================================

      const checkPageSpace = (height) => {
        if (currentY + height > pageHeight - 18) {
          doc.addPage();

          currentY = 18;

          doc.setFont("helvetica", "bold");

          doc.setFontSize(8);

          doc.setTextColor(...MUTED);

          doc.text(
            `AutoGlow - Payment Receipt #${paymentId}`,
            margin,
            currentY,
          );

          currentY += 10;
        }
      };

      // =====================================================
      // SECTION TITLE
      // =====================================================

      const drawSectionTitle = (title) => {
        checkPageSpace(15);

        doc.setFont("helvetica", "bold");

        doc.setFontSize(10);

        doc.setTextColor(...BLUE);

        doc.text(title.toUpperCase(), margin, currentY);

        currentY += 4;

        doc.setDrawColor(...BORDER);

        doc.setLineWidth(0.4);

        doc.line(margin, currentY, pageWidth - margin, currentY);

        currentY += 8;
      };

      // =====================================================
      // HEADER
      // =====================================================

      doc.setFillColor(...NAVY);

      doc.roundedRect(margin, currentY, contentWidth, 39, 5, 5, "F");

      // Logo
      doc.setFillColor(...WHITE);

      doc.roundedRect(margin + 7, currentY + 8, 23, 23, 4, 4, "F");

      doc.setFont("helvetica", "bold");

      doc.setFontSize(11);

      doc.setTextColor(...BLUE);

      doc.text("AG", margin + 11.5, currentY + 22);

      // Brand
      doc.setFont("helvetica", "bold");

      doc.setFontSize(19);

      doc.setTextColor(...WHITE);

      doc.text("AutoGlow", margin + 36, currentY + 15);

      doc.setFont("helvetica", "normal");

      doc.setFontSize(7.5);

      doc.setTextColor(201, 215, 233);

      doc.text("Vehicle Detailing & Service", margin + 36, currentY + 22);

      // Heading
      doc.setFont("helvetica", "bold");

      doc.setFontSize(11);

      doc.setTextColor(...WHITE);

      doc.text("PAYMENT RECEIPT", pageWidth - margin - 7, currentY + 14, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");

      doc.setFontSize(7.5);

      doc.setTextColor(200, 214, 232);

      doc.text(`Receipt #${paymentId}`, pageWidth - margin - 7, currentY + 21, {
        align: "right",
      });

      currentY += 47;

      // =====================================================
      // STATUS
      // =====================================================

      checkPageSpace(25);

      doc.setFillColor(...statusConfig.background);

      doc.setDrawColor(...statusConfig.background);

      doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, "FD");

      doc.setFont("helvetica", "bold");

      doc.setFontSize(10);

      doc.setTextColor(...statusConfig.color);

      doc.text(`Payment ${statusConfig.text}`, margin + 7, currentY + 9);

      doc.setFont("helvetica", "normal");

      doc.setFontSize(7.5);

      doc.text(statusConfig.message, margin + 7, currentY + 15);

      currentY += 30;

      // =====================================================
      // AMOUNT
      // =====================================================

      checkPageSpace(35);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(7);

      doc.setTextColor(...MUTED);

      doc.text("TOTAL AMOUNT PAID", pageWidth / 2, currentY, {
        align: "center",
      });

      currentY += 9;

      doc.setFont("helvetica", "bold");

      doc.setFontSize(27);

      doc.setTextColor(...BLUE);

      doc.text(`Rs. ${amount}`, pageWidth / 2, currentY, {
        align: "center",
      });

      currentY += 7;

      doc.setFont("helvetica", "normal");

      doc.setFontSize(8);

      doc.setTextColor(...MUTED);

      doc.text(paymentMethod, pageWidth / 2, currentY, {
        align: "center",
      });

      currentY += 12;

      doc.setDrawColor(...BORDER);

      doc.line(margin, currentY, pageWidth - margin, currentY);

      currentY += 12;

      // =====================================================
      // PAYMENT INFORMATION
      // =====================================================

      drawSectionTitle("Payment Information");

      const gap = 10;

      const columnWidth = (contentWidth - gap) / 2;

      const leftX = margin;

      const rightX = margin + columnWidth + gap;

      let rowY = currentY;

      drawPdfField(
        doc,
        "Payment ID",
        `#${paymentId}`,
        leftX,
        rowY,
        columnWidth,
      );

      drawPdfField(
        doc,
        "Booking ID",
        `#${bookingId}`,
        rightX,
        rowY,
        columnWidth,
      );

      rowY += 17;

      drawPdfField(
        doc,
        "Payment Method",
        paymentMethod,
        leftX,
        rowY,
        columnWidth,
      );

      drawPdfField(doc, "Payment Status", status, rightX, rowY, columnWidth);

      rowY += 17;

      drawPdfField(
        doc,
        "Transaction ID",
        transactionId,
        leftX,
        rowY,
        columnWidth,
      );

      drawPdfField(doc, "Payment Date", paymentDate, rightX, rowY, columnWidth);

      currentY = rowY + 19;

      // =====================================================
      // CUSTOMER
      // =====================================================

      drawSectionTitle("Customer Information");

      rowY = currentY;

      drawPdfField(
        doc,
        "Customer Name",
        customerName,
        leftX,
        rowY,
        columnWidth,
      );

      drawPdfField(
        doc,
        "Email Address",
        customerEmail,
        rightX,
        rowY,
        columnWidth,
      );

      currentY = rowY + 19;

      // =====================================================
      // VEHICLE & SERVICE
      // =====================================================

      drawSectionTitle("Vehicle & Service");

      rowY = currentY;

      drawPdfField(doc, "Vehicle", vehicleName, leftX, rowY, columnWidth);

      drawPdfField(
        doc,
        "Registration Number",
        registrationNumber,
        rightX,
        rowY,
        columnWidth,
      );

      rowY += 17;

      drawPdfField(doc, "Service", serviceName, leftX, rowY, columnWidth);

      drawPdfField(doc, "Package", packageName, rightX, rowY, columnWidth);

      currentY = rowY + 19;

      // =====================================================
      // BOOKING
      // =====================================================

      drawSectionTitle("Booking Information");

      rowY = currentY;

      drawPdfField(
        doc,
        "Booking ID",
        `#${bookingId}`,
        leftX,
        rowY,
        columnWidth,
      );

      drawPdfField(doc, "Booking Date", bookingDate, rightX, rowY, columnWidth);

      rowY += 17;

      drawPdfField(
        doc,
        "Booking Status",
        bookingStatus,
        leftX,
        rowY,
        columnWidth,
      );

      currentY = rowY + 20;

      // =====================================================
      // PAYMENT TIMELINE
      // =====================================================

      checkPageSpace(60);

      drawSectionTitle("Payment Timeline");

      rowY = currentY;

      drawPdfField(doc, "Payment Created", createdAt, leftX, rowY, columnWidth);

      drawPdfField(doc, "Payment Date", paymentDate, rightX, rowY, columnWidth);

      rowY += 17;

      drawPdfField(doc, "Paid At", paidAt, leftX, rowY, columnWidth);

      currentY = rowY + 20;

      // =====================================================
      // TOTAL
      // =====================================================

      checkPageSpace(28);

      doc.setFillColor(...LIGHT_BLUE);

      doc.setDrawColor(...BORDER);

      doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, "FD");

      doc.setFont("helvetica", "bold");

      doc.setFontSize(9);

      doc.setTextColor(...MUTED);

      doc.text("TOTAL PAID", margin + 8, currentY + 12);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(16);

      doc.setTextColor(...BLUE);

      doc.text(`Rs. ${amount}`, pageWidth - margin - 8, currentY + 13, {
        align: "right",
      });

      currentY += 32;

      // =====================================================
      // FOOTER
      // =====================================================

      checkPageSpace(28);

      doc.setDrawColor(...BORDER);

      doc.setLineWidth(0.4);

      doc.line(margin, currentY, pageWidth - margin, currentY);

      currentY += 8;

      doc.setFont("helvetica", "bold");

      doc.setFontSize(8);

      doc.setTextColor(...BLUE);

      doc.text("AutoGlow", pageWidth / 2, currentY, {
        align: "center",
      });

      currentY += 5;

      doc.setFont("helvetica", "normal");

      doc.setFontSize(6.5);

      doc.setTextColor(...MUTED);

      doc.text(
        "This is a computer-generated payment receipt.",
        pageWidth / 2,
        currentY,
        {
          align: "center",
        },
      );

      currentY += 4;

      doc.text("No signature is required.", pageWidth / 2, currentY, {
        align: "center",
      });

      // =====================================================
      // DOWNLOAD
      // =====================================================

      const safePaymentId = String(paymentId).replace(/[^a-zA-Z0-9-_]/g, "-");

      const fileName = `AutoGlow-Payment-Receipt-${safePaymentId}.pdf`;

      doc.save(fileName);
    } catch (err) {
      console.error("Receipt PDF generation error:", err);

      setError("Unable to generate payment receipt PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="payment-details-page">
        <div className="payment-details-loading">
          <div className="payment-spinner"></div>

          <h3>Loading Payment Details</h3>

          <p>Please wait while payment information is being loaded.</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !payment) {
    return (
      <div className="payment-details-page">
        <div className="payment-details-wrapper">
          <button
            className="payment-back-link"
            onClick={() => navigate("/admin/payments")}
          >
            ← Back to Payments
          </button>

          <div className="payment-error-card">
            <div className="payment-error-icon">!</div>

            <h2>Payment Details Unavailable</h2>

            <p>{error}</p>

            <div className="payment-error-actions">
              <button className="payment-primary-btn" onClick={fetchPayment}>
                Try Again
              </button>

              <button
                className="payment-secondary-btn"
                onClick={() => navigate("/admin/payments")}
              >
                Back to Payments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!payment) {
    return (
      <div className="payment-details-page">
        <div className="payment-details-wrapper">
          <button
            className="payment-back-link"
            onClick={() => navigate("/admin/payments")}
          >
            ← Back to Payments
          </button>

          <div className="payment-error-card">
            <div className="payment-error-icon">?</div>

            <h2>Payment Not Found</h2>

            <p>No payment record was found for payment ID #{id}.</p>

            <button
              className="payment-primary-btn"
              onClick={() => navigate("/admin/payments")}
            >
              Back to Payments
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusClass = getStatusClass(payment.paymentStatus);

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="payment-details-page">
      <div className="payment-details-wrapper">
        {/* ===================================================
            BACK
        =================================================== */}

        <button
          className="payment-back-link"
          onClick={() => navigate("/admin/payments")}
        >
          ← Back to Payments
        </button>

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="payment-page-header">
          <div className="payment-title-section">
            <div className="payment-small-label">PAYMENT TRANSACTION</div>

            <h1>Payment #{payment.paymentId}</h1>

            <p>Booking #{payment.bookingId || "N/A"}</p>
          </div>

          <div className="payment-header-actions">
            <div className={`payment-status-badge ${statusClass}`}>
              <span className="status-dot"></span>

              {formatStatus(payment.paymentStatus)}
            </div>

            <button
              type="button"
              className="payment-receipt-btn"
              onClick={handleDownloadReceipt}
              disabled={downloading}
            >
              <span className="receipt-download-icon">
                {downloading ? "..." : "↓"}
              </span>

              {downloading ? "Generating PDF..." : "Download Receipt"}
            </button>
          </div>
        </div>

        {/* ===================================================
            ERROR MESSAGE AFTER PAYMENT IS LOADED
        =================================================== */}

        {error && <div className="payment-inline-error">{error}</div>}

        {/* ===================================================
            HERO
        =================================================== */}

        <div className="payment-hero-card">
          <div className="payment-hero-left">
            <div className="payment-hero-icon">₹</div>

            <div>
              <span className="payment-hero-label">Total Paid Amount</span>

              <div className="payment-hero-amount">
                ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
              </div>

              <span className="payment-hero-method">
                {formatMethod(payment.paymentMethod)}
              </span>
            </div>
          </div>

          <div className="payment-hero-right">
            <div className="hero-stat">
              <span>Payment ID</span>

              <strong>#{payment.paymentId}</strong>
            </div>

            <div className="hero-stat">
              <span>Booking ID</span>

              <strong>#{payment.bookingId || "N/A"}</strong>
            </div>

            <div className="hero-stat transaction-stat">
              <span>Transaction ID</span>

              <strong>{payment.transactionId || "Not available"}</strong>
            </div>
          </div>
        </div>

        {/* ===================================================
            INFORMATION CARDS
        =================================================== */}

        <div className="payment-content-grid">
          {/* CUSTOMER */}

          <section className="payment-info-card">
            <div className="info-card-header">
              <div className="info-card-icon">👤</div>

              <div>
                <h2>Customer Information</h2>

                <p>Customer linked to this payment</p>
              </div>
            </div>

            <div className="info-fields">
              <div className="info-field">
                <span>Customer Name</span>

                <strong>{payment.customerName || "Not available"}</strong>
              </div>

              <div className="info-field">
                <span>Email Address</span>

                <strong className="break-value">
                  {payment.customerEmail || "Not available"}
                </strong>
              </div>
            </div>
          </section>

          {/* VEHICLE */}

          <section className="payment-info-card">
            <div className="info-card-header">
              <div className="info-card-icon">🚗</div>

              <div>
                <h2>Vehicle Information</h2>

                <p>Vehicle linked to this booking</p>
              </div>
            </div>

            <div className="info-fields">
              <div className="info-field">
                <span>Vehicle</span>

                <strong>{payment.vehicleName || "Not available"}</strong>
              </div>

              <div className="info-field">
                <span>Registration Number</span>

                <strong>{payment.registrationNumber || "Not available"}</strong>
              </div>
            </div>
          </section>

          {/* SERVICE */}

          <section className="payment-info-card">
            <div className="info-card-header">
              <div className="info-card-icon">🛠️</div>

              <div>
                <h2>Service Information</h2>

                <p>Service associated with booking</p>
              </div>
            </div>

            <div className="info-fields">
              <div className="info-field">
                <span>Service</span>

                <strong>{payment.serviceName || "Not available"}</strong>
              </div>

              <div className="info-field">
                <span>Package</span>

                <strong>{payment.packageName || "Not available"}</strong>
              </div>
            </div>
          </section>

          {/* PAYMENT */}

          <section className="payment-info-card">
            <div className="info-card-header">
              <div className="info-card-icon payment-icon">₹</div>

              <div>
                <h2>Payment Information</h2>

                <p>Transaction details</p>
              </div>
            </div>

            <div className="info-fields">
              <div className="info-field">
                <span>Amount</span>

                <strong className="amount-highlight">
                  ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="info-field">
                <span>Payment Method</span>

                <strong>{formatMethod(payment.paymentMethod)}</strong>
              </div>

              <div className="info-field">
                <span>Transaction ID</span>

                <strong className="break-value">
                  {payment.transactionId || "Not available"}
                </strong>
              </div>

              <div className="info-field">
                <span>Payment Status</span>

                <strong>{formatStatus(payment.paymentStatus)}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* ===================================================
            TIMELINE
        =================================================== */}

        <section className="payment-section-card">
          <div className="section-heading">
            <div>
              <h2>Payment Timeline</h2>

              <p>Payment lifecycle and timestamps</p>
            </div>
          </div>

          <div className="payment-timeline">
            <div className="timeline-item">
              <div className="timeline-marker">
                <span></span>
              </div>

              <div className="timeline-content">
                <span className="timeline-label">Payment Created</span>

                <strong>{formatDateTime(payment.createdAt)}</strong>
              </div>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item">
              <div className="timeline-marker">
                <span></span>
              </div>

              <div className="timeline-content">
                <span className="timeline-label">Payment Date</span>

                <strong>{formatDateTime(payment.paymentDate)}</strong>
              </div>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item">
              <div className="timeline-marker">
                <span></span>
              </div>

              <div className="timeline-content">
                <span className="timeline-label">Paid At</span>

                <strong>{formatDateTime(payment.paidAt)}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            BOOKING
        =================================================== */}

        <section className="payment-section-card">
          <div className="section-heading">
            <div>
              <h2>Booking Information</h2>

              <p>Booking associated with this payment</p>
            </div>
          </div>

          <div className="booking-details-grid">
            <div className="booking-detail">
              <span>Booking ID</span>

              <strong>#{payment.bookingId || "N/A"}</strong>
            </div>

            <div className="booking-detail">
              <span>Booking Date</span>

              <strong>{formatDate(payment.bookingDate)}</strong>
            </div>

            <div className="booking-detail">
              <span>Booking Status</span>

              <strong>{formatStatus(payment.bookingStatus)}</strong>
            </div>
          </div>
        </section>

        {/* ===================================================
            FOOTER ACTIONS
        =================================================== */}

        <div className="payment-page-footer">
          <button
            className="payment-secondary-btn"
            onClick={() => navigate("/admin/payments")}
          >
            ← Back to Payments
          </button>

          <button
            type="button"
            className="payment-primary-btn"
            onClick={handleDownloadReceipt}
            disabled={downloading}
          >
            {downloading ? "Generating PDF..." : "↓ Download Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentDetails;
