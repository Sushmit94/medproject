import { useState } from "react";
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

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All India");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-accent/5" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-primary/8 via-primary/3 to-transparent rounded-full -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/8 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-8 md:pt-16 md:pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left column - Text */}
          <div>
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/90 backdrop-blur-sm border border-accent/20 text-accent text-xs font-bold rounded-full mb-7 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              Trusted by 2M+ patients monthly
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-text-primary tracking-tight leading-[1.1] mb-5">
              Find the Best{" "}
              <span className="bg-gradient-to-r from-accent to-amber-500 bg-clip-text text-transparent">Healthcare</span>{" "}
              Near You
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mb-8 leading-relaxed">
              India&apos;s largest medical directory — search 12,400+ hospitals, 58,600+ doctors, and 34,200+ pharmacies across 550+ cities.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl shadow-slate-900/8 border border-slate-100 p-2 mb-6 max-w-xl">
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
                  Search
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>

            {/* Quick Searches */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-xs text-text-tertiary font-medium mr-1">Popular:</span>
              {quickSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(s)}&city=${encodeURIComponent(city)}`)}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-white border border-border-light rounded-full hover:bg-accent-light hover:text-accent hover:border-accent/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-border-light">
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-text-primary leading-tight">{stat.value}</div>
                      <div className="text-[11px] text-text-tertiary font-medium">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column - Hero Image Collage */}
          <div className="relative hidden lg:block">
            {/* Main image */}
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/15 border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=700&h=500&fit=crop"
                alt="Modern hospital"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
            </div>

            {/* Floating card - Doctor */}
            <div className="absolute -left-8 top-16 z-20 bg-white rounded-2xl shadow-xl shadow-slate-900/10 p-3 flex items-center gap-3 animate-float border border-border-light">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face"
                alt="Doctor"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <div className="text-xs font-bold text-text-primary">Dr. Devi Shetty</div>
                <div className="text-[10px] text-text-tertiary">Cardiologist &bull; 4.9&#9733;</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle size={10} className="text-success" />
                  <span className="text-[10px] text-success font-medium">Available</span>
                </div>
              </div>
            </div>

            {/* Floating card - Rating */}
            <div className="absolute -right-4 bottom-24 z-20 bg-white rounded-2xl shadow-xl shadow-slate-900/10 p-4 animate-float" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-text-primary">4.8</div>
                  <div className="text-[10px] text-text-tertiary">Avg Rating</div>
                </div>
              </div>
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=40&h=40&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&h=40&fit=crop&crop=face",
                ].map((src, j) => (
                  <img key={j} src={src} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-white bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                  +5K
                </div>
              </div>
            </div>

            {/* Background decorative blobs */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/10 rounded-full animate-blob" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full animate-blob" style={{ animationDelay: "4s" }} />
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="relative">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 60L48 52C96 44 192 28 288 22C384 16 480 20 576 28C672 36 768 48 864 48C960 48 1056 36 1152 28C1248 20 1344 16 1392 14L1440 12V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
