import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Phone, ArrowRight, ShieldCheck, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/services";
import toast from "react-hot-toast";

type Step = "phone" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

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
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown > 0]);

  const handleSendOtp = async () => {
    const cleaned = cleanPhone(phone);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      await authService.requestLoginOtp(cleaned);
      setStep("otp");
      setCooldown(30);
      toast.success("OTP sent to your phone");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await authService.requestLoginOtp(cleanPhone(phone));
      setCooldown(30);
      toast.success("OTP resent");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      const data = await authService.verifyLoginOtp(cleanPhone(phone), otpCode);

      if (data.isNewUser) {
        // Redirect to signup with phone pre-filled
        navigate("/signup", { state: { phone: cleanPhone(phone), fromLogin: true } });
        return;
      }

      login(data.token!, data.user!, data.business!);
      toast.success(`Welcome back, ${data.user!.name}!`);

      if (data.user!.role === "SUPER_ADMIN" || data.user!.role === "ADMIN") {
        navigate("/super-admin");
      } else if (data.user!.role === "BUSINESS") {
        navigate("/business");
      } else {
        navigate(from);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-secondary">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-sm text-text-secondary mt-1">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border-light p-8 space-y-5">
          {/* ── Step 1: Phone ── */}
          {step === "phone" && (
            <>
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading || !phone.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send OTP <ArrowRight size={16} />
                  </>
                )}
              </button>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <>
              {/* Phone display + change */}
              <div className="flex items-center justify-between bg-surface-secondary rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-text-tertiary" />
                  <span className="text-sm font-medium text-text-primary">
                    +91 {cleanPhone(phone)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtpCode("");
                  }}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Change
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Enter OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm text-center tracking-[0.4em] font-mono focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-text-tertiary">
                    OTP sent via SMS
                  </p>
                  {cooldown > 0 ? (
                    <p className="text-xs text-text-tertiary">
                      Resend in {cooldown}s
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-xs text-primary font-medium hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={16} /> Verify & Sign In
                  </>
                )}
              </button>
            </>
          )}

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-text-tertiary">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Business login hint */}
        <p className="text-center text-xs text-text-tertiary mt-4">
          Business or admin?{" "}
          <Link to="/business-login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}