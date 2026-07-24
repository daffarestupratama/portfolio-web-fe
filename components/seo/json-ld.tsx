import { JOB_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";

/** Inline a schema.org graph/node as a server-rendered JSON-LD script. */
function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is static, server-rendered JSON — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  /** Route path ("" for home, "/projects", "/projects/{slug}"). */
  path: string;
}

/** BreadcrumbList for detail pages — items resolve to absolute SITE_URL routes. */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.path}`,
        })),
      }}
    />
  );
}

interface ArticleJsonLdProps {
  headline: string;
  description: string;
  imageUrl: string | null;
  datePublished: string;
  dateModified: string;
  authorName: string;
  /** Route path, e.g. "/articles/{slug}". */
  path: string;
}

/** BlogPosting structured data for an article detail page. */
export function ArticleJsonLd({
  headline,
  description,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  path,
}: ArticleJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline,
        description,
        ...(imageUrl ? { image: imageUrl } : {}),
        datePublished,
        dateModified,
        author: { "@type": "Person", name: authorName, url: SITE_URL },
        publisher: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
      }}
    />
  );
}

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
