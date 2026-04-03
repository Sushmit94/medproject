import { useState, useEffect, useRef } from "react";
import { Save, Building2, Phone, Globe, Clock, MapPin, Camera, Upload, GraduationCap, Briefcase, Plus, Trash2 } from "lucide-react";
import { businessService, locationService, uploadService, type BusinessProfile, type LocationItem } from "@/lib/services";
import LocationPicker from "@/components/common/LocationPicker";

// ── Types ──
interface Qualification {
  degree: string;
  institution: string;
  year: string;
}

interface WorkExperience {
  role: string;
  place: string;
  from: string;
  to: string;
  current: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"image" | "cover" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    about: "",
    address: "",
    phone1: "",
    phone2: "",
    phone3: "",
    whatsapp: "",
    email: "",
    website: "",
    facebook: "",
    instagram: "",
    youtube: "",
    morningOpen: "",
    morningClose: "",
    eveningOpen: "",
    eveningClose: "",
    designation: "",
  });

  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  // Qualifications & Work Experience (only for doctors/pharmacists)
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);

  // Logic for conditional rendering based on category
  const slug = profile?.category?.slug ?? "";
  const hideMapAndHours = slug === "doctors" || slug === "pharmacists";
  const isProfessional = slug === "doctors" || slug === "pharmacists";

  // Cascade location state
  const [states, setStates] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [areas, setAreas] = useState<LocationItem[]>([]);
  const [locIds, setLocIds] = useState({ stateId: "", districtId: "", cityId: "", areaId: "" });

  useEffect(() => {
    businessService.getMyProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          about: data.about || "",
          address: data.address || "",
          phone1: data.phone1 || "",
          phone2: data.phone2 || "",
          phone3: data.phone3 || "",
          whatsapp: data.whatsapp || "",
          email: data.email || "",
          website: data.website || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          youtube: data.youtube || "",
          morningOpen: data.morningOpen || "",
          morningClose: data.morningClose || "",
          eveningOpen: data.eveningOpen || "",
          eveningClose: data.eveningClose || "",
          designation: data.designation || "",
        });
        setCoords({
          lat: data.latitude ?? null,
          lng: data.longitude ?? null,
        });

        // Load qualifications & work experience if they exist
        if (data.qualifications) {
          setQualifications(data.qualifications as Qualification[]);
        }
        if (data.workExperience) {
          setWorkExperience(data.workExperience as WorkExperience[]);
        }

        // Pre-populate cascade location from existing area
        if (data.area) {
          const state = data.area.city.district.state;
          const district = data.area.city.district;
          const city = data.area.city;
          setLocIds({ stateId: state.id, districtId: district.id, cityId: city.id, areaId: data.area.id });
          locationService.states().then(setStates).catch(() => { });
          locationService.districts(state.id).then(setDistricts).catch(() => { });
          locationService.cities(district.id).then(setCities).catch(() => { });
          locationService.areas(city.id).then(setAreas).catch(() => { });
        } else {
          locationService.states().then(setStates).catch(() => { });
        }
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load profile" }))
      .finally(() => setLoading(false));
  }, []);

  // ── Qualification helpers ──
  const addQualification = () =>
    setQualifications((prev) => [...prev, { degree: "", institution: "", year: "" }]);

  const updateQualification = (i: number, field: keyof Qualification, value: string) =>
    setQualifications((prev) => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));

  const removeQualification = (i: number) =>
    setQualifications((prev) => prev.filter((_, idx) => idx !== i));

  // ── Work Experience helpers ──
  const addWorkExperience = () =>
    setWorkExperience((prev) => [...prev, { role: "", place: "", from: "", to: "", current: false }]);

  const updateWorkExperience = (i: number, field: keyof WorkExperience, value: string | boolean) =>
    setWorkExperience((prev) =>
      prev.map((w, idx) =>
        idx === i
          ? { ...w, [field]: value, ...(field === "current" && value === true ? { to: "" } : {}) }
          : w
      )
    );

  const removeWorkExperience = (i: number) =>
    setWorkExperience((prev) => prev.filter((_, idx) => idx !== i));

  const handleImageUpload = async (file: File, type: "image" | "cover") => {
    setUploading(type);
    setMessage(null);
    try {
      const { url } = await uploadService.image(file, "businesses");
      const field = type === "image" ? "image" : "coverImage";
      const updated = await businessService.updateProfile({ [field]: url });
      setProfile(updated);
      setMessage({ type: "success", text: `${type === "image" ? "Profile" : "Cover"} image updated` });
    } catch {
      setMessage({ type: "error", text: "Failed to upload image" });
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const googleMapsUrl =
        coords.lat !== null && coords.lng !== null
          ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
          : undefined;

      const updatePayload: any = {
        ...form,
        ...(locIds.areaId ? { areaId: locIds.areaId } : {}),
        ...(coords.lat !== null && coords.lng !== null
          ? { latitude: coords.lat, longitude: coords.lng, googleMaps: googleMapsUrl }
          : {}),
      };

      // Only include qual/exp for professionals
      if (isProfessional) {
        updatePayload.qualifications = qualifications.filter((q) => q.degree.trim());
        updatePayload.workExperience = workExperience.filter((w) => w.role.trim());
      }

      const updated = await businessService.updateProfile(updatePayload);
      setProfile(updated);
      setCoords({ lat: updated.latitude ?? null, lng: updated.longitude ?? null });
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface-tertiary rounded animate-pulse" />
        <div className="bg-white rounded-xl border border-border-light p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-surface-tertiary rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {isProfessional ? "Personal Profile" : "Business Profile"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage your business information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Cover & Profile Images */}
      <div className="bg-white rounded-xl border border-border-light overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-primary/20 to-accent/20">
          {profile?.coverImage && (
            <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading === "cover"}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur text-xs font-medium text-text-primary rounded-lg hover:bg-white disabled:opacity-50 shadow-sm"
          >
            <Upload size={14} />
            {uploading === "cover" ? "Uploading..." : "Change Cover"}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, "cover");
              e.target.value = "";
            }}
          />
        </div>
        <div className="px-6 pb-5 -mt-10 flex items-end gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl border-4 border-white bg-surface-tertiary overflow-hidden shadow-sm">
              {profile?.image ? (
                <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                  <Building2 size={28} />
                </div>
              )}
            </div>
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading === "image"}
              className="absolute -bottom-1 -right-1 p-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 shadow-sm"
            >
              <Camera size={12} />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, "image");
                e.target.value = "";
              }}
            />
          </div>
          <div className="pb-1">
            <h3 className="text-base font-semibold text-text-primary">{profile?.name}</h3>
            <p className="text-xs text-text-tertiary">{profile?.businessId}</p>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-text-primary">
            {isProfessional ? "Personal Information" : "Business Information"}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {isProfessional ? "Full Name" : "Business Name"}
            </label>
            <input value={profile?.name || ""} disabled className="w-full px-3.5 py-2.5 bg-surface-tertiary border border-border-light rounded-xl text-sm text-text-tertiary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Category</label>
            <input value={profile?.category?.name || ""} disabled className="w-full px-3.5 py-2.5 bg-surface-tertiary border border-border-light rounded-xl text-sm text-text-tertiary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {isProfessional ? "Name" : "Owner / Manager Name"}
            </label>
            <input value={profile?.user?.name || ""} disabled className="w-full px-3.5 py-2.5 bg-surface-tertiary border border-border-light rounded-xl text-sm text-text-tertiary" />
            <p className="text-xs text-text-tertiary mt-1">Set at registration — contact support to update</p>
          </div>
          {isProfessional && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Designation / Specialization</label>
              <input
                value={form.designation}
                onChange={(e) => set("designation", e.target.value)}
                placeholder={slug === "doctors" ? "e.g. MBBS, MD - General Physician" : "e.g. B.Pharm, Registered Pharmacist"}
                className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
              />
            </div>
          )}
          <div className={isProfessional ? "md:col-span-2" : "md:col-span-2"}>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {isProfessional ? "About Me" : "About"}
            </label>
            <textarea
              value={form.about}
              onChange={(e) => set("about", e.target.value)}
              rows={4}
              placeholder={isProfessional ? "Describe yourself, your expertise..." : "Describe your business..."}
              className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── Qualifications (doctors & pharmacists only) ── */}
      {isProfessional && (
        <div className="bg-white rounded-xl border border-border-light p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Qualifications</h2>
            </div>
            <button
              onClick={addQualification}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {qualifications.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border-light rounded-xl">
              <GraduationCap size={28} className="text-text-tertiary mx-auto mb-2" />
              <p className="text-sm text-text-tertiary">No qualifications added yet</p>
              <button onClick={addQualification} className="mt-2 text-xs text-accent hover:underline">
                + Add your first qualification
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {qualifications.map((q, i) => (
                <div key={i} className="relative grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-surface-secondary rounded-xl border border-border-light">
                  <button
                    onClick={() => removeQualification(i)}
                    className="absolute top-3 right-3 p-1 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Degree / Certificate *</label>
                    <input
                      value={q.degree}
                      onChange={(e) => updateQualification(i, "degree", e.target.value)}
                      placeholder="e.g. MBBS, B.Pharm"
                      className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Institution</label>
                    <input
                      value={q.institution}
                      onChange={(e) => updateQualification(i, "institution", e.target.value)}
                      placeholder="e.g. AIIMS, Delhi"
                      className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white"
                    />
                  </div>
                  <div className="pr-8">
                    <label className="block text-xs font-medium text-text-secondary mb-1">Year</label>
                    <input
                      value={q.year}
                      onChange={(e) => updateQualification(i, "year", e.target.value)}
                      placeholder="e.g. 2015"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Work Experience (doctors & pharmacists only) ── */}
      {isProfessional && (
        <div className="bg-white rounded-xl border border-border-light p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Work Experience</h2>
            </div>
            <button
              onClick={addWorkExperience}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {workExperience.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border-light rounded-xl">
              <Briefcase size={28} className="text-text-tertiary mx-auto mb-2" />
              <p className="text-sm text-text-tertiary">No work experience added yet</p>
              <button onClick={addWorkExperience} className="mt-2 text-xs text-accent hover:underline">
                + Add your first experience
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workExperience.map((w, i) => (
                <div key={i} className="relative p-4 bg-surface-secondary rounded-xl border border-border-light">
                  <button
                    onClick={() => removeWorkExperience(i)}
                    className="absolute top-3 right-3 p-1 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Role / Position *</label>
                      <input
                        value={w.role}
                        onChange={(e) => updateWorkExperience(i, "role", e.target.value)}
                        placeholder={slug === "doctors" ? "e.g. Senior Resident Doctor" : "e.g. Retail Pharmacist"}
                        className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Hospital / Pharmacy</label>
                      <input
                        value={w.place}
                        onChange={(e) => updateWorkExperience(i, "place", e.target.value)}
                        placeholder="e.g. Apollo Hospital, Mumbai"
                        className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">From (Year)</label>
                      <input
                        value={w.from}
                        onChange={(e) => updateWorkExperience(i, "from", e.target.value)}
                        placeholder="e.g. 2018"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">To (Year)</label>
                      <input
                        value={w.current ? "" : w.to}
                        onChange={(e) => updateWorkExperience(i, "to", e.target.value)}
                        placeholder="e.g. 2022"
                        maxLength={4}
                        disabled={w.current}
                        className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white disabled:bg-surface-tertiary disabled:text-text-tertiary"
                      />
                    </div>
                  </div>
                  <label className="mt-3 flex items-center gap-2 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={w.current}
                      onChange={(e) => updateWorkExperience(i, "current", e.target.checked)}
                      className="w-4 h-4 rounded accent-accent"
                    />
                    <span className="text-xs text-text-secondary font-medium">Currently working here</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center gap-2 mb-5">
          <Phone size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-text-primary">Contact Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Phone 1" value={form.phone1} onChange={(v) => set("phone1", v)} placeholder="Primary number" />
          <InputField label="Phone 2" value={form.phone2} onChange={(v) => set("phone2", v)} placeholder="Secondary number" />
          <InputField label="Phone 3" value={form.phone3} onChange={(v) => set("phone3", v)} placeholder="Third number" />
          <InputField label="WhatsApp" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} placeholder="WhatsApp number" />
          <InputField label="Email" value={form.email} onChange={(v) => set("email", v)} placeholder="business@example.com" />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center gap-2 mb-5">
          <MapPin size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-text-primary">Address</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">State</label>
              <select
                value={locIds.stateId}
                onChange={(e) => {
                  const id = e.target.value;
                  setLocIds({ stateId: id, districtId: "", cityId: "", areaId: "" });
                  setDistricts([]); setCities([]); setAreas([]);
                  if (id) locationService.districts(id).then(setDistricts).catch(() => { });
                }}
                className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white"
              >
                <option value="">Select state</option>
                {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">District</label>
              <select
                value={locIds.districtId}
                disabled={!locIds.stateId}
                onChange={(e) => {
                  const id = e.target.value;
                  setLocIds((p) => ({ ...p, districtId: id, cityId: "", areaId: "" }));
                  setCities([]); setAreas([]);
                  if (id) locationService.cities(id).then(setCities).catch(() => { });
                }}
                className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white disabled:bg-surface-tertiary disabled:text-text-tertiary"
              >
                <option value="">Select district</option>
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">City</label>
              <select
                value={locIds.cityId}
                disabled={!locIds.districtId}
                onChange={(e) => {
                  const id = e.target.value;
                  setLocIds((p) => ({ ...p, cityId: id, areaId: "" }));
                  setAreas([]);
                  if (id) locationService.areas(id).then(setAreas).catch(() => { });
                }}
                className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white disabled:bg-surface-tertiary disabled:text-text-tertiary"
              >
                <option value="">Select city</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Area</label>
              <select
                value={locIds.areaId}
                disabled={!locIds.cityId}
                onChange={(e) => setLocIds((p) => ({ ...p, areaId: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white disabled:bg-surface-tertiary disabled:text-text-tertiary"
              >
                <option value="">Select area</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Address</label>
            <textarea value={form.address} onChange={(e) => set("address", e.target.value)} rows={2} placeholder="Street address, landmark, etc." className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none" />
          </div>

          {!hideMapAndHours && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Pin Location on Map</label>
              <LocationPicker
                lat={coords.lat}
                lng={coords.lng}
                onChange={(lat, lng) => setCoords({ lat, lng })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Online Presence */}
      <div className="bg-white rounded-xl border border-border-light p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-text-primary">Online Presence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="https://www.example.com" />
          <InputField label="Facebook" value={form.facebook} onChange={(v) => set("facebook", v)} placeholder="Facebook page URL" />
          <InputField label="Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} placeholder="Instagram profile URL" />
          <InputField label="YouTube" value={form.youtube} onChange={(v) => set("youtube", v)} placeholder="YouTube channel URL" />
        </div>
      </div>

      {/* Business Hours — hidden for professionals */}
      {!hideMapAndHours && (
        <div className="bg-white rounded-xl border border-border-light p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-text-primary">Business Hours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-3">Morning Shift</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Opens" value={form.morningOpen} onChange={(v) => set("morningOpen", v)} placeholder="09:00" type="time" />
                <InputField label="Closes" value={form.morningClose} onChange={(v) => set("morningClose", v)} placeholder="13:00" type="time" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary mb-3">Evening Shift</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Opens" value={form.eveningOpen} onChange={(v) => set("eveningOpen", v)} placeholder="16:00" type="time" />
                <InputField label="Closes" value={form.eveningClose} onChange={(v) => set("eveningClose", v)} placeholder="21:00" type="time" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none" />
    </div>
  );
}