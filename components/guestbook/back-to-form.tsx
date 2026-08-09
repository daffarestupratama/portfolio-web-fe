"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { scrollToElement } from "@/lib/scroll";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * Floating "Send Message" button for narrow viewports, where the form sits at the top of
 * the page and scrolls away behind the message list. Appears only once the form card has
 * left the viewport and hides again when it returns. Hidden entirely at `lg`, where the
 * form column is sticky and always visible.
 */
export function BackToForm({ targetId }: { targetId: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      // Show only while the form is fully out of view.
      setVisible(!entries.some((e) => e.isIntersecting));
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  if (!visible) return null;

  // Portalled to <body>: <main> is `relative z-[3]`, which makes it a stacking context,
  // so a fixed button inside it can never paint above the later <footer> sibling no
  // matter how high its z-index. (Same trap the tech-tile tooltip hit.)
  return createPortal(
    <button
      type="button"
      onClick={() => scrollToElement(document.getElementById(targetId))}
      className="back-to-form btn-gradient gap-2 px-[18px] py-3 text-[13.5px] lg:hidden"
    >
      <ArrowRightIcon width={14} height={14} style={{ transform: "rotate(-90deg)" }} />
      Send Message
    </button>,
    document.body,
  );
}
