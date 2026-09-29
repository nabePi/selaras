export function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-surface shadow-[0_8px_30px_rgb(92,75,62,0.04)]">
      {children}
    </div>
  );
}
