"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

// UI options for the category select. Values match Strapi's `category` enum; the
// route handler re-validates against the authoritative list in content/guestbook.
const CATEGORY_OPTIONS = [
  { value: "feedback", label: "Feedback" },
  { value: "question", label: "Question" },
  { value: "career", label: "Career" },
  { value: "personal", label: "Personal" },
  { value: "website", label: "Website" },
  { value: "critics", label: "Critics" },
  { value: "other", label: "Other" },
];

const MESSAGE_MIN = 3;
const MESSAGE_MAX = 1000;

type Status = "idle" | "submitting" | "success" | "error";

export function GuestbookForm() {
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState("feedback");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const ids = useId();
  const router = useRouter();
  const trimmed = message.trim();
  const messageInvalid = trimmed.length < MESSAGE_MIN || trimmed.length > MESSAGE_MAX;

  function resetFields() {
    setMessage("");
    setDisplayName("");
    setIsAnonymous(false);
    setCategory("feedback");
    setShowValidation(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (messageInvalid) {
      setShowValidation(true);
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, displayName, isAnonymous, category, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("success");
        resetFields();
        // Re-render the server tree for this route so the new message appears in the list
        // immediately. The route handler has already expired the ISR entry, so this gets a
        // fresh render rather than the cached one; client state (this success card)
        // survives, so there is no reload and no flash.
        router.refresh();
      } else {
        setStatus("error");
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Could not reach the server. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="gb-card gb-sent">
        <h2 className="gb-sent-title">Thanks for signing! 🎉</h2>
        <p className="gb-sent-text">Your message is live — it should appear in the list right away.</p>
        <button type="button" onClick={() => setStatus("idle")} className="nm-pill gb-again">
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="gb-card gb-form" noValidate>
      <div>
        <label htmlFor={`${ids}-msg`} className="gb-label">
          Message <span className="gb-req">*</span>
        </label>
        <textarea
          id={`${ids}-msg`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          maxLength={MESSAGE_MAX}
          aria-invalid={showValidation && messageInvalid}
          placeholder="Leave a note, a question, or a bit of feedback…"
          className="gb-field gb-textarea"
        />
        <div className="gb-help">
          <span data-show={(showValidation && messageInvalid) || undefined} className="gb-err-line">
            Message must be {MESSAGE_MIN}–{MESSAGE_MAX} characters.
          </span>
          <span className="mono gb-count">
            {trimmed.length}/{MESSAGE_MAX}
          </span>
        </div>
      </div>

      <div className="gb-pair">
        <div>
          <label htmlFor={`${ids}-name`} className="gb-label">
            Name <span className="gb-opt">(optional)</span>
          </label>
          <input
            id={`${ids}-name`}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isAnonymous}
            maxLength={80}
            autoComplete="name"
            placeholder={isAnonymous ? "Anonymous" : "Your name"}
            className="gb-field"
          />
        </div>

        <div>
          <label htmlFor={`${ids}-cat`} className="gb-label">
            Category
          </label>
          <select
            id={`${ids}-cat`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="gb-field gb-select"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* The real checkbox stays in the label (keyboard, form semantics); 2a's 22px box is
          drawn beside it. */}
      <label className="gb-check">
        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
        <span className="gb-box" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        Post as anonymous
      </label>

      {/* Honeypot — hidden from users, catches bots that fill every field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${ids}-website`}>Website</label>
        <input
          id={`${ids}-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {error && (
        <p className="gb-error" role="alert">
          {error}
        </p>
      )}

      <div className="gb-submit-row">
        <button type="submit" disabled={status === "submitting"} className="nm-btn-accent gb-submit">
          {status === "submitting" ? (
            "Sending…"
          ) : (
            <>
              Sign the guestbook <span aria-hidden="true">→</span>
            </>
          )}
        </button>
        {/* Submissions auto-publish, so the old "Reviewed before it appears" contradicted
            both the success card and the page header. */}
        <span className="gb-hint">Appears in the list right away.</span>
      </div>
    </form>
  );
}
