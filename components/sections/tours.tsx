import type { TourPackage } from "@/content/home";
import { TourCard } from "@/components/cards/tour-card";

interface ToursProps {
  tours: TourPackage[];
}

export function Tours({ tours }: ToursProps) {
  return (
    <section className="relative z-[3] flex justify-center px-[22px] pt-[46px] pb-2.5">
      <div className="w-full max-w-[1180px]">
        <div className="mb-[22px]">
          <div className="mono text-xs tracking-[0.14em] uppercase" style={{ color: "var(--accent-ink)" }}>
            03 — On foot
          </div>
          <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(26px,3vw,38px)", letterSpacing: "-0.03em" }}>
            Walking tours
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
}
