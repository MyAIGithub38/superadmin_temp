"use client";

import React from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import type { UserProfile } from "@/lib/api";

export default function UserCard({ user, onEdit, onDelete, onClick, variant = "default" }: {
  user: UserProfile;
  onEdit?: (user: UserProfile) => void;
  onDelete?: (user: UserProfile) => void;
  onClick?: () => void;
  variant?: "default" | "expanded";
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg p-3 shadow-sm ${onClick ? "cursor-pointer" : ""} ${variant === "expanded" ? "bg-pastel-primary/10" : "bg-pastel-panel"}`} onClick={onClick}>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.firstName} {user.lastName}</p>
          <p className="truncate text-xs text-foreground/70">{user.email}</p>
          <p className="text-xs mt-0.5">Role: <span className="font-medium">{user.role}</span></p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <Button variant="secondary" onClick={() => onEdit(user)}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" onClick={() => onDelete(user)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

