import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Store, Package, MapPin, Phone, Handshake, Stethoscope } from "lucide-react";
import { supplierService, type SupplierCard, type SupplierProduct } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";

export default function SuppliersPage() {
  const { business } = useAuth();
  const [tab, setTab] = useState<"browse" | "search">("browse");

  // ── Browse suppliers ──
  const [suppliers, setSuppliers] = useState<SupplierCard[]>([]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierTotal, setSupplierTotal] = useState(0);
  const [supplierPages, setSupplierPages] = useState(0);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // ── Product search ──
  const [productQuery, setProductQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productPages, setProductPages] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const loadSuppliers = useCallback(() => {
    setLoadingSuppliers(true);
    const params = new URLSearchParams({ page: String(supplierPage), limit: "12" });
    if (supplierSearch) params.set("search", supplierSearch);
    supplierService.list(params.toString())
      .then((res) => {
        setSuppliers(res.data);
        setSupplierTotal(res.pagination.total);
        setSupplierPages(res.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoadingSuppliers(false));
  }, [supplierPage, supplierSearch]);

  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  const doProductSearch = useCallback(() => {
    if (!productQuery) return;
    setLoadingProducts(true);
    const params = new URLSearchParams({ search: productQuery, page: String(productPage), limit: "12" });
    supplierService.searchProducts(params.toString())
      .then((res) => {
        setProducts(res.data);
        setProductTotal(res.pagination.total);
        setProductPages(res.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, [productQuery, productPage]);

  useEffect(() => { doProductSearch(); }, [doProductSearch]);

  const roleLabel = business?.supplyChainRole === "RETAILER" ? "Wholesalers" : "Suppliers";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{roleLabel}</h1>
        <p className="text-sm text-text-secondary mt-1">
          Browse {roleLabel.toLowerCase()} and search products across the supply chain
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-tertiary rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("browse")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "browse" ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}
        >
          <Store size={15} /> Browse {roleLabel}
        </button>
        <button
          onClick={() => setTab("search")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "search" ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}
        >
          <Search size={15} /> Search Products
        </button>
      </div>

      {/* ── Browse Suppliers Tab ── */}
      {tab === "browse" && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder={`Search ${roleLabel.toLowerCase()} by name or address...`}
              value={supplierSearch}
              onChange={(e) => { setSupplierSearch(e.target.value); setSupplierPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          {loadingSuppliers ? (
            <div className="text-center py-12 text-text-tertiary text-sm">Loading...</div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Store size={40} className="mx-auto text-text-tertiary mb-3" />
              <p className="text-text-secondary text-sm">No {roleLabel.toLowerCase()} found</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-text-tertiary">{supplierTotal} {roleLabel.toLowerCase()} found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((s) => (
                  <Link
                    key={s.id}
                    to={`/business/suppliers/${s.id}`}
                    className="bg-white rounded-xl border border-border-light p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start gap-3">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Store size={20} className="text-accent" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                          {s.name}
                        </h3>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-600 uppercase">
                          {s.supplyChainRole}
                        </span>
                        {s.area && (
                          <p className="flex items-center gap-1 text-xs text-text-tertiary mt-1">
                            <MapPin size={11} /> {s.area.name}, {s.area.city.name}
                          </p>
                        )}
                        {s.address && (
                          <p className="text-xs text-text-tertiary mt-0.5 truncate">{s.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-light text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><Package size={12} /> {s._count.products} Products</span>
                      <span className="flex items-center gap-1"><Handshake size={12} /> {s._count.deals} Deals</span>
                      <span className="flex items-center gap-1"><Stethoscope size={12} /> {s._count.services} Services</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {supplierPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setSupplierPage((p) => Math.max(1, p - 1))}
                    disabled={supplierPage === 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-50 hover:bg-surface-tertiary"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-text-secondary">
                    Page {supplierPage} of {supplierPages}
                  </span>
                  <button
                    onClick={() => setSupplierPage((p) => Math.min(supplierPages, p + 1))}
                    disabled={supplierPage === supplierPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-50 hover:bg-surface-tertiary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Search Products Tab ── */}
      {tab === "search" && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInput.trim()) {
                setProductQuery(searchInput.trim());
                setProductPage(1);
              }
            }}
            className="flex gap-2 max-w-lg"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search for a product across all suppliers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 transition-colors"
            >
              Search
            </button>
          </form>

          {!productQuery ? (
            <div className="text-center py-12">
              <Search size={40} className="mx-auto text-text-tertiary mb-3" />
              <p className="text-text-secondary text-sm">
                Search for a product to see which {roleLabel.toLowerCase()} carry it
              </p>
            </div>
          ) : loadingProducts ? (
            <div className="text-center py-12 text-text-tertiary text-sm">Searching...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package size={40} className="mx-auto text-text-tertiary mb-3" />
              <p className="text-text-secondary text-sm">No products found for "{productQuery}"</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-text-tertiary">{productTotal} product{productTotal !== 1 ? "s" : ""} found</p>
              <div className="space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-border-light p-4 flex items-center gap-4"
                  >
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-surface-tertiary flex items-center justify-center shrink-0">
                        <Package size={22} className="text-text-tertiary" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-text-primary">{p.name}</h3>
                      {p.brand && <p className="text-xs text-text-tertiary">Brand: {p.brand}</p>}
                      {p.packSize && <p className="text-xs text-text-tertiary">Pack: {p.packSize}</p>}
                      {p.moq && <p className="text-xs text-text-tertiary">MOQ: {p.moq}</p>}
                    </div>
                    <Link
                      to={`/business/suppliers/${p.business.id}`}
                      className="flex items-center gap-2 px-3 py-2 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors shrink-0"
                    >
                      {p.business.image ? (
                        <img src={p.business.image} alt={p.business.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <Store size={14} className="text-accent" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-xs font-semibold text-text-primary">{p.business.name}</p>
                        {p.business.phone1 && (
                          <p className="text-[10px] text-text-tertiary flex items-center gap-0.5">
                            <Phone size={9} /> {p.business.phone1}
                          </p>
                        )}
                      </div>
                    </Link>
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
      )}
    </div>
  );
}
