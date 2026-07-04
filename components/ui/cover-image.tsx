import Image from "next/image";
import type { MappedImage } from "@/content/home";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

type Variant = "project" | "tour" | "article";

interface CoverImageProps {
  image: MappedImage | null;
  variant: Variant;
  /** Fallback label / alt text (e.g. `${title} cover`). */
  label: string;
  className?: string;
  /** next/image sizes hint. */
  sizes?: string;
  priority?: boolean;
}

/** Renders a Strapi cover via next/image (custom loader), or the gradient
 *  MediaPlaceholder when no image exists — the live case for most content today. */
export function CoverImage({ image, variant, label, className, sizes, priority }: CoverImageProps) {
  if (!image) {
    return <MediaPlaceholder variant={variant} label={label} className={className} />;
  }
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden", borderRadius: 15 }}>
      <Image
        src={image.url}
        alt={image.alt || label}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 800px"}
        priority={priority}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
