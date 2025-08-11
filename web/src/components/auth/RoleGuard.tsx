"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/api";

interface RoleGuardProps {
  allow: UserRole | UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function RoleGuard({ allow, fallback = null, children }: RoleGuardProps) {
  const { hasRole, isLoading } = useAuth();
  if (isLoading) return <div className="p-4">Loading…</div>;
  return hasRole(allow) ? <>{children}</> : <>{fallback}</>;
}

