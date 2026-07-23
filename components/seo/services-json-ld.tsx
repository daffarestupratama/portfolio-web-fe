import { SITE_URL } from "@/lib/seo";
import type { ServiceFaq, ServicePackage } from "@/content/services";

interface ServicesJsonLdProps {
  /** All offered packages (base + bundles + maintenance), for the OfferCatalog. */
  packages: ServicePackage[];
  faqs: ServiceFaq[];
  providerName: string;
}

/** Service + OfferCatalog (packages as Offers) + FAQPage structured data for /services. */
export function ServicesJsonLd({ packages, faqs, providerName }: ServicesJsonLdProps) {
  const offers = packages
    .filter((p) => p.price != null)
    .map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: String(p.price),
      priceCurrency: p.currency,
      ...(p.tagline ? { description: p.tagline } : {}),
    }));

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Service",
      "@id": `${SITE_URL}/services#service`,
      name: "Jasa Pembuatan Website & Sistem Informasi",
      serviceType: "Web development",
      provider: { "@type": "Person", name: providerName, url: SITE_URL },
      areaServed: "ID",
      ...(offers.length > 0
        ? { hasOfferCatalog: { "@type": "OfferCatalog", name: "Paket & Layanan", itemListElement: offers } }
        : {}),
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${SITE_URL}/services#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      // Structured data is static, server-rendered JSON — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
