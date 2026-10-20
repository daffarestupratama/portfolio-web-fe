/**
 * Zero-height marker rendered as the first element of every page and loading skeleton.
 *
 * On a client navigation the App Router keeps the scroll position when the new page's first
 * element is already in the viewport, and scrolls to the top otherwise. Pages start below the
 * sticky nav, so on a page only slightly taller than the window (/mkdir, or /projects on a
 * laptop) the browser first clamps the old scroll position to the short page's maximum, the
 * page's top edge is then still "in the viewport" (hidden behind the nav), and the router leaves
 * the page scrolled down. This marker sits at the true top of the document (globals.css
 * `.page-top`), so the router's check is made against the real top: any leftover scroll puts it
 * above the viewport and the router scrolls to the top as it does everywhere else.
 *
 * It has no height and is hidden from assistive technology; the page's own first element is
 * unchanged.
 */
export function PageTop() {
  return <div aria-hidden="true" className="page-top" />;
}
