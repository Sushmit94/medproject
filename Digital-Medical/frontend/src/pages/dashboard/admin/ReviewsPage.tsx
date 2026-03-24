import { useState, useEffect } from "react";
import { Star, CheckCircle, Trash2, MessageSquare } from "lucide-react";
import { reviewService, type Review } from "@/lib/services";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadReviews = () => {
    setLoading(true);
    reviewService.pending()
      .then((res) => setReviews(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load pending reviews" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReviews(); }, []);

  const handleAction = async (id: string, action: "approve" | "delete") => {
    try {
      await reviewService.moderate(id, { action });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setMessage({ type: "success", text: action === "approve" ? "Review approved" : "Review deleted" });
    } catch {
      setMessage({ type: "error", text: `Failed to ${action} review` });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Review Moderation</h1>
        <p className="text-sm text-text-secondary mt-1">Approve or remove pending user reviews</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-5 animate-pulse">
              <div className="h-4 w-40 bg-surface-tertiary rounded" />
              <div className="h-3 w-64 bg-surface-tertiary rounded mt-2" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <MessageSquare size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No pending reviews</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-border-light p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold text-text-primary">{review.user?.name || "Anonymous"}</span>
                    <span className="text-xs text-text-tertiary">→</span>
                    <span className="text-sm font-medium text-accent">{review.business?.name || "Unknown Business"}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                    ))}
                    <span className="text-xs text-text-tertiary ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="text-sm text-text-secondary">{review.comment}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(review.id, "approve")}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(review.id, "delete")}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
