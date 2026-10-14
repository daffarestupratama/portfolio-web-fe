import { Fragment } from "react";
import { breakLines, parsePlainText } from "@/lib/plain-text";

interface PlainTextProps {
  /** A Strapi `text` field. Rendered as text only, never as HTML. */
  text: string;
  /** The field's own class: it keeps the font, size, colour and outer spacing. */
  className: string;
  /**
   * `blocks` (default): paragraphs, line breaks and "- " / "• " bulleted lists.
   * `breaks`: line breaks only, at most one blank line in a row, no lists.
   */
  mode?: "blocks" | "breaks";
}

/** Lines joined by <br />; an empty line (a kept blank line) shows as an empty row. The empty
 *  line renders nothing rather than an empty string, which the server never emits as a text
 *  node and which therefore fails hydration. */
function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line || null}
    </Fragment>
  ));
}

/**
 * A plain-text CMS field with its line breaks kept (lib/plain-text.ts). A single paragraph
 * renders as one `<p className>`, which for text without line breaks is exactly the markup the
 * field had before, so existing content is unchanged. Structure beyond that goes in a `.pt`
 * wrapper (paragraph gap and list style in globals.css, scaled to the field's font size).
 */
export function PlainText({ text, className, mode = "blocks" }: PlainTextProps) {
  if (mode === "breaks") {
    return (
      <p className={className}>
        <Lines lines={breakLines(text)} />
      </p>
    );
  }

  const blocks = parsePlainText(text);
  if (blocks.length === 0) return <p className={className} />;
  if (blocks.length === 1 && blocks[0]!.type === "p") {
    return (
      <p className={className}>
        <Lines lines={blocks[0]!.lines} />
      </p>
    );
  }

  return (
    <div className={`${className} pt`}>
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i}>
            <Lines lines={block.lines} />
          </p>
        ) : (
          <ul key={i} className="pt-ul">
            {block.items.map((item, j) => (
              <li key={j} className="pt-li">
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
