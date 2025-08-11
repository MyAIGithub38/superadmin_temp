"use client";

import React from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";

export default function UserDashboardPage() {
  const { user } = useAuth();
  return (
    <RoleGuard allow={["user", "admin", "superadmin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">My Dashboard</h1>
        <p className="text-foreground/70">Welcome, {user?.firstName}. Here is your personal overview.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-pastel-primary/15 p-4">Profile completeness</div>
          <div className="rounded-lg bg-pastel-secondary/15 p-4">Apps used</div>
          <div className="rounded-lg bg-pastel-accent/15 p-4">Recent activity</div>
        </div>
      </div>
    </RoleGuard>
  );
}

