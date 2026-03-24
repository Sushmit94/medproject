import { useState, useEffect, useRef } from "react";
import { Plus, Handshake, Trash2, Edit2, X, ImagePlus } from "lucide-react";
import { dealService, uploadService, type Deal } from "@/lib/services";

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadDeals = () => {
    setLoading(true);
    dealService.my()
      .then((res) => setDeals(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load deals" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDeals(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await dealService.delete(id);
      setDeals((prev) => prev.filter((d) => d.id !== id));
      setMessage({ type: "success", text: "Deal deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete deal" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Deals In</h1>
          <p className="text-sm text-text-secondary mt-1">Describe what your business deals in</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90">
          <Plus size={16} /> Add Deal
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-border-light p-8 text-center text-sm text-text-tertiary">Loading...</div>
      ) : deals.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Handshake size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No deals added yet</p>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="mt-4 text-sm text-accent font-medium hover:underline">Add your first deal</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-xl border border-border-light p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {deal.image ? (
                    <img src={deal.image} alt={deal.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-surface-tertiary flex items-center justify-center shrink-0">
                      <Handshake size={20} className="text-text-tertiary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{deal.title}</h3>
                    {deal.description && (
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">{deal.description}</p>
                    )}
                    {!deal.isActive && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-gray-100 text-gray-500">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditing(deal); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(deal.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <DealModal
          deal={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadDeals(); setMessage({ type: "success", text: editing ? "Deal updated" : "Deal added" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function DealModal({ deal, onClose, onSaved, onError }: {
  deal: Deal | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(deal?.image || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: deal?.title || "",
    description: deal?.description || "",
    isActive: deal?.isActive ?? true,
  });

  const set = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadService.image(file, "deals");
      setImageUrl(res.url);
    } catch {
      onError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        image: imageUrl || null,
        isActive: form.isActive,
      };
      if (deal) {
        await dealService.update(deal.id, payload);
      } else {
        await dealService.create(payload);
      }
      onSaved();
    } catch {
      onError(deal ? "Failed to update deal" : "Failed to add deal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold text-text-primary">{deal ? "Edit Deal" : "Add Deal"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Image</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileRef.current?.click()}
                className="relative w-20 h-20 rounded-xl bg-surface-tertiary border-2 border-dashed border-border-light flex items-center justify-center cursor-pointer hover:border-accent/50 overflow-hidden"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Deal" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={24} className="text-text-tertiary" />
                )}
                {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); e.target.value = ""; }} />
              <span className="text-xs text-text-tertiary">Click to upload</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="e.g., Allopathic Medicines" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Brief description of this deal" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded border-border-light text-accent focus:ring-accent/20" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
              {saving ? "Saving..." : deal ? "Update" : "Add Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
