import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ProtectedRoute from "@/components/common/ProtectedRoute";

/* Lazy-loaded pages */
const HomePage = lazy(() => import("@/pages/HomePage"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const DetailPage = lazy(() => import("@/pages/DetailPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const CampsEventsPage = lazy(() => import("@/pages/CampsEventsPage"));
const NewsPage = lazy(() => import("@/pages/NewsPage"));
const ForBusinessPage = lazy(() => import("@/pages/ForBusinessPage"));
const BloodBankPage = lazy(() => import("@/pages/services/BloodBankPage"));
const JobsPage = lazy(() => import("@/pages/services/JobsPage"));
const EmergencyPage = lazy(() => import("@/pages/services/EmergencyPage"));
const HealthDepartmentsPage = lazy(() => import("@/pages/services/HealthDepartmentsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const JobDetailPage = lazy(() => import("@/pages/JobDetailPage"));
const CampDetailPage = lazy(() => import("@/pages/CampDetailPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

/* Auth pages */
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignupPage = lazy(() => import("@/pages/auth/SignupPage"));
const BusinessLoginPage = lazy(() => import("@/pages/auth/BusinessLoginPage"));
const BusinessSignupPage = lazy(() => import("@/pages/auth/BusinessSignupPage"));
const SuperAdminLoginPage = lazy(() => import("@/pages/auth/SuperAdminLoginPage"));

/* Dashboard pages */
const BusinessDashboard = lazy(() => import("@/pages/dashboard/BusinessDashboard"));
const SuperAdminDashboard = lazy(() => import("@/pages/dashboard/SuperAdminDashboard"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/** Conditionally show Header/Footer — hide on dashboard & admin pages */
function AppLayout() {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith("/business") || pathname.startsWith("/super-admin");
  const isAdminLogin = pathname === "/super-admin/login";

  return (
    <div className="flex flex-col min-h-screen bg-white text-text-primary">
      {!isDashboard && !isAdminLogin && <Header />}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/listing/:slug" element={<DetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/camps-events" element={<CampsEventsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/for-business" element={<ForBusinessPage />} />
            <Route path="/services/blood" element={<BloodBankPage />} />
            <Route path="/services/jobs" element={<JobsPage />} />
            <Route path="/services/emergency" element={<EmergencyPage />} />
            <Route path="/services/health-departments" element={<HealthDepartmentsPage />} />
            <Route path="/services/jobs/:slug" element={<JobDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/camps-events/:slug" element={<CampDetailPage />} />

            {/* Auth pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/business/login" element={<BusinessLoginPage />} />
            <Route path="/business/signup" element={<BusinessSignupPage />} />
            <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />

            {/* Protected: Business Dashboard */}
            <Route
              path="/business/*"
              element={
                <ProtectedRoute roles={["BUSINESS"]} redirectTo="/business/login">
                  <BusinessDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected: Super Admin Dashboard */}
            <Route
              path="/super-admin/*"
              element={
                <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isDashboard && !isAdminLogin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: "14px", borderRadius: "8px" },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
