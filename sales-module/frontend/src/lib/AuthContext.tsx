"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "ROLE_ADMIN" | "ROLE_SALES_MANAGER" | "ROLE_SALES_USER";
  active: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("nextgen_auth_token");
      const storedUser = localStorage.getItem("nextgen_auth_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else if (!storedToken && !pathname.startsWith("/login")) {
        // Automatically provide fallback admin demo session if no token stored yet
        const defaultAdmin: UserProfile = {
          id: "admin-uuid",
          username: "admin",
          email: "admin@nextgen.erp",
          fullName: "System Administrator",
          role: "ROLE_ADMIN",
          active: true,
        };
        setUser(defaultAdmin);
        setToken("demo-admin-token");
        localStorage.setItem("nextgen_auth_token", "demo-admin-token");
        localStorage.setItem("nextgen_auth_user", JSON.stringify(defaultAdmin));
      }
    } catch (e) {
      console.error("Failed to load stored auth credentials", e);
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("nextgen_auth_token", newToken);
    localStorage.setItem("nextgen_auth_user", JSON.stringify(newUser));
    router.push("/sales");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("nextgen_auth_token");
    localStorage.removeItem("nextgen_auth_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
