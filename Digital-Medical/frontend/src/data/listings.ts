import type { Listing, Plan } from "@/types";

export const PLANS: Record<string, Plan> = {
  FREE: "free",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
};

export const hospitals: Listing[] = [
  {
    id: 1, name: "Apollo Hospitals", slug: "apollo-hospitals-delhi",
    category: "hospitals", subcategory: "multi-speciality", plan: "platinum",
    rating: 4.8, reviewCount: 2340, city: "Delhi", address: "Sarita Vihar, Delhi Mathura Road, New Delhi – 110076",
    phone: ["+91-11-26925858", "+91-11-26925801"], email: "info@apollohospitals.com", website: "https://apollohospitals.com",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600", verified: true,
    specialities: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Gastroenterology"],
    facilities: ["ICU", "NICU", "24x7 Pharmacy", "Emergency", "Blood Bank", "Cafeteria", "Parking"],
    insurance: ["Star Health", "HDFC Ergo", "ICICI Lombard", "Max Bupa", "PM-JAY"],
    timings: "Open 24 Hours", description: "Apollo Hospitals is India's foremost integrated healthcare provider with a robust presence across the healthcare ecosystem.",
    latitude: 28.5355, longitude: 77.2910, featured: true, sponsored: true,
  },
  {
    id: 2, name: "Fortis Healthcare", slug: "fortis-healthcare-mumbai",
    category: "hospitals", subcategory: "super-speciality", plan: "platinum",
    rating: 4.6, reviewCount: 1890, city: "Mumbai", address: "Mulund Goregaon Link Road, Mumbai – 400078",
    phone: ["+91-22-67116711"], email: "info@fortishealthcare.com", website: "https://fortishealthcare.com",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600", verified: true,
    specialities: ["Cardiac Surgery", "Neuro Surgery", "Kidney Transplant", "Joint Replacement"],
    facilities: ["ICU", "NICU", "Emergency", "Blood Bank", "Helipad", "Parking"],
    insurance: ["Star Health", "New India Assurance", "ICICI Lombard"],
    timings: "Open 24 Hours", description: "Fortis Healthcare Ltd. is one of the leading integrated healthcare delivery service providers in India.",
    latitude: 19.1726, longitude: 72.9425, featured: true, sponsored: false,
  },
  {
    id: 3, name: "AIIMS New Delhi", slug: "aiims-new-delhi",
    category: "hospitals", subcategory: "government", plan: "free",
    rating: 4.9, reviewCount: 5200, city: "Delhi", address: "Ansari Nagar, New Delhi – 110029",
    phone: ["+91-11-26588500", "+91-11-26588700"], email: "contact@aiims.edu", website: "https://aiims.edu",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600", verified: true,
    specialities: ["All Specialities", "Trauma", "Burns", "Research"],
    facilities: ["ICU", "NICU", "24x7 Pharmacy", "Emergency", "Blood Bank", "Research Labs"],
    insurance: ["PM-JAY", "CGHS", "ECHS"],
    timings: "OPD: 8 AM – 1 PM", description: "AIIMS is India's premier government medical institute offering world-class healthcare and research.",
    latitude: 28.5672, longitude: 77.2100, featured: true, sponsored: false,
  },
  {
    id: 4, name: "Medanta The Medicity", slug: "medanta-gurugram",
    category: "hospitals", subcategory: "super-speciality", plan: "gold",
    rating: 4.7, reviewCount: 3100, city: "Gurugram", address: "CH Baktawar Singh Road, Sector 38, Gurugram – 122001",
    phone: ["+91-124-4141414"], email: "info@medanta.org", website: "https://medanta.org",
    image: "https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=600", verified: true,
    specialities: ["Heart Institute", "Neuro Sciences", "Bone & Joint", "Kidney & Urology"],
    facilities: ["ICU", "Emergency", "Blood Bank", "Pharmacy", "Parking", "Guest House"],
    insurance: ["Star Health", "HDFC Ergo", "Max Bupa", "PM-JAY"],
    timings: "Open 24 Hours", description: "Medanta is a leading multi super speciality healthcare institute founded by Dr. Naresh Trehan.",
    latitude: 28.4395, longitude: 77.0385, featured: false, sponsored: false,
  },
  {
    id: 5, name: "Lilavati Hospital", slug: "lilavati-hospital-mumbai",
    category: "hospitals", subcategory: "multi-speciality", plan: "gold",
    rating: 4.5, reviewCount: 1650, city: "Mumbai", address: "A-791 Bandra Reclamation, Bandra West, Mumbai – 400050",
    phone: ["+91-22-26568000"], email: "info@lilavatihospital.com", website: "https://lilavatihospital.com",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600", verified: true,
    specialities: ["Cardiology", "Neurology", "Orthopedics", "Urology"],
    facilities: ["ICU", "Emergency", "Pharmacy", "Cafeteria", "Parking"],
    insurance: ["Star Health", "New India Assurance"],
    timings: "Open 24 Hours", description: "Lilavati Hospital is a tertiary-care multi-speciality hospital founded in 1978 in Bandra, Mumbai.",
    latitude: 19.0544, longitude: 72.8270, featured: false, sponsored: false,
  },
  {
    id: 6, name: "Narayana Health", slug: "narayana-health-bangalore",
    category: "hospitals", subcategory: "multi-speciality", plan: "silver",
    rating: 4.4, reviewCount: 2100, city: "Bangalore", address: "258/A Bommasandra, Hosur Road, Bangalore – 560099",
    phone: ["+91-80-71222222"], email: "info@narayanahealth.org", website: "https://narayanahealth.org",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600", verified: true,
    specialities: ["Cardiac Surgery", "Oncology", "Nephrology", "Transplants"],
    facilities: ["ICU", "NICU", "Emergency", "Blood Bank", "Pharmacy"],
    insurance: ["PM-JAY", "Star Health", "HDFC Ergo"],
    timings: "Open 24 Hours", description: "Narayana Health is committed to making quality healthcare accessible and affordable.",
    latitude: 12.8081, longitude: 77.6721, featured: false, sponsored: false,
  },
];

export const doctors: Listing[] = [
  {
    id: 101, name: "Dr. Devi Shetty", slug: "dr-devi-shetty-bangalore",
    category: "doctors", subcategory: "cardiologist", plan: "platinum",
    rating: 4.9, reviewCount: 890, city: "Bangalore", address: "Narayana Health City, Bangalore – 560099",
    phone: ["+91-80-71222222"], email: "appointment@narayanahealth.org",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600", verified: true,
    specialities: ["Cardiac Surgery", "Heart Transplant", "Bypass Surgery"],
    timings: "Mon–Sat: 10 AM – 4 PM", consultationFee: "₹2,000", experience: "35+ years",
    description: "Dr. Devi Shetty is one of India's most renowned cardiac surgeons and Chairman of Narayana Health.",
    latitude: 12.8081, longitude: 77.6721, featured: true, sponsored: false,
  },
  {
    id: 102, name: "Dr. Priya Sharma", slug: "dr-priya-sharma-delhi",
    category: "doctors", subcategory: "gynecologist", plan: "gold",
    rating: 4.7, reviewCount: 560, city: "Delhi", address: "Max Super Speciality Hospital, Saket, New Delhi – 110017",
    phone: ["+91-11-26515050"],
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600", verified: true,
    specialities: ["Obstetrics", "Gynecology", "IVF", "High-Risk Pregnancy"],
    timings: "Mon–Fri: 9 AM – 5 PM", consultationFee: "₹1,200", experience: "18 years",
    description: "Dr. Priya Sharma is a well-known gynecologist and obstetrician with specialization in high-risk pregnancies.",
    latitude: 28.5274, longitude: 77.2138, featured: true, sponsored: false,
  },
  {
    id: 103, name: "Dr. Rajesh Kumar", slug: "dr-rajesh-kumar-mumbai",
    category: "doctors", subcategory: "orthopedic", plan: "silver",
    rating: 4.5, reviewCount: 380, city: "Mumbai", address: "Hinduja Hospital, Mahim, Mumbai – 400016",
    phone: ["+91-22-24447000"],
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600", verified: true,
    specialities: ["Joint Replacement", "Spine Surgery", "Sports Medicine", "Arthroscopy"],
    timings: "Mon–Sat: 10 AM – 6 PM", consultationFee: "₹800", experience: "22 years",
    description: "Dr. Rajesh Kumar is a leading orthopedic surgeon specializing in knee and hip replacements.",
    latitude: 19.0445, longitude: 72.8390, featured: false, sponsored: false,
  },
  {
    id: 104, name: "Dr. Meera Patel", slug: "dr-meera-patel-ahmedabad",
    category: "doctors", subcategory: "pediatrician", plan: "gold",
    rating: 4.8, reviewCount: 720, city: "Ahmedabad", address: "Sterling Hospital, Gurukul Road, Ahmedabad – 380052",
    phone: ["+91-79-40011111"],
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600", verified: true,
    specialities: ["Pediatrics", "Neonatology", "Child Development", "Vaccination"],
    timings: "Mon–Sat: 9 AM – 1 PM, 4 PM – 7 PM", consultationFee: "₹600", experience: "15 years",
    description: "Dr. Meera Patel is a trusted pediatrician known for her compassionate care of newborns and children.",
    latitude: 23.0423, longitude: 72.5464, featured: false, sponsored: false,
  },
];

export const pharmacies: Listing[] = [
  {
    id: 201, name: "MedPlus Pharmacy", slug: "medplus-pharmacy-hyderabad",
    category: "pharmacy", subcategory: "24x7", plan: "gold",
    rating: 4.3, reviewCount: 1200, city: "Hyderabad", address: "Banjara Hills, Road No 12, Hyderabad – 500034",
    phone: ["+91-40-67006700"],
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600", verified: true,
    specialities: ["Medicines", "Health Products", "Baby Care", "Home Delivery"],
    timings: "Open 24 Hours", description: "MedPlus is India's largest pharmacy retail chain with 24-hour service.",
    latitude: 17.4156, longitude: 78.4347, featured: false, sponsored: false,
  },
  {
    id: 202, name: "Apollo Pharmacy", slug: "apollo-pharmacy-chennai",
    category: "pharmacy", subcategory: "online", plan: "platinum",
    rating: 4.4, reviewCount: 950, city: "Chennai", address: "Greams Road, Chennai – 600006",
    phone: ["+91-44-28290956"],
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600", verified: true,
    specialities: ["Medicines", "Lab Tests", "Health Devices", "Online Ordering"],
    timings: "8 AM – 11 PM", description: "Apollo Pharmacy is India's most trusted pharmacy chain with home delivery across 500+ cities.",
    latitude: 13.0575, longitude: 80.2482, featured: true, sponsored: true,
  },
];

export const diagnostics: Listing[] = [
  {
    id: 301, name: "Dr. Lal PathLabs", slug: "dr-lal-pathlabs-delhi",
    category: "diagnostics", subcategory: "pathology", plan: "platinum",
    rating: 4.6, reviewCount: 3200, city: "Delhi", address: "Block E, Sector 18, Rohini, New Delhi – 110085",
    phone: ["+91-11-39885050"],
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600", verified: true,
    specialities: ["Blood Tests", "Full Body Checkup", "DNA Testing", "Home Collection"],
    timings: "7 AM – 9 PM", description: "Dr. Lal PathLabs is India's leading diagnostic company offering over 3,700 tests through its network.",
    latitude: 28.7363, longitude: 77.1112, featured: true, sponsored: false,
  },
  {
    id: 302, name: "Thyrocare Technologies", slug: "thyrocare-mumbai",
    category: "diagnostics", subcategory: "blood-test", plan: "gold",
    rating: 4.3, reviewCount: 1800, city: "Mumbai", address: "D-37/1 TTC MIDC, Turbhe, Navi Mumbai – 400703",
    phone: ["+91-22-25893333"],
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600", verified: true,
    specialities: ["Thyroid Tests", "Diabetes Screening", "Wellness Packages", "Home Collection"],
    timings: "6 AM – 8 PM", description: "Thyrocare is India's leading preventive care diagnostics company with the most efficient testing model.",
    latitude: 19.0725, longitude: 72.9990, featured: false, sponsored: false,
  },
];

export const allListings: Listing[] = [...hospitals, ...doctors, ...pharmacies, ...diagnostics];

export const getListingsByCategory = (slug: string) =>
  allListings.filter((l) => l.category === slug);

export const getListingBySlug = (slug: string) =>
  allListings.find((l) => l.slug === slug);

export const getFeaturedListings = () =>
  allListings.filter((l) => l.featured).sort((a, b) => {
    const planOrder: Record<Plan, number> = { platinum: 0, gold: 1, silver: 2, free: 3 };
    return planOrder[a.plan] - planOrder[b.plan];
  });

export const getPremiumListings = () =>
  allListings.filter((l) => l.plan !== "free");
