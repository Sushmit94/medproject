import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ShieldCheck, Building2 } from "lucide-react";
import { tpaInsuranceService, type TpaInsuranceCompany } from "@/lib/services";

export default function TpaInsurancePage() {
    const [companies, setCompanies] = useState<TpaInsuranceCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<TpaInsuranceCompany | null>(null);
    const [form, setForm] = useState({ name: "", type: "TPA" as "TPA" | "INSURANCE" });
    const [saving, setSaving] = useState(false);

    const load = () => {
        setLoading(true);
        tpaInsuranceService.list()
            .then((res) => setCompanies(res.data))
            .catch(() => setMessage({ type: "error", text: "Failed to load" }))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: "", type: "TPA" }); setShowForm(true); };
    const openEdit = (c: TpaInsuranceCompany) => { setEditing(c); setForm({ name: c.name, type: c.type }); setShowForm(true); };

    const handleSubmit = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (editing) {
                await tpaInsuranceService.update(editing.id, form);
                setMessage({ type: "success", text: "Updated successfully" });
            } else {
                await tpaInsuranceService.create(form);
                setMessage({ type: "success", text: "Created successfully" });
            }
            setShowForm(false);
            load();
        } catch {
            setMessage({ type: "error", text: "Failed to save" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this company?")) return;
        try {
            await tpaInsuranceService.delete(id);
            setMessage({ type: "success", text: "Deleted" });
            load();
        } catch {
            setMessage({ type: "error", text: "Failed to delete" });
        }
    };

    const handleToggle = async (c: TpaInsuranceCompany) => {
        try {
            await tpaInsuranceService.update(c.id, { isActive: !c.isActive });
            load();
        } catch {
            setMessage({ type: "error", text: "Failed to update" });
        }
    };

    const tpas = companies.filter((c) => c.type === "TPA");
    const insurances = companies.filter((c) => c.type === "INSURANCE");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">TPA & Insurance</h1>
                    <p className="text-sm text-text-secondary mt-1">Manage TPA and insurance companies for hospitals</p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90">
                    <Plus size={16} /> Add Company
                </button>
            </div>

            {message && (
                <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)} className="ml-2 opacity-60 hover:opacity-100">×</button>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl border border-border-light p-6">
                    <h2 className="text-base font-semibold text-text-primary mb-4">
                        {editing ? "Edit Company" : "Add New Company"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Company Name *</label>
                            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Star Health Insurance"
                                className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Type *</label>
                            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "TPA" | "INSURANCE" }))}
                                className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white">
                                <option value="TPA">TPA</option>
                                <option value="INSURANCE">Insurance</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={handleSubmit} disabled={saving || !form.name.trim()}
                            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
                            {saving ? "Saving..." : editing ? "Update" : "Create"}
                        </button>
                        <button onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-surface-secondary text-text-primary text-sm font-medium rounded-xl hover:bg-surface-tertiary">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white rounded-xl border border-border-light animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* TPA Section */}
                    <div className="bg-white rounded-xl border border-border-light p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck size={18} className="text-primary" />
                            <h2 className="text-base font-semibold text-text-primary">TPA Companies ({tpas.length})</h2>
                        </div>
                        {tpas.length === 0 ? (
                            <p className="text-sm text-text-tertiary text-center py-6">No TPA companies added yet</p>
                        ) : (
                            <div className="space-y-2">
                                {tpas.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full ${c.isActive ? "bg-green-500" : "bg-slate-300"}`} />
                                            <span className={`text-sm font-medium ${c.isActive ? "text-text-primary" : "text-text-tertiary"}`}>{c.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleToggle(c)}
                                                className={`px-2 py-1 text-xs rounded-lg font-medium ${c.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                                {c.isActive ? "Active" : "Inactive"}
                                            </button>
                                            <button onClick={() => openEdit(c)} className="p-1.5 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg"><Pencil size={14} /></button>
                                            <button onClick={() => handleDelete(c.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Insurance Section */}
                    <div className="bg-white rounded-xl border border-border-light p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={18} className="text-primary" />
                            <h2 className="text-base font-semibold text-text-primary">Insurance Companies ({insurances.length})</h2>
                        </div>
                        {insurances.length === 0 ? (
                            <p className="text-sm text-text-tertiary text-center py-6">No insurance companies added yet</p>
                        ) : (
                            <div className="space-y-2">
                                {insurances.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full ${c.isActive ? "bg-green-500" : "bg-slate-300"}`} />
                                            <span className={`text-sm font-medium ${c.isActive ? "text-text-primary" : "text-text-tertiary"}`}>{c.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleToggle(c)}
                                                className={`px-2 py-1 text-xs rounded-lg font-medium ${c.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                                {c.isActive ? "Active" : "Inactive"}
                                            </button>
                                            <button onClick={() => openEdit(c)} className="p-1.5 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg"><Pencil size={14} /></button>
                                            <button onClick={() => handleDelete(c.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}