"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    // Call your backend reset password endpoint here
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {}
    setStatus("If an account exists for that email, you&apos;ll receive a reset link.");
  };

  return (
    <div className="mx-auto grid min-h-[80vh] w-full max-w-md place-items-center p-6">
      <div className="w-full rounded-xl bg-pastel-panel p-6 shadow">
        <h1 className="mb-2 text-2xl font-semibold">Forgot password</h1>
        <p className="mb-6 text-sm text-foreground/70">We&apos;ll send you a reset link</p>
        {status && (
          <div role="status" className="mb-4 rounded-md bg-pastel-secondary/20 p-3 text-sm text-foreground">
            {status}
          </div>
        )}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input type="email" label="Email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
          <Button type="submit" className="mt-2">Send reset link</Button>
        </Form>
        <div className="mt-4 text-sm">
          <Link href="/login" className="text-pastel-primary hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

