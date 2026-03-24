import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { searchService } from "@/lib/services";
import { mapBusinessCardToListing } from "@/lib/publicMappers";
import ListingCard from "@/components/common/ListingCard";
import type { Listing } from "@/types";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";

  const [sortBy, setSortBy] = useState("relevance");
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    params.set("limit", "50");
    searchService.businesses(params.toString())
      .then((res) => {
        let mapped = res.data.map((b, i) => mapBusinessCardToListing(b, i));
        setResults(mapped);
      })
      .catch(() => { setError("Search failed. Please try again."); })
      .finally(() => setLoading(false));
  }, [q, city]);

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="bg-surface-secondary min-h-screen">
      <div className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold text-text-primary">
            {q ? `Results for "${q}"` : "All Providers"}
            {city && ` in ${city}`}
          </h1>
          <p className="text-sm text-text-tertiary mt-1">{sorted.length} results found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-border-light rounded-lg px-3 py-2 bg-white"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-text-tertiary">Searching...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border-light">
            <Search size={32} className="mx-auto mb-3 text-text-tertiary" />
            <h2 className="text-lg font-semibold mb-1">Search failed</h2>
            <p className="text-sm text-text-tertiary mb-4">{error}</p>
            <Link to="/" className="text-sm font-medium text-primary hover:underline">← Back to Home</Link>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border-light">
            <Search size={32} className="mx-auto mb-3 text-text-tertiary" />
            <h2 className="text-lg font-semibold mb-1">No results found</h2>
            <p className="text-sm text-text-tertiary mb-4">Try adjusting your search terms</p>
            <Link to="/" className="text-sm font-medium text-primary hover:underline">← Back to Home</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
