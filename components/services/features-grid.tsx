import type { ServiceFeature } from "@/content/services";

export function FeaturesGrid({ features }: { features: ServiceFeature[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f, i) => (
        <div key={i} className="glass-card p-5">
          <div className="relative z-[2]">
            <h3 className="text-[15.5px] font-bold" style={{ letterSpacing: "-0.01em" }}>
              {f.title}
            </h3>
            <p className="mt-2 text-[13.5px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
              {f.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
