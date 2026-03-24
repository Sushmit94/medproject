import { useState, useEffect } from "react";
import { Plus, Tag, Edit2, Trash2, X, ChevronDown, ChevronRight } from "lucide-react";
import { categoryService, type CategoryItem, type CategoryDetail } from "@/lib/services";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<CategoryDetail["subcategories"]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [parentId, setParentId] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadCategories = () => {
    setLoading(true);
    categoryService.list()
      .then(setCategories)
      .catch(() => setMessage({ type: "error", text: "Failed to load categories" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const handleExpand = async (id: string, slug: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    setSubLoading(true);
    try {
      const detail = await categoryService.getBySlug(slug);
      setSubcategories(detail.subcategories);
    } catch {
      setSubcategories([]);
    } finally {
      setSubLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setMessage({ type: "success", text: "Category deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete category. It may have businesses." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Category Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage categories and subcategories</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-4 animate-pulse">
              <div className="h-5 w-40 bg-surface-tertiary rounded" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Tag size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No categories yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-border-light overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <button onClick={() => handleExpand(cat.id, cat.slug)} className="flex items-center gap-3 flex-1 text-left">
                  {expanded === cat.id ? <ChevronDown size={16} className="text-text-tertiary" /> : <ChevronRight size={16} className="text-text-tertiary" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{cat.name}</span>
                      <span className="text-xs text-text-tertiary">({cat._count.businesses} businesses)</span>
                      {cat.isService && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700">Service</span>}
                      {!cat.isActive && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-500">Inactive</span>}
                    </div>
                    <p className="text-xs text-text-tertiary">/{cat.slug} | Order: {cat.sortOrder}</p>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setParentId(cat.id); setShowSubModal(true); }} className="px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg">+ Sub</button>
                  <button onClick={() => { setEditing(cat); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>

              {expanded === cat.id && (
                <div className="border-t border-border-light bg-slate-50 px-4 py-3">
                  {subLoading ? (
                    <p className="text-xs text-text-tertiary animate-pulse">Loading subcategories...</p>
                  ) : subcategories.length === 0 ? (
                    <p className="text-xs text-text-tertiary">No subcategories</p>
                  ) : (
                    <div className="space-y-1.5">
                      {subcategories.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between py-1.5 px-3 bg-white rounded-lg">
                          <span className="text-xs text-text-primary font-medium">{sub.name}</span>
                          <span className="text-[11px] text-text-tertiary">{sub._count.businesses} businesses</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CategoryModal
          category={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadCategories(); setMessage({ type: "success", text: editing ? "Category updated" : "Category created" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}

      {showSubModal && (
        <SubcategoryModal
          categoryId={parentId}
          onClose={() => setShowSubModal(false)}
          onSaved={() => { setShowSubModal(false); setExpanded(null); setMessage({ type: "success", text: "Subcategory added" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved, onError }: {
  category: CategoryItem | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    sortOrder: category?.sortOrder?.toString() || "0",
    isActive: category?.isActive ?? true,
    isService: category?.isService ?? false,
  });

  const set = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleNameChange = (name: string) => {
    set("name", name);
    if (!category) set("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder) || 0 };
      if (category) {
        await categoryService.update(category.id, payload);
      } else {
        await categoryService.create(payload);
      }
      onSaved();
    } catch {
      onError(category ? "Failed to update" : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold">{category ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name *</label>
            <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Slug *</label>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-text-secondary">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isService} onChange={(e) => set("isService", e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-text-secondary">Service Category</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Saving..." : category ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubcategoryModal({ categoryId, onClose, onSaved, onError }: {
  categoryId: string; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "" });

  const handleNameChange = (name: string) => {
    setForm({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      await categoryService.createSubcategory(categoryId, form);
      onSaved();
    } catch {
      onError("Failed to create subcategory");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold">Add Subcategory</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name *</label>
            <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Slug *</label>
            <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Adding..." : "Add Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
