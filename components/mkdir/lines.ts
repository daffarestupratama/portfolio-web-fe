import type { TermLine, TermSegment, Tone } from "./terminal-types";

let counter = 0;
/** Stable-enough unique id for React keys (client-only session counter). */
export function uid(): string {
  return `l${(counter++).toString(36)}`;
}

interface LineOpts {
  pre?: boolean;
  ariaHidden?: boolean;
}

export function plain(text: string, tone?: Tone, opts: LineOpts = {}): TermLine {
  return { id: uid(), segments: [{ text, tone }], pre: opts.pre, ariaHidden: opts.ariaHidden };
}

export function rich(segments: TermSegment[], opts: LineOpts = {}): TermLine {
  return { id: uid(), segments, pre: opts.pre, ariaHidden: opts.ariaHidden };
}

/** Split multi-line text into one TermLine per line, sharing a tone. */
export function textLines(text: string, tone?: Tone, opts: LineOpts = {}): TermLine[] {
  return text.replace(/\n$/, "").split("\n").map((t) => plain(t, tone, opts));
}
