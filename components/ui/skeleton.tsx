import type { CSSProperties } from "react";

/** One skeleton block: an inset `--in-sm` well (`.skeleton`), sized per use. */
export function Sk({
  h,
  w,
  r = 10,
  rows,
  className,
  style,
}: {
  h?: number | string;
  w?: number | string;
  r?: number;
  /** Bento row span, for a tile placeholder inside `.bento`. */
  rows?: 1 | 2;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`skeleton${className ? ` ${className}` : ""}`}
      data-rows={rows}
      style={{ height: h, width: w, borderRadius: r, ...style }}
    />
  );
}

/** The 2a page header (`.pg-head`) in skeleton form: a title bar and a standfirst line. */
export function SkPageHeader({ titleWidth = 240, narrow }: { titleWidth?: number; narrow?: boolean }) {
  return (
    <header className="pg-head" data-w={narrow ? "928" : undefined}>
      <Sk h={50} w={titleWidth} r={14} style={{ maxWidth: "100%" }} />
      <Sk h={18} r={9} style={{ marginTop: 16, maxWidth: 460 }} />
    </header>
  );
}

/** Lines of prose. */
export function SkLines({ count, widths }: { count: number; widths?: (i: number) => string }) {
  return (
    <div className="sk-lines">
      {Array.from({ length: count }).map((_, i) => (
        <Sk key={i} h={15} r={6} w={widths ? widths(i) : i % 3 === 2 ? "70%" : "100%"} />
      ))}
    </div>
  );
}
