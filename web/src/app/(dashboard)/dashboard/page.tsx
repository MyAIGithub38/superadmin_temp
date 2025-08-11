"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === "superadmin") router.replace("/superadmin");
    else if (user.role === "admin") router.replace("/admin");
    else router.replace("/user");
  }, [user, router]);

  return <div />;
}

