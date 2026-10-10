import { CheckIcon } from "@/components/ui/icons";
import { waLink } from "@/lib/whatsapp";
import type { ServicePackage } from "@/content/services";

interface PackageCardProps {
  pkg: ServicePackage;
  whatsappUrl: string;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="sv-pk-meta-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** Portfolio 2a's package card (packages, bundles, maintenance). The popular one gets the
 *  accent-b ring, the badge and the filled CTA. */
export function PackageCard({ pkg, whatsappUrl }: PackageCardProps) {
  const wa = waLink(whatsappUrl, `Halo, saya tertarik dengan paket "${pkg.name}". Boleh minta info lebih lanjut?`);
  const hasMeta = pkg.timeline || pkg.revisions || pkg.suitableFor;

  return (
    <div className="sv-pk" data-popular={pkg.isPopular || undefined}>
      {pkg.isPopular && <span className="sv-pk-badge">Paling populer</span>}

      <h3 className="sv-pk-name">{pkg.name}</h3>
      {pkg.tagline && <p className="sv-pk-tag">{pkg.tagline}</p>}

      <div className="sv-pk-price">
        <span className="sv-pk-amount">{pkg.priceLabel}</span>
        {pkg.billingSuffix && <span className="sv-pk-suffix">{pkg.billingSuffix}</span>}
      </div>

      {pkg.includes.length > 0 && (
        <ul className="sv-pk-list">
          {pkg.includes.map((item, i) => (
            <li key={i}>
              <CheckIcon width={16} height={16} strokeWidth={2.4} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {hasMeta && (
        <>
          <div className="sv-pk-rule" aria-hidden="true" />
          <dl className="sv-pk-meta">
            {pkg.timeline && <MetaRow label="Estimasi" value={pkg.timeline} />}
            {pkg.revisions && <MetaRow label="Revisi" value={pkg.revisions} />}
            {pkg.suitableFor && <MetaRow label="Cocok untuk" value={pkg.suitableFor} />}
          </dl>
        </>
      )}

      <div className="sv-pk-cta-wrap">
        <a href={wa} target="_blank" rel="noopener noreferrer" className="sv-pk-cta">
          Konsultasi paket ini
        </a>
      </div>
    </div>
  );
}
