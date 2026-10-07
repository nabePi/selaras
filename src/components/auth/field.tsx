import { Icon } from "../icon";

type FieldProps = {
  id: string;
  label: string;
  /** Teks kecil di kanan label */
  hint?: React.ReactNode;
  icon?: string;
  /** Ikon kustom (mis. logo merek) di kiri input; menggantikan `icon` */
  leading?: React.ReactNode;
  /** Konten di kiri input (mis. awalan +62); menggantikan ikon */
  prefix?: React.ReactNode;
  trailing?: React.ReactNode;
  error?: string;
  help?: React.ReactNode;
  helpIcon?: string;
} & Omit<React.ComponentProps<"input">, "id" | "prefix">;

export function Field({
  id,
  label,
  hint,
  icon,
  leading,
  prefix,
  trailing,
  error,
  help,
  helpIcon,
  className = "",
  ...input
}: FieldProps) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="t-title-sm flex items-center justify-between text-on-surface">
        <span>{label}</span>
        {hint}
      </label>

      <div className="relative flex items-center">
        {prefix ? (
          <div className="pointer-events-none absolute left-3.5 flex items-center border-r border-canvas-sand pr-2.5 text-text-muted">
            {prefix}
          </div>
        ) : leading ? (
          <span className="pointer-events-none absolute left-3.5 flex items-center text-text-muted">{leading}</span>
        ) : (
          icon && (
            <Icon
              name={icon}
              size={20}
              className="pointer-events-none absolute left-3.5 text-text-muted"
            />
          )
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`t-body-lg w-full rounded-2xl bg-canvas-ivory py-3.5 pr-4 text-on-surface shadow-inner transition-all outline-none placeholder:text-text-muted/60 focus:bg-canvas-cream focus-visible:ring-2 focus-visible:ring-sage-medium ${
            prefix ? "pl-20" : "pl-11"
          } ${trailing ? "pr-12" : ""} ${error ? "ring-2 ring-error/60" : ""} ${className}`}
          {...input}
        />
        {trailing}
      </div>

      {error && (
        <p id={errorId} role="alert" className="t-body-sm flex items-center gap-1 pl-1 text-error">
          <Icon name="error" size={14} />
          {error}
        </p>
      )}
      {help && (
        <p id={helpId} className="t-body-sm flex items-center gap-1 pl-1 text-text-muted">
          {helpIcon && <Icon name={helpIcon} size={14} className="shrink-0 text-sage-medium" />}
          <span>{help}</span>
        </p>
      )}
    </div>
  );
}
