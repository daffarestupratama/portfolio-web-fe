"use client";

import { useState } from "react";
import type { ServiceFaq } from "@/content/services";
import { PlainText } from "@/components/ui/plain-text";

export function FaqAccordion({ faqs }: { faqs: ServiceFaq[] }) {
  // 2a opens the first question on arrival.
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  // 2a's FAQ card: raised, radius 22, a chevron circle that presses in when open. The whole
  // header row is the real <button>; the answer is a labelled region.
  return (
    <div className="sv-faq-list">
      {faqs.map((faq, i) => {
        const isOpen = open.has(i);
        return (
          <div key={i} className="sv-faq-item" data-open={isOpen || undefined}>
            <h3>
              <button
                type="button"
                id={`faq-trigger-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => toggle(i)}
                className="sv-faq-q"
              >
                <span className="sv-faq-text">{faq.question}</span>
                <span aria-hidden="true" className="nm-chev sv-faq-chev" data-open={isOpen || undefined}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              className="sv-faq-panel"
            >
              <div>
                <PlainText text={faq.answer} className="sv-faq-a" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
