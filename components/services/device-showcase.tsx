import type { MappedImage } from "@/content/home";
import { StrapiImage } from "@/components/ui/strapi-image";

interface DeviceShowcaseProps {
  desktop: MappedImage | null;
  laptop: MappedImage | null;
  mobile: MappedImage | null;
}

const screenFallback = <span className="absolute inset-0" style={{ background: "var(--glass-bg-2)" }} aria-hidden="true" />;

/** A screen: the image is cropped to the device's own aspect with object-cover, so any
 *  upload ratio fits sensibly. Renders a soft empty screen when the field is unset. */
function Screen({ image, className }: { image: MappedImage | null; className?: string }) {
  return (
    <div className={`device-screen ${className ?? ""}`}>
      {image ? (
        <StrapiImage
          src={image.url}
          alt={image.alt || ""}
          fill
          sizes="(max-width: 1024px) 50vw, 520px"
          style={{ objectFit: "cover", objectPosition: "top center" }}
          fallback={screenFallback}
        />
      ) : (
        screenFallback
      )}
      <span className="device-glare" aria-hidden="true" />
    </div>
  );
}

/**
 * Device-mockup hero for /services: a monitor, laptop and phone drawn with CSS (no new
 * dependencies) in the site's glass idiom, composed as an overlapping group — monitor
 * centre-back, laptop front-left, phone front-right.
 *
 * Degrades gracefully: each device renders only when its field is set, and if all three
 * are empty the whole visual is omitted so the hero stays clean rather than showing empty
 * frames. Responsive: all three at lg+, laptop + phone at md, phone only at sm.
 */
export function DeviceShowcase({ desktop, laptop, mobile }: DeviceShowcaseProps) {
  if (!desktop && !laptop && !mobile) return null;

  return (
    <div className="device-stage" aria-hidden="true">
      {desktop && (
        <div className="device-monitor hidden lg:block">
          <div className="device-bezel">
            <Screen image={desktop} />
          </div>
          <span className="device-monitor-neck" />
          <span className="device-monitor-foot" />
        </div>
      )}

      {laptop && (
        <div className="device-laptop hidden md:block">
          <div className="device-bezel device-bezel-laptop">
            <Screen image={laptop} />
          </div>
          <span className="device-laptop-base" />
        </div>
      )}

      {mobile && (
        <div className="device-phone">
          <div className="device-bezel device-bezel-phone">
            <span className="device-notch" />
            <Screen image={mobile} className="device-screen-phone" />
          </div>
        </div>
      )}
    </div>
  );
}
