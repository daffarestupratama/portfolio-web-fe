"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import { normalizeLang, PRE_CLASS, PRE_STYLE, type CodeBlockInnerProps } from "./code-block-shared";

interface CodeBlockProps {
  code: string;
  language?: string;
}

/** How long the copy button shows its result before reverting. */
const COPY_FEEDBACK_MS = 1800;

type CopyState = "idle" | "copied" | "failed";

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

/** Copies the block's raw source. A real <button>, so keyboard activation and focus come
 *  for free; the result is mirrored into a polite live region rather than into the button's
 *  own label, which stays stable for screen-reader users. */
function CopyButton({ code, label }: { code: string; label: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      // Absent on insecure origins (plain http), where the property is simply undefined.
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), COPY_FEEDBACK_MS);
  }

  return (
    <>
      <button type="button" onClick={copy} aria-label={`Copy ${label} code`} className="code-copy mono">
        {state === "copied" ? <CheckIcon width={12} height={12} /> : <CopyIcon width={12} height={12} />}
        {state === "idle" ? "Copy" : state === "copied" ? "Copied" : "Failed"}
      </button>
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Code copied to clipboard" : state === "failed" ? "Could not copy code" : ""}
      </span>
    </>
  );
}

/** Syntax-highlighted code block, presented as a macOS-style terminal window: a header bar
 *  with traffic lights, the centred language name, and a copy button, over the code body.
 *  Uses a single dark surface in BOTH site themes (code reads better dark and it matches the
 *  mkdir terminal). Long lines scroll horizontally; whitespace is preserved in both states.
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
    // The grammar registration is awaited alongside the highlighter, so the extra languages
    // (bash/powershell/ini) are guaranteed present before the highlighted view mounts.
    Promise.all([
      import("./code-block-highlight"),
      import("./prism-languages").then((m) => m.registerPrismLanguages()),
    ])
      .then(([mod]) => {
        // Highlighting is decorative — if either chunk fails, the plain block stays.
        if (!cancelled) setHighlighted(() => mod.default);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    // `color-scheme: dark` is what actually keeps the horizontal scrollbar dark in light
    // mode: the UA paints scrollbars from the inherited color-scheme, not from the
    // element's own colours. The explicit rules on .code-scroll reinforce it.
    <div className="code-window relative mt-5 overflow-hidden">
      <div className="code-titlebar">
        {/* Pure decoration — one aria-hidden wrapper keeps all three dots out of the
            accessibility tree instead of announcing three anonymous shapes. */}
        <span className="code-dots" aria-hidden="true">
          <i style={{ background: "#ff5f56" }} />
          <i style={{ background: "#ffbd2e" }} />
          <i style={{ background: "#27c93f" }} />
        </span>
        <span className="code-lang mono">{label}</span>
        <CopyButton code={source} label={label} />
      </div>
      {Highlighted ? <Highlighted code={source} lang={lang} /> : <PlainCode code={source} />}
    </div>
  );
}
