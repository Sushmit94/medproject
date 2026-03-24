import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { businessService } from "@/lib/services";
import { mapBusinessCardToListing } from "@/lib/publicMappers";
import ListingCard from "@/components/common/ListingCard";
import type { Listing } from "@/types";

export default function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    businessService.list("limit=8&sort=popular")
      .then((res) => setListings(res.data.map((b, i) => mapBusinessCardToListing(b, i))))
      .catch(() => {});
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Distinct background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-secondary via-surface-tertiary to-surface-secondary" />
      <div className="absolute inset-0 bg-diagonal" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent text-xs font-bold rounded-full mb-4 border border-accent/15">
              <TrendingUp size={12} />
              Featured
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Top <span className="text-accent">Healthcare</span> Providers
            </h2>
            <p className="text-base text-text-tertiary mt-2">Top-rated and verified healthcare providers near you</p>
          </div>
          <Link to="/search" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent-dark transition-colors">
            See All <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.slice(0, 8).map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} showRank rank={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
