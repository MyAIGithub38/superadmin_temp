"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/auth/RoleGuard";
import UserCard from "@/components/cards/UserCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { createUser, deleteUser, getUsers, updateUser, type UserProfile, API_BASE_URL, CreateUserPayload } from "@/lib/api"; // Added CreateUserPayload
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
});

type FormValues = z.infer<typeof schema>;

type NewUserFormValues = FormValues & { password: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const title = useMemo(() => (editing ? "Edit user" : "Add user"), [editing]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getUsers("mine");
      const usersWithFullAvatarUrl = list.map(u => ({
        ...u,
        avatarUrl: u.avatarUrl && !u.avatarUrl.startsWith("http")
          ? `${API_BASE_URL}${u.avatarUrl}`
          : u.avatarUrl,
      }));
      setUsers(usersWithFullAvatarUrl);
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
        await updateUser(editing.id, values);
      } else {
        await createUser({ ...values, role: "user" } as CreateUserPayload);
      }
      setModalOpen(false);
      setEditing(null);
      reset();
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
    <RoleGuard allow={["admin", "superadmin"]}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Users</h1>
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>Add user</Button>
        </div>
        {error && <div className="rounded-md bg-pastel-danger/10 p-3 text-sm text-pastel-danger">{error}</div>}
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="grid gap-3">
            {users.filter(u => String(u.id) !== String(user?.id)).map((u) => (
              <UserCard key={u.id} user={u} onEdit={(user) => { setEditing(user); setModalOpen(true); reset({ firstName: user.firstName, lastName: user.lastName, email: user.email }); }} onDelete={onDelete} />
            ))}
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