"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const base =
  "w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pastel-primary";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, hint, className = "", ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const describedByIds = [hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm text-foreground/80">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`${base} ${className}`}
          aria-invalid={!!error}
          aria-describedby={describedByIds || undefined}
          {...props}
        />
        {hint && (
          <p id={`${inputId}-hint`} className="text-xs text-foreground/60">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-pastel-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

