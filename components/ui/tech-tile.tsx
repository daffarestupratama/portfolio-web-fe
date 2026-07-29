"use client";

import { useState } from "react";
import { StrapiImage } from "@/components/ui/strapi-image";
import { titleCase } from "@/lib/mappers";
import type { MappedImage } from "@/content/home";

/** The minimum a tile needs — satisfied by both `Technology` and the about-page `Skill`. */
export interface TileItem {
  name: string;
  logo: MappedImage | null;
  /** Optional; when present it's appended to the tooltip/label ("Python · Advanced"). */
  level?: string;
}

function TextChip({ label }: { label: string }) {
  return (
    <span className="chip mono px-[9px] py-1 text-[11px]" style={{ borderRadius: 8 }}>
      {label}
    </span>
  );
}

interface TechTileProps {
  item: TileItem;
  /** Square edge length in px. */
  size: number;
}

/** A technology as a uniform square logo tile. The name (plus level when given) is always
 *  exposed via aria-label, and shown visually on hover, keyboard focus, or tap. Skills
 *  without a logo degrade to the existing text chip so nothing is dropped. */
export function TechTile({ item, size }: TechTileProps) {
  const [open, setOpen] = useState(false);
  const label = item.level ? `${item.name} · ${titleCase(item.level)}` : item.name;

  if (!item.logo) return <TextChip label={item.name} />;

  return (
    <button
      type="button"
      // Tap toggles the label; this is a button (not a link) so it never navigates.
      onClick={() => setOpen((v) => !v)}
      onBlur={() => setOpen(false)}
      data-open={open || undefined}
      aria-label={label}
      className="tech-tile"
      // Padding in px (not %) so it scales with the tile instead of the container.
      style={{ width: size, height: size, padding: Math.round(size * 0.18) }}
    >
      <StrapiImage
        src={item.logo.url}
        alt=""
        width={item.logo.width}
        height={item.logo.height}
        // object-contain + padding: any aspect ratio fits without cropping or distortion.
        className="tech-tile-img"
        fallback={<span className="mono text-[9px] leading-none">{item.name.slice(0, 2).toUpperCase()}</span>}
      />
      <span className="tech-tile-label mono" aria-hidden="true">
        {label}
      </span>
    </button>
  );
}

interface TechTileRowProps {
  items: TileItem[];
  size?: number;
  /** Visible tile cap; the remainder collapses into a "+N" tile. */
  max?: number;
}

export function TechTileRow({ items, size = 44, max = Number.POSITIVE_INFINITY }: TechTileRowProps) {
  if (items.length === 0) return null;
  const visible = items.slice(0, max);
  const hidden = items.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visible.map((item) => (
        <TechTile key={item.name} item={item} size={size} />
      ))}
      {hidden > 0 && (
        <span
          className="tech-tile-more mono"
          style={{ width: size, height: size }}
          aria-label={`${hidden} more ${hidden === 1 ? "technology" : "technologies"}: ${items
            .slice(max)
            .map((i) => i.name)
            .join(", ")}`}
        >
          +{hidden}
        </span>
      )}
    </div>
  );
}
