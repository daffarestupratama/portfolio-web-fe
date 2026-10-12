"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { prefersReducedMotion } from "@/lib/scroll";

/** 2a shows the button once the reader is this far down the page. */
const SHOW_AFTER = 700;

/**
 * Portfolio 2a's "back to top" button on long articles: a raised accent circle, bottom right,
 * after 700px of scroll. Portalled to <body>: page content sits in a z-3 stacking context, so a
 * fixed button inside it could never paint above the footer.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  if (!visible) return null;

  return createPortal(
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}
      aria-label="Back to top"
      title="Back to top"
      className="to-top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>,
    document.body,
  );
}
