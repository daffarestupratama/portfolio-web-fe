import type { MappedImage } from "@/content/home";
import { StrapiImage } from "@/components/ui/strapi-image";

interface DeviceShowcaseProps {
  desktop: MappedImage | null;
  laptop: MappedImage | null;
  mobile: MappedImage | null;
}

/** A screen: the upload is cropped to the device's own aspect (cover, top centre), over the
 *  terminal colour, which is also what shows when the image URL fails to load. */
function Screen({ image, sizes }: { image: MappedImage; sizes: string }) {
  return (
    <div className="dv-screen">
      <StrapiImage
        src={image.url}
        alt={image.alt || ""}
        fill
        sizes={sizes}
        style={{ objectFit: "cover", objectPosition: "top center" }}
        fallback={null}
      />
    </div>
  );
}

/**
 * Portfolio 2a's device stage for /services: a monitor, a laptop and a phone in neumorphic
 * frames. 2a's three stages: all three devices from 1000px, laptop and phone from 720px, the
 * phone alone below that.
 *
 * Degrades gracefully: each device renders only when its field is set, the stage collapses at
 * any width where none of the devices it would show exists (data attributes + CSS), and with
 * all three empty the whole visual is omitted.
 */
export function DeviceShowcase({ desktop, laptop, mobile }: DeviceShowcaseProps) {
  if (!desktop && !laptop && !mobile) return null;

  return (
    <div
      className="dv-stage"
      aria-hidden="true"
      data-mon={desktop ? "" : undefined}
      data-lap={laptop ? "" : undefined}
      data-ph={mobile ? "" : undefined}
    >
      {desktop && (
        <div className="dv-mon">
          <div className="dv-mon-frame">
            <div className="dv-mon-well">
              <Screen image={desktop} sizes="400px" />
            </div>
          </div>
          <div className="dv-mon-neck" />
          <div className="dv-mon-foot" />
        </div>
      )}

      {laptop && (
        <div className="dv-lap">
          <div className="dv-lap-frame">
            <div className="dv-lap-well">
              <Screen image={laptop} sizes="(max-width: 999px) 380px, 280px" />
            </div>
          </div>
          <div className="dv-lap-base">
            <span />
          </div>
        </div>
      )}

      {mobile && (
        <div className="dv-ph">
          <div className="dv-ph-frame">
            <div className="dv-ph-well">
              <Screen image={mobile} sizes="150px" />
            </div>
            <span className="dv-ph-notch" />
          </div>
        </div>
      )}
    </div>
  );
}
