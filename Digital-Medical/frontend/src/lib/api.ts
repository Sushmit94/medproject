const API_BASE = "/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Prefer sessionStorage (tab-scoped) so multiple tabs can hold different roles.
// Falls back to localStorage for page-refresh persistence.
function getToken(): string | null {
  return sessionStorage.getItem("dm_token") ?? localStorage.getItem("dm_token");
}

function clearAuth() {
  sessionStorage.removeItem("dm_token");
  sessionStorage.removeItem("dm_user");
  sessionStorage.removeItem("dm_business");
  localStorage.removeItem("dm_token");
  localStorage.removeItem("dm_user");
  localStorage.removeItem("dm_business");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    const storedUser = sessionStorage.getItem("dm_user") ?? localStorage.getItem("dm_user");
    const role = storedUser ? (() => { try { return JSON.parse(storedUser)?.role; } catch { return null; } })() : null;
    clearAuth();
    window.location.href = role === "BUSINESS" ? "/business/login" : (role === "SUPER_ADMIN" || role === "ADMIN") ? "/super-admin/login" : "/login";
    throw new ApiError(401, "Session expired");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || res.statusText);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "DELETE", ...(body !== undefined && { body: JSON.stringify(body) }) }),
  upload: <T>(endpoint: string, formData: FormData) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    // Do NOT set Content-Type — browser sets it with boundary for multipart
    return fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    }).then(async (res) => {
      if (res.status === 401) {
        const storedUser = sessionStorage.getItem("dm_user") ?? localStorage.getItem("dm_user");
        const role = storedUser ? (() => { try { return JSON.parse(storedUser)?.role; } catch { return null; } })() : null;
        clearAuth();
        window.location.href = role === "BUSINESS" ? "/business/login" : (role === "SUPER_ADMIN" || role === "ADMIN") ? "/super-admin/login" : "/login";
        throw new ApiError(401, "Session expired");
      }
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new ApiError(res.status, data?.error || res.statusText);
      return data as T;
    });
  },
};

export { ApiError };
