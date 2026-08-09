import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { RouteProgress } from "@/components/layout/route-progress";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata, FALLBACK_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
          {/* `overflow-x: clip`, NOT `hidden`. `overflow-x: hidden` forces the computed
              `overflow-y` to `auto`, which turns this wrapper into a scroll container —
              and `position: sticky` then resolves against this non-scrolling box instead
              of the viewport, so every sticky element on the site silently stops working.
              `clip` still contains the ambient background blobs (they overhang the
              viewport) without creating a scroll container. */}
          <div
            className="relative min-h-screen overflow-x-clip"
            style={{ background: "var(--bg)", color: "var(--ink)" }}
          >
            <AmbientBackground />
            <Nav />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
