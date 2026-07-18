"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Renders children only after `ms`, via a JS timer (reduced-motion-safe).
 *  Used by loading.tsx so instant/prefetched transitions never flash a skeleton —
 *  the boundary unmounts before the delay elapses. */
export function Delayed({ ms = 200, children }: { ms?: number; children: ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return show ? <>{children}</> : null;
}
