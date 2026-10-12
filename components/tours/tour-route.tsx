import type { RouteStop } from "@/content/tours";
import { CoverImage } from "@/components/ui/cover-image";
import { MapPinIcon, ExternalLinkIcon } from "@/components/ui/icons";

interface TourRouteProps {
  stops: RouteStop[];
}

/** Connected vertical list of route stops, on 2a's experience timeline (inset rail, raised
 *  node with an accent-b core, raised cards). Renders nothing when there are no stops. */
export function TourRoute({ stops }: TourRouteProps) {
  if (stops.length === 0) return null;
  return (
    <div className="rt">
      <div aria-hidden="true" className="rt-rail" />
      {stops.map((stop, i) => (
        <div key={i} className="rt-stop">
          <span aria-hidden="true" className="rt-node">
            <span />
          </span>

          <div className="rt-card">
            <div className="rt-head">
              <div className="min-w-0">
                <h3 className="rt-title">{stop.title}</h3>
                {stop.locationText && (
                  <div className="rt-loc mono">
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
                  className="nm-icon-circle rt-map"
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
                className="rt-img"
                sizes="(max-width: 768px) 100vw, 760px"
              />
            )}

            {stop.description && <p className="rt-desc">{stop.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
