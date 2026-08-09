"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { SITE_URL } from "@/lib/seo";
import { scrollToHash } from "@/lib/scroll";

/** True for links that leave the site: mailto:/tel:, or an absolute URL on a different
 *  origin than SITE_URL. CMS-authored CTAs can point anywhere (e.g. the resume link at
 *  https://s.daffa.me/cven), and next/link would try to client-navigate those. */
export function isExternalUrl(url: string): boolean {
  if (!url) return false;
  if (/^(mailto:|tel:)/i.test(url)) return true;
  if (!/^https?:\/\//i.test(url)) return false; // relative path → internal
  try {
    return new URL(url).origin !== new URL(SITE_URL).origin;
  } catch {
    return false;
  }
}

/** Same-page anchor, e.g. the CMS "Contact Me" CTA pointing at "#contact". */
export function isHashUrl(url: string): boolean {
  return url.startsWith("#");
}

interface CtaLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/** Renders a CMS-driven link. Three cases:
 *  - `#hash`  → smooth-scrolls to the section in-page (no navigation, no reload)
 *  - external → new tab with rel="noopener noreferrer"
 *  - internal → normal client-side navigation via next/link */
export function CtaLink({ href, children, className, style, ...rest }: CtaLinkProps) {
  if (isHashUrl(href)) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        onClick={(e) => {
          // Only take over when the target actually exists on this page; otherwise let
          // the browser handle the anchor normally.
          if (scrollToHash(href)) e.preventDefault();
        }}
        {...rest}
      >
        {children}
      </a>
    );
  }

  if (isExternalUrl(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style} {...rest}>
      {children}
    </Link>
  );
}
