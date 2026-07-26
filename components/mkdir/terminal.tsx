"use client";

import { useMemo, useRef } from "react";
import { useTerminal, type ContentCounts } from "./use-terminal";
import { buildCmsCommands } from "./cms-commands";
import { ShortcutChips } from "./shortcut-chips";
import type { CmsCommandData, TermLine, TermSegment } from "./terminal-types";

function Segments({ segments }: { segments: TermSegment[] }) {
  return (
    <>
      {segments.map((s, i) => (
        <span key={i} className={s.tone ? `t-${s.tone}` : undefined}>
          {s.text}
        </span>
      ))}
    </>
  );
}

function Line({ line }: { line: TermLine }) {
  return (
    <div className={`term-line${line.pre ? " term-pre" : ""}`}>
      <Segments segments={line.segments} />
    </div>
  );
}

export function Terminal({ counts, cmsCommands }: { counts: ContentCounts; cmsCommands: CmsCommandData[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cmsCmds = useMemo(() => buildCmsCommands(cmsCommands), [cmsCommands]);
  const t = useTerminal({ counts, inputRef, scrollRef, cmsCommands: cmsCmds });

  return (
    <div className="mkdir-term">
      <div className="term-titlebar">
        <span className="term-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="term-title mono">visitor@dir: ~</span>
      </div>

      <div className="term-body" ref={scrollRef} onMouseUp={t.onContainerMouseUp}>
        {/* Boot flavour — aria-hidden so the type-on never reaches the a11y tree. */}
        <div aria-hidden="true">
          {t.visibleBoot.map((line) => (
            <Line key={line.id} line={line} />
          ))}
        </div>

        {/* Command output — the live region, whole lines only. */}
        <div role="log" aria-live="polite" aria-atomic="false" aria-label="Terminal output">
          {t.lines.map((line) => (
            <Line key={line.id} line={line} />
          ))}
        </div>

        {t.bootDone && !t.activeApp && (
          <div className="term-inputline" onClick={t.focusInput}>
            <span className="term-prompt">
              <Segments segments={t.promptSeg} />
            </span>
            <label htmlFor="mkdir-input" className="sr-only">
              Terminal input
            </label>
            <span className="term-field">
              <input
                id="mkdir-input"
                ref={inputRef}
                className="term-realinput mono"
                value={t.input}
                onChange={t.onInputChange}
                onKeyDown={t.onInputKeyDown}
                onKeyUp={t.onInputKeyUp}
                onClick={t.onInputClick}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Terminal input"
              />
              {/* Visible overlay: the block cursor sits ON the character at the caret. */}
              <span className="term-mirror" aria-hidden="true">
                {t.input.slice(0, t.caret)}
                <span className="term-cursor">{t.input.slice(t.caret, t.caret + 1) || " "}</span>
                {t.input.slice(t.caret + 1)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* App-runner overlay (matrix now; phase-3 game later). */}
      {t.activeApp && (
        <div
          className="term-app"
          role="dialog"
          aria-label={`${t.activeApp.title} — press Escape to exit`}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") t.exitApp();
          }}
          ref={(el) => el?.focus()}
        >
          {t.activeApp.render(t.exitApp)}
          <button type="button" className="term-exit mono" onClick={t.exitApp}>
            exit ▸ esc / any key
          </button>
        </div>
      )}

      {/* Live-region announcer for boot-complete + command output (screen readers). */}
      <p className="sr-only" role="status" aria-live="polite">
        {t.announcement}
      </p>

      <ShortcutChips onRun={t.runCommand} />
    </div>
  );
}
