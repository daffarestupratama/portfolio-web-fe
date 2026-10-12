import type { Metadata } from "next";
import { getVisibleGuestbookMessages } from "@/content/guestbook";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { GuestbookForm } from "@/components/guestbook/guestbook-form";
import { MessageCard } from "@/components/guestbook/message-card";
import { BackToForm } from "@/components/guestbook/back-to-form";
import { PageHeader } from "@/components/ui/page-header";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return buildPageMetadata({
    path: "/guestbook",
    title: "Guestbook",
    description: "Leave a note, a question, or a bit of feedback for Daffa Ilham Restupratama.",
    defaultSeo: site.defaultSeo,
  });
}

export default async function GuestbookPage() {
  const messages = await getVisibleGuestbookMessages();

  return (
    <main className="relative z-[3]">
      <PageHeader
        title="Guestbook"
        subtitle="Say hi, leave feedback, or ask a question. New notes appear here right away."
      />

      {/* 2a: form and messages side by side from 960px, the form sticky; stacked below. */}
      <section className="gb">
        <div className="gb-grid">
          {/* align-self:start keeps the grid item from stretching to the row height, which would
              leave the sticky box nothing to stick within. */}
          <div id="guestbook-form" className="gb-form-col">
            <GuestbookForm />
          </div>

          <section aria-labelledby="gb-messages">
            <h2 id="gb-messages" className="gb-h2">
              {messages.length > 0 ? `Messages (${messages.length})` : "Messages"}
            </h2>

            {messages.length === 0 ? (
              <p className="gb-none">No messages yet — be the first to sign.</p>
            ) : (
              <div className="gb-list">
                {messages.map((m) => (
                  <MessageCard key={m.id} message={m} />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <BackToForm targetId="guestbook-form" />
    </main>
  );
}
