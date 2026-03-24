import type { Listing, Plan, EventItem, NewsArticle } from "@/types";
import type { PublicBusinessCard, BusinessProfile, Camp, NewsItem } from "./services";

/**
 * Map a subscription tier string to a Plan type for display
 */
function tierToPlan(tier: string): Plan {
  switch (tier) {
    case "PLATINUM": return "platinum";
    case "GOLD": return "gold";
    case "SILVER": return "silver";
    default: return "free";
  }
}

/**
 * Build a timing string from morning/evening open/close fields
 */
function formatTimings(b: BusinessProfile): string | undefined {
  if (b.morningOpen && b.morningClose) {
    const morning = `${b.morningOpen}–${b.morningClose}`;
    if (b.eveningOpen && b.eveningClose) {
      return `${morning}, ${b.eveningOpen}–${b.eveningClose}`;
    }
    return morning;
  }
  return undefined;
}

/**
 * Map a public business card (from search/list) to the Listing type used by ListingCard
 */
export function mapBusinessCardToListing(b: PublicBusinessCard, index = 0): Listing {
  const city = b.area?.city?.name || "";
  return {
    id: index,
    name: b.name,
    slug: b.slug,
    category: b.category?.name || "",
    categorySlug: b.category?.slug || "",
    plan: tierToPlan(b.subscriptionTier),
    rating: 0,
    reviewCount: b._count?.reviews ?? 0,
    city,
    address: b.address || (b.area ? `${b.area.name}, ${city}` : ""),
    phone: b.phone1 ? [b.phone1] : [],
    image: b.image || "/images/placeholder.png",
    verified: b.isVerified,
    specialities: b.designation ? [b.designation] : [],
    description: "",
    latitude: 0,
    longitude: 0,
    featured: b.isPopular,
    sponsored: b.subscriptionTier === "PLATINUM",
  };
}

/**
 * Map a full BusinessProfile (from getBySlug) to the Listing type used by DetailPage
 */
export function mapBusinessProfileToListing(b: BusinessProfile): Listing {
  const city = b.area?.city?.name || "";
  return {
    id: 0,
    name: b.name,
    slug: b.slug,
    category: b.category?.name || "",
    categorySlug: b.category?.slug || "",
    plan: tierToPlan(b.subscriptionTier),
    rating: 0,
    reviewCount: 0,
    city,
    address: b.address || (b.area ? `${b.area.name}, ${city}` : ""),
    phone: [b.phone1, b.phone2, b.phone3].filter(Boolean) as string[],
    email: b.email || undefined,
    website: b.website || undefined,
    facebook: b.facebook || undefined,
    instagram: b.instagram || undefined,
    youtube: b.youtube || undefined,
    whatsapp: b.whatsapp || undefined,
    image: b.image || "/images/placeholder.png",
    verified: b.isVerified,
    specialities: b.designation ? [b.designation] : [],
    description: b.about || "",
    latitude: b.latitude ?? 0,
    longitude: b.longitude ?? 0,
    timings: formatTimings(b),
    featured: b.isPopular,
    sponsored: b.subscriptionTier === "PLATINUM",
  };
}

/**
 * Map a Camp from the API to the EventItem used by CampsEventsPage/Section
 */
export function mapCampToEventItem(c: Camp): EventItem {
  const d = new Date(c.eventDate);
  const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  const time = c.timeFrom && c.timeTo ? `${c.timeFrom} – ${c.timeTo}` : c.timeFrom || undefined;
  return {
    id: 0,
    title: c.name,
    slug: c.slug,
    organizer: c.business?.name || "",
    type: "camp",
    date: dateStr,
    time,
    venue: c.venue || "",
    city: (c as any).business?.area?.city?.name || "",
    description: c.description || "",
    services: [],
    registrationRequired: true,
    isPaid: false,
    image: c.image || "/images/placeholder.png",
  };
}

/**
 * Map a NewsItem from the API to the NewsArticle used by NewsPage/Section
 */
export function mapNewsItemToArticle(n: NewsItem): NewsArticle {
  const d = new Date(n.createdAt);
  return {
    id: 0,
    title: n.title,
    slug: String(n.id),
    category: n.type || "General",
    excerpt: "",
    author: "Digital Medical",
    publishedAt: d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    readTime: "2 min read",
    image: n.image || "/images/placeholder.png",
    tags: [],
    featured: false,
  };
}
