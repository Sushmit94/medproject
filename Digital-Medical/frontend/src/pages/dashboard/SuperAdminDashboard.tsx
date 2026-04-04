import { useState, useEffect } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, MapPin, Tag, FileText,
  Megaphone, Newspaper, CalendarDays, Bell, Settings, LogOut,
  Menu, X, TrendingUp, Clock, CheckCircle, XCircle,
  UserPlus, Shield, Image, MessageSquare, ShieldCheck, Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/lib/services";

// Page Imports
import UsersPage from "./admin/UsersPage";
import BusinessesPage from "./admin/BusinessesPage";
import CategoriesPage from "./admin/CategoriesPage";
import LocationsPage from "./admin/LocationsPage";
import AdminLicensesPage from "./admin/LicensesPage";
import AdsPage from "./admin/AdsPage";
import ContentPage from "./admin/ContentPage";
import CampsPage from "./admin/CampsPage";
import GalleryPage from "./admin/GalleryPage";
import AdminNotificationsPage from "./admin/NotificationsPage";
import AdminSettingsPage from "./admin/SettingsPage";
import ReviewsPage from "./admin/ReviewsPage";
import TpaInsuranceAdminPage from "./admin/TpaInsurancePage";
import AdminPsuPage from "./admin/PsuPage";
import AdminAccreditationPage from "./admin/AccreditationPage";

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const sections = [
    {
      title: "Overview",
      links: [
        { to: "/super-admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
      ],
    },
    {
      title: "Management",
      links: [
        { to: "/super-admin/users", icon: Users, label: "Users" },
        { to: "/super-admin/businesses", icon: Building2, label: "Businesses" },
        { to: "/super-admin/categories", icon: Tag, label: "Categories" },
        { to: "/super-admin/locations", icon: MapPin, label: "Locations" },
        { to: "/super-admin/licenses", icon: FileText, label: "Licenses" },
        { to: "/super-admin/tpa-insurance", icon: ShieldCheck, label: "TPA & Insurance" },
        { to: "/super-admin/psu", icon: Building2, label: "PSU Organizations" },
        { to: "/super-admin/accreditation", icon: Award, label: "Accreditations" },
        { to: "/super-admin/reviews", icon: MessageSquare, label: "Reviews" },
      ],
    },
    {
      title: "Content",
      links: [
        { to: "/super-admin/ads", icon: Megaphone, label: "Advertisements" },
        { to: "/super-admin/news", icon: Newspaper, label: "News & Blogs" },
        { to: "/super-admin/camps", icon: CalendarDays, label: "Camps & Events" },
        { to: "/super-admin/gallery", icon: Image, label: "Gallery" },
        { to: "/super-admin/notifications", icon: Bell, label: "Notifications" },
      ],
    },
    {
      title: "System",
      links: [
        { to: "/super-admin/settings", icon: Settings, label: "Settings" },
      ],
    },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to) && to !== "/super-admin";

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-slate-300 z-50 transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              <span className="font-bold text-white text-sm">Admin Panel</span>
            </Link>
            <button onClick={onClose} className="lg:hidden text-slate-400"><X size={20} /></button>
          </div>
        </div>

        <nav className="p-3 space-y-5 overflow-y-auto h-[calc(100vh-140px)]">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{section.title}</p>
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const exact = "exact" in link ? link.exact : false;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-lg transition-all ${isActive(link.to, exact) || (exact && location.pathname === link.to)
                        ? "bg-primary/20 text-primary font-medium"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                      <Icon size={17} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={() => { logout(); navigate("/super-admin/login"); }}
            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full"
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function AdminDashboardHome() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.dashboard()
      .then((res) => setStats(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { key: "totalUsers", label: "Total Users", icon: Users, color: "text-blue-500 bg-blue-50" },
    { key: "totalBusinesses", label: "Businesses", icon: Building2, color: "text-green-500 bg-green-50" },
    { key: "pendingBusinesses", label: "Pending Approval", icon: Clock, color: "text-yellow-500 bg-yellow-50" },
    { key: "activeBusinesses", label: "Active", icon: CheckCircle, color: "text-emerald-500 bg-emerald-50" },
    { key: "totalCategories", label: "Categories", icon: Tag, color: "text-purple-500 bg-purple-50" },
    { key: "totalOrderInquiries", label: "Order Inquiries", icon: TrendingUp, color: "text-orange-500 bg-orange-50" },
    { key: "totalReviews", label: "Reviews", icon: UserPlus, color: "text-pink-500 bg-pink-50" },
    { key: "totalJobs", label: "Jobs Posted", icon: FileText, color: "text-indigo-500 bg-indigo-50" },
    { key: "totalBloodDonors", label: "Blood Donors", icon: Users, color: "text-red-500 bg-red-50" },
    { key: "totalCamps", label: "Camps", icon: CalendarDays, color: "text-teal-500 bg-teal-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Overview of Digital Medical platform</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 animate-pulse">
              <div className="w-10 h-10 bg-surface-tertiary rounded-xl" />
              <div className="h-7 bg-surface-tertiary rounded mt-3 w-16" />
              <div className="h-4 bg-surface-tertiary rounded mt-1 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <div key={s.key} className="bg-white rounded-xl border border-border-light p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-text-primary mt-3">{stats?.[s.key] ?? 0}</p>
              <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Manage Users", to: "/super-admin/users", icon: Users, color: "bg-blue-50 text-blue-600" },
              { label: "Pending Businesses", to: "/super-admin/businesses", icon: Clock, color: "bg-yellow-50 text-yellow-600" },
              { label: "Add Location", to: "/super-admin/locations", icon: MapPin, color: "bg-green-50 text-green-600" },
              { label: "Manage Ads", to: "/super-admin/ads", icon: Megaphone, color: "bg-purple-50 text-purple-600" },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex flex-col items-center justify-center p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity`}
              >
                <action.icon size={24} />
                <span className="text-xs font-medium mt-2">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-light p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Recent Activity</h3>
          <div className="flex items-center justify-center py-10 text-text-tertiary">
            <p className="text-sm">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border-light px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-text-secondary hover:bg-surface-tertiary rounded-lg">
            <Menu size={20} />
          </button>
          <div />
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-text-secondary hover:bg-surface-tertiary rounded-lg">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route index element={<AdminDashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="businesses" element={<BusinessesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="licenses" element={<AdminLicensesPage />} />
            <Route path="tpa-insurance" element={<TpaInsuranceAdminPage />} />
            <Route path="psu" element={<AdminPsuPage />} />
            <Route path="accreditation" element={<AdminAccreditationPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="ads" element={<AdsPage />} />
            <Route path="news" element={<ContentPage />} />
            <Route path="camps" element={<CampsPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}