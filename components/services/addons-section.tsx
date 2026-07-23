import type { ServiceAddonGroup } from "@/content/services";

export function AddonsSection({ groups }: { groups: ServiceAddonGroup[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {groups.map((group) => (
        <div key={group.category} className="glass-card p-5">
          <div className="relative z-[2]">
            <h3 className="text-[14px] font-bold" style={{ letterSpacing: "-0.01em", color: "var(--accent-ink)" }}>
              {group.label}
            </h3>
            <ul className="mt-3 flex flex-col">
              {group.items.map((item, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-0.5 border-t py-2.5 first:border-t-0 first:pt-0 last:pb-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[13.5px] font-semibold">
                      {item.name}
                      {item.isPopular && (
                        <span className="chip px-1.5 py-0.5 text-[10px]" style={{ borderRadius: 6 }}>
                          populer
                        </span>
                      )}
                    </span>
                    {item.priceText && (
                      <span className="mono shrink-0 text-[12.5px]" style={{ color: "var(--ink)" }}>
                        {item.priceText}
                      </span>
                    )}
                  </div>
                  {(item.unit || item.description) && (
                    <span className="text-[12px]" style={{ color: "var(--ink-faint)" }}>
                      {[item.unit, item.description].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
