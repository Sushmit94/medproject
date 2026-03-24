import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Newspaper } from "lucide-react";
import { contentService } from "@/lib/services";
import { mapNewsItemToArticle } from "@/lib/publicMappers";
import type { NewsArticle } from "@/types";

export default function NewsSection() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    contentService.news("limit=4")
      .then((res) => setArticles(res.data.map(mapNewsItemToArticle)))
      .catch(() => {});
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-surface-secondary to-white" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 border border-primary/15">
              <Newspaper size={12} />
              Latest News
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Health <span className="text-primary">News</span>
            </h2>
            <p className="text-base text-text-tertiary mt-2">Stay informed with latest medical updates</p>
          </div>
          <Link to="/news" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured Article */}
          {featured && (
            <Link to="/news" className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-xl hover:shadow-slate-900/8 hover:border-transparent transition-all duration-300">
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 text-[11px] font-bold rounded-lg bg-primary text-white shadow-md">
                  {featured.category}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors mb-2 line-clamp-2">
                  {featured.title}
                </h3>
                <p className="text-sm text-text-tertiary line-clamp-2 mb-4 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <span className="font-medium text-text-secondary">{featured.author}</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                  <span>{featured.publishedAt}</span>
                </div>
              </div>
            </Link>
          )}

          {/* Sidebar list */}
          <div className="flex flex-col gap-4">
            {rest.map((article) => (
              <Link
                key={article.id}
                to="/news"
                className="group flex gap-5 bg-white rounded-2xl border border-border-light p-4 hover:shadow-lg hover:shadow-slate-900/5 hover:border-transparent transition-all duration-300"
              >
                <div className="w-28 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[11px] font-bold text-primary mb-1.5 uppercase tracking-wider">{article.category}</span>
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                    <span className="font-medium">{article.author}</span>
                    <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                    <span>{article.publishedAt}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
