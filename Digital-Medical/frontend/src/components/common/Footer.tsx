import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowRight, Heart } from "lucide-react";

const directoryLinks = [
  { label: "Hospitals", to: "/category/hospitals-clinics" },
  { label: "Doctors", to: "/category/doctors" },
  { label: "Pharmacy", to: "/category/medicals" },
  { label: "Diagnostics", to: "/category/diagnostics" },
  { label: "Laboratories", to: "/category/laboratories" },
  { label: "Opticals", to: "/category/opticals" },
];

const serviceLinks = [
  { label: "Blood Bank", to: "/services/blood" },
  { label: "Emergency Services", to: "/services/emergency" },
  { label: "Health Departments", to: "/services/health-departments" },
  { label: "Healthcare Jobs", to: "/services/jobs" },
  { label: "Camps & Events", to: "/camps-events" },
  { label: "Health News", to: "/news" },
];

const companyLinks = [
  { label: "About Us", to: "#" },
  { label: "Contact", to: "#" },
  { label: "Careers", to: "#" },
  { label: "Blog", to: "#" },
  { label: "Privacy Policy", to: "#" },
  { label: "Terms of Service", to: "#" },
];

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-slate-300 overflow-hidden">
      {/* Decorative top gradient line */}
      <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />

      {/* Emergency Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-500">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <p className="text-white text-sm font-semibold">
              Medical Emergency? Call immediately
            </p>
          </div>
          <div className="flex gap-3">
            <a href="tel:108" className="flex items-center gap-1.5 px-5 py-2 bg-white text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors shadow-md">
              <Phone size={14} /> 108
            </a>
            <a href="tel:112" className="flex items-center gap-1.5 px-5 py-2 bg-white/15 text-white text-sm font-bold rounded-xl border border-white/30 hover:bg-white/25 transition-colors">
              <Phone size={14} /> 112
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <img
                src="/images/logo-full.png"
                alt="Digital Medical"
                className="h-10 object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
              India's most comprehensive medical directory connecting patients with healthcare providers across 550+ cities.
            </p>
            <div className="space-y-3 text-[13px]">
              <a href="tel:1800XXXXXXX" className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Phone size={14} />
                </div>
                <span>1800-XXX-XXXX (Toll Free)</span>
              </a>
              <a href="mailto:support@digitalmedical.in" className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Mail size={14} />
                </div>
                <span>support@digitalmedical.in</span>
              </a>
              <div className="flex items-center gap-2.5 text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin size={14} />
                </div>
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Directory */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              Directory
            </h4>
            <ul className="space-y-3">
              {directoryLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[13px] text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[13px] text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[13px] text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business CTA */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              For Providers
            </h4>
            <p className="text-[13px] text-slate-400 mb-5 leading-relaxed">
              List your hospital, clinic, or pharmacy and reach millions of patients.
            </p>
            <Link
              to="/for-business"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-dark shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all"
            >
              Get Listed <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            &copy; {new Date().getFullYear()} Digital Medical. Made with <Heart size={11} className="text-red-400 fill-red-400" /> in India
          </span>
          <div className="flex items-center gap-5">
            <Link to="#" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-slate-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
