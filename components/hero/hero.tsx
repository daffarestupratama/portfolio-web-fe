import type { HeroLink, HeroLinkType, HomePage } from "@/content/home";
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
const SOCIAL_ORDER: HeroLinkType[] = ["linkedin", "github", "instagram", "email"];

interface HeroProps {
  home: HomePage;
  /** From site-setting.contactLinks, keyed on linkType (see mapHeroLinks). */
  links: HeroLink[];
}

export function Hero({ home, links }: HeroProps) {
  const socials = SOCIAL_ORDER.flatMap((type) => links.filter((l) => l.linkType === type).slice(0, 1));

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
                <div className="hero-links">
                  {socials.map((link) => {
                    const Icon = contactIcons[link.linkType];
                    const external = /^https?:\/\//.test(link.url);
                    return (
                      <a
                        key={link.linkType}
                        href={link.url}
                        aria-label={link.label}
                        className="hero-link"
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
