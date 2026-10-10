import type { CSSProperties } from "react";

type Variant = "project" | "tour" | "article";

const gradients: Record<Variant, string> = {
  project:
    "linear-gradient(135deg, color-mix(in srgb, var(--accent) 26%, var(--bg)), color-mix(in srgb, var(--accent-b) 22%, var(--bg)))",
  tour: "linear-gradient(150deg, color-mix(in srgb, var(--accent-b) 30%, var(--bg)), color-mix(in srgb, var(--accent-2) 24%, var(--bg)))",
  article:
    "linear-gradient(135deg, color-mix(in srgb, var(--accent-2) 26%, var(--bg)), color-mix(in srgb, var(--accent) 22%, var(--bg)))",
};

interface MediaPlaceholderProps {
  variant: Variant;
  label: string;
  className?: string;
  style?: CSSProperties;
}

/** Stand-in for a missing or broken Strapi image: a soft two-token gradient. */
export function MediaPlaceholder({ variant, label, className, style }: MediaPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={className}
      style={{
        background: gradients[variant],
        borderRadius: 15,
        ...style,
      }}
    />
  );
}
