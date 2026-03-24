// ─── Shared types ───────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;          // Lucide icon name
  count: number;
  subcategories: { name: string; slug: string }[];
}

export type Plan = "free" | "silver" | "gold" | "platinum";

export interface Listing {
  id: number;
  name: string;
  slug: string;
  category: string;
  categorySlug?: string;
  subcategory?: string;
  plan: Plan;
  rating: number;
  reviewCount: number;
  city: string;
  address: string;
  phone: string[];
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
  image: string;
  verified: boolean;
  specialities: string[];
  facilities?: string[];
  insurance?: string[];
  timings?: string;
  consultationFee?: string;
  experience?: string;
  description: string;
  latitude: number;
  longitude: number;
  featured?: boolean;
  sponsored?: boolean;
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  organizer: string;
  type: "camp" | "event" | "workshop";
  date: string;
  time?: string;
  venue: string;
  city: string;
  description: string;
  services: string[];
  registrationRequired: boolean;
  isPaid: boolean;
  price?: number;
  sponsored?: boolean;
  image: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  image: string;
  tags: string[];
  featured: boolean;
}

export interface Job {
  id: number;
  title: string;
  slug: string;
  employer: string;
  employerLogo: string;
  category: string;
  type: string;
  location: string;
  experience: string;
  qualification: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  applicationDeadline: string;
  featured: boolean;
  postedAt: string;
}

export interface BloodDonor {
  id: number;
  name: string;
  bloodGroup: string;
  city: string;
  phone: string;
  lastDonated: string;
  available: boolean;
  totalDonations: number;
}

export interface BloodRequest {
  id: number;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  city: string;
  contact: string;
  urgency: "critical" | "urgent" | "normal";
  postedAt: string;
}

export interface EmergencyNumber {
  id: number;
  name: string;
  number: string;
  description: string;
  icon: string;
  available: string;
}

export interface AmbulanceProvider {
  id: number;
  name: string;
  phone: string;
  city: string;
  responseTime: string;
  price: string;
  rating: number;
  image: string;
  features: string[];
}

export interface OxygenProvider {
  id: number;
  name: string;
  phone: string;
  city: string;
  available: boolean;
  type: string;
  price: string;
}

export interface HealthDepartment {
  id: number;
  name: string;
  ministry: string;
  description: string;
  icon: string;
  role: string[];
  helpline?: string;
  website?: string;
  count: string;
  stateData?: { state: string; count: number }[];
}

export interface AdPlacement {
  id: number;
  position: string;
  advertiser: string;
  title: string;
  tagline: string;
  cta: string;
  link: string;
  bgColor: string;
  image: string;
  active: boolean;
}

export interface PricingPlan {
  id: number;
  name: string;
  slug: Plan;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  icon: string;
}
