import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Mehta",
    role: "Patient, Mumbai",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    text: "Digital Medical helped me find the best cardiologist near my home. The reviews were genuine and the doctor was exactly as described. Highly recommend!",
    rating: 5,
  },
  {
    name: "Dr. Amit Joshi",
    role: "Orthopedic Surgeon, Delhi",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    text: "As a doctor, listing on Digital Medical has brought me 3x more patients. The platform is professional and the verification process builds trust.",
    rating: 5,
  },
  {
    name: "Rahul Sharma",
    role: "Patient, Bangalore",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    text: "Found an affordable diagnostic center for my mother's tests. The comparison feature saved us thousands. Thank you Digital Medical!",
    rating: 5,
  },
];

const partners = [
  { name: "Apollo Hospitals", logo: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=120&h=60&fit=crop" },
  { name: "Fortis Healthcare", logo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&h=60&fit=crop" },
  { name: "AIIMS", logo: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=120&h=60&fit=crop" },
  { name: "Medanta", logo: "https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=120&h=60&fit=crop" },
  { name: "Max Healthcare", logo: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=120&h=60&fit=crop" },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-accent/3" />
      <div className="absolute inset-0 bg-dots opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 border border-primary/15">
            <Star size={12} className="fill-current" />
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
            What Our <span className="text-primary">Users</span> Say
          </h2>
          <p className="text-base text-text-tertiary max-w-lg mx-auto">
            Trusted by millions of patients and thousands of healthcare providers
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="relative bg-white rounded-3xl p-7 border border-border-light shadow-sm hover:shadow-xl hover:shadow-slate-900/8 hover:-translate-y-1 transition-all duration-300"
            >
              <Quote size={32} className="text-accent/15 absolute top-6 right-6" />
              <div className="flex items-center gap-3 mb-5">
                <img src={t.image} alt={t.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-accent/20" />
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{t.name}</h4>
                  <p className="text-xs text-text-tertiary">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>

        {/* Trusted By / Partners */}
        <div className="text-center">
          <p className="text-sm font-semibold text-text-tertiary mb-6 uppercase tracking-wider">Trusted by leading healthcare providers</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {partners.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-border-light shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
              >
                <img src={p.logo} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                <span className="text-sm font-bold text-text-secondary">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
