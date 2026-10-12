"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * next-themes renders an inline <script> that sets the theme before first paint. That only
 * matters in the server HTML: a script created by a client render never executes, and React 19
 * warns about it ("Encountered a script tag while rendering React component"), which happens
 * whenever the root re-renders on the client (e.g. after a failed fetch). On the client the
 * script is therefore marked as a data block (not executable, so React stays quiet); the
 * server-rendered one stays a normal script. The element carries suppressHydrationWarning, so
 * the differing `type` attribute does not trip hydration either.
 */
const CLIENT_SCRIPT_PROPS = typeof window === "undefined" ? undefined : { type: "application/json" };

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      scriptProps={CLIENT_SCRIPT_PROPS}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
