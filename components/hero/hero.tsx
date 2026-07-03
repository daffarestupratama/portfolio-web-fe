import Link from "next/link";
import type { HomePage } from "@/content/home";
import { HeroGraph } from "./hero-graph";
import { FileTextIcon, UserIcon, LinkedinIcon, GithubIcon, InstagramIcon, MailIcon } from "@/components/ui/icons";

const contactIcons = {
  linkedin: LinkedinIcon,
  github: GithubIcon,
  instagram: InstagramIcon,
  email: MailIcon,
};

interface HeroProps {
  home: HomePage;
}

export function Hero({ home }: HeroProps) {
  return (
    <header className="relative z-[3] flex justify-center px-[22px] pt-24 pb-[34px] sm:pt-28 lg:pt-[132px]">
      <div className="grid w-full max-w-[1180px] grid-cols-1 items-center gap-11 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div
            className="inline-flex items-center gap-[9px] rounded-full px-[15px] py-[7px] text-[12.5px] font-medium"
            style={{
              background: "var(--glass-bg)",
              backgroundImage: "var(--glass-tint)",
              backdropFilter: "blur(var(--glass-blur)) saturate(180%)",
              border: "1px solid var(--glass-brd)",
              boxShadow: "inset 0 1px 0 var(--glass-hi)",
              color: "var(--ink-dim)",
            }}
          >
            <span
              aria-hidden="true"
              className="h-[7px] w-[7px] shrink-0 rounded-full"
              style={{ background: "var(--accent)", boxShadow: "0 0 0 4px var(--chip)" }}
            />
            {home.eyebrow}
          </div>

          <h1
            className="mt-5 font-bold"
            style={{ fontSize: "clamp(34px,4.7vw,60px)", lineHeight: 1.03, letterSpacing: "-0.04em" }}
          >
            {home.headline}
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(120deg, var(--accent-ink), var(--accent) 42%, var(--green))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {home.fullName}
            </span>
          </h1>

          <p
            className="mt-5 max-w-[31em] font-normal"
            style={{ fontSize: "clamp(15px,1.5vw,17.5px)", lineHeight: 1.62, color: "var(--ink-dim)" }}
          >
            {home.subheadline}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-[11px]">
            <Link href={home.heroCtaPrimary.url} className="btn-gradient gap-[9px] px-[21px] py-3 text-[14.5px]">
              <FileTextIcon />
              {home.heroCtaPrimary.label}
            </Link>
            <Link
              href={home.heroCtaSecondary.url}
              className="glass-pill gap-[9px] px-[21px] py-3 text-[14.5px] font-semibold"
            >
              <UserIcon />
              {home.heroCtaSecondary.label}
            </Link>
            <span aria-hidden="true" className="mx-0.5 h-[26px] w-px shrink-0" style={{ background: "var(--border)" }} />
            {home.contactLinks.map((link) => {
              const Icon = contactIcons[link.icon];
              return (
                <a
                  key={link.icon}
                  href={link.url}
                  aria-label={link.label}
                  className="glass-icon-btn h-[42px] w-[42px] shrink-0"
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>

        <div
          className="relative p-[18px]"
          style={{
            borderRadius: 26,
            background: "var(--card-bg)",
            backgroundImage: "var(--card-tint)",
            backdropFilter: "blur(var(--glass-blur)) saturate(150%)",
            border: "1px solid var(--glass-brd)",
            boxShadow: "var(--glass-sh-lg), inset 0 1px 0 var(--card-hi), inset 0 -10px 30px -16px rgba(27,46,51,0.10)",
            animation: "floaty var(--float) ease-in-out infinite",
            animationPlayState: "var(--float-play)",
          }}
        >
          <div className="pointer-events-none absolute top-4 right-[18px] left-[18px] z-[3] flex items-center justify-between">
            <span className="mono text-[11px] tracking-wide uppercase" style={{ color: "var(--ink-faint)" }}>
              network.graph
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: "var(--ink-faint)" }}>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }}
              />
              live
            </span>
          </div>

          <HeroGraph />

          <div className="relative z-[3] mt-3.5 flex gap-2 px-0.5">
            {home.heroStats.map((stat) => (
              <div
                key={stat.label}
                className="flex-1 px-3 py-2.5"
                style={{ borderRadius: 13, background: "var(--glass-bg-2)", border: "1px solid var(--glass-brd)" }}
              >
                <div className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
                  {stat.label}
                </div>
                <div className="mt-0.5 text-[17px] font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
