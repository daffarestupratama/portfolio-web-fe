"use client";

import { createPortal } from "react-dom";
import { useCallback, useRef, useState } from "react";
import { useLightbox } from "@/components/ui/use-lightbox";

interface CertificateViewerProps {
  /** Absolute URL of the certificate file. */
  url: string;
  /** Used for the dialog label and the trigger's accessible name. */
  title: string;
}

/**
 * Opens a certificate on demand. The file is a PDF in practice (verified against the live
 * CMS), so this is an `<object>` rather than next/image — and nothing is downloaded until
 * the dialog mounts, which is what keeps the list page light.
 *
 * The chrome is 2a's certificate modal: a raised card with the title, an open-in-new-tab
 * pill and Close, over an inset frame. 2a frames the file with an `<iframe>`; `<object>` is
 * kept because its fallback content covers browsers with no inline PDF viewer (Mobile Safari,
 * several Android browsers), where the header link is the real way in.
 *
 * Portalled to document.body so no ancestor's transform or filter can trap the fixed overlay.
 */
export function CertificateViewer({ url, title }: CertificateViewerProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useLightbox({ open, onClose: close, dialogRef });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View certificate: ${title}`}
        className="cc-btn mono"
      >
        Certificate
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Certificate: ${title}`}
            tabIndex={-1}
            className="nm-root fixed inset-0 z-[200] flex items-center justify-center outline-none"
            style={{ padding: "clamp(12px,3vw,40px)", background: "rgba(12,15,21,.8)" }}
            onClick={close}
          >
            <div
              className="flex flex-col"
              style={{
                width: "min(980px,100%)",
                height: "min(86vh,760px)",
                padding: 12,
                borderRadius: 26,
                background: "var(--bg)",
                boxShadow: "0 20px 50px rgba(0,0,0,.4), var(--rim)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center" style={{ gap: 12, padding: "4px 6px 12px" }}>
                <span
                  className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ fontSize: 14.5, fontWeight: 600 }}
                >
                  {title}
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cv-btn"
                >
                  Open in new tab ↗
                </a>
                <button type="button" onClick={close} aria-label="Close certificate viewer" className="cv-btn">
                  Close
                </button>
              </div>

              <div className="flex-1" style={{ padding: 6, borderRadius: 18, boxShadow: "var(--in-sm)" }}>
                <object
                  data={url}
                  type="application/pdf"
                  aria-label={`Certificate: ${title}`}
                  className="block h-full w-full"
                  style={{ border: "none", borderRadius: 13, background: "#fff" }}
                >
                  {/* Fallback content, shown by browsers that can't display a PDF inline. */}
                  <p className="mono p-6 text-center text-[13px]" style={{ color: "#4C4E55" }}>
                    Your browser can&apos;t display this PDF inline. Use the link above to open it.
                  </p>
                </object>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
