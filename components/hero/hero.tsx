import type { ContactIcon, ContactLink, HomePage } from "@/content/home";
import { indonesiaMap } from "@/lib/geo/indonesia";
import { CtaLink } from "@/components/ui/cta-link";
import { HeroPanel } from "./hero-panel";
import { HeroName } from "./hero-name";
import { FileTextIcon, UserIcon, LinkedinIcon, GithubIcon, InstagramIcon, MailIcon } from "@/components/ui/icons";

const contactIcons = {
  linkedin: LinkedinIcon,
  github: GithubIcon,
  instagram: InstagramIcon,
  email: MailIcon,
};

/** 2a's social row: these four, in this order. */
const SOCIAL_ORDER: ContactIcon[] = ["linkedin", "github", "instagram", "email"];

interface HeroProps {
  home: HomePage;
  /** From site-setting.contactLinks (see mapHeroContactLinks). */
  links: ContactLink[];
}

export function Hero({ home, links }: HeroProps) {
  const socials = SOCIAL_ORDER.flatMap((icon) => links.filter((l) => l.icon === icon).slice(0, 1));

  return (
    <header className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 className="hero-h1">
            <span className="hero-headline">{home.headline}</span>
            <span className="hero-fullname">
              <HeroName text={home.fullName} />
            </span>
          </h1>

          <p className="hero-sub">{home.subheadline}</p>

          <div className="hero-actions">
            <CtaLink href={home.heroCtaPrimary.url} className="nm-btn-accent hero-cta">
              <FileTextIcon />
              {home.heroCtaPrimary.label}
            </CtaLink>
            <CtaLink href={home.heroCtaSecondary.url} className="nm-btn hero-cta">
              <UserIcon />
              {home.heroCtaSecondary.label}
            </CtaLink>
            {socials.length > 0 && (
              <>
                <span aria-hidden="true" className="hero-divider" />
                <div className="hero-linkss">
                  {socials.map((link) => {
                    const Icon = contactIcons[link.icon];
                    const external = /^https?:\/\//.test(link.url);
                    return (
                      <a
                        key={link.icon}
                        href={link.url}
                        aria-label={link.label}
                        className="hero-links"
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        <Icon />
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hero-panel-wrap">
          {/* 2a's "dish": two concave rings the panel sits in. Static, decorative. */}
          <div aria-hidden="true" className="hero-dish">
            <div />
          </div>
          <div className="hero-panel">
            <div className="hero-label mono">geo.network</div>
            <HeroPanel map={indonesiaMap} />
          </div>
        </div>
      </div>
    </header>
  );
}
