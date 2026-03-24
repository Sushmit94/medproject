import { useState, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Building, IndianRupee, Clock, GraduationCap, User, Send } from "lucide-react";
import { jobService, type Job } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    name: "", phone: "", education: "", experience: "",
    currentWork: "", expectedSalary: "", preferredLocation: "",
  });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    jobService.getBySlug(slug)
      .then((res) => setJob(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!job || !form.name || !form.phone) return;
    setApplying(true);
    setMsg(null);
    try {
      await jobService.apply(job.id, form);
      setMsg({ type: "success", text: "Application submitted successfully!" });
      setShowApply(false);
    } catch {
      setMsg({ type: "error", text: "Failed to apply. Please login first." });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><p className="text-text-tertiary">Loading...</p></div>;
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-2">Job not found</h1>
        <Link to="/services/jobs" className="text-sm text-primary hover:underline">← Back to Jobs</Link>
      </div>
    );
  }

  const isExpired = job.lastDate ? new Date(job.lastDate) < new Date() : false;

  return (
    <div className="bg-surface-secondary min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/services/jobs" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-3">
            <ArrowLeft size={14} /> Back to Jobs
          </Link>
          <h1 className="text-xl font-bold">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/80">
            {job.business && <span className="flex items-center gap-1"><Building size={14} /> {job.business.name}</span>}
            {job.business?.area && <span className="flex items-center gap-1"><MapPin size={14} /> {job.business.area.name}, {job.business.area.city.name}</span>}
            {job.jobCategory && <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{job.jobCategory.name}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {msg && (
              <div className={`p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {msg.text}
              </div>
            )}

            <div className="bg-white rounded-xl border border-border-light p-5">
              <h2 className="text-base font-bold mb-3">Job Description</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{job.description || "No description provided."}</p>
            </div>

            {job.selectionProcess && (
              <div className="bg-white rounded-xl border border-border-light p-5">
                <h2 className="text-base font-bold mb-3">Selection Process</h2>
                <p className="text-sm text-text-secondary">{job.selectionProcess}</p>
              </div>
            )}

            {/* Apply Form */}
            {showApply && (
              <form onSubmit={handleApply} className="bg-white rounded-xl border border-blue-200 p-5 space-y-3">
                <h2 className="text-base font-bold">Apply for this Position</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input required placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                  <input required placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input placeholder="Education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                  <input placeholder="Experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input placeholder="Current Work" value={form.currentWork} onChange={(e) => setForm({ ...form, currentWork: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                  <input placeholder="Expected Salary" value={form.expectedSalary} onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })} className="px-3 py-2 rounded-lg border border-border-light text-sm" />
                </div>
                <input placeholder="Preferred Location" value={form.preferredLocation} onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border-light text-sm" />
                <div className="flex gap-2">
                  <button type="submit" disabled={applying} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50">
                    <Send size={12} /> {applying ? "Submitting..." : "Submit Application"}
                  </button>
                  <button type="button" onClick={() => setShowApply(false)} className="px-4 py-2 rounded-lg border border-border-light text-xs font-medium">Cancel</button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-xl border border-border-light p-5">
              <h3 className="text-sm font-bold mb-3">Job Details</h3>
              <dl className="space-y-2.5 text-sm">
                {job.salary && (
                  <div className="flex items-start gap-2">
                    <IndianRupee size={14} className="text-primary mt-0.5 shrink-0" />
                    <div><dt className="text-xs text-text-tertiary">Salary</dt><dd className="font-medium">{job.salary}</dd></div>
                  </div>
                )}
                {job.experience && (
                  <div className="flex items-start gap-2">
                    <Briefcase size={14} className="text-primary mt-0.5 shrink-0" />
                    <div><dt className="text-xs text-text-tertiary">Experience</dt><dd className="font-medium">{job.experience}</dd></div>
                  </div>
                )}
                {job.education && (
                  <div className="flex items-start gap-2">
                    <GraduationCap size={14} className="text-primary mt-0.5 shrink-0" />
                    <div><dt className="text-xs text-text-tertiary">Education</dt><dd className="font-medium">{job.education}</dd></div>
                  </div>
                )}
                {job.gender && (
                  <div className="flex items-start gap-2">
                    <User size={14} className="text-primary mt-0.5 shrink-0" />
                    <div><dt className="text-xs text-text-tertiary">Gender</dt><dd className="font-medium">{job.gender}</dd></div>
                  </div>
                )}
                {job.ageRange && (
                  <div className="flex items-start gap-2">
                    <User size={14} className="text-primary mt-0.5 shrink-0" />
                    <div><dt className="text-xs text-text-tertiary">Age Range</dt><dd className="font-medium">{job.ageRange}</dd></div>
                  </div>
                )}
                {job.lastDate && (
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-primary mt-0.5 shrink-0" />
                    <div><dt className="text-xs text-text-tertiary">Last Date</dt><dd className={`font-medium ${isExpired ? "text-red-500" : ""}`}>{new Date(job.lastDate).toLocaleDateString()}{isExpired && " (Expired)"}</dd></div>
                  </div>
                )}
              </dl>

              {!isExpired && user && !showApply && (
                <button onClick={() => setShowApply(true)} className="mt-4 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90">
                  Apply Now
                </button>
              )}
              {isExpired && <p className="mt-4 text-center text-xs text-red-500 font-medium">Application deadline has passed</p>}
              {!user && !isExpired && (
                <Link to="/login" className="mt-4 block text-center text-xs text-primary font-medium hover:underline">Login to apply</Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
