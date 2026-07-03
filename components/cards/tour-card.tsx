"use client";

import { useTilt } from "@/hooks/use-tilt";
import type { TourPackage } from "@/content/home";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { ArrowRightIcon, ClockIcon, MapPinIcon } from "@/components/ui/icons";

interface TourCardProps {
  tour: TourPackage;
}

export function TourCard({ tour }: TourCardProps) {
  const ref = useTilt<HTMLDivElement>();

  return (
    <div ref={ref} data-tilt className="glass-card flex flex-col gap-4 p-[15px] sm:flex-row">
      <MediaPlaceholder
        variant="tour"
        label={`${tour.title} photo`}
        className="relative z-[2] aspect-[16/9] w-full shrink-0 sm:aspect-auto sm:w-[150px] sm:min-h-[210px]"
      />

      <div className="relative z-[2] flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="m-0 text-lg font-bold" style={{ letterSpacing: "-0.025em" }}>
            {tour.title}
          </h3>
          <span
            className="flex shrink-0 flex-col items-end px-3 py-2"
            style={{ borderRadius: 14, background: "var(--chip)", border: "1px solid var(--chip-brd)" }}
          >
            <span className="text-[10.5px]" style={{ color: "var(--ink-faint)" }}>
              from
            </span>
            <span className="text-base font-bold" style={{ color: "var(--accent-ink)", letterSpacing: "-0.02em" }}>
              {tour.price}
            </span>
          </span>
        </div>

        <p className="mt-2 text-[13px]" style={{ lineHeight: 1.5, color: "var(--ink-dim)" }}>
          {tour.shortDescription}
        </p>

        <div className="mt-[13px] flex flex-wrap gap-[7px]">
          <span className="chip rounded-full px-2.5 py-1.5 text-xs">
            <MapPinIcon />
            {tour.route}
          </span>
          <span className="chip rounded-full px-2.5 py-1.5 text-xs">
            <ClockIcon />
            {tour.duration}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2.5 pt-3.5">
          {tour.groupSize && (
            <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
              {tour.groupSize}
            </span>
          )}
          <a href={`/tours/${tour.slug}`} className="btn-gradient ml-auto gap-[7px] px-[18px] py-[9px] text-[13.5px]">
            Book
            <ArrowRightIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
