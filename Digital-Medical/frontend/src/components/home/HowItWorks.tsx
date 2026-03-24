import { Search, CheckCircle, CalendarCheck, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search & Discover",
    description: "Search for doctors, hospitals, clinics, or any healthcare service across 550+ Indian cities.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
    color: "from-primary to-blue-600",
    bg: "bg-primary/5",
  },
  {
    icon: CheckCircle,
    step: "02",
    title: "Compare & Choose",
    description: "Read verified reviews, check ratings, compare facilities, and pick the best healthcare provider.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop",
    color: "from-accent to-amber-500",
    bg: "bg-accent/5",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Book Appointment",
    description: "Book an appointment online or call directly. Get directions and all the info you need.",
    image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=400&h=300&fit=crop",
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
  },
  {
    icon: ThumbsUp,
    step: "04",
    title: "Get Treated & Review",
    description: "Visit the provider, get treated, and share your experience to help other patients.",
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&h=300&fit=crop",
    color: "from-purple-500 to-indigo-600",
    bg: "bg-purple-50",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/3 via-white to-primary/3" />
      <div className="absolute inset-0 bg-diagonal" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent text-xs font-bold rounded-full mb-4 border border-accent/15">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
            How It <span className="text-accent">Works</span>
          </h2>
          <p className="text-base text-text-tertiary max-w-lg mx-auto">
            Finding the right healthcare provider is easy with Digital Medical
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`group relative ${step.bg} rounded-3xl p-6 border border-white/50 hover:shadow-xl hover:shadow-slate-900/8 hover:-translate-y-2 transition-all duration-500`}
              >
                {/* Step number */}
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} text-white text-xs font-extrabold mb-4 shadow-lg`}>
                  {step.step}
                </span>

                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden mb-5 h-36">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-10`} />
                </div>

                {/* Content */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-md`}>
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-text-tertiary leading-relaxed">{step.description}</p>

                {/* Connector line (hidden on last) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-border z-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
