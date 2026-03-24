import { useState, useEffect, useRef } from "react";
import { Plus, Package, Trash2, Edit2, X, Search, ImagePlus } from "lucide-react";
import { productService, productCategoryService, uploadService, type Product, type ProductCategoryItem } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductsPage() {
  const { business } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (search) params.set("search", search);
    productService.myProducts(params.toString())
      .then((res) => {
        setProducts(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load products" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage({ type: "success", text: "Product deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete product" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your product catalog</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">Search</button>
      </form>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="divide-y divide-border-light">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 bg-surface-tertiary rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-surface-tertiary rounded" />
                  <div className="h-3 w-24 bg-surface-tertiary rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Package size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">{search ? "No products found" : "No products added yet"}</p>
          {!search && <button onClick={() => { setEditing(null); setShowModal(true); }} className="mt-4 text-sm text-accent font-medium hover:underline">Add your first product</button>}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-tertiary">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Brand</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">SKU</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Pack Size</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-tertiary/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-surface-tertiary flex items-center justify-center shrink-0">
                            <Package size={16} className="text-text-tertiary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-text-primary">{product.name}</p>
                          {product.categoryTag && <p className="text-xs text-text-tertiary">{product.categoryTag}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{product.brand || "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{product.sku || "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{product.packSize || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(product); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border-light">
              <p className="text-xs text-text-tertiary">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium border border-border-light rounded-lg disabled:opacity-50 hover:bg-surface-tertiary">Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-medium border border-border-light rounded-lg disabled:opacity-50 hover:bg-surface-tertiary">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editing}
          categoryId={business?.categoryId}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadProducts(); setMessage({ type: "success", text: editing ? "Product updated" : "Product added" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categoryId, onClose, onSaved, onError }: {
  product: Product | null; categoryId?: string; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.image || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [productCategories, setProductCategories] = useState<ProductCategoryItem[]>([]);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    brand: product?.brand || "",
    sku: product?.sku || "",
    packSize: product?.packSize || "",
    moq: product?.moq?.toString() || "",
    categoryTag: product?.categoryTag || "",
    productCategoryId: product?.productCategoryId || "",
    isActive: product?.isActive ?? true,
  });

  useEffect(() => {
    if (categoryId) {
      productCategoryService.byCategory(categoryId)
        .then((res) => setProductCategories(res.data))
        .catch(() => {});
    }
  }, [categoryId]);

  const set = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadService.image(file, "products");
      setImageUrl(res.url);
    } catch {
      onError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        brand: form.brand || null,
        sku: form.sku || null,
        packSize: form.packSize || null,
        moq: form.moq ? parseInt(form.moq) : null,
        categoryTag: form.categoryTag || null,
        productCategoryId: form.productCategoryId || null,
        image: imageUrl || null,
        isActive: form.isActive,
      };
      if (product) {
        await productService.update(product.id, payload);
      } else {
        await productService.create(payload);
      }
      onSaved();
    } catch {
      onError(product ? "Failed to update product" : "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold text-text-primary">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Product Image</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileRef.current?.click()}
                className="relative w-20 h-20 rounded-xl bg-surface-tertiary border-2 border-dashed border-border-light flex items-center justify-center cursor-pointer hover:border-accent/50 overflow-hidden"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={24} className="text-text-tertiary" />
                )}
                {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); e.target.value = ""; }} />
              <span className="text-xs text-text-tertiary">Click to upload</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Product Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Product name" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Product description" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Brand</label>
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Brand name" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">SKU</label>
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SKU code" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Pack Size</label>
              <input value={form.packSize} onChange={(e) => set("packSize", e.target.value)} placeholder="e.g., 10 tablets" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">MOQ</label>
              <input type="number" value={form.moq} onChange={(e) => set("moq", e.target.value)} placeholder="Min order qty" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Product Category</label>
            {productCategories.length > 0 ? (
              <select value={form.productCategoryId} onChange={(e) => set("productCategoryId", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white">
                <option value="">Select category</option>
                {productCategories.map((pc) => (
                  <option key={pc.id} value={pc.id}>{pc.name}</option>
                ))}
              </select>
            ) : (
              <input value={form.categoryTag} onChange={(e) => set("categoryTag", e.target.value)} placeholder="e.g., Antibiotics, OTC" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
            )}
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded border-border-light text-accent focus:ring-accent/20" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50">
              {saving ? "Saving..." : product ? "Update" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
