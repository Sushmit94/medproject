import { useState, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, Building, Send } from "lucide-react";
import { campService, type Camp } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";

export default function CampDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", whatsapp: "", age: "", gender: "" });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    campService.getBySlug(slug)
      .then((res) => setCamp(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!camp || !form.name || !form.phone) return;
    setRegistering(true);
    setMsg(null);
    try {
      await campService.register(camp.id, {
        name: form.name,
        phone: form.phone,
        whatsapp: form.whatsapp || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
      });
      setMsg({ type: "success", text: "Registration successful!" });
      setShowRegister(false);
    } catch {
      setMsg({ type: "error", text: "Failed to register. You may already be registered or need to login." });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><p className="text-text-tertiary">Loading...</p></div>;
  }

  if (!camp) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-2">Event not found</h1>
        <Link to="/camps-events" className="text-sm text-primary hover:underline">← Back to Events</Link>
      </div>
    );
  }

  const isPast = new Date(camp.eventDate) < new Date();

  return (
    <div className="bg-surface-secondary min-h-screen">
      {camp.image && (
        <div className="h-64 sm:h-80 bg-surface-tertiary">
          <img src={camp.image} alt={camp.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/camps-events" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft size={14} /> Back to Events
        </Link>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {msg.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
              <h1 className="text-xl font-bold text-text-primary mb-4">{camp.name}</h1>
              <div className="space-y-2.5 text-sm text-text-secondary mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={15} className="text-primary shrink-0" />
                  {new Date(camp.eventDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
                {(camp.timeFrom || camp.timeTo) && (
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-primary shrink-0" />
                    {camp.timeFrom}{camp.timeTo && ` - ${camp.timeTo}`}
                  </div>
                )}
                {camp.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-accent shrink-0" />
                    {camp.venue}
                  </div>
                )}
                {camp.business && (
                  <div className="flex items-center gap-2">
                    <Building size={15} className="text-text-tertiary shrink-0" />
                    Organized by {camp.business.name}
                  </div>
                )}
                {camp._count?.registrations !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-green-500 shrink-0" />
                    {camp._count.registrations} registered
                  </div>
                )}
              </div>
              {isPast && <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-red-50 text-red-600">Past Event</span>}
            </div>

            {camp.description && (
              <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
                <h2 className="text-base font-bold mb-3">About this Event</h2>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{camp.description}</p>
              </div>
            )}

            {showRegister && (
              <form onSubmit={handleRegister} className="bg-white rounded-xl border border-green-200 p-5 space-y-3">
                <h2 className="text-base font-bold">Register for this Event</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input required placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                  <input required placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                  <input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm">
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={registering} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
                    <Send size={12} /> {registering ? "Registering..." : "Register"}
                  </button>
                  <button type="button" onClick={() => setShowRegister(false)} className="px-4 py-2 rounded-lg border border-border-light text-xs font-medium">Cancel</button>
                </div>
              </form>
            )}
          </div>

          <aside>
            <div className="bg-white rounded-xl border border-border-light p-5 sticky top-4">
              {!isPast && user && !showRegister && (
                <button onClick={() => setShowRegister(true)} className="w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 mb-3">
                  Register Now
                </button>
              )}
              {!user && !isPast && (
                <Link to="/login" className="block text-center w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 mb-3">
                  Login to Register
                </Link>
              )}
              {isPast && <p className="text-center text-sm text-red-500 font-medium mb-3">This event has ended</p>}
              <div className="text-xs text-text-tertiary text-center">
                {camp._count?.registrations || 0} people registered
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
