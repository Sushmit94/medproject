import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { reviewService, type Review } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";

export default function ReviewsPage() {
  const { business } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!business?.id) return;
    reviewService.forBusiness(business.id)
      .then((res) => setReviews(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load reviews" }))
      .finally(() => setLoading(false));
  }, [business?.id]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reviews</h1>
        <p className="text-sm text-text-secondary mt-1">Customer feedback and ratings</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border-light p-5 text-center">
          <p className="text-3xl font-bold text-text-primary">{avgRating}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} className={Number(avgRating) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
            ))}
          </div>
          <p className="text-xs text-text-tertiary mt-1">Average Rating</p>
        </div>
        <div className="bg-white rounded-xl border border-border-light p-5 text-center">
          <p className="text-3xl font-bold text-text-primary">{reviews.length}</p>
          <p className="text-xs text-text-tertiary mt-1">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-border-light p-5 text-center">
          <p className="text-3xl font-bold text-text-primary">{reviews.filter((r) => r.rating >= 4).length}</p>
          <p className="text-xs text-text-tertiary mt-1">Positive Reviews</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-surface-tertiary rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-tertiary rounded" />
                  <div className="h-3 w-full bg-surface-tertiary rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Star size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-border-light p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  {review.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{review.user?.name || "Anonymous"}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={review.rating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-text-tertiary">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="text-sm text-text-secondary mt-2">{review.comment}</p>}
                  {!review.isApproved && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-yellow-100 text-yellow-700">Pending Approval</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
