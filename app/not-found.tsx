import type { Metadata } from "next";
import Link from "next/link";
import { notFoundMetadata } from "@/lib/seo";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = notFoundMetadata();

export default function NotFound() {
  return (
    <main className="relative z-[3] mx-auto flex w-full max-w-[560px] flex-col items-center px-[22px] pt-40 pb-24 text-center sm:pt-48">
      <span className="mono text-[13px]" style={{ color: "var(--accent-ink)" }}>
        404
      </span>
      <h1 className="mt-3 font-bold" style={{ fontSize: "clamp(28px,4vw,42px)", letterSpacing: "-0.03em" }}>
        Page not found
      </h1>
      <p className="mt-4 max-w-[42ch] text-[15px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/" className="btn-gradient mt-7 gap-2 px-[21px] py-3 text-[14px]">
        Back to home
        <ArrowRightIcon />
      </Link>
    </main>
  );
}
