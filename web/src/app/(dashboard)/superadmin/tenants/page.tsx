"use client";

import React, { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { createTenant, deleteTenant, getTenants, updateTenant, type Tenant } from "@/lib/api";

export default function SuperadminTenantsPage() {
  const [list, setList] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [name, setName] = useState("");

  const title = useMemo(() => (editing ? "Edit tenant" : "Add tenant"), [editing]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTenants();
      setList(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editing) await updateTenant(editing.id, { name });
    else await createTenant({ name });
    setModalOpen(false);
    setEditing(null);
    setName("");
    await load();
  };

  return (
    <RoleGuard allow={["superadmin"]}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Tenants</h1>
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>Add tenant</Button>
        </div>
        {error && <div className="rounded-md bg-pastel-danger/10 p-3 text-sm text-pastel-danger">{error}</div>}
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => (
              <div key={t.id} className="rounded-lg bg-pastel-panel p-4 shadow-sm">
                <h3 className="font-medium">{t.name}</h3>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" onClick={() => { setEditing(t); setName(t.name); setModalOpen(true); }}>Edit</Button>
                  <Button variant="danger" onClick={async () => { if (confirm(`Delete ${t.name}?`)) { await deleteTenant(t.id); await load(); } }}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={title}>
          <Form onSubmit={onSubmit}>
            <Input label="Tenant name" value={name} onChange={(e) => setName(e.target.value)} />
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

