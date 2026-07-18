import type { GuestbookMessage } from "@/content/guestbook";

interface MessageCardProps {
  message: GuestbookMessage;
}

export function MessageCard({ message }: MessageCardProps) {
  return (
    <article className="glass-card p-5 sm:p-6" style={{ borderRadius: 18 }}>
      <div className="relative z-[2]">
        {message.isPinned && (
          <div className="mono mb-2 inline-flex items-center gap-1.5 text-[10.5px] tracking-[0.1em] uppercase" style={{ color: "var(--accent-ink)" }}>
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            Pinned
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[15px] font-semibold" style={{ letterSpacing: "-0.01em" }}>
            {message.name}
          </span>
          <span
            className="badge"
            style={{ color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }}
          >
            {message.categoryLabel}
          </span>
          <span className="mono ml-auto text-[11.5px]" style={{ color: "var(--ink-faint)" }}>
            {message.date}
          </span>
        </div>

        <p className="mt-3 text-[14.5px] whitespace-pre-line" style={{ lineHeight: 1.62, color: "var(--ink)" }}>
          {message.message}
        </p>

        {message.reply && (
          <div
            className="mt-4 rounded-r-lg py-2.5 pr-3 pl-4"
            style={{ borderLeft: "3px solid var(--accent)", background: "var(--glass-bg-2)" }}
          >
            <div className="mono mb-1 text-[10.5px] tracking-[0.08em] uppercase" style={{ color: "var(--accent-ink)" }}>
              Reply from Daffa
            </div>
            <p className="text-[13.5px] whitespace-pre-line" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
              {message.reply}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
