import type { RouteStop } from "@/content/tours";
import { CoverImage } from "@/components/ui/cover-image";
import { MapPinIcon, ExternalLinkIcon } from "@/components/ui/icons";

interface TourRouteProps {
  stops: RouteStop[];
}

/** Connected vertical list of route stops (marker + line, like the experience
 *  timeline). Renders nothing when there are no stops — the live case today. */
export function TourRoute({ stops }: TourRouteProps) {
  if (stops.length === 0) return null;
  return (
    <div className="relative pl-1">
      <div
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[19px] w-0.5"
        style={{ borderRadius: 2, background: "linear-gradient(var(--sky), var(--teal), var(--green))", opacity: 0.5 }}
      />
      {stops.map((stop, i) => (
        <div key={i} className="relative pb-4 pl-[54px]">
          <span
            aria-hidden="true"
            className="absolute top-[18px] left-3 z-[2] flex h-4 w-4 items-center justify-center rounded-full"
            style={{ background: "var(--surface)", border: "2px solid var(--accent)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          </span>

          <div className="glass-card p-4" style={{ borderRadius: 16 }}>
            <div className="relative z-[2] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[15.5px] font-semibold" style={{ letterSpacing: "-0.01em" }}>
                  {stop.title}
                </h3>
                {stop.locationText && (
                  <div className="mono mt-1 flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--ink-faint)" }}>
                    <MapPinIcon />
                    {stop.locationText}
                  </div>
                )}
              </div>
              {stop.mapUrl && (
                <a
                  href={stop.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${stop.title} on the map`}
                  className="glass-icon-btn h-9 w-9 shrink-0"
                  style={{ borderRadius: 10 }}
                >
                  <ExternalLinkIcon />
                </a>
              )}
            </div>

            {stop.image && (
              <CoverImage
                image={stop.image}
                variant="tour"
                label={stop.title}
                className="relative z-[2] mt-3 aspect-[16/9] w-full"
                sizes="(max-width: 768px) 100vw, 760px"
              />
            )}

            {stop.description && (
              <p className="relative z-[2] mt-2.5 text-[13.5px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
                {stop.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
