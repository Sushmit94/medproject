import { useState, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight, MapPin, Clock, Phone, Star, Globe, BadgeCheck, Share2,
  Navigation, Send, Handshake, Stethoscope, Package, X, Search,
  ChevronLeft, ChevronRight as ChevronRightIcon, GraduationCap,
  Briefcase, Award, Building2, ShieldCheck, FileText, Pill, CalendarDays,
} from "lucide-react";
import { SiWhatsapp, SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";
import {
  businessService, reviewService, dealService, businessServiceService,
  productService,
  type BusinessProfile, type Review, type Deal, type BusinessServiceItem,
  type Product,
} from "@/lib/services";
import { mapBusinessProfileToListing } from "@/lib/publicMappers";
import { useAuth } from "@/contexts/AuthContext";
import PlanBadge from "@/components/common/PlanBadge";
import type { Listing } from "@/types";

// ── Category slug groups ──────────────────────────────────────────────
const PROFESSIONAL_SLUGS = ["doctors", "pharmacists", "medical-representatives"];
const PHARMACY_SLUGS = ["medicals", "pharmacists"];
const HOSPITAL_SLUGS = ["hospitals-clinics"];

// ── Types for qual/exp ────────────────────────────────────────────────
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

export default function DetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | undefined>();
  const [rawProfile, setRawProfile] = useState<BusinessProfile | null>(null);
  const [businessId, setBusinessId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [services, setServices] = useState<BusinessServiceItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productTotal, setProductTotal] = useState(0);

  const [showProductsModal, setShowProductsModal] = useState(false);
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalTotal, setModalTotal] = useState(0);
  const [modalPage, setModalPage] = useState(1);
  const [modalSearch, setModalSearch] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    businessService.getBySlug(slug)
      .then((res) => {
        setListing(mapBusinessProfileToListing(res));
        setRawProfile(res);
        setBusinessId(res.id);
        reviewService.forBusiness(res.id, "limit=20").then((rr) => setReviews(rr.data)).catch(() => { });
        dealService.forBusiness(res.id).then((dr) => setDeals(dr.data)).catch(() => { });
        businessServiceService.forBusiness(res.id).then((sr) => setServices(sr.data)).catch(() => { });
        productService.publicForBusiness(res.id, "limit=6").then((pr) => { setProducts(pr.data); setProductTotal(pr.pagination.total); }).catch(() => { });
      })
      .catch(() => setError("Failed to load business details"))
      .finally(() => setLoading(false));
  }, [slug]);

  const fetchModalProducts = (page: number, search: string) => {
    if (!businessId) return;
    setModalLoading(true);
    productService.publicForBusiness(businessId, `limit=20&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`)
      .then((pr) => { setModalProducts(pr.data); setModalTotal(pr.pagination.total); })
      .catch(() => { })
      .finally(() => setModalLoading(false));
  };

  const openProductsModal = () => {
    setModalPage(1); setModalSearch(""); setShowProductsModal(true); fetchModalProducts(1, "");
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setReviewSubmitting(true); setReviewMsg(null);
    try {
      await reviewService.create({ businessId, rating: reviewRating, comment: reviewComment || undefined });
      setReviewMsg({ type: "success", text: "Review submitted! It will appear after approval." });
      setReviewComment(""); setReviewRating(5);
    } catch {
      setReviewMsg({ type: "error", text: "Failed to submit review. Please login first." });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? +(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const withProtocol = (url: string) => url.startsWith("http") ? url : `https://${url}`;

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><p className="text-text-tertiary">Loading...</p></div>;
  if (!listing) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">{error ? "Something went wrong" : "Listing not found"}</h1>
      <p className="text-text-tertiary mb-6">{error || "We couldn't find the provider you're looking for."}</p>
      <Link to="/" className="text-sm font-medium text-primary hover:underline">← Back to Home</Link>
    </div>
  );

  const catSlug = listing.categorySlug || "";
  const isProfessional = PROFESSIONAL_SLUGS.includes(catSlug);
  const isPharmacy = PHARMACY_SLUGS.includes(catSlug);
  const isHospital = HOSPITAL_SLUGS.includes(catSlug);

  const staffList: any[] = (rawProfile as any)?.staff || [];
  const licenses: any[] = (rawProfile as any)?.licenses || [];
  const designation = rawProfile?.designation || "";

  // ── Pull qualifications & work experience from the profile ──
  const qualifications: Qualification[] = Array.isArray((rawProfile as any)?.qualifications)
    ? (rawProfile as any).qualifications
    : [];
  const workExperience: WorkExperience[] = Array.isArray((rawProfile as any)?.workExperience)
    ? (rawProfile as any).workExperience
    : [];

  const planBorder: Record<string, string> = {
    platinum: "border-primary/30", gold: "border-amber-300/50",
    silver: "border-slate-300/50", free: "border-border-light",
  };

  return (
    <div className="bg-surface-secondary min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-text-tertiary">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/category/${catSlug}`} className="hover:text-primary">{listing.category}</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium truncate">{listing.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Hero card */}
            <div className={`bg-white rounded-xl border-2 ${planBorder[listing.plan]} overflow-hidden`}>
              <div className="relative h-48 sm:h-64 bg-surface-tertiary">
                <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
                {listing.sponsored && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold bg-amber-400 text-amber-900 rounded">SPONSORED</span>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold text-text-primary">{listing.name}</h1>
                      {listing.verified && <BadgeCheck size={18} className="text-primary shrink-0" />}
                    </div>
                    {designation && <p className="text-sm text-text-secondary mb-1">{designation}</p>}
                    <PlanBadge plan={listing.plan} />
                  </div>
                  <button className="p-2 rounded-lg border border-border-light hover:bg-surface-secondary">
                    <Share2 size={16} className="text-text-tertiary" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-sm font-semibold">
                    <Star size={14} fill="currentColor" /> {avgRating}
                  </div>
                  <span className="text-xs text-text-tertiary">{reviews.length} reviews</span>
                </div>

                <div className="space-y-2.5 text-sm text-text-secondary">
                  {(listing.address || listing.city) && (
                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="text-primary mt-0.5 shrink-0" />
                      <span>{[listing.address, listing.city].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  {listing.timings && (
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-primary shrink-0" />
                      <span>{listing.timings}</span>
                    </div>
                  )}
                  {listing.phone.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-primary shrink-0" />
                      <a href={`tel:${listing.phone[0]}`} className="hover:text-primary">{listing.phone.join(", ")}</a>
                    </div>
                  )}
                  {listing.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={15} className="text-primary shrink-0" />
                      <a href={withProtocol(listing.website)} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">{listing.website}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── About / About Me ── */}
            {listing.description && (
              <Section title={isProfessional ? "About Me" : "About Us"} icon={<FileText size={18} className="text-accent" />}>
                <p className="text-sm text-text-secondary leading-relaxed">{listing.description}</p>
              </Section>
            )}

            {/* ── PROFESSIONAL SECTIONS (Doctors & Pharmacists only) ── */}
            {isProfessional && (
              <>
                {/* ── Qualifications ── */}
                {qualifications.length > 0 && (
                  <Section title="Qualifications" icon={<GraduationCap size={18} className="text-accent" />}>
                    <div className="space-y-3">
                      {qualifications.map((q, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <GraduationCap size={16} className="text-accent" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">{q.degree}</p>
                            {q.institution && (
                              <p className="text-xs text-text-secondary mt-0.5">{q.institution}</p>
                            )}
                            {q.year && (
                              <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                                {q.year}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* ── Work Experience ── */}
                {workExperience.length > 0 && (
                  <Section title="Work Experience" icon={<Briefcase size={18} className="text-accent" />}>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border-light" />
                      <div className="space-y-4">
                        {workExperience.map((w, i) => (
                          <div key={i} className="flex items-start gap-4 pl-2">
                            {/* Timeline dot */}
                            <div className={`relative z-10 w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${w.current ? "border-accent bg-accent" : "border-border-light bg-white"}`}>
                              {w.current && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-text-primary">{w.role}</p>
                                  {w.place && (
                                    <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                                      <Building2 size={11} className="shrink-0" /> {w.place}
                                    </p>
                                  )}
                                </div>
                                {(w.from || w.to || w.current) && (
                                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-text-tertiary bg-surface-secondary px-2 py-0.5 rounded-full">
                                    <CalendarDays size={10} />
                                    {w.from || "?"} — {w.current ? "Present" : (w.to || "?")}
                                  </span>
                                )}
                              </div>
                              {w.current && (
                                <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase tracking-wide">
                                  Currently Working
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Section>
                )}

                {/* Licenses — e.g. Pharmacist / Doctor Registration */}
                {licenses.length > 0 && (
                  <Section
                    title={catSlug === "pharmacists" ? "Pharmacist Registration" : catSlug === "doctors" ? "Medical Registration" : "Professional Registration"}
                    icon={<Award size={18} className="text-accent" />}
                  >
                    <div className="space-y-2">
                      {licenses.map((lic) => (
                        <InfoBullet key={lic.id} text={`${lic.type}: ${lic.licenseNo}${lic.issuedBy ? ` — ${lic.issuedBy}` : ""}`} />
                      ))}
                    </div>
                  </Section>
                )}
              </>
            )}

            {/* ── PHARMACY / MEDICAL STORE SECTIONS ── */}
            {isPharmacy && licenses.length > 0 && (
              <>
                <Section title="Medical DL Number" icon={<ShieldCheck size={18} className="text-accent" />}>
                  <div className="space-y-2">
                    {licenses.filter((l) => l.type?.toLowerCase().includes("drug") || l.type?.toLowerCase().includes("dl")).map((lic) => (
                      <InfoBullet key={lic.id} text={lic.licenseNo} />
                    ))}
                    {licenses.filter((l) => l.type?.toLowerCase().includes("drug") || l.type?.toLowerCase().includes("dl")).length === 0 &&
                      licenses.map((lic) => <InfoBullet key={lic.id} text={`${lic.type}: ${lic.licenseNo}`} />)
                    }
                  </div>
                </Section>

                {licenses.some((l) => l.expiryDate) && (
                  <Section title="Medical DL Renewal" icon={<FileText size={18} className="text-accent" />}>
                    <div className="space-y-2">
                      {licenses.filter((l) => l.expiryDate).map((lic) => (
                        <div key={lic.id} className="text-sm text-text-secondary">
                          {lic.issueDate && <p>w.e.f. {new Date(lic.issueDate).toLocaleDateString("en-IN")}</p>}
                          <p>Valid upto {new Date(lic.expiryDate!).toLocaleDateString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </>
            )}

            {/* ── HOSPITAL SECTIONS ── */}
            {isHospital && staffList.length > 0 && (
              <Section title="Our Doctors & Staff" icon={<Building2 size={18} className="text-accent" />}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {staffList.map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl">
                      {s.photo ? (
                        <img src={s.photo} alt={s.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-accent font-bold text-sm">
                          {s.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                        {s.role && <p className="text-xs text-text-secondary">{s.role}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Deals In ── */}
            {deals.length > 0 && (
              <Section title="Deals In" icon={<Handshake size={18} className="text-accent" />}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {deals.map((deal) => (
                    <div key={deal.id} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                      {deal.image && <img src={deal.image} alt={deal.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{deal.title}</p>
                        {deal.description && <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{deal.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Services ── */}
            {services.length > 0 && (
              <Section title="Services" icon={<Stethoscope size={18} className="text-accent" />}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((svc) => (
                    <div key={svc.id} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                      {svc.image && <img src={svc.image} alt={svc.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{svc.name}</p>
                        {svc.price && <p className="text-xs text-accent font-medium">{svc.price}</p>}
                        {svc.description && <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{svc.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Location ── */}
            {(listing.address || listing.city) && (
              <Section title="Location">
                <div className="h-56 rounded-xl overflow-hidden border border-border-light">
                  <iframe
                    title="location" width="100%" height="100%" style={{ border: 0 }}
                    referrerPolicy="no-referrer-when-downgrade"
                    src={
                      listing.latitude && listing.longitude
                        ? `https://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&output=embed&z=17`
                        : `https://maps.google.com/maps?q=${encodeURIComponent([listing.address, listing.city].filter(Boolean).join(", "))}&output=embed&z=15`
                    }
                    allowFullScreen
                  />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
                  <MapPin size={13} className="text-primary shrink-0" />
                  {[listing.address, listing.city].filter(Boolean).join(", ")}
                </p>
              </Section>
            )}

            {/* ── Reviews ── */}
            <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
              <h2 className="text-base font-bold mb-4">Reviews ({reviews.length})</h2>
              {user && (
                <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-surface-secondary rounded-xl">
                  <h3 className="text-sm font-semibold mb-3">Write a Review</h3>
                  {reviewMsg && (
                    <div className={`mb-3 p-2.5 rounded-lg text-xs ${reviewMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {reviewMsg.text}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setReviewRating(s)} className="p-0.5">
                        <Star size={20} className={s <= reviewRating ? "text-amber-500" : "text-gray-300"} fill={s <= reviewRating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience (optional)" rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border-light text-sm resize-none focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  />
                  <button type="submit" disabled={reviewSubmitting}
                    className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50">
                    <Send size={12} /> {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
              {reviews.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-4">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="pb-4 border-b border-border-light last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{r.user?.name || "User"}</span>
                        <span className="text-xs text-text-tertiary">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= r.rating ? "text-amber-500" : "text-gray-300"} fill={s <= r.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      {r.comment && <p className="text-sm text-text-secondary">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-4">
            <div className="bg-white rounded-xl border border-border-light p-5 sticky top-4">
              <h3 className="text-sm font-bold mb-3">Contact</h3>
              {listing.phone.length > 0 && (
                <a href={`tel:${listing.phone[0]}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors mb-2">
                  <Phone size={15} /> Call Now
                </a>
              )}
              <a href={
                listing.latitude && listing.longitude
                  ? `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`
                  : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([listing.address, listing.city].filter(Boolean).join(", "))}`
              } target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border bg-white text-sm font-medium hover:bg-surface-secondary transition-colors">
                <Navigation size={15} /> Get Directions
              </a>

              {listing.consultationFee && (
                <div className="mt-4 pt-4 border-t border-border-light text-center">
                  <span className="text-xs text-text-tertiary">Consultation Fee</span>
                  <p className="text-lg font-bold text-text-primary">{listing.consultationFee}</p>
                </div>
              )}

              {(listing.website || listing.facebook || listing.instagram || listing.youtube || listing.whatsapp) && (
                <div className="mt-4 pt-4 border-t border-border-light flex items-center gap-3 flex-wrap">
                  {listing.website && <SocialLink href={withProtocol(listing.website)} icon={<Globe size={22} className="text-primary" />} />}
                  {listing.whatsapp && <SocialLink href={`https://wa.me/${listing.whatsapp.replace(/\D/g, "")}`} icon={<SiWhatsapp size={22} color="#25D366" />} />}
                  {listing.facebook && <SocialLink href={withProtocol(listing.facebook)} icon={<SiFacebook size={22} color="#1877F2" />} />}
                  {listing.instagram && <SocialLink href={withProtocol(listing.instagram)} icon={<SiInstagram size={22} color="#E1306C" />} />}
                  {listing.youtube && <SocialLink href={withProtocol(listing.youtube)} icon={<SiYoutube size={22} color="#FF0000" />} />}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-border-light p-5">
              <h3 className="text-sm font-bold mb-3">Quick Info</h3>
              <dl className="space-y-2 text-sm">
                <QuickRow label="Category" value={listing.category} />
                <QuickRow label="Rating" value={
                  <span className="flex items-center gap-1"><Star size={12} className="text-amber-500" fill="currentColor" /> {avgRating}</span>
                } />
                <QuickRow label="Reviews" value={String(reviews.length)} />
                {listing.city && <QuickRow label="City" value={listing.city} />}
                {designation && <QuickRow label="Speciality" value={designation} />}
                {/* Show qualification count in sidebar for professionals */}
                {isProfessional && qualifications.length > 0 && (
                  <QuickRow label="Qualifications" value={String(qualifications.length)} />
                )}
                {isProfessional && workExperience.length > 0 && (
                  <QuickRow label="Experience" value={`${workExperience.length} position${workExperience.length > 1 ? "s" : ""}`} />
                )}
              </dl>
            </div>

            {/* Products */}
            {products.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Pill size={18} className="text-accent" /> Products
                  <span className="ml-auto text-xs font-medium px-1.5 py-0.5 bg-accent/10 text-accent rounded-full">{productTotal}</span>
                </h3>
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-accent" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                        {p.brand && <p className="text-xs text-text-tertiary">Brand: {p.brand}</p>}
                        {p.packSize && <p className="text-xs text-text-tertiary">Pack: {p.packSize}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                {productTotal > 6 && (
                  <button onClick={openProductsModal}
                    className="mt-3 w-full py-2 rounded-lg border border-accent text-accent text-xs font-semibold hover:bg-accent/5 transition-colors">
                    View all {productTotal} products →
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Products Modal */}
      {showProductsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowProductsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border-light shrink-0">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-accent" />
                <h2 className="text-base font-bold">Products</h2>
                <span className="text-xs font-medium px-1.5 py-0.5 bg-accent/10 text-accent rounded-full">{modalTotal}</span>
              </div>
              <button onClick={() => setShowProductsModal(false)} className="p-1.5 rounded-lg hover:bg-surface-secondary"><X size={18} className="text-text-tertiary" /></button>
            </div>
            <div className="p-4 border-b border-border-light shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input type="text" value={modalSearch}
                  onChange={(e) => { const val = e.target.value; setModalSearch(val); setModalPage(1); fetchModalProducts(1, val); }}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-light text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {modalLoading ? <div className="text-center py-12 text-sm text-text-tertiary">Loading...</div> :
                modalProducts.length === 0 ? <div className="text-center py-12 text-sm text-text-tertiary">No products found.</div> : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modalProducts.map((p) => (
                      <div key={p.id} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                        {p.image ? <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" /> :
                          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Package size={18} className="text-accent" /></div>}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                          {p.brand && <p className="text-xs text-text-tertiary">Brand: {p.brand}</p>}
                          {p.packSize && <p className="text-xs text-text-tertiary">Pack: {p.packSize}</p>}
                          {p.description && <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{p.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
            {modalTotal > 20 && (
              <div className="flex items-center justify-between p-4 border-t border-border-light shrink-0">
                <span className="text-xs text-text-tertiary">Page {modalPage} of {Math.ceil(modalTotal / 20)}</span>
                <div className="flex items-center gap-2">
                  <button disabled={modalPage === 1} onClick={() => { const p = modalPage - 1; setModalPage(p); fetchModalProducts(p, modalSearch); }}
                    className="p-1.5 rounded-lg border border-border-light hover:bg-surface-secondary disabled:opacity-40">
                    <ChevronLeft size={16} />
                  </button>
                  <button disabled={modalPage >= Math.ceil(modalTotal / 20)} onClick={() => { const p = modalPage + 1; setModalPage(p); fetchModalProducts(p, modalSearch); }}
                    className="p-1.5 rounded-lg border border-border-light hover:bg-surface-secondary disabled:opacity-40">
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small reusable components ─────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        {icon}{title}
      </h2>
      {children}
    </div>
  );
}

function InfoBullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-text-secondary">
      <span className="mt-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center shrink-0">
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span>{text}</span>
    </div>
  );
}

function QuickRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="p-2 rounded-lg bg-surface-secondary hover:bg-primary/5 transition-colors">
      {icon}
    </a>
  );
}