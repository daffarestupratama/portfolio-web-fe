import { SITE_URL } from "@/lib/seo";
import { toSingleLine } from "@/lib/plain-text";
import { serializeJsonLd } from "@/components/seo/json-ld";
import type { ServiceFaq, ServicePackage } from "@/content/services";

interface ServicesJsonLdProps {
  /** All offered packages (base + bundles + maintenance), for the OfferCatalog. */
  packages: ServicePackage[];
  faqs: ServiceFaq[];
  providerName: string;
}

/** UN/CEFACT unit codes for recurring billing (schema.org's recommended `unitCode` values). */
const BILLING_UNIT: Record<string, string> = { monthly: "MON", yearly: "ANN" };

/**
 * The Offer's price properties. A fixed one-off price sits on the Offer itself; a "starts from"
 * price is a PriceSpecification `minPrice`, and recurring billing is a UnitPriceSpecification per
 * month or year, so neither is published as a fixed one-off price.
 */
function offerPrice(p: ServicePackage & { price: number }): Record<string, unknown> {
  const unitCode = BILLING_UNIT[p.billing];
  const startsFrom = p.priceQualifier === "starts_from";
  if (!unitCode && !startsFrom) return { price: String(p.price), priceCurrency: p.currency };
  return {
    priceSpecification: {
      "@type": unitCode ? "UnitPriceSpecification" : "PriceSpecification",
      [startsFrom ? "minPrice" : "price"]: p.price,
      priceCurrency: p.currency,
      ...(unitCode ? { referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode } } : {}),
    },
  };
}

/** Service + OfferCatalog (packages as Offers) + FAQPage structured data for /services. */
export function ServicesJsonLd({ packages, faqs, providerName }: ServicesJsonLdProps) {
  const offers = packages
    .filter((p): p is ServicePackage & { price: number } => p.price != null)
    .map((p) => ({
      "@type": "Offer",
      name: p.name,
      ...offerPrice(p),
      ...(p.tagline ? { description: toSingleLine(p.tagline) } : {}),
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
        acceptedAnswer: { "@type": "Answer", text: toSingleLine(f.answer) },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      // Escaped by serializeJsonLd, so CMS text can never break out of the script.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
