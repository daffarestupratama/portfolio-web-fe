import type { SkillGroup } from "@/content/about";
import { TechTile } from "@/components/ui/tech-tile";

interface SkillsSectionProps {
  groups: SkillGroup[];
}

/** Portfolio 2a's Skills, under Experiences on /about. Skills with a logo render as 52px logo
 *  tiles (the level travels in the tile's label), the rest as pills with a mono level.
 *  Grouping and order come from the curated about-page relation, unchanged. */
export function SkillsSection({ groups }: SkillsSectionProps) {
  if (groups.length === 0) return null;
  return (
    <section className="sk" aria-labelledby="skills-title">
      <div className="sk-inner">
        <h2 id="skills-title" className="sk-title">
          Skills
        </h2>
        <div className="sk-groups">
          {groups.map((group) => {
            const withLogo = group.skills.filter((s) => s.logo);
            const withoutLogo = group.skills.filter((s) => !s.logo);
            return (
              <div key={group.category}>
                <div className="sk-label mono">{group.label}</div>

                {withLogo.length > 0 && (
                  <div className="sk-logos">
                    {withLogo.map((skill) => (
                      <TechTile key={skill.name} item={skill} variant="skill" />
                    ))}
                  </div>
                )}

                {withoutLogo.length > 0 && (
                  <div className="sk-pills">
                    {withoutLogo.map((skill) => (
                      <span key={skill.name} className="sk-pill" title={skill.description ?? undefined}>
                        {skill.name}
                        <span className="sk-level mono">{skill.level}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
