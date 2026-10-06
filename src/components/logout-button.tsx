"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { Icon } from "./icon";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await api("/api/auth/logout", "POST", { scope: "member" });
    router.replace("/masuk");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="t-title-sm mt-1 flex w-full items-center gap-2 rounded-2xl bg-surface-container-low px-4 py-3 text-error shadow-xs transition-colors hover:bg-surface-container disabled:opacity-60"
    >
      <Icon name="logout" size={20} />
      <span>{busy ? "Keluar..." : "Keluar dari Akun"}</span>
    </button>
  );
}
