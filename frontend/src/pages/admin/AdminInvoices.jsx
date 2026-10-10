import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./AdminInvoices.css";

const AdminInvoices = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchInvoices();
  }, []);

  // =========================================================
  // GET ALL INVOICES
  // GET /api/admin/invoices
  // =========================================================

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/invoices");

      const data = response?.data;

      let invoiceList = [];

      // -----------------------------------------------------
      // DIRECT ARRAY
      // -----------------------------------------------------

      if (Array.isArray(data)) {
        invoiceList = data;
      }

      // -----------------------------------------------------
      // WRAPPED RESPONSE
      // -----------------------------------------------------
      else if (Array.isArray(data?.invoices)) {
        invoiceList = data.invoices;
      } else if (Array.isArray(data?.data)) {
        invoiceList = data.data;
      } else {
        console.warn("Unexpected invoice API response:", data);

        invoiceList = [];
      }

      // -----------------------------------------------------
      // NORMALIZE DATA
      // -----------------------------------------------------

      const normalizedInvoices = invoiceList.map(normalizeInvoice);

      setInvoices(normalizedInvoices);
    } catch (err) {
      console.error("Fetch invoices error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        err?.message ||
        "Unable to load invoices.";

      setError(
        typeof message === "string" ? message : "Unable to load invoices.",
      );

      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GET SINGLE INVOICE
  // GET /api/admin/invoices/{id}
  // =========================================================

  const fetchInvoiceDetails = async (id) => {
    if (!id) {
      setError("Invalid invoice ID.");
      return;
    }

    try {
      setDetailLoading(true);
      setError("");

      const response = await api.get(`/admin/invoices/${id}`);

      const data = response?.data;

      let invoice = data;

      // -----------------------------------------------------
      // HANDLE WRAPPED RESPONSE
      // -----------------------------------------------------

      if (data?.invoice) {
        invoice = data.invoice;
      } else if (data?.data && !Array.isArray(data.data)) {
        invoice = data.data;
      }

      // -----------------------------------------------------
      // NORMALIZE
      // -----------------------------------------------------

      setSelectedInvoice(normalizeInvoice(invoice));
    } catch (err) {
      console.error("Fetch invoice details error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        err?.message ||
        "Unable to load invoice details.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to load invoice details.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    setSelectedInvoice(null);
    setDetailLoading(false);
  };

  // =========================================================
  // STATUS LIST
  // =========================================================

  const statuses = useMemo(() => {
    const uniqueStatuses = [
      ...new Set(
        invoices
          .map((invoice) => String(invoice?.status || "").toUpperCase())
          .filter(Boolean),
      ),
    ];

    return ["ALL", ...uniqueStatuses];
  }, [invoices]);

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredInvoices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const currentStatus = String(invoice?.status || "").toUpperCase();

      // -----------------------------------------------------
      // STATUS FILTER
      // -----------------------------------------------------

      const statusMatch =
        statusFilter === "ALL" || currentStatus === statusFilter;

      if (!statusMatch) {
        return false;
      }

      // -----------------------------------------------------
      // NO SEARCH
      // -----------------------------------------------------

      if (!keyword) {
        return true;
      }

      // -----------------------------------------------------
      // SEARCHABLE DATA
      // -----------------------------------------------------

      const searchableData = [
        invoice?.invoiceNumber,

        invoice?.customerName,
        invoice?.customerEmail,

        invoice?.vehicleName,
        invoice?.registrationNumber,

        invoice?.serviceName,
        invoice?.packageName,

        invoice?.bookingId,

        invoice?.serviceDate,
        invoice?.serviceTime,

        invoice?.invoiceDate,
        invoice?.createdAt,

        invoice?.id,
      ];

      return searchableData
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [invoices, search, statusFilter]);

  // =========================================================
  // TOTAL AMOUNT
  // =========================================================

  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce(
      (total, invoice) =>
        total + Number(invoice?.totalAmount ?? invoice?.amount ?? 0),
      0,
    );
  }, [filteredInvoices]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="admin-invoices-page">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="invoice-header">
        <div>
          <h1>Invoices</h1>

          <p>Manage and view all customer invoices</p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={fetchInvoices}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          STATS
      ====================================================== */}

      <div className="invoice-stats">
        <div className="stat-card">
          <span>Total Invoices</span>

          <strong>{invoices.length}</strong>
        </div>

        <div className="stat-card">
          <span>Filtered Invoices</span>

          <strong>{filteredInvoices.length}</strong>
        </div>

        <div className="stat-card">
          <span>Total Value</span>

          <strong>₹{formatMoney(totalAmount)}</strong>
        </div>
      </div>

      {/* =====================================================
          SEARCH + FILTER
      ====================================================== */}

      <div className="invoice-toolbar">
        <input
          type="text"
          placeholder="Search invoice, customer, vehicle, service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === "ALL" ? "All Statuses" : status}
            </option>
          ))}
        </select>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="error-box">
          <span>{error}</span>

          <button type="button" onClick={fetchInvoices} disabled={loading}>
            {loading ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <div className="state-box">
          <h3>Loading invoices...</h3>

          <p>Please wait while invoice data is loading.</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        /* ===================================================
           EMPTY STATE
        ==================================================== */

        <div className="state-box">
          <h3>No invoices found</h3>

          <p>
            {invoices.length === 0
              ? "There are currently no invoices available."
              : "Try changing your search or status filter."}
          </p>

          {(search || statusFilter !== "ALL") && (
            <button
              type="button"
              className="refresh-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* ===================================================
           TABLE
        ==================================================== */

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>

                  <th>Customer</th>

                  <th>Vehicle</th>

                  <th>Service</th>

                  <th>Service Date</th>

                  <th>Amount</th>

                  <th>Status</th>

                  <th>Invoice Date</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id ?? invoice.invoiceNumber}>
                    {/* ===================================
                          INVOICE
                      ==================================== */}

                    <td>
                      <strong>
                        {invoice.invoiceNumber || `#${invoice.id ?? "-"}`}
                      </strong>

                      <small>Booking #{invoice.bookingId ?? "-"}</small>
                    </td>

                    {/* ===================================
                          CUSTOMER
                      ==================================== */}

                    <td>
                      <strong>{invoice.customerName || "-"}</strong>

                      <small>{invoice.customerEmail || "-"}</small>
                    </td>

                    {/* ===================================
                          VEHICLE
                      ==================================== */}

                    <td>
                      <strong>{invoice.vehicleName || "Vehicle"}</strong>

                      <small>{invoice.registrationNumber || "-"}</small>
                    </td>

                    {/* ===================================
                          SERVICE
                      ==================================== */}

                    <td>
                      <strong>{invoice.serviceName || "-"}</strong>

                      {invoice.packageName && (
                        <small>{invoice.packageName}</small>
                      )}
                    </td>

                    {/* ===================================
                          SERVICE DATE
                      ==================================== */}

                    <td>
                      <strong>{formatServiceDate(invoice.serviceDate)}</strong>

                      {invoice.serviceTime && (
                        <small>{formatServiceTime(invoice.serviceTime)}</small>
                      )}
                    </td>

                    {/* ===================================
                          AMOUNT
                      ==================================== */}

                    <td>
                      <strong>
                        ₹{formatMoney(invoice.totalAmount ?? invoice.amount)}
                      </strong>

                      {invoice.amount !== null &&
                        invoice.amount !== undefined && (
                          <small>Base ₹{formatMoney(invoice.amount)}</small>
                        )}
                    </td>

                    {/* ===================================
                          STATUS
                      ==================================== */}

                    <td>
                      <span
                        className={`status ${getStatusClass(invoice.status)}`}
                      >
                        {invoice.status || "UNKNOWN"}
                      </span>
                    </td>

                    {/* ===================================
                          INVOICE DATE
                      ==================================== */}

                    <td>
                      {formatDateTime(invoice.invoiceDate || invoice.createdAt)}
                    </td>

                    {/* ===================================
                          ACTION
                      ==================================== */}

                    <td>
                      <button
                        type="button"
                        className="view-btn"
                        onClick={() => fetchInvoiceDetails(invoice.id)}
                        disabled={detailLoading}
                      >
                        {detailLoading ? "Loading..." : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      {(selectedInvoice || detailLoading) && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="state-box">
                <h3>Loading invoice details...</h3>

                <p>Please wait.</p>
              </div>
            ) : selectedInvoice ? (
              <>
                {/* =========================================
                    MODAL HEADER
                ========================================== */}

                <div className="modal-header">
                  <div>
                    <h2>
                      {selectedInvoice.invoiceNumber ||
                        `Invoice #${selectedInvoice.id ?? "-"}`}
                    </h2>

                    <p>Booking #{selectedInvoice.bookingId ?? "-"}</p>
                  </div>

                  <button
                    type="button"
                    className="close-btn"
                    onClick={closeModal}
                    aria-label="Close invoice details"
                  >
                    ×
                  </button>
                </div>

                {/* =========================================
                    DETAILS
                ========================================== */}

                <div className="detail-grid">
                  {/* CUSTOMER */}

                  <Detail
                    label="Customer"
                    value={selectedInvoice.customerName}
                  />

                  {/* EMAIL */}

                  <Detail label="Email" value={selectedInvoice.customerEmail} />

                  {/* VEHICLE */}

                  <Detail label="Vehicle" value={selectedInvoice.vehicleName} />

                  {/* REGISTRATION */}

                  <Detail
                    label="Registration Number"
                    value={selectedInvoice.registrationNumber}
                  />

                  {/* SERVICE */}

                  <Detail label="Service" value={selectedInvoice.serviceName} />

                  {/* PACKAGE */}

                  <Detail label="Package" value={selectedInvoice.packageName} />

                  {/* =====================================
                      SERVICE DATE
                  ====================================== */}

                  <Detail
                    label="Service Date"
                    value={formatServiceDate(selectedInvoice.serviceDate)}
                  />

                  {/* =====================================
                      SERVICE TIME
                  ====================================== */}

                  <Detail
                    label="Service Time"
                    value={formatServiceTime(selectedInvoice.serviceTime)}
                  />

                  {/* =====================================
                      INVOICE DATE
                  ====================================== */}

                  <Detail
                    label="Invoice Date"
                    value={formatDateTime(selectedInvoice.invoiceDate)}
                  />

                  {/* =====================================
                      CREATED AT
                  ====================================== */}

                  <Detail
                    label="Created At"
                    value={formatDateTime(selectedInvoice.createdAt)}
                  />

                  {/* =====================================
                      STATUS
                  ====================================== */}

                  <Detail label="Status" value={selectedInvoice.status} />
                </div>

                {/* =========================================
                    AMOUNTS
                ========================================== */}

                <div className="amount-box">
                  <div>
                    <span>Base Amount</span>

                    <strong>₹{formatMoney(selectedInvoice.amount)}</strong>
                  </div>

                  <div>
                    <span>Total Amount</span>

                    <strong>₹{formatMoney(selectedInvoice.totalAmount)}</strong>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================
// NORMALIZE INVOICE
// =========================================================

const normalizeInvoice = (invoice) => {
  if (!invoice || typeof invoice !== "object") {
    return {};
  }

  return {
    ...invoice,

    id: invoice.id ?? invoice.invoiceId ?? null,

    invoiceNumber: invoice.invoiceNumber ?? invoice.invoiceNo ?? "",

    bookingId: invoice.bookingId ?? null,

    customerName: invoice.customerName ?? invoice.customer?.name ?? "",

    customerEmail: invoice.customerEmail ?? invoice.customer?.email ?? "",

    vehicleName: invoice.vehicleName ?? invoice.vehicle?.name ?? "",

    registrationNumber:
      invoice.registrationNumber ?? invoice.vehicle?.registrationNumber ?? "",

    serviceName: invoice.serviceName ?? invoice.service?.name ?? "",

    packageName: invoice.packageName ?? invoice.servicePackage?.name ?? "",

    amount: invoice.amount ?? 0,

    totalAmount: invoice.totalAmount ?? invoice.amount ?? 0,

    // -------------------------------------------------------
    // VERY IMPORTANT
    // serviceDate comes from Booking.bookingDate
    // serviceTime comes from Booking.bookingTime
    // -------------------------------------------------------

    serviceDate: invoice.serviceDate ?? invoice.bookingDate ?? "",

    serviceTime: invoice.serviceTime ?? invoice.bookingTime ?? "",

    invoiceDate: invoice.invoiceDate ?? "",

    createdAt: invoice.createdAt ?? "",

    status: invoice.status ?? "",
  };
};

// =========================================================
// DETAIL COMPONENT
// =========================================================

const Detail = ({ label, value }) => {
  return (
    <div className="detail-item">
      <span>{label}</span>

      <strong>
        {value !== null && value !== undefined && String(value).trim() !== ""
          ? value
          : "-"}
      </strong>
    </div>
  );
};

// =========================================================
// FORMAT MONEY
// =========================================================

const formatMoney = (value) => {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "0.00";
  }

  return numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// =========================================================
// FORMAT SERVICE DATE
// =========================================================
// IMPORTANT:
// LocalDate from Spring comes as:
// "2026-09-08"
//
// We DON'T use new Date("2026-09-08")
// because timezone conversion can show
// the previous day in India/browser.
// =========================================================

const formatServiceDate = (value) => {
  if (!value) {
    return "-";
  }

  const stringValue = String(value);

  // -------------------------------------------------------
  // LocalDate: YYYY-MM-DD
  // -------------------------------------------------------

  const dateOnlyMatch = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;

    return `${day} ${getMonthName(Number(month))} ${year}`;
  }

  // -------------------------------------------------------
  // ISO DATETIME
  // -------------------------------------------------------

  const date = new Date(stringValue);

  if (Number.isNaN(date.getTime())) {
    return stringValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =========================================================
// FORMAT SERVICE TIME
// =========================================================

const formatServiceTime = (value) => {
  if (!value) {
    return "-";
  }

  const stringValue = String(value);

  // -------------------------------------------------------
  // LocalTime from Spring:
  // "10:30:00"
  // -------------------------------------------------------

  const timeMatch = stringValue.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (timeMatch) {
    const hours = Number(timeMatch[1]);

    const minutes = Number(timeMatch[2]);

    const suffix = hours >= 12 ? "PM" : "AM";

    const displayHour = hours % 12 || 12;

    return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
  }

  return stringValue;
};

// =========================================================
// FORMAT INVOICE DATETIME
// =========================================================

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =========================================================
// MONTH NAME
// =========================================================

const getMonthName = (month) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months[month - 1] || "";
};

// =========================================================
// STATUS CLASS
// =========================================================

const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("paid") ||
    value.includes("success") ||
    value.includes("completed")
  ) {
    return "success";
  }

  if (value.includes("pending") || value.includes("unpaid")) {
    return "warning";
  }

  if (
    value.includes("cancel") ||
    value.includes("fail") ||
    value.includes("refund")
  ) {
    return "danger";
  }

  return "neutral";
};

export default AdminInvoices;
