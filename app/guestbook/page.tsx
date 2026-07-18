import type { Metadata } from "next";
import { getVisibleGuestbookMessages } from "@/content/guestbook";
import { getSiteSettings } from "@/content/site";
import { buildMetadata } from "@/lib/seo";
import { GuestbookForm } from "@/components/guestbook/guestbook-form";
import { MessageCard } from "@/components/guestbook/message-card";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    ...buildMetadata(site.defaultSeo),
    title: "Guestbook",
    description: "Leave a note, a question, or a bit of feedback for Daffa Ilham Restupratama.",
    alternates: { canonical: "/guestbook" },
  };
}

export default async function GuestbookPage() {
  const messages = await getVisibleGuestbookMessages();

  return (
    <main className="relative z-[3] mx-auto w-full max-w-[760px] px-[22px] pt-28 pb-16 sm:pt-32">
      <header className="mb-8">
        <h1 className="font-bold" style={{ fontSize: "clamp(30px,4.5vw,46px)", letterSpacing: "-0.03em" }}>
          Guestbook
        </h1>
        <p className="mt-3 max-w-[52ch] text-[15px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
          Say hi, leave feedback, or ask a question. New notes are reviewed before they show up here.
        </p>
      </header>

      <GuestbookForm />

      <section className="mt-12">
        <h2 className="mb-5 text-[20px] font-bold" style={{ letterSpacing: "-0.02em" }}>
          {messages.length > 0 ? `Messages (${messages.length})` : "Messages"}
        </h2>

        {messages.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            No messages yet — be the first to sign.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <MessageCard key={m.id} message={m} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
