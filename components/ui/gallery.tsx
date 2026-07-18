"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/content/home";
import { ArrowRightIcon, CloseIcon } from "@/components/ui/icons";

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

  useEffect(() => {
    if (openIndex === null) return;

    // Focus the dialog on open, lock body scroll.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogRef.current?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Tab") {
        // Focus trap within the dialog.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, go]);

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
              <Image src={img.url} alt={img.alt} fill sizes="112px" style={{ objectFit: "cover" }} />
            </button>
          </li>
        ))}
      </ul>

      {current &&
        createPortal(
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={current.alt || "Image viewer"}
            tabIndex={-1}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 outline-none"
          style={{ background: "rgba(6, 16, 20, 0.82)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close image viewer"
            className="glass-icon-btn absolute top-4 right-4 h-11 w-11"
            style={{ color: "#fff" }}
          >
            <CloseIcon />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="glass-icon-btn absolute left-3 h-11 w-11 sm:left-6"
              style={{ color: "#fff" }}
            >
              <ArrowRightIcon style={{ transform: "rotate(180deg)" }} />
            </button>
          )}

          <figure className="flex max-h-full max-w-5xl flex-col items-center gap-3">
            <Image
              src={current.url}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="(max-width: 1024px) 92vw, 1024px"
              className="h-auto w-auto rounded-xl"
              style={{ maxHeight: "78vh", maxWidth: "100%", objectFit: "contain" }}
            />
            {current.caption && (
              <figcaption className="mono max-w-[60ch] text-center text-[12.5px]" style={{ color: "rgba(255,255,255,0.82)" }}>
                {current.caption}
              </figcaption>
            )}
          </figure>

          {images.length > 1 && (
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="glass-icon-btn absolute right-3 h-11 w-11 sm:right-6"
              style={{ color: "#fff" }}
            >
              <ArrowRightIcon />
            </button>
          )}
          </div>,
          document.body,
        )}
    </>
  );
}
