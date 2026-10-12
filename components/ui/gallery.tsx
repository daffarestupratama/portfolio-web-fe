"use client";

import { createPortal } from "react-dom";
import { useCallback, useRef, useState } from "react";
import type { GalleryImage } from "@/content/home";
import { StrapiImage } from "@/components/ui/strapi-image";
import { useLightbox } from "@/components/ui/use-lightbox";

const imgFallback = <span className="absolute inset-0" style={{ background: "color-mix(in srgb, var(--accent) 14%, var(--bg))" }} aria-hidden="true" />;

interface GalleryProps {
  images: GalleryImage[];
  /** `grid`: 2a's experience gallery, 4:3 inset tiles. `masonry`: 2a's project gallery, a
   *  16:9 lead image over a numbered, captioned masonry. */
  variant: "grid" | "masonry";
}

/** 2a shows this many masonry images (after the lead) before "Show all". */
const MASONRY_MAX = 8;
const pad2 = (n: number) => String(n).padStart(2, "0");

/** Reusable image carousel + accessible lightbox. Renders nothing when empty.
 *  Used by expandable experience items and the project/tour detail pages. */
export function Gallery({ images, variant }: GalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
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

  const label = (img: GalleryImage, i: number) => `Open image${img.alt ? `: ${img.alt}` : ` ${i + 1}`}`;
  const rest = images.slice(1);
  const shownRest = showAll ? rest : rest.slice(0, MASONRY_MAX);

  return (
    <>
      {variant === "masonry" ? (
        <>
          <figure className="gm-lead">
            <button ref={(el) => { triggerRefs.current[0] = el; }} type="button" onClick={() => openAt(0)} aria-label={label(images[0]!, 0)} className="gm-lead-btn">
              <span className="gm-lead-img">
                <StrapiImage src={images[0]!.url} alt={images[0]!.alt} fill sizes="(max-width: 908px) 100vw, 860px" style={{ objectFit: "cover" }} fallback={imgFallback} />
              </span>
            </button>
            <figcaption className="gm-cap gm-cap-lead">
              <span className="gm-num mono">01</span>
              <span>{images[0]!.caption}</span>
            </figcaption>
          </figure>
          {shownRest.length > 0 && (
            <div className="gm-cols">
              {shownRest.map((img, j) => {
                const i = j + 1;
                return (
                  <figure key={`${img.url}-${i}`} className="gm-item">
                    <button ref={(el) => { triggerRefs.current[i] = el; }} type="button" onClick={() => openAt(i)} aria-label={label(img, i)} className="gm-btn">
                      <span className="gm-img" style={{ aspectRatio: img.width && img.height ? `${img.width}/${img.height}` : "4/3" }}>
                        <StrapiImage src={img.url} alt={img.alt} fill sizes="(max-width: 700px) 100vw, 300px" style={{ objectFit: "cover" }} fallback={imgFallback} />
                      </span>
                    </button>
                    <figcaption className="gm-cap">
                      <span className="gm-num mono">{pad2(i + 1)}</span>
                      <span className="gm-cap-text">{img.caption}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}
          {rest.length > MASONRY_MAX && (
            <div className="gm-more-wrap">
              <button type="button" onClick={() => setShowAll((v) => !v)} className="gm-more">
                {showAll ? "Show fewer" : `Show all ${images.length} images`}
              </button>
            </div>
          )}
        </>
      ) : (
        <ul className="xp-gallery">
          {images.map((img, i) => (
            <li key={`${img.url}-${i}`}>
              <button
                ref={(el) => {
                  triggerRefs.current[i] = el;
                }}
                type="button"
                onClick={() => openAt(i)}
                aria-label={`Open image${img.alt ? `: ${img.alt}` : ` ${i + 1}`}`}
                className="xp-gallery-btn"
              >
                <span className="xp-gallery-img">
                  <StrapiImage
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="160px"
                    style={{ objectFit: "cover" }}
                    fallback={null}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

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
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center outline-none"
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
