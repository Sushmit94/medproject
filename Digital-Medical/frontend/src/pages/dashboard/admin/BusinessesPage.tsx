import { useState, useEffect } from "react";
import { Building2, CheckCircle, XCircle, Clock, Eye, Search, ChevronDown } from "lucide-react";
import { adminService, type BusinessProfile } from "@/lib/services";

export default function BusinessesPage() {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<BusinessProfile | null>(null);
  const [newSupplyChainRole, setNewSupplyChainRole] = useState("");
  const [changingRole, setChangingRole] = useState(false);

  // Sync role selector when modal opens
  useEffect(() => {
    setNewSupplyChainRole(selected?.supplyChainRole || "");
  }, [selected]);

  const loadData = () => {
    setLoading(true);
    if (tab === "pending") {
      adminService.pendingBusinesses()
        .then((res) => { setBusinesses(res.data); setTotalPages(1); })
        .catch(() => setMessage({ type: "error", text: "Failed to load businesses" }))
        .finally(() => setLoading(false));
    } else {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      adminService.businesses(params.toString())
        .then((res) => { setBusinesses(res.data); setTotalPages(res.pagination.totalPages); })
        .catch(() => setMessage({ type: "error", text: "Failed to load businesses" }))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => { loadData(); }, [tab, page, search]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await adminService.updateBusinessStatus(id, status);
      setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      if (tab === "pending") setBusinesses((prev) => prev.filter((b) => b.id !== id));
      setMessage({ type: "success", text: `Business ${status.toLowerCase()}` });
    } catch {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  const handleRoleChange = async () => {
    if (!selected) return;
    const roleValue = newSupplyChainRole || null;
    setChangingRole(true);
    try {
      await adminService.updateBusiness(selected.id, { supplyChainRole: roleValue });
      const updatedBiz = { ...selected, supplyChainRole: roleValue };
      setSelected(updatedBiz as BusinessProfile);
      setBusinesses((prev) => prev.map((b) => b.id === selected.id ? updatedBiz as BusinessProfile : b));
      setMessage({ type: "success", text: roleValue ? `Supply chain role set to ${roleValue}` : "Supply chain role cleared" });
    } catch {
      setMessage({ type: "error", text: "Failed to update supply chain role" });
    } finally {
      setChangingRole(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Business Management</h1>
        <p className="text-sm text-text-secondary mt-1">Approve and manage businesses</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          <button onClick={() => { setTab("pending"); setPage(1); }} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === "pending" ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}>
            <Clock size={14} className="inline mr-1.5 -mt-0.5" /> Pending
          </button>
          <button onClick={() => { setTab("all"); setPage(1); }} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === "all" ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}>
            All Businesses
          </button>
        </div>

        {tab === "all" && (
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search businesses..." className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">Search</button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 animate-pulse">
              <div className="h-5 w-48 bg-surface-tertiary rounded" />
              <div className="h-4 w-32 bg-surface-tertiary rounded mt-2" />
            </div>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Building2 size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">{tab === "pending" ? "No pending businesses" : "No businesses found"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {businesses.map((biz) => (
            <div key={biz.id} className="bg-white rounded-xl border border-border-light p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-text-primary">{biz.name}</h3>
                    <span className="text-xs text-text-tertiary">({biz.businessId})</span>
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${
                      biz.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      biz.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      biz.status === "DISABLED" ? "bg-slate-100 text-slate-600" :
                      "bg-red-100 text-red-700"
                    }`}>{biz.status}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">Category: {biz.category?.name || "N/A"}</p>
                  {biz.area && (
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {biz.area.name}, {biz.area.city.name}{biz.area.city.district?.state?.name ? `, ${biz.area.city.district.state.name}` : ""}
                    </p>
                  )}
                  <div className="flex gap-3 mt-1 text-xs text-text-tertiary">
                    {biz.phone1 && <span>{biz.phone1}</span>}
                    {biz.email && <span>{biz.email}</span>}
                    <span>Tier: {biz.subscriptionTier}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(biz)} className="p-2 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg">
                    <Eye size={16} />
                  </button>
                  {biz.status === "PENDING" && (
                    <>
                      <button onClick={() => handleStatusUpdate(biz.id, "ACTIVE")} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                        <CheckCircle size={14} className="inline mr-1 -mt-0.5" /> Approve
                      </button>
                      <button onClick={() => handleStatusUpdate(biz.id, "REJECTED")} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
                        <XCircle size={14} className="inline mr-1 -mt-0.5" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {tab === "all" && totalPages > 1 && (
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border-light flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-text-tertiary hover:text-text-primary">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <InfoRow label="Business ID" value={selected.businessId} />
              <InfoRow label="Status" value={selected.status} />
              <InfoRow label="Category" value={selected.category?.name} />
              <InfoRow label="Subscription" value={selected.subscriptionTier} />
              <InfoRow label="Phone" value={[selected.phone1, selected.phone2, selected.phone3].filter(Boolean).join(", ")} />
              <InfoRow label="Email" value={selected.email} />
              <InfoRow label="Address" value={selected.address} />
              <InfoRow label="About" value={selected.about} />
              <InfoRow label="Website" value={selected.website} />
              <InfoRow label="Supply Chain" value={selected.supplyChainRole} />
              <div className="flex">
                <span className="w-32 shrink-0 font-medium text-text-secondary">Set Role</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-[200px]">
                    <select
                      value={newSupplyChainRole}
                      onChange={(e) => setNewSupplyChainRole(e.target.value)}
                      className="w-full pr-8 pl-3 py-1.5 border border-border-light rounded-lg text-sm appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      <option value="">— none —</option>
                      <option value="RETAILER">RETAILER (Medical)</option>
                      <option value="WHOLESALER">WHOLESALER</option>
                      <option value="MANUFACTURER">MANUFACTURER</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  </div>
                  <button
                    onClick={handleRoleChange}
                    disabled={changingRole}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {changingRole ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
              <InfoRow label="Flags" value={[selected.isPopular && "Popular", selected.isVerified && "Verified", selected.isEmergency && "Emergency"].filter(Boolean).join(", ") || "None"} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex">
      <span className="w-32 shrink-0 font-medium text-text-secondary">{label}</span>
      <span className="text-text-primary">{value || "—"}</span>
    </div>
  );
}
