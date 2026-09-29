type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  eyebrowClassName?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  eyebrowClassName = "text-primary",
  align = "left",
}: Props) {
  return (
    <div
      className={`flex flex-col ${
        align === "center" ? "items-center text-center" : "px-1"
      }`}
    >
      {eyebrow && (
        <span
          className={`t-label-sm tracking-wider uppercase ${eyebrowClassName}`}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="t-headline-sm text-on-surface">{title}</h2>
      {description && (
        <p className="t-body-sm text-text-muted">{description}</p>
      )}
    </div>
  );
}
