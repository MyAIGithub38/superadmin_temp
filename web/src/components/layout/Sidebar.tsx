"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = React.useMemo(() => {
    const base = [{ href: "/settings/profile", label: "Settings" }];
    if (!user) return base;
    if (user.role === "superadmin") {
      return [
        { href: "/superadmin", label: "Dashboard", exact: true },
        { href: "/superadmin/tenants", label: "Tenants" },
        { href: "/superadmin/users", label: "Admins & Users" },
        { href: "/superadmin/apps", label: "Apps" },
        { href: "/superadmin/settings", label: "System Settings" },
        ...base,
      ];
    }
    if (user.role === "admin") {
      return [
        { href: "/admin", label: "Dashboard", exact: true },
        { href: "/admin/users", label: "My Users" },
        { href: "/admin/apps", label: "Applications" },
        ...base,
      ];
    }
    return [
      { href: "/user", label: "Dashboard", exact: true },
      { href: "/user/apps", label: "Applications" },
      ...base,
    ];
  }, [user]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-pastel-panel p-4 shadow-lg transition-transform md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Sidebar"
    >
      <div className="mb-6 flex items-center gap-3">
        <Avatar src={user?.avatarUrl} alt={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`} size={48} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {user ? `${user.firstName} ${user.lastName}` : "User"}
          </p>
          <p className="truncate text-xs text-foreground/70">{user?.email ?? "email@example.com"}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = (link as any).exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm transition ${
                active ? "bg-pastel-primary/20 text-foreground" : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
              onClick={onClose}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">
        <Button variant="secondary" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;

