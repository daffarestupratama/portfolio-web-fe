import { MailIcon, WhatsappIcon } from "@/components/ui/icons";

// Hardcoded fallbacks — used only when site-setting leaves the field empty.
const FALLBACK_EMAIL = "contact@daffa.me";
const FALLBACK_WHATSAPP_URL = "https://wa.me/6288233300541";
const DEFAULT_HEADING = "Let's work together";
const DEFAULT_DESCRIPTION =
  "Have a project, a dataset, or a city you'd like to explore on foot? I'm happy to talk — reach out and I'll get back to you.";

interface ContactCTAProps {
  /** From site-setting via getSiteSettings() — CMS-editable. */
  email?: string | null;
  whatsappUrl?: string | null;
  /** Optional overrides (e.g. /services passes service-page.ctaHeading / ctaText). */
  heading?: string | null;
  description?: string | null;
}

export function ContactCTA({ email, whatsappUrl, heading, description }: ContactCTAProps) {
  const resolvedEmail = email || FALLBACK_EMAIL;
  const resolvedWhatsapp = whatsappUrl || FALLBACK_WHATSAPP_URL;
  const resolvedHeading = heading || DEFAULT_HEADING;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;

  return (
    <section className="relative z-[3] flex justify-center px-[22px] pt-[46px] pb-[30px]">
      <div
        className="flex w-full max-w-[1180px] flex-col items-center gap-6 px-6 py-12 text-center sm:px-10"
        style={{
          borderRadius: 26,
          background: "var(--card-bg)",
          backgroundImage: "var(--card-tint)",
          backdropFilter: "blur(var(--glass-blur)) saturate(140%)",
          border: "1px solid var(--glass-brd)",
          boxShadow: "var(--glass-sh), inset 0 1px 0 var(--card-hi)",
        }}
      >
        <div>
          <h2 className="font-bold" style={{ fontSize: "clamp(26px,3vw,38px)", letterSpacing: "-0.03em" }}>
            {resolvedHeading}
          </h2>
          <p
            className="mx-auto mt-3 max-w-[42ch] text-[15px]"
            style={{ lineHeight: 1.62, color: "var(--ink-dim)" }}
          >
            {resolvedDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-[11px]">
          <a
            href={resolvedWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient gap-[9px] px-[21px] py-3 text-[14.5px]"
          >
            <WhatsappIcon />
            WhatsApp
          </a>
          <a href={`mailto:${resolvedEmail}`} className="glass-pill gap-[9px] px-[21px] py-3 text-[14.5px] font-semibold">
            <MailIcon />
            Email
          </a>
        </div>
      </div>
    </section>
  );
}
