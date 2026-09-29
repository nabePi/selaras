"use client";

import { useId, useState } from "react";
import { Icon } from "./icon";

export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.question}
            className="w-full overflow-hidden rounded-2xl bg-canvas-cream shadow-sm"
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${baseId}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              >
                <span className="t-title-sm pr-2 text-on-surface">
                  {item.question}
                </span>
                <Icon
                  name="expand_more"
                  size={20}
                  className={`text-text-muted transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={`${baseId}-${i}`}
              role="region"
              hidden={!isOpen}
              className="t-body-sm px-4 pb-4 leading-relaxed text-text-muted"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
