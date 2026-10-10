export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="pb-safe flex w-full flex-1 flex-col px-margin pt-16 print:px-0 print:pt-0">
      {children}
    </main>
  );
}
