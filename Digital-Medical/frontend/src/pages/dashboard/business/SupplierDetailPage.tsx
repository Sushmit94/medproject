import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Store, MapPin, Phone, Package,
  Handshake, Stethoscope, Search, ShoppingCart,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { supplierService, orderService, type SupplierDetail, type SupplierProduct } from "@/lib/services";

export default function SupplierDetailPage() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Products
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [productPages, setProductPages] = useState(0);
  const [productTotal, setProductTotal] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Order modal
  const [orderModal, setOrderModal] = useState<{ productId: string; productName: string } | null>(null);
  const [orderForm, setOrderForm] = useState({ quantity: 1, unit: "", notes: "" });
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!supplierId) return;
    setLoading(true);
    supplierService.detail(supplierId)
      .then((res) => setSupplier(res.data))
      .catch(() => setError("Supplier not found"))
      .finally(() => setLoading(false));
  }, [supplierId]);

  const loadProducts = useCallback(() => {
    if (!supplierId) return;
    setLoadingProducts(true);
    const params = new URLSearchParams({ page: String(productPage), limit: "10" });
    if (productSearch) params.set("search", productSearch);
    supplierService.products(supplierId, params.toString())
      .then((res) => {
        setProducts(res.data);
        setProductTotal(res.pagination.total);
        setProductPages(res.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, [supplierId, productPage, productSearch]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderModal || !supplierId) return;
    setOrderLoading(true);
    try {
      await orderService.create({
        supplierId,
        productId: orderModal.productId,
        productName: orderModal.productName,
        quantity: orderForm.quantity,
        unit: orderForm.unit || undefined,
        notes: orderForm.notes || undefined,
      });
      setMessage({ type: "success", text: `Inquiry sent for "${orderModal.productName}"` });
      setOrderModal(null);
      setOrderForm({ quantity: 1, unit: "", notes: "" });
    } catch {
      setMessage({ type: "error", text: "Failed to send inquiry" });
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-text-tertiary text-sm">Loading...</div>;
  if (error || !supplier) return (
    <div className="text-center py-12">
      <p className="text-red-500 text-sm">{error || "Supplier not found"}</p>
      <Link to="/business/suppliers" className="text-accent text-sm mt-2 inline-block">← Back to suppliers</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/business/suppliers" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors">
        <ArrowLeft size={16} /> Back to suppliers
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-border-light p-5">
        <div className="flex items-start gap-4">
          {supplier.image ? (
            <img src={supplier.image} alt={supplier.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Store size={28} className="text-accent" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-text-primary">{supplier.name}</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-600 uppercase">
                {supplier.supplyChainRole}
              </span>
            </div>
            {supplier.area && (
              <p className="flex items-center gap-1 text-sm text-text-secondary mt-1">
                <MapPin size={14} /> {supplier.area.name}, {supplier.area.city.name}
              </p>
            )}
            {supplier.address && <p className="text-sm text-text-tertiary mt-0.5">{supplier.address}</p>}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {supplier.phone1 && (
                <a href={`tel:${supplier.phone1}`} className="flex items-center gap-1 text-sm text-accent hover:underline">
                  <Phone size={14} /> {supplier.phone1}
                </a>
              )}
              {supplier.whatsapp && (
                <a
                  href={`https://wa.me/${supplier.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                >
                  <SiWhatsapp size={14} color="#25D366" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
        {supplier.about && (
          <p className="text-sm text-text-secondary mt-4 leading-relaxed">{supplier.about}</p>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Deals In */}
      {supplier.deals.length > 0 && (
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Handshake size={18} className="text-accent" /> Deals In
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {supplier.deals.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-3 bg-surface-tertiary rounded-lg">
                {d.image ? (
                  <img src={d.image} alt={d.title} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Handshake size={16} className="text-accent" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{d.title}</p>
                  {d.description && <p className="text-xs text-text-tertiary truncate">{d.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {supplier.services.length > 0 && (
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Stethoscope size={18} className="text-accent" /> Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {supplier.services.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-surface-tertiary rounded-lg">
                {s.image ? (
                  <img src={s.image} alt={s.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Stethoscope size={16} className="text-accent" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                  {s.description && <p className="text-xs text-text-tertiary truncate">{s.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="bg-white rounded-xl border border-border-light p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Package size={18} className="text-accent" /> Products ({productTotal})
          </h2>
          <div className="relative max-w-xs w-full sm:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-surface-tertiary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        {loadingProducts ? (
          <div className="text-center py-8 text-text-tertiary text-sm">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package size={32} className="mx-auto text-text-tertiary mb-2" />
            <p className="text-text-secondary text-sm">No products found</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-3 bg-surface-tertiary rounded-lg">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <Package size={18} className="text-text-tertiary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-text-primary">{p.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-text-tertiary mt-0.5 flex-wrap">
                      {p.brand && <span>Brand: {p.brand}</span>}
                      {p.packSize && <span>Pack: {p.packSize}</span>}
                      {p.moq && <span>MOQ: {p.moq}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => setOrderModal({ productId: p.id, productName: p.name })}
                    className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90 transition-colors shrink-0"
                  >
                    <ShoppingCart size={13} /> Order
                  </button>
                </div>
              ))}
            </div>

            {productPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                  disabled={productPage === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-50 hover:bg-surface-tertiary"
                >
                  Previous
                </button>
                <span className="text-sm text-text-secondary">
                  Page {productPage} of {productPages}
                </span>
                <button
                  onClick={() => setProductPage((p) => Math.min(productPages, p + 1))}
                  disabled={productPage === productPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-50 hover:bg-surface-tertiary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOrderModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border-light">
              <h3 className="text-base font-semibold text-text-primary">Send Order Inquiry</h3>
              <p className="text-xs text-text-tertiary mt-0.5">For: {orderModal.productName}</p>
            </div>
            <form onSubmit={handleOrder} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. boxes, strips"
                    value={orderForm.unit}
                    onChange={(e) => setOrderForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Any additional notes..."
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderModal(null)}
                  className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-tertiary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {orderLoading ? "Sending..." : "Send Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
