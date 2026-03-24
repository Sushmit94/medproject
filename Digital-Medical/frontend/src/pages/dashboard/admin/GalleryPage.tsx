import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, ImagePlus } from "lucide-react";
import { galleryService, uploadService, type GalleryItem } from "@/lib/services";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadGallery = () => {
    setLoading(true);
    galleryService.list("limit=50")
      .then((res) => setItems(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load gallery" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGallery(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this image from gallery?")) return;
    try {
      await galleryService.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMessage({ type: "success", text: "Image removed" });
    } catch {
      setMessage({ type: "error", text: "Failed to remove image" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gallery</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your photo gallery</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90">
          <Plus size={16} /> Add Image
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-surface-tertiary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <ImagePlus size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No gallery images yet</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-accent font-medium hover:underline">Upload your first image</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square bg-white rounded-xl border border-border-light overflow-hidden">
              <img src={item.url} alt={item.caption || "Gallery"} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                {item.caption && <span className="text-xs text-white truncate">{item.caption}</span>}
                <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <GalleryModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadGallery(); setMessage({ type: "success", text: "Image added to gallery" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function GalleryModal({ onClose, onSaved, onError }: { onClose: () => void; onSaved: () => void; onError: (msg: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [type, setType] = useState("image");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadService.image(file, "gallery");
      setImageUrl(res.url);
    } catch {
      onError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    setSaving(true);
    try {
      await galleryService.create({ type, url: imageUrl, caption: caption || undefined });
      onSaved();
    } catch {
      onError("Failed to add to gallery");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold">Add Gallery Image</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative h-48 rounded-xl bg-surface-tertiary border-2 border-dashed border-border-light flex items-center justify-center cursor-pointer hover:border-accent/50 overflow-hidden"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <ImagePlus size={32} className="mx-auto text-text-tertiary mb-2" />
                <p className="text-xs text-text-tertiary">Click to upload image</p>
              </div>
            )}
            {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Caption</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none">
              <option value="image">Image</option>
              <option value="banner">Banner</option>
              <option value="event">Event Photo</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving || !imageUrl} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
              {saving ? "Adding..." : "Add to Gallery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
