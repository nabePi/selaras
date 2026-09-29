"use client";

export type FilterOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
};

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  label,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-margin flex items-center gap-2 overflow-x-auto px-margin py-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`t-label-md shrink-0 rounded-full px-4 py-2 whitespace-nowrap transition-all active:scale-95 ${
              active
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
