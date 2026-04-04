import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, FileText, Users, Package, ShoppingCart,
  Bell, Star, Settings, LogOut, Menu, X, ChevronRight,
  Clock, CheckCircle, Handshake, Stethoscope, Truck,
  Ticket, Briefcase, Tent, User, Link2, Check, XCircle,
  ShieldCheck, // Added ShieldCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isProfessional } from "@/utils/categoryHelpers";
import {
  staffLinkService,
  notificationService,
  type StaffLinkRequest,
  type StaffMember,
} from "@/lib/services";
import { UnsavedChangesProvider, useUnsavedChangesContext } from "@/contexts/UnsavedChangesContext";
import UnsavedChangesModal from "@/components/common/UnsavedChangesModal";

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
import LinkedBusinessPage from "./business/LinkedBusinessPage";
import BusinessTpaInsurancePage from "./business/TpaInsurancePage"; // Added Import

/* ── Notification unread count ── */
function useUnreadCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const fetchCount = () => {
      notificationService.list("limit=1")
        .then((res) => setCount(res.unreadCount ?? 0))
        .catch(() => { });
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);
  return count;
}

function UnreadBadge() {
  const count = useUnreadCount();
  if (count === 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ── Sidebar — uses guardedNavigate ── */
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { logout, business } = useAuth();
  const navigate = useNavigate();
  const { guardedNavigate } = useUnsavedChangesContext();

  const isProf = isProfessional(business?.category?.slug);

  const links = isProf
    ? [
      { to: "/business", icon: LayoutDashboard, label: "Dashboard", exact: true },
      { to: "/business/profile", icon: User, label: "Personal Profile" },
      { to: "/business/linked", icon: Link2, label: "Linked Business" },
      { to: "/business/notifications", icon: Bell, label: "Notifications" },
      { to: "/business/settings", icon: Settings, label: "Settings" },
    ]
    : [
      { to: "/business", icon: LayoutDashboard, label: "Dashboard", exact: true },
      { to: "/business/profile", icon: Building2, label: "Business Profile" },
      { to: "/business/licenses", icon: FileText, label: "Licenses" },
      { to: "/business/staff", icon: Users, label: "Staff" },
      // Added TPA & Insurance conditional link
      ...(business?.category?.slug === "hospitals-clinics" ? [{ to: "/business/tpa-insurance", icon: ShieldCheck, label: "TPA & Insurance" }] : []),
      ...(business?.category?.hasDealsIn ? [{ to: "/business/deals", icon: Handshake, label: "Deals In" }] : []),
      ...(business?.category?.hasProducts ? [{ to: "/business/products", icon: Package, label: "Products" }] : []),
      ...(business?.category?.hasServices ? [{ to: "/business/services", icon: Stethoscope, label: "Services" }] : []),
      ...(business?.supplyChainRole === "RETAILER" || business?.supplyChainRole === "WHOLESALER"
        ? [{ to: "/business/suppliers", icon: Truck, label: "Suppliers" }]
        : []),
      ...(business?.category?.slug !== "laboratories" ? [
        { to: "/business/orders", icon: ShoppingCart, label: "Inquiries" },
        { to: "/business/coupons", icon: Ticket, label: "Coupons" },
        { to: "/business/camps", icon: Tent, label: "Camps" },
        { to: "/business/jobs", icon: Briefcase, label: "Jobs" },
        { to: "/business/reviews", icon: Star, label: "Reviews" },
      ] : []),
      { to: "/business/notifications", icon: Bell, label: "Notifications" },
      { to: "/business/settings", icon: Settings, label: "Settings" },
    ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleNavClick = (to: string) => {
    guardedNavigate(to);
    onClose();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-border z-50 flex flex-col transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-border-light">
          <div className="flex items-center justify-between">
            <button onClick={() => handleNavClick("/")} className="flex items-center gap-2">
              <img src="/images/logo-icon.png" alt="DM" className="w-8 h-8" />
              <span className="font-bold text-primary text-sm">Digital Medical</span>
            </button>
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
            <button
              key={to}
              onClick={() => handleNavClick(to)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-xl transition-all text-left ${isActive(to, exact)
                ? "bg-accent/10 text-accent font-semibold"
                : "text-text-secondary hover:bg-surface-tertiary"
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
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

/* ── Professional Dashboard Home ── */
function ProfessionalDashboardHome() {
  const { business } = useAuth();
  const [linkedStaff, setLinkedStaff] = useState<StaffMember | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<StaffLinkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [linkRes, reqRes] = await Promise.allSettled([
          staffLinkService.myLink(),
          staffLinkService.incomingRequests(),
        ]);
        if (linkRes.status === "fulfilled") setLinkedStaff(linkRes.value.data);
        if (reqRes.status === "fulfilled") setIncomingRequests(reqRes.value.data);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await staffLinkService.accept(id);
      setMessage({ type: "success", text: "Request accepted! You are now linked." });
      const [linkRes, reqRes] = await Promise.allSettled([staffLinkService.myLink(), staffLinkService.incomingRequests()]);
      if (linkRes.status === "fulfilled") setLinkedStaff(linkRes.value.data);
      if (reqRes.status === "fulfilled") setIncomingRequests(reqRes.value.data);
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to accept" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await staffLinkService.reject(id);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
      setMessage({ type: "success", text: "Request declined" });
    } catch {
      setMessage({ type: "error", text: "Failed to decline" });
    }
  };

  const pendingRequests = incomingRequests.filter((r) => r.status === "PENDING");

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-border-light p-6 animate-pulse">
            <div className="h-4 w-48 bg-surface-tertiary rounded" />
            <div className="h-3 w-32 bg-surface-tertiary rounded mt-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome, {business?.name}</h1>
        <p className="text-sm text-text-secondary mt-1">
          {business?.category?.slug === "doctors" ? "Doctor" :
            business?.category?.slug === "pharmacists" ? "Pharmacist" : "Medical Representative"} Dashboard
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border-light p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2"><Link2 size={18} /> Linked Business</h2>
        {linkedStaff ? (
          <div className="flex items-center gap-4">
            {linkedStaff.business?.image
              ? <img src={linkedStaff.business.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
              : <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center text-accent font-bold text-lg">{linkedStaff.business?.name?.charAt(0)}</div>}
            <div>
              <p className="font-semibold text-text-primary">{linkedStaff.business?.name}</p>
              <p className="text-sm text-text-secondary">{linkedStaff.business?.category?.name}</p>
              {linkedStaff.business?.address && <p className="text-xs text-text-tertiary mt-1">{linkedStaff.business.address}</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-12 h-12 bg-surface-tertiary rounded-full flex items-center justify-center mb-3"><Link2 size={20} className="text-text-tertiary" /></div>
            <p className="text-sm text-text-tertiary">You are not linked to any business yet</p>
            <p className="text-xs text-text-tertiary mt-1">A hospital or pharmacy will send you a link request</p>
          </div>
        )}
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2"><Bell size={18} /> Pending Link Requests</h2>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between gap-4 p-3 bg-surface-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  {req.business?.image
                    ? <img src={req.business.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                    : <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-sm">{req.business?.name?.charAt(0)}</div>}
                  <div>
                    <p className="text-sm font-medium text-text-primary">{req.business?.name}</p>
                    <p className="text-xs text-text-tertiary">{req.business?.category?.name} · {req.business?.address}</p>
                    {req.message && <p className="text-xs text-text-secondary mt-1 italic">"{req.message}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleReject(req.id)} className="p-2 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg" title="Decline"><XCircle size={18} /></button>
                  <button onClick={() => handleAccept(req.id)} className="px-3 py-1.5 text-sm text-white bg-accent rounded-lg hover:bg-accent/90 flex items-center gap-1"><Check size={13} /> Accept</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Business Dashboard Home ── */
function BusinessDashboardHome() {
  const { business } = useAuth();
  const { guardedNavigate } = useUnsavedChangesContext();

  const stats = [
    { label: "Profile Views", value: "0", icon: Building2, color: "text-primary bg-primary/10" },
    { label: "Inquiries", value: "0", icon: ShoppingCart, color: "text-accent bg-accent/10" },
    { label: "Reviews", value: "0", icon: Star, color: "text-yellow-500 bg-yellow-50" },
    { label: "Staff Members", value: "0", icon: Users, color: "text-green-500 bg-green-50" },
  ];

  const quickActions = [
    { label: "Complete Your Profile", to: "/business/profile", desc: "Add photos, timings, and more" },
    { label: "Upload Licenses", to: "/business/licenses", desc: "Add drug license, GST certificate" },
    { label: "Add Staff Members", to: "/business/staff", desc: "Manage your team" },
    { label: "Add Products", to: "/business/products", desc: "List your products (Manufacturers/Wholesalers)" },
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
            <p className="text-xs text-yellow-700 mt-0.5">Your business profile is under review. You'll be notified once approved.</p>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border-light p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}><s.icon size={20} /></div>
            <p className="text-2xl font-bold text-text-primary mt-3">{s.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.to}
                onClick={() => guardedNavigate(action.to)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-tertiary transition-colors group text-left"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{action.label}</p>
                  <p className="text-xs text-text-tertiary">{action.desc}</p>
                </div>
                <ChevronRight size={16} className="text-text-tertiary group-hover:text-primary transition-colors" />
              </button>
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

function DashboardHome() {
  const { business } = useAuth();
  const isProf = isProfessional(business?.category?.slug);
  return isProf ? <ProfessionalDashboardHome /> : <BusinessDashboardHome />;
}

/* ── Global modal rendered at layout level ── */
function GlobalUnsavedModal() {
  const { showModal, saving, confirmLeave, cancelLeave, saveAndLeave } = useUnsavedChangesContext();
  return (
    <UnsavedChangesModal
      open={showModal}
      saving={saving}
      onDiscard={confirmLeave}
      onStay={cancelLeave}
      onSaveAndLeave={saveAndLeave}
    />
  );
}

/* ── Inner layout ── */
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { guardedNavigate } = useUnsavedChangesContext();

  return (
    <div className="min-h-screen bg-surface-secondary">
      <GlobalUnsavedModal />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border-light px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-text-secondary hover:bg-surface-tertiary rounded-lg">
            <Menu size={20} />
          </button>
          <div />
          <div className="flex items-center gap-3">
            <button
              onClick={() => guardedNavigate("/business/notifications")}
              className="relative p-2 text-text-secondary hover:bg-surface-tertiary rounded-lg inline-flex"
            >
              <Bell size={18} />
              <UnreadBadge />
            </button>
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-border-light">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-text-primary hidden sm:block">{user.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="licenses" element={<LicensesPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="tpa-insurance" element={<BusinessTpaInsurancePage />} /> {/* Added Route */}
            <Route path="linked" element={<LinkedBusinessPage />} />
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

/* ── Final Wrapped Component ── */
export default function BusinessDashboard() {
  return (
    <UnsavedChangesProvider>
      <DashboardLayout />
    </UnsavedChangesProvider>
  );
}