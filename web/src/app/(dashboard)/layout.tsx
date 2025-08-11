"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { token, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center">Loading…</div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
      <div className="flex-1 md:ml-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-background/80 p-4 backdrop-blur">
          <Button variant="ghost" className="md:hidden" onClick={() => setOpen((v) => !v)}>
            Menu
          </Button>
          <div className="text-sm text-foreground/70">Modular Dashboard</div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

