import { Link } from "react-router-dom";
import { ArrowRight, Droplets, Siren, Briefcase, Building, HeartPulse } from "lucide-react";

const services = [
  {
    title: "Blood Bank",
    description: "Find blood donors, request blood, or register as a donor in your city",
    to: "/services/blood",
    icon: Droplets,
    gradient: "from-red-500 to-rose-600",
    bgLight: "bg-red-50",
    stats: "2,800+ centers",
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400&h=250&fit=crop",
  },
  {
    title: "Emergency Services",
    description: "Ambulance, oxygen suppliers, and 24/7 emergency helplines",
    to: "/services/emergency",
    icon: Siren,
    gradient: "from-orange-500 to-amber-600",
    bgLight: "bg-orange-50",
    stats: "24/7 support",
    image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=400&h=250&fit=crop",
  },
  {
    title: "Healthcare Jobs",
    description: "Browse latest openings for doctors, nurses, pharmacists and more",
    to: "/services/jobs",
    icon: Briefcase,
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    stats: "500+ openings",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop",
  },
  {
    title: "Health Departments",
    description: "Government schemes, ASHA workers, and public health programs",
    to: "/services/health-departments",
    icon: Building,
    gradient: "from-green-500 to-teal-600",
    bgLight: "bg-green-50",
    stats: "All India",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=250&fit=crop",
  },
];

export default function ServicesSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary/3 to-accent/3" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 border border-primary/15">
            <HeartPulse size={12} />
            Essential Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
            Healthcare <span className="text-primary">Services</span>
          </h2>
          <p className="text-base text-text-tertiary mt-2">Essential services beyond the directory</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <Link
                key={svc.to}
                to={svc.to}
                className="group relative rounded-2xl bg-white border border-border-light overflow-hidden hover:shadow-xl hover:shadow-slate-900/8 hover:border-transparent hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img src={svc.image} alt={svc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${svc.gradient} opacity-30 group-hover:opacity-40 transition-opacity`} />
                  <div className={`absolute top-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="absolute bottom-3 right-3 text-[11px] font-bold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    {svc.stats}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-text-primary mb-1.5 group-hover:text-primary transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-text-tertiary leading-relaxed mb-4">
                    {svc.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-accent">
                    Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
