"use client";

import React from "react";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  fallback?: string;
  className?: string;
}

export function Avatar({ src, alt = "", size = 40, fallback, className = "" }: AvatarProps) {
  const dimension = { width: size, height: size };
  const initials = React.useMemo(() => {
    if (fallback) return fallback;
    return "";
  }, [fallback]);

  return (
    <div
      className={`grid place-items-center overflow-hidden rounded-full bg-pastel-secondary text-foreground/80 ${className}`}
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} {...dimension} className="object-cover" />
      ) : (
        <span className="text-xs font-medium">{initials}</span>
      )}
    </div>
  );
}

export default Avatar;

