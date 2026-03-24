import { useState, useEffect } from "react";
import { ShoppingCart, Clock, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { orderService, type OrderInquiry } from "@/lib/services";

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  PENDING: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  SEEN: { color: "bg-gray-50 text-gray-700 border-gray-200", icon: Clock },
  ACCEPTED: { color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
  REJECTED: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

export default function OrdersPage() {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [orders, setOrders] = useState<OrderInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadOrders = () => {
    setLoading(true);
    const fn = tab === "received" ? orderService.received : orderService.sent;
    fn()
      .then((res) => setOrders(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load inquiries" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [tab]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await orderService.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
      setMessage({ type: "success", text: `Inquiry ${status.toLowerCase()}` });
    } catch {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Order Inquiries</h1>
        <p className="text-sm text-text-secondary mt-1">Manage supply chain inquiries</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-1 bg-surface-tertiary rounded-xl p-1 w-fit">
        <button onClick={() => setTab("received")} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "received" ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}>
          <ArrowDownLeft size={15} /> Received
        </button>
        <button onClick={() => setTab("sent")} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "sent" ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}>
          <ArrowUpRight size={15} /> Sent
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 animate-pulse">
              <div className="h-4 w-48 bg-surface-tertiary rounded" />
              <div className="h-3 w-32 bg-surface-tertiary rounded mt-2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <ShoppingCart size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No {tab} inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = cfg.icon;
            return (
              <div key={order.id} className="bg-white rounded-xl border border-border-light p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-text-primary">{order.productName}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md border ${cfg.color}`}>
                        <StatusIcon size={12} /> {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      Qty: <span className="font-medium">{order.quantity}</span>
                      {order.unit && <span> {order.unit}</span>}
                    </p>
                    {order.notes && <p className="text-xs text-text-tertiary mt-1">{order.notes}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-text-tertiary">
                      {tab === "received" && order.buyer && <span>From: {order.buyer.name}</span>}
                      {tab === "sent" && order.supplier && <span>To: {order.supplier.name}</span>}
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {tab === "received" && (order.status === "PENDING" || order.status === "SEEN") && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStatusUpdate(order.id, "ACCEPTED")} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Accept</button>
                      <button onClick={() => handleStatusUpdate(order.id, "REJECTED")} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
