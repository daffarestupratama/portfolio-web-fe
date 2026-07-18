import type { SkillGroup } from "@/content/about";

interface SkillsSectionProps {
  groups: SkillGroup[];
}

/** Skills grouped by category; each skill is a glass chip with its level as a
 *  small accent badge. */
export function SkillsSection({ groups }: SkillsSectionProps) {
  if (groups.length === 0) return null;
  return (
    <section>
      <h2 className="mt-10 mb-5 text-[22px] font-bold" style={{ letterSpacing: "-0.02em" }}>
        Skills
      </h2>
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.category}>
            <div className="mono mb-2.5 text-[11px] tracking-[0.12em] uppercase" style={{ color: "var(--ink-faint)" }}>
              {group.label}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={skill.name}
                  className="chip inline-flex items-center gap-2 px-3 py-1.5 text-[13px]"
                  style={{ borderRadius: 999, color: "var(--ink)" }}
                  title={skill.description ?? undefined}
                >
                  {skill.name}
                  <span
                    className="mono text-[10px] tracking-wide capitalize"
                    style={{ color: "var(--accent-ink)" }}
                  >
                    {skill.level}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
