import type { ServiceProcessStep } from "@/content/services";

export function ProcessList({ steps }: { steps: ServiceProcessStep[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((s) => (
        <li key={s.order} className="glass-card p-5">
          <div className="relative z-[2] flex gap-4">
            <span
              className="mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold"
              style={{ background: "var(--chip)", border: "1px solid var(--chip-brd)", color: "var(--accent-ink)" }}
            >
              {s.order}
            </span>
            <div>
              <h3 className="text-[15.5px] font-bold" style={{ letterSpacing: "-0.01em" }}>
                {s.title}
              </h3>
              <p className="mt-1 text-[13.5px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
                {s.description}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
