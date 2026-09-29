type Props = {
  /** Isi pill kecil di atas judul */
  pill: React.ReactNode;
  /** Teks abu-abu di kanan pill */
  meta?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  pulse?: boolean;
};

export function PageHeader({ pill, meta, title, description, actions, pulse = true }: Props) {
  return (
    <header className="flex flex-col justify-between gap-6 pb-2 xl:flex-row xl:items-end">
      <div className="max-w-3xl space-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
            <span className={`size-1.5 rounded-full bg-primary ${pulse ? "animate-pulse" : ""}`} />
            {pill}
          </span>
          {meta && (
            <>
              <span className="t-body-sm text-text-muted" aria-hidden="true">
                •
              </span>
              <span className="t-body-sm text-text-muted">{meta}</span>
            </>
          )}
        </div>
        <h1 className="t-headline-lg tracking-tight text-on-surface">{title}</h1>
        <p className="t-body-md leading-relaxed text-text-muted">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export const btnSoft =
  "t-title-sm flex items-center gap-2 rounded-full bg-canvas-cream px-4 py-2.5 text-on-surface shadow-sm transition-all duration-200 hover:bg-surface-container-low disabled:opacity-60";
export const btnPrimary =
  "t-title-sm flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-on-primary shadow-md transition-all duration-200 hover:bg-primary-container active:scale-95 disabled:opacity-70";
