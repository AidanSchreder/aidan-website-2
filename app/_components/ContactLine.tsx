"use client";

import { emailFor, mailto, page, type SectionId } from "@/content/site";
import { trackContact } from "@/app/_lib/track";

/** One sentence and an email link. The subject line tells you which door it came through. */
export function ContactLine({ section, className }: { section: SectionId; className?: string }) {
  return (
    <p className={className ? `contact-line ${className}` : "contact-line"}>
      {page(section).contact}{" "}
      <a href={mailto(section)} onClick={() => trackContact(section)}>
        {emailFor(section)}
      </a>
    </p>
  );
}
