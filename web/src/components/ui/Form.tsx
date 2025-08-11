"use client";

import React from "react";

export function Form({ children, onSubmit, className = "" }: {
  children: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  className?: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`flex flex-col gap-4 ${className}`}
      noValidate
    >
      {children}
    </form>
  );
}

export default Form;

