import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, User, Phone, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService, otpService } from "@/lib/services";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  // Clean phone to bare 10 digits
  const cleanPhone = (raw: string) =>
    raw.trim().replace(/[\s\-().]/g, "").replace(/^\+91/, "").replace(/^0/, "");

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      return;
    }
    cooldownRef.current = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, [cooldown > 0]);

  const handleSendOtp = async () => {
    const phone = cleanPhone(form.phone);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setOtpLoading(true);
    try {
      await otpService.send({ phone, email: form.email.trim() || undefined, purpose: "SIGNUP" });
      setOtpSent(true);
      setCooldown(30);
      toast.success("OTP sent to your phone");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const phone = cleanPhone(form.phone);
    setOtpLoading(true);
    try {
      await otpService.verify({ phone, code: otpCode, purpose: "SIGNUP" });
      setOtpVerified(true);
      toast.success("Phone verified successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error("Please verify your phone number first");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signup({
        name: form.name.trim(),
        phone: cleanPhone(form.phone),
        email: form.email.trim() || undefined,
        password: form.password,
      });
      login(data.token, data.user, data.business);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
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
            <UserPlus size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
          <p className="text-sm text-text-secondary mt-1">Join Digital Medical as a user</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-border-light p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => { update("phone", e.target.value); if (otpSent) { setOtpSent(false); setOtpVerified(false); setOtpCode(""); } }}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                required
                disabled={otpVerified}
              />
            </div>
            {/* OTP Controls */}
            {!otpVerified && (
              <div className="mt-2">
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !form.phone.trim()}
                    className="text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? "Sending..." : "Send OTP"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all tracking-widest text-center"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otpCode.length !== 6}
                      className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {otpLoading ? "..." : "Verify"}
                    </button>
                  </div>
                )}
                {otpSent && cooldown > 0 && (
                  <p className="text-xs text-text-tertiary mt-1">Resend in {cooldown}s</p>
                )}
                {otpSent && cooldown <= 0 && (
                  <button type="button" onClick={handleSendOtp} disabled={otpLoading} className="text-xs text-primary hover:underline mt-1">
                    Resend OTP
                  </button>
                )}
              </div>
            )}
            {otpVerified && (
              <p className="flex items-center gap-1 text-xs text-green-600 mt-1.5"><ShieldCheck size={14} /> Phone verified</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email (Optional)</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min 6 characters"
                minLength={6}
                className="w-full pl-10 pr-11 py-3 border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
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

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                required
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
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>


        </form>
      </div>
    </div>
  );
}
