"use client";

import React, { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { updateProfile, uploadAvatar } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  vcb: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const defaultValues = useMemo(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    vcb: user?.vcb ?? "",
  }), [user]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    values: defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateProfile(values);
      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }
      await refreshUser();
      setMessage("Profile updated");
      setAvatarFile(null);
      reset(values);
    } catch (e: any) {
      setMessage(e?.message ?? "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const previewUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : user?.avatarUrl ?? null), [avatarFile, user?.avatarUrl]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      {message && (
        <div role="status" className="rounded-md bg-pastel-secondary/20 p-3 text-sm">{message}</div>
      )}
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center gap-3 rounded-lg bg-pastel-panel p-4">
          <Avatar src={previewUrl ?? undefined} alt="Avatar" size={96} />
          <label htmlFor="avatar-upload" className="w-full cursor-pointer">
            <span className="sr-only">Upload avatar</span>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setAvatarFile(file);
              }}
            />
            <div className="w-full rounded-md bg-pastel-secondary p-2 text-center text-sm text-white">Choose avatar</div>
          </label>
        </div>
        <div className="rounded-lg bg-pastel-panel p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="First name" {...register("firstName")} error={errors.firstName?.message} />
              <Input label="Last name" {...register("lastName")} error={errors.lastName?.message} />
            </div>
            <Input type="email" label="Email" {...register("email")} error={errors.email?.message} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
              <Input label="Address" {...register("address")} error={errors.address?.message} />
            </div>
            <Input label="VCB" {...register("vcb")} error={errors.vcb?.message} />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSaving}>Save changes</Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

