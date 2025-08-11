"use client";

import React, { useEffect, useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { getApps, getUsers, type UserProfile, type AppItem } from "@/lib/api";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [users, apps] = await Promise.all([
          getUsers("mine"),
          getApps("managed"),
        ]);
        const filteredUsers = users.filter(u => String(u.id) !== String(user.id));
        setUserCount(filteredUsers.length);
        setAppCount(apps.length);
        setRecentUsers(filteredUsers.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <RoleGuard allow={["admin", "superadmin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-foreground/70">Hello, {user?.firstName}. Manage your users and apps.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-pastel-primary/15 p-4">
            <h2 className="text-lg font-semibold">My Users</h2>
            {loading ? <p>Loading...</p> : <p className="text-3xl font-bold">{userCount}</p>}
          </div>
          <div className="rounded-lg bg-pastel-secondary/15 p-4">
            <h2 className="text-lg font-semibold">Applications</h2>
            {loading ? <p>Loading...</p> : <p className="text-3xl font-bold">{appCount}</p>}
          </div>
          <div className="rounded-lg bg-pastel-accent/15 p-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            {loading ? <p>Loading...</p> : (
              <ul className="space-y-2">
                {recentUsers.map(u => (
                  <li key={u.id} className="text-sm">{u.firstName} {u.lastName} joined.</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}