import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getSessionUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getSessionUser("admin")) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md space-y-8 rounded-4xl bg-canvas-ivory p-8 shadow-md sm:p-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/images/logo-header.png" alt="Selaras Life" width={720} height={323} sizes="160px" className="h-14 w-auto" priority />
          <h1 className="t-headline-md text-on-surface">Masuk Admin</h1>
          <p className="t-body-md text-text-muted">Konsol internal tim pendamping Selaras Life.</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
