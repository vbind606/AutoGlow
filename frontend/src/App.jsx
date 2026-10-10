import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "./App.css";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Services from "./pages/Services";
import Packages from "./pages/Packages";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Navbar from "./components/Navbar";

// =========================================================
// CUSTOMER PAGES
// =========================================================

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import MyVehicles from "./pages/customer/MyVehicles";
import BookService from "./pages/customer/BookService";
import MyBookings from "./pages/customer/MyBookings";
import VehicleDetails from "./pages/customer/VehicleDetails";
import BookingDetails from "./pages/customer/BookingDetails";
import ServiceTracking from "./pages/customer/ServiceTracking";
import Payments from "./pages/customer/Payments";
import ServiceHistory from "./pages/customer/ServiceHistory";
import Invoice from "./pages/customer/Invoice";
import Offers from "./pages/customer/Offers";
import Reviews from "./pages/customer/Reviews";
import Notifications from "./pages/customer/Notifications";
import Profile from "./pages/customer/Profile";
import Settings from "./pages/customer/Settings";

// =========================================================
// ADMIN PAGES
// =========================================================

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetails from "./pages/admin/AdminCustomerDetails";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBookingDetails from "./pages/admin/AdminBookingDetails";
import AdminBookingManagement from "./pages/admin/AdminBookingManagement";
import AdminServices from "./pages/admin/AdminServices";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminWorkers from "./pages/admin/AdminWorkers";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPaymentDetails from "./pages/admin/AdminPaymentDetails";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminAIInspection from "./pages/admin/AdminAIInspection";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

// =========================================================
// ADMIN COMMON LAYOUT
// =========================================================

import AdminLayout from "./components/admin/AdminLayout";

// =========================================================
// WORKER COMMON LAYOUT
// =========================================================

import WorkerLayout from "./components/WorkerLayout";

// =========================================================
// WORKER PAGES
// =========================================================

import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerJobs from "./pages/worker/WorkerJobs";
import JobDetails from "./pages/worker/JobDetails";

import WorkerAIInspectionHome from "./pages/worker/WorkerAIInspectionHome";
import WorkerInspection from "./pages/worker/WorkerInspection";

import Washing from "./pages/worker/Washing";
import ServiceProgress from "./pages/worker/ServiceProgress";
import ServiceProgressHome from "./pages/worker/ServiceProgressHome";

import WorkerIssuesHome from "./pages/worker/WorkerIssuesHome";
import WorkerIssues from "./pages/worker/WorkerIssues";

import WorkerChecklistHome from "./pages/worker/WorkerChecklistHome";
import ServiceChecklist from "./pages/worker/ServiceChecklist";

import WorkerAttendance from "./pages/worker/WorkerAttendance";
import WorkerProfile from "./pages/worker/WorkerProfile";
import WorkerSettings from "./pages/worker/WorkerSettings";
import WorkerNotifications from "./pages/worker/WorkerNotifications";

// =========================================================
// APP LAYOUT
// =========================================================

function AppLayout() {
  const location = useLocation();

  /*
   * Public pages show main Navbar.
   *
   * Customer / Admin / Worker pages
   * have their own layout.
   */

  const isDashboard =
    location.pathname.startsWith("/customer") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/worker");

  return (
    <>
      {!isDashboard && <Navbar />}

      <Routes>
        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/services" element={<Services />} />

        <Route path="/packages" element={<Packages />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        {/* =====================================================
            CUSTOMER ROUTES
        ===================================================== */}

        <Route path="/customer/dashboard" element={<CustomerDashboard />} />

        <Route path="/customer/vehicles" element={<MyVehicles />} />

        <Route path="/customer/vehicles/:id" element={<VehicleDetails />} />

        <Route path="/customer/book" element={<BookService />} />

        <Route path="/customer/bookings" element={<MyBookings />} />

        <Route path="/customer/bookings/:id" element={<BookingDetails />} />

        <Route
          path="/customer/bookings/:id/tracking"
          element={<ServiceTracking />}
        />

        <Route path="/customer/service-history" element={<ServiceHistory />} />

        <Route path="/customer/payments/:id" element={<Payments />} />

        <Route path="/customer/invoices/:id" element={<Invoice />} />

        <Route path="/customer/offers" element={<Offers />} />

        <Route path="/customer/reviews" element={<Reviews />} />

        <Route path="/customer/notifications" element={<Notifications />} />

        <Route path="/customer/profile" element={<Profile />} />

        <Route path="/customer/settings" element={<Settings />} />

        {/* =====================================================
            ADMIN ROUTES

            IMPORTANT:
            All admin pages are inside AdminLayout.

            AdminLayout contains:
            - AdminSidebar
            - AdminHeader
            - Outlet

            Individual pages contain ONLY their page content.
        ===================================================== */}

        <Route path="/admin" element={<AdminLayout />}>
          {/* Dashboard */}
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Customers */}
          <Route path="customers" element={<AdminCustomers />} />

          <Route
            path="customers/:id/details"
            element={<AdminCustomerDetails />}
          />

          {/* Vehicles */}
          <Route path="vehicles" element={<AdminVehicles />} />

          {/* Bookings */}
          <Route path="bookings" element={<AdminBookings />} />

          <Route path="bookings/:id" element={<AdminBookingDetails />} />

          <Route
            path="bookings/:id/manage"
            element={<AdminBookingManagement />}
          />

          {/* Services */}
          <Route path="services" element={<AdminServices />} />

          {/* Packages */}
          <Route path="packages" element={<AdminPackages />} />

          {/* Workers */}
          <Route path="workers" element={<AdminWorkers />} />

          {/* Attendance */}
          <Route path="attendance" element={<AdminAttendance />} />

          {/* Payments */}
          <Route path="payments" element={<AdminPayments />} />

          <Route path="payments/:id" element={<AdminPaymentDetails />} />

          {/* Invoices */}
          <Route path="invoices" element={<AdminInvoices />} />

          {/* Coupons */}
          <Route path="coupons" element={<AdminCoupons />} />

          {/* Reviews */}
          <Route path="reviews" element={<AdminReviews />} />

          {/* Gallery */}
          <Route path="gallery" element={<AdminGallery />} />

          {/* AI Inspection */}
          <Route path="ai-inspection" element={<AdminAIInspection />} />

          {/* Reports */}
          <Route path="reports" element={<AdminReports />} />

          {/* Settings */}
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* =====================================================
            WORKER ROUTES
        ===================================================== */}

        {/* Worker Dashboard */}
        <Route
          path="/worker/dashboard"
          element={
            <WorkerLayout>
              <WorkerDashboard />
            </WorkerLayout>
          }
        />

        {/* Worker Jobs */}
        <Route
          path="/worker/jobs"
          element={
            <WorkerLayout>
              <WorkerJobs />
            </WorkerLayout>
          }
        />

        {/* Worker Job Details */}
        <Route
          path="/worker/job-details/:bookingId"
          element={
            <WorkerLayout>
              <JobDetails />
            </WorkerLayout>
          }
        />

        {/* Worker AI Inspection Home */}
        <Route
          path="/worker/ai-inspection"
          element={
            <WorkerLayout>
              <WorkerAIInspectionHome />
            </WorkerLayout>
          }
        />

        {/* Worker AI Inspection */}
        <Route
          path="/worker/ai-inspection/:bookingId"
          element={
            <WorkerLayout>
              <WorkerInspection />
            </WorkerLayout>
          }
        />

        {/* Worker Washing */}
        <Route
          path="/worker/washing/:bookingId"
          element={
            <WorkerLayout>
              <Washing />
            </WorkerLayout>
          }
        />

        {/* Worker Inspection */}
        <Route
          path="/worker/inspection/:bookingId"
          element={
            <WorkerLayout>
              <WorkerInspection />
            </WorkerLayout>
          }
        />
        <Route
          path="/worker/service-progress"
          element={
            <WorkerLayout>
              <ServiceProgressHome />
            </WorkerLayout>
          }
        />

        {/* Worker Service Progress */}
        <Route
          path="/worker/service-progress/:bookingId"
          element={
            <WorkerLayout>
              <ServiceProgress />
            </WorkerLayout>
          }
        />

        {/* Worker Issues Home */}
        <Route
          path="/worker/issues"
          element={
            <WorkerLayout>
              <WorkerIssuesHome />
            </WorkerLayout>
          }
        />

        {/* Worker Individual Issues */}
        <Route
          path="/worker/issues/:bookingId"
          element={
            <WorkerLayout>
              <WorkerIssues />
            </WorkerLayout>
          }
        />

        {/* Worker Checklist Home */}
        <Route
          path="/worker/checklist"
          element={
            <WorkerLayout>
              <WorkerChecklistHome />
            </WorkerLayout>
          }
        />

        {/* Worker Individual Checklist */}
        <Route
          path="/worker/checklist/:bookingId"
          element={
            <WorkerLayout>
              <ServiceChecklist />
            </WorkerLayout>
          }
        />

        {/* Worker Attendance */}
        <Route
          path="/worker/attendance"
          element={
            <WorkerLayout>
              <WorkerAttendance />
            </WorkerLayout>
          }
        />
        {/* Worker Profile */}
        <Route
          path="/worker/profile"
          element={
            <WorkerLayout>
              <WorkerProfile />
            </WorkerLayout>
          }
        />
        <Route
          path="/worker/settings"
          element={
            <WorkerLayout>
              <WorkerSettings />
            </WorkerLayout>
          }
        />
        <Route
          path="/worker/notifications"
          element={
            <WorkerLayout>
              <WorkerNotifications />
            </WorkerLayout>
          }
        />
      </Routes>
    </>
  );
}

// =========================================================
// MAIN APP
// =========================================================

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
