import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { licenseService, type License } from "@/lib/services";

const statusConfig: Record<string, { color: string }> = {
  PENDING: { color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  VERIFIED: { color: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { color: "bg-red-50 text-red-700 border-red-200" },
};

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<(License & { business?: { name: string; businessId: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: string } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const loadLicenses = (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    licenseService.listAll(params.toString())
      .then((res) => {
        setLicenses(res.data as typeof licenses);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load licenses" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLicenses(); }, [page, statusFilter]);

  const handleVerify = async (id: string, status: string, note = "") => {
    try {
      await licenseService.verify(id, { status, rejectionNote: note || undefined });
      setLicenses((prev) => prev.map((l) => l.id === id ? { ...l, status, rejectionNote: note } : l));
      if (statusFilter) setLicenses((prev) => prev.filter((l) => l.id !== id));
      setMessage({ type: "success", text: `License ${status.toLowerCase()}` });
      setNoteModal(null);
    } catch {
      setMessage({ type: "error", text: "Failed to update license" });
    }
  };

  const openNoteModal = (id: string, action: string) => {
    setAdminNote("");
    setNoteModal({ id, action });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">License Management</h1>
        <p className="text-sm text-text-secondary mt-1">Verify business licenses</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {["PENDING", "VERIFIED", "REJECTED", ""].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-4 py-2 text-sm font-medium rounded-lg ${statusFilter === s ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 animate-pulse">
              <div className="h-4 w-48 bg-surface-tertiary rounded" />
              <div className="h-3 w-32 bg-surface-tertiary rounded mt-2" />
            </div>
          ))}
        </div>
      ) : licenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <FileText size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No {statusFilter ? statusFilter.toLowerCase() : ""} licenses found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {licenses.map((lic) => {
            const cfg = statusConfig[lic.status] || statusConfig.PENDING;
            return (
              <div key={lic.id} className="bg-white rounded-xl border border-border-light p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-text-primary">{lic.type}</h3>
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md border ${cfg.color}`}>{lic.status}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">License No: {lic.licenseNo}</p>
                    {lic.business && (
                      <p className="text-xs text-primary font-medium mt-0.5">{lic.business.name} ({lic.business.businessId})</p>
                    )}
                    <div className="flex gap-4 mt-1 text-xs text-text-tertiary">
                      {lic.issuedBy && <span>Issued by: {lic.issuedBy}</span>}
                      {lic.issueDate && <span>Issued: {new Date(lic.issueDate).toLocaleDateString()}</span>}
                      {lic.expiryDate && <span>Expires: {new Date(lic.expiryDate).toLocaleDateString()}</span>}
                    </div>
                    {lic.rejectionNote && <p className="text-xs text-yellow-700 mt-1.5">Note: {lic.rejectionNote}</p>}
                  </div>
                  {lic.status === "PENDING" && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleVerify(lic.id, "VERIFIED")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                        <CheckCircle size={14} /> Verify
                      </button>
                      <button onClick={() => openNoteModal(lic.id, "REJECTED")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-text-tertiary">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium border border-border-light rounded-lg disabled:opacity-50 hover:bg-surface-tertiary">Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-medium border border-border-light rounded-lg disabled:opacity-50 hover:bg-surface-tertiary">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <h3 className="text-base font-semibold text-text-primary mb-3">Rejection Note</h3>
            <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} placeholder="Reason for rejection (optional)" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setNoteModal(null)} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
              <button onClick={() => handleVerify(noteModal.id, noteModal.action, adminNote)} className="px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600">Reject License</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
