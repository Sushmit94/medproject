import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, BarChart3, Star, Building, Zap } from "lucide-react";
import { adPricingPlans } from "@/data/advertisements";

export default function BusinessSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-accent)_0%,_transparent_50%)] opacity-10" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-bold mb-5 border border-accent/20">
            <Zap size={12} />
            For Healthcare Providers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Grow Your Medical Practice Online
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            Join 50,000+ doctors, hospitals, and clinics who trust Digital Medical to connect with patients.
          </p>
        </div>

        {/* Benefits row */}
        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {[
            { icon: BarChart3, title: "10x Patient Reach", desc: "Get discovered by millions of patients searching for healthcare" },
            { icon: BadgeCheck, title: "Verified Profile", desc: "Build trust with a verified badge and professional listing" },
            { icon: Star, title: "Reviews & Ratings", desc: "Collect and showcase patient reviews to boost credibility" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <item.icon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing preview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {adPricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                plan.name === "Gold"
                  ? "bg-gradient-to-b from-amber-500/15 to-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/8"
              } ${plan.popular ? "ring-2 ring-primary shadow-lg shadow-primary/20" : ""}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold rounded-full bg-primary text-white shadow-md">
                  POPULAR
                </span>
              )}
              <h3 className="text-sm font-bold text-white mb-1">{plan.name}</h3>
              <div className="text-2xl font-extrabold text-white mb-1">
                {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString()}`}
                {plan.price > 0 && <span className="text-xs text-slate-400 font-normal">/{plan.period}</span>}
              </div>
              <ul className="space-y-2 mt-4">
                {plan.features.slice(0, 3).map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-slate-300">
                    <BadgeCheck size={13} className="text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/for-business"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-dark shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all"
          >
            <Building size={17} />
            List Your Practice
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
