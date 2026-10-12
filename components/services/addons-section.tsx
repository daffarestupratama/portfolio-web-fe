import type { ServiceAddonGroup } from "@/content/services";

/** Portfolio 2a's add-on groups: a raised card per category, each item in its own inset row. */
export function AddonsSection({ groups }: { groups: ServiceAddonGroup[] }) {
  return (
    <div className="sv-addon-grid">
      {groups.map((group) => (
        <div key={group.category} className="sv-addon">
          <h3 className="sv-addon-label">{group.label}</h3>
          <ul className="sv-addon-list">
            {group.items.map((item, i) => (
              <li key={i} className="sv-addon-item">
                <div className="sv-addon-row">
                  <span className="sv-addon-name">
                    {item.name}
                    {item.isPopular && <span className="sv-addon-pop">populer</span>}
                  </span>
                  {item.priceText && <span className="sv-addon-price mono">{item.priceText}</span>}
                </div>
                {(item.unit || item.description) && (
                  <p className="sv-addon-sub">{[item.unit, item.description].filter(Boolean).join(" · ")}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
