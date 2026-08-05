"use client";

import { useEffect, useState, type ComponentType } from "react";
import { normalizeLang, PRE_CLASS, PRE_STYLE, type CodeBlockInnerProps } from "./code-block-shared";

interface CodeBlockProps {
  code: string;
  language?: string;
}

/** The server-rendered / pre-hydration state: the real code, preformatted and readable,
 *  just without token colours. Shares PRE_CLASS/PRE_STYLE with the highlighted version, so
 *  the later swap is a pure colour change with no reflow. */
function PlainCode({ code }: { code: string }) {
  return (
    <pre className={PRE_CLASS} style={PRE_STYLE}>
      {code}
    </pre>
  );
}

/** Syntax-highlighted code block. Uses a single dark surface in BOTH site themes (code
 *  reads better dark and it matches the mkdir terminal). Long lines scroll horizontally;
 *  whitespace is preserved in both states.
 *
 *  Prism runs in the BROWSER only: it is imported from an effect after mount, so the
 *  tokenizer never executes during server rendering (Worker CPU is scarce on the
 *  Cloudflare free plan) and never ships in the initial chunk. The server HTML and the
 *  first client paint both render the identical plain block, so there is no hydration
 *  mismatch and highlighting simply colours it in once the chunk lands. */
export function CodeBlock({ code, language }: CodeBlockProps) {
  const { lang, label } = normalizeLang(language);
  const source = code.replace(/\n$/, "");
  const [Highlighted, setHighlighted] = useState<ComponentType<CodeBlockInnerProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./code-block-highlight")
      .then((mod) => {
        // Highlighting is decorative — if the chunk fails, the plain block stays.
        if (!cancelled) setHighlighted(() => mod.default);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="relative mt-5 overflow-hidden"
      style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#0d1117" }}
    >
      {label !== "text" && (
        <span
          className="mono absolute top-2 right-3 z-[1] text-[10.5px] tracking-wide uppercase select-none"
          style={{ color: "rgba(230,237,243,0.4)" }}
        >
          {label}
        </span>
      )}
      {Highlighted ? <Highlighted code={source} lang={lang} /> : <PlainCode code={source} />}
    </div>
  );
}
