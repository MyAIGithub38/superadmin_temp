"use client";

import React, { useEffect, useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { getApps, getUsers, type AppItem } from "@/lib/api";

export default function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const [adminCount, setAdminCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, apps] = await Promise.all([
          getUsers("all"),
          getApps("all"),
        ]);
        setAdminCount(users.filter(u => u.role === 'admin').length);
        setUserCount(users.filter(u => u.role === 'user').length);
        setAppCount(apps.length);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <RoleGuard allow={["superadmin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Superadmin Dashboard</h1>
        <p className="text-foreground/70">Welcome, {user?.firstName}. View system-wide insights.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-pastel-primary/15 p-4">
            <h2 className="text-lg font-semibold">Total Admins</h2>
            {loading ? <p>Loading...</p> : <p className="text-3xl font-bold">{adminCount}</p>}
          </div>
          <div className="rounded-lg bg-pastel-secondary/15 p-4">
            <h2 className="text-lg font-semibold">Total Users</h2>
            {loading ? <p>Loading...</p> : <p className="text-3xl font-bold">{userCount}</p>}
          </div>
          <div className="rounded-lg bg-pastel-accent/15 p-4">
            <h2 className="text-lg font-semibold">Applications</h2>
            {loading ? <p>Loading...</p> : <p className="text-3xl font-bold">{appCount}</p>}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}