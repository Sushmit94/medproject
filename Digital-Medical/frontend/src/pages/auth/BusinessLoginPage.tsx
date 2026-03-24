import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, Phone, Lock, ArrowRight, Hash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/services";
import toast from "react-hot-toast";

export default function BusinessLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);
    try {
      const data = await authService.login({ identifier: identifier.trim(), password });
      if (data.user.role !== "BUSINESS") {
        toast.error("This portal is for business accounts only");
        return;
      }
      login(data.token, data.user, data.business);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate("/business");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-secondary">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Business Portal</h1>
          <p className="text-sm text-text-secondary mt-1">
            Sign in to manage your business listing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-border-light p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Business ID, Phone or Email
            </label>
            <div className="relative">
              <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. HOS-123456, phone, or email"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                required
              />
            </div>
            <p className="text-xs text-text-tertiary mt-1.5">
              You can use your Business ID (like HOS-123456), registered phone, or email
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-text-primary">Password</label>
              <Link to="#" className="text-xs text-accent hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-3 border border-border rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
                Sign In to Business Portal <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-text-tertiary">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-text-secondary">
            New to Digital Medical?{" "}
            <Link to="/business/signup" className="text-accent font-semibold hover:underline">
              Register Your Business
            </Link>
          </p>

          <p className="text-center text-sm text-text-secondary">
            Looking to browse?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Customer Login
            </Link>
          </p>
        </form>

        <div className="mt-6 bg-accent/5 border border-accent/20 rounded-xl p-4">
          <div className="flex gap-3">
            <Phone size={18} className="text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Need Help?</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Contact support at <a href="tel:1800XXXXXXX" className="text-accent font-medium">1800-XXX-XXXX</a> or email{" "}
                <a href="mailto:support@digitalmedical.in" className="text-accent font-medium">support@digitalmedical.in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
