import Link from "next/link";

interface RelatedCardProps {
  href: string;
  title: string;
  /** Mono meta line: "category · date" for articles, "type · year" for projects. */
  meta: string;
  /** Optional inset chip above the title (the project page's "Related writing" cards). */
  chip?: string;
  /**
   * 2a's three related-card sizes:
   *  - `aside`: compact, in the article sidebar
   *  - `below`: the grid after the article body
   *  - `writing`: the project page's Related writing cards
   */
  size: "aside" | "below" | "writing";
}

/** Portfolio 2a's related card: a raised card, the whole of which is the link. */
export function RelatedCard({ href, title, meta, chip, size }: RelatedCardProps) {
  return (
    <article className="rc" data-size={size}>
      {chip && <span className="rc-chip">{chip}</span>}
      <h3 className="rc-title">
        <Link href={href} className="rc-link">
          {title}
        </Link>
      </h3>
      <div className="rc-meta mono">{meta}</div>
    </article>
  );
}
