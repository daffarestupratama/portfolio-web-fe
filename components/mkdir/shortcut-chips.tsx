"use client";

const CHIPS = ["help", "neofetch", "ls", "exit"] as const;

/** Tappable command shortcuts — useful on mobile, unobtrusive on desktop. */
export function ShortcutChips({ onRun }: { onRun: (cmd: string) => void }) {
  return (
    <div className="term-chips" role="group" aria-label="Command shortcuts">
      {CHIPS.map((cmd) => (
        <button key={cmd} type="button" className="term-chip mono" onClick={() => onRun(cmd)}>
          {cmd}
        </button>
      ))}
    </div>
  );
}
