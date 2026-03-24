import { useState, useEffect, useRef } from "react";
import { Plus, Stethoscope, Trash2, Edit2, X, ImagePlus } from "lucide-react";
import { businessServiceService, uploadService, type BusinessServiceItem } from "@/lib/services";

export default function ServicesPage() {
  const [services, setServices] = useState<BusinessServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BusinessServiceItem | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadServices = () => {
    setLoading(true);
    businessServiceService.my()
      .then((res) => setServices(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load services" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadServices(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await businessServiceService.delete(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setMessage({ type: "success", text: "Service deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete service" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Services</h1>
          <p className="text-sm text-text-secondary mt-1">Manage the services your business offers</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-border-light p-8 text-center text-sm text-text-tertiary">Loading...</div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Stethoscope size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No services added yet</p>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="mt-4 text-sm text-accent font-medium hover:underline">Add your first service</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((svc) => (
            <div key={svc.id} className="bg-white rounded-xl border border-border-light p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {svc.image ? (
                    <img src={svc.image} alt={svc.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-surface-tertiary flex items-center justify-center shrink-0">
                      <Stethoscope size={20} className="text-text-tertiary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{svc.name}</h3>
                    {svc.price && <p className="text-xs text-accent font-medium mt-0.5">{svc.price}</p>}
                    {svc.description && (
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">{svc.description}</p>
                    )}
                    {!svc.isActive && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-gray-100 text-gray-500">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditing(svc); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(svc.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ServiceModal
          service={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadServices(); setMessage({ type: "success", text: editing ? "Service updated" : "Service added" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function ServiceModal({ service, onClose, onSaved, onError }: {
  service: BusinessServiceItem | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(service?.image || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: service?.name || "",
    description: service?.description || "",
    price: service?.price || "",
    isActive: service?.isActive ?? true,
  });

  const set = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadService.image(file, "services");
      setImageUrl(res.url);
    } catch {
      onError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        image: imageUrl || null,
        price: form.price || null,
        isActive: form.isActive,
      };
      if (service) {
        await businessServiceService.update(service.id, payload);
      } else {
        await businessServiceService.create(payload);
      }
      onSaved();
    } catch {
      onError(service ? "Failed to update service" : "Failed to add service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold text-text-primary">{service ? "Edit Service" : "Add Service"}</h2>
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
                  <img src={imageUrl} alt="Service" className="w-full h-full object-cover" />
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
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Service Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g., General Consultation" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Describe this service" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Price</label>
            <input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g., ₹500 or Free" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded border-border-light text-accent focus:ring-accent/20" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
              {saving ? "Saving..." : service ? "Update" : "Add Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
