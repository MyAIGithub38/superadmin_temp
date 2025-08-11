"use client";

import React from "react";
import type { AppItem } from "@/lib/api";

export default function AppList({ apps }: { apps: AppItem[] }) {
  if (!apps.length) {
    return <div className="rounded-lg bg-pastel-panel p-4 text-sm text-foreground/70">No apps yet.</div>;
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <li key={app.id} className="rounded-lg bg-pastel-panel p-4 shadow-sm">
          <h3 className="font-medium">{app.name}</h3>
          {app.description && (
            <p className="mt-1 text-sm text-foreground/70">{app.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

