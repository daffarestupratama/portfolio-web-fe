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
}

const HEADING_SIZES: Record<number, string> = {
  1: "text-[26px]",
  2: "text-[22px]",
  3: "text-[19px]",
  4: "text-[17px]",
  5: "text-[15px]",
  6: "text-[14px]",
};

/** Renders a Strapi `blocks` rich-text field as readable prose on the base/glass
 *  surface, styled with the design tokens. First real long-form usage: article
 *  body + project approach/result. */
export function StrapiBlocks({ content }: StrapiBlocksProps) {
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
          return (
            <figure className="mt-6 mb-2">
              <div className="mx-auto overflow-hidden" style={{ borderRadius: 15, maxWidth: Math.min(width, 760) }}>
                <StrapiImage
                  src={strapiImageUrl(image.url)}
                  alt={image.alternativeText || ""}
                  width={width}
                  height={height}
                  sizes="(max-width: 768px) 100vw, 760px"
                  style={{ width: "100%", height: "auto", display: "block" }}
                  fallback={
                    <MediaPlaceholder
                      variant="article"
                      label={image.alternativeText || "image"}
                      className="aspect-video w-full"
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
