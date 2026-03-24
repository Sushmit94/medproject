import { useState, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, MapPin, Clock, Phone, Star, Globe, BadgeCheck, Share2, Navigation, Send, Handshake, Stethoscope, Package, X, Search, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { SiWhatsapp, SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";
import { businessService, reviewService, dealService, businessServiceService, productService, type BusinessProfile, type Review, type Deal, type BusinessServiceItem, type Product } from "@/lib/services";
import { mapBusinessProfileToListing } from "@/lib/publicMappers";
import { useAuth } from "@/contexts/AuthContext";
import PlanBadge from "@/components/common/PlanBadge";
import type { Listing } from "@/types";

export default function DetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | undefined>();
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
        setBusinessId(res.id);
        // Load reviews, deals, services in parallel
        reviewService.forBusiness(res.id, "limit=20")
          .then((rr) => setReviews(rr.data))
          .catch(() => {});
        dealService.forBusiness(res.id)
          .then((dr) => setDeals(dr.data))
          .catch(() => {});
        businessServiceService.forBusiness(res.id)
          .then((sr) => setServices(sr.data))
          .catch(() => {});
        productService.publicForBusiness(res.id, "limit=6")
          .then((pr) => { setProducts(pr.data); setProductTotal(pr.pagination.total); })
          .catch(() => {});
      })
      .catch(() => { setError("Failed to load business details"); })
      .finally(() => setLoading(false));
  }, [slug]);

  const fetchModalProducts = (page: number, search: string) => {
    if (!businessId) return;
    setModalLoading(true);
    const params = `limit=20&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    productService.publicForBusiness(businessId, params)
      .then((pr) => { setModalProducts(pr.data); setModalTotal(pr.pagination.total); })
      .catch(() => {})
      .finally(() => setModalLoading(false));
  };

  const openProductsModal = () => {
    setModalPage(1);
    setModalSearch("");
    setShowProductsModal(true);
    fetchModalProducts(1, "");
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setReviewSubmitting(true);
    setReviewMsg(null);
    try {
      await reviewService.create({ businessId, rating: reviewRating, comment: reviewComment || undefined });
      setReviewMsg({ type: "success", text: "Review submitted! It will appear after approval." });
      setReviewComment("");
      setReviewRating(5);
    } catch {
      setReviewMsg({ type: "error", text: "Failed to submit review. Please login first." });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? +(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const reviewCount = reviews.length;
  const withProtocol = (url: string) => url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-text-tertiary">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">{error ? "Something went wrong" : "Listing not found"}</h1>
        <p className="text-text-tertiary mb-6">{error || "We couldn't find the provider you're looking for."}</p>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const planBorder: Record<string, string> = {
    platinum: "border-primary/30",
    gold: "border-amber-300/50",
    silver: "border-slate-300/50",
    free: "border-border-light",
  };

  return (
    <div className="bg-surface-secondary min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-text-tertiary">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/category/${listing.categorySlug || listing.category.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-primary">
            {listing.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium truncate">{listing.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hero card */}
            <div className={`bg-white rounded-xl border-2 ${planBorder[listing.plan]} overflow-hidden`}>
              {/* Image */}
              <div className="relative h-48 sm:h-64 bg-surface-tertiary">
                <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
                {listing.sponsored && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold bg-amber-400 text-amber-900 rounded">
                    SPONSORED
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold text-text-primary">{listing.name}</h1>
                      {listing.verified && <BadgeCheck size={18} className="text-primary shrink-0" />}
                    </div>
                    <PlanBadge plan={listing.plan} />
                  </div>
                  <button className="p-2 rounded-lg border border-border-light hover:bg-surface-secondary transition-colors">
                    <Share2 size={16} className="text-text-tertiary" />
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-sm font-semibold">
                    <Star size={14} fill="currentColor" /> {avgRating}
                  </div>
                  <span className="text-xs text-text-tertiary">{reviewCount} reviews</span>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-sm text-text-secondary">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-primary mt-0.5 shrink-0" />
                    <span>{listing.address}, {listing.city}</span>
                  </div>
                  {listing.timings && (
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-primary shrink-0" />
                      <span>{listing.timings}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-primary shrink-0" />
                    <a href={`tel:${listing.phone[0]}`} className="hover:text-primary">{listing.phone.join(", ")}</a>
                  </div>
                  {listing.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={15} className="text-primary shrink-0" />
                      <a href={listing.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                        {listing.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {listing.description && (
              <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
                <h2 className="text-base font-bold mb-3">About</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Deals In */}
            {deals.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
                <h2 className="text-base font-bold mb-3 flex items-center gap-2"><Handshake size={18} className="text-accent" /> Deals In</h2>
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
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
                <h2 className="text-base font-bold mb-3 flex items-center gap-2"><Stethoscope size={18} className="text-accent" /> Services</h2>
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
              </div>
            )}

            {/* Location */}
            {(listing.address || listing.city) && (
              <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
                <h2 className="text-base font-bold mb-3">Location</h2>
                <div className="h-56 rounded-xl overflow-hidden border border-border-light">
                  <iframe
                    title="location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
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
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6">
              <h2 className="text-base font-bold mb-4">Reviews ({reviews.length})</h2>

              {/* Review Form */}
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
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience (optional)"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border-light text-sm resize-none focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  />
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                  >
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

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* CTA */}
            <div className="bg-white rounded-xl border border-border-light p-5 sticky top-4">
              <h3 className="text-sm font-bold mb-3">Contact</h3>
              <a
                href={`tel:${listing.phone[0]}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors mb-2"
              >
                <Phone size={15} /> Call Now
              </a>
              <a
                href={
                  listing.latitude && listing.longitude
                    ? `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`
                    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(listing.address + ", " + listing.city)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border bg-white text-sm font-medium hover:bg-surface-secondary transition-colors"
              >
                <Navigation size={15} /> Get Directions
              </a>

              {listing.consultationFee && (
                <div className="mt-4 pt-4 border-t border-border-light text-center">
                  <span className="text-xs text-text-tertiary">Consultation Fee</span>
                  <p className="text-lg font-bold text-text-primary">{listing.consultationFee}</p>
                </div>
              )}

              {(listing.website || listing.facebook || listing.instagram || listing.youtube || listing.whatsapp) && (
                <div className="mt-4 pt-4 border-t border-border-light flex items-center gap-3">
                  {listing.website && (
                    <a href={withProtocol(listing.website)} target="_blank" rel="noopener noreferrer" title="Website" className="p-2 rounded-lg bg-surface-secondary hover:bg-primary/10 transition-colors">
                      <Globe size={26} className="text-primary" />
                    </a>
                  )}
                  {listing.whatsapp && (
                    <a href={`https://wa.me/${listing.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2 rounded-lg bg-surface-secondary hover:bg-green-50 transition-colors">
                      <SiWhatsapp size={26} color="#25D366" />
                    </a>
                  )}
                  {listing.facebook && (
                    <a href={withProtocol(listing.facebook)} target="_blank" rel="noopener noreferrer" title="Facebook" className="p-2 rounded-lg bg-surface-secondary hover:bg-blue-50 transition-colors">
                      <SiFacebook size={26} color="#1877F2" />
                    </a>
                  )}
                  {listing.instagram && (
                    <a href={withProtocol(listing.instagram)} target="_blank" rel="noopener noreferrer" title="Instagram" className="p-2 rounded-lg bg-surface-secondary hover:bg-pink-50 transition-colors">
                      <SiInstagram size={26} color="#E1306C" />
                    </a>
                  )}
                  {listing.youtube && (
                    <a href={withProtocol(listing.youtube)} target="_blank" rel="noopener noreferrer" title="YouTube" className="p-2 rounded-lg bg-surface-secondary hover:bg-red-50 transition-colors">
                      <SiYoutube size={26} color="#FF0000" />
                    </a>
                  )}
                </div>
              )}

            </div>

            {/* Quick info */}
            <div className="bg-white rounded-xl border border-border-light p-5">
              <h3 className="text-sm font-bold mb-3">Quick Info</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Category</dt>
                  <dd className="font-medium">{listing.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Rating</dt>
                  <dd className="font-medium flex items-center gap-1">
                    <Star size={12} className="text-amber-500" fill="currentColor" /> {avgRating}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Reviews</dt>
                  <dd className="font-medium">{reviewCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">City</dt>
                  <dd className="font-medium">{listing.city}</dd>
                </div>
              </dl>
            </div>

            {/* Products */}
            {products.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Package size={18} className="text-accent" /> Products
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
                  <button
                    onClick={openProductsModal}
                    className="mt-3 w-full py-2 rounded-lg border border-accent text-accent text-xs font-semibold hover:bg-accent/5 transition-colors"
                  >
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
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-light shrink-0">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-accent" />
                <h2 className="text-base font-bold">Products</h2>
                <span className="text-xs font-medium px-1.5 py-0.5 bg-accent/10 text-accent rounded-full">{modalTotal}</span>
              </div>
              <button onClick={() => setShowProductsModal(false)} className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors">
                <X size={18} className="text-text-tertiary" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border-light shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModalSearch(val);
                    setModalPage(1);
                    fetchModalProducts(1, val);
                  }}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-light text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="overflow-y-auto flex-1 p-4">
              {modalLoading ? (
                <div className="text-center py-12 text-text-tertiary text-sm">Loading...</div>
              ) : modalProducts.length === 0 ? (
                <div className="text-center py-12 text-text-tertiary text-sm">No products found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {modalProducts.map((p) => (
                    <div key={p.id} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-accent" />
                        </div>
                      )}
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

            {/* Pagination */}
            {modalTotal > 20 && (
              <div className="flex items-center justify-between p-4 border-t border-border-light shrink-0">
                <span className="text-xs text-text-tertiary">
                  Page {modalPage} of {Math.ceil(modalTotal / 20)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={modalPage === 1}
                    onClick={() => { const p = modalPage - 1; setModalPage(p); fetchModalProducts(p, modalSearch); }}
                    className="p-1.5 rounded-lg border border-border-light hover:bg-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={modalPage >= Math.ceil(modalTotal / 20)}
                    onClick={() => { const p = modalPage + 1; setModalPage(p); fetchModalProducts(p, modalSearch); }}
                    className="p-1.5 rounded-lg border border-border-light hover:bg-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
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
