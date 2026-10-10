import type { ServiceProcessStep } from "@/content/services";

/** Portfolio 2a's process steps: a grid of raised cards, each with an accent-b number disc. */
export function ProcessList({ steps }: { steps: ServiceProcessStep[] }) {
  return (
    <ol className="sv-pr-grid">
      {steps.map((s) => (
        <li key={s.order} className="sv-pr">
          <span className="sv-pr-ring" aria-hidden="true">
            <span className="sv-pr-n mono">{s.order}</span>
          </span>
          <div>
            <h3 className="sv-pr-title">{s.title}</h3>
            <p className="sv-pr-desc">{s.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
