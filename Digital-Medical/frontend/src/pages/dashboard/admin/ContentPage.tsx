import { useState, useEffect, useRef } from "react";
import { Plus, Newspaper, Trash2, Edit2, X, ExternalLink, ImagePlus } from "lucide-react";
import { contentService, uploadService, type NewsItem, type BlogItem } from "@/lib/services";

export default function ContentPage() {
  const [tab, setTab] = useState<"news" | "blogs">("news");
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [blogList, setBlogList] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadContent = () => {
    setLoading(true);
    if (tab === "news") {
      contentService.news()
        .then((res) => setNewsList(res.data))
        .catch(() => setMessage({ type: "error", text: "Failed to load news" }))
        .finally(() => setLoading(false));
    } else {
      contentService.blogs()
        .then((res) => setBlogList(res.data))
        .catch(() => setMessage({ type: "error", text: "Failed to load blogs" }))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => { loadContent(); }, [tab]);

  const deleteNews = async (id: string) => {
    if (!confirm("Delete this news item?")) return;
    try {
      await contentService.deleteNews(id);
      setNewsList((prev) => prev.filter((n) => n.id !== id));
      setMessage({ type: "success", text: "News deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete news" });
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await contentService.deleteBlog(id);
      setBlogList((prev) => prev.filter((b) => b.id !== id));
      setMessage({ type: "success", text: "Blog deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete blog" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">News & Blogs</h1>
          <p className="text-sm text-text-secondary mt-1">Manage content on the platform</p>
        </div>
        <button onClick={() => { setEditingNews(null); setEditingBlog(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">
          <Plus size={16} /> Add {tab === "news" ? "News" : "Blog"}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab("news")} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === "news" ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}>News</button>
        <button onClick={() => setTab("blogs")} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === "blogs" ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}>Blogs</button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border-light p-4 animate-pulse">
              <div className="h-4 w-64 bg-surface-tertiary rounded" />
              <div className="h-3 w-32 bg-surface-tertiary rounded mt-2" />
            </div>
          ))}
        </div>
      ) : tab === "news" ? (
        newsList.length === 0 ? (
          <Empty label="No news items" />
        ) : (
          <div className="space-y-2">
            {newsList.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-border-light p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary truncate">{item.title}</h3>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700">{item.type}</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-text-tertiary">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        Link <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingNews(item); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => deleteNews(item.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        blogList.length === 0 ? (
          <Empty label="No blog posts" />
        ) : (
          <div className="space-y-2">
            {blogList.map((blog) => (
              <div key={blog.id} className="bg-white rounded-xl border border-border-light p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary truncate">{blog.title}</h3>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${blog.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {blog.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {blog.excerpt && <p className="text-xs text-text-tertiary mt-0.5 truncate">{blog.excerpt}</p>}
                  <span className="text-xs text-text-tertiary">{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingBlog(blog); setShowModal(true); }} className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => deleteBlog(blog.id)} className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showModal && tab === "news" && (
        <NewsModal
          item={editingNews}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadContent(); setMessage({ type: "success", text: editingNews ? "News updated" : "News created" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}

      {showModal && tab === "blogs" && (
        <BlogModal
          item={editingBlog}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadContent(); setMessage({ type: "success", text: editingBlog ? "Blog updated" : "Blog created" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-12 text-center">
      <Newspaper size={40} className="text-text-tertiary mx-auto mb-3" />
      <p className="text-sm text-text-tertiary">{label}</p>
    </div>
  );
}

function NewsModal({ item, onClose, onSaved, onError }: {
  item: NewsItem | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: item?.title || "",
    link: item?.link || "",
    type: item?.type || "HEADLINE",
    image: item?.image || "",
    isActive: item?.isActive ?? true,
  });
  const set = (f: string, v: string | boolean) => setForm((p) => ({ ...p, [f]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadService.image(file, "news");
      set("image", url);
    } catch { onError("Image upload failed"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, image: form.image || null, link: form.link || "" };
      if (item) await contentService.updateNews(item.id, payload);
      else await contentService.createNews(payload);
      onSaved();
    } catch { onError("Failed to save news"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold">{item ? "Edit News" : "Add News"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Link URL</label>
            <input value={form.link} onChange={(e) => set("link", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="HEADLINE">Headline</option>
              <option value="BREAKING">Breaking</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Image</label>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleImageUpload} className="hidden" />
            <div onClick={() => fileRef.current?.click()} className="w-full border border-dashed border-border-light rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors overflow-hidden" style={{ minHeight: 120 }}>
              {uploading ? (
                <span className="text-xs text-text-tertiary animate-pulse">Uploading…</span>
              ) : form.image ? (
                <img src={form.image} alt="" className="w-full h-32 object-cover" />
              ) : (
                <>
                  <ImagePlus size={24} className="text-text-tertiary" />
                  <span className="text-xs text-text-tertiary mt-1">Click to upload</span>
                </>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">{saving ? "Saving..." : item ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BlogModal({ item, onClose, onSaved, onError }: {
  item: BlogItem | null; onClose: () => void; onSaved: () => void; onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: item?.title || "",
    content: item?.content || "",
    excerpt: item?.excerpt || "",
    thumbnail: item?.thumbnail || "",
    isActive: item?.isActive ?? true,
  });
  const set = (f: string, v: string | boolean) => setForm((p) => ({ ...p, [f]: v }));

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadService.image(file, "blogs");
      set("thumbnail", url);
    } catch { onError("Image upload failed"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, excerpt: form.excerpt || null, thumbnail: form.thumbnail || null };
      if (item) await contentService.updateBlog(item.id, payload);
      else await contentService.createBlog(payload);
      onSaved();
    } catch { onError("Failed to save blog"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold">{item ? "Edit Blog" : "Add Blog"}</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Excerpt</label>
            <input value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Content *</label>
            <textarea value={form.content} onChange={(e) => set("content", e.target.value)} required rows={8} className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Thumbnail</label>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleThumbUpload} className="hidden" />
            <div onClick={() => fileRef.current?.click()} className="w-full border border-dashed border-border-light rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors overflow-hidden" style={{ minHeight: 120 }}>
              {uploading ? (
                <span className="text-xs text-text-tertiary animate-pulse">Uploading…</span>
              ) : form.thumbnail ? (
                <img src={form.thumbnail} alt="" className="w-full h-32 object-cover" />
              ) : (
                <>
                  <ImagePlus size={24} className="text-text-tertiary" />
                  <span className="text-xs text-text-tertiary mt-1">Click to upload</span>
                </>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">{saving ? "Saving..." : item ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
