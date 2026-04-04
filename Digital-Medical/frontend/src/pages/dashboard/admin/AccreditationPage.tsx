import { useState, useEffect } from "react";
import { Award, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { accreditationService, AccreditationBody } from "../../../lib/services";

export default function AdminAccreditationPage() {
    const [bodies, setBodies] = useState<AccreditationBody[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formName, setFormName] = useState("");

    const fetchBodies = async () => {
        try {
            setLoading(true);
            const res = await accreditationService.listAll();
            setBodies(res.data ?? []);
        } catch {
            setError("Failed to load accreditation bodies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBodies(); }, []);

    const resetForm = () => {
        setFormName("");
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (body: AccreditationBody) => {
        setFormName(body.name);
        setEditingId(body.id);
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!formName.trim()) { setError("Name is required"); return; }
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            if (editingId) {
                await accreditationService.update(editingId, { name: formName.trim() });
                setSuccess("Accreditation body updated");
            } else {
                await accreditationService.create({ name: formName.trim() });
                setSuccess("Accreditation body added");
            }
            resetForm();
            fetchBodies();
        } catch {
            setError("Failed to save accreditation body");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (body: AccreditationBody) => {
        try {
            await accreditationService.update(body.id, { isActive: !body.isActive });
            fetchBodies();
        } catch {
            setError("Failed to toggle status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this accreditation body? This will also remove all hospital selections.")) return;
        try {
            await accreditationService.delete(id);
            setSuccess("Deleted successfully");
            fetchBodies();
        } catch {
            setError("Failed to delete");
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Accreditation Bodies</h1>
                        <p className="text-sm text-gray-500">Manage bodies like NABH, NABL, JCI, ISO etc.</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Body
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
                        {editingId ? "Edit Accreditation Body" : "Add Accreditation Body"}
                    </h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. NABH, NABL, JCI, ISO 9001"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
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
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
            ) : bodies.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No accreditation bodies yet. Add one to get started.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {bodies.map((body) => (
                        <div
                            key={body.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-200 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${body.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                                <span className={`text-sm font-medium ${body.isActive ? "text-gray-900" : "text-gray-400"}`}>
                                    {body.name}
                                </span>
                                {!body.isActive && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggle(body)}
                                    className="p-1.5 text-gray-400 hover:text-purple-600 transition"
                                    title={body.isActive ? "Deactivate" : "Activate"}
                                >
                                    {body.isActive
                                        ? <ToggleRight className="w-5 h-5 text-green-500" />
                                        : <ToggleLeft className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => handleEdit(body)}
                                    className="p-1.5 text-gray-400 hover:text-purple-600 transition"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(body.id)}
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
                {bodies.filter(b => b.isActive).length} active · {bodies.filter(b => !b.isActive).length} inactive
            </p>
        </div>
    );
}