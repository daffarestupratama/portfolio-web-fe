import { MailIcon } from "@/components/ui/icons";

// Hardcoded fallbacks — used only when site-setting leaves the field empty.
const FALLBACK_EMAIL = "contact@daffa.me";
const FALLBACK_WHATSAPP_URL = "https://wa.me/6288233300541";

interface ContactCTAProps {
  /** From site-setting via getSiteSettings() — CMS-editable. */
  email?: string | null;
  whatsappUrl?: string | null;
}

function WhatsappGlyph() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.42 1.31-1.95 1.35-.5.05-1.13.24-3.66-.77-3.09-1.22-5.05-4.37-5.2-4.57-.15-.2-1.24-1.65-1.24-3.15s.79-2.24 1.07-2.54c.28-.3.61-.38.81-.38.2 0 .41 0 .58.01.19.01.44-.07.69.53.24.6.83 2.07.9 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12.99 2.07 1.3 2.37 1.45.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.22.57.35.07.13.07.73-.17 1.41z" />
    </svg>
  );
}

export function ContactCTA({ email, whatsappUrl }: ContactCTAProps) {
  const resolvedEmail = email || FALLBACK_EMAIL;
  const resolvedWhatsapp = whatsappUrl || FALLBACK_WHATSAPP_URL;

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
            Let&apos;s work together
          </h2>
          <p
            className="mx-auto mt-3 max-w-[42ch] text-[15px]"
            style={{ lineHeight: 1.62, color: "var(--ink-dim)" }}
          >
            Have a project, a dataset, or a city you&apos;d like to explore on foot? I&apos;m happy to talk — reach out
            and I&apos;ll get back to you.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-[11px]">
          <a
            href={resolvedWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient gap-[9px] px-[21px] py-3 text-[14.5px]"
          >
            <WhatsappGlyph />
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
