import type { Metadata } from "next";
import Link from "next/link";
import { notFoundMetadata } from "@/lib/seo";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = notFoundMetadata();

/** Not in Portfolio 2a: built from its contact-CTA nest (two concave rings around a raised
 *  panel) and its accent button. */
export default function NotFound() {
  return (
    <main className="nf">
      <div className="cta-ring">
        <div className="cta-ring">
          <div className="cta-panel nf-panel">
            <div>
              <span className="nf-code mono">404</span>
              <h1 className="nf-title">Page not found</h1>
              <p className="cta-text">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
            </div>
            <Link href="/" className="nm-btn-accent nf-btn">
              Back to home
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
