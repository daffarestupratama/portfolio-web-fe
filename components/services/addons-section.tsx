import type { ServiceAddonGroup } from "@/content/services";

/** Portfolio 2a's add-on groups: a raised card per category, each item in its own inset row. */
export function AddonsSection({ groups }: { groups: ServiceAddonGroup[] }) {
  return (
    <div className="sv-ad-grid">
      {groups.map((group) => (
        <div key={group.category} className="sv-ad">
          <h3 className="sv-ad-label">{group.label}</h3>
          <ul className="sv-ad-list">
            {group.items.map((item, i) => (
              <li key={i} className="sv-ad-item">
                <div className="sv-ad-row">
                  <span className="sv-ad-name">
                    {item.name}
                    {item.isPopular && <span className="sv-ad-pop">populer</span>}
                  </span>
                  {item.priceText && <span className="sv-ad-price mono">{item.priceText}</span>}
                </div>
                {(item.unit || item.description) && (
                  <p className="sv-ad-sub">{[item.unit, item.description].filter(Boolean).join(" · ")}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
