import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Phone, BadgeCheck, ArrowRight } from "lucide-react";
import type { Listing } from "@/types";
import PlanBadge from "./PlanBadge";

interface ListingCardProps {
  listing: Listing;
  viewMode?: "grid" | "list";
  showRank?: boolean;
  rank?: number;
}

export default function ListingCard({ listing, viewMode = "grid", showRank, rank }: ListingCardProps) {
  const isGrid = viewMode === "grid";

  return (
    <Link
      to={`/listing/${listing.slug}`}
      className={`group bg-white rounded-2xl border border-border-light overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/8 hover:border-transparent hover:-translate-y-1
        ${isGrid ? "flex flex-col" : "flex flex-row"}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-slate-100 shrink-0 ${isGrid ? "h-48 w-full" : "w-44 h-auto"}`}>
        <img
          src={listing.image}
          alt={listing.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {listing.sponsored && (
          <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold bg-accent text-white rounded-md shadow-sm">
            Sponsored
          </span>
        )}
        {showRank && rank && (
          <span className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-[11px] font-bold bg-white text-text-primary rounded-lg shadow-md">
            #{rank}
          </span>
        )}
        {/* Plan indicator stripe */}
        {listing.plan !== "free" && (
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${
            listing.plan === "platinum" ? "bg-primary" :
            listing.plan === "gold" ? "bg-amber-400" : "bg-slate-400"
          }`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                {listing.name}
              </h3>
              {listing.verified && <BadgeCheck size={14} className="text-primary shrink-0" />}
            </div>
            <PlanBadge plan={listing.plan} />
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 shrink-0 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
            <Star size={11} className="fill-current" />
            {listing.rating}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-3">
          <MapPin size={12} className="shrink-0 text-text-tertiary" />
          <span className="truncate">{listing.address}</span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {listing.specialities.slice(0, isGrid ? 3 : 4).map((s) => (
            <span key={s} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-surface-tertiary text-text-secondary font-medium">
              {s}
            </span>
          ))}
          {listing.specialities.length > (isGrid ? 3 : 4) && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-primary-light text-primary font-medium">
              +{listing.specialities.length - (isGrid ? 3 : 4)}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-light">
          <div className="flex items-center gap-3 text-xs text-text-tertiary">
            {listing.timings && (
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-text-tertiary" /> {listing.timings}
              </span>
            )}
            {listing.consultationFee && (
              <span className="font-semibold text-text-primary">{listing.consultationFee}</span>
            )}
          </div>
          <span className="flex items-center gap-0.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5">
            View <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
