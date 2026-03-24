import { useState, useEffect, useRef } from "react";
import { Plus, Users, Trash2, Edit2, X, Cake, Heart, Camera } from "lucide-react";
import { staffService, uploadService, type StaffMember } from "@/lib/services";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadStaff = () => {
    setLoading(true);
    staffService.myStaff()
      .then((res) => setStaff(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load staff" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStaff(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await staffService.delete(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
      setMessage({ type: "success", text: "Staff member removed" });
    } catch {
      setMessage({ type: "error", text: "Failed to remove staff member" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Staff Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your team members</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90">
          <Plus size={16} /> Add Staff
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
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-surface-tertiary rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-tertiary rounded" />
                  <div className="h-3 w-24 bg-surface-tertiary rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Users size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No staff members added yet</p>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="mt-4 text-sm text-accent font-medium hover:underline">Add your first team member</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl border border-border-light p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{member.name}</h3>
                    {member.role && <p className="text-xs text-text-secondary">{member.role}</p>}
                    {member.phone && <p className="text-xs text-text-tertiary mt-1">{member.phone}</p>}
                    {member.email && <p className="text-xs text-text-tertiary">{member.email}</p>}
                    <div className="flex gap-3 mt-2">
                      {member.birthday && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-pink-600">
                          <Cake size={12} /> {new Date(member.birthday).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                      {member.anniversary && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-500">
                          <Heart size={12} /> {new Date(member.anniversary).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditing(member); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <StaffModal
          staff={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadStaff(); setMessage({ type: "success", text: editing ? "Staff updated" : "Staff added" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function StaffModal({ staff, onClose, onSaved, onError }: {
  staff: StaffMember | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(staff?.photo || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: staff?.name || "",
    role: staff?.role || "",
    phone: staff?.phone || "",
    email: staff?.email || "",
    birthday: staff?.birthday?.split("T")[0] || "",
    anniversary: staff?.anniversary?.split("T")[0] || "",
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadService.image(file, "staff");
      setPhotoUrl(res.url);
    } catch {
      onError("Failed to upload photo");
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
        role: form.role || null,
        phone: form.phone || null,
        email: form.email || null,
        photo: photoUrl || null,
        birthday: form.birthday || null,
        anniversary: form.anniversary || null,
      };
      if (staff) {
        await staffService.update(staff.id, payload);
      } else {
        await staffService.create(payload);
      }
      onSaved();
    } catch {
      onError(staff ? "Failed to update staff" : "Failed to add staff");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold text-text-primary">{staff ? "Edit Staff" : "Add Staff"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full bg-surface-tertiary flex items-center justify-center cursor-pointer hover:opacity-80 overflow-hidden"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Staff" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="text-text-tertiary" />
              )}
              {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); e.target.value = ""; }} />
            <span className="text-xs text-text-tertiary">Click to upload photo</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Full name" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Role / Position</label>
            <input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g., Pharmacist, Accountant" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone number" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email address" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Birthday</label>
              <input type="date" value={form.birthday} onChange={(e) => set("birthday", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Anniversary</label>
              <input type="date" value={form.anniversary} onChange={(e) => set("anniversary", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
              {saving ? "Saving..." : staff ? "Update" : "Add Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
