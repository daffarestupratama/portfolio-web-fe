"use client";

import { createPortal } from "react-dom";
import { useCallback, useRef, useState } from "react";
import { useLightbox } from "@/components/ui/use-lightbox";
import { CloseIcon, ExternalLinkIcon, FileTextIcon } from "@/components/ui/icons";

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
 * `<object>` renders the browser's native PDF viewer on desktop. Mobile Safari and several
 * Android browsers show nothing useful there, so the "Open in new tab" link is a real
 * affordance for them, not just decoration — it is the element's fallback content AND is
 * always visible below the frame.
 *
 * Portalled to document.body: the surrounding card is a `.glass-card`, and `backdrop-filter`
 * makes it a containing block even for `position: fixed` children, so an in-card dialog
 * would be clipped at the card edge.
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
        className="glass-pill mono gap-1.5 px-3 py-1.5 text-[12px] font-medium"
      >
        <FileTextIcon width={13} height={13} />
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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 p-4 outline-none"
            style={{ background: "rgba(6, 16, 20, 0.82)", backdropFilter: "blur(6px)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close certificate viewer"
              className="glass-icon-btn absolute top-4 right-4 h-11 w-11"
              style={{ color: "#fff" }}
            >
              <CloseIcon />
            </button>

            <object
              data={url}
              type="application/pdf"
              aria-label={`Certificate: ${title}`}
              className="w-full max-w-4xl rounded-xl"
              style={{ height: "74vh", background: "rgba(255,255,255,0.06)" }}
            >
              {/* Fallback content, shown by browsers that can't display a PDF inline. */}
              <p className="mono p-6 text-center text-[13px]" style={{ color: "rgba(255,255,255,0.82)" }}>
                Your browser can&apos;t display this PDF inline. Use the link below to open it.
              </p>
            </object>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-pill lightbox-pill mono gap-2 px-4 py-2 text-[13px] font-semibold"
              style={{ color: "#fff" }}
            >
              Open in new tab
              <ExternalLinkIcon />
            </a>
          </div>,
          document.body,
        )}
    </>
  );
}
