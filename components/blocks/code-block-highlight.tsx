"use client";

import { Highlight, themes, type Language } from "prism-react-renderer";
import { PRE_CLASS, PRE_STYLE, type CodeBlockInnerProps } from "./code-block-shared";

/**
 * Prism-backed renderer. Loaded lazily on the client only (see code-block.tsx) so the
 * tokenizer never runs during server rendering. It reuses PRE_CLASS/PRE_STYLE from the
 * plain fallback, so swapping to the highlighted version changes colours only — the box
 * metrics (font, size, line-height, padding) are identical and nothing reflows.
 */
export default function CodeBlockHighlight({ code, lang }: CodeBlockInnerProps) {
  return (
    <Highlight theme={themes.nightOwl} code={code} language={lang as Language}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className={PRE_CLASS} style={PRE_STYLE}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, j) => (
                <span key={j} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
