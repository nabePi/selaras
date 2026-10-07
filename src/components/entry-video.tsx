import { Icon } from "./icon";

type Props = {
  src: string;
  poster?: string;
  title: string;
  compact?: boolean;
};

export function EntryVideo({ src, poster, title, compact = false }: Props) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-inverse-surface shadow-inner">
      <video
        src={src}
        poster={poster || undefined}
        controls
        playsInline
        preload="metadata"
        aria-label={title}
        className={
          compact
            ? "h-48 w-full object-cover"
            : "max-h-[30rem] w-full object-contain"
        }
      />
      <span className="t-label-sm pointer-events-none absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-inverse-surface/75 px-2 py-1 text-inverse-on-surface backdrop-blur-sm">
        <Icon name="videocam" size={14} />
        {title}
      </span>
    </div>
  );
}
