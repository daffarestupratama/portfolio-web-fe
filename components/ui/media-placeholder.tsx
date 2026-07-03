import type { CSSProperties } from "react";

type Variant = "project" | "tour" | "article";

const gradients: Record<Variant, string> = {
  project:
    "linear-gradient(135deg, color-mix(in srgb, var(--accent) 26%, var(--surface)), color-mix(in srgb, var(--green) 22%, var(--surface)))",
  tour: "linear-gradient(150deg, color-mix(in srgb, var(--green) 30%, var(--surface)), color-mix(in srgb, var(--teal) 24%, var(--surface)))",
  article:
    "linear-gradient(135deg, color-mix(in srgb, var(--teal) 26%, var(--surface)), color-mix(in srgb, var(--sky) 22%, var(--surface)))",
};

interface MediaPlaceholderProps {
  variant: Variant;
  label: string;
  className?: string;
  style?: CSSProperties;
}

/** Stand-in for a Strapi cover image (§3 of the plan — real next/image swap lands in step 3). */
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
