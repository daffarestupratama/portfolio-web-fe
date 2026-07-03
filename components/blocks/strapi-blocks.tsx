import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

interface StrapiBlocksProps {
  content: BlocksContent;
}

const HEADING_SIZES: Record<number, string> = {
  1: "text-3xl",
  2: "text-2xl",
  3: "text-xl",
  4: "text-lg",
  5: "text-base",
  6: "text-sm",
};

/** Renders a Strapi `blocks` rich-text field with the site's typography tokens. */
export function StrapiBlocks({ content }: StrapiBlocksProps) {
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        paragraph: ({ children }) => (
          <p className="mt-4 text-[15px] first:mt-0" style={{ lineHeight: 1.7, color: "var(--ink-dim)" }}>
            {children}
          </p>
        ),
        heading: ({ children, level }) => {
          const Tag = `h${level}` as const;
          return (
            <Tag className={`mt-8 font-bold first:mt-0 ${HEADING_SIZES[level]}`} style={{ letterSpacing: "-0.02em" }}>
              {children}
            </Tag>
          );
        },
        list: ({ children, format }) => {
          const Tag = format === "ordered" ? "ol" : "ul";
          return (
            <Tag
              className={`mt-4 space-y-1.5 pl-5 ${format === "ordered" ? "list-decimal" : "list-disc"}`}
              style={{ color: "var(--ink-dim)" }}
            >
              {children}
            </Tag>
          );
        },
        "list-item": ({ children }) => (
          <li className="text-[15px]" style={{ lineHeight: 1.6 }}>
            {children}
          </li>
        ),
        quote: ({ children }) => (
          <blockquote className="mt-4 border-l-2 pl-4 italic" style={{ borderColor: "var(--accent)", color: "var(--ink-dim)" }}>
            {children}
          </blockquote>
        ),
        code: ({ children, plainText }) => (
          <pre
            className="mono mt-4 overflow-x-auto rounded-lg p-4 text-[13px]"
            style={{ background: "var(--glass-bg-2)", border: "1px solid var(--glass-brd)" }}
          >
            <code>{plainText ?? children}</code>
          </pre>
        ),
        link: ({ children, url }) => (
          <a href={url} className="underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>
            {children}
          </a>
        ),
      }}
    />
  );
}
