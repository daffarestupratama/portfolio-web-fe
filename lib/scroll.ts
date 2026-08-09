/** Shared smooth-scroll helper for in-page anchors (hash CTAs, the guestbook
 *  back-to-form button). Vertical offset for the fixed navbar comes from the target's
 *  `scroll-margin-top`, which `scrollIntoView` honours — no manual height maths. */

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Scroll an element into view and move focus to it, without navigating. Returns false
 *  when the target doesn't exist so callers can fall back to default link behaviour. */
export function scrollToElement(target: Element | null): boolean {
  if (!target) return false;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  // Keyboard users should land on the section, not stay behind at the trigger.
  if (target instanceof HTMLElement) {
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
  return true;
}

/** Scroll to `#id`, given a raw href like "#contact". */
export function scrollToHash(href: string): boolean {
  const id = href.startsWith("#") ? href.slice(1) : href;
  if (!id) return false;
  return scrollToElement(document.getElementById(id));
}
