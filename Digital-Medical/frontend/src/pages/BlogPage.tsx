import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar } from "lucide-react";
import { contentService, type BlogItem } from "@/lib/services";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    contentService.blogs(`page=${page}&limit=12`)
      .then((res) => {
        setBlogs(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="bg-surface-secondary min-h-screen">
      <div className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-xl font-bold text-text-primary">Health Blog</h1>
          <p className="text-sm text-text-tertiary mt-1">Latest articles on healthcare and wellness</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-border-light overflow-hidden animate-pulse">
                <div className="h-44 bg-surface-tertiary" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-surface-tertiary rounded" />
                  <div className="h-3 w-full bg-surface-tertiary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border-light">
            <BookOpen size={32} className="mx-auto mb-3 text-text-tertiary" />
            <p className="text-text-tertiary">No blog posts yet</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.slug}`}
                  className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="h-44 bg-surface-tertiary overflow-hidden">
                    {blog.thumbnail ? (
                      <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={32} className="text-text-tertiary" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors">{blog.title}</h2>
                    {blog.excerpt && <p className="text-xs text-text-tertiary mt-1.5 line-clamp-2">{blog.excerpt}</p>}
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-text-tertiary">
                      <Calendar size={12} />
                      {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium border border-border-light rounded-lg disabled:opacity-50 hover:bg-white">Prev</button>
                <span className="px-4 py-2 text-sm text-text-tertiary">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium border border-border-light rounded-lg disabled:opacity-50 hover:bg-white">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
