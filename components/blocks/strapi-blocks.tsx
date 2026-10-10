"use client";

import type { ReactNode } from "react";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";
import { strapiImageUrl } from "@/lib/image";
import { StrapiImage } from "@/components/ui/strapi-image";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { CodeBlock } from "@/components/blocks/code-block";
import { HEADING_SCROLL_OFFSET } from "@/components/blocks/toc";

interface StrapiBlocksProps {
  /** Pass `withHeadingIds(body).content` to get anchored headings for a TOC; the raw
   *  body renders identically but without ids. */
  content: BlocksContent;
  /**
   * Portfolio 2a's prose scale: `article` (article body), `project` (project Approach & Result,
   * tour description), `about` (about body), `intro` (services and tours intro).
   */
  variant?: BlocksVariant;
}

export type BlocksVariant = "article" | "project" | "about" | "intro";

/** Renders a Strapi `blocks` rich-text field as Portfolio 2a prose (`.sb*` in globals.css). */
export function StrapiBlocks({ content, variant = "project" }: StrapiBlocksProps) {
  return <NmBlocks content={content} variant={variant} />;
}

/**
 * Portfolio 2a's prose (lines 705–724 of the design): block gap, heading scale, inset quote,
 * accent-b bullet dots, mono accent-ink ordered numbers, inset image well with an italic
 * caption, inset inline code. Heading ids (from withHeadingIds) and their scroll margin are
 * the same as before, so the TOC and scroll-spy are unaffected.
 */
function NmBlocks({ content, variant }: { content: BlocksContent; variant: BlocksVariant }) {
  return (
    <div className={`sb sb-${variant}`}>
      <BlocksRenderer
        content={content}
        blocks={{
          paragraph: ({ children }) => <p className="sb-p">{children}</p>,
          heading: (props) => {
            const { children, level, id } = props as {
              children?: ReactNode;
              level: 1 | 2 | 3 | 4 | 5 | 6;
              id?: string;
            };
            const Tag = `h${level}` as const;
            return (
              <Tag
                id={id}
                className={`sb-h sb-h${level <= 2 ? 2 : 3}`}
                style={id ? { scrollMarginTop: `${HEADING_SCROLL_OFFSET}px` } : undefined}
              >
                {children}
              </Tag>
            );
          },
          list: ({ children, format }) =>
            format === "ordered" ? <ol className="sb-ol">{children}</ol> : <ul className="sb-ul">{children}</ul>,
          "list-item": ({ children }) => (
            <li className="sb-li">
              <span>{children}</span>
            </li>
          ),
          quote: ({ children }) => <blockquote className="sb-quote">{children}</blockquote>,
          code: (props) => {
            const { plainText, language } = props as { plainText?: string; language?: string };
            return <CodeBlock code={plainText ?? ""} language={language} />;
          },
          image: ({ image }) => {
            const width = image.width || 1200;
            const height = image.height || 675;
            const caption = image.caption?.trim() || image.alternativeText?.trim();
            // `fill` in a box that states the intrinsic ratio: no layout shift, and no
            // next/image "one dimension modified" warning (see the legacy renderer above).
            return (
              <figure className="sb-fig">
                <div className="sb-fig-well">
                  <div className="sb-fig-img" style={{ aspectRatio: `${width} / ${height}` }}>
                    <StrapiImage
                      src={strapiImageUrl(image.url)}
                      alt={image.alternativeText || ""}
                      fill
                      sizes="(max-width: 768px) 100vw, 740px"
                      style={{ objectFit: "contain" }}
                      fallback={
                        <MediaPlaceholder
                          variant="article"
                          label={image.alternativeText || "image"}
                          className="absolute inset-0 h-full w-full"
                        />
                      }
                    />
                  </div>
                </div>
                {caption && <figcaption className="sb-cap">{caption}</figcaption>}
              </figure>
            );
          },
          link: ({ children, url }) => (
            <a href={url} className="sb-a">
              {children}
            </a>
          ),
        }}
        modifiers={{
          bold: ({ children }) => <strong className="sb-b">{children}</strong>,
          italic: ({ children }) => <em>{children}</em>,
          underline: ({ children }) => <u>{children}</u>,
          strikethrough: ({ children }) => <s>{children}</s>,
          code: ({ children }) => <code className="sb-code mono">{children}</code>,
        }}
      />
    </div>
  );
}
