import { CheckIcon, WhatsappIcon } from "@/components/ui/icons";
import { waLink } from "@/lib/whatsapp";
import type { ServicePackage } from "@/content/services";

interface PackageCardProps {
  pkg: ServicePackage;
  whatsappUrl: string;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-semibold" style={{ color: "var(--ink-faint)" }}>
        {label}
      </dt>
      <dd style={{ color: "var(--ink-dim)" }}>{value}</dd>
    </div>
  );
}

export function PackageCard({ pkg, whatsappUrl }: PackageCardProps) {
  const wa = waLink(whatsappUrl, `Halo, saya tertarik dengan paket "${pkg.name}". Boleh minta info lebih lanjut?`);
  const hasMeta = pkg.timeline || pkg.revisions || pkg.suitableFor;

  return (
    <div
      className="glass-card flex flex-col p-6"
      style={pkg.isPopular ? { boxShadow: "0 0 0 1.5px var(--accent), var(--glass-sh)" } : undefined}
    >
      <div className="relative z-[2] flex flex-1 flex-col">
        {pkg.isPopular && (
          <span
            className="badge mb-3 self-start"
            style={{ background: "var(--chip)", borderColor: "var(--chip-brd)", color: "var(--accent-ink)" }}
          >
            Paling populer
          </span>
        )}

        <h3 className="text-[19px] font-bold" style={{ letterSpacing: "-0.02em" }}>
          {pkg.name}
        </h3>
        {pkg.tagline && (
          <p className="mt-1.5 text-[13.5px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
            {pkg.tagline}
          </p>
        )}

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-[24px] font-bold" style={{ letterSpacing: "-0.02em" }}>
            {pkg.priceLabel}
          </span>
          {pkg.billingSuffix && (
            <span className="text-[13px]" style={{ color: "var(--ink-faint)" }}>
              {pkg.billingSuffix}
            </span>
          )}
        </div>

        {pkg.includes.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {pkg.includes.map((item, i) => (
              <li key={i} className="flex gap-2 text-[13.5px]" style={{ lineHeight: 1.5, color: "var(--ink-dim)" }}>
                <CheckIcon className="mt-0.5 shrink-0" style={{ color: "var(--accent-ink)" }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {hasMeta && (
          <dl
            className="mt-4 flex flex-col gap-1.5 border-t pt-4 text-[12.5px]"
            style={{ borderColor: "var(--border)" }}
          >
            {pkg.timeline && <MetaRow label="Estimasi" value={pkg.timeline} />}
            {pkg.revisions && <MetaRow label="Revisi" value={pkg.revisions} />}
            {pkg.suitableFor && <MetaRow label="Cocok untuk" value={pkg.suitableFor} />}
          </dl>
        )}

        <div className="mt-auto pt-6">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient w-full justify-center gap-2 py-2.5 text-[13.5px]"
          >
            <WhatsappIcon width={15} height={15} />
            Konsultasi paket ini
          </a>
        </div>
      </div>
    </div>
  );
}
