"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import type { Command, CommandContext, TermApp, TermEnv, TermLine, TermSegment } from "./terminal-types";
import { createFileSystem, isHidden } from "./filesystem";
import { buildRegistry } from "./registry";
import { builtinCommands } from "./commands";
import { plain, rich, textLines } from "./lines";
import { buildBootLines, BOOT_READY_ANNOUNCEMENT } from "./motd";
import { closestMatch, commonPrefix } from "./util";
import { HOME, HOST, SITE_LAUNCHED_AT, STACK, STORAGE_KEYS, tildePath, USER } from "./config";

export interface ContentCounts {
  projects: number;
  articles: number;
  tours: number;
}

const BOOT_LINE_MS = 55;
const MAX_HISTORY = 100;

function promptSegments(cwd: string): TermSegment[] {
  return [
    { text: `${USER}@${HOST}`, tone: "green" },
    { text: ":", tone: "dim" },
    { text: tildePath(cwd), tone: "accent" },
    { text: "$ ", tone: "fg" },
  ];
}

interface UseTerminalArgs {
  counts: ContentCounts;
  /** CMS commands (already built into runnable Commands); merged after built-ins. */
  cmsCommands: Command[];
  // DOM refs are owned by the component and passed in — a hook must not *return*
  // refs (reading them off the returned object counts as ref-access during render).
  inputRef: RefObject<HTMLInputElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export function useTerminal({ counts, cmsCommands, inputRef, scrollRef }: UseTerminalArgs) {
  const router = useRouter();
  const fs = useMemo(() => createFileSystem(HOME), []);
  const registry = useMemo(() => buildRegistry(builtinCommands, cmsCommands), [cmsCommands]);
  const env = useMemo<TermEnv>(
    () => ({ user: USER, host: HOST, launchedAt: SITE_LAUNCHED_AT, counts, stack: STACK }),
    [counts],
  );
  const bootLines = useMemo(() => buildBootLines(env), [env]);

  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState("");
  const [caret, setCaret] = useState(0);
  const [cwd, setCwd] = useState(HOME);
  const [activeApp, setActiveApp] = useState<TermApp | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [bootCount, setBootCount] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  // `clear` (and Ctrl+L) also hides the boot MOTD, so the screen truly blanks.
  const [bootHidden, setBootHidden] = useState(false);

  // cwdRef mirrors cwd for synchronous reads in execute(); kept in sync by setCwd
  // below (the only place cwd changes), so no render-time assignment is needed.
  const cwdRef = useRef(cwd);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number | null>(null);
  const bootTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bootDoneRef = useRef(false);

  const focusInput = useCallback(() => inputRef.current?.focus(), [inputRef]);

  // Read the caret position from the real input (source of truth). Also mirror the
  // input's horizontal scroll so the block stays aligned past the field width.
  const syncCaret = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    setCaret(el.selectionStart ?? el.value.length);
  }, [inputRef]);

  // Set the input value programmatically (history recall, tab-completion, clears)
  // and park the caret at the end — in state now, and in the DOM next frame.
  const putInput = useCallback(
    (value: string) => {
      setInput(value);
      setCaret(value.length);
      requestAnimationFrame(() => inputRef.current?.setSelectionRange(value.length, value.length));
    },
    [inputRef],
  );

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCaret(e.target.selectionStart ?? e.target.value.length);
  }, []);

  // Caret moves that don't change the value (arrows, Home/End, click, drag) surface
  // via keyup / click / the document selectionchange event.
  useEffect(() => {
    document.addEventListener("selectionchange", syncCaret);
    return () => document.removeEventListener("selectionchange", syncCaret);
  }, [syncCaret]);

  const finishBoot = useCallback(() => {
    if (bootDoneRef.current) return;
    bootDoneRef.current = true;
    if (bootTimerRef.current) clearInterval(bootTimerRef.current);
    setBootCount(bootLines.length);
    setBootDone(true);
    setAnnouncement(BOOT_READY_ANNOUNCEMENT);
    try {
      localStorage.setItem(STORAGE_KEYS.seen, "1");
    } catch {
      /* private mode — ignore */
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [bootLines.length, inputRef]);

  // Boot: animate line-by-line on first visit; instant for returning/reduced-motion.
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
      if (Array.isArray(stored)) historyRef.current = stored.filter((h) => typeof h === "string");
    } catch {
      /* ignore */
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = (() => {
      try {
        return localStorage.getItem(STORAGE_KEYS.seen) === "1";
      } catch {
        return false;
      }
    })();

    // All state updates below run inside rAF/interval callbacks (async), never
    // synchronously in the effect body — avoids cascading-render churn.
    if (reduced || seen) {
      const raf = requestAnimationFrame(() => {
        setBootCount(bootLines.length);
        finishBoot();
      });
      return () => cancelAnimationFrame(raf);
    }
    let i = 0;
    bootTimerRef.current = setInterval(() => {
      i += 1;
      setBootCount(i);
      if (i >= bootLines.length) finishBoot();
    }, BOOT_LINE_MS);
    return () => {
      if (bootTimerRef.current) clearInterval(bootTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skipBoot = useCallback(() => {
    if (!bootDoneRef.current) finishBoot();
  }, [finishBoot]);

  // Skip the boot animation on any key/click while it's still playing.
  useEffect(() => {
    if (bootDone) return;
    const skip = () => skipBoot();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [bootDone, skipBoot]);

  // Auto-scroll to newest output.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, bootCount, activeApp, input, scrollRef]);

  const persistHistory = (next: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next.slice(-MAX_HISTORY)));
    } catch {
      /* ignore */
    }
  };

  const execute = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      let pending: TermLine[] = [rich([...promptSegments(cwdRef.current), { text: raw }])];
      let cleared = false;
      // Output goes into the visible role="log" aria-live region, which announces
      // whole appended lines (commands never animate). The separate status announcer
      // carries only the one-shot boot-ready message — so nothing is double-announced.
      const push = (ls: TermLine[]) => {
        pending.push(...ls);
      };

      if (trimmed) {
        const next = [...historyRef.current, trimmed].slice(-MAX_HISTORY);
        historyRef.current = next;
        persistHistory(next);

        const [name, ...args] = trimmed.split(/\s+/);
        const cmd = registry.get(name!);
        const ctx: CommandContext = {
          args,
          raw: trimmed,
          cwd: cwdRef.current,
          setCwd: (p) => {
            cwdRef.current = p;
            setCwd(p);
          },
          fs,
          env,
          registry,
          history: historyRef.current,
          print: (text, tone) => push(textLines(text, tone)),
          printPre: (text, tone) => push(textLines(text, tone, { pre: true })),
          printRich: (ls) => push(ls),
          printError: (text) => push([plain(text, "red")]),
          clear: () => {
            cleared = true;
            pending = [];
            setBootHidden(true);
          },
          runApp: (app) => setActiveApp(app),
          navigate: (href) => window.setTimeout(() => router.push(href), 600),
        };

        if (!cmd) {
          push([plain(`command not found: ${name}`, "red")]);
          const suggestion = closestMatch(name!, registry.names());
          if (suggestion) push([plain(`Did you mean \`${suggestion}\`?`, "dim")]);
        } else {
          cmd.run(ctx);
        }
      }

      historyIndexRef.current = null;
      setLines((prev) => (cleared ? pending : [...prev, ...pending]));
    },
    [registry, fs, env, router],
  );

  const runCommand = useCallback(
    (cmd: string) => {
      putInput("");
      execute(cmd);
      focusInput();
    },
    [execute, focusInput, putInput],
  );

  const navHistory = (dir: -1 | 1) => {
    const h = historyRef.current;
    if (!h.length) return;
    let idx = historyIndexRef.current ?? h.length;
    idx = Math.min(h.length, Math.max(0, idx + dir));
    historyIndexRef.current = idx;
    putInput(idx >= h.length ? "" : h[idx]!);
  };

  const cancelLine = () => {
    const snapshot = input;
    setLines((prev) => [...prev, rich([...promptSegments(cwdRef.current), { text: `${snapshot}^C` }])]);
    putInput("");
    historyIndexRef.current = null;
  };

  const tabComplete = () => {
    const value = input;
    const hasTrailingSpace = /\s$/.test(value);
    const parts = value.split(/\s+/).filter(Boolean);
    const completingCommand = parts.length === 0 || (parts.length === 1 && !hasTrailingSpace);

    if (completingCommand) {
      const token = parts[0] ?? "";
      const cands = Array.from(new Set(registry.names().filter((n) => n.startsWith(token)))).sort();
      if (cands.length === 1) putInput(`${cands[0]} `);
      else if (cands.length > 1) {
        setLines((prev) => [...prev, plain(cands.join("  "), "dim")]);
        const prefix = commonPrefix(cands);
        if (prefix.length > token.length) putInput(prefix);
      }
      return;
    }

    const token = hasTrailingSpace ? "" : parts[parts.length - 1]!;
    const prefixTokens = value.slice(0, value.length - token.length);
    const slash = token.lastIndexOf("/");
    const dirPart = slash >= 0 ? token.slice(0, slash + 1) : "";
    const base = slash >= 0 ? token.slice(slash + 1) : token;
    const dirPath = fs.resolve(cwdRef.current, dirPart || ".");
    const entries = fs.list(dirPath) ?? [];
    const cands = entries
      .filter((e) => e.name.startsWith(base) && (base.startsWith(".") || !isHidden(e.name)))
      .map((e) => `${e.name}${e.node.type === "dir" ? "/" : ""}`)
      .sort();

    if (cands.length === 1) {
      const m = cands[0]!;
      putInput(`${prefixTokens}${dirPart}${m.endsWith("/") ? m : `${m} `}`);
    } else if (cands.length > 1) {
      setLines((prev) => [...prev, plain(cands.join("  "), "dim")]);
      const prefix = commonPrefix(cands);
      if (prefix.length > base.length) putInput(`${prefixTokens}${dirPart}${prefix}`);
    }
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input;
      putInput("");
      execute(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navHistory(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navHistory(1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      tabComplete();
    } else if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
      e.preventDefault();
      cancelLine();
    } else if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      setLines([]);
      setBootHidden(true);
    }
  };

  // Caret-moving keys apply on keyup; clicks position the caret too — resync after both.
  const onInputKeyUp = () => syncCaret();
  const onInputClick = () => syncCaret();

  const onContainerMouseUp = () => {
    // Don't steal focus mid-selection (keeps scrollback copyable).
    if (typeof window !== "undefined" && window.getSelection()?.toString()) return;
    focusInput();
  };

  const exitApp = useCallback(() => {
    setActiveApp(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [inputRef]);

  return {
    // state
    visibleBoot: bootHidden ? [] : bootLines.slice(0, bootCount),
    lines,
    input,
    caret,
    promptSeg: promptSegments(cwd),
    bootDone,
    activeApp,
    announcement,
    // handlers
    onInputChange,
    onInputKeyDown,
    onInputKeyUp,
    onInputClick,
    focusInput,
    onContainerMouseUp,
    runCommand,
    exitApp,
  };
}
