"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/api";

export default function ProtectedRoute({ allow, children }: { allow?: UserRole[]; children: React.ReactNode }) {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (allow && user && !allow.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [allow, isLoading, token, user, router]);

  if (!token) return null;
  if (allow && user && !allow.includes(user.role)) return null;
  return <>{children}</>;
}

