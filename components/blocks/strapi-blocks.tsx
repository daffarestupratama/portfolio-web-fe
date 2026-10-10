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
   * `article` / `project`: Portfolio 2a's prose (article body; project Approach & Result).
   * Omitted: the earlier rendering, kept for the pages not yet redesigned (about, services,
   * tours) until Phase 3b.
   */
  variant?: "article" | "project";
}

const HEADING_SIZES: Record<number, string> = {
  1: "text-[26px]",
  2: "text-[22px]",
  3: "text-[19px]",
  4: "text-[17px]",
  5: "text-[15px]",
  6: "text-[14px]",
};

/** Renders a Strapi `blocks` rich-text field as prose. 2a's article and project variants are
 *  class-based (`.sb*` in globals.css); the legacy rendering stays for the other pages. */
export function StrapiBlocks({ content, variant }: StrapiBlocksProps) {
  return variant ? <NmBlocks content={content} variant={variant} /> : <LegacyBlocks content={content} />;
}

function LegacyBlocks({ content }: { content: BlocksContent }) {
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        paragraph: ({ children }) => (
          <p className="mt-4 text-[15.5px] first:mt-0" style={{ lineHeight: 1.75, color: "var(--ink)" }}>
            {children}
          </p>
        ),
        // `id` is stamped onto the node by withHeadingIds and reaches us through the
        // renderer's prop spread (same mechanism as `language` on code blocks below).
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
              className={`mt-8 mb-1 font-bold first:mt-0 ${HEADING_SIZES[level]}`}
              style={{
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                color: "var(--ink)",
                ...(id ? { scrollMarginTop: `${HEADING_SCROLL_OFFSET}px` } : {}),
              }}
            >
              {children}
            </Tag>
          );
        },
        list: ({ children, format }) => {
          const Tag = format === "ordered" ? "ol" : "ul";
          return (
            <Tag
              className={`mt-4 space-y-2 pl-5 ${format === "ordered" ? "list-decimal" : "list-disc"}`}
              style={{ color: "var(--ink)" }}
            >
              {children}
            </Tag>
          );
        },
        "list-item": ({ children }) => (
          <li className="text-[15.5px]" style={{ lineHeight: 1.65 }}>
            {children}
          </li>
        ),
        quote: ({ children }) => (
          <blockquote
            className="mt-5 rounded-r-lg py-2 pr-3 pl-4 text-[15px] italic"
            style={{ borderLeft: "3px solid var(--accent)", background: "var(--glass-bg-2)", color: "var(--ink-dim)" }}
          >
            {children}
          </blockquote>
        ),
        // The renderer's type omits `language`, but Block.js spreads it into props
        // at runtime (verified) — read it via a cast; unknown/absent → plain text.
        code: (props) => {
          const { plainText, language } = props as { plainText?: string; language?: string };
          return <CodeBlock code={plainText ?? ""} language={language} />;
        },
        image: ({ image }) => {
          const width = image.width || 1200;
          const height = image.height || 675;
          const caption = image.caption?.trim();
          // `fill` inside a box that states the intrinsic aspect ratio, rather than
          // width/height + `height: auto`.
          // next/image warns when exactly ONE rendered dimension differs from the declared
          // attribute, and the 760px cap could clamp an image only a pixel or two wider —
          // moving the width by 1px while the height's sub-pixel change snapped back to its
          // declared value. `width:"100%"/height:"auto"` (Next's own suggested remedy)
          // cannot fix that, because the cause is pixel rounding, not a missing style. With
          // `fill` there are no width/height attributes at all, so the check cannot fire for
          // any image at any width, and the ratio is declared explicitly instead of being
          // inferred — which also removes the load-time layout shift.
          return (
            <figure className="mt-6 mb-2">
              <div
                className="relative mx-auto overflow-hidden"
                style={{ borderRadius: 15, maxWidth: Math.min(width, 760), aspectRatio: `${width} / ${height}` }}
              >
                <StrapiImage
                  src={strapiImageUrl(image.url)}
                  alt={image.alternativeText || ""}
                  fill
                  sizes="(max-width: 768px) 100vw, 760px"
                  // Identical to `cover` while the box carries the true ratio, but it can
                  // never crop if a CMS record's stored dimensions are slightly off.
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
              {caption && (
                <figcaption className="mt-2 text-center text-[12.5px]" style={{ color: "var(--ink-faint)" }}>
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        },
        link: ({ children, url }) => (
          <a
            href={url}
            className="underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ color: "var(--accent-ink)" }}
          >
            {children}
          </a>
        ),
      }}
      modifiers={{
        bold: ({ children }) => <strong style={{ fontWeight: 700, color: "var(--ink)" }}>{children}</strong>,
        italic: ({ children }) => <em>{children}</em>,
        underline: ({ children }) => <u>{children}</u>,
        strikethrough: ({ children }) => <s>{children}</s>,
        code: ({ children }) => (
          <code
            className="mono rounded px-1.5 py-0.5 text-[0.9em]"
            style={{ background: "var(--glass-bg-2)", border: "1px solid var(--glass-brd)" }}
          >
            {children}
          </code>
        ),
      }}
    />
  );
}

/**
 * Portfolio 2a's prose (lines 705–724 of the design): block gap, heading scale, inset quote,
 * accent-b bullet dots, mono accent-ink ordered numbers, inset image well with an italic
 * caption, inset inline code. Heading ids (from withHeadingIds) and their scroll margin are
 * the same as before, so the TOC and scroll-spy are unaffected.
 */
function NmBlocks({ content, variant }: { content: BlocksContent; variant: "article" | "project" }) {
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
