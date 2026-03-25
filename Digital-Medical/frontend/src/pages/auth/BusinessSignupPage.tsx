import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, Eye, EyeOff, User, Phone, Mail, Lock, ArrowRight,
  MapPin, ChevronDown, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService, otpService, categoryService, locationService, type CategoryItem, type LocationItem } from "@/lib/services";
import { isProfessional } from "@/utils/categoryHelpers";
import toast from "react-hot-toast";

export default function BusinessSignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "", confirmPassword: "",
    businessName: "", categoryId: "", stateId: "", districtId: "", cityId: "", areaId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [states, setStates] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [areas, setAreas] = useState<LocationItem[]>([]);

  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    categoryService.listAll().then(setCategories).catch(() => { toast.error("Failed to load categories"); });
    locationService.states().then(setStates).catch(() => { toast.error("Failed to load states"); });
  }, []);

  useEffect(() => {
    if (form.stateId) {
      locationService.districts(form.stateId).then(setDistricts).catch(() => { toast.error("Failed to load districts"); });
      setForm((f) => ({ ...f, districtId: "", cityId: "", areaId: "" }));
      setCities([]);
      setAreas([]);
    }
  }, [form.stateId]);

  useEffect(() => {
    if (form.districtId) {
      locationService.cities(form.districtId).then(setCities).catch(() => { toast.error("Failed to load cities"); });
      setForm((f) => ({ ...f, cityId: "", areaId: "" }));
      setAreas([]);
    }
  }, [form.districtId]);

  useEffect(() => {
    if (form.cityId) {
      locationService.areas(form.cityId).then(setAreas).catch(() => {});
      setForm((f) => ({ ...f, areaId: "" }));
    }
  }, [form.cityId]);

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const isProf = isProfessional(selectedCategory?.slug);
  const canProceed1 = form.categoryId && form.businessName.trim();
  const canProceed2 = form.stateId && form.districtId && form.cityId;

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

    const phone = cleanPhone(form.phone);

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.businessSignup({
        name: form.name.trim() || form.businessName.trim(),
        businessName: form.businessName.trim(),
        phone,
        email: form.email.trim() || undefined,
        password: form.password,
        categoryId: form.categoryId,
        areaId: form.areaId || undefined,
      });
      login(data.token, data.user, data.business);
      toast.success("Business registered successfully! Awaiting approval.");
      navigate("/business");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all appearance-none bg-white";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-secondary">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Register Your Business</h1>
          <p className="text-sm text-text-secondary mt-1">
            List on India's largest medical directory
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? "bg-accent text-white" : step > s ? "bg-green-500 text-white" : "bg-surface-tertiary text-text-tertiary"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-green-500" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-border-light p-8 space-y-5">
          {/* Step 1: Category & Business Name */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-text-primary">Business Details</h2>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Business Category</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  <select
                    value={form.categoryId}
                    onChange={(e) => update("categoryId", e.target.value)}
                    className={selectClass}
                    required
                  >
                    <option value="">Select your category</option>
                    {categories.filter(c => !c.isService).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  {isProf ? "Your Full Name" : "Business Name"}
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    placeholder={isProf ? "e.g. Dr. Rahul Sharma" : "e.g. City Hospital, MedPlus Pharmacy"}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceed1}
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue <ArrowRight size={16} />
              </button>
            </>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-text-primary">Business Location</h2>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">State</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  <select value={form.stateId} onChange={(e) => update("stateId", e.target.value)} className={selectClass} required>
                    <option value="">Select state</option>
                    {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">District</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  <select value={form.districtId} onChange={(e) => update("districtId", e.target.value)} className={selectClass} required disabled={!form.stateId}>
                    <option value="">Select district</option>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">City</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  <select value={form.cityId} onChange={(e) => update("cityId", e.target.value)} className={selectClass} required disabled={!form.districtId}>
                    <option value="">Select city</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              {areas.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Area (Optional)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                    <select value={form.areaId} onChange={(e) => update("areaId", e.target.value)} className={selectClass} disabled={!form.cityId}>
                      <option value="">Select area</option>
                      {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-tertiary transition-colors">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canProceed2}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* Step 3: Account Details */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold text-text-primary">Your Account</h2>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Owner / Manager Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name of the owner or manager" className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" required />
                </div>
                <p className="text-xs text-text-tertiary mt-1">This will be shown as the owner on your business profile</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input type="tel" value={form.phone} onChange={(e) => { update("phone", e.target.value); if (otpSent) { setOtpSent(false); setOtpVerified(false); setOtpCode(""); } }} placeholder="10-digit mobile" pattern="[0-9]{10}" className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" required disabled={otpVerified} />
                </div>
                {/* OTP Controls */}
                {!otpVerified && (
                  <div className="mt-2">
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || !form.phone.trim()}
                        className="text-sm font-medium text-accent hover:text-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all tracking-widest text-center"
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
                      <button type="button" onClick={handleSendOtp} disabled={otpLoading} className="text-xs text-accent hover:underline mt-1">
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
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="business@email.com" className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min 6 characters" minLength={6} className="w-full pl-10 pr-11 py-3 border border-border rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Re-enter password" className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" required />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-tertiary transition-colors">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Register Business <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-text-secondary pt-2">
            Already registered?{" "}
            <Link to="/business/login" className="text-accent font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
