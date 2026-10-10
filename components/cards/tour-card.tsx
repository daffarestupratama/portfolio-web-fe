import Link from "next/link";
import type { TourPackage } from "@/content/home";
import { CoverImage } from "@/components/ui/cover-image";
import { ArrowRightIcon, ClockIcon, MapPinIcon } from "@/components/ui/icons";

interface TourCardProps {
  tour: TourPackage;
}

/** Tour package card. Not in Portfolio 2a: a raised card with an inset cover well, an inset
 *  price box, inset meta chips and the accent button, lifting on hover like 2a's cards. */
export function TourCard({ tour }: TourCardProps) {
  return (
    <div className="tc">
      <div className="tc-cover-well">
        <CoverImage
          image={tour.coverImage}
          variant="tour"
          label={`${tour.title} photo`}
          className="tc-cover"
          sizes="(max-width: 768px) 100vw, 560px"
        />
      </div>

      <div className="tc-body">
        <div className="tc-top">
          <h3 className="tc-title">
            <Link href={`/tours/${tour.slug}`}>{tour.title}</Link>
          </h3>
          <span className="tc-price">
            <span className="tc-from">from</span>
            <span className="tc-amount">{tour.price}</span>
          </span>
        </div>

        <p className="tc-desc">{tour.shortDescription}</p>

        <div className="tc-chips">
          <span className="tc-chip mono">
            <MapPinIcon />
            {tour.route}
          </span>
          <span className="tc-chip mono">
            <ClockIcon />
            {tour.duration}
          </span>
        </div>

        <div className="tc-foot">
          {tour.groupSize && <span className="tc-group">{tour.groupSize}</span>}
          <Link href={`/tours/${tour.slug}`} className="nm-btn-accent tc-btn">
            Detail
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
