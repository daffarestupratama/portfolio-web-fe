"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const EDGE_PAD = 8;
const GAP = 8;

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
 *  exposed via aria-label, and shown visually on hover, keyboard focus, or tap.
 *
 *  The label is PORTALLED to document.body with fixed positioning: `.glass-card` sets both
 *  `overflow:hidden` and `backdrop-filter`, and backdrop-filter makes the card a containing
 *  block even for fixed-position descendants — so an in-card tooltip gets clipped at the
 *  card edge (the same trap the gallery lightbox hit). */
export function TechTile({ item, size }: TechTileProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  /** Pointer type of the most recent press, so click-toggle only applies to touch/pen. */
  const lastPointer = useRef<string>("mouse");
  const label = item.level ? `${item.name} · ${titleCase(item.level)}` : item.name;

  const place = useCallback(() => {
    const tile = btnRef.current;
    if (!tile) return;
    const r = tile.getBoundingClientRect();
    const lw = labelRef.current?.offsetWidth ?? 120;
    const lh = labelRef.current?.offsetHeight ?? 22;
    const half = lw / 2;
    // Clamp horizontally so an edge tile's label stays fully on screen.
    const centre = r.left + r.width / 2;
    const left = Math.min(Math.max(centre, EDGE_PAD + half), Math.max(EDGE_PAD + half, window.innerWidth - EDGE_PAD - half));
    // Prefer above the tile; flip below when there isn't room.
    const above = r.top - GAP - lh;
    setPos({ left, top: above < EDGE_PAD ? r.bottom + GAP : above });
  }, []);

  // Layout effect: measure + position before paint, so the label never flashes misplaced
  // (a stale `pos` from a previous reveal is corrected here before anything is painted).
  useLayoutEffect(() => {
    if (visible) place();
  }, [visible, place]);

  useEffect(() => {
    if (!visible) return;
    // capture:true so scrolling in any ancestor (not just the window) repositions.
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [visible, place]);

  if (!item.logo) return <TextChip label={item.name} />;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        // Pointer-type aware: on touch, Chrome fires compatibility mouseenter AFTER
        // pointerdown, so treating a tap as hover+click would toggle the label straight
        // back off. Hover reveal is therefore mouse-only, and tap-toggle touch-only.
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setVisible(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setVisible(false);
        }}
        // Tap toggles the label; this is a button (not a link) so it never navigates.
        onClick={() => {
          if (lastPointer.current !== "mouse") setVisible((v) => !v);
        }}
        // Only *keyboard* focus reveals the label. A tap also focuses the button, and an
        // unconditional show here would immediately be toggled back off by the click that
        // follows — making the first tap appear to do nothing.
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) setVisible(true);
        }}
        onBlur={() => setVisible(false)}
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
      </button>

      {/* No mount guard needed: `visible` only becomes true from an event handler, so the
          portal never exists during SSR/hydration. */}
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            ref={labelRef}
            className="tech-tile-label mono"
            aria-hidden="true"
            style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, opacity: pos ? 1 : 0 }}
          >
            {label}
          </span>,
          document.body,
        )}
    </>
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
