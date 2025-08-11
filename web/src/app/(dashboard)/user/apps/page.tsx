"use client";

import React, { useEffect, useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import AppList from "@/components/lists/AppList";
import { getApps, type AppItem } from "@/lib/api";

export default function UserAppsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getApps("mine");
        setApps(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <RoleGuard allow={["user", "admin", "superadmin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">My Applications</h1>
        {loading ? <div>Loading…</div> : <AppList apps={apps} />}
      </div>
    </RoleGuard>
  );
}

