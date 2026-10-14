import type { ServiceFeature } from "@/content/services";
import { PlainText } from "@/components/ui/plain-text";

/** Portfolio 2a's feature cards, numbered 01, 02… in an inset well. */
export function FeaturesGrid({ features }: { features: ServiceFeature[] }) {
  return (
    <div className="sv-ft-grid">
      {features.map((f, i) => (
        <div key={i} className="sv-ft">
          <span className="sv-ft-n mono" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="sv-ft-title">{f.title}</h3>
          <PlainText text={f.description} className="sv-ft-desc" mode="breaks" />
        </div>
      ))}
    </div>
  );
}
