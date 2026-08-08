import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { SITE_URL } from "@/lib/seo";

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

interface CtaLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/** Renders a CMS-driven link: external URLs open in a new tab with rel="noopener
 *  noreferrer"; internal paths keep normal client-side navigation via next/link. */
export function CtaLink({ href, children, className, style, ...rest }: CtaLinkProps) {
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
