"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import type { ServiceFaq } from "@/content/services";

export function FaqAccordion({ faqs }: { faqs: ServiceFaq[] }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, i) => {
        const isOpen = open.has(i);
        return (
          <div key={i} className="glass-card" style={{ borderRadius: 16 }}>
            <h3 className="relative z-[2]">
              <button
                type="button"
                id={`faq-trigger-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                {faq.question}
                <ChevronDownIcon
                  className="shrink-0 transition-transform duration-200 motion-reduce:transition-none"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none", color: "var(--accent-ink)" }}
                />
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              className="relative z-[2] grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-[14px]" style={{ lineHeight: 1.7, color: "var(--ink-dim)" }}>
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
