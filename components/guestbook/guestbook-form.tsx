"use client";

import { useId, useState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

// UI options for the category select. Values match Strapi's `category` enum; the
// route handler re-validates against the authoritative list in content/guestbook.
const CATEGORY_OPTIONS = [
  { value: "feedback", label: "Feedback" },
  { value: "question", label: "Question" },
  { value: "career", label: "Career" },
  { value: "personal", label: "Personal" },
  { value: "tour", label: "Tour" },
  { value: "website", label: "Website" },
  { value: "critics", label: "Critics" },
  { value: "other", label: "Other" },
];

const MESSAGE_MIN = 3;
const MESSAGE_MAX = 1000;

const fieldStyle = {
  background: "var(--glass-bg-2)",
  border: "1px solid var(--glass-brd)",
  borderRadius: 12,
  color: "var(--ink)",
} as const;

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
  const trimmed = message.trim();
  const messageInvalid = trimmed.length < MESSAGE_MIN || trimmed.length > MESSAGE_MAX;

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
      <div className="glass-card p-6 text-center sm:p-8" style={{ borderRadius: 22 }}>
        <div className="relative z-[2]">
          <h2 className="text-[18px] font-bold" style={{ letterSpacing: "-0.02em" }}>
            Thanks for signing! 🎉
          </h2>
          <p className="mx-auto mt-2 max-w-[42ch] text-[14px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
            Your message is pending review and will appear here once it&apos;s approved.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setMessage("");
              setDisplayName("");
              setIsAnonymous(false);
              setCategory("feedback");
              setShowValidation(false);
            }}
            className="glass-pill mt-5 px-5 py-2.5 text-[13.5px] font-semibold"
          >
            Write another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-card p-5 sm:p-6" style={{ borderRadius: 22 }} noValidate>
      <div className="relative z-[2] flex flex-col gap-4">
        <div>
          <label htmlFor={`${ids}-msg`} className="mb-1.5 block text-[13px] font-semibold">
            Message <span style={{ color: "var(--accent-ink)" }}>*</span>
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
            className="w-full resize-y px-3.5 py-2.5 text-[14px] outline-none"
            style={{ ...fieldStyle, lineHeight: 1.55 }}
          />
          <div className="mt-1 flex items-center justify-between text-[11.5px]">
            <span style={{ color: showValidation && messageInvalid ? "#d9534f" : "transparent" }}>
              Message must be {MESSAGE_MIN}–{MESSAGE_MAX} characters.
            </span>
            <span className="mono" style={{ color: "var(--ink-faint)" }}>
              {trimmed.length}/{MESSAGE_MAX}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${ids}-name`} className="mb-1.5 block text-[13px] font-semibold">
              Name <span style={{ color: "var(--ink-faint)" }}>(optional)</span>
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
              className="w-full px-3.5 py-2.5 text-[14px] outline-none disabled:opacity-50"
              style={fieldStyle}
            />
          </div>

          <div>
            <label htmlFor={`${ids}-cat`} className="mb-1.5 block text-[13px] font-semibold">
              Category
            </label>
            <select
              id={`${ids}-cat`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] outline-none"
              style={fieldStyle}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2.5 text-[13.5px]" style={{ color: "var(--ink-dim)" }}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4"
            style={{ accentColor: "var(--accent)" }}
          />
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
          <p className="text-[13px]" role="alert" style={{ color: "#d9534f" }}>
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn-gradient gap-2 px-[21px] py-3 text-[14px] disabled:opacity-60"
          >
            {status === "submitting" ? "Sending…" : "Sign the guestbook"}
            {status !== "submitting" && <ArrowRightIcon />}
          </button>
          <span className="text-[12px]" style={{ color: "var(--ink-faint)" }}>
            Reviewed before it appears.
          </span>
        </div>
      </div>
    </form>
  );
}
