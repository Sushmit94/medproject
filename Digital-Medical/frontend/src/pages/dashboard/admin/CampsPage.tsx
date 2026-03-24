import { useState, useEffect, useRef } from "react";
import { Plus, CalendarDays, Trash2, Edit2, X, Users, ImagePlus } from "lucide-react";
import { campService, uploadService, type Camp } from "@/lib/services";

export default function CampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Camp | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadCamps = () => {
    setLoading(true);
    campService.list()
      .then((res) => setCamps(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load camps" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCamps(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this camp/event?")) return;
    try {
      await campService.delete(id);
      setCamps((prev) => prev.filter((c) => c.id !== id));
      setMessage({ type: "success", text: "Camp deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete camp" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Camps & Events</h1>
          <p className="text-sm text-text-secondary mt-1">Manage health camps and medical events</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">
          <Plus size={16} /> Create Camp
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
              <div className="h-5 w-40 bg-surface-tertiary rounded" />
              <div className="h-4 w-24 bg-surface-tertiary rounded mt-2" />
            </div>
          ))}
        </div>
      ) : camps.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <CalendarDays size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No camps or events created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {camps.map((camp) => {
            const isPast = new Date(camp.eventDate) < new Date();
            return (
              <div key={camp.id} className={`bg-white rounded-xl border overflow-hidden ${isPast ? "border-border-light opacity-60" : "border-border-light"}`}>
                {camp.image && (
                  <div className="aspect-[2/1] bg-surface-tertiary">
                    <img src={camp.image} alt={camp.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{camp.name}</h3>
                      {camp.description && <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">{camp.description}</p>}
                    </div>
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${isPast ? "bg-gray-100 text-gray-500" : camp.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {isPast ? "Past" : camp.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} /> {new Date(camp.eventDate).toLocaleDateString()}
                    </span>
                    {camp.venue && <span>{camp.venue}</span>}
                    {camp._count && (
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {camp._count.registrations} registered
                      </span>
                    )}
                  </div>
                  {camp.business && <p className="text-[11px] text-primary font-medium mt-1.5">By: {camp.business.name}</p>}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border-light">
                    <button onClick={() => { setEditing(camp); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(camp.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CampModal
          camp={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadCamps(); setMessage({ type: "success", text: editing ? "Camp updated" : "Camp created" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function CampModal({ camp, onClose, onSaved, onError }: {
  camp: Camp | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: camp?.name || "",
    description: camp?.description || "",
    image: camp?.image || "",
    eventDate: camp?.eventDate?.split("T")[0] || "",
    timeFrom: camp?.timeFrom || "",
    timeTo: camp?.timeTo || "",
    venue: camp?.venue || "",
    isActive: camp?.isActive ?? true,
  });

  const set = (f: string, v: string | boolean) => setForm((p) => ({ ...p, [f]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadService.image(file, "camps");
      set("image", url);
    } catch { onError("Image upload failed"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.eventDate) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        image: form.image || null,
        eventDate: form.eventDate,
        timeFrom: form.timeFrom || null,
        timeTo: form.timeTo || null,
        venue: form.venue || null,
        isActive: form.isActive,
      };
      if (camp) await campService.update(camp.id, payload);
      else await campService.create(payload);
      onSaved();
    } catch { onError("Failed to save camp"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold">{camp ? "Edit Camp" : "Create Camp"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Camp Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Event Date *</label>
            <input type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Time From</label>
              <input type="time" value={form.timeFrom} onChange={(e) => set("timeFrom", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Time To</label>
              <input type="time" value={form.timeTo} onChange={(e) => set("timeTo", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Venue</label>
            <input value={form.venue} onChange={(e) => set("venue", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Image</label>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleImageUpload} className="hidden" />
            <div onClick={() => fileRef.current?.click()} className="w-full border border-dashed border-border-light rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors overflow-hidden" style={{ minHeight: 120 }}>
              {uploading ? (
                <span className="text-xs text-text-tertiary animate-pulse">Uploading…</span>
              ) : form.image ? (
                <img src={form.image} alt="" className="w-full h-32 object-cover" />
              ) : (
                <>
                  <ImagePlus size={24} className="text-text-tertiary" />
                  <span className="text-xs text-text-tertiary mt-1">Click to upload</span>
                </>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">{saving ? "Saving..." : camp ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
