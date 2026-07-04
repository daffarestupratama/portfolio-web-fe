import { JOB_TITLE, SITE_URL } from "@/lib/seo";

interface HomeJsonLdProps {
  fullName: string;
  siteName: string;
  /** Social/profile URLs for schema.org `sameAs`. */
  sameAs: string[];
}

/** Person + WebSite structured data for the homepage. */
export function HomeJsonLd({ fullName, siteName, sameAs }: HomeJsonLdProps) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: fullName,
        url: SITE_URL,
        jobTitle: JOB_TITLE,
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: siteName,
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#person` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Structured data is static, server-rendered JSON — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
