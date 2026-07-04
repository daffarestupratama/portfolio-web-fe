"use client";

import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

interface StrapiBlocksProps {
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
        heading: ({ children, level }) => {
          const Tag = `h${level}` as const;
          return (
            <Tag
              className={`mt-8 mb-1 font-bold first:mt-0 ${HEADING_SIZES[level]}`}
              style={{ letterSpacing: "-0.02em", lineHeight: 1.25, color: "var(--ink)" }}
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
        code: ({ children, plainText }) => (
          <pre
            className="mono mt-5 overflow-x-auto rounded-xl p-4 text-[13px] leading-relaxed"
            style={{ background: "var(--glass-bg-2)", border: "1px solid var(--glass-brd)", color: "var(--ink)" }}
          >
            <code>{plainText ?? children}</code>
          </pre>
        ),
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
