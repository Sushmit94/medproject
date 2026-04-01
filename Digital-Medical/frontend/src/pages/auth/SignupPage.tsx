import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserPlus, User, Phone, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/services";
import toast from "react-hot-toast";

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Phone + verified flag passed from LoginPage when user is new
  const fromLogin = (location.state as { phone?: string; fromLogin?: boolean } | null);
  const prefilledPhone = fromLogin?.phone ?? "";
  const phoneVerifiedViaLogin = fromLogin?.fromLogin === true;

  const [form, setForm] = useState({
    name: "",
    phone: prefilledPhone,
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // If someone lands here directly (not from login OTP flow), send them to login first
  useEffect(() => {
    if (!phoneVerifiedViaLogin) {
      toast("Please verify your phone number first", { icon: "ℹ️" });
      navigate("/login", { replace: true });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signup({
        name: form.name.trim(),
        phone: form.phone,
        email: form.email.trim() || undefined,
      });
      login(data.token, data.user, data.business);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-secondary">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
          <p className="text-sm text-text-secondary mt-1">
            Join Digital Medical as a user
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-border-light p-8 space-y-4"
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Phone — locked, verified via OTP at login */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="tel"
                value={form.phone}
                disabled
                className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm bg-surface-secondary text-text-secondary cursor-not-allowed"
              />
              <ShieldCheck
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500"
              />
            </div>
            <p className="flex items-center gap-1 text-xs text-green-600 mt-1.5">
              <ShieldCheck size={13} /> Phone verified
            </p>
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Email{" "}
              <span className="text-text-tertiary font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-sm text-text-secondary pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}