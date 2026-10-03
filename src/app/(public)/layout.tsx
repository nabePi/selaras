import { BottomNav } from "@/components/bottom-nav";
import { PhoneShell } from "@/components/phone-shell";
import { SiteHeader } from "@/components/site-header";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <PhoneShell>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col px-margin pt-16 pb-28">
        {children}
      </main>
      <BottomNav />
    </PhoneShell>
  );
}
