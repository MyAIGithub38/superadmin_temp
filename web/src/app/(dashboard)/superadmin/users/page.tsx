"use client";

import React, { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import UserCard from "@/components/cards/UserCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { createUser, deleteUser, getUsers, updateUser, getTenants, type UserProfile, type UserRole, type Tenant, API_BASE_URL } from "@/lib/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(["superadmin", "admin", "user"] as [UserRole, UserRole, UserRole]),
  tenantId: z.string().optional(),
  assignedAdminId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type NewUserFormValues = FormValues & { password: string };

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAdmins, setExpandedAdmins] = useState<Set<string>>(new Set());

  const toggleExpand = (adminId: string) => {
    setExpandedAdmins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(adminId)) {
        newSet.delete(adminId);
      } else {
        newSet.add(adminId);
      }
      return newSet;
    });
  };
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "user" },
  });

  const title = useMemo(() => (editing ? "Edit user" : "Add user"), [editing]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, t] = await Promise.all([getUsers("all"), getTenants()]);
      const usersWithFullAvatarUrl = list.map(u => ({
        ...u,
        avatarUrl: u.avatarUrl && !u.avatarUrl.startsWith("http")
          ? `${API_BASE_URL}${u.avatarUrl}`
          : u.avatarUrl,
      }));
      setUsers(usersWithFullAvatarUrl);
      setTenants(t);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) {
        await updateUser(editing.id, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: values.role,
        });
      } else {
        await createUser(values as NewUserFormValues);
      }
      setModalOpen(false);
      setEditing(null);
      reset({ role: "user" });
      await load();
    } catch (e: unknown) {
      alert((e as Error)?.message ?? "Operation failed");
    }
  };

  const onDelete = async (user: UserProfile) => {
    if (!confirm(`Delete ${user.firstName} ${user.lastName}?`)) return;
    try {
      await deleteUser(user.id);
      await load();
    } catch (e: unknown) {
      alert((e as Error)?.message ?? "Delete failed");
    }
  };

  return (
    <RoleGuard allow={["superadmin"]}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admins & Users</h1>
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>Add user</Button>
        </div>
        {error && <div className="rounded-md bg-pastel-danger/10 p-3 text-sm text-pastel-danger">{error}</div>}
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Admins</h2>
              <div className="mt-2 grid gap-3">
                {users.filter(u => u.role === 'admin').map((admin) => (
                  <div key={admin.id}>
                    <UserCard
                      user={admin}
                      onEdit={(user) => { setEditing(user); setModalOpen(true); reset({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }); }}
                      onDelete={onDelete}
                      onClick={() => toggleExpand(admin.id)}
                      variant={expandedAdmins.has(admin.id) ? "expanded" : "default"}
                    />
                    {expandedAdmins.has(admin.id) && (
                      <div className="ml-8 mt-2 space-y-2">
                        {users.filter(u => u.createdByAdminId === admin.id).map((user) => (
                          <UserCard key={user.id} user={user} onEdit={(user) => { setEditing(user); setModalOpen(true); reset({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }); }} onDelete={onDelete} variant="expanded" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Other Users</h2>
              <div className="mt-2 grid gap-3">
                {users.filter(u => u.role === 'user' && !u.createdByAdminId).map((user) => (
                  <UserCard key={user.id} user={user} onEdit={(user) => { setEditing(user); setModalOpen(true); reset({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }); }} onDelete={onDelete} />
                ))}
              </div>
            </div>
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={title}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="First name" {...register("firstName")} error={errors.firstName?.message} />
              <Input label="Last name" {...register("lastName")} error={errors.lastName?.message} />
            </div>
            <Input type="email" label="Email" {...register("email")} error={errors.email?.message} />
            {!editing && (
              <Input type="password" label="Password" {...register("password")} error={errors.password?.message} />
            )}
            <div>
              <label className="text-sm text-foreground/80">Role</label>
              <select className="mt-1 w-full rounded-md border border-black/10 bg-background p-2 text-sm" {...register("role")}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-foreground/80">Tenant (optional)</label>
              <select className="mt-1 w-full rounded-md border border-black/10 bg-background p-2 text-sm" {...register("tenantId")}>
                <option value="">None</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-foreground/80">Assign to Admin (optional)</label>
              <select className="mt-1 w-full rounded-md border border-black/10 bg-background p-2 text-sm" {...register("assignedAdminId")}>
                <option value="">Current User</option>
                {users.filter(u => u.role === 'admin').map(admin => (
                  <option key={admin.id} value={admin.id}>{admin.firstName} {admin.lastName}</option>
                ))}
              </select>
            </div>
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

