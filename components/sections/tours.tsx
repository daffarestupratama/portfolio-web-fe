import Link from "next/link";
import type { TourPackage } from "@/content/home";
import { TourCard } from "@/components/cards/tour-card";
import { ArrowRightIcon } from "@/components/ui/icons";

interface ToursProps {
  tours: TourPackage[];
}

export function Tours({ tours }: ToursProps) {
  return (
    <section className="relative z-[3] flex justify-center px-[22px] pt-[46px] pb-2.5">
      <div className="w-full max-w-[1180px]">
        <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-bold" style={{ fontSize: "clamp(26px,3vw,38px)", letterSpacing: "-0.03em" }}>
            Walking tours
          </h2>
          <Link href="/tours" className="glass-pill gap-[7px] px-[17px] py-[9px] text-[13.5px] font-semibold">
            All tours
            <ArrowRightIcon />
          </Link>
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
