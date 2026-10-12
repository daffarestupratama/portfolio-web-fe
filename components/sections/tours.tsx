import type { TourPackage } from "@/content/home";
import { TourCard } from "@/components/cards/tour-card";
import { SectionHeader } from "@/components/sections/section-header";

interface ToursProps {
  tours: TourPackage[];
}

/** Homepage tours (only while FEATURES.tours is on): 2a's section heading row over the
 *  tour cards, the same recipe the other homepage sections use. */
export function Tours({ tours }: ToursProps) {
  return (
    <section className="home-sec">
      <div className="home-sec-inner">
        <SectionHeader title="Walking tours" href="/tours" linkLabel="All tours" />
        <div className="tr-grid tr-grid-home">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
}
