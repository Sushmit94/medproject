import { Building2, Globe, Phone, ExternalLink } from "lucide-react";
import { HEALTH_DEPARTMENTS } from "@/lib/serviceConstants";

export default function HealthDepartmentsPage() {
  const healthDepartments = HEALTH_DEPARTMENTS;
  return (
    <div className="bg-surface-secondary min-h-screen">
      <div className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Health Departments</h1>
              <p className="text-sm text-white/80">Government health programs and departments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-border-light p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-green-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">{dept.name}</h3>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded bg-green-50 text-green-700 mt-1">
                    {dept.ministry}
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-tertiary mb-3 line-clamp-2">{dept.description}</p>

              {/* Programs */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {dept.role.slice(0, 3).map((p, i) => (
                  <span key={i} className="px-2 py-0.5 bg-surface-secondary rounded text-[10px] text-text-tertiary">{p}</span>
                ))}
                {dept.role.length > 3 && (
                  <span className="px-2 py-0.5 bg-surface-secondary rounded text-[10px] text-text-tertiary">+{dept.role.length - 3}</span>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-1.5 text-xs text-text-tertiary pt-3 border-t border-border-light">
                {dept.helpline && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={11} className="shrink-0" />
                    <a href={`tel:${dept.helpline}`} className="hover:text-primary">{dept.helpline}</a>
                  </div>
                )}
                {dept.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe size={11} className="shrink-0" />
                    <a href={dept.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                      Visit Website <ExternalLink size={9} className="inline" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
