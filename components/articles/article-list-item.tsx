// A client component so the contour placeholder is built from the slug on each side instead of
// being serialised into the RSC payload as a second ~14 KB copy (the HTML already carries one).
"use client";

import Link from "next/link";
import type { Article } from "@/content/home";
import { StrapiImage } from "@/components/ui/strapi-image";
import { contourMarkup } from "@/lib/contour";

interface ArticleListItemProps {
  article: Article;
}

/**
 * Portfolio 2a's article row, the same on the homepage and /articles: a left column with the
 * category, language and featured pills over a 4:3 inset thumbnail (the cover, or a seeded
 * contour when there is none), and the date, title and excerpt on the right.
 *
 * The whole row is one link: the title's stretched `::after` covers it, so a click anywhere
 * navigates and keyboard users get a single, properly named stop.
 */
export function ArticleListItem({ article }: ArticleListItemProps) {
  const href = `/articles/${article.slug}`;
  // Built once per slug and cached; identical on server and client (see lib/contour.ts).
  const contour = (
    <span className="ar-contour" dangerouslySetInnerHTML={{ __html: contourMarkup(article.slug, false) }} />
  );

  return (
    <article className="ar">
      <div className="ar-side">
        <div className="ar-pills">
          <span className="ar-cat">{article.category}</span>
          <span className="ar-lang mono">{article.language.toUpperCase()}</span>
          {article.isFeatured && <span className="ar-feat">Featured</span>}
        </div>
        <div className="ar-thumb" aria-hidden="true">
          <div className="ar-thumb-in">
            {article.coverImage ? (
              <StrapiImage
                src={article.coverImage.url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 200px"
                style={{ objectFit: "cover" }}
                fallback={contour}
              />
            ) : (
              contour
            )}
          </div>
        </div>
      </div>

      <div className="ar-main">
        <div className="ar-meta">
          <span>{article.publishedDate}</span>
          <span>·</span>
          <span>{article.readTime}</span>
          <span aria-hidden="true" className="ar-read mono">
            Read →
          </span>
        </div>
        <h3 className="ar-title">
          <Link href={href} className="ar-link">
            {article.title}
          </Link>
        </h3>
        <p className="ar-excerpt">{article.excerpt}</p>
      </div>
    </article>
  );
}
