"use client";

import React, { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { createApp, deleteApp, getApps, updateApp, type AppItem } from "@/lib/api";

export default function SuperadminAppsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppItem | null>(null);
  const [form, setForm] = useState<{ name: string; description?: string }>({ name: "", description: "" });

  const title = useMemo(() => (editing ? "Edit app" : "Add app"), [editing]);

  const load = async () => {
    setLoading(true);
    const list = await getApps("all");
    setApps(list);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editing) await updateApp(String(editing.id), form);
    else await createApp(form);
    setModalOpen(false);
    setEditing(null);
    setForm({ name: "", description: "" });
    await load();
  };

  return (
    <RoleGuard allow={["superadmin"]}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Apps</h1>
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>Add app</Button>
        </div>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <div key={app.id} className="rounded-lg bg-pastel-panel p-4 shadow-sm">
                <h3 className="font-medium">{app.name}</h3>
                {app.description && <p className="mt-1 text-sm text-foreground/70">{app.description}</p>}
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" onClick={() => { setEditing(app); setForm({ name: app.name, description: app.description }); setModalOpen(true); }}>Edit</Button>
                  <Button variant="danger" onClick={async () => { if (confirm(`Delete ${app.name}?`)) { await deleteApp(String(app.id)); await load(); } }}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={title}>
          <Form onSubmit={onSubmit}>
            <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </Form>
        </Modal>
      </div>
    </RoleGuard>
  );
}

