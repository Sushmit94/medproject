import { useState } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, FileText, Users, Package, ShoppingCart,
  Bell, Star, Settings, LogOut, Menu, X, ChevronRight,
  Clock, CheckCircle, AlertTriangle, Image, Ticket, Handshake, Stethoscope, Truck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePage from "./business/ProfilePage";
import LicensesPage from "./business/LicensesPage";
import StaffPage from "./business/StaffPage";
import ProductsPage from "./business/ProductsPage";
import OrdersPage from "./business/OrdersPage";
import ReviewsPage from "./business/ReviewsPage";
import NotificationsPage from "./business/NotificationsPage";
import SettingsPage from "./business/SettingsPage";
import CouponsPage from "./business/CouponsPage";
import DealsPage from "./business/DealsPage";
import ServicesPage from "./business/ServicesPage";
import SuppliersPage from "./business/SuppliersPage";
import SupplierDetailPage from "./business/SupplierDetailPage";

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { logout, business } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/business", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/business/profile", icon: Building2, label: "Business Profile" },
    { to: "/business/licenses", icon: FileText, label: "Licenses" },
    { to: "/business/staff", icon: Users, label: "Staff" },
    ...(business?.category?.hasDealsIn ? [{ to: "/business/deals", icon: Handshake, label: "Deals In" }] : []),
    ...(business?.category?.hasProducts ? [{ to: "/business/products", icon: Package, label: "Products" }] : []),
    ...(business?.category?.hasServices ? [{ to: "/business/services", icon: Stethoscope, label: "Services" }] : []),
    ...(business?.supplyChainRole === "RETAILER" || business?.supplyChainRole === "WHOLESALER" ? [{ to: "/business/suppliers", icon: Truck, label: "Suppliers" }] : []),
    { to: "/business/orders", icon: ShoppingCart, label: "Inquiries" },
    { to: "/business/coupons", icon: Ticket, label: "Coupons" },
    { to: "/business/reviews", icon: Star, label: "Reviews" },
    { to: "/business/notifications", icon: Bell, label: "Notifications" },
    { to: "/business/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);


  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-border z-50 flex flex-col transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-border-light">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo-icon.png" alt="DM" className="w-8 h-8" />
              <span className="font-bold text-primary text-sm">Digital Medical</span>
            </Link>
            <button onClick={onClose} className="lg:hidden text-text-tertiary"><X size={20} /></button>
          </div>
          {business && (
            <div className="mt-4 p-3 bg-accent/5 rounded-xl">
              <p className="text-sm font-semibold text-text-primary truncate">{business.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">ID: {business.businessId}</p>
              <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${business.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                business.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                  business.status === "DISABLED" ? "bg-slate-100 text-slate-600" :
                    "bg-red-100 text-red-700"
                }`}>{business.status}</span>
            </div>
          )}
        </div>

        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label, exact }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-xl transition-all ${isActive(to, exact)
                ? "bg-accent/10 text-accent font-semibold"
                : "text-text-secondary hover:bg-surface-tertiary"
                }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border-light">
          <button
            onClick={() => { logout(); navigate("/business/login"); }}
            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function DashboardHome() {
  const { business } = useAuth();

  const stats = [
    { label: "Profile Views", value: "0", icon: Building2, color: "text-primary bg-primary/10" },
    { label: "Inquiries", value: "0", icon: ShoppingCart, color: "text-accent bg-accent/10" },
    { label: "Reviews", value: "0", icon: Star, color: "text-yellow-500 bg-yellow-50" },
    { label: "Staff Members", value: "0", icon: Users, color: "text-green-500 bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Welcome to your business portal</p>
      </div>

      {business?.status === "PENDING" && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <Clock size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Approval Pending</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Your business profile is under review. You'll be notified once approved.
            </p>
          </div>
        </div>
      )}

      {business?.status === "ACTIVE" && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Business Active</p>
            <p className="text-xs text-green-700 mt-0.5">Your listing is live. Complete your profile to get more visibility.</p>
          </div>
        </div>
      )}

      {business?.status === "REJECTED" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Business Rejected</p>
            <p className="text-xs text-red-700 mt-0.5">Please contact support for more information.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border-light p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-text-primary mt-3">{s.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Complete Your Profile", to: "/business/profile", desc: "Add photos, timings, and more" },
              { label: "Upload Licenses", to: "/business/licenses", desc: "Add drug license, GST certificate" },
              { label: "Add Staff Members", to: "/business/staff", desc: "Manage your team" },
              { label: "Add Products", to: "/business/products", desc: "List your products (Manufacturers/Wholesalers)" },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-tertiary transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{action.label}</p>
                  <p className="text-xs text-text-tertiary">{action.desc}</p>
                </div>
                <ChevronRight size={16} className="text-text-tertiary group-hover:text-primary transition-colors" />
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

export default function BusinessDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        {/* Top bar */}
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border-light px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-text-secondary hover:bg-surface-tertiary rounded-lg">
            <Menu size={20} />
          </button>
          <div />
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-text-secondary hover:bg-surface-tertiary rounded-lg">
              <Bell size={18} />
            </button>
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-border-light">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-text-primary hidden sm:block">
                  {user.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-w-6xl mx-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="licenses" element={<LicensesPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="suppliers/:supplierId" element={<SupplierDetailPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
