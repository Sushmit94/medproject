import { useState, useEffect } from "react";
import { Link2, Unlink, Bell, Check, XCircle } from "lucide-react";
import { staffLinkService, type StaffMember, type StaffLinkRequest } from "@/lib/services";

export default function LinkedBusinessPage() {
  const [linkedStaff, setLinkedStaff] = useState<StaffMember | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<StaffLinkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [linkRes, reqRes] = await Promise.allSettled([
        staffLinkService.myLink(),
        staffLinkService.incomingRequests(),
      ]);
      if (linkRes.status === "fulfilled") setLinkedStaff(linkRes.value.data);
      if (reqRes.status === "fulfilled") setIncomingRequests(reqRes.value.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleAccept = async (id: string) => {
    try {
      await staffLinkService.accept(id);
      setMessage({ type: "success", text: "Request accepted! You are now linked." });
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

  const handleUnlink = async () => {
    if (!linkedStaff) return;
    if (!confirm("Unlink from this business? You will be removed from their staff list.")) return;
    try {
      await staffLinkService.unlink(linkedStaff.id);
      setLinkedStaff(null);
      setMessage({ type: "success", text: "Unlinked successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to unlink" });
    }
  };

  const pendingRequests = incomingRequests.filter((r) => r.status === "PENDING");

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-border-light p-6 animate-pulse">
            <div className="h-4 w-48 bg-surface-tertiary rounded" />
            <div className="h-3 w-32 bg-surface-tertiary rounded mt-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Linked Business</h1>
        <p className="text-sm text-text-secondary mt-1">View and manage your business association</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Current linked business */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Link2 size={18} /> Current Association
        </h2>
        {linkedStaff ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {linkedStaff.business?.image ? (
                <img src={linkedStaff.business.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center text-accent font-bold text-lg">
                  {linkedStaff.business?.name?.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-text-primary">{linkedStaff.business?.name}</p>
                <p className="text-sm text-text-secondary">{linkedStaff.business?.category?.name}</p>
                {linkedStaff.business?.address && (
                  <p className="text-xs text-text-tertiary mt-1">{linkedStaff.business.address}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleUnlink}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Unlink size={14} /> Unlink
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-14 h-14 bg-surface-tertiary rounded-full flex items-center justify-center mb-3">
              <Link2 size={24} className="text-text-tertiary" />
            </div>
            <p className="text-sm font-medium text-text-secondary">You are not linked to any business yet</p>
            <p className="text-xs text-text-tertiary mt-1">
              A hospital or pharmacy will send you a link request. You can accept or decline it below.
            </p>
          </div>
        )}
      </div>

      {/* Pending link requests */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Bell size={18} /> Pending Requests ({pendingRequests.length})
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-4">No pending link requests</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between gap-4 p-4 bg-surface-secondary rounded-xl">
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
                    className="p-2 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"
                    title="Decline"
                  >
                    <XCircle size={18} />
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
        )}
      </div>

      {/* All past requests */}
      {incomingRequests.filter((r) => r.status !== "PENDING").length > 0 && (
        <div className="bg-white rounded-xl border border-border-light p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Request History</h2>
          <div className="space-y-2">
            {incomingRequests.filter((r) => r.status !== "PENDING").map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 border border-border-light rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-surface-tertiary rounded-full flex items-center justify-center text-text-tertiary font-bold text-xs">
                    {req.business?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-text-primary">{req.business?.name}</p>
                    <p className="text-xs text-text-tertiary">{req.business?.category?.name}</p>
                  </div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 border rounded-full font-medium ${
                  req.status === "ACCEPTED" ? "bg-green-50 text-green-700 border-green-200" :
                  req.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                  "bg-gray-50 text-gray-500 border-gray-200"
                }`}>
                  {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
