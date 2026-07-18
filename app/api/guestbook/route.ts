import { NextResponse } from "next/server";
import { isGuestbookCategory } from "@/content/guestbook";

export const runtime = "nodejs";

const STRAPI_URL = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "https://cms.daffa.me").replace(/\/+$/, "");

const MESSAGE_MIN = 3;
const MESSAGE_MAX = 1000;
const NAME_MAX = 80;

// Simple per-IP sliding-window rate limit. In-memory = per server instance only,
// which is acceptable here (a light anti-spam layer, not a security boundary).
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const rateBuckets = new Map<string, number[]>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);
  return false;
}

function bad(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request.", 400);
  }

  // Honeypot: a filled `website` field means a bot. Soft-succeed without creating.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (isRateLimited(clientIp(req))) {
    return bad("You're sending messages too quickly. Please wait a few minutes and try again.", 429);
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    return bad(`Message must be between ${MESSAGE_MIN} and ${MESSAGE_MAX} characters.`, 400);
  }

  const isAnonymous = body.isAnonymous === true;
  const rawName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (rawName.length > NAME_MAX) {
    return bad(`Name must be ${NAME_MAX} characters or fewer.`, 400);
  }
  const displayName = isAnonymous || rawName === "" ? null : rawName;

  const category = typeof body.category === "string" ? body.category : "";
  if (!isGuestbookCategory(category)) {
    return bad("Please choose a valid category.", 400);
  }

  const token = process.env.STRAPI_API_TOKEN;
  if (!token) {
    console.error("Guestbook: STRAPI_API_TOKEN is not set.");
    return bad("The guestbook is temporarily unavailable. Please try again later.", 500);
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/guestbook-messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          message,
          displayName,
          isAnonymous,
          category,
          // New submissions are held for moderation: hidden + not visible (and an
          // unpublished draft under Strapi draftAndPublish) until the owner approves.
          moderationStatus: "hidden",
          isVisible: false,
          submittedAt: new Date().toISOString(),
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Guestbook create failed: ${res.status} ${res.statusText}`);
      return bad("Could not submit your message. Please try again later.", 502);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Guestbook create error:", err);
    return bad("Could not submit your message. Please try again later.", 500);
  }
}
