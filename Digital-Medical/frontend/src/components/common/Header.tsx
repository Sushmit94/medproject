import { useState, useEffect } from "react";
import { Link, useLocation as useRouterLocation, useNavigate } from "react-router-dom";
import {
  Search, MapPin, ChevronDown, Menu, X, Phone,
  Building2, Stethoscope, Pill, Microscope, Heart,
  Siren, Droplets, Briefcase, CalendarDays, Newspaper,
  LogIn, User, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";

const navLinks = [
  { label: "Hospitals", to: "/category/hospitals-clinics", icon: Building2 },
  { label: "Doctors", to: "/category/doctors", icon: Stethoscope },
  { label: "Pharmacy", to: "/category/medicals", icon: Pill },
  { label: "Diagnostics", to: "/category/diagnostics", icon: Microscope },
  { label: "Labs", to: "/category/laboratories", icon: Heart },
  { label: "Ambulance", to: "/services/emergency", icon: Siren },
  { label: "Blood Bank", to: "/services/blood", icon: Droplets },
  { label: "Jobs", to: "/services/jobs", icon: Briefcase },
  { label: "Events", to: "/camps-events", icon: CalendarDays },
  { label: "News", to: "/news", icon: Newspaper },
];

const HERO_SEARCH_THRESHOLD = 200;

export default function Header() {
  const [query, setQuery] = useState("");
  const { city, setCity } = useAppLocation();
  const [cityOpen, setCityOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [morphProgress, setMorphProgress] = useState(0);

  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isBusiness } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);

      const TRANSITION_RANGE = 60;
      const start = HERO_SEARCH_THRESHOLD - 30;
      const progress = Math.min(1, Math.max(0, (y - start) / TRANSITION_RANGE));
      setMorphProgress(progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [routerLocation.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
      setQuery("");
    }
  };

  const showNavSearch = morphProgress > 0;
  const isFullyMorphed = morphProgress === 1;

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-slate-900 text-white text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Phone size={11} className="text-red-400" />
              Emergency:
              <a href="tel:108" className="font-bold text-white hover:text-red-300 transition-colors">108</a>
              <span className="text-slate-600">|</span>
              <a href="tel:112" className="font-bold text-white hover:text-red-300 transition-colors">112</a>
            </span>
          </div>
          <div className="flex items-center gap-5 text-slate-300">
            <Link to="/services/blood" className="hover:text-white transition-colors">Blood Bank</Link>
            <Link to="/services/emergency" className="hover:text-white transition-colors">Emergency</Link>
            <Link to="/services/jobs" className="hover:text-white transition-colors">Healthcare Jobs</Link>
            <Link to="/for-business" className="font-semibold text-white bg-primary/90 hover:bg-primary px-3 py-1 rounded-md transition-colors">
              List Your Business
            </Link>
            <Link to="/business/login" className="hover:text-white transition-colors">Business Login</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${scrolled ? "border-border shadow-lg shadow-slate-900/5" : "border-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-5 h-[64px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <img src="/images/logo-icon.png" alt="DM" className="w-10 h-10 object-contain sm:hidden" />
              <img src="/images/logo-full.png" alt="Digital Medical" className="hidden sm:block h-10 object-contain" />
            </Link>

            {/* MORPHING SEARCH BAR */}
            <div
              className="hidden md:flex items-center gap-2 flex-1 min-w-0"
              style={{
                opacity: morphProgress,
                transform: `translateY(${(1 - morphProgress) * 16}px) scale(${0.92 + morphProgress * 0.08})`,
                pointerEvents: isFullyMorphed ? "auto" : morphProgress > 0.5 ? "auto" : "none",
                transition: "opacity 0.15s ease, transform 0.15s ease",
                maxWidth: showNavSearch ? "700px" : "0px",
                overflow: "hidden",
              }}
            >
              {/* REPLACED CITY SELECTOR START */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setCityOpen(!cityOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 text-sm bg-surface-tertiary rounded-lg hover:bg-surface-secondary border border-transparent hover:border-border transition-all whitespace-nowrap"
                >
                  <MapPin size={14} className="text-primary" />
                  <span className="text-text-primary font-medium max-w-28 truncate">{city}</span>
                  <ChevronDown size={13} className={`text-text-tertiary transition-transform duration-200 ${cityOpen ? "rotate-180" : ""}`} />
                </button>
                {cityOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCityOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border-light p-1.5 z-20">

                      <div className="max-h-52 overflow-y-auto">
                        {["All India", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
                          "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Meerut",
                          "Noida", "Ghaziabad", "Agra", "Varanasi"].map((c) => (
                            <button
                              key={c}
                              onClick={() => { setCity(c); setCityOpen(false); }}
                              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${city === c
                                ? "bg-primary text-white font-medium"
                                : "text-text-secondary hover:bg-surface-tertiary"
                                }`}
                            >
                              {c}
                            </button>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* REPLACED CITY SELECTOR END */}

              {/* Search input field */}
              <form
                onSubmit={handleSearch}
                className="flex flex-1 bg-surface-tertiary rounded-xl overflow-hidden border border-transparent focus-within:border-primary/30 focus-within:bg-white focus-within:shadow-md transition-all"
              >
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search doctors, hospitals, clinics..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-transparent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors shrink-0"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              <Link
                to="/for-business"
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary-light transition-all"
              >
                <Building2 size={14} />
                List Business
              </Link>

              {user ? (
                <>
                  <Link
                    to={isAdmin ? "/super-admin" : isBusiness ? "/business" : "/"}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-lg"
                  >
                    <User size={15} />
                    {user.name.split(" ")[0]}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate(isAdmin ? "/super-admin/login" : isBusiness ? "/business/login" : "/");
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-lg"
                >
                  <LogIn size={15} />
                  Login
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 text-text-secondary rounded-lg hover:bg-surface-tertiary"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Strip */}
        <nav className="border-t border-border-light hidden md:block">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-none -mb-px">
              {navLinks.map((link) => {
                const isActive = routerLocation.pathname.startsWith(link.to);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium border-b-2 transition-all ${isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-text-secondary hover:text-primary"
                      }`}
                  >
                    <Icon size={14} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border-light bg-white animate-fade-in">
            <div className="p-5 space-y-4">
              <form onSubmit={handleSearch} className="flex bg-surface-tertiary rounded-xl overflow-hidden border border-border">
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm bg-transparent focus:outline-none"
                />
                <button type="submit" className="px-4 bg-primary text-white">
                  <Search size={18} />
                </button>
              </form>

              {/* Mobile City Selector (Free Text) */}
              <div className="relative flex items-center px-4 py-3 bg-surface-tertiary rounded-xl border border-border">
                <MapPin size={16} className="text-primary mr-2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. Mumbai)"
                  className="bg-transparent text-sm w-full focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = routerLocation.pathname.startsWith(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2.5 px-3.5 py-3 text-sm rounded-xl transition-all ${isActive
                        ? "bg-primary-light text-primary font-medium"
                        : "text-text-secondary hover:bg-surface-tertiary"
                        }`}
                    >
                      <Icon size={16} className={isActive ? "text-primary" : "text-text-tertiary"} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}