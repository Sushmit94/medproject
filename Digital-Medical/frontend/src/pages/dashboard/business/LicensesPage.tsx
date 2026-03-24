import { useState, useEffect, useRef } from "react";
import { Plus, FileText, X, Clock, CheckCircle, XCircle, Upload, Loader2 } from "lucide-react";
import { licenseService, uploadService, type License } from "@/lib/services";

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  VERIFIED: { icon: CheckCircle, color: "text-green-700", bg: "bg-green-50 border-green-200" },
  REJECTED: { icon: XCircle, color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<License | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadLicenses = () => {
    setLoading(true);
    licenseService.myLicenses()
      .then((res) => setLicenses(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load licenses" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLicenses(); }, []);

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (license: License) => { setEditing(license); setShowModal(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Licenses</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your business licenses and certificates</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90">
          <Plus size={16} /> Add License
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 animate-pulse">
              <div className="h-5 w-40 bg-surface-tertiary rounded" />
              <div className="h-4 w-64 bg-surface-tertiary rounded mt-2" />
            </div>
          ))}
        </div>
      ) : licenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <FileText size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No licenses uploaded yet</p>
          <button onClick={openAdd} className="mt-4 text-sm text-accent font-medium hover:underline">Upload your first license</button>
        </div>
      ) : (
        <div className="space-y-3">
          {licenses.map((lic) => {
            const status = statusConfig[lic.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;
            return (
              <div key={lic.id} className="bg-white rounded-xl border border-border-light p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-text-primary">{lic.type}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md border ${status.bg} ${status.color}`}>
                        <StatusIcon size={12} /> {lic.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">License No: {lic.licenseNo}</p>
                    {lic.issuedBy && <p className="text-xs text-text-tertiary mt-0.5">Issued by: {lic.issuedBy}</p>}
                    <div className="flex gap-4 mt-2">
                      {lic.issueDate && <p className="text-xs text-text-tertiary">Issued: {new Date(lic.issueDate).toLocaleDateString()}</p>}
                      {lic.expiryDate && <p className="text-xs text-text-tertiary">Expires: {new Date(lic.expiryDate).toLocaleDateString()}</p>}
                    </div>
                    {lic.rejectionNote && (
                      <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-1.5 mt-2">
                        Admin Note: {lic.rejectionNote}
                      </p>
                    )}
                    {lic.document && (
                      <a href={lic.document} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline mt-2">
                        <FileText size={12} /> View Document
                      </a>
                    )}
                  </div>
                  {lic.status !== "VERIFIED" && (
                    <button onClick={() => openEdit(lic)} className="text-xs text-primary font-medium hover:underline">Edit</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <LicenseModal
          license={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadLicenses(); setMessage({ type: "success", text: editing ? "License updated" : "License added" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function LicenseModal({ license, onClose, onSaved, onError }: {
  license: License | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(license?.document || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    type: license?.type || "",
    licenseNo: license?.licenseNo || "",
    issuedBy: license?.issuedBy || "",
    issueDate: license?.issueDate?.split("T")[0] || "",
    expiryDate: license?.expiryDate?.split("T")[0] || "",
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileUpload = async (file: File) => {
    setUploadingDoc(true);
    try {
      const { url } = await uploadService.document(file, "licenses");
      setDocumentUrl(url);
    } catch {
      onError("Failed to upload document");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type.trim() || !form.licenseNo.trim()) return;
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        licenseNo: form.licenseNo,
        issuedBy: form.issuedBy || null,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
        document: documentUrl || null,
      };
      if (license) {
        await licenseService.update(license.id, payload);
      } else {
        await licenseService.create(payload);
      }
      onSaved();
    } catch {
      onError(license ? "Failed to update license" : "Failed to add license");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold text-text-primary">{license ? "Edit License" : "Add License"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">License Type *</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none">
              <option value="">Select type</option>
              <option value="Drug License">Drug License</option>
              <option value="GST Certificate">GST Certificate</option>
              <option value="Trade License">Trade License</option>
              <option value="FSSAI License">FSSAI License</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">License Number *</label>
            <input value={form.licenseNo} onChange={(e) => set("licenseNo", e.target.value)} required placeholder="Enter license number" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Issued By</label>
            <input value={form.issuedBy} onChange={(e) => set("issuedBy", e.target.value)} placeholder="Issuing authority" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Issue Date</label>
              <input type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
          </div>
          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Document</label>
            {documentUrl ? (
              <div className="flex items-center gap-3 p-3 bg-surface-tertiary rounded-xl">
                <FileText size={18} className="text-primary shrink-0" />
                <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate flex-1">
                  View uploaded document
                </a>
                <button type="button" onClick={() => setDocumentUrl("")} className="text-xs text-red-500 hover:underline shrink-0">Remove</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDoc}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-3 border-2 border-dashed border-border-light rounded-xl text-sm text-text-tertiary hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {uploadingDoc ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploadingDoc ? "Uploading..." : "Upload license document (PDF, image)"}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving || uploadingDoc} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
              {saving ? "Saving..." : license ? "Update" : "Add License"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
