"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api, { getCsrfCookie } from "./api";
import { User } from "./types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "customer" | "seller";
    plan?: "starter" | "managed" | "premium";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // /session answers 200 for logged-out visitors too (user: null), so no
      // error is logged in the console on every page view
      const { data } = await api.get("/session");
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    await getCsrfCookie();
    await api.post("/login", { email, password });
    await fetchUser();
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "customer" | "seller";
    plan?: "starter" | "managed" | "premium";
  }) => {
    await getCsrfCookie();
    await api.post("/register", data);
    await fetchUser();
  };

  const logout = async () => {
    await api.post("/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}