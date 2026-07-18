"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode } from "react";

type StrapiImageProps = ImageProps & { fallback: ReactNode };

/** next/image wrapper that swaps to `fallback` when the source fails to load
 *  (origin down / 404 / network) — not just when the src is absent. Shared by
 *  CoverImage and the Gallery so a broken Strapi URL degrades gracefully instead
 *  of showing the browser's broken-image icon. */
export function StrapiImage({ fallback, alt, onError, ...props }: StrapiImageProps) {
  const [errored, setErrored] = useState(false);
  if (errored) return <>{fallback}</>;
  return (
    <Image
      {...props}
      alt={alt}
      onError={(e) => {
        setErrored(true);
        onError?.(e);
      }}
    />
  );
}
