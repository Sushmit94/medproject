import { useState, useEffect } from "react";
import { Phone, Siren, Wind, MapPin, Clock, ExternalLink } from "lucide-react";
import { NATIONAL_EMERGENCY_NUMBERS } from "@/lib/serviceConstants";
import { searchService, type PublicBusinessCard } from "@/lib/services";

export default function EmergencyPage() {
  const [ambulanceProviders, setAmbulanceProviders] = useState<PublicBusinessCard[]>([]);
  const [oxygenProviders, setOxygenProviders] = useState<PublicBusinessCard[]>([]);

  useEffect(() => {
    searchService.businesses("q=ambulance&limit=6").then((res) => setAmbulanceProviders(res.data)).catch(() => {});
    searchService.businesses("q=oxygen&limit=6").then((res) => setOxygenProviders(res.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-surface-secondary min-h-screen">
      {/* Header */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Siren size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Emergency Services</h1>
              <p className="text-sm text-white/80">Quick access to helplines, ambulance & oxygen</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <a
              href="tel:108"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-red-600 text-sm font-bold hover:bg-white/90 transition-colors"
            >
              <Phone size={14} /> Call 108
            </a>
            <a
              href="tel:112"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold hover:bg-white/30 transition-colors"
            >
              <Phone size={14} /> Call 112
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Emergency Helplines */}
        <section>
          <h2 className="text-lg font-bold text-text-primary mb-4">Emergency Helplines</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {NATIONAL_EMERGENCY_NUMBERS.map((num) => (
              <a
                key={num.id}
                href={`tel:${num.number}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-border-light p-4 hover:shadow-sm hover:border-red-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                  <Phone size={16} className="text-red-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-text-primary">{num.number}</div>
                  <div className="text-xs text-text-tertiary truncate">{num.name}</div>
                  <div className="text-[10px] text-text-tertiary">{num.available}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Ambulance */}
        <section>
          <h2 className="text-lg font-bold text-text-primary mb-4">Ambulance Services</h2>
          {ambulanceProviders.length === 0 ? (
            <p className="text-sm text-text-tertiary">No ambulance services listed yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ambulanceProviders.map((amb) => (
                <div key={amb.id} className="bg-white rounded-xl border border-border-light p-4 hover:shadow-sm transition-shadow">
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{amb.name}</h3>
                  <div className="space-y-1.5 text-xs text-text-tertiary mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-accent" /> {amb.area?.city?.name || amb.area?.name || "—"}
                    </div>
                  </div>
                  {amb.phone1 && (
                    <a
                      href={`tel:${amb.phone1}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Phone size={12} /> {amb.phone1}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Oxygen */}
        <section>
          <h2 className="text-lg font-bold text-text-primary mb-4">Oxygen Suppliers</h2>
          {oxygenProviders.length === 0 ? (
            <p className="text-sm text-text-tertiary">No oxygen suppliers listed yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {oxygenProviders.map((oxy) => (
                <div key={oxy.id} className="bg-white rounded-xl border border-border-light p-4 hover:shadow-sm transition-shadow">
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{oxy.name}</h3>
                  <div className="space-y-1.5 text-xs text-text-tertiary mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-accent" /> {oxy.area?.city?.name || oxy.area?.name || "—"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wind size={11} className="text-blue-500" /> {oxy.designation || "Oxygen Supplier"}
                    </div>
                  </div>
                  {oxy.phone1 && (
                    <a
                      href={`tel:${oxy.phone1}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <Phone size={12} /> {oxy.phone1}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
