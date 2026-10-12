interface NavIconProps {
  d: string;
  size: number;
  className?: string;
  style?: React.CSSProperties;
}

/** 2a's single-path nav glyph: 24×24 viewBox, 1.9 stroke, round caps and joins. */
export function NavIcon({ d, size, className, style }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={d} />
    </svg>
  );
}
