"use client";

import React from "react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function SystemSettingsPage() {
  return (
    <RoleGuard allow={["superadmin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">System Settings</h1>
        <div className="rounded-lg bg-pastel-panel p-4">Global configuration controls go here.</div>
      </div>
    </RoleGuard>
  );
}

