import { useState, useEffect } from "react";
import { ShieldCheck, Building2, Save } from "lucide-react";
import { tpaInsuranceService, type TpaInsuranceCompany } from "@/lib/services";

export default function BusinessTpaInsurancePage() {
    const [companies, setCompanies] = useState<TpaInsuranceCompany[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        Promise.all([tpaInsuranceService.list(), tpaInsuranceService.mySelections()])
            .then(([allRes, myRes]) => {
                setCompanies(allRes.data);
                setSelected(new Set(myRes.data));
            })
            .catch(() => setMessage({ type: "error", text: "Failed to load" }))
            .finally(() => setLoading(false));
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
        setMessage(null);
        try {
            await tpaInsuranceService.saveSelections([...selected]);
            setMessage({ type: "success", text: "Saved successfully" });
        } catch {
            setMessage({ type: "error", text: "Failed to save" });
        } finally {
            setSaving(false);
        }
    };

    const tpas = companies.filter((c) => c.type === "TPA");
    const insurances = companies.filter((c) => c.type === "INSURANCE");

    const CompanyGrid = ({ list }: { list: TpaInsuranceCompany[] }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {list.map((c) => {
                const isSelected = selected.has(c.id);
                return (
                    <button key={c.id} onClick={() => toggle(c.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                ? "border-accent bg-accent/5 text-accent"
                                : "border-border-light bg-white text-text-primary hover:border-accent/40"
                            }`}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-accent border-accent" : "border-border-light"
                            }`}>
                            {isSelected && <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span className="text-sm font-medium">{c.name}</span>
                    </button>
                );
            })}
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => <div key={i} className="h-48 bg-white rounded-xl border border-border-light animate-pulse" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">TPA & Insurance</h1>
                    <p className="text-sm text-text-secondary mt-1">Select the TPA and insurance companies your hospital accepts</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
                    <Save size={16} />
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>

            {message && (
                <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl border border-border-light p-6">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck size={18} className="text-primary" />
                    <h2 className="text-base font-semibold text-text-primary">TPA Companies</h2>
                    <span className="text-xs text-text-tertiary ml-auto">{[...selected].filter(id => tpas.find(c => c.id === id)).length} selected</span>
                </div>
                {tpas.length === 0
                    ? <p className="text-sm text-text-tertiary">No TPA companies available yet</p>
                    : <CompanyGrid list={tpas} />}
            </div>

            <div className="bg-white rounded-xl border border-border-light p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 size={18} className="text-primary" />
                    <h2 className="text-base font-semibold text-text-primary">Insurance Companies</h2>
                    <span className="text-xs text-text-tertiary ml-auto">{[...selected].filter(id => insurances.find(c => c.id === id)).length} selected</span>
                </div>
                {insurances.length === 0
                    ? <p className="text-sm text-text-tertiary">No insurance companies available yet</p>
                    : <CompanyGrid list={insurances} />}
            </div>
        </div>
    );
}