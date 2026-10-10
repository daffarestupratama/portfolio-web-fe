import type { GuestbookMessage } from "@/content/guestbook";

interface MessageCardProps {
  message: GuestbookMessage;
}

/** Portfolio 2a's guestbook message: pinned label, name, category pill, date, the message, and
 *  the owner's reply in an inset box. */
export function MessageCard({ message }: MessageCardProps) {
  return (
    <article className="gb-msg">
      {message.isPinned && (
        <div className="gb-pin mono">
          <span aria-hidden="true" />
          Pinned
        </div>
      )}

      <div className="gb-msg-head">
        <span className="gb-name">{message.name}</span>
        <span className="gb-cat">{message.categoryLabel}</span>
        <span className="gb-date mono">{message.date}</span>
      </div>

      <p className="gb-text">{message.message}</p>

      {message.reply && (
        <div className="gb-reply">
          <div className="gb-reply-label mono">Reply from Daffa</div>
          <p className="gb-reply-text">{message.reply}</p>
        </div>
      )}
    </article>
  );
}
