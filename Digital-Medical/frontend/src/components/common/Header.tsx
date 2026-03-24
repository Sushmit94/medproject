import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search, MapPin, ChevronDown, Menu, X, Phone,
  Building2, Stethoscope, Pill, Microscope, Heart,
  Siren, Droplets, Briefcase, CalendarDays, Newspaper,
  LogIn, UserPlus, User, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const cities = [
  "All India", "Mumbai", "Delhi", "Bengaluru", "Hyderabad",
  "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat", "Lucknow",
];

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

export default function Header() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All India");
  const [cityOpen, setCityOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isBusiness } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
      setQuery("");
    }
  };

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
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${
          scrolled ? "border-border shadow-lg shadow-slate-900/5" : "border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-5 h-[64px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <img
                src="/images/logo-icon.png"
                alt="Digital Medical"
                className="w-10 h-10 object-contain sm:hidden"
              />
              <img
                src="/images/logo-full.png"
                alt="Digital Medical"
                className="hidden sm:block h-10 object-contain"
              />
            </Link>

            {/* City Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-2 px-3.5 py-2 text-sm bg-surface-tertiary rounded-lg hover:bg-surface-secondary border border-transparent hover:border-border transition-all"
              >
                <MapPin size={14} className="text-primary" />
                <span className="text-text-primary font-medium max-w-24 truncate">{city}</span>
                <ChevronDown size={13} className={`text-text-tertiary transition-transform duration-200 ${cityOpen ? "rotate-180" : ""}`} />
              </button>
              {cityOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCityOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-border-light p-1.5 z-20 max-h-72 overflow-y-auto">
                    {cities.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setCity(c); setCityOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${
                          city === c
                            ? "bg-primary text-white font-medium"
                            : "text-text-secondary hover:bg-surface-tertiary"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:flex">
              <div className="flex w-full bg-surface-tertiary rounded-xl overflow-hidden border border-transparent focus-within:border-primary/30 focus-within:bg-white focus-within:shadow-md focus-within:shadow-primary/5 transition-all">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search doctors, hospitals, clinics..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-transparent focus:outline-none placeholder:text-text-tertiary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              <Link
                to="/for-business"
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary-light hover:border-primary/30 transition-all"
              >
                <Building2 size={14} />
                List Business
              </Link>
              {user ? (
                <>
                  <Link
                    to={isAdmin ? "/super-admin" : isBusiness ? "/business" : "/"}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-lg transition-all"
                  >
                    <User size={15} />
                    {user.name.split(" ")[0]}
                  </Link>
                  <button
                    onClick={() => { logout(); navigate(isAdmin ? "/super-admin/login" : isBusiness ? "/business/login" : "/"); }}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/business/login"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-primary hover:text-primary-dark hover:bg-primary-light rounded-lg transition-all"
                  >
                    <Building2 size={15} />
                    Business Login
                  </Link>
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-lg transition-all"
                  >
                    <LogIn size={15} />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg hover:bg-accent-dark shadow-sm shadow-accent/20 hover:shadow-md hover:shadow-accent/30 transition-all"
                  >
                    <UserPlus size={15} />
                    Sign Up
                  </Link>
                </>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-tertiary transition-colors"
                aria-label="Toggle menu"
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
                const isActive = location.pathname.startsWith(link.to);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-text-secondary hover:text-primary hover:border-primary/30"
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
              <form onSubmit={handleSearch} className="flex bg-surface-tertiary rounded-xl overflow-hidden">
                <input
                  type="text"
                  placeholder="Search doctors, hospitals..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm bg-transparent focus:outline-none"
                />
                <button type="submit" className="px-4 bg-primary text-white">
                  <Search size={18} />
                </button>
              </form>

              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-white"
              >
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname.startsWith(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2.5 px-3.5 py-3 text-sm rounded-xl transition-all ${
                        isActive
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

              <div className="flex gap-2 pt-3 border-t border-border-light">
                <a href="tel:108" className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl">
                  <Phone size={14} /> 108
                </a>
                <a href="tel:112" className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl">
                  <Phone size={14} /> 112
                </a>
              </div>

              <div className="flex gap-2 pt-1">
                {user ? (
                  <button
                    onClick={() => { logout(); navigate(isAdmin ? "/super-admin/login" : isBusiness ? "/business/login" : "/"); setMobileOpen(false); }}
                    className="flex-1 py-3 text-center text-sm font-medium border border-red-200 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/business/login" className="flex-1 py-3 text-center text-sm font-medium border border-primary/30 rounded-xl text-primary hover:bg-primary-light transition-colors">
                      Business Login
                    </Link>
                    <Link to="/login" className="flex-1 py-3 text-center text-sm font-medium border border-border rounded-xl text-text-secondary hover:bg-surface-tertiary transition-colors">
                      Login
                    </Link>
                    <Link to="/signup" className="flex-1 py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
