import type { AdPlacement, PricingPlan } from "@/types";

export const AD_POSITIONS = {
  HERO_BANNER: "hero_banner",
  SIDEBAR: "sidebar",
  LISTING_TOP: "listing_top",
  INLINE: "inline",
  FOOTER_BANNER: "footer_banner",
} as const;

export const advertisements: AdPlacement[] = [
  {
    id: 1, position: AD_POSITIONS.HERO_BANNER, advertiser: "PharmaCo India",
    title: "Leading Pharmaceutical Solutions", tagline: "Trusted by 10,000+ hospitals across India",
    cta: "Learn More", link: "#", bgColor: "#0F6FFF",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800", active: true,
  },
  {
    id: 2, position: AD_POSITIONS.SIDEBAR, advertiser: "HealthDevices.in",
    title: "Medical Equipment Store", tagline: "Get 20% off on diagnostic devices",
    cta: "Shop Now", link: "#", bgColor: "#FF6B35",
    image: "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=400", active: true,
  },
  {
    id: 3, position: AD_POSITIONS.INLINE, advertiser: "MedLearn Academy",
    title: "Advance Your Medical Career", tagline: "Online courses from AIIMS faculty",
    cta: "Enroll Free", link: "#", bgColor: "#10B981",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600", active: true,
  },
  {
    id: 4, position: AD_POSITIONS.FOOTER_BANNER, advertiser: "Apollo TeleHealth",
    title: "Consult Doctors Online", tagline: "Video consultation starting at ₹199",
    cta: "Book Now", link: "#", bgColor: "#0F6FFF",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800", active: true,
  },
];

export const getAdsByPosition = (position: string) =>
  advertisements.filter((a) => a.position === position && a.active);

export const adPricingPlans: PricingPlan[] = [
  {
    id: 1, name: "Basic", slug: "free", price: 0, period: "Forever Free",
    description: "Get discovered by patients searching for healthcare services",
    features: ["Basic profile listing", "Up to 3 photos", "Contact info display", "Patient reviews"],
    popular: false, icon: "Zap",
  },
  {
    id: 2, name: "Silver", slug: "silver", price: 2999, period: "/month",
    description: "Enhanced visibility and more features for growing practices",
    features: ["Everything in Basic", "Priority in search results", "Up to 10 photos", "Analytics dashboard", "Phone number display"],
    popular: false, icon: "Award",
  },
  {
    id: 3, name: "Gold", slug: "gold", price: 5999, period: "/month",
    description: "Maximum exposure with premium placement and verified badge",
    features: ["Everything in Silver", "Featured listing badge", "Verified badge", "Top placement", "Lead generation", "Dedicated support"],
    popular: true, icon: "Crown",
  },
  {
    id: 4, name: "Platinum", slug: "platinum", price: 12999, period: "/month",
    description: "Enterprise solution for hospitals and large healthcare chains",
    features: ["Everything in Gold", "Banner advertisements", "Multiple locations", "API access", "Custom branding", "Account manager", "Priority support"],
    popular: false, icon: "Diamond",
  },
];
