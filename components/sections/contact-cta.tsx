import { MailIcon, WhatsappIcon } from "@/components/ui/icons";

// Copy fallbacks — used only when site-setting leaves the field empty.
const DEFAULT_HEADING = "Let's work together";
const DEFAULT_DESCRIPTION =
  "Have a project, a dataset, or a city you'd like to explore on foot? I'm happy to talk — reach out and I'll get back to you.";

interface ContactCTAProps {
  /** Resolved by getSiteSettings() from site-setting.contactLinks — never empty. */
  email: string;
  whatsappUrl: string;
  /** Optional overrides (e.g. /services passes service-page.ctaHeading / ctaText). */
  heading?: string | null;
  description?: string | null;
  /** 2a sets the services CTA heading with `text-wrap: balance` and a 46ch paragraph. */
  variant?: "default" | "services";
}

/**
 * Portfolio 2a's contact block: a raised panel seated in two concave rings, with the two
 * actions in an inset well.
 */
export function ContactCTA({ email, whatsappUrl, heading, description, variant = "default" }: ContactCTAProps) {
  const resolvedHeading = heading || DEFAULT_HEADING;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;

  return (
    // `--anchor-contact` (90px, 2a's value) keeps the section 30px clear of the 60px stuck
    // navbar when the "#contact" CTA scrolls here (scrollIntoView honours scroll-margin-top).
    <section id="contact" className="cta scroll-mt-(--anchor-contact) outline-none" data-variant={variant}>
      <div className="cta-ring">
        <div className="cta-ring">
          <div className="cta-panel">
            <div>
              <h2 className="cta-title">{resolvedHeading}</h2>
              <p className="cta-text">{resolvedDescription}</p>
            </div>
            <div className="cta-well">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="nm-btn-accent cta-btn">
                <WhatsappIcon width={17} height={17} />
                WhatsApp
              </a>
              <a href={`mailto:${email}`} className="cta-btn cta-btn-email">
                <MailIcon />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
