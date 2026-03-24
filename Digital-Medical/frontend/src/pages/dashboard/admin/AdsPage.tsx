import { useState, useEffect, useRef } from "react";
import { Plus, Megaphone, Trash2, Edit2, X, ToggleLeft, ToggleRight, ImagePlus } from "lucide-react";
import { adService, uploadService, type Ad } from "@/lib/services";

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAds = () => {
    setLoading(true);
    adService.list()
      .then((res) => setAds(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load ads" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAds(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this advertisement?")) return;
    try {
      await adService.delete(id);
      setAds((prev) => prev.filter((a) => a.id !== id));
      setMessage({ type: "success", text: "Ad deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete ad" });
    }
  };

  const handleToggle = async (ad: Ad) => {
    try {
      await adService.update(ad.id, { isActive: !ad.isActive });
      setAds((prev) => prev.map((a) => a.id === ad.id ? { ...a, isActive: !a.isActive } : a));
    } catch {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Advertisements</h1>
          <p className="text-sm text-text-secondary mt-1">Manage banner ads and promotions</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">
          <Plus size={16} /> Create Ad
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 animate-pulse">
              <div className="h-32 bg-surface-tertiary rounded-lg" />
              <div className="h-4 w-32 bg-surface-tertiary rounded mt-3" />
            </div>
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Megaphone size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No advertisements created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl border border-border-light overflow-hidden">
              {ad.image && (
                <div className="aspect-[3/1] bg-surface-tertiary">
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{ad.title}</h3>
                    <p className="text-xs text-text-tertiary mt-0.5">Placement: {ad.placement}</p>
                    <div className="flex gap-3 mt-1 text-[11px] text-text-tertiary">
                      {ad.startDate && <span>From: {new Date(ad.startDate).toLocaleDateString()}</span>}
                      {ad.endDate && <span>To: {new Date(ad.endDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${ad.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {ad.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border-light">
                  <button onClick={() => handleToggle(ad)} className={`p-1.5 rounded-lg ${ad.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                    {ad.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => { setEditing(ad); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(ad.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AdModal
          ad={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadAds(); setMessage({ type: "success", text: editing ? "Ad updated" : "Ad created" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function AdModal({ ad, onClose, onSaved, onError }: {
  ad: Ad | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: ad?.title || "",
    image: ad?.image || "",
    link: ad?.link || "",
    placement: ad?.placement || "HOMEPAGE_BANNER",
    startDate: ad?.startDate?.split("T")[0] || "",
    endDate: ad?.endDate?.split("T")[0] || "",
    isActive: ad?.isActive ?? true,
  });

  const set = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadService.image(file, "ads");
      set("image", res.url);
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
        image: form.image || null,
        link: form.link || null,
        placement: form.placement,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        isActive: form.isActive,
      };
      if (ad) {
        await adService.update(ad.id, payload);
      } else {
        await adService.create(payload);
      }
      onSaved();
    } catch {
      onError(ad ? "Failed to update ad" : "Failed to create ad");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold">{ad ? "Edit Ad" : "Create Ad"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-32 rounded-xl bg-surface-tertiary border-2 border-dashed border-border-light flex items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden"
            >
              {form.image ? (
                <img src={form.image} alt="Ad" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <ImagePlus size={24} className="mx-auto text-text-tertiary mb-1" />
                  <p className="text-xs text-text-tertiary">Click to upload</p>
                </div>
              )}
              {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Link URL</label>
            <input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://..." className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Placement</label>
            <select value={form.placement} onChange={(e) => set("placement", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="HOMEPAGE_BANNER">Homepage Banner</option>
              <option value="SIDEBAR">Sidebar</option>
              <option value="SEARCH_RESULTS">Search Results</option>
              <option value="CATEGORY_PAGE">Category Page</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Saving..." : ad ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
