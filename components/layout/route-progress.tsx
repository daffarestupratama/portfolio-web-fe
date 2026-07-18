"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const START_DELAY = 150;

/** Thin top progress bar for route transitions. Delay-gated so fast (prefetched
 *  SSG) navigations complete before the bar ever shows — no flash. Nav start is
 *  detected from same-origin link clicks + popstate (App Router has no router
 *  events); completion is the pathname commit. */
export function RouteProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timerRef = useRef<number | null>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    const start = () => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        if (navigatingRef.current) setState("loading");
      }, START_DELAY);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
    };
  }, []);

  // Route committed → finish (only if a navigation was in flight).
  useEffect(() => {
    if (!navigatingRef.current) return;
    navigatingRef.current = false;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setState((s) => (s === "loading" ? "done" : "idle"));
  }, [pathname]);

  useEffect(() => {
    if (state !== "done") return;
    const t = window.setTimeout(() => setState("idle"), 250);
    return () => window.clearTimeout(t);
  }, [state]);

  const visible = state !== "idle";
  const width = state === "loading" ? "90%" : state === "done" ? "100%" : "0%";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 200,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width,
          background: "linear-gradient(90deg, var(--accent), var(--accent-ink))",
          boxShadow: "0 0 8px var(--accent)",
          transition: "width 300ms ease",
        }}
      />
    </div>
  );
}
