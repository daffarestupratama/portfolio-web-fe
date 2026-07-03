"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

const emptySubscribe = () => () => {};

/** True once hydrated on the client — avoids a server/client mismatch on first render. */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="glass-icon-btn flex h-10 w-10 shrink-0"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
