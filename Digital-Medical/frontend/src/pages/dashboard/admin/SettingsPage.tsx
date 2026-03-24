import { useState } from "react";
import { Settings, Lock, Eye, EyeOff, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (form.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    setSaving(true);
    try {
      await api.patch("/auth/change-password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMessage({ type: "success", text: "Password changed successfully" });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const PwToggle = ({ field }: { field: "current" | "new" | "confirm" }) => (
    <button type="button" onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary">
      {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your admin account</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings size={18} className="text-primary" />
          <h3 className="text-base font-semibold text-text-primary">Account Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-1">Name</label>
            <p className="text-sm font-medium text-text-primary">{user?.name || "—"}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-1">Role</label>
            <p className="text-sm font-medium text-text-primary">{user?.role || "—"}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={18} className="text-primary" />
          <h3 className="text-base font-semibold text-text-primary">Change Password</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showPw.current ? "text" : "password"} value={form.currentPassword} onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))} required className="w-full px-3.5 py-2.5 pr-10 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              <PwToggle field="current" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">New Password</label>
            <div className="relative">
              <input type={showPw.new ? "text" : "password"} value={form.newPassword} onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} required className="w-full px-3.5 py-2.5 pr-10 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              <PwToggle field="new" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input type={showPw.confirm ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} required className="w-full px-3.5 py-2.5 pr-10 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              <PwToggle field="confirm" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h3 className="text-base font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-xs text-text-tertiary mb-4">You will be signed out of your admin session.</p>
        <button onClick={() => { logout(); navigate("/super-admin/login"); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
