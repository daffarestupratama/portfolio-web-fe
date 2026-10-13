/**
 * Contact data helpers. site-setting.contactLinks is the single source for every contact
 * surface (hero icons, contact card, /services, structured data, the terminal's contact.txt),
 * keyed by each row's `linkType` enum.
 */

/** Used only when site-setting has neither a matching contactLinks row nor the old field. */
export const CONTACT_FALLBACK = {
  email: "contact@daffarestupratama.com",
  whatsappUrl: "https://wa.me/6288233300541",
} as const;

/** Link types that are profiles of the person, i.e. valid schema.org `sameAs` targets. */
export const PROFILE_LINK_TYPES: ReadonlySet<string> = new Set([
  "linkedin",
  "github",
  "instagram",
  "kaggle",
  "tableau",
  "x",
  "tiktok",
]);

/** `mailto:a@b.c` → `a@b.c`. */
export function stripMailto(url: string): string {
  return url.replace(/^mailto:/i, "").trim();
}

/** Adds the scheme to a bare host such as `wa.me/62…`. */
export function withHttps(url: string): string {
  const trimmed = url.trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
