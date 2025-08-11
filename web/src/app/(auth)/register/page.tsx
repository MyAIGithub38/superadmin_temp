"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email(),
  password: z.string().min(6, "At least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: doRegister, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await doRegister(values);
  };

  return (
    <div className="mx-auto grid min-h-[80vh] w-full max-w-md place-items-center p-6">
      <div className="w-full rounded-xl bg-pastel-panel p-6 shadow">
        <h1 className="mb-2 text-2xl font-semibold">Create your account</h1>
        <p className="mb-6 text-sm text-foreground/70">Start your journey</p>
        {error && (
          <div role="alert" className="mb-4 rounded-md bg-pastel-danger/10 p-3 text-sm text-pastel-danger">
            {error}
          </div>
        )}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input label="First name" {...register("firstName")} error={errors.firstName?.message} />
          <Input label="Last name" {...register("lastName")} error={errors.lastName?.message} />
          <Input type="email" label="Email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
          <Input type="password" label="Password" placeholder="Create a secure password" {...register("password")} error={errors.password?.message} />
          <Button type="submit" isLoading={isLoading} className="mt-2">Create account</Button>
        </Form>
        <div className="mt-4 text-sm">
          Already have an account? {" "}
          <Link href="/login" className="text-pastel-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

