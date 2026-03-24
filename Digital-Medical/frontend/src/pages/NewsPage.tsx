import { useState, useEffect } from "react";
import { Newspaper, ExternalLink } from "lucide-react";
import { contentService } from "@/lib/services";
import { mapNewsItemToArticle } from "@/lib/publicMappers";
import type { NewsArticle } from "@/types";

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (activeCategory !== "all") params.set("type", activeCategory);
    contentService.news(params.toString())
      .then((res) => setArticles(res.data.map(mapNewsItemToArticle)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const newsCategories = ["Government", "Research", "Industry", "Policy", "Technology"];
  const filtered = articles;

  return (
    <div className="bg-surface-secondary min-h-screen">
      <div className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold text-text-primary">Health News</h1>
          <p className="text-sm text-text-tertiary mt-1">Stay updated with the latest in healthcare</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
              activeCategory === "all" ? "bg-primary text-white border-primary" : "bg-white border-border-light hover:border-border"
            }`}
          >
            All
          </button>
          {newsCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                activeCategory === cat ? "bg-primary text-white border-primary" : "bg-white border-border-light hover:border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border-light">
            <Newspaper size={32} className="mx-auto mb-3 text-text-tertiary" />
            <p className="text-text-tertiary">No articles found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative h-44 bg-surface-tertiary overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold rounded bg-primary/90 text-white">
                    {article.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-text-tertiary line-clamp-2 mb-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <div className="flex items-center gap-2">
                      <span>{article.author}</span>
                      <span>·</span>
                      <span>{article.publishedAt}</span>
                    </div>
                    <ExternalLink size={12} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
