"use client";

import axios, { AxiosError, AxiosInstance } from "axios";

export interface ApiErrorShape {
  message: string;
  statusCode?: number;
  details?: unknown;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export type UserRole = "superadmin" | "admin" | "user";

export interface Permission {
  key: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  tenantId?: string | number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  vcb?: string;
  permissions?: Permission[];
  createdByAdminId?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  vcb?: string;
  // Avatar will be uploaded via separate call or multipart
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

// Moved these to the top level
let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

const createApiClient = (getToken: () => string | null): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
  });

  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as any;
      const status = error?.response?.status;
      if (status === 401 && !originalRequest?._retry) {
        if (isRefreshing) {
          // queue retry until refresh completes
          await new Promise<void>((resolve) => refreshQueue.push(resolve));
          originalRequest._retry = true;
          return instance(originalRequest);
        }
        originalRequest._retry = true;
        try {
          isRefreshing = true;
          const refreshed = await refreshToken();
          tokenStorage.set(refreshed.token);
          // flush queue
          refreshQueue.forEach((fn) => fn());
          refreshQueue = [];
          return instance(originalRequest);
        } catch (e) {
          tokenStorage.clear();
          refreshTokenStorage.clear();
          if (logoutCallback) {
            logoutCallback(); // Call the logout function provided by AuthContext
          }
          throw e;
        } finally {
          isRefreshing = false;
        }
      }
      throw error;
    }
  );

  return instance;
};

const tokenStorageKey = "auth_token";
const refreshTokenStorageKey = "refresh_token";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(tokenStorageKey);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(tokenStorageKey, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(tokenStorageKey);
  },
};

export const refreshTokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(refreshTokenStorageKey);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(refreshTokenStorageKey, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(refreshTokenStorageKey);
  },
};

export const api = createApiClient(() => tokenStorage.get());

export async function login(payload: LoginPayload): Promise<{ token: string; refreshToken?: string }> {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function register(
  payload: RegisterPayload
): Promise<{ token: string; refreshToken?: string } | { success: boolean }> {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/register`, payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getCurrentUser(): Promise<UserProfile> {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  try {
    const { data } = await api.put("/users/me", payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function refreshToken(): Promise<{ token: string }> {
  try {
    const refresh = refreshTokenStorage.get();
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: refresh });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

// Users management
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  address?: string;
  tenantId?: string | number;
}

export async function getUsers(scope: "all" | "mine" = "all"): Promise<UserProfile[]> {
  try {
    const { data } = await api.get(`/users`, { params: { scope } });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createUser(payload: CreateUserPayload): Promise<UserProfile> {
  try {
    const { data } = await api.post(`/users`, payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<UserProfile> {
  try {
    const { data } = await api.put(`/users/${userId}`, payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean }> {
  try {
    const { data } = await api.delete(`/users/${userId}`);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

// Apps
export interface AppItem {
  id: string;
  name: string;
  description?: string;
  tenantId?: string | number;
}

export async function getApps(scope: "mine" | "managed" | "all" = "mine"): Promise<AppItem[]> {
  try {
    const { data } = await api.get(`/apps`, { params: { scope } });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createApp(payload: { name: string; description?: string; tenantId?: string | number }): Promise<AppItem> {
  try {
    const { data } = await api.post(`/apps`, payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateApp(appId: string, payload: { name?: string; description?: string }): Promise<AppItem> {
  try {
    const { data } = await api.put(`/apps/${appId}`, payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteApp(appId: string): Promise<{ success: boolean }> {
  try {
    const { data } = await api.delete(`/apps/${appId}`);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function assignAppToUserByEmail(appId: string, email: string): Promise<{ success: boolean }> {
  try {
    const { data } = await api.post(`/apps/${appId}/assign`, { email });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

// Tenants (Admins as tenants)
export interface Tenant {
  id: string | number;
  name: string;
  createdAt?: string;
}

export async function getTenants(): Promise<Tenant[]> {
  try {
    const { data } = await api.get(`/tenants`);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createTenant(payload: { name: string }): Promise<Tenant> {
  try {
    const { data } = await api.post(`/tenants`, payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function updateTenant(id: string | number, payload: { name: string }): Promise<Tenant> {
  try {
    const { data } = await api.put(`/tenants/${id}`, payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function deleteTenant(id: string | number): Promise<{ success: boolean }> {
  try {
    const { data } = await api.delete(`/tenants/${id}`);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export function normalizeError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>;
    const statusCode = err.response?.status;
    const message =
      (err.response?.data as any)?.message || err.message || "Unknown error";
    return { message, statusCode, details: err.response?.data };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "Unknown error" };
}