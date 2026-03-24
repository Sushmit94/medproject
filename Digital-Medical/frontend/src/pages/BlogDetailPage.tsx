import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { contentService, type BlogItem } from "@/lib/services";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    contentService.blogBySlug(slug)
      .then((res) => setBlog(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-text-tertiary">Loading...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-2">Post not found</h1>
        <Link to="/blog" className="text-sm text-primary hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary min-h-screen">
      {blog.bannerImage && (
        <div className="h-64 sm:h-80 bg-surface-tertiary">
          <img src={blog.bannerImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <article className="bg-white rounded-xl border border-border-light p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-3">{blog.title}</h1>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-6">
            <Calendar size={12} />
            {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          {blog.excerpt && <p className="text-sm text-text-secondary italic mb-6 pb-6 border-b border-border-light">{blog.excerpt}</p>}
          <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-line">
            {blog.content}
          </div>
        </article>
      </div>
    </div>
  );
}
