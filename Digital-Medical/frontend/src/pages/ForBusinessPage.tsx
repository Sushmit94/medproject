import { Link } from "react-router-dom";
import {
  BadgeCheck,
  BarChart3,
  Star,
  Users,
  Building,
  Megaphone,
  ArrowRight,
  Check,
  Phone,
  LogIn,
} from "lucide-react";
import { adPricingPlans } from "@/data/advertisements";

export default function ForBusinessPage() {
  return (
    <div className="bg-surface-secondary min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              For Healthcare Providers
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
              Grow Your Practice with Digital Medical
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-lg">
              Reach millions of patients searching for healthcare providers. Get your verified listing,
              manage appointments, and build your online reputation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/business/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Register Your Business <ArrowRight size={14} />
              </Link>
              <Link
                to="/business/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-white text-sm font-medium hover:bg-surface-secondary transition-colors"
              >
                <LogIn size={14} /> Business Login
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-white text-sm font-medium hover:bg-surface-secondary transition-colors"
              >
                View Plans
              </a>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="w-72 h-56 rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Building size={64} className="text-primary/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: "2M+", label: "Monthly Patients" },
            { value: "50K+", label: "Listed Providers" },
            { value: "500+", label: "Cities Covered" },
            { value: "4.8", label: "App Rating" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-text-tertiary mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-center mb-8">Why Choose Us</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: BadgeCheck, title: "Verified Badge", desc: "Earn patient trust with a verified profile and official badge." },
            { icon: Star, title: "Reviews & Ratings", desc: "Collect and showcase genuine patient reviews on your profile." },
            { icon: BarChart3, title: "Analytics Dashboard", desc: "Track profile views, calls, and appointment requests." },
            { icon: Users, title: "Patient Engagement", desc: "Connect directly with patients via inquiry and booking tools." },
            { icon: Megaphone, title: "Promoted Listings", desc: "Appear at the top of search results in your category." },
            { icon: Building, title: "Multi-Location", desc: "Manage multiple clinic branches from a single dashboard." },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <item.icon size={18} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h3>
              <p className="text-xs text-text-tertiary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 py-12 scroll-mt-4">
        <h2 className="text-xl font-bold text-center mb-2">Plans & Pricing</h2>
        <p className="text-sm text-text-tertiary text-center mb-8">Choose the plan that fits your practice</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adPricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border p-5 relative ${
                plan.popular ? "border-primary ring-1 ring-primary/20" : "border-border-light"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-semibold rounded-full bg-primary text-white">
                  RECOMMENDED
                </span>
              )}
              <h3 className="text-sm font-bold mb-0.5">{plan.name}</h3>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString()}`}
                {plan.price > 0 && <span className="text-xs text-text-tertiary font-normal ml-1">{plan.period}</span>}
              </div>
              <ul className="space-y-1.5 mt-4 mb-5">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-text-secondary">
                    <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-border bg-white hover:bg-surface-secondary"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Ready to grow your practice?</h2>
          <p className="text-sm text-white/80 mb-5">Join thousands of healthcare providers who trust Digital Medical.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/business/signup"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-primary text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Register Your Business <ArrowRight size={14} />
            </Link>
            <Link
              to="/business/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              <LogIn size={14} /> Already Registered? Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
