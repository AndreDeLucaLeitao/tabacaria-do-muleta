"use client";
import { useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: "current-password" | "new-password";
};

export function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete = "current-password",
}: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="!pr-14"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        className="absolute inset-y-0 right-2 my-auto h-fit rounded-md px-2 py-1 text-xs font-semibold text-cream-300 transition hover:text-gold-500"
      >
        {show ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
