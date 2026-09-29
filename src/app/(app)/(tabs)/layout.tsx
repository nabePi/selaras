import { AppBottomNav } from "@/components/app-bottom-nav";
import { AppHeader } from "@/components/app-header";
import { PENDING_COUNT } from "@/data/member";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppHeader />
      <main className="flex w-full flex-1 flex-col px-margin pt-16 pb-28">
        {children}
      </main>
      <AppBottomNav pendingCount={PENDING_COUNT} />
    </>
  );
}
