import { getSiteSettings } from "@/content/site";
import { SITE_NAME } from "@/lib/seo";

/** 2a's tagline, shown when site-setting.footerText is empty. */
const FOOTER_TAGLINE = "Data · Business · Finance · Maps · Technology";

/**
 * 2a's footer: an inset bar. The name and the tagline (site-setting.footerText) come from the
 * same cached site-settings read the root layout's metadata already makes, so this adds no
 * request. The year is taken at render time, which under ISR means the last build or
 * revalidation.
 */
export async function Footer() {
  const site = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative z-[3] flex justify-center"
      style={{ padding: "36px clamp(16px,4vw,40px) 44px" }}
    >
      <div
        className="flex w-full max-w-[1180px] flex-wrap items-center justify-between"
        style={{
          gap: "8px 16px",
          padding: "18px 24px",
          borderRadius: 22,
          boxShadow: "var(--in-sm)",
          fontSize: 13.5,
          color: "var(--ink-faint)",
        }}
      >
        <span>
          © {year} {site.siteName || SITE_NAME}
        </span>
        <span>{site.footerText || FOOTER_TAGLINE}</span>
      </div>
    </footer>
  );
}
