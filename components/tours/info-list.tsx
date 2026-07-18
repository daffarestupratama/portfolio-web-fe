interface InfoListProps {
  title: string;
  items: string[];
  /** Marker accent — defaults to the primary accent; pass a hue for e.g. excluded (red-ish). */
  tone?: "accent" | "muted";
}

/** Reusable titled bullet list for the tour landing "why choose me" + the
 *  detail page's suitable/prepare/included/excluded string lists. Renders
 *  nothing when empty. */
export function InfoList({ title, items, tone = "accent" }: InfoListProps) {
  if (items.length === 0) return null;
  const dot = tone === "muted" ? "var(--ink-faint)" : "var(--accent)";
  return (
    <div>
      <h3 className="text-[15px] font-semibold" style={{ letterSpacing: "-0.01em" }}>
        {title}
      </h3>
      <ul className="mt-2.5 flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
            <span
              aria-hidden="true"
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: dot }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
