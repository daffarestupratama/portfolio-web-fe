"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Portfolio 2a's surface "raise and sink" (latest export, `initNm`). Every element whose
 * box-shadow uses a design token (raised `--out*` and inset `--in*` surfaces, wells, pills, rings)
 * is held flat and invisible, then, as it enters the viewport, its shadow grows from nothing while
 * it fades in, so raised surfaces rise and inset ones sink. On a page change everything replays,
 * except the nav (`[data-nm-keep]`), which animates only on the first load.
 *
 * Adapted for server rendering: on the first load, a surface that is already on screen keeps its
 * content visible and only its shadow rises, so nothing the server painted ever disappears.
 *
 * Client-only, no server work. Skipped entirely under prefers-reduced-motion, or without
 * IntersectionObserver / Web Animations.
 */

const TIMING: KeyframeAnimationOptions = { duration: 1000, easing: "cubic-bezier(.3,.6,.2,1)", fill: "backwards" };
const FULL: Keyframe[] = [{ boxShadow: "none", opacity: 0 }, { opacity: 1, offset: 0.6 }, {}];
const SHADOW_ONLY: Keyframe[] = [{ boxShadow: "none" }, {}];
const HOLD: Keyframe[] = [{ boxShadow: "none", opacity: 0 }, { boxShadow: "none", opacity: 0 }];
const MAX_STAGGER = 480;
const STAGGER = 40;
/** Same as 2a's IntersectionObserver rootMargin. */
const BOTTOM_INSET = 40;
/** A token in a box-shadow, ignoring Tailwind's own `--tw-*` plumbing. */
const TOKEN = /var\(--(?!tw-)/;
/** Selector parts that describe a state, not a surface. */
const STATEFUL = /:(hover|active|focus|focus-visible|focus-within|checked|disabled)\b|::/;

/** Split a selector list on top-level commas (not the ones inside :is() / :not()). */
function splitSelectors(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === "," && depth === 0) {
      out.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(list.slice(start).trim());
  return out.filter(Boolean);
}

/** One selector for every stylesheet rule whose box-shadow uses a design token (2a's rule,
 *  applied to our class-based styles instead of 2a's inline ones). */
function tokenShadowSelector(): string {
  const parts = new Set<string>();
  const probe = document.createDocumentFragment();
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        const shadow = rule.style.getPropertyValue("box-shadow");
        if (shadow && TOKEN.test(shadow)) {
          for (const sel of splitSelectors(rule.selectorText)) {
            if (STATEFUL.test(sel)) continue;
            try {
              probe.querySelector(sel);
              parts.add(sel);
            } catch {
              // Not a selector querySelector understands: skip it.
            }
          }
        }
      } else if ("cssRules" in rule) {
        visit((rule as CSSGroupingRule).cssRules);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // Cross-origin sheet (fonts): no rules to read.
    }
  }
  return Array.from(parts).join(",");
}

type Held = HTMLElement & { _nmHold?: Animation | null };

function createEngine() {
  const debug = typeof location !== "undefined" && location.search.includes("nmdebug");
  let selector = "";
  let sheetCount = -1;
  let seen = new WeakSet<Element>();
  const held = new Set<Held>();
  let booted = false;
  let raf = 0;

  const ensureSelector = () => {
    if (document.styleSheets.length === sheetCount) return;
    sheetCount = document.styleSheets.length;
    selector = tokenShadowSelector();
  };

  const release = (el: Held) => {
    el._nmHold?.cancel();
    el._nmHold = null;
    held.delete(el);
  };

  const makeObserver = () =>
    new IntersectionObserver(
      (entries) => {
        let i = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as Held;
          io.unobserve(el);
          release(el);
          el.animate(FULL, { ...TIMING, delay: Math.min(i++ * STAGGER, MAX_STAGGER) });
        }
      },
      { rootMargin: `0px 0px -${BOTTOM_INSET}px 0px` },
    );
  let io = makeObserver();

  const candidates = (): Held[] => {
    ensureSelector();
    const found = new Set<Element>(selector ? document.body.querySelectorAll(selector) : []);
    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('[style*="box-shadow"]'))) {
      if (TOKEN.test(el.style.boxShadow)) found.add(el);
    }
    return Array.from(found).filter((el): el is Held => el instanceof HTMLElement && !el.classList.contains("skeleton"));
  };

  const scan = (firstLoad = false) => {
    raf = 0;
    if (debug) (window as unknown as { __nmScans: number }).__nmScans = ((window as unknown as { __nmScans?: number }).__nmScans ?? 0) + 1;
    const fresh = candidates().filter((el) => !seen.has(el));
    // Read every rect first, then write, so the scan never interleaves layout and style.
    const vh = window.innerHeight - BOTTOM_INSET;
    const vw = window.innerWidth;
    const rects = firstLoad ? fresh.map((el) => el.getBoundingClientRect()) : [];
    let i = 0;
    fresh.forEach((el, k) => {
      seen.add(el);
      if (booted && el.closest("[data-nm-keep]")) return;
      const r = rects[k];
      if (r && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw) {
        // First load, already painted on screen: the shadow rises, the content stays put.
        el.animate(SHADOW_ONLY, { ...TIMING, delay: Math.min(i++ * STAGGER, MAX_STAGGER) });
        return;
      }
      el._nmHold = el.animate(HOLD, { duration: 1e9 });
      held.add(el);
      io.observe(el);
    });
  };

  const queue = () => {
    if (!raf) raf = requestAnimationFrame(() => scan());
  };

  // childList only: the homepage rewrites attributes (map plucks, charts) and text (typewriter)
  // constantly, and none of that adds a surface. Only added HTML elements count: text nodes
  // and SVG (the hero map re-inserts its land paths every 2.6s) never carry a surface.
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      for (const n of Array.from(r.addedNodes)) {
        if (n instanceof HTMLElement) {
          queue();
          return;
        }
      }
    }
  });

  const reset = () => {
    io.disconnect();
    held.forEach((el) => release(el));
    held.clear();
    seen = new WeakSet();
    io = makeObserver();
    scan();
  };

  const destroy = () => {
    mo.disconnect();
    io.disconnect();
    cancelAnimationFrame(raf);
    held.forEach((el) => release(el));
    held.clear();
  };

  scan(true);
  // From here on the nav ([data-nm-keep]) is left alone: it animates on the first load only, so
  // an element it mounts later (the active link's pill after a navigation) appears directly.
  booted = true;
  mo.observe(document.body, { childList: true, subtree: true });
  return { reset, destroy };
}

export function NmReveal() {
  const pathname = usePathname();
  const engine = useRef<ReturnType<typeof createEngine> | null>(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !Element.prototype.animate) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = () => {
      if (!motion.matches && !engine.current) engine.current = createEngine();
    };
    const onChange = () => {
      if (motion.matches) {
        engine.current?.destroy();
        engine.current = null;
      }
    };
    start();
    motion.addEventListener("change", onChange);
    return () => {
      motion.removeEventListener("change", onChange);
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  // A page change replays the reveal on the new page (the nav excepted), as in 2a.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    const id = requestAnimationFrame(() => engine.current?.reset());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
