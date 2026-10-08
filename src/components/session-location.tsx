import { Icon } from "./icon";

/** Lokasi sesi offline/hybrid beserta tombol buka Google Maps (bila tautannya diisi). */
export function SessionLocation({ name, mapsUrl }: { name: string; mapsUrl: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface px-3 py-2.5">
      <div className="flex items-start gap-2">
        <Icon name="location_on" size={18} className="mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="t-label-sm text-text-muted">Lokasi acara</p>
          <p className="t-title-sm text-on-surface">{name}</p>
        </div>
      </div>
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="t-title-sm flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-high px-5 py-3 text-on-surface transition-colors hover:bg-surface-container-highest"
        >
          <Icon name="map" size={18} />
          Buka di Google Maps
        </a>
      )}
    </div>
  );
}
