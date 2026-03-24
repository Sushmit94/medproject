import { useState, useEffect, FormEvent } from "react";
import { Heart, Search, Droplets, Phone, MapPin, AlertCircle, Plus } from "lucide-react";
import { bloodService, locationService, type BloodDonor, type BloodRequest, type LocationItem } from "@/lib/services";
import { BLOOD_GROUPS } from "@/lib/serviceConstants";

type Tab = "find" | "donate" | "requests";

const URGENCY_OPTIONS = ["NORMAL", "URGENT", "CRITICAL"] as const;

export default function BloodBankPage() {
  const [tab, setTab] = useState<Tab>("find");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Donate form state
  const [donorForm, setDonorForm] = useState({ bloodGroup: "", stateId: "", districtId: "", cityId: "" });
  const [donorSubmitting, setDonorSubmitting] = useState(false);
  const [donorMsg, setDonorMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    attendantName: "", attendantPhone: "", patientName: "", bloodGroup: "",
    unitsNeeded: 1, urgency: "NORMAL", hospitalName: "",
  });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMsg, setRequestMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Location cascades
  const [states, setStates] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);

  useEffect(() => { locationService.states().then(setStates).catch(() => {}); }, []);
  useEffect(() => {
    if (donorForm.stateId) locationService.districts(donorForm.stateId).then(setDistricts).catch(() => {});
    else setDistricts([]);
  }, [donorForm.stateId]);
  useEffect(() => {
    if (donorForm.districtId) locationService.cities(donorForm.districtId).then(setCities).catch(() => {});
    else setCities([]);
  }, [donorForm.districtId]);

  useEffect(() => {
    if (tab === "find") {
      setLoading(true);
      const params = new URLSearchParams({ limit: "50" });
      if (selectedGroup) params.set("bloodGroup", selectedGroup);
      bloodService.searchDonors(params.toString())
        .then((res) => setDonors(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === "requests") {
      setLoading(true);
      bloodService.listRequests("limit=50")
        .then((res) => setRequests(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab, selectedGroup]);

  const handleDonorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!donorForm.bloodGroup) return;
    setDonorSubmitting(true);
    setDonorMsg(null);
    try {
      await bloodService.registerDonor(donorForm);
      setDonorMsg({ type: "success", text: "You are now registered as a blood donor!" });
      setDonorForm({ bloodGroup: "", stateId: "", districtId: "", cityId: "" });
    } catch {
      setDonorMsg({ type: "error", text: "Failed to register. Please login first." });
    } finally {
      setDonorSubmitting(false);
    }
  };

  const handleRequestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { attendantName, attendantPhone, patientName, bloodGroup, unitsNeeded, hospitalName } = requestForm;
    if (!attendantName || !attendantPhone || !patientName || !bloodGroup || !unitsNeeded) return;
    setRequestSubmitting(true);
    setRequestMsg(null);
    try {
      await bloodService.createRequest({ ...requestForm, unitsNeeded: Number(unitsNeeded) });
      setRequestMsg({ type: "success", text: "Blood request submitted successfully!" });
      setRequestForm({ attendantName: "", attendantPhone: "", patientName: "", bloodGroup: "", unitsNeeded: 1, urgency: "NORMAL", hospitalName: "" });
      setShowRequestForm(false);
      // Refresh requests list
      bloodService.listRequests("limit=50").then((res) => setRequests(res.data)).catch(() => {});
    } catch {
      setRequestMsg({ type: "error", text: "Failed to submit request. Please login first." });
    } finally {
      setRequestSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-secondary min-h-screen">
      {/* Header */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Droplets size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Blood Bank</h1>
              <p className="text-sm text-white/80">Find donors, donate blood, or request blood</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border-light sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {([
            { key: "find", label: "Find Donors" },
            { key: "donate", label: "Donate Blood" },
            { key: "requests", label: "Blood Requests" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-text-tertiary hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Find Donors */}
        {tab === "find" && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedGroup("")}
                className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${
                  !selectedGroup ? "bg-red-600 text-white border-red-600" : "bg-white border-border-light"
                }`}
              >
                All Groups
              </button>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${
                    selectedGroup === bg ? "bg-red-600 text-white border-red-600" : "bg-white border-border-light"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {donors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-border-light">
                <Search size={28} className="mx-auto mb-2 text-text-tertiary" />
                <p className="text-sm text-text-tertiary">No donors found for this blood group</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {donors.map((d) => (
                  <div key={d.id} className="bg-white rounded-xl border border-border-light p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-red-600">{d.bloodGroup}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-text-primary">{d.user.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-text-tertiary mt-0.5">
                          <span>{d.isAvailable ? "Available" : "Unavailable"}</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={`tel:${d.user.phone}`}
                      className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Phone size={12} /> Contact Donor
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Donate */}
        {tab === "donate" && (
          <div className="max-w-lg mx-auto">
            <form onSubmit={handleDonorSubmit} className="bg-white rounded-xl border border-border-light p-6 text-center">
              <Heart size={40} className="mx-auto mb-3 text-red-500" />
              <h2 className="text-lg font-bold mb-2">Become a Blood Donor</h2>
              <p className="text-sm text-text-tertiary mb-6">Register as a donor and help save lives in your community.</p>
              {donorMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${donorMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {donorMsg.text}
                </div>
              )}
              <div className="space-y-3 text-left">
                <select required value={donorForm.bloodGroup} onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border-light text-sm">
                  <option value="">Select Blood Group *</option>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
                <select value={donorForm.stateId} onChange={(e) => setDonorForm({ ...donorForm, stateId: e.target.value, districtId: "", cityId: "" })} className="w-full px-3 py-2 rounded-lg border border-border-light text-sm">
                  <option value="">Select State</option>
                  {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {districts.length > 0 && (
                  <select value={donorForm.districtId} onChange={(e) => setDonorForm({ ...donorForm, districtId: e.target.value, cityId: "" })} className="w-full px-3 py-2 rounded-lg border border-border-light text-sm">
                    <option value="">Select District</option>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
                {cities.length > 0 && (
                  <select value={donorForm.cityId} onChange={(e) => setDonorForm({ ...donorForm, cityId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border-light text-sm">
                    <option value="">Select City</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                <button type="submit" disabled={donorSubmitting} className="w-full py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {donorSubmitting ? "Registering..." : "Register as Donor"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests */}
        {tab === "requests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-tertiary">{requests.length} active requests</p>
              <button onClick={() => setShowRequestForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
                <Plus size={14} /> Request Blood
              </button>
            </div>

            {requestMsg && (
              <div className={`p-3 rounded-lg text-sm ${requestMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {requestMsg.text}
              </div>
            )}

            {showRequestForm && (
              <form onSubmit={handleRequestSubmit} className="bg-white rounded-xl border border-red-200 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-text-primary">New Blood Request</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="Attendant Name *" value={requestForm.attendantName} onChange={(e) => setRequestForm({ ...requestForm, attendantName: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                  <input required placeholder="Attendant Phone *" value={requestForm.attendantPhone} onChange={(e) => setRequestForm({ ...requestForm, attendantPhone: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                </div>
                <input required placeholder="Patient Name *" value={requestForm.patientName} onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border-light text-sm" />
                <div className="grid grid-cols-3 gap-3">
                  <select required value={requestForm.bloodGroup} onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm">
                    <option value="">Blood Group *</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                  <input required type="number" min={1} placeholder="Units *" value={requestForm.unitsNeeded} onChange={(e) => setRequestForm({ ...requestForm, unitsNeeded: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                  <select value={requestForm.urgency} onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm">
                    {URGENCY_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <input placeholder="Hospital Name" value={requestForm.hospitalName} onChange={(e) => setRequestForm({ ...requestForm, hospitalName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border-light text-sm" />
                <div className="flex gap-2">
                  <button type="submit" disabled={requestSubmitting} className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50">
                    {requestSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                  <button type="button" onClick={() => setShowRequestForm(false)} className="px-4 py-2 rounded-lg border border-border-light text-xs font-medium">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {requests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-border-light">
                <p className="text-sm text-text-tertiary">No active blood requests</p>
              </div>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-red-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-red-600">{r.bloodGroup}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary">{r.patientName}</h3>
                          <p className="text-xs text-text-tertiary">{r.hospitalName}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                          r.urgency === "CRITICAL" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {r.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-2">
                        Units needed: <strong>{r.unitsNeeded}</strong> · Posted: <strong>{new Date(r.createdAt).toLocaleDateString()}</strong>
                      </p>
                      <div className="flex gap-2 mt-3">
                        <a
                          href={`tel:${r.attendantPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                        >
                          <Phone size={12} /> Call {r.attendantPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
