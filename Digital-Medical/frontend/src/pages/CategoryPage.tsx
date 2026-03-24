import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ChevronRight, SlidersHorizontal, LayoutGrid, List, X } from "lucide-react";
import { categoryService, businessService, type CategoryDetail } from "@/lib/services";
import { mapBusinessProfileToListing } from "@/lib/publicMappers";
import ListingCard from "@/components/common/ListingCard";
import type { Listing, Plan } from "@/types";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Rating" },
  { value: "name", label: "Name A-Z" },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [rawListings, setRawListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState("relevance");
  const [filterPlan, setFilterPlan] = useState<Plan | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    categoryService.getBySlug(slug).then((cat) => {
      setCategory(cat);
      return businessService.list(`categoryId=${cat.id}&limit=100`);
    }).then((res) => {
      setRawListings(res.data.map((b) => mapBusinessProfileToListing(b)));
    }).catch((err) => {
      setError(err?.message || "Failed to load category");
    }).finally(() => setLoading(false));
  }, [slug]);

  const listings = useMemo(() => {
    let result = [...rawListings];

    if (selectedSubcategory) {
      result = result.filter((l) =>
        l.specialities.some((s) => s.toLowerCase().includes(selectedSubcategory.toLowerCase()))
      );
    }

    if (filterPlan !== "all") {
      result = result.filter((l) => l.plan === filterPlan);
    }

    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // plan priority: platinum > gold > silver > free
        const priority: Record<Plan, number> = { platinum: 4, gold: 3, silver: 2, free: 1 };
        result.sort((a, b) => priority[b.plan] - priority[a.plan]);
    }

    return result;
  }, [rawListings, sortBy, filterPlan, selectedSubcategory]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-text-tertiary">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-text-tertiary mb-6">{error}</p>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">← Back to Home</Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Category not found</h1>
        <p className="text-text-tertiary mb-6">The category you're looking for doesn't exist.</p>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-text-tertiary">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">{category.name}</span>
        </div>
      </div>

      {/* Title bar */}
      <div className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold text-text-primary">{category.name}</h1>
          <p className="text-sm text-text-tertiary mt-1">{listings.length} providers found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-xl border border-border-light p-4 sticky top-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Subcategories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                    !selectedSubcategory ? "bg-primary/10 text-primary font-medium" : "text-text-secondary hover:bg-surface-secondary"
                  }`}
                >
                  All
                </button>
                {category.subcategories.map((sub) => (
                  <button
                    key={sub.slug}
                    onClick={() => setSelectedSubcategory(sub.name)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                      selectedSubcategory === sub.name ? "bg-primary/10 text-primary font-medium" : "text-text-secondary hover:bg-surface-secondary"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>

              <hr className="my-4 border-border-light" />

              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Plan</h3>
              <div className="space-y-1">
                {(["all", "platinum", "gold", "silver", "free"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPlan(p)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg capitalize transition-colors ${
                      filterPlan === p ? "bg-primary/10 text-primary font-medium" : "text-text-secondary hover:bg-surface-secondary"
                    }`}
                  >
                    {p === "all" ? "All Plans" : p}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-light bg-white text-sm"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-border-light rounded-lg px-3 py-2 bg-white"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                <div className="hidden sm:flex border border-border-light rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-primary text-white" : "bg-white text-text-tertiary"}`}
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-primary text-white" : "bg-white text-text-tertiary"}`}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile filter drawer */}
            {showFilters && (
              <div className="lg:hidden mb-4 bg-white rounded-xl border border-border-light p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Filters</span>
                  <button onClick={() => setShowFilters(false)}><X size={16} /></button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className={`px-2.5 py-1 text-xs rounded-full border ${!selectedSubcategory ? "bg-primary text-white border-primary" : "border-border-light"}`}
                  >
                    All
                  </button>
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub.slug}
                      onClick={() => setSelectedSubcategory(sub.name)}
                      className={`px-2.5 py-1 text-xs rounded-full border ${selectedSubcategory === sub.name ? "bg-primary text-white border-primary" : "border-border-light"}`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(["all", "platinum", "gold", "silver", "free"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPlan(p)}
                      className={`px-2.5 py-1 text-xs rounded-full border capitalize ${filterPlan === p ? "bg-primary text-white border-primary" : "border-border-light"}`}
                    >
                      {p === "all" ? "All Plans" : p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Listings */}
            {listings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-tertiary">No providers found matching your filters.</p>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                {listings.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} viewMode={viewMode} showRank={i < 3} rank={i + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
