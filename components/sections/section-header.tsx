import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

interface SectionHeaderProps {
  title: string;
  href: string;
  linkLabel: string;
}

/** 2a's section heading row: the h2 on the left, a raised "All …" pill on the right. */
export function SectionHeader({ title, href, linkLabel }: SectionHeaderProps) {
  return (
    <div className="sec-head">
      <h2 className="sec-title">{title}</h2>
      <Link href={href} className="sec-link">
        {linkLabel}
        <ArrowRightIcon width={15} height={15} />
      </Link>
    </div>
  );
}
