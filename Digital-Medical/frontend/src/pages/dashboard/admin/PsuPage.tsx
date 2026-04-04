import { useState, useEffect } from "react";
import { Building2, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { psuService, PsuOrganization } from "../../../lib/services";

export default function AdminPsuPage() {
    const [orgs, setOrgs] = useState<PsuOrganization[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formName, setFormName] = useState("");

    const fetchOrgs = async () => {
        try {
            setLoading(true);
            const res = await psuService.listAll();
            setOrgs(res.data ?? []);
        } catch {
            setError("Failed to load PSU organizations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrgs(); }, []);

    const resetForm = () => {
        setFormName("");
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (org: PsuOrganization) => {
        setFormName(org.name);
        setEditingId(org.id);
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!formName.trim()) { setError("Name is required"); return; }
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            if (editingId) {
                await psuService.update(editingId, { name: formName.trim() });
                setSuccess("PSU organization updated");
            } else {
                await psuService.create({ name: formName.trim() });
                setSuccess("PSU organization added");
            }
            resetForm();
            fetchOrgs();
        } catch {
            setError("Failed to save PSU organization");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (org: PsuOrganization) => {
        try {
            await psuService.update(org.id, { isActive: !org.isActive });
            fetchOrgs();
        } catch {
            setError("Failed to toggle status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this PSU organization? This will also remove all hospital selections.")) return;
        try {
            await psuService.delete(id);
            setSuccess("Deleted successfully");
            fetchOrgs();
        } catch {
            setError("Failed to delete");
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">PSU Organizations</h1>
                        <p className="text-sm text-gray-500">Manage government/public sector tie-up organizations</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add PSU
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">
                        {editingId ? "Edit PSU Organization" : "Add PSU Organization"}
                    </h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. CGHS, ECHS, ESI, Railways"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                            {editingId ? "Update" : "Add"}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            ) : orgs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No PSU organizations yet. Add one to get started.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {orgs.map((org) => (
                        <div
                            key={org.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${org.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                                <span className={`text-sm font-medium ${org.isActive ? "text-gray-900" : "text-gray-400"}`}>
                                    {org.name}
                                </span>
                                {!org.isActive && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggle(org)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                                    title={org.isActive ? "Deactivate" : "Activate"}
                                >
                                    {org.isActive
                                        ? <ToggleRight className="w-5 h-5 text-green-500" />
                                        : <ToggleLeft className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => handleEdit(org)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(org.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 transition"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="mt-4 text-xs text-gray-400">
                {orgs.filter(o => o.isActive).length} active · {orgs.filter(o => !o.isActive).length} inactive
            </p>
        </div>
    );
}