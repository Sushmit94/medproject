import { useState, useEffect } from "react";
import { Search, Users, ToggleLeft, ToggleRight, Plus, X } from "lucide-react";
import { adminService, type AdminUser } from "@/lib/services";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadUsers = (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    adminService.users(params.toString())
      .then((res) => {
        setUsers(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load users" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers(1);
  };

  const handleToggle = async (id: string) => {
    try {
      await adminService.toggleUser(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u));
      setMessage({ type: "success", text: "User status updated" });
    } catch {
      setMessage({ type: "error", text: "Failed to update user status" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage platform users</p>
        </div>
        <button onClick={() => setShowAddAdmin(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, email..." className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="BUSINESS">Business</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90">Search</button>
      </form>

      {loading ? (
        <TableSkeleton />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <Users size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">User</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{user.name}</p>
                      {user.email && <p className="text-xs text-text-tertiary">{user.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{user.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${
                        user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                        user.role === "BUSINESS" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {user.business ? (
                        <div>
                          <p className="font-medium">{user.business.name}</p>
                          <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${
                            user.business.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                            user.business.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>{user.business.status}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-tertiary">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleToggle(user.id)} title={user.isActive ? "Deactivate" : "Activate"} className={`p-1.5 rounded-lg ${user.isActive ? "text-green-600 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}`}>
                        {user.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border-light">
              <p className="text-xs text-text-tertiary">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium border border-border-light rounded-lg disabled:opacity-50 hover:bg-surface-tertiary">Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-medium border border-border-light rounded-lg disabled:opacity-50 hover:bg-surface-tertiary">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddAdmin && (
        <AddAdminModal
          onClose={() => setShowAddAdmin(false)}
          onSaved={() => { setShowAddAdmin(false); loadUsers(); setMessage({ type: "success", text: "Admin user created" }); }}
          onError={(msg) => setMessage({ type: "error", text: msg })}
        />
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-surface-tertiary rounded animate-pulse" />
      ))}
    </div>
  );
}

function AddAdminModal({ onClose, onSaved, onError }: { onClose: () => void; onSaved: () => void; onError: (msg: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.password.trim()) return;
    setSaving(true);
    try {
      await adminService.createAdmin(form);
      onSaved();
    } catch {
      onError("Failed to create admin user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h2 className="text-base font-semibold text-text-primary">Add Admin User</h2>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Full name" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone *</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} required placeholder="Phone number" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email address" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password *</label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required placeholder="Password" className="w-full px-3.5 py-2.5 border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
