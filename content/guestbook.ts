/** Guestbook read accessor + shared category constants. The write path lives in
 *  app/api/guestbook/route.ts (server-only token). */

import { strapiFind } from "@/lib/strapi";
import { GUESTBOOK_MESSAGES_QUERY } from "@/lib/queries";
import { titleCase } from "@/lib/mappers";
import type { StrapiGuestbookMessage } from "@/lib/types";

/** The `category` enum values (must match Strapi exactly, in select order). */
export const GUESTBOOK_CATEGORIES = [
  "feedback",
  "question",
  "career",
  "personal",
  "tour",
  "website",
  "critics",
  "other",
] as const;

export type GuestbookCategory = (typeof GUESTBOOK_CATEGORIES)[number];

export function isGuestbookCategory(value: unknown): value is GuestbookCategory {
  return typeof value === "string" && (GUESTBOOK_CATEGORIES as readonly string[]).includes(value);
}

export function categoryLabel(category: string): string {
  return titleCase(category);
}

export interface GuestbookMessage {
  id: string;
  name: string;
  message: string;
  category: string;
  categoryLabel: string;
  date: string;
  isPinned: boolean;
  reply: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function mapGuestbookMessage(m: StrapiGuestbookMessage): GuestbookMessage {
  const name = m.isAnonymous || !m.displayName ? "Anonymous" : m.displayName;
  return {
    id: m.documentId,
    name,
    message: m.message,
    category: m.category ?? "other",
    categoryLabel: categoryLabel(m.category ?? "other"),
    date: formatDate(m.submittedAt ?? m.createdAt),
    isPinned: Boolean(m.isPinned),
    reply: m.reply || null,
  };
}

export async function getVisibleGuestbookMessages(): Promise<GuestbookMessage[]> {
  const messages = await strapiFind<StrapiGuestbookMessage>("guestbook-messages", GUESTBOOK_MESSAGES_QUERY);
  return messages.map(mapGuestbookMessage);
}
