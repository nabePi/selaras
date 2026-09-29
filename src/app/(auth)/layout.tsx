import { PhoneShell } from "@/components/phone-shell";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <PhoneShell>
      <main className="pb-safe flex w-full flex-1 flex-col px-margin pt-16">{children}</main>
    </PhoneShell>
  );
}
