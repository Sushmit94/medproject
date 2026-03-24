import { useState, useEffect } from "react";
import { Briefcase, MapPin, Clock, Building, IndianRupee, ChevronDown, ChevronUp } from "lucide-react";
import { jobService, type Job } from "@/lib/services";

export default function JobsPage() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService.categories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (filterCategory !== "all") params.set("categoryId", filterCategory);
    jobService.list(params.toString())
      .then((res) => setJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterCategory]);

  const filtered = jobs;

  const typeColor: Record<string, string> = {
    "Full Time": "bg-blue-50 text-blue-700",
    "Part Time": "bg-purple-50 text-purple-700",
    Contract: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="bg-surface-secondary min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Medical Jobs</h1>
              <p className="text-sm text-white/80">Find healthcare career opportunities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${
              filterCategory === "all" ? "bg-primary text-white border-primary" : "bg-white border-border-light"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${
                filterCategory === cat.id ? "bg-primary text-white border-primary" : "bg-white border-border-light"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <p className="text-sm text-text-tertiary mb-4">{filtered.length} jobs found</p>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-border-light">
            <Briefcase size={28} className="mx-auto mb-2 text-text-tertiary" />
            <p className="text-sm text-text-tertiary">No jobs found in this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{job.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-text-tertiary mt-1">
                        <span className="flex items-center gap-1"><Building size={11} /> {job.business?.name || "—"}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {job.business?.area?.name || "—"}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded shrink-0 ${typeColor["Full Time"]}`}>
                      {job.jobCategory?.name || "Job"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-secondary">
                    {job.salary && (
                      <span className="flex items-center gap-1"><IndianRupee size={11} /> {job.salary}</span>
                    )}
                    {job.lastDate && (
                      <span className="flex items-center gap-1"><Clock size={11} /> Apply by {new Date(job.lastDate).toLocaleDateString()}</span>
                    )}
                    {job.experience && (
                      <span className="px-2 py-0.5 bg-surface-secondary rounded text-text-tertiary text-[10px]">
                        {job.experience}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                  >
                    {expandedId === job.id ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Details</>}
                  </button>

                  {expandedId === job.id && (
                    <div className="mt-3 pt-3 border-t border-border-light">
                      <p className="text-xs text-text-secondary leading-relaxed mb-3">{job.description}</p>
                      <a
                        href={`/services/jobs/${job.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Apply Now
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
