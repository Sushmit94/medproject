import { useState, FormEvent } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { contactService } from "@/lib/services";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    setSubmitting(true);
    setMsg(null);
    try {
      await contactService.submit(form);
      setMsg({ type: "success", text: "Thank you! We'll get back to you soon." });
      setForm({ name: "", phone: "", email: "", city: "", subject: "", message: "" });
    } catch {
      setMsg({ type: "error", text: "Failed to submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-secondary min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-bold">Contact Us</h1>
          <p className="text-sm text-white/80 mt-2">Have a question? We'd love to hear from you.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Phone, label: "Phone", value: "+91-XXXXX-XXXXX" },
            { icon: Mail, label: "Email", value: "info@digitalmedical.in" },
            { icon: MapPin, label: "Office", value: "India" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-border-light p-5 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon size={18} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold">{item.label}</h3>
              <p className="text-xs text-text-tertiary mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border-light p-6 sm:p-8">
          <h2 className="text-lg font-bold mb-6">Send us a Message</h2>
          {msg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Name *</label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone *</label>
                <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">City</label>
                <input value={form.city} onChange={(e) => set("city", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Subject</label>
              <input value={form.subject} onChange={(e) => set("subject", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Message *</label>
              <textarea required rows={5} value={form.message} onChange={(e) => set("message", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
            </div>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50">
              <Send size={15} /> {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
