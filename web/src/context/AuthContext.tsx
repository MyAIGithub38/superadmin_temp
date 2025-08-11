"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LoginPayload, RegisterPayload, UserProfile, UserRole, getCurrentUser, login as apiLogin, register as apiRegister, tokenStorage, refreshTokenStorage, API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  role: UserRole | null;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize from localStorage on mount
  useEffect(() => {
    const existingToken = tokenStorage.get();
    if (existingToken) {
      setToken(existingToken);
      getCurrentUser()
        .then((u) => setUser(u))
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiLogin(payload);
      tokenStorage.set(res.token);
      if (res.refreshToken) refreshTokenStorage.set(res.refreshToken);
      setToken(res.token);
      const u = await getCurrentUser();
      setUser(u);
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Failed to login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleRegister = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRegister(payload);
      if ((res as any).token) {
        tokenStorage.set((res as any).token);
        if ((res as any).refreshToken) refreshTokenStorage.set((res as any).refreshToken);
        setToken((res as any).token);
        const u = await getCurrentUser();
        setUser(u);
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to register");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    tokenStorage.clear();
    refreshTokenStorage.clear();
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.get()) return;
    setIsLoading(true);
    try {
      const u = await getCurrentUser();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const userWithFullAvatarUrl = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      avatarUrl: user.avatarUrl && !user.avatarUrl.startsWith("http")
        ? `${API_BASE_URL}${user.avatarUrl}`
        : user.avatarUrl,
    };
  }, [user]);

  const value = useMemo<AuthContextState>(() => ({
    user: userWithFullAvatarUrl,
    token,
    isLoading,
    error,
    role: user?.role ?? null,
    hasRole: (roles: UserRole | UserRole[]) => {
      const list = Array.isArray(roles) ? roles : [roles];
      return user ? list.includes(user.role) : false;
    },
    login: handleLogin,
    register: handleRegister,
    logout,
    refreshUser,
  }), [user, userWithFullAvatarUrl, token, isLoading, error, handleLogin, handleRegister, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

