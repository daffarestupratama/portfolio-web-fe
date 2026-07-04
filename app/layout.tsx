import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { getSiteSettings } from "@/content/site";
import { buildMetadata, FALLBACK_TITLE, SITE_URL } from "@/lib/seo";
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
  const base = buildMetadata(site.defaultSeo);
  const siteName = site.siteName || "Daffa Ilham Restupratama";
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
