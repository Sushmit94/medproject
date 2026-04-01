import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, ChevronDown, ArrowRight,
  Shield, Users, Building2, Star,
  Stethoscope, Pill, FlaskConical, Ambulance,
  Droplets, Briefcase, CalendarDays, Newspaper,
  HeartPulse, ChevronRight, Phone,
} from "lucide-react";

const cities = [
  "All India", "Mumbai", "Delhi", "Bengaluru", "Hyderabad",
  "Chennai", "Pune", "Kolkata", "Ahmedabad",
];

const quickSearches = [
  "Cardiologist", "24x7 Pharmacy", "MRI Center", "Pediatrician", "Dental Clinic", "Blood Test",
];

const stats = [
  { icon: Building2, value: "12,400+", label: "Hospitals" },
  { icon: Users, value: "58,600+", label: "Doctors" },
  { icon: Shield, value: "550+", label: "Cities" },
  { icon: Star, value: "4.8★", label: "Rating" },
];

const categoryCards = [
  {
    title: "DOCTORS",
    sub: "Book Now",
    accent: "#059669",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=420&fit=crop&crop=face",
    href: "/doctors",
  },
  {
    title: "HOSPITALS",
    sub: "Find Nearest",
    accent: "#0284c7",
    img: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=300&h=420&fit=crop",
    href: "/hospitals",
  },
  {
    title: "PHARMACY",
    sub: "Order Meds",
    accent: "#d97706",
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=420&fit=crop",
    href: "/pharmacy",
  },
  {
    title: "DIAGNOSTICS",
    sub: "Book Tests",
    accent: "#7c3aed",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=420&fit=crop",
    href: "/diagnostics",
  },
];

// Keep this in sync with the threshold in Header.tsx
const HERO_SEARCH_THRESHOLD = 200;
const TRANSITION_RANGE = 60;

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All India");
  const [searchMorphProgress, setSearchMorphProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const start = HERO_SEARCH_THRESHOLD - 30;
      const progress = Math.min(1, Math.max(0, (y - start) / TRANSITION_RANGE));
      setSearchMorphProgress(progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
    }
  };

  // Hero search fades out and scales down as navbar search fades in
  const heroSearchOpacity = 1 - searchMorphProgress;
  const heroSearchScale = 1 - searchMorphProgress * 0.04;
  const heroSearchTranslateY = -searchMorphProgress * 12;

  return (
    <section className="bg-white font-sans text-slate-900">
      {/* ── Emergency strip ───────────────────────────── */}
      <div className="bg-slate-900 text-white text-[10px] font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-red-400">
              <Phone size={10} className="animate-pulse" />
              Emergency: <strong>108</strong>
            </span>
            <span className="hidden sm:block opacity-70">24x7 Support: 1800-200-4000</span>
          </div>
          <span className="hidden md:block opacity-70">Verified Healthcare Directory</span>
        </div>
      </div>

      {/* ── Main Hero Content ─────────────────────────── */}
      <div className="pt-6 pb-4 px-4 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          {/* Headline Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Find & Book <span className="text-orange-500">Top Healthcare</span> Services
            </h1>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">
              Over 1.2 Lakh+ verified medical listings across 550+ cities in India
            </p>
          </div>

          {/*
            ── HERO SEARCH BAR ────────────────────────────────────────────
            This is the "source" of the morph. It fades + slides up as the
            navbar version fades in. We use a wrapper div to smoothly
            collapse its layout height too, so content below doesn't jump.
          */}
          <div
            style={{
              opacity: heroSearchOpacity,
              transform: `translateY(${heroSearchTranslateY}px) scale(${heroSearchScale})`,
              transition: "opacity 0.1s ease, transform 0.1s ease",
              // Collapse height smoothly so the section below doesn't jump
              maxHeight: `${(1 - searchMorphProgress) * 80 + 10}px`,
              overflow: "hidden",
              pointerEvents: searchMorphProgress > 0.5 ? "none" : "auto",
            }}
          >
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-4">
              <div className="flex bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200 overflow-hidden p-1">
                <div className="relative flex items-center pl-3 pr-2 bg-slate-50 rounded-lg min-w-[130px]">
                  <MapPin size={14} className="text-emerald-500 shrink-0 mr-1.5" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 appearance-none pr-6 cursor-pointer focus:outline-none py-2.5 w-full"
                  >
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
                </div>
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search doctors, hospitals, specialists..."
                    className="w-full pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Quick Tags & Stats */}
          <div
            className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto gap-4 px-2"
            style={{
              opacity: heroSearchOpacity,
              transition: "opacity 0.1s ease",
            }}
          >
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
              {quickSearches.slice(0, 4).map((s) => (
                <button
                  key={s}
                  className="px-3 py-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-6 border-l border-slate-200 pl-6 hidden md:flex">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs font-black text-slate-800">{s.value}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Visual Section ─────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[240px]">

          {/* Main Banner */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm min-h-[180px]">
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&h=400&fit=crop"
              alt="Healthcare"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center p-6 lg:p-8">
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-2">Verified Directory</span>
              <h2 className="text-xl lg:text-2xl font-extrabold text-white leading-tight mb-3">
                Healthcare access,<br />made simple.
              </h2>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-lg hover:bg-emerald-500 transition-all">
                  Book Appointment <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {categoryCards.map((card) => (
              <button
                key={card.title}
                className="relative w-[110px] lg:w-[120px] shrink-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
              >
                <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute inset-0 opacity-90 transition-opacity group-hover:opacity-100"
                  style={{ background: `linear-gradient(to bottom, transparent 40%, ${card.accent} 95%)` }}
                />
                <div className="relative z-10 h-full flex flex-col justify-end p-3 text-left">
                  <div className="text-white font-black text-xs leading-none mb-1">{card.title}</div>
                  <div className="text-white/80 text-[9px] font-bold">{card.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}