import { useState, useEffect, useRef } from "react";
import { Plus, Users, Trash2, Edit2, X, Cake, Heart, Camera, Search, Check, Bell, Link2, Unlink } from "lucide-react";
import { staffService, staffLinkService, uploadService, type StaffMember, type StaffLinkRequest } from "@/lib/services";

export default function StaffPage() {
  const [tab, setTab] = useState<"staff" | "requests">("staff");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sentRequests, setSentRequests] = useState<StaffLinkRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<StaffLinkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [staffRes, sentRes, incomingRes] = await Promise.allSettled([
        staffService.myStaff(),
        staffLinkService.sentRequests(),
        staffLinkService.incomingRequests(),
      ]);
      if (staffRes.status === "fulfilled") setStaff(staffRes.value.data);
      if (sentRes.status === "fulfilled") setSentRequests(sentRes.value.data);
      if (incomingRes.status === "fulfilled") setIncomingRequests(incomingRes.value.data);

      const anyFailed = [staffRes, sentRes, incomingRes].some((r) => r.status === "rejected");
      if (anyFailed) setMessage({ type: "error", text: "Some data failed to load. Try refreshing." });
    } catch {
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    try {
      await staffService.delete(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
      setMessage({ type: "success", text: "Staff member removed" });
    } catch {
      setMessage({ type: "error", text: "Failed to remove staff member" });
    }
  };

  const handleUnlink = async (member: StaffMember) => {
    if (!confirm(`Unlink ${member.name} from your staff? They will be removed.`)) return;
    try {
      await staffLinkService.unlink(member.id);
      setStaff((prev) => prev.filter((s) => s.id !== member.id));
      setMessage({ type: "success", text: "Staff unlinked successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to unlink staff member" });
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await staffLinkService.accept(id);
      setMessage({ type: "success", text: "Request accepted! You are now listed as staff." });
      loadAll();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to accept" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await staffLinkService.reject(id);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
      setMessage({ type: "success", text: "Request declined" });
    } catch {
      setMessage({ type: "error", text: "Failed to decline" });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await staffLinkService.cancel(id);
      setSentRequests((prev) => prev.filter((r) => r.id !== id));
      setMessage({ type: "success", text: "Request cancelled" });
    } catch {
      setMessage({ type: "error", text: "Failed to cancel" });
    }
  };

  const pendingIncomingCount = incomingRequests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Staff Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your team and professional links</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLinkModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-border-light text-text-primary text-sm font-medium rounded-xl hover:bg-surface-secondary"
          >
            <Search size={15} /> Link a Doctor
          </button>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90"
          >
            <Plus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-secondary p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("staff")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "staff" ? "bg-white text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
        >
          Team ({staff.length})
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "requests" ? "bg-white text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
        >
          Link Requests
          {pendingIncomingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {pendingIncomingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Staff Tab ── */}
      {tab === "staff" && (
        loading ? (
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
            <button onClick={() => { setEditing(null); setShowModal(true); }} className="mt-4 text-sm text-accent font-medium hover:underline">
              Add your first team member
            </button>
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
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">{member.name}</h3>
                        {member.linkedUserId && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium">
                            <Link2 size={10} /> Linked
                          </span>
                        )}
                      </div>
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
                    {member.linkedUserId ? (
                      <button
                        onClick={() => handleUnlink(member)}
                        className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"
                        title="Unlink"
                      >
                        <Unlink size={14} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => { setEditing(member); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(member.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Requests Tab ── */}
      {tab === "requests" && (
        <div className="space-y-6">
          {/* Incoming requests */}
          {incomingRequests.filter((r) => r.status === "PENDING").length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Bell size={15} /> Received invitations
              </h3>
              <div className="space-y-3">
                {incomingRequests.filter((r) => r.status === "PENDING").map((req) => (
                  <div key={req.id} className="bg-white rounded-xl border border-border-light p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {req.business?.image ? (
                        <img src={req.business.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-sm">
                          {req.business?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-text-primary">{req.business?.name}</p>
                        <p className="text-xs text-text-tertiary">
                          {req.business?.category?.name} · {req.business?.address}
                        </p>
                        {req.message && <p className="text-xs text-text-secondary mt-1 italic">"{req.message}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1.5 text-sm text-text-secondary border border-border-light rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="px-3 py-1.5 text-sm text-white bg-accent rounded-lg hover:bg-accent/90 flex items-center gap-1"
                      >
                        <Check size={13} /> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent requests */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Sent link requests</h3>
            {sentRequests.length === 0 ? (
              <div className="bg-white rounded-xl border border-border-light p-8 text-center">
                <p className="text-sm text-text-tertiary">No link requests sent yet</p>
                <button onClick={() => setShowLinkModal(true)} className="mt-3 text-sm text-accent font-medium hover:underline">
                  Link a doctor
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-xl border border-border-light p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {req.targetUser?.business?.image ? (
                        <img src={req.targetUser.business.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-sm">
                          {req.targetUser?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-text-primary">{req.targetUser?.name}</p>
                        <p className="text-xs text-text-tertiary">
                          {req.targetUser?.business?.name} · {req.targetUser?.business?.category?.name}
                        </p>
                        <p className="text-xs text-text-tertiary">{req.targetUser?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={req.status} />
                      {req.status === "PENDING" && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"
                          title="Cancel request"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <StaffModal
          staff={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadAll(); setMessage({ type: "success", text: editing ? "Staff updated" : "Staff added" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}

      {showLinkModal && (
        <LinkDoctorModal
          onClose={() => setShowLinkModal(false)}
          onSent={() => { setShowLinkModal(false); loadAll(); setMessage({ type: "success", text: "Link request sent!" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    ACCEPTED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-gray-50 text-gray-500 border-gray-200",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 border rounded-full font-medium ${map[status] ?? ""}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

/* ── Add/Edit Staff Modal ── */
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

/* ── Link Doctor Modal ── */
function LinkDoctorModal({ onClose, onSent, onError }: {
  onClose: () => void; onSent: () => void; onError: (msg: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<any>(null);
  const [notFound, setNotFound] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  const handleSearch = async () => {
    if (phone.length < 10) return;
    setSearching(true);
    setFound(null);
    setNotFound("");
    try {
      const res = await staffLinkService.search(phone);
      setFound(res.data);
    } catch (err: any) {
      setNotFound(err?.message || "No registered profile found");
    } finally {
      setSearching(false);
    }
  };

  const handleSend = async () => {
    if (!found) return;
    setSending(true);
    try {
      await staffLinkService.sendRequest({
        targetUserId: found.id,
        message: inviteMessage || undefined,
      });
      onSent();
    } catch (err: any) {
      onError(err?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold text-text-primary">Link a Doctor / Professional</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Search by registered phone number
            </label>
            <div className="flex gap-2">
              <input
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setFound(null); setNotFound(""); }}
                placeholder="10-digit phone number"
                maxLength={10}
                className="flex-1 px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={phone.length < 10 || searching}
                className="px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50"
              >
                {searching ? "..." : "Search"}
              </button>
            </div>
          </div>

          {found && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                {found.business?.image ? (
                  <img src={found.business.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                    {found.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-green-800">{found.name}</p>
                  <p className="text-xs text-green-600">{found.business?.name} · {found.business?.category?.name}</p>
                </div>
              </div>
            </div>
          )}

          {notFound && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-700 font-medium">{notFound}</p>
              <p className="text-xs text-amber-600 mt-0.5">
                The person must have a registered business profile on Digital Medical to be linked.
              </p>
            </div>
          )}

          {found && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Message (optional)
              </label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="e.g. We'd love you to join our clinic..."
                rows={2}
                className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">
              Cancel
            </button>
            {found && (
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Link Request"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
