import { Smartphone, ArrowRight, Star, Shield, Zap } from "lucide-react";

export default function AppDownloadBanner() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-700 to-primary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(240,126,1,0.2)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 text-white text-xs font-bold rounded-full mb-6 border border-white/20 backdrop-blur-sm">
              <Smartphone size={12} />
              Coming Soon
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              Healthcare at Your <span className="text-accent">Fingertips</span>
            </h2>
            <p className="text-base text-white/75 mb-8 max-w-md leading-relaxed">
              Download the Digital Medical app for instant access to 12,400+ hospitals, appointment booking, health records, and more.
            </p>

            {/* Features row */}
            <div className="flex flex-wrap gap-4 mb-8">
              {[
                { icon: Zap, text: "Instant Booking" },
                { icon: Shield, text: "Secure Records" },
                { icon: Star, text: "Verified Providers" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <f.icon size={14} className="text-accent" />
                  <span className="text-sm text-white font-medium">{f.text}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-3 px-6 py-3.5 bg-white text-text-primary rounded-xl font-bold text-sm hover:bg-white/90 shadow-lg transition-all">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.9236 8.271C17.9236 8.271 15.024 3.164 12.4756 3.012C9.9276 2.86 8.38 4.78 6.5236 4.78C4.6676 4.78 3.436 3.048 1.5 3.048C-0.436 3.048 -0.004 7.144 2.416 10.164C4.836 13.184 6.024 14.5 7.956 14.5C9.888 14.5 10.296 13.316 12.468 13.316C14.64 13.316 14.912 14.5 16.856 14.5C18.8 14.5 20.208 12.464 21.42 10.8" opacity="0" /><path d="M3 20.5L21 3.5" opacity="0" /><path d="M4.40002 21.7998L20.9 3.2998L21.006 3.1998C21.006 3.1998 21.508 2.6538 21.014 2.1998C20.52 1.7458 20 2.1998 20 2.1998L3.50002 20.6998C3.50002 20.6998 3.00002 21.2238 3.40002 21.6998C3.80002 22.1758 4.40002 21.7998 4.40002 21.7998Z" opacity="0" /></svg>
                <div className="text-left">
                  <div className="text-[10px] text-text-tertiary leading-none">Download on the</div>
                  <div className="text-sm font-bold leading-tight">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-3 px-6 py-3.5 bg-white/15 text-white rounded-xl font-bold text-sm border border-white/20 hover:bg-white/25 transition-all backdrop-blur-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.60901 1.81401L13.793 12L3.60901 22.186C3.22101 21.692 3.00001 21.013 3.00001 20.186V3.81401C3.00001 2.98701 3.22101 2.30801 3.60901 1.81401ZM16.621 14.828L5.65301 21.195L14.793 12.055L16.621 14.828ZM20.443 10.633C21.157 11.053 21.157 11.947 20.443 12.367L17.89 13.835L15.793 12L17.89 10.165L20.443 10.633ZM5.65301 2.80501L16.621 9.17201L14.793 11.945L5.65301 2.80501Z" /></svg>
                <div className="text-left">
                  <div className="text-[10px] text-white/60 leading-none">Get it on</div>
                  <div className="text-sm font-bold leading-tight">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* Right - Phone mockup */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[280px] h-[560px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-black/30 border border-white/10">
                <div className="w-full h-full rounded-[2.3rem] overflow-hidden bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=600&fit=crop"
                    alt="Digital Medical App"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-full" />
              </div>

              {/* Floating notification */}
              <div className="absolute -left-16 top-20 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Shield size={18} className="text-green-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-text-primary">Appointment Booked!</div>
                  <div className="text-[10px] text-text-tertiary">Dr. Priya • 3:00 PM</div>
                </div>
              </div>

              {/* Stats card */}
              <div className="absolute -right-12 bottom-32 bg-white rounded-2xl shadow-xl p-3 animate-float" style={{ animationDelay: "3s" }}>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold">500K+ Downloads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
