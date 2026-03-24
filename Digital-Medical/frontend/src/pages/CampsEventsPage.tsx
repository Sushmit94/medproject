import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Filter, Clock, Users } from "lucide-react";
import { campService } from "@/lib/services";
import { mapCampToEventItem } from "@/lib/publicMappers";
import type { EventItem } from "@/types";

const TYPES = ["all", "camp", "event", "workshop"] as const;

export default function CampsEventsPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    campService.list("limit=50")
      .then((res) => setEvents(res.data.map(mapCampToEventItem)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterType === "all" ? events : events.filter((e) => e.type === filterType);

  const typeBadge: Record<string, string> = {
    camp: "bg-green-50 text-green-700",
    event: "bg-blue-50 text-blue-700",
    workshop: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="bg-surface-secondary min-h-screen">
      <div className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold text-text-primary">Health Camps & Events</h1>
          <p className="text-sm text-text-tertiary mt-1">Discover health camps, workshops, and medical events near you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                filterType === t ? "bg-primary text-white border-primary" : "bg-white border-border-light hover:border-border"
              }`}
            >
              {t === "all" ? "All Events" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border-light">
            <CalendarDays size={32} className="mx-auto mb-3 text-text-tertiary" />
            <p className="text-text-tertiary">No events found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ev) => (
              <Link
                to={`/camps-events/${ev.slug}`}
                key={ev.id}
                className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-44 bg-surface-tertiary overflow-hidden">
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${typeBadge[ev.type]}`}>
                      {ev.type.toUpperCase()}
                    </span>
                    {!ev.isPaid && <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-green-50 text-green-700">FREE</span>}
                    {ev.isPaid && <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-700">₹{ev.price}</span>}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2">{ev.title}</h3>
                  <p className="text-xs text-text-tertiary line-clamp-2 mb-3">{ev.description}</p>
                  <div className="space-y-1.5 text-xs text-text-tertiary">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={12} className="text-primary shrink-0" />
                      {ev.date}
                    </div>
                    {ev.time && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-primary shrink-0" />
                        {ev.time}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-accent shrink-0" />
                      {ev.venue}, {ev.city}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-text-tertiary shrink-0" />
                      by {ev.organizer}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
