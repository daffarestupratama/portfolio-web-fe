interface InfoListProps {
  title: string;
  items: string[];
  /** Marker colour: accent-b by default, faint for the "not" lists (excluded, not suitable). */
  tone?: "accent" | "muted";
}

/** Reusable titled bullet list for the tour landing "why choose me" + the
 *  detail page's suitable/prepare/included/excluded string lists. Renders
 *  nothing when empty. */
export function InfoList({ title, items, tone = "accent" }: InfoListProps) {
  if (items.length === 0) return null;
  return (
    <div className="il" data-tone={tone}>
      <h3 className="il-title">{title}</h3>
      <ul className="il-list">
        {items.map((item, i) => (
          <li key={i}>
            <span aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
