import { useState, useEffect } from "react";
import { MapPin, Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { locationService, type LocationItem } from "@/lib/services";

interface LocationTree {
  states: (LocationItem & { districts?: (LocationItem & { cities?: LocationItem[] })[] })[];
}

export default function LocationsPage() {
  const [tree, setTree] = useState<LocationTree>({ states: [] });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [districtMap, setDistrictMap] = useState<Record<string, LocationItem[]>>({});
  const [cityMap, setCityMap] = useState<Record<string, LocationItem[]>>({});
  const [showAdd, setShowAdd] = useState<{ type: "state" | "district" | "city" | "area"; parentId?: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    locationService.states()
      .then((states) => setTree({ states }))
      .catch(() => setMessage({ type: "error", text: "Failed to load states" }))
      .finally(() => setLoading(false));
  }, []);

  const toggleState = async (stateId: string) => {
    if (expanded[stateId]) {
      setExpanded((prev) => ({ ...prev, [stateId]: false }));
      return;
    }
    if (!districtMap[stateId]) {
      try {
        const districts = await locationService.districts(stateId);
        setDistrictMap((prev) => ({ ...prev, [stateId]: districts }));
      } catch { /* ignore */ }
    }
    setExpanded((prev) => ({ ...prev, [stateId]: true }));
  };

  const toggleDistrict = async (districtId: string) => {
    if (expanded[districtId]) {
      setExpanded((prev) => ({ ...prev, [districtId]: false }));
      return;
    }
    if (!cityMap[districtId]) {
      try {
        const cities = await locationService.cities(districtId);
        setCityMap((prev) => ({ ...prev, [districtId]: cities }));
      } catch { /* ignore */ }
    }
    setExpanded((prev) => ({ ...prev, [districtId]: true }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Location Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage states, districts, cities and areas</p>
        </div>
        <button onClick={() => setShowAdd({ type: "state" })} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">
          <Plus size={16} /> Add State
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-4 animate-pulse">
              <div className="h-4 w-40 bg-surface-tertiary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="divide-y divide-border-light">
            {tree.states.map((state) => (
              <div key={state.id}>
                {/* State */}
                <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer" onClick={() => toggleState(state.id)}>
                  <div className="flex items-center gap-2">
                    {expanded[state.id] ? <ChevronDown size={16} className="text-text-tertiary" /> : <ChevronRight size={16} className="text-text-tertiary" />}
                    <MapPin size={14} className="text-red-500" />
                    <span className="text-sm font-medium text-text-primary">{state.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setShowAdd({ type: "district", parentId: state.id }); }} className="px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg">+ District</button>
                </div>

                {/* Districts */}
                {expanded[state.id] && districtMap[state.id] && (
                  <div className="bg-slate-50/50">
                    {districtMap[state.id].length === 0 ? (
                      <p className="pl-12 py-2 text-xs text-text-tertiary">No districts</p>
                    ) : (
                      districtMap[state.id].map((district) => (
                        <div key={district.id}>
                          <div className="flex items-center justify-between pl-10 pr-4 py-2 hover:bg-slate-100 cursor-pointer" onClick={() => toggleDistrict(district.id)}>
                            <div className="flex items-center gap-2">
                              {expanded[district.id] ? <ChevronDown size={14} className="text-text-tertiary" /> : <ChevronRight size={14} className="text-text-tertiary" />}
                              <span className="text-xs font-medium text-text-secondary">{district.name}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setShowAdd({ type: "city", parentId: district.id }); }} className="px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/5 rounded">+ City</button>
                          </div>

                          {/* Cities */}
                          {expanded[district.id] && cityMap[district.id] && (
                            <div className="pl-18">
                              {cityMap[district.id].length === 0 ? (
                                <p className="pl-20 py-1 text-[11px] text-text-tertiary">No cities</p>
                              ) : (
                                cityMap[district.id].map((city) => (
                                  <div key={city.id} className="flex items-center justify-between pl-20 pr-4 py-1.5">
                                    <span className="text-xs text-text-tertiary">{city.name}</span>
                                    <button onClick={() => setShowAdd({ type: "area", parentId: city.id })} className="px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/5 rounded">+ Area</button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border-light bg-slate-50 text-xs text-text-tertiary">
            {tree.states.length} States / UTs
          </div>
        </div>
      )}

      {showAdd && (
        <AddLocationModal
          type={showAdd.type}
          parentId={showAdd.parentId}
          onClose={() => setShowAdd(null)}
          onSaved={() => {
            setShowAdd(null);
            setMessage({ type: "success", text: `${showAdd.type.charAt(0).toUpperCase() + showAdd.type.slice(1)} added` });
            // Refresh relevant data
            if (showAdd.type === "state") {
              locationService.states().then((states) => setTree({ states }));
            } else if (showAdd.type === "district" && showAdd.parentId) {
              locationService.districts(showAdd.parentId).then((d) => setDistrictMap((prev) => ({ ...prev, [showAdd.parentId!]: d })));
            } else if (showAdd.type === "city" && showAdd.parentId) {
              locationService.cities(showAdd.parentId).then((c) => setCityMap((prev) => ({ ...prev, [showAdd.parentId!]: c })));
            }
          }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function AddLocationModal({ type, parentId, onClose, onSaved, onError }: {
  type: "state" | "district" | "city" | "area"; parentId?: string; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (type === "state") await locationService.createState({ name });
      else if (type === "district" && parentId) await locationService.createDistrict({ name, stateId: parentId });
      else if (type === "city" && parentId) await locationService.createCity({ name, districtId: parentId });
      else if (type === "area" && parentId) await locationService.createArea({ name, cityId: parentId });
      onSaved();
    } catch {
      onError(`Failed to add ${type}`);
    } finally {
      setSaving(false);
    }
  };

  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold">Add {label}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">{label} Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder={`Enter ${type} name`} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Adding..." : `Add ${label}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
