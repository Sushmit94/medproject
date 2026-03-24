import { useState } from "react";
import { Settings, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      });
      setMessage({ type: "success", text: "Password changed successfully" });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } catch {
      setMessage({ type: "error", text: "Failed to change password. Check your current password." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account settings</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center gap-2 mb-5">
          <Settings size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-text-primary">Account Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name</label>
            <input value={user?.name || ""} disabled className="w-full px-3.5 py-2.5 bg-surface-tertiary border border-border-light rounded-xl text-sm text-text-tertiary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Role</label>
            <input value={user?.role || ""} disabled className="w-full px-3.5 py-2.5 bg-surface-tertiary border border-border-light rounded-xl text-sm text-text-tertiary capitalize" />
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-text-primary">Change Password</h2>
          <button onClick={() => setShowPasswords(!showPasswords)} className="text-text-tertiary hover:text-text-secondary p-1">
            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Current Password</label>
            <input type={showPasswords ? "text" : "password"} value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">New Password</label>
            <input type={showPasswords ? "text" : "password"} value={passwordForm.newPass} onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm New Password</label>
            <input type={showPasswords ? "text" : "password"} value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <button type="submit" disabled={saving} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
            {saving ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-base font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-text-tertiary mb-4">Sign out of your account on this device.</p>
        <button onClick={() => { logout(); navigate("/business/login"); }} className="px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600">
          Sign Out
        </button>
      </div>
    </div>
  );
}
