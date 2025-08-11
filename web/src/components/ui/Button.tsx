"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-pastel-primary text-foreground hover:bg-pastel-primary-hover focus-visible:ring-pastel-primary",
  secondary:
    "bg-pastel-secondary text-foreground hover:bg-pastel-secondary-hover focus-visible:ring-pastel-secondary",
  ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/10",
  danger:
    "bg-pastel-danger text-white hover:bg-pastel-danger-hover focus-visible:ring-pastel-danger",
};

export function Button({ variant = "primary", isLoading, children, className = "", ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} aria-busy={isLoading} {...props}>
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/50 border-t-transparent" />
          <span>Loading…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;

