import type { NewsArticle } from "@/types";

export const newsCategories = ["All", "Policy", "Research", "Wellness", "Alert", "Technology"];

export const news: NewsArticle[] = [
  {
    id: 1, title: "India's Digital Health Mission Crosses 50 Crore Registrations",
    slug: "digital-health-mission-50cr", category: "Policy",
    excerpt: "The Ayushman Bharat Digital Mission has achieved a landmark milestone with over 50 crore Ayushman Bharat Health Account registrations across India.",
    author: "Ministry of Health", publishedAt: "March 3, 2026", readTime: "4 min",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600",
    tags: ["Digital Health", "ABDM", "Government"], featured: true,
  },
  {
    id: 2, title: "AIIMS Researchers Develop New TB Drug with 95% Efficacy",
    slug: "aiims-tb-drug-breakthrough", category: "Research",
    excerpt: "A team of researchers at AIIMS Delhi has developed a novel drug compound that shows 95% efficacy in treating drug-resistant tuberculosis.",
    author: "AIIMS Research Cell", publishedAt: "March 1, 2026", readTime: "6 min",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600",
    tags: ["TB", "Research", "Drug Development"], featured: false,
  },
  {
    id: 3, title: "PM-JAY Expands Coverage to Include Cancer Treatment",
    slug: "pmjay-cancer-coverage", category: "Policy",
    excerpt: "The Pradhan Mantri Jan Arogya Yojana now covers comprehensive cancer treatment packages up to ₹10 lakh per family.",
    author: "NHA", publishedAt: "Feb 28, 2026", readTime: "3 min",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600",
    tags: ["PM-JAY", "Cancer", "Insurance"], featured: false,
  },
  {
    id: 4, title: "Study: 30 Minutes of Yoga Daily Reduces Diabetes Risk by 40%",
    slug: "yoga-diabetes-study", category: "Wellness",
    excerpt: "A multi-center study across 12 Indian cities demonstrates that regular yoga practice significantly prevents Type 2 diabetes.",
    author: "ICMR", publishedAt: "Feb 25, 2026", readTime: "5 min",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
    tags: ["Yoga", "Diabetes", "Prevention"], featured: false,
  },
  {
    id: 5, title: "Dengue Alert: Cases Rise 3x in Southern States",
    slug: "dengue-alert-south-india", category: "Alert",
    excerpt: "Health authorities have issued an alert as dengue cases surge across Kerala, Tamil Nadu, and Karnataka with a 300% increase over last year.",
    author: "NCDC", publishedAt: "Feb 22, 2026", readTime: "3 min",
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600",
    tags: ["Dengue", "Alert", "South India"], featured: false,
  },
  {
    id: 6, title: "AI-Powered Diagnostics Platform Launches in 100 District Hospitals",
    slug: "ai-diagnostics-launch", category: "Technology",
    excerpt: "A new AI-powered diagnostic platform can detect 12 common diseases from chest X-rays and is being deployed in 100 district hospitals.",
    author: "MoHFW", publishedAt: "Feb 20, 2026", readTime: "4 min",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600",
    tags: ["AI", "Diagnostics", "Rural Health"], featured: false,
  },
];

export const getLatestNews = (count = 6) => news.slice(0, count);
export const getFeaturedNews = () => news.filter((n) => n.featured);
