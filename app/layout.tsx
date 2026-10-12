import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Terraces } from "@/components/layout/terraces";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { RouteProgress } from "@/components/layout/route-progress";
import { NmReveal } from "@/components/layout/nm-reveal";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata, FALLBACK_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";
import "../styles/globals.css";

// The same faces and weights Portfolio 2a loads from Google Fonts, self-hosted by next/font.
// 2a's stacks are `Inter, system-ui, sans-serif` and `'JetBrains Mono', monospace`. next/font's
// default metric-matched fallback face is built on Arial, which would also catch every glyph the
// subset lacks (← → ↗ in the mono labels) and draw it differently from 2a, so the automatic
// fallback is off and 2a's own fallback lists are used instead.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  adjustFontFallback: false,
  fallback: ["monospace"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const base = buildPageMetadata({ path: "", defaultSeo: site.defaultSeo });
  const siteName = site.siteName || SITE_NAME;
  return {
    ...base,
    metadataBase: new URL(SITE_URL),
    title: {
      default: site.defaultSeo.metaTitle || FALLBACK_TITLE,
      template: `%s · ${siteName}`,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <RouteProgress />
          <NmReveal />
          {/* `overflow-x: clip`, NOT `hidden`. `overflow-x: hidden` forces the computed
              `overflow-y` to `auto`, which turns this wrapper into a scroll container —
              and `position: sticky` then resolves against this non-scrolling box instead
              of the viewport, so every sticky element on the site (the nav included)
              silently stops working. `clip` still contains the terraces, which overhang
              the page edges, without creating a scroll container. */}
          <div
            className="relative min-h-screen overflow-x-clip"
            style={{ background: "var(--bg)", color: "var(--ink)", transition: "background .4s, color .4s" }}
          >
            <Terraces />
            <Nav />
            {/* 2a lifts all content above the terraces layer (z 0) in one z-3 stack, so
                page markup never has to opt in itself. */}
            <div className="relative z-[3]">
              {children}
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
