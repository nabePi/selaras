"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { fieldClass, FieldLabel } from "../dialog";
import { btnPrimary } from "./page-header";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Isi email dan password.");
    setSubmitting(true);
    const result = await api("/api/auth/login", "POST", { email, password });
    if (!result.ok) {
      setSubmitting(false);
      return setError(result.error);
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <FieldLabel htmlFor="admin-email">Email</FieldLabel>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className={fieldClass}
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor="admin-password">Password</FieldLabel>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className={fieldClass}
        />
      </div>
      {error && (
        <p role="alert" className="t-body-sm text-error">
          {error}
        </p>
      )}
      <button type="submit" disabled={submitting} className={`${btnPrimary} w-full justify-center`}>
        {submitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
