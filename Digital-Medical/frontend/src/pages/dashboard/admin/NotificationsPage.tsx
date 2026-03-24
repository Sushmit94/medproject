import { useState, useEffect } from "react";
import { Bell, Send } from "lucide-react";
import { notificationService, type Notification } from "@/lib/services";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    notificationService.list()
      .then((res) => setNotifications(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load notifications" }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">Send broadcast notifications to users</p>
        </div>
        <button onClick={() => setShowBroadcast(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">
          <Send size={16} /> Broadcast
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {showBroadcast && (
        <BroadcastForm
          onSent={() => { setShowBroadcast(false); setMessage({ type: "success", text: "Broadcast sent!" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
          onCancel={() => setShowBroadcast(false)}
        />
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-4 animate-pulse">
              <div className="h-4 w-48 bg-surface-tertiary rounded" />
              <div className="h-3 w-64 bg-surface-tertiary rounded mt-2" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Bell size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={`bg-white rounded-xl border p-4 ${n.isRead ? "border-border-light" : "border-primary/20"}`}>
              <div className="flex items-center gap-2">
                {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                <h4 className="text-sm font-semibold text-text-primary">{n.title}</h4>
                <span className="text-[11px] bg-slate-100 text-text-tertiary px-1.5 py-0.5 rounded">{n.type}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">{n.message}</p>
              <p className="text-[11px] text-text-tertiary mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BroadcastForm({ onSent, onError, onCancel }: { onSent: () => void; onError: (msg: string) => void; onCancel: () => void }) {
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", link: "", targetRole: "" });
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setSending(true);
    try {
      await notificationService.broadcast({
        title: form.title,
        message: form.message,
        link: form.link || undefined,
        targetRole: form.targetRole || undefined,
      });
      onSent();
    } catch { onError("Failed to send broadcast"); }
    finally { setSending(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-primary/20 p-6">
      <h3 className="text-base font-semibold text-text-primary mb-4">Send Broadcast Notification</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Notification title" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Target Role</label>
            <select value={form.targetRole} onChange={(e) => set("targetRole", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">All Users</option>
              <option value="CUSTOMER">Customers</option>
              <option value="BUSINESS">Businesses</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Message *</label>
          <textarea value={form.message} onChange={(e) => set("message", e.target.value)} required rows={3} placeholder="Notification message" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Link (optional)</label>
          <input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="e.g., /news or https://..." className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
          <button type="submit" disabled={sending} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
            <Send size={14} /> {sending ? "Sending..." : "Send Broadcast"}
          </button>
        </div>
      </form>
    </div>
  );
}
