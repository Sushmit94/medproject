import { useState, useEffect } from "react";
import { Plus, Ticket, Trash2, Edit2, X, Users } from "lucide-react";
import { couponService, type Coupon } from "@/lib/services";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadCoupons = () => {
    setLoading(true);
    couponService.myCoupons()
      .then((res) => setCoupons(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load coupons" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCoupons(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await couponService.delete(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setMessage({ type: "success", text: "Coupon deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete coupon" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Coupons & Offers</h1>
          <p className="text-sm text-text-secondary mt-1">Create and manage your coupons</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 animate-pulse">
              <div className="h-4 w-32 bg-surface-tertiary rounded mb-2" />
              <div className="h-3 w-48 bg-surface-tertiary rounded" />
            </div>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Ticket size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No coupons created yet</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-accent font-medium hover:underline">Create your first coupon</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {coupons.map((coupon) => {
            const isExpired = new Date(coupon.validUntil) < new Date();
            return (
              <div key={coupon.id} className={`bg-white rounded-xl border border-border-light p-5 ${isExpired ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-bold rounded">{coupon.code}</span>
                      {isExpired && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-semibold rounded">EXPIRED</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{coupon.name}</h3>
                    {coupon.description && <p className="text-xs text-text-tertiary mt-1">{coupon.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                      <span>Valid until: {new Date(coupon.validUntil).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {coupon._count?.registrations || 0} claims</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditing(coupon); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-text-tertiary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CouponModal
          coupon={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); loadCoupons(); setMessage({ type: "success", text: editing ? "Coupon updated" : "Coupon created" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function CouponModal({ coupon, onClose, onSaved, onError }: { coupon: Coupon | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: coupon?.code || "",
    name: coupon?.name || "",
    description: coupon?.description || "",
    validUntil: coupon?.validUntil ? coupon.validUntil.slice(0, 10) : "",
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.validUntil) return;
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        name: form.name,
        description: form.description || undefined,
        validUntil: form.validUntil,
      };
      if (coupon) {
        await couponService.update(coupon.id, payload);
      } else {
        await couponService.create(payload);
      }
      onSaved();
    } catch {
      onError(coupon ? "Failed to update coupon" : "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold">{coupon ? "Edit Coupon" : "Create Coupon"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Coupon Code *</label>
            <input required value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g., FLAT20" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm uppercase focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name / Title *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="20% off on all products" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Terms and conditions..." className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm resize-none focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Valid Until *</label>
            <input required type="date" value={form.validUntil} onChange={(e) => set("validUntil", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
              {saving ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
