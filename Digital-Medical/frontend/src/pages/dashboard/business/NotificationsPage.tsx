import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { notificationService, type Notification } from "@/lib/services";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadNotifications = () => {
    setLoading(true);
    notificationService.list()
      .then((res) => setNotifications(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load notifications" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      setMessage({ type: "error", text: "Failed to mark as read" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setMessage({ type: "success", text: "All notifications marked as read" });
    } catch {
      setMessage({ type: "error", text: "Failed to mark all as read" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete notification" });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary border border-primary/20 rounded-xl hover:bg-primary/5">
            <CheckCheck size={16} /> Mark All Read
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-4 animate-pulse">
              <div className="h-4 w-48 bg-surface-tertiary rounded" />
              <div className="h-3 w-64 bg-surface-tertiary rounded mt-2" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Bell size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div key={notif.id} className={`bg-white rounded-xl border p-4 transition-colors ${notif.isRead ? "border-border-light" : "border-accent/30 bg-accent/[0.02]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!notif.isRead && <div className="w-2 h-2 bg-accent rounded-full shrink-0" />}
                    <h4 className={`text-sm truncate ${notif.isRead ? "text-text-secondary" : "font-semibold text-text-primary"}`}>{notif.title}</h4>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{notif.message}</p>
                  <p className="text-[11px] text-text-tertiary mt-1.5">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.isRead && (
                    <button onClick={() => handleMarkRead(notif.id)} title="Mark as read" className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(notif.id)} title="Delete" className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
