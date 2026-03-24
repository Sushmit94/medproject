import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Stethoscope, Pill, Microscope, FlaskConical, Heart, Siren, Droplets, BedDouble, Eye, Leaf, ShoppingBag } from "lucide-react";
import { categoryService, type CategoryItem } from "@/lib/services";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Building2, Stethoscope, Pill, Microscope, FlaskConical, Heart, Siren, Droplets, BedDouble, Eye, Leaf, ShoppingBag,
};

const categoryImages: Record<string, string> = {
  hospitals: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=200&h=200&fit=crop",
  doctors: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
  pharmacy: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop",
  diagnostics: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop",
  laboratories: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=200&fit=crop",
  clinics: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=200&h=200&fit=crop",
};

const colorSets = [
  { bg: "bg-blue-50", text: "text-blue-600", gradient: "from-blue-500 to-blue-700", ring: "group-hover:ring-blue-200" },
  { bg: "bg-teal-50", text: "text-teal-600", gradient: "from-teal-500 to-teal-700", ring: "group-hover:ring-teal-200" },
  { bg: "bg-orange-50", text: "text-orange-600", gradient: "from-orange-500 to-orange-700", ring: "group-hover:ring-orange-200" },
  { bg: "bg-purple-50", text: "text-purple-600", gradient: "from-purple-500 to-purple-700", ring: "group-hover:ring-purple-200" },
  { bg: "bg-indigo-50", text: "text-indigo-600", gradient: "from-indigo-500 to-indigo-700", ring: "group-hover:ring-indigo-200" },
  { bg: "bg-rose-50", text: "text-rose-600", gradient: "from-rose-500 to-rose-700", ring: "group-hover:ring-rose-200" },
  { bg: "bg-red-50", text: "text-red-600", gradient: "from-red-500 to-red-700", ring: "group-hover:ring-red-200" },
  { bg: "bg-pink-50", text: "text-pink-600", gradient: "from-pink-500 to-pink-700", ring: "group-hover:ring-pink-200" },
  { bg: "bg-amber-50", text: "text-amber-600", gradient: "from-amber-500 to-amber-700", ring: "group-hover:ring-amber-200" },
  { bg: "bg-cyan-50", text: "text-cyan-600", gradient: "from-cyan-500 to-cyan-700", ring: "group-hover:ring-cyan-200" },
  { bg: "bg-lime-50", text: "text-lime-600", gradient: "from-lime-500 to-lime-700", ring: "group-hover:ring-lime-200" },
  { bg: "bg-green-50", text: "text-green-600", gradient: "from-green-500 to-green-700", ring: "group-hover:ring-green-200" },
];

export default function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 border border-primary/15">
              Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Browse by <span className="text-primary">Category</span>
            </h2>
            <p className="text-base text-text-tertiary mt-2">Find healthcare services across all specialities</p>
          </div>
          <Link to="/category/hospitals-clinics" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent-dark transition-colors">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.slug] || iconMap[cat.name] || Building2;
            const colors = colorSets[i % colorSets.length];
            const img = categoryImages[cat.slug];
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`group relative flex flex-col items-center text-center p-5 rounded-2xl border border-border-light bg-white hover:bg-white hover:shadow-xl hover:shadow-slate-900/8 hover:border-transparent hover:-translate-y-1.5 ring-0 ring-transparent ${colors.ring} hover:ring-2 transition-all duration-300 overflow-hidden`}
              >
                {/* Background image on hover */}
                {img && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    <Icon size={26} strokeWidth={1.8} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary mb-1">{cat.name}</h3>
                  <p className="text-[11px] text-text-tertiary font-medium">{(cat._count?.businesses ?? 0).toLocaleString()}+ listed</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
