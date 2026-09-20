"use client";

/**
 * Shared rules for cards whose whole surface toggles an expand/collapse.
 *
 * The real control is always a `<button>` in the card header carrying `aria-expanded` — that
 * is what gives keyboard and screen-reader users Enter/Space. The container click is a
 * convenience on top, so it must stay out of the way of anything that does its own job.
 */

/** Elements that handle their own clicks and must never toggle the card. */
const INTERACTIVE_SELECTOR = "a, button, input, select, textarea, label, [role='button'], [role='link']";

/** True when the click originated inside something interactive (including the header button,
 *  which toggles via its own handler and must not be toggled twice). */
export function isInteractiveClick(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;
}

/** True while the user has text selected, so drag-selecting a description doesn't collapse
 *  the card the moment the mouse is released. */
export function hasTextSelection(): boolean {
  return (window.getSelection()?.toString() ?? "").trim().length > 0;
}

/** Combined guard: should a click on the card body be ignored? */
export function shouldIgnoreCardClick(target: EventTarget | null): boolean {
  return isInteractiveClick(target) || hasTextSelection();
}
