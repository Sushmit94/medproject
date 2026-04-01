import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronDown, ArrowRight, Shield, Users, Building2, Star, CheckCircle } from "lucide-react";

const cities = [
  "All India", "Mumbai", "Delhi", "Bengaluru", "Hyderabad",
  "Chennai", "Pune", "Kolkata", "Ahmedabad",
];

const quickSearches = [
  "Cardiologist", "24x7 Pharmacy", "MRI Center", "Pediatrician", "Dental Clinic", "Blood Test",
];

const stats = [
  { icon: Building2, value: "12,400+", label: "Hospitals", color: "text-primary bg-primary/10" },
  { icon: Users, value: "58,600+", label: "Doctors", color: "text-accent bg-accent/10" },
  { icon: Shield, value: "550+", label: "Cities", color: "text-primary bg-primary/10" },
  { icon: Star, value: "4.8/5", label: "Avg Rating", color: "text-accent bg-accent/10" },
];

// Must match HERO_SEARCH_THRESHOLD in Header.tsx
const HERO_SEARCH_THRESHOLD = 150;

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All India");
  const [searchScrolled, setSearchScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setSearchScrolled(window.scrollY > HERO_SEARCH_THRESHOLD);
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

  // Replace the entire return block in HeroSection.tsx

  return (
    <section className="relative overflow-hidden min-h-[580px] flex flex-col items-center justify-center">

      {/* ── Background image ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1600&h=900&fit=crop"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/30 to-orange-900/10" />
      </div>

      {/* ── Content (centered) ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">

        {/* Trust badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-amber-300 text-xs font-bold rounded-full mb-7">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          Trusted by 2M+ patients monthly
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.1] mb-5">
          Find the Best{" "}
          <span className="bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">Healthcare</span>{" "}
          Near You
        </h1>
        <p className="text-lg text-white/75 max-w-xl mx-auto mb-8 leading-relaxed">
          India&apos;s largest medical directory — search 12,400+ hospitals, 58,600+ doctors, and 34,200+ pharmacies across 550+ cities.
        </p>

        {/* Search Bar */}
        <div
          className={`mb-6 mx-auto max-w-xl md:transition-all md:duration-[600ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] md:origin-top
          ${searchScrolled
              ? "md:opacity-0 md:-translate-y-[140px] md:scale-[0.8] md:pointer-events-none"
              : "md:opacity-100 md:translate-y-0 md:scale-100 md:pointer-events-auto"
            }`}
        >
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl shadow-black/30 border border-slate-100 p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-tertiary sm:w-40 shrink-0">
                <MapPin size={15} className="text-accent shrink-0" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-transparent text-sm font-medium text-text-primary appearance-none w-full pr-5 cursor-pointer focus:outline-none"
                >
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 text-text-tertiary pointer-events-none" />
              </div>
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctors, hospitals..."
                  className="w-full pl-10 pr-3 py-3 text-sm rounded-xl bg-surface-tertiary focus:bg-white focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-text-tertiary"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-dark shadow-md shadow-accent/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
              >
                Search <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>

        {/* Quick Searches */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-10">
          <span className="text-xs text-white/50 font-medium mr-1">Popular:</span>
          {quickSearches.map((s) => (
            <button
              key={s}
              onClick={() => navigate(`/search?q=${encodeURIComponent(s)}&city=${encodeURIComponent(city)}`)}
              className="px-3 py-1.5 text-xs font-medium text-white/80 bg-white/10 border border-white/20 rounded-full hover:bg-accent/40 hover:text-white hover:border-accent/40 transition-all backdrop-blur-sm"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 justify-items-center">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 w-full">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-white leading-tight">{stat.value}</div>
                  <div className="text-[11px] text-white/50 font-medium">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 60L48 52C96 44 192 28 288 22C384 16 480 20 576 28C672 36 768 48 864 48C960 48 1056 36 1152 28C1248 20 1344 16 1392 14L1440 12V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}