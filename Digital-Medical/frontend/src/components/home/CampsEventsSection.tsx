import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, CalendarHeart } from "lucide-react";
import { campService } from "@/lib/services";
import { mapCampToEventItem } from "@/lib/publicMappers";
import type { EventItem } from "@/types";

export default function CampsEventsSection() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    campService.list("limit=3")
      .then((res) => setEvents(res.data.map(mapCampToEventItem)))
      .catch(() => {});
  }, []);

  const typeBadge: Record<string, string> = {
    camp: "bg-green-500 text-white",
    event: "bg-primary text-white",
    workshop: "bg-purple-500 text-white",
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Distinct background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-secondary to-white" />
      <div className="absolute inset-0 bg-dots opacity-20" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent text-xs font-bold rounded-full mb-4 border border-accent/15">
              <CalendarHeart size={12} />
              Events
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Upcoming <span className="text-accent">Events</span>
            </h2>
            <p className="text-base text-text-tertiary mt-2">Health camps, workshops, and medical events near you</p>
          </div>
          <Link to="/camps-events" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent-dark transition-colors">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <Link
              key={ev.id}
              to={`/camps-events/${ev.slug}`}
              className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-xl hover:shadow-slate-900/8 hover:border-transparent hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-lg shadow-md ${typeBadge[ev.type] || typeBadge.event}`}>
                    {ev.type.toUpperCase()}
                  </span>
                  {!ev.isPaid && (
                    <span className="px-3 py-1 text-[10px] font-bold rounded-lg bg-green-500 text-white shadow-md">FREE</span>
                  )}
                </div>
                {/* Date card overlay */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl p-2 text-center shadow-md min-w-[52px]">
                  <div className="text-lg font-extrabold text-accent leading-none">{ev.date.split(" ")[1]?.replace(",", "")}</div>
                  <div className="text-[10px] font-bold text-text-tertiary uppercase">{ev.date.split(" ")[0]?.slice(0, 3)}</div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-text-primary mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {ev.title}
                </h3>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays size={14} className="text-primary shrink-0" />
                    <span>{ev.date} {ev.time && `\u00b7 ${ev.time}`}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="text-accent shrink-0" />
                    <span className="truncate">{ev.venue}, {ev.city}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
