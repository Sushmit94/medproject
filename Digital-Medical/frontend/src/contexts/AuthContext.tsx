import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authService, type AuthResponse } from "@/lib/services";

interface User {
  id: string;
  name: string;
  role: string;
}

interface Business {
  id: string;
  name: string;
  businessId: string;
  status: string;
  categoryId?: string;
  supplyChainRole?: string | null;
  category?: {
    slug: string;
    hasDealsIn: boolean;
    hasProducts: boolean;
    hasServices: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  business: Business | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User, business: Business | null) => void;
  logout: () => void;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  isBusiness: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((token: string, user: User, business: Business | null) => {
    // Write to sessionStorage (tab-specific) so each tab can hold a different role.
    // Also write to localStorage so a page refresh in this tab restores the session.
    sessionStorage.setItem("dm_token", token);
    sessionStorage.setItem("dm_user", JSON.stringify(user));
    if (business) sessionStorage.setItem("dm_business", JSON.stringify(business));
    localStorage.setItem("dm_token", token);
    localStorage.setItem("dm_user", JSON.stringify(user));
    if (business) localStorage.setItem("dm_business", JSON.stringify(business));
    setToken(token);
    setUser(user);
    setBusiness(business);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("dm_token");
    sessionStorage.removeItem("dm_user");
    sessionStorage.removeItem("dm_business");
    localStorage.removeItem("dm_token");
    localStorage.removeItem("dm_user");
    localStorage.removeItem("dm_business");
    setToken(null);
    setUser(null);
    setBusiness(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await authService.me();
      setUser({ id: data.id, name: data.name, role: data.role });
      if (data.business) setBusiness(data.business);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    // Prefer sessionStorage (tab-scoped) so each tab maintains its own login.
    // Fall back to localStorage for persistence across page refreshes.
    const stored =
      sessionStorage.getItem("dm_token") ?? localStorage.getItem("dm_token");
    if (stored) {
      setToken(stored);
      try {
        const u = sessionStorage.getItem("dm_user") ?? localStorage.getItem("dm_user");
        const b = sessionStorage.getItem("dm_business") ?? localStorage.getItem("dm_business");
        if (u) setUser(JSON.parse(u));
        if (b) setBusiness(JSON.parse(b));
        // Mirror into sessionStorage so subsequent reads stay tab-scoped
        if (stored && !sessionStorage.getItem("dm_token")) {
          sessionStorage.setItem("dm_token", stored);
          if (u) sessionStorage.setItem("dm_user", u);
          if (b) sessionStorage.setItem("dm_business", b);
        }
      } catch {
        // Corrupted storage data — clear both
        sessionStorage.removeItem("dm_token");
        sessionStorage.removeItem("dm_user");
        sessionStorage.removeItem("dm_business");
        localStorage.removeItem("dm_token");
        localStorage.removeItem("dm_user");
        localStorage.removeItem("dm_business");
      }
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const isBusiness = user?.role === "BUSINESS";
  const isCustomer = user?.role === "CUSTOMER";

  return (
    <AuthContext.Provider
      value={{ user, business, token, loading, login, logout, refresh, isAdmin, isBusiness, isCustomer }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
