"use client";

import { createPortal } from "react-dom";
import { useCallback, useRef, useState } from "react";
import type { GalleryImage } from "@/content/home";
import { StrapiImage } from "@/components/ui/strapi-image";
import { useLightbox } from "@/components/ui/use-lightbox";

const imgFallback = <span className="absolute inset-0" style={{ background: "var(--glass-bg-2)" }} aria-hidden="true" />;

interface GalleryProps {
  images: GalleryImage[];
}

/** Reusable image carousel + accessible lightbox. Renders nothing when empty.
 *  Used by expandable experience items and the project/tour detail pages. */
export function Gallery({ images }: GalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnIndexRef = useRef<number>(0);

  const close = useCallback(() => {
    const idx = returnIndexRef.current;
    setOpenIndex(null);
    // Return focus to the thumbnail that opened the lightbox.
    requestAnimationFrame(() => triggerRefs.current[idx]?.focus());
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      setOpenIndex((i) => {
        if (i === null) return i;
        const next = (i + dir + images.length) % images.length;
        returnIndexRef.current = next;
        return next;
      });
    },
    [images.length],
  );

  // Escape, focus trap, scroll lock and focus-on-open come from the shared hook; only the
  // arrow navigation is specific to this carousel.
  const onArrowKeys = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    },
    [go],
  );

  useLightbox({ open: openIndex !== null, onClose: close, dialogRef, onKeyDown: onArrowKeys });

  if (images.length === 0) return null;

  const openAt = (i: number) => {
    returnIndexRef.current = i;
    setOpenIndex(i);
  };

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <ul className="mt-3 flex snap-x gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
        {images.map((img, i) => (
          <li key={`${img.url}-${i}`} className="snap-start">
            <button
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              type="button"
              onClick={() => openAt(i)}
              aria-label={`Open image${img.alt ? `: ${img.alt}` : ` ${i + 1}`}`}
              className="glass-icon-btn relative block h-20 w-28 overflow-hidden p-0"
              style={{ borderRadius: 12 }}
            >
              <StrapiImage
                src={img.url}
                alt={img.alt}
                fill
                sizes="112px"
                style={{ objectFit: "cover" }}
                fallback={imgFallback}
              />
            </button>
          </li>
        ))}
      </ul>

      {current &&
        openIndex !== null &&
        createPortal(
          // 2a's lightbox: a dark scrim, the image contained in a 1100 x 74vh box, and one
          // neumorphic control pill below it. A click anywhere outside the pill and caption
          // closes, as in 2a.
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={current.alt || "Image viewer"}
            tabIndex={-1}
            className="nm-root fixed inset-0 z-[200] flex flex-col items-center justify-center outline-none"
            style={{ gap: 14, padding: "clamp(16px,4vw,48px)", background: "rgba(12,15,21,.86)" }}
            onClick={close}
          >
            <div className="relative overflow-hidden" style={{ width: "min(1100px,100%)", height: "min(74vh,760px)", borderRadius: 16 }}>
              <StrapiImage
                key={current.url}
                src={current.url}
                alt={current.alt}
                fill
                sizes="(max-width: 1100px) 100vw, 1100px"
                style={{ objectFit: "contain" }}
                fallback={
                  <div className="mono flex h-full w-full items-center justify-center text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                    Image unavailable
                  </div>
                }
              />
            </div>

            <div
              className="mono flex items-center overflow-hidden"
              style={{
                gap: 12,
                padding: 8,
                borderRadius: 999,
                color: "var(--ink-dim)",
                background: "var(--bg)",
                boxShadow: "0 14px 34px rgba(0,0,0,.35), var(--rim)",
                fontSize: 12.5,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {images.length > 1 && (
                <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="lb-btn lb-step">
                  ←
                </button>
              )}
              <span style={{ minWidth: 52, textAlign: "center" }}>
                {openIndex + 1} / {images.length}
              </span>
              {images.length > 1 && (
                <button type="button" onClick={() => go(1)} aria-label="Next image" className="lb-btn lb-step">
                  →
                </button>
              )}
              <button type="button" onClick={close} aria-label="Close image viewer" className="lb-btn lb-close">
                Close
              </button>
            </div>

            {(current.caption || current.alt) && (
              <p
                className="text-center"
                style={{ maxWidth: "70ch", fontSize: 14, lineHeight: 1.55, color: "#C9D0DB", textWrap: "pretty" }}
                onClick={(e) => e.stopPropagation()}
              >
                {current.caption || current.alt}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
