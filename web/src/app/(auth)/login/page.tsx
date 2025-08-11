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
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await login(values);
  };

  return (
    <div className="mx-auto grid min-h-[80vh] w-full max-w-md place-items-center p-6">
      <div className="w-full rounded-xl bg-pastel-panel p-6 shadow">
        <h1 className="mb-2 text-2xl font-semibold">Welcome back</h1>
        <p className="mb-6 text-sm text-foreground/70">Login to your account</p>
        {error && (
          <div role="alert" className="mb-4 rounded-md bg-pastel-danger/10 p-3 text-sm text-pastel-danger">
            {error}
          </div>
        )}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input type="email" label="Email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
          <Input type="password" label="Password" placeholder="Your password" {...register("password")} error={errors.password?.message} />
          <Button type="submit" isLoading={isLoading} className="mt-2">Sign in</Button>
        </Form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/register" className="text-pastel-primary hover:underline">Create account</Link>
          <Link href="/forgot-password" className="text-pastel-primary hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}

