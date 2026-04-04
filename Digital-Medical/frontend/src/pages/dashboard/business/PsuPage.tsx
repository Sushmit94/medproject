import { useState, useEffect } from "react";
import { Building2, Save, Loader2 } from "lucide-react";
import { psuService, PsuOrganization } from "../../../lib/services";

export default function BusinessPsuPage() {
    const [orgs, setOrgs] = useState<PsuOrganization[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [orgsRes, selRes] = await Promise.all([
                    psuService.list(),
                    psuService.mySelections(),
                ]);
                setOrgs(orgsRes.data ?? []);
                setSelected(new Set(selRes.data ?? []));
            } catch {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await psuService.saveSelections(Array.from(selected));
            setSuccess("PSU empanelments saved successfully!");
        } catch {
            setError("Failed to save selections");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">PSU Empanelments</h1>
                    <p className="text-sm text-gray-500">
                        Select the government / public sector organizations your hospital is empanelled with
                    </p>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}
            {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
            )}

            {orgs.length === 0 ? (
                <div className="mt-8 text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No PSU organizations available yet.</p>
                    <p className="text-xs mt-1">Ask your admin to add them.</p>
                </div>
            ) : (
                <>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {orgs.map((org) => {
                            const isChecked = selected.has(org.id);
                            return (
                                <label
                                    key={org.id}
                                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition select-none ${isChecked
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggle(org.id)}
                                        className="w-4 h-4 accent-blue-600 rounded"
                                    />
                                    <span className={`text-sm font-medium ${isChecked ? "text-blue-700" : "text-gray-700"}`}>
                                        {org.name}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {selected.size} of {orgs.length} selected
                        </p>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Selections"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}